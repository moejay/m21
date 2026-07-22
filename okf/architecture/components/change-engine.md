---
type: Component
title: Change and Impact Engine
description: Creates reviewable graph changes and assesses their directional consequences.
tags: [architecture, component, change, impact]
status: draft
sdlc: [application, components, code-design, implementation]
system:
  kind: component
  group: project-service
components:
  application: project-service
  group: domain
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /product/capabilities/change-impact.md
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
