import type { Concept, ProjectSnapshot } from "./model.js";

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
    .filter((concept) => ["Definition Layer", "Lifecycle Stage"].includes(concept.type))
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
  return concepts.filter((concept) => concept.sdlc.includes(layer));
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
