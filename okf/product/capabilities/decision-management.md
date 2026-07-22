---
type: Product Capability
title: Decision Management
description: Preserve significant product, design, and architecture decisions as connected knowledge.
tags: [mvp, decisions, adr, rationale]
status: draft
sdlc: [product, design, system, application, components, code-design, implementation, deployment]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
  - type: supports
    target: /product/capabilities/product-definition.md
  - type: supports
    target: /product/capabilities/product-design.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# User outcome

A user can understand not only what was chosen, but why it was chosen and which parts of the product the decision governs.

# Decision knowledge

- Status
- Context and decision question
- Considered alternatives
- Chosen direction
- Rationale and supporting evidence
- Positive and negative consequences
- Related goals, capabilities, designs, architecture, constraints, and risks
- Superseding or dependent decisions

# Acceptance outcomes

- A significant decision can be inspected from every concept it governs.
- Conflicting active decisions are detectable.
- Superseding a decision preserves history and triggers impact assessment.
- ADR documents are generated from decision concepts rather than maintained separately.
