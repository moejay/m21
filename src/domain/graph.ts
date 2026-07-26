import type { Concept, GraphEdge, ProjectSnapshot } from "./model.js";
import { relationshipTargetId } from "./model.js";

export class ProductGraph {
  readonly concepts: Map<string, Concept>;
  readonly edges: GraphEdge[];

  constructor(concepts: Concept[]) {
    this.concepts = new Map(concepts.map((concept) => [concept.id, concept]));
    const edgeIdentities = new Set<string>();
    this.edges = concepts.flatMap((concept) => concept.relationships.flatMap((relationship) => {
      const targetId = relationshipTargetId(relationship.target);
      const identity = `${concept.id}\0${relationship.type}\0${targetId}`;
      if (edgeIdentities.has(identity)) return [];
      edgeIdentities.add(identity);
      return [{ ...relationship, source: concept.id, targetId }];
    }));
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
