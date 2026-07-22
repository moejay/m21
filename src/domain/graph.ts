import type { Concept, GraphEdge, ProjectSnapshot } from "./model.js";
import { relationshipTargetId } from "./model.js";

export class ProductGraph {
  readonly concepts: Map<string, Concept>;
  readonly edges: GraphEdge[];

  constructor(concepts: Concept[]) {
    this.concepts = new Map(concepts.map((concept) => [concept.id, concept]));
    this.edges = concepts.flatMap((concept) =>
      concept.relationships.map((relationship) => ({
        ...relationship,
        source: concept.id,
        targetId: relationshipTargetId(relationship.target),
      })),
    );
  }

  concept(id: string): Concept | undefined {
    return this.concepts.get(id);
  }

  outgoing(id: string): GraphEdge[] {
    return this.edges.filter((edge) => edge.source === id);
  }

  incoming(id: string): GraphEdge[] {
    return this.edges.filter((edge) => edge.targetId === id);
  }

  neighborhood(id: string): { concepts: Concept[]; edges: GraphEdge[] } {
    const edges = this.edges.filter((edge) => edge.source === id || edge.targetId === id);
    const ids = new Set([id, ...edges.flatMap((edge) => [edge.source, edge.targetId])]);
    return {
      concepts: [...ids].flatMap((conceptId) => {
        const concept = this.concept(conceptId);
        return concept ? [concept] : [];
      }),
      edges,
    };
  }

  snapshot(root: string, name: string, revision: string, diagnostics: ProjectSnapshot["diagnostics"]): ProjectSnapshot {
    return {
      root,
      name,
      revision,
      concepts: [...this.concepts.values()],
      edges: this.edges,
      diagnostics,
    };
  }
}
