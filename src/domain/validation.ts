import type { Diagnostic } from "./model.js";
import { relationshipTargetId } from "./model.js";
import { validateBusinessConcept } from "./business.js";
import { ProductGraph } from "./graph.js";
import { validateSolutionConcept } from "./solution.js";
import { validateVisualArtifacts, validateVisualDesignConcept } from "./visual-design.js";
import { validateSystemConcept } from "./system-design.js";
import { validateArchitectureConcept, validateArchitectureGraph } from "./architecture.js";

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
    const relationshipIdentities = new Set<string>();
    for (const relationship of concept.relationships) {
      const targetId = relationshipTargetId(relationship.target);
      const identity = `${relationship.type}\0${targetId}`;
      if (relationshipIdentities.has(identity)) {
        diagnostics.push({
          code: "duplicate-relationship",
          severity: "error",
          message: `${concept.id} repeats the ${relationship.type} relationship to ${targetId}.`,
          conceptIds: [concept.id, targetId],
        });
      }
      relationshipIdentities.add(identity);
    }
    diagnostics.push(...validateBusinessConcept(concept), ...validateSolutionConcept(concept), ...validateVisualDesignConcept(concept), ...validateSystemConcept(concept), ...validateArchitectureConcept(concept));
    if (!["Solution Capability", "Product Capability", "Capability"].includes(concept.type)) continue;
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

  diagnostics.push(...validateVisualArtifacts([...graph.concepts.values()]), ...validateArchitectureGraph([...graph.concepts.values()], graph.edges));
  return diagnostics;
}
