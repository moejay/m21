---
type: Screen
title: Global Knowledge Graph
description: A global interactive 3D view of every accepted OKF concept and resolved typed relationship.
tags: [screen, graph, workspace]
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

A global workspace action opens the graph from any definition layer or selected Application. The graph always uses the complete accepted Project Snapshot rather than the current scoped projection. Closing it restores the remembered purpose-built workspace, active layer, and selected Application.

# Regions

- Dark full-workspace 3D canvas containing every accepted concept and resolved typed relationship
- Product identity, source revision, concept count, and relationship count
- Color legend for definition-layer membership
- Search and focus controls that never hide knowledge by default
- Focus panel for the selected canonical concept and its incoming and outgoing relationships
- Navigation guidance for rotate, zoom, pan, and node selection
- Close control that restores the remembered workspace

# Key states

- Empty project orientation
- Complete graph at rest
- Rotating, panning, or zooming
- Hovered concept label
- Focused concept and relationship context
- WebGL-unavailable fallback

# Interaction priorities

The spatial layout uses depth and definition-layer bands to reveal connected structure without assigning canonical meaning to coordinates. Nodes remain selectable and labeled on focus. Focus details and relationship lists provide a non-spatial equivalent for understanding the selected concept. Graph interaction never edits canonical knowledge.
