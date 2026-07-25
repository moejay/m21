---
type: Component
title: Global Graph Workspace
description: Renders the complete accepted OKF graph as an interactive product-wide 3D knowledge view.
tags: [architecture, component, browser, graph, webgl]
status: active
sdlc: [components, implementation]
components:
  section: components
  kind: view
  group: definition-views
  layer: interface
  visibility: internal
  features:
    - features/global-knowledge-graph.feature
relationships:
  - type: part-of
    target: /architecture/applications/web-workspace.md
  - type: depends-on
    target: /architecture/components/workspace-shell.md
  - type: informed-by
    target: /domain/layer-projections.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Responsibilities

- Project every accepted OKF Concept and resolved typed relationship from the complete Project Snapshot into one interactive 3D graph.
- Keep global graph scope independent from active definition layer and selected Application.
- Encode definition depth with a stable visual legend while keeping spatial coordinates non-canonical.
- Support orbit, zoom, pan, search, node focus, relationship traversal, and return to the remembered workspace.
- Provide focused textual concept and relationship context alongside the spatial view.
- Fail visibly when 3D rendering is unavailable without affecting accepted knowledge.

# Non-responsibilities

- Replacing purpose-built layer workspaces
- Loading OKF files directly
- Computing or changing ownership
- Editing canonical knowledge through spatial gestures
- Assigning semantic meaning to generated coordinates
