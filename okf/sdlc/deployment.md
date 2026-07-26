---
type: Definition Layer
title: Deployment Definition
short_title: Deployment
stage: deployment
order: 100
description: Define how applications are built, configured, released, deployed, observed, and recovered for a coding agent to realize.
tags: [sdlc, deployment, release, operations, coding-agent]
sdlc: [deployment]
relationships:
  - type: informed-by
    target: /sdlc/system.md
  - type: informed-by
    target: /sdlc/architecture.md
  - type: informed-by
    target: /sdlc/application.md
  - type: depends-on
    target: /sdlc/code-design.md
  - type: constrained-by
    target: /constraints/mvp-boundary.md
---

# Purpose

Create a complete deployment contract without directly provisioning infrastructure or running delivery automation.

# Defines

- Build artifacts and application packaging
- Environments, configuration, and secret requirements
- Infrastructure and deployment topology
- Data migration and compatibility concerns
- Release strategy, readiness, rollout, and rollback
- Health checks, observability, ownership, and recovery expectations
- Security, compliance, capacity, and cost constraints
- Verification evidence required after deployment

# Workspace projection

Deployment remains scoped to the selected Application while allowing linked shared-platform definitions as contextual dependencies. The view must not mix another Application's deployment internals into the active scope.

# Ownership boundary

M21 defines and exports deployment knowledge and handoff instructions. A coding or delivery agent implements pipelines, manifests, infrastructure code, and deployment automation. Direct CI/CD execution and infrastructure provisioning remain outside the M21 MVP.

# Agent posture

Challenge unsafe or unverifiable deployment assumptions and connect operational evidence back to System Design, Architecture, Application Architecture, and Product contracts.
