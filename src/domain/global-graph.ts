import type { ProjectSnapshot } from "./model.js";

export interface GlobalGraphNode {
  id: string;
  title: string;
  type: string;
  status?: string;
  layers: string[];
}

export interface GlobalGraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GlobalGraphProjection {
  sourceRevision: string;
  nodes: GlobalGraphNode[];
  links: GlobalGraphLink[];
}

export function projectGlobalGraph(snapshot: ProjectSnapshot): GlobalGraphProjection {
  return {
    sourceRevision: snapshot.revision,
    nodes: snapshot.concepts
      .map((concept) => ({
        id: concept.id,
        title: concept.title,
        type: concept.type,
        ...(concept.status ? { status: concept.status } : {}),
        layers: [...concept.sdlc],
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    links: snapshot.edges
      .map((edge) => ({ source: edge.source, target: edge.targetId, type: edge.type }))
      .sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target) || left.type.localeCompare(right.type)),
  };
}
