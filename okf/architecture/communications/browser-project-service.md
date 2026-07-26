---
type: Application Communication
title: Browser Workspace to Local Project Service
description: The Browser Workspace requests accepted snapshots, proposals, guidance, and generated views from the Local Project Service over a loopback request-response boundary.
area: architecture
architecture:
  section: communications
  communication-mode: request-response
relationships:
  - type: part-of
    target: /architecture/m21-architecture.md
  - type: source
    target: /architecture/applications/web-workspace.md
  - type: destination
    target: /architecture/applications/project-service.md
  - type: constrained-by
    target: /decisions/local-first-workspace.md
---

# Communication contract

The Browser Workspace sends semantic queries and reviewable commands. The Local Project Service returns accepted snapshots, proposals, diagnostics, generated views, and explicit failures. Canonical files, filesystem paths, model credentials, and mutation authority remain behind the service boundary.

# Direction and failure

Ordinary operations are initiated by the browser. Watched project revisions are streamed back over the same loopback trust boundary. Disconnection leaves the last accepted browser snapshot readable and exposes a recoverable error; it never grants the browser direct project-store access.
