---
type: Code Model
title: Concept Graph Model
description: Normalized Concept, typed Relationship, resolved Edge, Diagnostic, and stable identity contracts used by product-knowledge operations.
tags: [code-design, model, graph, okf]
status: active
sdlc: [code-design, implementation]
code-design:
  section: models
  kind: domain-model
  namespace: product.knowledge
  technology: [okf]
  visibility: public
relationships:
  - type: part-of
    target: /architecture/components/graph-engine.md
  - type: constrained-by
    target: /domain/product-knowledge.md
  - type: depends-on
    target: /profile.md
---

# Concept

A Concept has stable bundle-relative identity, descriptive type, title, description, status, Markdown body, SDLC layer membership, typed relationships, source file path, and preserved extension metadata.

# Relationship and Edge

A Relationship stores semantic type, portable target path, optional rationale, and optional evidence. A resolved Edge adds normalized source and target identities for graph queries without replacing the portable relationship.

# Diagnostic

A Diagnostic has severity, stable code, explanatory message, and affected Concept identities. Diagnostics report incomplete or invalid knowledge while preserving readable partial projects whenever safe.

# Identity invariant

Concept identity derives from its bundle-relative path without the Markdown extension. Titles, types, and file content may change without changing identity; moving a file is an identity migration.
