---
type: Definition Layer
title: Implementation Handoff
short_title: Implementation
stage: implementation
order: 80
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
- Required Gherkin scenarios and verification evidence
- Applicable decisions, constraints, risks, and design-system assets
- Expected outputs and boundaries
- Change-impact context and questions that must return upstream

# Ownership boundary

M21 defines and exports the implementation handoff. A coding agent performs source changes, runs implementation tooling, and returns evidence or proposed contract corrections. M21 does not generate or directly modify product code in the MVP.

# Agent posture

Check that the handoff is coherent, bounded, traceable, and verifiable before outsourcing it.
