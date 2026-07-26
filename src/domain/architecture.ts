import type { Concept, Diagnostic, GraphEdge } from "./model.js";

export const ARCHITECTURE_SECTION_TYPES = {
  overview: ["Architecture"],
  applications: ["Application"],
  communications: ["Application Communication"],
  constraints: ["Architecture Constraint"],
  risks: ["Architecture Risk"],
  decisions: ["Architecture Decision"],
} as const;
export type ArchitectureSection = keyof typeof ARCHITECTURE_SECTION_TYPES;
export const ARCHITECTURE_SECTIONS = Object.keys(ARCHITECTURE_SECTION_TYPES) as ArchitectureSection[];
export const APPLICATION_KINDS = ["full-stack", "web-client", "mobile-application", "desktop-application", "backend-service", "worker", "cli", "serverless-application", "integration", "data-pipeline"] as const;
export const COMMUNICATION_MODES = ["request-response", "event", "message", "stream", "batch", "file", "shared-store"] as const;
const APPLICATION_SCOPED_AREAS = ["application", "components", "code-design", "implementation", "deployment"] as const;

export function architectureArtifacts(concepts: Concept[]): Concept[] {
  return concepts.filter((concept) => !["Definition Area", "Definition Layer"].includes(concept.type) && concept.area === "architecture");
}
export function architectureSection(concept: Concept): ArchitectureSection | undefined {
  const section = architectureMetadata(concept)?.section;
  return typeof section === "string" && ARCHITECTURE_SECTIONS.includes(section as ArchitectureSection) ? section as ArchitectureSection : undefined;
}
export function architectureApplications(concepts: Concept[]): Concept[] {
  return architectureArtifacts(concepts).filter((concept) => concept.type === "Application").sort((left, right) => left.title.localeCompare(right.title));
}
export function validateArchitectureConcept(concept: Concept): Diagnostic[] {
  const namespace = architectureMetadata(concept);
  const diagnostics: Diagnostic[] = [];
  if (concept.applicationId !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(concept.applicationId)) diagnostics.push(diagnostic(concept, "invalid-application-id", "application-id must be lowercase kebab-case"));
  if (concept.area !== "architecture") return namespace && !concept.sdlc.includes("architecture") ? [...diagnostics, diagnostic(concept, "architecture-area-mismatch", "architecture metadata requires singular area: architecture ownership for migrated concepts")] : diagnostics;
  for (const [field, value] of [["title", concept.title], ["description", concept.description], ["body", concept.body]] as const) if (!value.trim()) diagnostics.push(diagnostic(concept, `missing-architecture-${field}`, `Architecture ${field} must not be empty`));
  if (!namespace) return [...diagnostics, diagnostic(concept, "missing-architecture-metadata", "Architecture concepts require an architecture mapping")];
  const section = architectureSection(concept);
  if (!section) return [...diagnostics, diagnostic(concept, "invalid-architecture-section", `Architecture section must be one of: ${ARCHITECTURE_SECTIONS.join(", ")}`)];
  const allowed = ARCHITECTURE_SECTION_TYPES[section] as readonly string[];
  if (!allowed.includes(concept.type)) diagnostics.push(diagnostic(concept, "architecture-type-section-mismatch", `${concept.type} is not allowed in Architecture section ${section}; expected ${allowed.join(", ")}`));
  const allowedFields = new Set(["section", ...(concept.type === "Application" ? ["application-kind", "independently-deployable"] : []), ...(concept.type === "Application Communication" ? ["communication-mode"] : [])]);
  const unknown = Object.keys(namespace).filter((field) => !allowedFields.has(field));
  if (unknown.length) diagnostics.push(diagnostic(concept, "unknown-architecture-field", `Unsupported Architecture metadata: ${unknown.sort().join(", ")}`));
  if (concept.type === "Application") {
    if (!concept.applicationId) diagnostics.push(diagnostic(concept, "missing-application-id", "Application requires a stable application-id"));
    if (!APPLICATION_KINDS.includes(namespace["application-kind"] as typeof APPLICATION_KINDS[number])) diagnostics.push(diagnostic(concept, "invalid-application-kind", `application-kind must be one of: ${APPLICATION_KINDS.join(", ")}`));
    if (typeof namespace["independently-deployable"] !== "boolean") diagnostics.push(diagnostic(concept, "invalid-application-deployability", "independently-deployable must be boolean"));
  }
  if (concept.type === "Application Communication" && !COMMUNICATION_MODES.includes(namespace["communication-mode"] as typeof COMMUNICATION_MODES[number])) diagnostics.push(diagnostic(concept, "invalid-communication-mode", `communication-mode must be one of: ${COMMUNICATION_MODES.join(", ")}`));
  return diagnostics;
}

export function validateArchitectureGraph(concepts: Concept[], edges: GraphEdge[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const ids = new Map<string, Concept[]>();
  for (const concept of concepts) {
    if (concept.applicationId) ids.set(concept.applicationId, [...(ids.get(concept.applicationId) ?? []), concept]);
    const downstream = concept.type !== "Application" && !["Definition Area", "Definition Layer", "Lifecycle Stage"].includes(concept.type) && APPLICATION_SCOPED_AREAS.some((area) => concept.area === area);
    if (downstream && !concept.applicationId) diagnostics.push(diagnostic(concept, "missing-downstream-application-id", "Application-scoped knowledge requires exactly one valid application-id"));
  }
  for (const [id, scoped] of ids) {
    const applications = scoped.filter((concept) => concept.type === "Application");
    if (applications.length > 1) diagnostics.push({ code: "duplicate-application-id", severity: "error", message: `Application ID ${id} is used by multiple Applications.`, conceptIds: applications.map((concept) => concept.id) });
    if (applications.length === 0) diagnostics.push({ code: "unknown-application-id", severity: "error", message: `Application-scoped knowledge references unknown Application ID ${id}.`, conceptIds: scoped.map((concept) => concept.id) });
  }
  const apps = new Set(architectureApplications(concepts).map((concept) => concept.id));
  for (const responsibility of concepts.filter((concept) => concept.area === "system" && concept.type === "System Responsibility" && (concept.metadata.system as Record<string, unknown> | undefined)?.boundary === "owned")) {
    if (!edges.some((edge) => apps.has(edge.source) && edge.targetId === responsibility.id && edge.type === "realizes")) diagnostics.push({ code: "orphan-system-responsibility", severity: "warning", message: `${responsibility.title} has no realizing Application.`, conceptIds: [responsibility.id] });
  }
  return diagnostics;
}
function architectureMetadata(concept: Concept): Record<string, unknown> | undefined {
  const value = concept.metadata.architecture;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function diagnostic(concept: Concept, code: string, message: string): Diagnostic { return { code, severity: "error", message: `${concept.id}: ${message}.`, conceptIds: [concept.id] }; }
