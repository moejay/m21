import type { Concept, Diagnostic } from "./model.js";

export const SOLUTION_SECTION_TYPES = {
  proposition: ["Solution Proposition"],
  options: ["Solution Option"],
  outcomes: ["Solution Outcome", "Solution Measure"],
  capabilities: ["Solution Capability"],
  behaviors: ["Solution Behavior", "Solution Policy"],
  delivery: ["Human Service", "Business Process", "Policy Intervention", "Digital Product", "Physical Product", "Partner Service"],
  boundaries: ["Solution Boundary", "Solution Constraint"],
  assumptions: ["Solution Assumption"],
  risks: ["Solution Risk"],
  decisions: ["Solution Decision"],
} as const;

export type SolutionSection = keyof typeof SOLUTION_SECTION_TYPES;
export const SOLUTION_SECTIONS = Object.keys(SOLUTION_SECTION_TYPES) as SolutionSection[];

export function solutionArtifacts(concepts: Concept[]): Concept[] {
  return concepts.filter((concept) => !["Definition Area", "Definition Layer"].includes(concept.type) && concept.area === "solution");
}

export function solutionSection(concept: Concept): SolutionSection | undefined {
  const section = objectValue(concept.metadata.solution)?.section;
  return typeof section === "string" && SOLUTION_SECTIONS.includes(section as SolutionSection) ? section as SolutionSection : undefined;
}

export function validateSolutionConcept(concept: Concept): Diagnostic[] {
  const namespace = objectValue(concept.metadata.solution);
  if (concept.area !== "solution") {
    return namespace ? [diagnostic(concept, "solution-area-mismatch", "Solution metadata requires singular area: solution ownership")] : [];
  }
  const diagnostics: Diagnostic[] = [];
  for (const [field, value] of [["title", concept.title], ["description", concept.description], ["body", concept.body]] as const) {
    if (!value.trim()) diagnostics.push(diagnostic(concept, `missing-solution-${field}`, `Solution ${field} must not be empty`));
  }
  if (!namespace) {
    diagnostics.push(diagnostic(concept, "missing-solution-metadata", "Solution concepts require a solution mapping with exactly one section"));
    return diagnostics;
  }
  const unknownFields = Object.keys(namespace).filter((field) => field !== "section");
  if (unknownFields.length) diagnostics.push(diagnostic(concept, "unknown-solution-field", `Unsupported Solution metadata: ${unknownFields.sort().join(", ")}`));
  const section = solutionSection(concept);
  if (!section) {
    diagnostics.push(diagnostic(concept, "invalid-solution-section", `Solution section must be one of: ${SOLUTION_SECTIONS.join(", ")}`));
    return diagnostics;
  }
  const allowed = SOLUTION_SECTION_TYPES[section] as readonly string[];
  if (!allowed.includes(concept.type)) diagnostics.push(diagnostic(concept, "solution-type-section-mismatch", `${concept.type} is not allowed in Solution section ${section}; expected ${allowed.join(", ")}`));
  return diagnostics;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function diagnostic(concept: Concept, code: string, message: string): Diagnostic {
  return { code, severity: "error", message: `${concept.id}: ${message}.`, conceptIds: [concept.id] };
}
