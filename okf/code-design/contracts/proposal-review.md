---
type: Code Contract
application-id: browser-workspace
title: Proposal Review Interaction Contract
description: User interaction state that keeps pending revisions visibly separate from accepted project knowledge until explicit acceptance.
tags: [code-design, contract, proposals, interaction]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: interaction-contract
  namespace: workspace.proposal-review
  technology: [accessible-ui]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/proposal-review-workspace.md
  - type: depends-on
    target: /code-design/contracts/change-proposal.md
---

# Presentation

The review identifies provenance, summary, target Concept, changed fields, and current proposal state. Impact findings show affected knowledge, reason, confidence, and relationship path.

# Actions

The user may inspect or accept a proposed change. Acceptance is disabled while processing and reports stale, invalid, or persistence failure without presenting proposed values as accepted.

# Invariants

- Proposal and accepted knowledge use distinct non-color indicators.
- AI provenance remains visible.
- No optimistic canonical update occurs before successful acceptance.
- Keyboard and assistive-technology users can inspect and accept the same information.
