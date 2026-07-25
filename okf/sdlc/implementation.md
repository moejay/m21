---
type: Definition Layer
title: Implementation Handoff
short_title: Implementation
stage: implementation
order: 90
description: Package accepted code design, behavior, constraints, and impact context for an external coding agent.
tags: [sdlc, implementation, coding-agent, handoff]
status: active
sdlc: [implementation]
relationships:
  - type: depends-on
    target: /sdlc/code-design.md
  - type: constrained-by
    target: /constraints/mvp-boundary.md
---

# Purpose

Prepare coherent implementation work without making source-code generation part of the M21 MVP.

# Defines

- Selected vertical implementation increment
- Source Code Design concepts and affected components
- Required Gherkin feature sets declared by every affected Component, used as the primary implementation testing contract
- Focused lower-level verification evidence that supplements those executable features
- Applicable decisions, constraints, risks, and design-system assets
- Expected outputs and boundaries
- Change-impact context and questions that must return upstream

# Workspace projection

Implementation remains scoped to the selected Application. Handoffs collect only that Application's accepted Code Design, affected Components, declared Gherkin feature files, constraints, unresolved questions, and returned evidence. Coding agents run the Component feature sets as the primary acceptance suite; unit and adapter tests provide supporting evidence for lower-level behavior.

# Ownership boundary

M21 defines and exports the implementation handoff. A coding agent performs source changes, runs implementation tooling, and returns evidence or proposed contract corrections. M21 does not generate or directly modify product code in the MVP.

# Agent posture

Check that the handoff is coherent, bounded, traceable, and verifiable before outsourcing it.
