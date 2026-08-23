---
type: Definition Area
title: System Design
short_title: System Design
stage: system
order: 40
description: Define the conceptual system responsibilities, boundaries, information flows, data ownership, and external dependencies.
tags: [definition-area, system-design, conceptual, flows, boundaries]
sdlc: [system]
relationships:
  - type: informed-by
    target: /sdlc/product.md
  - type: informed-by
    target: /sdlc/design.md
---

# Purpose

Describe the conceptual technical system that realizes the product, including owned responsibilities, major logical services, information and data boundaries, actors, and external dependencies without choosing executable Application topology.

# Defines

- System context, actors, and trust boundaries
- Logical owned responsibilities and external services
- Conceptual data stores, data ownership, and major information flows
- External integrations and protocols
- Qualities and constraints that the later Architecture must realize
- Security, reliability, observability, scale, cost, and compliance constraints
- System-level decisions, risks, and failure modes

# Workspace projection

System Design renders primary conceptual System artifacts as a high-level linked map and grouped expandable OKF documents. Nodes represent the owned system, logical responsibilities or services, conceptual data boundaries, and external systems. It deliberately does not decide whether those responsibilities use one full-stack Application, a monolith, or several frontend, backend, and worker Applications. The Architecture layer makes that decision.

# Agent posture

Challenge missing responsibilities and trust boundaries, explain consequential trade-offs, trace services to product capabilities, and distinguish system architecture from the internals of each owned application.
