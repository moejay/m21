---
type: Code Interface
title: OKF Repository Port
description: Persistence boundary for loading complete portable concepts and atomically applying accepted revisions within one bundle root.
tags: [code-design, interface, persistence, port]
status: active
sdlc: [code-design, implementation]
code-design:
  section: interfaces
  kind: outbound-port
  namespace: okf.repository
  technology: [markdown, yaml]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/okf-repository.md
  - type: constrained-by
    target: /decisions/portable-typed-relationships.md
  - type: constrained-by
    target: /decisions/local-first-workspace.md
---

# Operations

- Load bundle → normalized Concepts plus parse Diagnostics
- Revise accepted Concept → durable replacement or explicit failure

# Preconditions

The requested path resolves inside the configured bundle root. A revision targets an already loaded Concept and contains only supported canonical fields or explicitly supported namespaced metadata.

# Postconditions

A successful revision replaces one canonical document and preserves unmodified frontmatter extensions and body content. A failed revision leaves the original file intact.

# Invariants

- No path may escape the bundle root.
- Temporary writes are not canonical.
- Rename into place is the mutation boundary.
- Unknown producer metadata survives supported revisions.
