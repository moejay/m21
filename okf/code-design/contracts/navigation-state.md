---
type: Code Contract
title: Definition Navigation State Contract
description: Deep-linkable product-wide layer, selected Application, downstream layer, and workspace presentation state owned by the Browser Workspace.
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
- Presentation mode: the layer's default purpose-built workspace or its separate relationship graph

# Transitions

Selecting a product-wide layer changes the active scope but may retain the remembered Application and presentation mode. Architecture uses the product-wide realization matrix and Application portfolio as its purpose-built presentation. Selecting an Application enters Application Architecture and preserves the active downstream layer when already valid. Clearing it returns to Architecture. Selecting graph presentation replaces the purpose-built canvas without changing layer, Application, or focused-Concept state; selecting workspace presentation restores the layer-specific canvas.

# Invariants

- Downstream layers other than Application require a valid selected Application.
- Route state is sufficient to restore the same workspace scope and presentation.
- An invalid Application identity is removed rather than widening the query.
- Graph presentation uses the same already-scoped snapshot as the purpose-built presentation.
- View selection never mutates canonical OKF knowledge.
