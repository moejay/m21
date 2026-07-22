---
type: Design System
title: M21 Design System
description: Shared interaction and presentation patterns for navigating knowledge, working with AI, and reviewing change.
tags: [design-system, ui-components, patterns]
status: draft
sdlc: [design, application, components, code-design, implementation]
design:
  section: components-and-patterns
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

The same concept status, relationship meaning, proposal state, and impact severity must look and behave consistently in graph, list, inspector, agent, and review contexts.

# Generated catalog and implementation stance

The design system begins as knowledge and interaction contracts. M21 may generate a browsable component-story catalog and Storybook-compatible handoff describing variants, states, tokens, accessibility, and expected behavior. A coding agent implements production components and stories.

Reusable interface components realize the design system, and generated token exports may feed implementation, but current source-code component structure is not canonical product knowledge.
