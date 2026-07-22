---
type: Product Capability
title: Progressive Architecture
description: Model systems, applications, interfaces, and components with traceability to product and design intent.
tags: [mvp, architecture, systems, applications, components]
status: draft
sdlc: [product, system, application, components, code-design, implementation, deployment]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: informed-by
    target: /product/capabilities/product-definition.md
  - type: informed-by
    target: /product/capabilities/product-design.md
---

# User outcome

A user can move from product intent toward an implementable software architecture while preserving the decisions and constraints that shaped it.

# MVP architecture knowledge

- System context and external actors
- Systems and their responsibilities
- Applications and deployable responsibilities
- Interfaces and data flows
- Major software components
- Ownership, dependencies, constraints, and risks
- Traceability to capabilities, journeys, screens, and design-system concerns

# MVP behavior

The AI explains trade-offs, challenges boundaries, suggests patterns, and identifies missing responsibilities. It may guide from broader to deeper architecture, but users can enter or revise any level directly.

# Acceptance outcomes

- A system or application responsibility traces to the capability it realizes.
- Major interfaces and dependencies are explicit.
- Internal component changes do not invalidate product knowledge when external responsibilities remain satisfied.
- Architecture decisions retain alternatives, rationale, and consequences.
