---
type: Decision
title: TypeScript Web Workspace for the First Vertical Slice
description: Use one TypeScript codebase with a browser client, local HTTP service, and framework-independent domain core.
tags: [decision, typescript, web, architecture]
status: proposed
sdlc: [system, application, components, code-design, implementation, deployment]
relationships:
  - type: governs
    target: /architecture/applications/web-workspace.md
  - type: governs
    target: /architecture/applications/project-service.md
---

# Context

The first vertical slice needs filesystem access, interactive graph exploration, structured review interfaces, executable behavior tests, and a path to local or hosted deployment.

# Decision

Use TypeScript across a local Node service and browser application. Keep domain graph, change, impact, and validation logic independent of HTTP, UI, and filesystem frameworks. Use standard HTTP JSON operations between the applications.

# Rationale

A shared language reduces translation overhead during rapid dogfooding while explicit boundaries prevent browser or server frameworks from becoming the domain model.

# Consequences

- The initial implementation is web-oriented.
- Domain behavior remains testable without a browser or server.
- Future clients or hosted services can consume the same semantic operations.
- This is an implementation decision, not a constraint on OKF consumers or generated project artifacts.
