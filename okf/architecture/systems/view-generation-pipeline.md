---
type: System Responsibility
title: View Generation Pipeline
description: Deterministic projection of accepted OKF knowledge into documents, diagrams, architecture views, component catalogs, and handoff packages.
tags: [architecture, system, projections, generation]
area: system
system:
  section: responsibilities
  boundary: owned
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: depends-on
    target: /architecture/systems/product-knowledge-runtime.md
  - type: realizes
    target: /product/capabilities/generated-views.md
---

# Responsibility

Create purpose-built, reproducible views from accepted concepts without introducing a second source of truth.

# Outputs

- Business and Product documents
- Design token boards and standalone component previews
- System and application architecture maps
- Component dependency views
- Code-design contract registries
- Implementation and deployment handoff packages

# Invariant

Every generated output is disposable and reproducible from the OKF bundle. Editing generated HTML or diagrams does not modify canonical knowledge.
