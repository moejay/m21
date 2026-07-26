---
type: AI Workflow
title: Assess Semantic Change Impact
description: Enrich deterministic dependency findings when concept meaning requires contextual judgment.
tags: [ai, prompt-contract, impact, review]
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: part-of
    target: /agents/m21-agent.md
  - type: supports
    target: /product/capabilities/change-impact.md
  - type: constrained-by
    target: /domain/impact-semantics.md
  - type: addresses
    target: /risks/false-impact-propagation.md
---

# Inputs

- Semantic before-and-after change
- Declared change kind
- Deterministic relationship paths and policy results
- Candidate dependent concepts
- Applicable decisions, constraints, risks, owners, and previous resolutions

# Reasoning behavior

For each candidate, determine whether changed meaning can alter the promise represented by the relationship. Prefer no finding over an unsupported possibility. Never infer impact solely from graph distance.

# Structured result

Each finding contains:

- Affected concept ID
- Relationship path
- Changed meaning that matters
- Specific reason review may be required
- Confidence: definite, likely, or possible
- Suggested reviewer
- Suggested review question

It may also return “no semantic impact” with a concise rationale.

# Guardrails

- Every finding must cite an explicit path and semantic reason.
- Possible findings do not recursively fan out.
- Internal realization changes do not affect upstream intent while contracts remain satisfied.
- AI findings remain proposals and cannot resolve review on behalf of an owner.
