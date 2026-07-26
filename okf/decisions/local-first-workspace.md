---
type: Decision
title: Local-First OKF Workspace for the MVP
description: Run the initial workspace locally against a user-owned OKF directory while keeping interfaces suitable for future collaboration services.
tags: [decision, local-first, okf, architecture]
sdlc: [deployment]
relationships:
  - type: governs
    target: /architecture/systems/m21-workspace.md
  - type: governs
    target: /product/capabilities/project-workspace.md
  - type: constrained-by
    target: /constraints/mvp-boundary.md
---

# Context

The MVP must prove portable graph-backed product reasoning and version-controlled collaboration. Building accounts, hosted storage, synchronization, and real-time editing first would delay that proof and obscure the core workflow.

# Decision

A local M21 process opens an OKF bundle from the filesystem, serves a browser workspace on loopback, and writes accepted changes back to the bundle. Git remains an external but natural collaboration and history mechanism.

Interfaces separate product operations from filesystem persistence so a future hosted repository can replace the local adapter.

# Consequences

- Users retain direct ownership of readable project files.
- Initial setup requires a local runtime.
- Concurrent write coordination is limited to safe local persistence and external version-control workflows.
- Authentication, hosted projects, and real-time multiplayer remain outside the MVP.
