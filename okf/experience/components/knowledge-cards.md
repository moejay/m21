---
type: Component Story
title: Knowledge Cards
description: Expandable concept cards present orientation first and reveal the complete canonical document on demand.
tags: [design-system, component-story, knowledge]
status: active
sdlc: [design]
design:
  section: components
  platforms: [web]
  group: knowledge
  preview:
    kind: knowledge-cards
    variants: [collapsed, expanded, proposed]
relationships:
  - type: part-of
    target: /experience/design-system.md
  - type: informed-by
    target: /experience/principles/connected-context.md
---

# Knowledge cards

A collapsed card provides type, title, and one-sentence orientation. Expansion reveals the canonical document without moving the reader into a detached inspector.

Proposal state is explicit and cannot be confused with accepted knowledge. Cards should not become a generic dashboard tile: their structure follows the concept and the purpose of its definition layer.
