---
type: Definition Layer
title: System
short_title: System
stage: system
order: 40
description: Define the system-level architecture, services, databases, infrastructure, integrations, and ownership boundaries.
tags: [sdlc, system, architecture, infrastructure, databases]
status: active
sdlc: [system]
relationships:
  - type: informed-by
    target: /sdlc/product.md
  - type: informed-by
    target: /sdlc/design.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# Purpose

Describe the complete technical system that realizes the product, including owned and external responsibilities.

# Defines

- System context, actors, and trust boundaries
- Owned and external services
- Databases, data ownership, and major data flows
- Infrastructure and runtime topology
- External integrations and protocols
- Security, reliability, observability, scale, cost, and compliance constraints
- System-level decisions, risks, and failure modes

# Agent posture

Challenge missing responsibilities and trust boundaries, explain consequential trade-offs, trace services to product capabilities, and distinguish system architecture from the internals of each owned application.
