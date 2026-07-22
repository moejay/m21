---
type: Product Capability
title: AI-Guided Product Discovery
description: Develop an incomplete idea through contextual questions, challenges, explanations, and proposed graph changes.
tags: [mvp, ai, discovery, coaching]
status: draft
sdlc: [product, design, system, application]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: depends-on
    target: /product/capabilities/knowledge-graph.md
  - type: supports
    target: /product/capabilities/product-definition.md
  - type: supports
    target: /product/capabilities/product-design.md
  - type: supports
    target: /product/capabilities/architecture.md
---

# User outcome

A user can bring a vague idea or a partially developed concept and receive experienced, context-aware help without surrendering decision authority.

# MVP behavior

- Ask the highest-value clarifying questions for the user's current focus
- Explain why a question matters and which knowledge it may affect
- Challenge assumptions and identify missing concepts
- Offer alternatives and explain trade-offs
- Propose new or revised concepts and relationships as a reviewable change set
- Persist only changes the user accepts
- Resume from existing project knowledge rather than restarting discovery

# Acceptance outcomes

- The agent adapts to the graph rather than following one fixed questionnaire.
- The user can redirect the conversation to any layer.
- AI output does not become canonical merely because it was generated.
