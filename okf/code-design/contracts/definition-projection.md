---
type: Code Contract
application-id: browser-workspace
title: Definition Projection Contract
description: Stable mapping from each definition layer to its purpose-built workspace and primary-artifact query.
tags: [code-design, contract, projections, browser]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: projection-contract
  namespace: workspace.projection
  technology: [okf]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/definition-workspace.md
  - type: informed-by
    target: /domain/layer-projections.md
---

# Mapping

The purpose-built presentation remains the default:

- Business → expandable canonical cards grouped by controlled section and type, with filters and relationship context
- Business Solution → expandable canonical cards grouped by controlled section and type, with filters and relationship context
- Visual Design → direction boards, live linked-CSS foundation specimens, composed themes, sandboxed Visual Components, assets, accessibility evidence, decisions, and document fallbacks
- System Design → conceptual responsibility and information-flow map with linked documents
- Architecture → actual Application realization matrix and owned Application portfolio
- Application Architecture → selected Application internals, interfaces, data, and qualities
- Components → selected-Application dependency architecture and Component documents
- Code Design → selected-Application contract registry
- Implementation and Deployment → selected-Application handoff definitions

The layer mappings do not provide a generic graph alternative. A separate global 3D knowledge graph consumes the complete accepted Project Snapshot and presents all concepts and resolved typed relationships independently from definition scope.

# Invariants

A migrated Concept is primary only when its singular `area` equals the active Definition Area; unmigrated concepts continue to use legacy `sdlc` membership. Linked Visual Design artifacts contribute to source revision while preview state remains disposable. Registry concepts are not content artifacts. A projection changes presentation, never Concept identity, ownership, or canonical meaning. Opening or closing the global graph preserves the remembered active area and selected Application. Missing optional presentation metadata degrades visibly instead of dropping the Concept.
