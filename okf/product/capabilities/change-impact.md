---
type: Product Capability
title: Change Impact and Review
description: Explain the directional consequences of proposed changes and involve owners of affected knowledge.
tags: [mvp, impact, review, collaboration]
status: draft
sdlc: [product, components, code-design, implementation, deployment]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/capabilities/cross-disciplinary-impact.md
  - type: depends-on
    target: /product/capabilities/knowledge-graph.md
  - type: depends-on
    target: /product/capabilities/decision-management.md
  - type: addresses
    target: /risks/false-impact-propagation.md
---

# User outcome

People can change one part of a product while understanding which other concepts may need attention, why they may be affected, and who should review them.

# MVP workflow

1. A user proposes a change to one or more concepts.
2. M21 evaluates relationship meaning, changed fields, decisions, and constraints.
3. It produces a reviewable change set and impact assessment.
4. Owners see potentially affected concepts with an explanation and confidence.
5. Reviewers accept, revise, dismiss, or leave each impact unresolved.
6. Accepted knowledge is persisted with attribution and history.

# Directionality

- Business changes may require review across product, design, and architecture.
- Product changes may affect design and architecture without changing business intent.
- Design changes may affect screens, UI components, and application surfaces while leaving product goals intact.
- Internal architecture changes remain local when they preserve upstream contracts.

# Boundary

This is graph governance, not general project management. The MVP does not provide sprints, tickets, workload planning, or real-time multiplayer editing.

# Acceptance outcomes

- Every reported impact includes a traceable reason.
- Potential impact does not silently mutate dependent concepts.
- Users can dismiss false impact and preserve that resolution.
- Ownership gaps and unresolved reviews remain visible.
