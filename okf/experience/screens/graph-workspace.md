---
type: Screen
title: Graph Workspace
description: The primary screen for navigating concepts, focusing context, and working with the M21 agent.
tags: [screen, graph, workspace]
status: draft
sdlc: [design, application, components, code-design, implementation]
design:
  section: screens
relationships:
  - type: realizes
    target: /experience/information-architecture/workspace.md
  - type: supports
    target: /experience/journeys/work-anywhere.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Regions

- SDLC definition rail showing layer scope and concept counts
- Compact project header with project status and unresolved-attention count
- Searchable and filterable navigator
- Main graph canvas with readable relationship direction
- Focus inspector for the selected concept
- Contextual agent panel that can be opened without replacing the graph

# Key states

- Empty project orientation
- No selection
- Focused concept
- Editing canonical content
- AI proposal awaiting review
- Validation or impact attention
- Read-only generated view

# Interaction priorities

Focus and relationships must remain understandable without relying on graph position alone. Keyboard and list navigation provide equivalent access to every graph action.
