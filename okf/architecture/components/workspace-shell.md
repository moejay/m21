---
type: Component
title: Workspace Shell
description: Owns product-wide layout, route state, project health, and the stable frame around every definition workspace.
tags: [architecture, component, browser, shell]
status: active
sdlc: [components, implementation]
components:
  section: components
  kind: view
  group: workspace-shell
  layer: interface
  visibility: internal
  features:
    - features/lifecycle-workflows.feature
    - features/project-workspace.feature
    - features/global-knowledge-graph.feature
    - features/layer-projections.feature
relationships:
  - type: part-of
    target: /architecture/applications/web-workspace.md
  - type: depends-on
    target: /architecture/components/definition-workspace.md
  - type: depends-on
    target: /architecture/components/application-scope-controller.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Responsibilities

- Present product-wide Business, Product, Visual Design, System Design, and Architecture navigation plus the selected-Application downstream workspace.
- Preserve layer and Application scope in deep-linkable route state.
- Provide a global action that opens the complete product-wide 3D knowledge graph and restores the remembered purpose-built workspace when closed.
- Apply the accepted project theme to shared workspace chrome.
- Surface project health, generated summaries, proposals, and recoverable failures.
- Provide stable regions for purpose-built definition workspaces.

# Non-responsibilities

- Querying canonical files directly
- Deciding which concepts belong to an Application
- Implementing layer-specific projections
- Accepting AI output without proposal review

# Dependency rule

The shell coordinates view components through explicit state and callbacks. Purpose-built canvases do not mutate global route or canonical project state directly.
