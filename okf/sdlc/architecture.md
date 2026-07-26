---
type: Definition Area
title: Architecture
short_title: Architecture
stage: architecture
order: 50
description: Define the actual owned Application topology that realizes the conceptual System Design.
tags: [definition-area, architecture, applications, topology]
sdlc: [architecture]
relationships:
  - type: informed-by
    target: /sdlc/system.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# Purpose

Turn conceptual System responsibilities into deliberate executable Application boundaries without prematurely decomposing their internals.

# Defines

- The number and kind of owned Applications
- Monolith, modular monolith, full-stack, frontend/backend, worker, and service boundaries
- Which System responsibilities each Application realizes
- Stable Application IDs, controlled Application kinds, and independent deployability boundaries
- Communication and trust boundaries between Applications
- Shared platform and external Application dependencies
- Consequences of combining or separating deployable units

# Examples

A small product may use one full-stack Application that realizes every owned System responsibility. Another product may use a browser Application, backend service, workers, and independently deployable integrations. Architecture records the chosen boundaries and rationale rather than requiring one topology.

# Workspace projection

Architecture presents the System-responsibility-to-Application realization matrix and the owned Application portfolio. Selecting an owned Application enters its persistent Application Architecture, Components, Code Design, Implementation, and Deployment workspace.

# Agent posture

Challenge accidental distribution, unnecessary services, hidden coupling, unclear data ownership, and deployment boundaries that do not follow responsibility or operational needs. Prefer the simplest architecture that satisfies accepted product and System Design constraints.
