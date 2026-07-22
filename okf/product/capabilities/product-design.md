---
type: Product Capability
title: Integrated Product Design
description: Develop experience, interaction, and visual design as connected product knowledge rather than a detached handoff.
tags: [mvp, ux, ui, visual-language, accessibility]
status: draft
sdlc: [product, design, application, components, code-design, implementation]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: informed-by
    target: /product/capabilities/product-definition.md
  - type: serves
    target: /people/product-builder.md
  - type: serves
    target: /people/product-team.md
---

# User outcome

A user can shape how people understand and use the product while seeing the product assumptions, capabilities, technical dependencies, and constraints that influence the design.

# MVP design knowledge

- Experience principles
- User journeys, scenarios, and task flows
- Information architecture and navigation
- Screens, views, states, and key content
- Interaction patterns and behavior
- Visual language, including typography, color, spacing, iconography, and tone
- Design tokens
- Design-system patterns and UI components
- Component stories and states suitable for a generated catalog or Storybook handoff
- Accessibility requirements and inclusive-design constraints
- Design decisions, alternatives, evidence, and open questions

# MVP workflow

Users may begin from a persona, journey, capability, screen, visual direction, or UI component. The workspace traces these concepts rather than requiring one design sequence. Design discoveries may expose missing product knowledge; product changes may flag journeys, screens, patterns, and components for review.

# Generated design views

- Experience brief
- Journey and flow diagrams
- Information-architecture map
- Screen inventory
- Visual-language guide
- Design-token export
- Project workspace theme preview derived from safe semantic tokens
- Pattern and component inventory
- Storybook-compatible component-story handoff
- Accessibility review

# Boundary

The MVP manages design intent, systems, relationships, review, generated token artifacts, and component-story handoffs. It does not replace a high-fidelity visual design canvas or implement production UI components. External design resources may be linked as evidence or realizations.

# Acceptance outcomes

- A journey traces to personas, needs, and capabilities.
- A screen traces to the journey steps and capabilities it supports.
- UI components trace to patterns, visual language, accessibility constraints, and application surfaces.
- A change to a product capability identifies relevant design concepts without marking unrelated design as stale.
