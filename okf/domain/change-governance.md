---
type: Domain Model
title: Change Governance Model
description: Proposals, impact findings, reviews, and acceptance that protect canonical product knowledge.
tags: [domain-model, change, impact, review]
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: informed-by
    target: /experience/journeys/review-impact.md
  - type: informed-by
    target: /experience/principles/user-control.md
---

# Change set

A Change Set is a reviewable proposal containing one or more graph operations.

- Stable identity
- Proposer and provenance: user, imported source, or AI workflow
- Purpose and summary
- Proposed timestamp
- Status: proposed, partially accepted, accepted, rejected, or superseded
- Operations
- Impact assessment
- Acceptance attribution

# Graph operation

An operation adds, revises, retires, or restores a Concept or Typed Relationship. Revisions retain enough before-and-after meaning to explain the semantic change.

# Impact assessment

An Impact Assessment evaluates a Change Set against the current graph, decisions, and constraints. It contains zero or more Impact Findings and records when and against which graph state it was produced.

# Impact finding

- Potentially affected concept
- Relationship path connecting it to the change
- Human-readable reason
- Confidence: definite, likely, or possible
- Severity based on consequence, not graph distance
- Responsible owners or unresolved ownership
- Resolution: unresolved, unaffected, updated, accepted risk, or superseded
- Reviewer and rationale

# Diagnostic

A Diagnostic reports existing graph quality independently of a proposed change. It has severity, evidence, affected concepts, and suggested resolution options.

# Invariants

- Proposed operations do not mutate canonical knowledge.
- Acceptance is explicit and attributable.
- Every impact finding has an explainable path and reason.
- Dismissing one finding does not hide unrelated findings.
- Reassessment makes stale findings visible rather than silently treating them as current.
