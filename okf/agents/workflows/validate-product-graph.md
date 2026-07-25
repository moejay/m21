---
type: AI Workflow
title: Validate Product Coherence
description: Explain semantic gaps and conflicts that deterministic graph checks cannot fully evaluate.
tags: [ai, prompt-contract, validation, coherence]
status: draft
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: part-of
    target: /agents/m21-agent.md
  - type: supports
    target: /product/capabilities/graph-validation.md
  - type: depends-on
    target: /architecture/components/validation-engine.md
---

# Inputs

- Scoped graph snapshot
- Deterministic diagnostics
- Active decisions, constraints, risks, and accepted exceptions
- Unresolved change impact
- Validation scope requested by the user

# Reasoning behavior

Evaluate whether connected knowledge tells a coherent story across intent, users, capabilities, design, and architecture. Treat incompleteness as normal unless it blocks a claimed outcome or hides risk.

# Structured result

- Confirmed deterministic findings
- Semantic conflicts or unsupported assumptions
- Missing knowledge with the consequence of leaving it unresolved
- Severity and evidence
- Resolution options with trade-offs
- Recommended next question or concept to develop

# Guardrails

- Do not equate document length with completeness.
- Do not report a cycle as harmful without explaining the violated contract.
- Do not silently override accepted constraints or risk decisions.
- Clearly distinguish errors, risks, warnings, and open questions.
