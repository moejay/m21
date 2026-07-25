---
type: Component
title: Generated View Projector
description: Produces reproducible documents and diagrams from selected graph knowledge.
tags: [architecture, component, generation, views]
status: active
sdlc: [components, implementation]
components:
  section: components
  kind: application-service
  group: projection
  layer: application
  visibility: internal
  features:
    - features/generated-views.feature
    - features/design-visual-language.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /architecture/systems/view-generation-pipeline.md
  - type: realizes
    target: /product/capabilities/generated-views.md
  - type: depends-on
    target: /architecture/components/graph-engine.md
---

# Responsibilities

- Select concepts and relationship paths required by a view definition
- Render stable Markdown and diagram source
- Include source concept references and unresolved caveats
- Avoid writing generated content back into canonical concept bodies
- Produce equivalent output for an unchanged graph

# First vertical slice

Generate a Markdown project summary containing project, vision, MVP capabilities, decisions, diagnostics, and source IDs. Additional design, architecture, ADR, and diagram projections follow the same boundary.
