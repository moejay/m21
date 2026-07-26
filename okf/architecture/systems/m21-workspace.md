---
type: System
title: M21 Product Engineering Workspace
description: The local-first system through which users develop and reason over an OKF product graph.
tags: [architecture, system, workspace]
area: system
system:
  section: overview
  boundary: owned
relationships:
  - type: realizes
    target: /product/mvp.md
  - type: constrained-by
    target: /decisions/local-first-workspace.md
  - type: constrained-by
    target: /experience/accessibility.md
  - type: serves
    target: /people/product-builder.md
  - type: serves
    target: /people/product-team.md
---

# Responsibilities

- Open and persist user-owned OKF projects
- Present connected product knowledge for non-linear work
- Coordinate AI guidance and reviewable graph proposals
- Evaluate change impact and graph quality
- Generate synchronized product, design, architecture, and decision views

# External actors and systems

- Product builders and multidisciplinary teams use the browser workspace.
- The local filesystem owns the OKF bundle.
- Git or another version-control tool may provide distribution, diff, attribution, and merge workflows.
- Configured AI model providers perform language-model inference through replaceable adapters.
- External coding and delivery agents consume Implementation and Deployment handoffs and return evidence or proposed contract corrections.
- External design, code, deployment, and analytics resources may be referenced but are not controlled in the MVP.

# Boundary

M21 owns semantic product-knowledge operations. It does not own source control, high-fidelity design canvases, implementation repositories, deployment infrastructure, or general project management.
