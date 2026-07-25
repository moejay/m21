---
type: System Service
title: Product Knowledge Runtime
description: The semantic core that loads OKF concepts, resolves typed relationships, validates knowledge, and governs reviewable change.
tags: [architecture, system, knowledge-graph, semantics]
status: active
sdlc: [system]
system:
  kind: subsystem
  group: knowledge
  boundary: owned
  criticality: critical
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: depends-on
    target: /architecture/systems/okf-project-store.md
  - type: depends-on
    target: /profile.md
---

# Responsibility

Maintain the coherent in-memory interpretation of a user-owned OKF bundle and coordinate changes back to canonical files.

# System behavior

- Parse concepts and preserve producer extensions.
- Resolve stable IDs and typed relationships.
- Project concepts by definition-layer membership.
- Validate structural and semantic contracts.
- Assess relationship-aware change impact.
- Persist accepted revisions atomically.

# Boundary

The runtime owns semantic product-knowledge operations. It does not own the user's filesystem, version history, model inference, visual rendering, or implementation repositories.
