---
type: Screen
title: Graph Workspace
description: An alternate full-workspace presentation for navigating scoped concepts, focusing relationships, and working with the M21 agent.
tags: [screen, graph, workspace]
status: draft
sdlc: [design, components, code-design, implementation]
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

# Entry and exit

A quiet action in the workspace's top-right corner opens the relationship graph for the active layer. The graph is a completely separate presentation, not a diagram inserted among canonical documents. Its reciprocal action restores the layer's purpose-built workspace. Both actions preserve definition scope, selected Application, and focused Concept.

# Regions

- SDLC definition rail showing layer scope and concept counts
- Compact project header with project status and unresolved-attention count
- Quiet control to restore the purpose-built workspace
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
