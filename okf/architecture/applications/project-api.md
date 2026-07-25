---
type: Application Interface
title: Project Workspace API
description: Semantic loopback interface through which the Browser Workspace queries accepted knowledge and submits reviewable commands.
tags: [application, interface, api, local-first]
status: active
sdlc: [application, code-design, implementation]
application:
  section: interfaces
  kind: http-api
  group: project-service
  runtime: [loopback-http]
  deployable: false
code-design:
  section: interfaces
  kind: application-api
  namespace: project.workspace
  technology: [json, http]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: depends-on
    target: /code-design/contracts/project-snapshot.md
  - type: depends-on
    target: /code-design/contracts/change-proposal.md
---

# Queries

- Open the current project snapshot.
- Generate a project or layer summary.
- Generate the accepted Design component preview.
- Read a proposal by stable proposal identity.

# Commands

- Create a bounded user revision proposal.
- Request an AI-generated proposal with selected definition-layer context.
- Accept a non-stale proposal exactly once.

# Failure contract

Invalid input is rejected without delegation. Unknown resources return not-found evidence. Stale or already-resolved proposals return conflict evidence. Internal failures do not expose credentials, unsafe filesystem paths, or partial canonical writes.

# Boundary

This interface is local and semantic; route shape is an adapter concern. Clients depend on project operations and response contracts rather than service implementation structure.
