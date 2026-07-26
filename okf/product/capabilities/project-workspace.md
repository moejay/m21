---
type: Solution Capability
title: OKF Project Workspace
description: Create, open, inspect, and safely persist a portable OKF-backed product project.
tags: [mvp, okf, workspace, persistence]
area: solution
solution:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
  - type: serves
    target: /people/product-builder.md
  - type: serves
    target: /people/product-team.md
  - type: constrained-by
    target: /decisions/portable-typed-relationships.md
---

# User outcome

A user can start a new product project or open an existing OKF bundle and trust that M21 will preserve its human-readable, version-controllable knowledge.

# MVP behavior

- Create a valid project bundle with an index and initial project concept
- Open and parse an existing bundle
- Preserve unknown OKF fields and content during round trips
- Detect malformed concepts and broken references without discarding readable knowledge
- Persist accepted graph changes as understandable Markdown and YAML
- Expose project history available from the bundle and its version-control context

# Acceptance outcomes

- A project created by M21 remains readable without M21.
- Opening and saving an unchanged project produces no semantic change.
- A concept written by another OKF producer remains intact after M21 updates recognized fields.
- Unsafe writes cannot escape the project bundle.
