import type { Diagnostic } from "./model.js";
import { ProductGraph } from "./graph.js";

export function validateGraph(graph: ProductGraph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const edge of graph.edges) {
    if (!graph.concepts.has(edge.targetId)) {
      diagnostics.push({
        code: "broken-relationship",
        severity: "error",
        message: `${edge.source} has a ${edge.type} relationship to missing concept ${edge.targetId}.`,
        conceptIds: [edge.source],
        evidence: `${edge.source} --${edge.type}--> ${edge.targetId}`,
      });
    }
  }

  for (const concept of graph.concepts.values()) {
    if (!["Product Capability", "Capability"].includes(concept.type)) continue;
    const hasTraceability = concept.relationships.some((relationship) =>
      ["serves", "realizes", "addresses"].includes(relationship.type),
    );
    if (!hasTraceability) {
      diagnostics.push({
        code: "capability-traceability-gap",
        severity: "warning",
        message: `${concept.title} does not trace to a persona, need, or business outcome.`,
        conceptIds: [concept.id],
      });
    }
  }

  return diagnostics;
}
