import { businessArtifacts } from "./business.js";
import type { Concept } from "./model.js";
import { solutionArtifacts } from "./solution.js";
import { visualDesignArtifacts } from "./visual-design.js";
import { systemDesignArtifacts } from "./system-design.js";
import { architectureArtifacts } from "./architecture.js";

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
  solution: "documents",
  product: "documents",
  "visual-design": "design-system",
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
  if (layer === "business") return businessArtifacts(concepts);
  if (layer === "solution") return solutionArtifacts(concepts);
  if (layer === "visual-design") return visualDesignArtifacts(concepts);
  if (layer === "system") return systemDesignArtifacts(concepts);
  if (layer === "architecture") return architectureArtifacts(concepts);
  return concepts.filter((concept) => !["Definition Area", "Definition Layer"].includes(concept.type) && (concept.area === layer || concept.sdlc.includes(layer)));
}

export function productCapabilityArtifacts(concepts: Concept[]): Concept[] {
  return mainArtifactsForLayer(concepts, "product").filter((concept) => concept.type === "Product Capability");
}

export function systemArchitectureArtifacts(concepts: Concept[]): Concept[] {
  return systemDesignArtifacts(concepts);
}

export function componentFeatureFiles(concepts: Concept[]): string[] {
  return [...new Set(concepts.flatMap((concept) => {
    if (concept.type !== "Component") return [];
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
