---
type: Component
title: Proposal Review Workspace
description: Presents user and AI revisions as explicit reviewable changes before canonical OKF persistence.
tags: [architecture, component, browser, proposals, review]
status: active
sdlc: [components, implementation]
components:
  section: components
  kind: view
  group: governance
  layer: interface
  visibility: internal
  features:
    - features/change-impact.feature
    - features/ai-guidance.feature
relationships:
  - type: part-of
    target: /architecture/applications/web-workspace.md
  - type: depends-on
    target: /architecture/applications/project-api.md
  - type: constrained-by
    target: /experience/principles/user-control.md
---

# Responsibilities

- Distinguish proposed values from accepted canonical knowledge.
- Show changed fields, provenance, base revision, and affected concepts.
- Present directional impact findings with reason, path, and confidence.
- Require explicit acceptance before persistence.
- Surface stale proposal and persistence failures without losing accepted state.

# Non-responsibilities

- Computing impact
- Mutating OKF files directly
- Treating AI provenance as acceptance
- Hiding unsupported or failed changes
