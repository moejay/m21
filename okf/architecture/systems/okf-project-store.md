---
type: Logical Data Store
title: OKF Project Store
description: User-owned Markdown and YAML files that remain the canonical portable persistence boundary for all product knowledge.
tags: [architecture, system, data, okf, local-first]
area: system
system:
  section: data
  boundary: managed
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: constrained-by
    target: /decisions/local-first-workspace.md
  - type: informed-by
    target: /architecture/systems/version-control.md
---

# Responsibility

Persist canonical concepts, typed relationships, profile metadata, and human-readable Markdown in a user-controlled directory.

# Data ownership

The user owns the bundle. M21 reads and writes it locally and preserves unknown producer extensions during supported revisions.

# Reliability expectations

- Stable path-based concept identity
- Atomic file replacement for accepted revisions
- No hidden database required for canonical state
- Diagnostics for malformed files and broken targets
- Compatibility with ordinary editors, search, diff, and version-control tools
