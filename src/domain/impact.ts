import type { ChangeKind, ImpactFinding } from "./model.js";
import { ProductGraph } from "./graph.js";

const HARD_DEPENDENCY_RELATIONSHIPS = new Set([
  "realizes",
  "depends-on",
  "constrained-by",
  "supports",
  "serves",
  "addresses",
]);

export function assessRevisionImpact(
  graph: ProductGraph,
  changedConceptId: string,
  changeKind: ChangeKind,
): ImpactFinding[] {
  if (changeKind === "editorial" || changeKind === "internal") return [];

  const findings: ImpactFinding[] = [];
  for (const edge of graph.incoming(changedConceptId)) {
    if (!HARD_DEPENDENCY_RELATIONSHIPS.has(edge.type)) continue;
    findings.push({
      conceptId: edge.source,
      changedConceptId,
      relationshipType: edge.type,
      path: [edge.source, changedConceptId],
      reason: `${edge.source} ${edge.type} ${changedConceptId}; the ${changeKind} change may alter what that relationship promises.`,
      confidence: changeKind === "structural" ? "definite" : "likely",
      status: "unresolved",
    });
  }

  for (const edge of graph.outgoing(changedConceptId)) {
    if (edge.type !== "governs" || !graph.concepts.has(edge.targetId)) continue;
    findings.push({
      conceptId: edge.targetId,
      changedConceptId,
      relationshipType: edge.type,
      path: [changedConceptId, edge.targetId],
      reason: `${changedConceptId} governs ${edge.targetId}; the ${changeKind} change may alter the applicable rule.`,
      confidence: "definite",
      status: "unresolved",
    });
  }

  return findings;
}
