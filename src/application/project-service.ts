import { randomUUID } from "node:crypto";
import type { AiProvider } from "./ai.js";
import { ProductGraph } from "../domain/graph.js";
import { assessRevisionImpact } from "../domain/impact.js";
import { conceptsForLayer } from "../domain/definition-flow.js";
import type { ChangeKind, ChangeProposal, ConceptRevision, ProjectSnapshot } from "../domain/model.js";
import { validateGraph } from "../domain/validation.js";
import { generateProjectSummary } from "../domain/views.js";
import { OkfRepository } from "../infrastructure/okf-repository.js";

export class ProjectService {
  private graph!: ProductGraph;
  private current!: ProjectSnapshot;
  private readonly proposals = new Map<string, ChangeProposal>();

  private constructor(
    private readonly root: string,
    private readonly repository: OkfRepository,
  ) {}

  static async open(root: string, repository = new OkfRepository()): Promise<ProjectService> {
    const service = new ProjectService(root, repository);
    await service.reload();
    return service;
  }

  snapshot(): ProjectSnapshot {
    return structuredClone(this.current);
  }

  proposal(id: string): ChangeProposal | undefined {
    const proposal = this.proposals.get(id);
    return proposal ? structuredClone(proposal) : undefined;
  }

  proposeRevision(input: {
    conceptId: string;
    changes: ConceptRevision;
    changeKind: ChangeKind;
    summary: string;
    provenance?: "user" | "ai";
  }): ChangeProposal {
    const concept = this.graph.concept(input.conceptId);
    if (!concept) throw new Error(`Unknown concept: ${input.conceptId}`);
    const proposal: ChangeProposal = {
      id: randomUUID(),
      baseRevision: this.current.revision,
      summary: input.summary,
      provenance: input.provenance ?? "user",
      operations: [{
        type: "revise-concept",
        conceptId: input.conceptId,
        changes: input.changes,
        changeKind: input.changeKind,
      }],
      impact: assessRevisionImpact(this.graph, input.conceptId, input.changeKind),
      status: "proposed",
    };
    this.proposals.set(proposal.id, proposal);
    return structuredClone(proposal);
  }

  async askAgent(input: { conceptId: string; instruction: string; stage?: string; provider: AiProvider }): Promise<ChangeProposal> {
    const focus = this.graph.concept(input.conceptId);
    if (!focus) throw new Error(`Unknown concept: ${input.conceptId}`);
    const neighborhood = this.graph.neighborhood(input.conceptId).concepts;
    const stageContext = input.stage
      ? [...this.graph.concepts.values()].find(
          (concept) => concept.type === "Lifecycle Stage" && concept.metadata.stage === input.stage,
        )
      : undefined;
    const context = stageContext && !neighborhood.some((concept) => concept.id === stageContext.id)
      ? [stageContext, ...neighborhood]
      : neighborhood;
    const suggestion = await input.provider.suggest({
      instruction: input.instruction,
      focus,
      context,
      ...(input.stage ? { stage: input.stage } : {}),
    });
    return this.proposeRevision({
      conceptId: input.conceptId,
      changes: suggestion.changes,
      changeKind: "contract",
      summary: suggestion.summary,
      provenance: "ai",
    });
  }

  async accept(proposalId: string): Promise<ProjectSnapshot> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error(`Unknown proposal: ${proposalId}`);
    if (proposal.status !== "proposed") throw new Error(`Proposal is already ${proposal.status}`);
    if (proposal.baseRevision !== this.current.revision) throw new Error("Proposal is stale; reassess it against the current project");

    for (const operation of proposal.operations) {
      const concept = this.graph.concept(operation.conceptId);
      if (!concept) throw new Error(`Unknown concept: ${operation.conceptId}`);
      await this.repository.revise(this.root, concept, operation.changes);
    }
    proposal.status = "accepted";
    await this.reload();
    return this.snapshot();
  }

  generateSummary(stage?: string): string {
    if (!stage) return generateProjectSummary(this.graph, this.current.diagnostics);
    const stagedGraph = new ProductGraph(conceptsForLayer([...this.graph.concepts.values()], stage));
    const stagedIds = new Set(stagedGraph.concepts.keys());
    const diagnostics = this.current.diagnostics.filter(
      (diagnostic) => diagnostic.conceptIds.length === 0 || diagnostic.conceptIds.some((id) => stagedIds.has(id)),
    );
    return generateProjectSummary(stagedGraph, diagnostics);
  }

  private async reload(): Promise<void> {
    const loaded = await this.repository.load(this.root);
    this.graph = new ProductGraph(loaded.concepts);
    const diagnostics = [...loaded.diagnostics, ...validateGraph(this.graph)];
    const projectName = loaded.concepts.find((concept) => concept.type === "Project")?.title ?? loaded.name;
    this.current = this.graph.snapshot(loaded.root, projectName, loaded.revision, diagnostics);
  }
}
