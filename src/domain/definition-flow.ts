import type { Concept, ProjectSnapshot } from "./model.js";

export const APPLICATION_SCOPED_LAYERS = ["application", "components", "code-design", "implementation", "deployment"] as const;

export interface DefinitionLayer {
  id: string;
  conceptId?: string;
  title: string;
  shortTitle: string;
  description: string;
  order: number;
}

const RECOGNIZED_DEFINITION_AREAS: DefinitionLayer[] = [
  { id: "business", title: "Business", shortTitle: "Business", description: "Define why change is needed and which outcomes matter.", order: 10 },
  { id: "solution", title: "Business Solution", shortTitle: "Solution", description: "Define the complete socio-technical response to accepted Business context.", order: 20 },
  { id: "product", title: "Product", shortTitle: "Product", description: "Open legacy Product-layer knowledge during migration.", order: 20 },
  { id: "visual-design", title: "Visual Design", shortTitle: "Visual Design", description: "Define shared visual direction, foundations, themes, components, and accessibility.", order: 30 },
  { id: "design", title: "Visual Design", shortTitle: "Visual Design", description: "Open legacy Visual Design-layer knowledge during migration.", order: 30 },
  { id: "system", title: "System Design", shortTitle: "System", description: "Define conceptual technical responsibilities and information flows.", order: 40 },
  { id: "architecture", title: "Architecture", shortTitle: "Architecture", description: "Define owned Application boundaries and responsibility realization.", order: 50 },
  { id: "experience", title: "Application Experience", shortTitle: "App Experience", description: "Define the experience of one selected Application.", order: 55 },
  { id: "application", title: "Application Architecture", shortTitle: "App Architecture", description: "Define the internals of one selected Application.", order: 60 },
  { id: "components", title: "Components", shortTitle: "Components", description: "Define cohesive Components owned by one selected Application.", order: 70 },
  { id: "code-design", title: "Code Design", shortTitle: "Code Design", description: "Define semantic models, interfaces, states, failures, and contracts.", order: 80 },
  { id: "implementation", title: "Implementation", shortTitle: "Implementation", description: "Prepare bounded implementation handoffs and verification.", order: 90 },
  { id: "deployment", title: "Deployment", shortTitle: "Deployment", description: "Define delivery, operation, recovery, and deployment handoffs.", order: 100 },
];

export function definitionLayers(concepts: Concept[]): DefinitionLayer[] {
  const registered = concepts
    .filter((concept) => ["Definition Area", "Definition Layer", "Lifecycle Stage"].includes(concept.type))
    .flatMap((concept) => {
      const id = typeof concept.metadata.stage === "string" ? concept.metadata.stage : concept.sdlc[0];
      if (!id) return [];
      return [{
        id,
        conceptId: concept.id,
        title: concept.title,
        shortTitle: typeof concept.metadata.short_title === "string" ? concept.metadata.short_title : concept.title,
        description: concept.description,
        order: typeof concept.metadata.order === "number" ? concept.metadata.order : Number.MAX_SAFE_INTEGER,
      }];
    });
  const registeredIds = new Set(registered.map((area) => area.id));
  const representedIds = new Set(concepts.flatMap((concept) => concept.area ? [concept.area, ...concept.sdlc] : concept.sdlc));
  const inferred = RECOGNIZED_DEFINITION_AREAS.filter((area) => representedIds.has(area.id) && !registeredIds.has(area.id));
  return [...registered, ...inferred]
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
}

export function conceptsForLayer(concepts: Concept[], layer: string): Concept[] {
  return concepts.filter((concept) => concept.area === layer || concept.sdlc.includes(layer));
}

export function applicationScopes(concepts: Concept[]): Concept[] {
  return concepts
    .filter((concept) => concept.type === "Application" && (concept.area === "architecture" || concept.sdlc.includes("architecture")))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function snapshotForApplicationLayer(snapshot: ProjectSnapshot, applicationId: string, layer: string): ProjectSnapshot {
  const application = snapshot.concepts.find((concept) => (concept.id === applicationId || concept.applicationId === applicationId) && concept.type === "Application" && (concept.area === "architecture" || concept.sdlc.includes("architecture")));
  if (!application) {
    return { ...snapshot, name: `${snapshot.name} · unknown Application · ${layer}`, concepts: [], edges: [], diagnostics: [] };
  }

  const ownedIds = new Set([applicationId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of snapshot.edges) {
      if (!["part-of", "realizes"].includes(edge.type) || !ownedIds.has(edge.targetId) || ownedIds.has(edge.source)) continue;
      ownedIds.add(edge.source);
      changed = true;
    }
  }

  const concepts = snapshot.concepts.filter((concept) => {
    const directlyScoped = application.applicationId && concept.applicationId === application.applicationId;
    return (ownedIds.has(concept.id) || directlyScoped) && (concept.id === application.id ? layer === "application" : concept.area === layer || concept.sdlc.includes(layer));
  });
  const ids = new Set(concepts.map((concept) => concept.id));
  return {
    ...snapshot,
    name: `${snapshot.name} · ${application.title} · ${layer}`,
    concepts,
    edges: snapshot.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.targetId)),
    diagnostics: snapshot.diagnostics.filter(
      (diagnostic) => diagnostic.conceptIds.length === 0 || diagnostic.conceptIds.some((id) => ids.has(id)),
    ),
  };
}

export function snapshotForLayer(snapshot: ProjectSnapshot, layer: string): ProjectSnapshot {
  const concepts = conceptsForLayer(snapshot.concepts, layer);
  const ids = new Set(concepts.map((concept) => concept.id));
  return {
    ...snapshot,
    name: `${snapshot.name} · ${layer}`,
    concepts,
    edges: snapshot.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.targetId)),
    diagnostics: snapshot.diagnostics.filter(
      (diagnostic) => diagnostic.conceptIds.length === 0 || diagnostic.conceptIds.some((id) => ids.has(id)),
    ),
  };
}
