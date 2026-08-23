---
type: Component
application-id: project-service
title: Generated View Projector
description: Produces reproducible documents and diagrams from selected graph knowledge.
tags: [architecture, component, generation, views]
sdlc: [components, implementation]
components:
  section: components
  kind: application-service
  group: projection
  layer: application
  visibility: internal
  features:
    - features/generated-views.feature
    - features/visual-design-workspace.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /architecture/systems/view-generation-pipeline.md
  - type: depends-on
    target: /architecture/components/graph-engine.md
---

# Responsibilities

- Select concepts and relationship paths required by a view definition
- Render stable Markdown, strict Mermaid diagrams, and isolated Visual Design catalogs
- Include source concept references and unresolved caveats
- Avoid writing generated Mermaid SVG, specimen state, or catalog content back into canonical concepts and linked artifacts
- Produce equivalent output for an unchanged graph

# First vertical slice

Generate a Markdown project summary containing project, vision, MVP capabilities, decisions, diagnostics, and source IDs. Additional design, architecture, ADR, and diagram projections follow the same boundary.
