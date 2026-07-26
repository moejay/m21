---
type: Code Contract
application-id: project-service
title: Project Snapshot Contract
description: Immutable accepted view of concepts, typed edges, diagnostics, project identity, and revision used by every workspace projection.
tags: [code-design, contract, snapshot, immutable]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: immutable-snapshot
  namespace: project.snapshot
  technology: [json]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/graph-engine.md
  - type: depends-on
    target: /code-design/models/concept-graph.md
---

# Data

A Project Snapshot contains project identity, canonical root, revision, normalized Concepts including exact raw Markdown and validated linked artifacts, resolved typed Edges, and current Diagnostics.

# Invariants

- A snapshot represents one accepted project revision, including linked canonical artifact content consumed by migrated area schemas.
- Consumers treat every collection as immutable.
- Edges reference Concept identities present in the complete project snapshot.
- A layer or Application-scoped snapshot may omit unrelated Concepts and Edges but preserves the source revision.
- Diagnostics include evidence and affected Concept identities where known.
- Proposed changes never appear as accepted snapshot values before acceptance.

# Compatibility

Readers tolerate unknown Concept types, relationship types, metadata namespaces, and producer extension fields. Serialization must not silently discard them.
