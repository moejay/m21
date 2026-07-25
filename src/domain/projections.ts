import type { Concept } from "./model.js";

export type ProjectionKind =
  | "documents"
  | "design-system"
  | "system-architecture"
  | "application-portfolio"
  | "application-architecture"
  | "component-dependencies"
  | "contract-registry"
  | "implementation-handoff"
  | "deployment-definition";

const PROJECTIONS: Record<string, ProjectionKind> = {
  business: "documents",
  product: "documents",
  design: "design-system",
  system: "system-architecture",
  architecture: "application-portfolio",
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

export function systemArchitectureArtifacts(concepts: Concept[]): Concept[] {
  return mainArtifactsForLayer(concepts, "system").filter((concept) => {
    const metadata = concept.metadata.system;
    return metadata !== undefined && typeof metadata === "object" && !Array.isArray(metadata);
  });
}

export function componentFeatureFiles(concepts: Concept[]): string[] {
  return [...new Set(concepts.flatMap((concept) => {
    if (concept.type !== "Component" || concept.status !== "active") return [];
    const metadata = concept.metadata.components;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return [];
    const features = (metadata as Record<string, unknown>).features;
    return Array.isArray(features) ? features.filter((feature): feature is string => typeof feature === "string") : [];
  }))].sort();
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
