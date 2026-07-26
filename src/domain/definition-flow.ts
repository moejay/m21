import type { Concept, ProjectSnapshot } from "./model.js";

export const APPLICATION_SCOPED_LAYERS = ["application", "components", "code-design", "implementation", "deployment"] as const;

export interface DefinitionLayer {
  id: string;
  conceptId: string;
  title: string;
  shortTitle: string;
  description: string;
  order: number;
}

export function definitionLayers(concepts: Concept[]): DefinitionLayer[] {
  return concepts
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
    })
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
