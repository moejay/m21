---
type: Product Capability
title: Non-Linear Knowledge Graph
description: Explore and evolve connected product knowledge from any point without following a mandatory sequence.
tags: [mvp, graph, navigation, traceability]
status: draft
sdlc: [product, design, system, application, components, code-design, implementation, deployment]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
  - type: depends-on
    target: /product/capabilities/project-workspace.md
  - type: serves
    target: /people/product-builder.md
  - type: serves
    target: /people/product-team.md
---

# User outcome

A user can begin with a business goal, journey, screen, capability, decision, system, or other concept and immediately understand its context and dependencies.

# MVP behavior

- Present typed concepts and directional relationships as an interactive graph
- Filter and navigate by layer, type, ownership, status, and relationship
- Reveal a selected concept's description, rationale, dependencies, dependents, decisions, constraints, risks, recommendations, and history
- Create and revise concepts and relationships without requiring completion of earlier layers
- Distinguish hard dependencies from informative or traceability relationships
- Preserve current working context as the graph changes

# Acceptance outcomes

- A user can work directly on a design or architecture concept before the entire product definition is complete.
- The graph shows what the concept relies on and what may rely on it.
- Navigation does not imply that product development is a waterfall.
