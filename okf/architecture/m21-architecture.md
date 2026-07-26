---
type: Architecture
title: M21 Executable Architecture
description: Two owned Applications separate browser execution from local project authority while preserving a local-first product boundary.
area: architecture
architecture:
  section: overview
relationships:
  - type: realizes
    target: /architecture/systems/m21-workspace.md
  - type: constrained-by
    target: /decisions/local-first-workspace.md
---

# Selected topology

M21 uses a client–server topology with two owned Applications: a Browser Workspace and a Local Project Service. The split keeps filesystem and provider credentials outside browser authority while allowing a purpose-built interactive workspace.

# Combination and separation rationale

Project loading, validation, accepted writes, artifact resolution, AI-provider access, and generated views remain together in the Local Project Service because they share canonical project authority. Browser rendering, navigation, local preview state, and proposal review remain together in the Browser Workspace.

# Rejected alternative

A single browser-only Application was rejected because browser filesystem and credential authority would weaken the accepted local security boundary. Additional services were rejected because no accepted ownership, scaling, isolation, or release pressure requires them.
