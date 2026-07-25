---
type: Code Contract
title: Global Graph Projection Contract
description: Deterministic complete-snapshot projection used by the product-wide 3D knowledge graph.
tags: [code-design, contract, graph, projection]
status: active
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: projection-contract
  namespace: workspace.global-graph
  technology: [okf, webgl]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/global-graph-workspace.md
  - type: depends-on
    target: /code-design/models/concept-graph.md
  - type: informed-by
    target: /domain/layer-projections.md
---

# Input

One immutable complete accepted Project Snapshot containing Concepts, resolved typed Edges, Diagnostics, and source revision.

# Output

- One graph node per accepted Concept, preserving stable identity, title, type, lifecycle status, and definition-layer membership.
- One directed graph link per resolved typed Edge, preserving source, target, and relationship type.
- The accepted source revision used to create the projection.

# Invariants

- Projection order is deterministic and does not mutate the source snapshot.
- Layer or Application scope is never applied to the global projection.
- Every Concept and resolved Edge appears exactly once.
- Generated position, color, size, and camera state are disposable presentation data.
- Selecting or navigating graph content has no persistence authority.
