---
type: Screen
title: Change Review
description: Review proposed graph mutations and their directional impact before canonical persistence.
tags: [screen, change, impact, review]
sdlc: [design, components, code-design, implementation, deployment]
design:
  section: screens
relationships:
  - type: realizes
    target: /experience/information-architecture/workspace.md
  - type: supports
    target: /experience/journeys/review-impact.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Regions

- Proposal summary and provenance
- Concept-level semantic diffs
- Added, changed, and removed relationships
- Impact findings grouped by confidence and owner
- Relevant decisions and constraints
- Accept, edit, reject, defer, and resolve controls

# Interaction rules

- Acceptance is explicit and scoped.
- Every impact finding exposes its reasoning path.
- Destructive changes require clear consequences.
- Users can accept part of a proposal while deferring the remainder.
- Color reinforces status but never carries status alone.
