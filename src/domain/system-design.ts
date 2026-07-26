import type { Concept, Diagnostic } from "./model.js";

export const SYSTEM_SECTION_TYPES = {
  overview: ["System"],
  responsibilities: ["System Responsibility"],
  data: ["Data Domain", "Information Model", "Logical Data Store"],
  flows: ["System Flow"],
  dependencies: ["External Dependency"],
  qualities: ["Quality Requirement"],
  security: ["Trust Boundary", "Security Requirement"],
  failures: ["Failure Mode"],
  constraints: ["System Constraint"],
  risks: ["System Risk"],
  decisions: ["System Decision"],
} as const;
export type SystemSection = keyof typeof SYSTEM_SECTION_TYPES;
export const SYSTEM_SECTIONS = Object.keys(SYSTEM_SECTION_TYPES) as SystemSection[];
const BOUNDARY_TYPES = new Set(["System", "System Responsibility", "Data Domain", "Logical Data Store", "External Dependency"]);

export function systemDesignArtifacts(concepts: Concept[]): Concept[] {
  return concepts.filter((concept) => !["Definition Area", "Definition Layer"].includes(concept.type) && concept.area === "system");
}

export function systemSection(concept: Concept): SystemSection | undefined {
  const section = systemMetadata(concept)?.section;
  return typeof section === "string" && SYSTEM_SECTIONS.includes(section as SystemSection) ? section as SystemSection : undefined;
}

export function systemBoundary(concept: Concept): "owned" | "managed" | "external" | undefined {
  const boundary = systemMetadata(concept)?.boundary;
  return ["owned", "managed", "external"].includes(String(boundary)) ? boundary as "owned" | "managed" | "external" : undefined;
}

export function validateSystemConcept(concept: Concept): Diagnostic[] {
  const namespace = systemMetadata(concept);
  if (concept.area !== "system") return namespace && !concept.sdlc.includes("system") ? [diagnostic(concept, "system-area-mismatch", "system metadata requires singular area: system ownership for migrated concepts")] : [];
  const diagnostics: Diagnostic[] = [];
  for (const [field, value] of [["title", concept.title], ["description", concept.description], ["body", concept.body]] as const) if (!value.trim()) diagnostics.push(diagnostic(concept, `missing-system-${field}`, `System ${field} must not be empty`));
  if (!namespace) return [...diagnostics, diagnostic(concept, "missing-system-metadata", "System concepts require a system mapping")];
  const unknown = Object.keys(namespace).filter((field) => !["section", "boundary"].includes(field));
  if (unknown.length) diagnostics.push(diagnostic(concept, "unknown-system-field", `Unsupported System metadata: ${unknown.sort().join(", ")}`));
  const section = systemSection(concept);
  if (!section) return [...diagnostics, diagnostic(concept, "invalid-system-section", `System section must be one of: ${SYSTEM_SECTIONS.join(", ")}`)];
  const allowed = SYSTEM_SECTION_TYPES[section] as readonly string[];
  if (!allowed.includes(concept.type)) diagnostics.push(diagnostic(concept, "system-type-section-mismatch", `${concept.type} is not allowed in System section ${section}; expected ${allowed.join(", ")}`));
  const boundary = systemBoundary(concept);
  if (BOUNDARY_TYPES.has(concept.type) && !boundary) diagnostics.push(diagnostic(concept, "missing-system-boundary", `${concept.type} requires system.boundary owned, managed, or external`));
  if (!BOUNDARY_TYPES.has(concept.type) && namespace.boundary !== undefined) diagnostics.push(diagnostic(concept, "invalid-system-boundary", `${concept.type} does not admit system.boundary`));
  return diagnostics;
}

function systemMetadata(concept: Concept): Record<string, unknown> | undefined {
  const value = concept.metadata.system;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function diagnostic(concept: Concept, code: string, message: string): Diagnostic {
  return { code, severity: "error", message: `${concept.id}: ${message}.`, conceptIds: [concept.id] };
}
