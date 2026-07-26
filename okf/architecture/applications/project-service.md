---
type: Application
title: Local Project Service
description: The loopback service that coordinates OKF persistence and product-knowledge operations.
tags: [architecture, application, service, local-first]
area: architecture
application-id: project-service
architecture:
  section: applications
  application-kind: backend-service
  independently-deployable: true
relationships:
  - type: part-of
    target: /architecture/m21-architecture.md
  - type: realizes
    target: /architecture/systems/product-knowledge-runtime.md
  - type: realizes
    target: /architecture/systems/ai-guidance-boundary.md
  - type: realizes
    target: /architecture/systems/view-generation-pipeline.md
  - type: constrained-by
    target: /decisions/local-first-workspace.md
---

# Responsibilities

- Open one configured project bundle, resolve admitted linked artifacts, and expose a stable project snapshot
- Watch canonical project files and publish complete accepted snapshots after external changes
- Translate semantic commands and queries between the browser and domain components
- Serialize accepted writes to avoid partial graph state
- Reassess diagnostics and impact after accepted changes
- Keep AI-provider secrets outside browser state
- Serve the built browser application on loopback

# Failure behavior

Malformed concepts and broken references become diagnostics when safe. Unsafe paths, stale proposals, invalid operations, and persistence failures reject mutation without partially writing the bundle.
