---
type: System Service
title: Knowledge Workspace
description: The human-facing system boundary for navigating, reading, and shaping product knowledge through purpose-built definition views.
tags: [architecture, system, workspace, interaction]
status: active
sdlc: [system]
system:
  kind: subsystem
  group: experience
  boundary: owned
  criticality: high
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: depends-on
    target: /architecture/systems/product-knowledge-runtime.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Responsibility

Provide the human interaction boundary for M21 without making the graph the universal interface.

# System behavior

- Select and project Business-to-Deployment definition layers.
- Present canonical OKF documents, architecture maps, contracts, and handoffs.
- Preserve user control over proposals and accepted knowledge.
- Apply the active product Visual Language as the workspace theme.
- Expose generated views without replacing their source concepts.

# Boundary

This subsystem owns workspace interaction and presentation. It does not own OKF persistence, semantic validation, model inference, source control, or delivery execution.
