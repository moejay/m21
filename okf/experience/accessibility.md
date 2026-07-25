---
type: Accessibility Constraint
title: Accessible Knowledge Navigation
description: Core graph and AI workflows must remain understandable and operable without vision, color perception, pointer precision, or motion.
tags: [accessibility, inclusive-design, constraint]
status: active
sdlc: [design, components, code-design, implementation]
design:
  section: accessibility
relationships:
  - type: governs
    target: /experience/screens/graph-workspace.md
  - type: governs
    target: /experience/screens/change-review.md
  - type: governs
    target: /experience/design-system.md
---

# Requirements

- Meet WCAG 2.2 AA for supported web workflows.
- Every graph concept and relationship is reachable through an equivalent structured list or neighborhood view.
- Full core operation is available by keyboard with visible focus.
- Status and relationship types never depend on color alone.
- Panels, dialogs, and proposals expose meaningful names, roles, and reading order.
- Zoom and text scaling do not hide required actions.
- Motion respects reduced-motion preferences.
- AI questions, diagnostics, and impact explanations use clear language and structured headings.

# Validation

Accessibility is checked in design review, executable behavior where automatable, and evidence-backed manual review for graph comprehension and assistive technology behavior.
