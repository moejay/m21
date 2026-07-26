---
type: Solution Capability
title: SDLC Definition Flow
description: Drive product engineering through Business, Product, Visual Design, System Design, Architecture, Application Architecture, Components, Code Design, Implementation, and Deployment views.
tags: [mvp, sdlc, workflow, navigation]
area: solution
solution:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: serves
    target: /people/product-builder.md
  - type: serves
    target: /people/product-team.md
  - type: constrained-by
    target: /domain/sdlc-workflow.md
---

# User outcome

A user enters M21 through the depth of product definition they are working on rather than first choosing a document type.

# Flow

1. **Business** — personas, business capabilities, problems, outcomes, regulations, and constraints
2. **Product** — how the product solves those problems and what it promises
3. **Visual Design** — experience, brand, visual language, design tokens, patterns, and accessibility
4. **System** — system-level services, databases, infrastructure, integrations, and constraints
5. **Application** — architecture and responsibilities of every owned application
6. **Components** — cohesive application components and their dependencies
7. **Code Design** — models, interfaces, patterns, contracts, and Gherkin behavior
8. **Implementation Handoff** — bounded specification package for a coding agent
9. **Deployment Definition** — deployment and operational contract for a coding or delivery agent

# Behavior

- Present these layers as the primary workspace navigation and AI context.
- Use a purpose-built projection for each layer rather than showing the same graph everywhere.
- Scope knowledge, recommendations, diagnostics, and generated views to the selected layer.
- Let one concept contribute to several layers without cloning it.
- Allow work at any depth without requiring previous layers to appear complete.
- Show dependencies, unresolved questions, and directional impact across layers.
- Generate implementation and deployment handoffs without executing them.

# Acceptance outcomes

- A Decision can appear in Product, System, and Code Design without becoming three decisions.
- A user can work on Visual Design while Product questions remain open.
- Business and Product present structured documents; Visual Design presents visual foundations and component stories; technical layers use topology, architecture, contract, or handoff views appropriate to their purpose.
- The agent's questions and validation reflect the selected definition layer.
- Upstream changes flag dependent deeper knowledge; internal deeper changes do not rewrite upstream contracts.
