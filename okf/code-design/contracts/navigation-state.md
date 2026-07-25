---
type: Code Contract
title: Definition Navigation State Contract
description: Deep-linkable product-wide layer, selected Application, downstream layer, and global-graph state owned by the Browser Workspace.
tags: [code-design, contract, navigation, browser]
status: active
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: state-contract
  namespace: workspace.navigation
  technology: [url-state]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/application-scope-controller.md
  - type: depends-on
    target: /code-design/contracts/application-scope.md
---

# State

- Product-wide layer: Business, Product, Visual Design, System Design, or Architecture
- Selected-Application layer: Application Architecture, Components, Code Design, Implementation, or Deployment
- Optional selected owned Application identity
- Optional global graph state, independent from definition and Application scope

# Transitions

Selecting a product-wide layer changes the active scope but may retain the remembered Application. Architecture uses the product-wide realization matrix and Application portfolio. Selecting an Application enters Application Architecture and preserves the active downstream layer when already valid. Clearing it returns to Architecture. Opening the global graph preserves the remembered layer and Application while projecting the complete accepted Project Snapshot; closing it restores that workspace.

# Invariants

- Downstream layers other than Application require a valid selected Application.
- Route state is sufficient to restore the same workspace scope and global-graph state.
- An invalid Application identity is removed rather than widening the query.
- The global graph never inherits layer or Application scope.
- View selection never mutates canonical OKF knowledge.
