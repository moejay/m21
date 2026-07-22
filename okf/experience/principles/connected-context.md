---
type: Experience Principle
title: Context Before Output
description: Show how knowledge connects and why guidance matters before producing more artifacts.
tags: [experience, context, ai]
status: draft
sdlc: [design, system, application, components, code-design]
design:
  section: principles
relationships:
  - type: part-of
    target: /product/capabilities/product-design.md
  - type: supports
    target: /product/capabilities/guided-discovery.md
---

# Principle

M21 should orient users in the relevant neighborhood of the product graph before asking questions or proposing content. Guidance explains the relationship to goals, users, design, architecture, decisions, and unresolved change.

# Implications

- Focus views show nearby context without exposing the entire graph at once.
- AI questions state why they matter.
- Generated output links back to source concepts.
- Empty states teach the model through useful next actions rather than generic instructions.
