---
type: Code Contract
application-id: project-service
title: Change Proposal Contract
description: Reviewable, revision-bound set of semantic operations with provenance and explainable impact findings.
tags: [code-design, contract, proposals, concurrency]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: stateful-contract
  namespace: change.proposal
  technology: [json]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/change-engine.md
  - type: constrained-by
    target: /domain/change-governance.md
  - type: constrained-by
    target: /domain/impact-semantics.md
---

# Data

A Change Proposal has stable identity, base project revision, summary, provenance, one or more bounded operations, impact findings, and lifecycle status.

# States

`proposed → accepted`

Future explicit rejection may terminate a proposal without mutation. An accepted, rejected, or stale proposal cannot be accepted again.

# Invariants

- Every operation names its target Concept and change kind.
- AI provenance never grants acceptance.
- Acceptance compares the base revision with the current project revision.
- Stale proposals fail without partial persistence.
- Impact findings record affected Concept, reason, relationship semantics, confidence, and path.
- Proposal acceptance is atomic from the user's perspective.
