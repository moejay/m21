---
type: Component
title: OKF Repository
description: Losslessly reads and safely writes product concepts in an OKF bundle.
tags: [architecture, component, okf, persistence]
status: draft
sdlc: [application, components, code-design, implementation, deployment]
system:
  kind: component
  group: project-service
components:
  application: project-service
  group: persistence
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /product/capabilities/project-workspace.md
  - type: constrained-by
    target: /decisions/portable-typed-relationships.md
---

# Responsibilities

- Discover concept documents while excluding reserved index and log files
- Parse standard fields, extension metadata, Markdown bodies, and typed relationships
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
