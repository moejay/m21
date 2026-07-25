---
type: AI Workflow
title: Develop a Focused Concept
description: Help a user clarify, challenge, and connect one concept without losing relevant product context.
tags: [ai, prompt-contract, discovery, coaching]
status: draft
sdlc: [components, code-design]
relationships:
  - type: part-of
    target: /agents/m21-agent.md
  - type: supports
    target: /product/capabilities/guided-discovery.md
  - type: informed-by
    target: /experience/principles/connected-context.md
  - type: constrained-by
    target: /experience/principles/user-control.md
---

# Inputs

- Selected SDLC definition layer, its purpose, key questions, evidence expectations, and agent posture
- Focused concept and requested mode: discover, develop, or challenge
- Immediate typed neighborhood
- Relevant goals, personas, decisions, constraints, risks, and unresolved diagnostics
- Recent accepted changes and unresolved impact
- User instruction and any new user-stated facts

# Reasoning behavior

1. State the material uncertainty or decision at hand.
2. Distinguish accepted knowledge from inference and open questions.
3. Ask at most one high-value question when an answer would materially change the proposal.
4. Otherwise offer concise alternatives and trade-offs.
5. Propose the smallest coherent concept and relationship changes.
6. Identify likely impact without expanding every transitive path.

# Structured result

- Orientation summary
- Question, if needed, with why it matters
- Findings and assumptions
- Proposed graph operations
- Open questions
- Suggested impact paths
- Sources or evidence used

# Guardrails

- Do not invent user research, business evidence, technical constraints, or decisions.
- Do not rewrite unrelated concepts for stylistic consistency.
- Do not persist changes.
- Preserve meaningful uncertainty.
