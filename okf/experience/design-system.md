---
type: Visual Design Decision
title: M21 Design System
description: Shared interaction and presentation patterns for navigating knowledge, working with AI, and reviewing change.
tags: [design-system, ui-components, patterns]
area: visual-design
visual-design:
  section: decisions
relationships:
  - type: informed-by
    target: /experience/visual-language.md
  - type: constrained-by
    target: /experience/accessibility.md
  - type: supports
    target: /experience/screens/graph-workspace.md
  - type: supports
    target: /experience/screens/change-review.md
---

# Initial patterns and components

- Concept type marker
- Concept card and compact result row
- Relationship label and directional edge
- Graph node and focused neighborhood
- Knowledge inspector section
- Agent question and recommendation
- Structured graph-change proposal
- Semantic diff
- Impact finding with path and confidence
- Ownership and review status
- Validation diagnostic
- Empty-state next direction
- Generated-view source reference

# Behavioral consistency

The same accepted-concept meaning, relationship meaning, proposal state, and impact severity must look and behave consistently in graph, list, inspector, agent, and review contexts.

# Decision

Shared visual states and variants stay in one Visual Component concept and its linked HTML/CSS specimen. The catalog renders accepted sources in isolation; it is not a production component registry.

# Generated catalog and implementation stance

The visual component system begins as shared appearance contracts. M21 generates a browsable catalog from accepted linked sources. A coding agent may implement production components in any technology while preserving the accepted visual contract.

Application behavior and interaction contracts remain outside Visual Design. Current source-code component structure is not canonical product knowledge.
