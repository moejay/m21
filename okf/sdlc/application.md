---
type: Definition Layer
title: Application Architecture
short_title: App Architecture
stage: application
order: 60
description: Define the internal architecture, interfaces, data, dependency rules, and qualities of one selected owned Application.
tags: [sdlc, application, architecture, boundaries]
status: active
sdlc: [application]
relationships:
  - type: informed-by
    target: /sdlc/architecture.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# Purpose

Define the internal architecture of each selected owned Application established by the product-wide Architecture layer.

# Defines

- Application responsibility and realized system capabilities
- Inputs, outputs, interfaces, and owned data
- Architectural style such as layered, hexagonal, event-driven, MVC, or another deliberate structure
- Internal layers and dependency rules
- Runtime, security, reliability, and operational expectations
- Application-level decisions, constraints, and risks

# Workspace projection

Selecting an Application in the Architecture portfolio establishes the persistent scope for Application Architecture, Components, Code Design, Implementation, and Deployment. Application Architecture presents its complete canonical document, internal style, interfaces, dependencies, data, security, and application-local artifacts. Ownership is derived from typed relationships rather than duplicated Application IDs.

# Agent posture

Keep application boundaries cohesive, make dependency direction explicit, challenge accidental framework architecture, and avoid decomposing directly into code before application responsibilities are stable enough for the current purpose.
