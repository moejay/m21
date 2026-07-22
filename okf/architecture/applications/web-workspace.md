---
type: Application
title: Browser Workspace
description: The accessible interactive client for graph navigation, concept focus, agent guidance, and change review.
tags: [architecture, application, browser, ui]
status: draft
sdlc: [system, application, components, code-design, implementation, deployment]
system:
  kind: application
  group: workspace
  boundary: owned
application:
  group: workspace
  architecture_style: browser-client
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: depends-on
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /experience/screens/graph-workspace.md
  - type: realizes
    target: /experience/screens/change-review.md
  - type: constrained-by
    target: /experience/design-system.md
---

# Responsibilities

- Present SDLC definition layers as the primary navigation and selected AI context
- Scope graph, list, diagnostics, and generated views by definition-layer participation without changing concept identity
- Render graph and structured-list navigation from project snapshots
- Maintain selection, focus, filters, and local draft state
- Present canonical concepts without conflating them with proposals
- Collect direct edits and AI requests
- Show semantic change, impact, diagnostics, and acceptance controls
- Present generated views with source traceability

# Non-responsibilities

- Direct filesystem access
- Canonical graph mutation without service acceptance
- Relationship or impact policy
- AI-provider credentials or model invocation
