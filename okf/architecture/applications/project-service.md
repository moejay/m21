---
type: Application
title: Local Project Service
description: The loopback service that coordinates OKF persistence and product-knowledge operations.
tags: [architecture, application, service, local-first]
status: draft
sdlc: [system, application, components, code-design, implementation, deployment]
system:
  kind: application
  group: workspace
  boundary: owned
application:
  group: workspace
  architecture_style: layered-local-service
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: depends-on
    target: /architecture/components/okf-repository.md
  - type: depends-on
    target: /architecture/components/graph-engine.md
  - type: depends-on
    target: /architecture/components/change-engine.md
  - type: depends-on
    target: /architecture/components/validation-engine.md
  - type: depends-on
    target: /architecture/components/ai-orchestrator.md
  - type: depends-on
    target: /architecture/components/view-projector.md
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
