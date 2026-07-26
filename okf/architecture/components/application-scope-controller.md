---
type: Component
application-id: browser-workspace
title: Application Scope Controller
description: Maintains the selected owned Application and scopes downstream definition views through canonical relationship ownership.
tags: [architecture, component, browser, application-scope]
sdlc: [components, implementation]
components:
  section: components
  kind: controller
  group: application-navigation
  layer: application
  visibility: internal
  features:
    - features/architecture-topology.feature
    - features/application-scope.feature
relationships:
  - type: part-of
    target: /architecture/applications/web-workspace.md
  - type: depends-on
    target: /architecture/applications/project-api.md
  - type: depends-on
    target: /code-design/contracts/application-scope.md
---

# Responsibilities

- List selectable owned Applications.
- Preserve one selected Application while users move through Application, Components, Code Design, Implementation, and Deployment.
- Encode layer and Application identity into deep links.
- Prevent downstream tabs from opening without a valid Application scope.
- Request snapshots scoped by canonical `part-of` and `realizes` chains.

# Invariants

- Selecting a product-wide layer does not destroy the remembered Application scope.
- Clearing the Application returns to the product-wide Architecture portfolio.
- Another Application's internals never become primary artifacts in the active scope.
