---
type: External System
title: Version Control System
description: An optional external system providing distribution, history, attribution, diff, and merge workflows for the OKF bundle.
tags: [architecture, system, external, git]
status: active
sdlc: [system]
system:
  kind: external-system
  group: external-services
  boundary: external
  criticality: low
relationships:
  - type: supports
    target: /architecture/systems/okf-project-store.md
  - type: informed-by
    target: /decisions/local-first-workspace.md
---

# Role

Provide history and collaboration around ordinary OKF files without becoming required runtime persistence.

# Boundary

M21 does not own repository hosting, authentication, merge policy, or conflict resolution in the MVP. A bundle remains usable without version control.
