---
type: Component
application-id: project-service
title: Workspace HTTP Adapter
description: Loopback transport adapter exposing project queries, proposal commands, AI requests, and generated views to the Browser Workspace.
tags: [architecture, component, http, adapter]
sdlc: [components, implementation]
components:
  section: components
  kind: adapter
  group: interface
  layer: interface
  visibility: internal
  features:
    - features/generated-views.feature
    - features/ai-guidance.feature
    - features/project-workspace.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: depends-on
    target: /architecture/components/project-coordinator.md
  - type: depends-on
    target: /architecture/applications/project-api.md
---

# Responsibilities

- Translate transport requests into semantic project operations.
- Validate required request shape before delegation.
- Return stable JSON snapshots, proposals, diagnostics, and errors.
- Stream accepted snapshot updates to the browser when watched canonical files change.
- Serve generated Markdown or HTML with explicit content types.
- Keep model-provider credentials and filesystem paths outside browser authority.

# Boundary

The adapter owns transport concerns only. Domain validation, impact, persistence, context assembly, and view generation remain behind semantic interfaces.
