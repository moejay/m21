---
type: Definition Layer
title: Application
short_title: Application
stage: application
order: 50
description: Zoom into each owned application and define its responsibilities and internal architectural style.
tags: [sdlc, application, architecture, boundaries]
status: active
sdlc: [application]
relationships:
  - type: informed-by
    target: /sdlc/system.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# Purpose

Define every application M21 owns as an independently understandable boundary within the system.

# Defines

- Application responsibility and realized system capabilities
- Inputs, outputs, interfaces, and owned data
- Architectural style such as layered, hexagonal, event-driven, MVC, or another deliberate structure
- Internal layers and dependency rules
- Runtime, security, reliability, and operational expectations
- Application-level decisions, constraints, and risks

# Agent posture

Keep application boundaries cohesive, make dependency direction explicit, challenge accidental framework architecture, and avoid decomposing directly into code before application responsibilities are stable enough for the current purpose.
