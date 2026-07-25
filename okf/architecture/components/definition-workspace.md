---
type: Component
title: Definition Workspace Projector
description: Selects and renders the purpose-built workspace appropriate to the active product-definition layer.
tags: [architecture, component, browser, projections]
status: active
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
    - features/product-workspace.feature
    - features/design-visual-language.feature
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

- Route each definition layer to its default purpose-built document, design, architecture, dependency, contract, or handoff view.
- Receive an already scoped immutable project snapshot.
- Keep primary artifacts visually distinct from future contextual references.
- Render canonical Markdown without interpreting it as executable content.
- Preserve the shared workspace theme and accessibility contract across projections.

# Non-responsibilities

- Loading or persisting OKF bundles
- Computing Application ownership
- Owning proposal state
- Owning or embedding the product-wide global knowledge graph
