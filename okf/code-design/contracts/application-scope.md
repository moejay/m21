---
type: Code Contract
application-id: project-service
title: Application Scope Contract
description: Deterministic ownership query that keeps downstream definition layers rooted in one selected owned Application.
tags: [code-design, contract, application-scope, query]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: query-contract
  namespace: definition.application-scope
  technology: [typed-graph]
  visibility: public
relationships:
  - type: part-of
    target: /architecture/components/graph-engine.md
  - type: informed-by
    target: /domain/sdlc-workflow.md
---

# Input

- Complete accepted Project Snapshot
- Selected owned Application identity
- Selected downstream layer: Application, Components, Code Design, Implementation, or Deployment

# Output

An immutable scoped snapshot containing only primary artifacts that participate in the selected layer and whose ownership chain reaches the selected Application.

# Ownership semantics

Start with the selected Application. Repeatedly include incoming `part-of` and downstream `realizes` sources whose target is already owned. Filter the resulting ownership set by active layer membership. Retain only edges whose endpoints remain in scope.

# Invariants

- An unknown Application does not leak a product-wide downstream snapshot.
- Cross-Application `depends-on` relationships do not transfer ownership.
- Product-wide relationships do not make unrelated upstream concepts primary.
- The selected Application identity and source revision remain stable across downstream tabs.
