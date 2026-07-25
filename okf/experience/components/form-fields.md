---
type: Component Story
title: Form Fields
description: Labeled text, selection, and instruction controls support deliberate editing and AI guidance.
tags: [design-system, component-story, forms]
status: active
sdlc: [design]
design:
  section: components
  platforms: [web]
  group: controls
  preview:
    kind: form-fields
    variants: [text, select, textarea, error]
relationships:
  - type: part-of
    target: /experience/design-system.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Form fields

Labels remain visible after entry. Supporting text explains format or consequence, while errors identify both the problem and the recovery action.

Inputs inherit the project typography, surface, border, radius, and focus tokens. Placeholder text is supplementary and never replaces a label.
