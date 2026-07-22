import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { After, Before, Given, Then, When, setWorldConstructor, World } from "@cucumber/cucumber";
import YAML from "yaml";
import { DevelopmentAiProvider, type AiProvider, type AiSuggestion } from "../../src/application/ai.js";
import { ProjectService } from "../../src/application/project-service.js";
import { snapshotForLayer } from "../../src/domain/definition-flow.js";
import { mainArtifactsForLayer, productCapabilityArtifacts, projectionForLayer, type ProjectionKind } from "../../src/domain/projections.js";
import { projectTheme, type ProjectTheme } from "../../src/domain/theme.js";
import type { ChangeProposal, Concept, ProjectSnapshot } from "../../src/domain/model.js";

class M21World extends World {
  root = "";
  service?: ProjectService;
  snapshot?: ProjectSnapshot;
  proposal?: ChangeProposal;
  initialRevision?: string;
  summaries: string[] = [];
  aiProvider?: AiProvider;
  lifecycleSnapshot?: ProjectSnapshot;
  receivedStage: string | undefined = undefined;
  theme: ProjectTheme | undefined = undefined;
  definitionLayer: string | undefined = undefined;
  projection: ProjectionKind | undefined = undefined;
  mainArtifacts: Concept[] = [];
  productArtifacts: Concept[] = [];
}

setWorldConstructor(M21World);

Before(async function (this: M21World) {
  this.root = await mkdtemp(path.join(os.tmpdir(), "m21-feature-"));
});

After(async function (this: M21World) {
  await rm(this.root, { recursive: true, force: true });
});

async function writeConcept(
  world: M21World,
  relativePath: string,
  metadata: Record<string, unknown>,
  body = "",
): Promise<void> {
  const destination = path.join(world.root, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `---\n${YAML.stringify(metadata).trimEnd()}\n---\n${body}`, "utf8");
}

async function open(world: M21World): Promise<ProjectService> {
  world.service ??= await ProjectService.open(world.root);
  world.snapshot = world.service.snapshot();
  world.initialRevision ??= world.snapshot.revision;
  return world.service;
}

async function activeVision(world: M21World): Promise<void> {
  await writeConcept(world, "vision.md", {
    type: "Vision",
    title: "Active Vision",
    description: "Original vision",
    status: "active",
  }, "# Mission\n\nBuild a coherent product.\n");
}

Given("a product capability is tagged for Product", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Knowledge Workspace",
    sdlc: ["product"],
    product: { section: "capabilities" },
    relationships: [{ type: "serves", target: "/persona.md" }],
  }, "# Outcome\n\nKeep product knowledge coherent.\n");
});

Given("a related business persona is tagged only for Business", async function (this: M21World) {
  await writeConcept(this, "persona.md", {
    type: "Persona",
    title: "Product Builder",
    sdlc: ["business"],
    business: { section: "personas" },
  });
});

Given("a Product-tagged decision concept", async function (this: M21World) {
  await writeConcept(this, "decision.md", {
    type: "Decision",
    title: "Product Decision",
    sdlc: ["product"],
    product: { section: "decisions" },
  });
});

Given("a business goal is tagged for Business", async function (this: M21World) {
  await writeConcept(this, "goal.md", {
    type: "Business Goal",
    title: "Business Outcome",
    sdlc: ["business"],
    business: { section: "outcomes" },
  }, "# Outcome\n\nCreate coherent product understanding.\n");
});

Given("a connected product capability is tagged only for Product", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Product Workspace",
    sdlc: ["product"],
    product: { section: "capabilities" },
    relationships: [{ type: "realizes", target: "/goal.md" }],
  });
});

Given("the Business definition-layer registry concept", async function (this: M21World) {
  await writeConcept(this, "business-layer.md", {
    type: "Definition Layer",
    title: "Business",
    stage: "business",
    order: 10,
    sdlc: ["business"],
  });
});

Given("the definition layer is {word}", function (this: M21World, layer: string) {
  this.definitionLayer = layer;
});

Given("an active visual language defines an accent theme token", async function (this: M21World) {
  await writeConcept(this, "visual-language.md", {
    type: "Visual Language",
    title: "Project Visual Language",
    status: "active",
    sdlc: ["design"],
    theme: { accent: "#4455aa" },
  });
});

Given("a draft visual language defines an accent theme token", async function (this: M21World) {
  await writeConcept(this, "visual-language.md", {
    type: "Visual Language",
    title: "Draft Visual Language",
    status: "draft",
    sdlc: ["design"],
    theme: { accent: "#4455aa" },
  });
});

Given("a decision contributes to Product and System", async function (this: M21World) {
  await writeConcept(this, "decision.md", {
    type: "Decision",
    title: "Shared Decision",
    sdlc: ["product", "system"],
  });
});

Given("a draft screen contributes to Design", async function (this: M21World) {
  await writeConcept(this, "screen.md", {
    type: "Screen",
    title: "Draft Workspace",
    status: "draft",
    sdlc: ["design"],
  });
});

Given("product definition remains incomplete", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Untraceable Product Capability",
    sdlc: ["product", "design"],
  });
});

Given("a business goal contributes only to Business", async function (this: M21World) {
  await writeConcept(this, "goal.md", {
    type: "Business Goal",
    title: "Business Only Goal",
    sdlc: ["business"],
  });
});

Given("an AI provider that records definition-layer context", function (this: M21World) {
  const world = this;
  this.aiProvider = {
    async suggest(input: { instruction: string; focus: Concept; context: Concept[]; stage?: string }): Promise<AiSuggestion> {
      world.receivedStage = input.stage;
      return { summary: "Clarify vision in definition context", changes: { description: "Clarified vision" } };
    },
  };
});

Given("an OKF project containing a vision and a capability that realizes it", async function (this: M21World) {
  await activeVision(this);
  await writeConcept(this, "capabilities/workspace.md", {
    type: "Product Capability",
    title: "Workspace",
    description: "A graph workspace",
    relationships: [{ type: "realizes", target: "/vision.md" }],
  });
});

Given("an OKF concept with an unknown producer extension", async function (this: M21World) {
  await writeConcept(this, "project.md", {
    type: "Project",
    title: "Extended Project",
    description: "Before",
    "x-producer": { source: "another-tool", keep: true },
  });
});

Given("an OKF project containing an active vision", async function (this: M21World) {
  await activeVision(this);
});

Given("a user journey realizes a product capability", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Product Capability",
    relationships: [{ type: "serves", target: "/persona.md" }],
  });
  await writeConcept(this, "persona.md", { type: "Persona", title: "Builder" });
  await writeConcept(this, "journey.md", {
    type: "User Journey",
    title: "Builder Journey",
    relationships: [{ type: "realizes", target: "/capability.md" }],
  });
});

Given("an architecture component realizes a product capability", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Product Capability",
    relationships: [{ type: "serves", target: "/persona.md" }],
  });
  await writeConcept(this, "persona.md", { type: "Persona", title: "Builder" });
  await writeConcept(this, "component.md", {
    type: "Component",
    title: "Persistence Component",
    relationships: [{ type: "realizes", target: "/capability.md" }],
  });
});

Given("an OKF concept relates to a missing target", async function (this: M21World) {
  await writeConcept(this, "concept.md", {
    type: "System",
    title: "Readable System",
    relationships: [{ type: "depends-on", target: "/missing.md" }],
  }, "Still readable.\n");
});

Given("an OKF capability with no business or persona relationship", async function (this: M21World) {
  await writeConcept(this, "capability.md", { type: "Product Capability", title: "Untethered Capability" });
});

Given("a configured development AI provider", function (this: M21World) {
  this.aiProvider = new DevelopmentAiProvider();
});

Given("an AI proposal to clarify an active vision", async function (this: M21World) {
  await activeVision(this);
  this.aiProvider = new DevelopmentAiProvider();
  const service = await open(this);
  this.proposal = await service.askAgent({
    conceptId: "vision",
    instruction: "Make the user outcome explicit.",
    provider: this.aiProvider,
  });
});

Given("an OKF project containing a project, vision, and MVP capability", async function (this: M21World) {
  await writeConcept(this, "project.md", { type: "Project", title: "M21" });
  await writeConcept(this, "vision.md", { type: "Vision", title: "Living Product Model" });
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Graph Workspace",
    relationships: [{ type: "realizes", target: "/vision.md" }],
  });
});

Given("an OKF project containing a project and vision", async function (this: M21World) {
  await writeConcept(this, "project.md", { type: "Project", title: "M21" });
  await writeConcept(this, "vision.md", { type: "Vision", title: "Living Product Model" });
});

Given("I have proposed a revision to the vision", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "vision",
    changes: { body: "# Mission\n\nBuild a revised coherent product.\n" },
    changeKind: "contract",
    summary: "Revise the vision",
  });
});

When("I select the Product capability artifacts", async function (this: M21World) {
  const service = await open(this);
  this.productArtifacts = productCapabilityArtifacts(service.snapshot().concepts);
});

When("I select the Business main artifacts", async function (this: M21World) {
  const service = await open(this);
  this.mainArtifacts = mainArtifactsForLayer(service.snapshot().concepts, "business");
});

When("I choose its workspace projection", function (this: M21World) {
  assert(this.definitionLayer);
  this.projection = projectionForLayer(this.definitionLayer);
});

When("I open the project", async function (this: M21World) {
  await open(this);
});

When("I open the Design definition view", async function (this: M21World) {
  await open(this);
  assert(this.snapshot);
  this.lifecycleSnapshot = snapshotForLayer(this.snapshot, "design");
});

When("I ask the agent in the Product layer to clarify the vision", async function (this: M21World) {
  const service = await open(this);
  assert(this.aiProvider);
  this.proposal = await service.askAgent({
    conceptId: "vision",
    instruction: "Clarify the intended outcome.",
    stage: "product",
    provider: this.aiProvider,
  });
});

When("I propose and accept a revision to its description", async function (this: M21World) {
  const service = await open(this);
  const proposal = service.proposeRevision({
    conceptId: "project",
    changes: { description: "After" },
    changeKind: "contract",
    summary: "Revise description",
  });
  await service.accept(proposal.id);
  this.snapshot = service.snapshot();
});

When("I propose a revision to the vision", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "vision",
    changes: { description: "Proposed vision" },
    changeKind: "contract",
    summary: "Revise the vision",
  });
});

When("I propose a contract change to the capability", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "capability",
    changes: { description: "Changed user-visible capability contract" },
    changeKind: "contract",
    summary: "Change capability contract",
  });
});

When("I propose an internal change to the architecture component", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "component",
    changes: { body: "Use a different internal persistence algorithm.\n" },
    changeKind: "internal",
    summary: "Replace internal implementation",
  });
});

When("I accept the proposal", async function (this: M21World) {
  assert(this.proposal);
  const service = await open(this);
  this.snapshot = await service.accept(this.proposal.id);
});

When("I ask the agent to clarify the vision", async function (this: M21World) {
  const service = await open(this);
  assert(this.aiProvider);
  this.proposal = await service.askAgent({
    conceptId: "vision",
    instruction: "Make the user outcome explicit.",
    provider: this.aiProvider,
  });
});

When("I accept the AI proposal", async function (this: M21World) {
  assert(this.proposal);
  const service = await open(this);
  this.snapshot = await service.accept(this.proposal.id);
});

When("I generate the project summary", async function (this: M21World) {
  const service = await open(this);
  this.summaries = [service.generateSummary()];
});

When("I generate the project summary for Design", async function (this: M21World) {
  const service = await open(this);
  this.summaries = [service.generateSummary("design")];
});

When("I generate the project summary twice without changing the graph", async function (this: M21World) {
  const service = await open(this);
  this.summaries = [service.generateSummary(), service.generateSummary()];
});

Then("the product capability is displayed", function (this: M21World) {
  assert(this.productArtifacts.some((concept) => concept.id === "capability"));
});

Then("the business persona is not displayed as a Product capability", function (this: M21World) {
  assert(!this.productArtifacts.some((concept) => concept.id === "persona"));
});

Then("the decision is not displayed as a Product capability", function (this: M21World) {
  assert(!this.productArtifacts.some((concept) => concept.id === "decision"));
});

Then("the business goal is a main artifact", function (this: M21World) {
  assert(this.mainArtifacts.some((concept) => concept.id === "goal"));
});

Then("the product capability is not a main artifact", function (this: M21World) {
  assert(!this.mainArtifacts.some((concept) => concept.id === "capability"));
});

Then("the definition-layer registry concept is not a main artifact", function (this: M21World) {
  assert(!this.mainArtifacts.some((concept) => concept.type === "Definition Layer"));
});

Then("the projection is {word}", function (this: M21World, projection: string) {
  assert.equal(this.projection, projection);
});

Then("the project theme uses the visual language as its source", function (this: M21World) {
  assert(this.snapshot);
  this.theme = projectTheme(this.snapshot.concepts);
  assert.equal(this.theme?.sourceConceptId, "visual-language");
});

Then("the project theme exposes the accent token", function (this: M21World) {
  assert.equal(this.theme?.tokens.accent, "#4455aa");
});

Then("no project theme is active", function (this: M21World) {
  assert(this.snapshot);
  assert.equal(projectTheme(this.snapshot.concepts), undefined);
});

Then("the same decision appears in the Product definition view", function (this: M21World) {
  assert(this.snapshot);
  assert(snapshotForLayer(this.snapshot, "product").concepts.some((concept) => concept.id === "decision"));
});

Then("the same decision appears in the System definition view", function (this: M21World) {
  assert(this.snapshot);
  assert(snapshotForLayer(this.snapshot, "system").concepts.some((concept) => concept.id === "decision"));
});

Then("the project contains only one copy of the decision", function (this: M21World) {
  assert.equal(this.snapshot?.concepts.filter((concept) => concept.id === "decision").length, 1);
});

Then("the draft screen is available for work", function (this: M21World) {
  assert(this.lifecycleSnapshot?.concepts.some((concept) => concept.id === "screen"));
});

Then("the product definition diagnostic remains visible when relevant", function (this: M21World) {
  assert(this.lifecycleSnapshot?.diagnostics.some((diagnostic) => diagnostic.code === "capability-traceability-gap"));
});

Then("the AI provider receives Product as the definition-layer context", function (this: M21World) {
  assert.equal(this.receivedStage, "product");
});

Then("the project graph contains both concepts", function (this: M21World) {
  assert(this.snapshot);
  assert.equal(this.snapshot.concepts.length, 2);
});

Then("the graph contains a realizes relationship from the capability to the vision", function (this: M21World) {
  assert(this.snapshot?.edges.some((edge) => edge.source === "capabilities/workspace" && edge.targetId === "vision" && edge.type === "realizes"));
});

Then("the revised description is persisted", function (this: M21World) {
  assert.equal(this.snapshot?.concepts.find((concept) => concept.id === "project")?.description, "After");
});

Then("the unknown producer extension is preserved", function (this: M21World) {
  assert.deepEqual(this.snapshot?.concepts.find((concept) => concept.id === "project")?.metadata["x-producer"], {
    source: "another-tool",
    keep: true,
  });
});

Then("the canonical vision remains unchanged", async function (this: M21World) {
  const content = await readFile(path.join(this.root, "vision.md"), "utf8");
  assert.match(content, /Original vision|Build a coherent product/);
  assert.doesNotMatch(content, /Proposed vision|Make the user outcome explicit/);
});

Then("the proposal describes the pending revision", function (this: M21World) {
  assert.equal(this.proposal?.operations[0]?.type, "revise-concept");
  assert.equal(this.proposal?.status, "proposed");
});

Then("the proposal flags the user journey for review", function (this: M21World) {
  assert(this.proposal?.impact.some((finding) => finding.conceptId === "journey"));
});

Then("the impact explains the realizes relationship path", function (this: M21World) {
  const finding = this.proposal?.impact.find((candidate) => candidate.conceptId === "journey");
  assert.equal(finding?.relationshipType, "realizes");
  assert.deepEqual(finding?.path, ["journey", "capability"]);
});

Then("the proposal does not flag the product capability for review", function (this: M21World) {
  assert.equal(this.proposal?.impact.some((finding) => finding.conceptId === "capability"), false);
});

Then("the canonical vision contains the revision", function (this: M21World) {
  assert.match(this.snapshot?.concepts.find((concept) => concept.id === "vision")?.body ?? "", /revised coherent product/);
});

Then("the project revision changes", function (this: M21World) {
  assert(this.initialRevision);
  assert.notEqual(this.snapshot?.revision, this.initialRevision);
});

Then("validation reports the broken relationship", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "broken-relationship"));
});

Then("the readable concept remains in the graph", function (this: M21World) {
  assert(this.snapshot?.concepts.some((concept) => concept.id === "concept" && concept.body.includes("Still readable")));
});

Then("validation reports the capability traceability gap", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "capability-traceability-gap"));
});

Then("the agent returns a reviewable change proposal", function (this: M21World) {
  assert.equal(this.proposal?.provenance, "ai");
  assert.equal(this.proposal?.status, "proposed");
});

Then("the canonical vision contains the proposed clarification", function (this: M21World) {
  assert.match(this.snapshot?.concepts.find((concept) => concept.id === "vision")?.body ?? "", /Make the user outcome explicit/);
});

Then("the summary includes the draft screen", function (this: M21World) {
  assert.match(this.summaries[0] ?? "", /Draft Workspace/);
});

Then("the summary excludes the Business-only business goal", function (this: M21World) {
  assert.doesNotMatch(this.summaries[0] ?? "", /Business Only Goal/);
});

Then("the summary includes the project, vision, and capability titles", function (this: M21World) {
  const summary = this.summaries[0] ?? "";
  assert.match(summary, /## M21/);
  assert.match(summary, /## Living Product Model/);
  assert.match(summary, /## Graph Workspace/);
});

Then("the summary references their canonical concept identifiers", function (this: M21World) {
  const summary = this.summaries[0] ?? "";
  assert.match(summary, /`project`/);
  assert.match(summary, /`vision`/);
  assert.match(summary, /`capability`/);
});

Then("both generated summaries are identical", function (this: M21World) {
  assert.equal(this.summaries.length, 2);
  assert.equal(this.summaries[0], this.summaries[1]);
});
