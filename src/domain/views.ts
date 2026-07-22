import { ProductGraph } from "./graph.js";
import type { Diagnostic } from "./model.js";

const TYPE_ORDER = ["Project", "Vision", "Business Goal", "Product Definition", "Capability", "Decision"];

export function generateProjectSummary(graph: ProductGraph, diagnostics: Diagnostic[]): string {
  const concepts = [...graph.concepts.values()].sort((left, right) => {
    const leftRank = TYPE_ORDER.indexOf(left.type);
    const rightRank = TYPE_ORDER.indexOf(right.type);
    const normalizedLeft = leftRank === -1 ? TYPE_ORDER.length : leftRank;
    const normalizedRight = rightRank === -1 ? TYPE_ORDER.length : rightRank;
    return normalizedLeft - normalizedRight || left.title.localeCompare(right.title);
  });

  const lines = ["# Project Summary", "", "> Generated from canonical OKF product knowledge.", ""];
  for (const concept of concepts) {
    lines.push(`## ${concept.title}`, "", `**Type:** ${concept.type}  `, `**Source:** \`${concept.id}\``, "");
    if (concept.description) lines.push(concept.description, "");
  }

  lines.push("# Validation", "");
  if (diagnostics.length === 0) {
    lines.push("No current diagnostics.", "");
  } else {
    for (const diagnostic of diagnostics) {
      lines.push(`- **${diagnostic.severity}:** ${diagnostic.message}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
