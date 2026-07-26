import type { Concept, Diagnostic } from "./model.js";

export const BUSINESS_SECTION_TYPES = {
  direction: ["Mission", "Vision"],
  problems: ["Business Problem"],
  people: ["Stakeholder", "Business Role", "Persona", "Persona Goal", "Business Need"],
  outcomes: ["Business Outcome", "Success Metric"],
  capabilities: ["Business Capability"],
  market: ["Market", "Market Segment", "Competitor", "Market Sizing"],
  research: ["Research Study", "Research Finding", "Evidence Source"],
  economics: ["Business Model", "Revenue Model", "Cost Model"],
  governance: ["Regulation", "Business Constraint"],
  risks: ["Business Risk"],
  decisions: ["Business Decision"],
} as const;

export type BusinessSection = keyof typeof BUSINESS_SECTION_TYPES;
export const BUSINESS_SECTIONS = Object.keys(BUSINESS_SECTION_TYPES) as BusinessSection[];

export function businessArtifacts(concepts: Concept[]): Concept[] {
  return concepts.filter((concept) => concept.type !== "Definition Area" && concept.type !== "Definition Layer" && concept.area === "business");
}

export function businessSection(concept: Concept): BusinessSection | undefined {
  const metadata = objectValue(concept.metadata.business);
  const section = metadata?.section;
  return typeof section === "string" && BUSINESS_SECTIONS.includes(section as BusinessSection)
    ? section as BusinessSection
    : undefined;
}

export function validateBusinessConcept(concept: Concept): Diagnostic[] {
  const namespace = objectValue(concept.metadata.business);
  if (concept.area !== "business") {
    if (namespace) {
      return [diagnostic(concept, "business-area-mismatch", "Business metadata requires singular area: business ownership")];
    }
    return [];
  }

  const diagnostics: Diagnostic[] = [];
  for (const [field, value] of [
    ["title", concept.title],
    ["description", concept.description],
    ["body", concept.body],
  ] as const) {
    if (!value.trim()) diagnostics.push(diagnostic(concept, `missing-business-${field}`, `Business ${field} must not be empty`));
  }
  if (!namespace) {
    diagnostics.push(diagnostic(concept, "missing-business-metadata", "Business concepts require a business mapping with exactly one section"));
    return diagnostics;
  }

  const unknownFields = Object.keys(namespace).filter((field) => field !== "section");
  if (unknownFields.length > 0) {
    diagnostics.push(diagnostic(concept, "unknown-business-field", `Unsupported Business metadata: ${unknownFields.sort().join(", ")}`));
  }

  const section = businessSection(concept);
  if (!section) {
    diagnostics.push(diagnostic(concept, "invalid-business-section", `Business section must be one of: ${BUSINESS_SECTIONS.join(", ")}`));
    return diagnostics;
  }
  const allowedTypes = BUSINESS_SECTION_TYPES[section] as readonly string[];
  if (!allowedTypes.includes(concept.type)) {
    diagnostics.push(diagnostic(concept, "business-type-section-mismatch", `${concept.type} is not allowed in Business section ${section}; expected ${allowedTypes.join(", ")}`));
  }
  return diagnostics;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function diagnostic(concept: Concept, code: string, message: string): Diagnostic {
  return { code, severity: "error", message: `${concept.id}: ${message}.`, conceptIds: [concept.id] };
}
