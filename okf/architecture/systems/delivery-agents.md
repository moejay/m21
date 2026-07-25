---
type: External System
title: Coding and Delivery Agents
description: External execution systems that consume accepted implementation or deployment handoffs and return evidence or correction proposals.
tags: [architecture, system, external, agents, handoff]
status: active
sdlc: [system]
system:
  kind: external-system
  group: delivery
  boundary: external
  criticality: medium
relationships:
  - type: depends-on
    target: /architecture/systems/view-generation-pipeline.md
  - type: supports
    target: /product/capabilities/architecture.md
  - type: constrained-by
    target: /constraints/mvp-boundary.md
---

# Role

Execute source-code, infrastructure, and delivery work outside M21 using bounded accepted contracts.

# Exchange

M21 provides requirements, architecture, code-design contracts, executable scenarios, decisions, constraints, and readiness. Agents return implementation evidence, verification results, unresolved questions, or proposed contract corrections.

# Boundary

Execution authority, credentials, source repositories, and infrastructure remain outside M21. Returned output never becomes canonical product knowledge without review.
