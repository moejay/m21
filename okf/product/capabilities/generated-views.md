---
type: Product Capability
title: Generated Views
description: Project canonical graph knowledge into synchronized documents, diagrams, and reports.
tags: [mvp, documents, diagrams, generation]
status: draft
sdlc: [product, components, code-design, implementation, deployment]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
  - type: depends-on
    target: /product/capabilities/project-workspace.md
  - type: depends-on
    target: /product/capabilities/knowledge-graph.md
---

# User outcome

A user can communicate the product to different audiences without manually maintaining parallel sources of truth.

# MVP views

- Business and product definition
- Experience and design brief
- Journey and task-flow diagrams
- Information-architecture map
- Visual-language and design-system guide
- Design-token and Storybook-compatible story handoff
- Product-wide interactive 3D knowledge graph containing all accepted concepts and resolved typed relationships
- Architecture context and dependency diagrams
- Architecture Decision Records
- Technical design summary
- Coding-agent implementation package
- Deployment definition and delivery-agent package
- Validation and unresolved-impact report
- Markdown project summary

# Rules

Views are reproducible projections of accepted graph knowledge. They are not independently editable canonical artifacts. A requested content change must be made to the underlying concepts or relationships and then regenerated.

Generated output identifies its source concepts and generation time where appropriate.

# Acceptance outcomes

- Regenerating without a graph change produces equivalent output.
- A graph change is reflected in every affected view.
- Generated documents preserve traceability back to canonical concepts.
