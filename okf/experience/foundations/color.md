---
type: Design Foundation
title: Color System
description: Quiet neutral working surfaces with a restrained indigo accent and explicit semantic status colors.
tags: [design, color, tokens, visual-language]
status: active
sdlc: [design]
design:
  section: tokens
  platforms: [web, cross-platform]
  group: foundations
relationships:
  - type: part-of
    target: /experience/visual-language.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Color system

The palette creates a calm working studio rather than a bright dashboard. Warm neutrals carry most of the interface; indigo marks selection and primary action.

## Roles

- **Canvas:** warm neutral background that reduces glare.
- **Surface:** high-contrast reading and interaction plane.
- **Muted surface:** secondary regions and code-adjacent context.
- **Text and muted text:** durable reading contrast and hierarchy.
- **Accent:** selection, focus, and intentional primary actions.
- **Proposal:** unaccepted AI or human changes.
- **Warning and conflict:** actionable states, never decoration.
- **Success:** accepted or healthy state where a label also communicates meaning.

Raw values live in the active Visual Language theme map. Product components consume semantic roles and MUST NOT depend on palette position names such as `blue-500`.
