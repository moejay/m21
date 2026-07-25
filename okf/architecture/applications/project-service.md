---
type: Application
title: Local Project Service
description: The loopback service that coordinates OKF persistence and product-knowledge operations.
tags: [architecture, application, service, local-first]
status: active
sdlc: [architecture, application, components, code-design, implementation, deployment]
architecture:
  section: applications
  kind: backend-service
  group: workspace
  runtime: [nodejs]
  deployable: true
application:
  section: architecture
  architecture_style: layered
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
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

- Open one configured project bundle and expose a stable project snapshot
- Translate semantic commands and queries between the browser and domain components
- Serialize accepted writes to avoid partial graph state
- Reassess diagnostics and impact after accepted changes
- Keep AI-provider secrets outside browser state
- Serve the built browser application on loopback

# Failure behavior

Malformed concepts and broken references become diagnostics when safe. Unsafe paths, stale proposals, invalid operations, and persistence failures reject mutation without partially writing the bundle.
