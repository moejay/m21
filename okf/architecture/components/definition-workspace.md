---
type: Component
application-id: browser-workspace
title: Definition Workspace Projector
description: Selects and renders the purpose-built workspace appropriate to the active product-definition layer.
tags: [architecture, component, browser, projections]
sdlc: [components, implementation]
components:
  section: components
  kind: view
  group: definition-views
  layer: interface
  visibility: internal
  features:
    - features/layer-projections.feature
    - features/business-workspace.feature
    - features/business-solution-workspace.feature
    - features/visual-design-workspace.feature
    - features/markdown-preview.feature
    - features/system-architecture.feature
relationships:
  - type: part-of
    target: /architecture/applications/web-workspace.md
  - type: depends-on
    target: /architecture/components/application-scope-controller.md
  - type: informed-by
    target: /domain/layer-projections.md
---

# Responsibilities

- Route each Definition Area to its default purpose-built document, design, architecture, dependency, contract, or handoff view.
- Present Business and Business Solution concepts grouped by each area's controlled section and type with section, type, and status filters.
- Present shared Visual Design through direction cards, linked-CSS foundation specimens, composed themes, sandboxed linked-HTML components, assets, accessibility, decisions, and document fallbacks.
- Reveal canonical body plus incoming and outgoing relationships on expanded cards and follow contextual concepts without changing ownership.
- Receive an already scoped immutable project snapshot.
- Keep primary artifacts visually distinct from future contextual references.
- Render canonical Markdown with GFM and strict Mermaid diagrams while preserving source text; Mermaid never supplies canonical graph semantics.
- Preserve the shared workspace theme and accessibility contract across projections.

# Non-responsibilities

- Loading or persisting OKF bundles
- Computing Application ownership
- Owning proposal state
- Owning or embedding the product-wide global knowledge graph
