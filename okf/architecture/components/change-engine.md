---
type: Component
application-id: project-service
title: Change and Impact Engine
description: Creates reviewable graph changes and assesses their directional consequences.
tags: [architecture, component, change, impact]
sdlc: [components, implementation]
components:
  section: components
  kind: domain-service
  group: domain
  layer: domain
  visibility: internal
  features:
    - features/change-impact.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /architecture/systems/product-knowledge-runtime.md
  - type: realizes
    target: /product/capabilities/change-impact.md
  - type: depends-on
    target: /architecture/components/graph-engine.md
  - type: constrained-by
    target: /domain/change-governance.md
  - type: constrained-by
    target: /domain/impact-semantics.md
---

# Responsibilities

- Validate graph operations against a source project revision
- Produce semantic before-and-after change summaries
- Traverse only relationship directions relevant to changed meaning
- Create explainable impact findings with path, reason, and confidence
- Apply explicitly accepted operations as one logical change
- Preserve unresolved and dismissed review outcomes

# Initial limitation

The first vertical slice assesses structural and relationship-contract impact deterministically. AI-assisted semantic impact may enrich findings later through the AI orchestrator but cannot bypass explicit evidence and review.
