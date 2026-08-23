---
type: User Journey
title: Review a Change's Impact
description: An owner evaluates why another change may affect their knowledge and resolves the impact.
tags: [journey, collaboration, impact, review]
sdlc: [design, components, code-design, implementation, deployment]
design:
  section: journeys
relationships:
  - type: informed-by
    target: /experience/principles/user-control.md
---

# Trigger

An accepted or proposed change reaches a concept owned or watched by the reviewer through a meaningful dependency path.

# Flow

1. The reviewer sees the changed concept, semantic diff, impact path, explanation, and confidence.
2. They inspect relevant decisions, constraints, and neighboring knowledge.
3. They mark the dependent concept unaffected, revise it, accept known inconsistency, or leave follow-up unresolved.
4. M21 records the resolution and removes only the findings actually addressed.

# Success

The reviewer can act without reconstructing context from messages or receiving indiscriminate graph-wide alerts.
