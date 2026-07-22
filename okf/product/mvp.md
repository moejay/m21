---
type: Product Definition
title: M21 MVP
description: An OKF-native workspace for collaboratively defining, designing, architecting, and validating a product through a living graph.
tags: [mvp, product]
status: draft
sdlc: [design, system, application, components, code-design, implementation, deployment]
product:
  section: definition
relationships:
  - type: realizes
    target: /vision.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: constrained-by
    target: /constraints/mvp-boundary.md
---

# Promise

Starting with an idea or an existing partial product definition, M21 helps a user develop a coherent business, product, design, and architecture model. Users can enter anywhere, work non-linearly, understand dependencies and directional impact, and generate synchronized views from accepted knowledge.

# MVP capabilities

1. [SDLC definition flow](capabilities/lifecycle-workflows.md)
2. [OKF project workspace](capabilities/project-workspace.md)
3. [Non-linear knowledge graph](capabilities/knowledge-graph.md)
4. [AI-guided product discovery](capabilities/guided-discovery.md)
5. [Product definition](capabilities/product-definition.md)
6. [Integrated product design](capabilities/product-design.md)
7. [Progressive architecture](capabilities/architecture.md)
8. [Decision management](capabilities/decision-management.md)
9. [Change impact and review](capabilities/change-impact.md)
10. [Continuous graph validation](capabilities/graph-validation.md)
11. [Generated views](capabilities/generated-views.md)

The Business-to-Deployment definition flow is the primary way users orient and direct work. Concept types remain an independent knowledge taxonomy, and one concept may contribute to several layers. The [M21 agent](../agents/m21-agent.md) steers users toward sufficient evidence and coherence at the selected depth without forcing a linear wizard. M21 produces Implementation and Deployment handoffs but delegates their execution to external coding or delivery agents.

# End-to-end MVP outcome

A user can create an OKF project, express an idea, and collaborate with the agent until the graph contains enough connected knowledge to explain:

- The product's vision, goals, users, and success measures
- Its capabilities and product boundaries
- Its journeys, information structure, interaction model, visual direction, and accessibility constraints
- Its systems, applications, and major components
- Its code-design concepts, models, interfaces, patterns, and executable Gherkin behavior
- Its implementation and deployment handoff contracts
- Its important decisions, alternatives, risks, and constraints
- Which concepts depend on others and which changes remain unresolved

The user can then generate a product definition, design brief, visual-language and token exports, Storybook-compatible story handoff, architecture diagrams, ADRs, technical summaries, implementation package, deployment definition, and validation report from that graph.

# Delivery principle

Build the smallest complete vertical workflow first: create/open → model → relate → reason → review → validate → generate. Depth within each discipline can increase after the shared loop works.
