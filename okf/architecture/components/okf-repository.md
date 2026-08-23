---
type: Component
application-id: project-service
title: OKF Repository
description: Losslessly reads and safely writes product concepts in an OKF bundle.
tags: [architecture, component, okf, persistence]
sdlc: [components, implementation, deployment]
components:
  section: components
  kind: adapter
  group: persistence
  layer: infrastructure
  visibility: internal
  features:
    - features/project-workspace.feature
    - features/visual-design-workspace.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /architecture/systems/okf-project-store.md
  - type: constrained-by
    target: /decisions/portable-typed-relationships.md
---

# Responsibilities

- Discover concept documents while excluding reserved index and log files
- Parse standard fields, singular Definition Area ownership, extension metadata, Markdown bodies, and typed relationships
- Resolve accepted bundle-local Visual Design artifacts into immutable snapshot values and include their content in revision identity
- Diagnose malformed portable relationship paths and values instead of silently resolving them
- Preserve unknown frontmatter and body content
- Resolve stable concept IDs and safe bundle-relative paths
- Write accepted concept revisions atomically
- Create and retire concepts without escaping the bundle

# Semantic operations

- Open project → project snapshot plus parse diagnostics
- Read concept by ID → concept or not found
- Save accepted concept → persisted revision or conflict
- Create concept → persisted concept or invalid/duplicate/path failure

# Invariants

An unchanged read/write round trip has no semantic effect. Failed mutation leaves every canonical document unchanged.
