---
type: Definition Layer
title: Components
short_title: Components
stage: components
order: 70
description: Decompose each owned application into cohesive components with explicit responsibilities and dependencies.
tags: [sdlc, components, modules, dependencies]
sdlc: [components]
relationships:
  - type: informed-by
    target: /sdlc/application.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# Purpose

Describe the major collaborating parts inside each application without collapsing architectural responsibility into files or incidental helpers.

# Defines

- Component responsibility and owned concepts
- Provided and consumed interfaces
- Dependencies and dependency direction
- State and data ownership
- Events, failures, constraints, and invariants
- Traceability to application and product capabilities

# Workspace projection

Components remains scoped to the selected Application. M21 derives membership through `part-of` relationships, displays the Application as the scope root, groups Components by architectural role, and keeps other Applications' internals out of the primary dependency view. Each Component carries cohesive responsibilities, explicit non-responsibilities, architectural layer, visibility, and dependency direction. Components are not duplicated as Code Design artifacts; their linked models, interfaces, contracts, patterns, and failures become primary in Code Design.

# Agent posture

Prefer cohesive boundaries, identify cycles and duplicated ownership, keep private implementation mechanics out of the graph, and ensure every component has a reason to exist within an owned application.
