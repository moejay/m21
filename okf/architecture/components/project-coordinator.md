---
type: Component
title: Project Coordinator
description: Application service that coordinates project queries, proposals, acceptance, AI guidance, validation, and generated views.
tags: [architecture, component, application-service, coordination]
status: active
sdlc: [components, implementation]
components:
  section: components
  kind: service
  group: application
  layer: application
  visibility: internal
  features:
    - features/project-workspace.feature
    - features/application-scope.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
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
---

# Responsibilities

- Open one OKF project and publish an immutable project snapshot.
- Coordinate queries without exposing persistence internals.
- Create proposals against the current project revision.
- Serialize accepted mutations and reload derived graph state.
- Re-run diagnostics after accepted changes.
- Assemble Application-scoped snapshots for downstream workspaces.
- Delegate AI and generated views through explicit ports.

# Transaction boundary

Proposal acceptance is the mutation boundary. A stale or failed operation leaves the previously accepted project unchanged.
