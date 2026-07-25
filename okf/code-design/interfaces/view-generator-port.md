---
type: Code Interface
title: Generated View Port
description: Deterministic projection boundary producing disposable Markdown or HTML exclusively from accepted project snapshots.
tags: [code-design, interface, views, generation]
status: active
sdlc: [code-design, implementation]
code-design:
  section: interfaces
  kind: query-port
  namespace: project.views
  technology: [markdown, html]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/view-projector.md
  - type: depends-on
    target: /code-design/contracts/project-snapshot.md
---

# Operations

- Generate project summary for the complete project or one definition layer
- Generate standalone Design component preview from accepted theme and Component Stories
- Generate architecture and handoff projections as their contracts become accepted

# Invariants

- Equal accepted snapshots and options produce semantically equivalent output.
- Generated content never becomes canonical by being edited directly.
- Output identifies its accepted source where practical.
- Unaccepted proposals are excluded.
- HTML generation escapes project-authored values and constrains style-token interpolation.
