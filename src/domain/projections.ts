import type { Concept } from "./model.js";

export type ProjectionKind =
  | "documents"
  | "design-system"
  | "grouped-topology"
  | "application-architecture"
  | "component-dependencies"
  | "contract-registry"
  | "implementation-handoff"
  | "deployment-definition";

const PROJECTIONS: Record<string, ProjectionKind> = {
  business: "documents",
  product: "documents",
  design: "design-system",
  system: "grouped-topology",
  application: "application-architecture",
  components: "component-dependencies",
  "code-design": "contract-registry",
  implementation: "implementation-handoff",
  deployment: "deployment-definition",
};

export function projectionForLayer(layer: string): ProjectionKind | undefined {
  return PROJECTIONS[layer];
}

export function mainArtifactsForLayer(concepts: Concept[], layer: string): Concept[] {
  return concepts.filter((concept) => concept.type !== "Definition Layer" && concept.sdlc.includes(layer));
}

export function productCapabilityArtifacts(concepts: Concept[]): Concept[] {
  return mainArtifactsForLayer(concepts, "product").filter((concept) => concept.type === "Product Capability");
}

export function projectionGroup(concept: Concept, layer: string): string {
  const metadata = concept.metadata[layer];
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const namespace = metadata as Record<string, unknown>;
    const group = namespace.group ?? namespace.section;
    if (typeof group === "string") return group;
  }
  return concept.type;
}
