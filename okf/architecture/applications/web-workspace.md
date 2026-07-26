---
type: Application
title: Browser Workspace
description: The accessible interactive client for graph navigation, concept focus, agent guidance, and change review.
tags: [architecture, application, browser, ui]
area: architecture
application-id: browser-workspace
architecture:
  section: applications
  application-kind: web-client
  independently-deployable: true
relationships:
  - type: part-of
    target: /architecture/m21-architecture.md
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

- Present Definition Areas as the primary navigation and selected AI context while tolerating legacy layer metadata during migration
- Scope graph, list, diagnostics, and generated views by definition-layer participation without changing concept identity
- Render purpose-built scoped workspaces, strict Markdown Mermaid diagrams, isolated Visual Design specimens, and a separate global 3D graph from the complete accepted Project Snapshot
- Receive watched project revisions without requiring a browser refresh
- Maintain area scope, Application scope, global-graph state, selection, focus, filters, preview state, and local proposal-edit state
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
