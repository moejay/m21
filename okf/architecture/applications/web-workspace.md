---
type: Application
title: Browser Workspace
description: The accessible interactive client for graph navigation, concept focus, agent guidance, and change review.
tags: [architecture, application, browser, ui]
status: active
sdlc: [architecture, application, components, code-design, implementation, deployment]
architecture:
  section: applications
  kind: web-client
  group: workspace
  runtime: [browser]
  deployable: true
application:
  section: architecture
  architecture_style: component-based
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: realizes
    target: /architecture/systems/knowledge-workspace.md
  - type: depends-on
    target: /architecture/applications/project-api.md
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
- Render purpose-built scoped workspaces and a separate global 3D graph from the complete accepted Project Snapshot
- Maintain layer scope, Application scope, global-graph state, selection, focus, filters, and local draft state
- Present canonical concepts without conflating them with proposals
- Collect direct edits and AI requests
- Show semantic change, impact, diagnostics, and acceptance controls
- Present generated views with source traceability
- Expose graph switching as a quiet top-right workspace action without making it compete with document content

# Non-responsibilities

- Direct filesystem access
- Canonical graph mutation without service acceptance
- Relationship or impact policy
- AI-provider credentials or model invocation
