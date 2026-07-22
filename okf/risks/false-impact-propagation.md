---
type: Risk
title: False Impact Propagation
description: Overly broad dependency traversal could flood users with irrelevant review work and destroy trust in change analysis.
tags: [risk, impact, dependencies, trust]
status: active
sdlc: [system, application, components, code-design, implementation]
relationships:
  - type: informed-by
    target: /profile.md
---

# Risk

A naive graph engine may mark every transitively connected concept as affected by every change. Because product knowledge is densely connected, this would make impact analysis noisy and encourage users to ignore it.

# Causes

- Treating every relationship as equivalent
- Ignoring direction and changed fields
- Confusing traceability with dependency
- Failing to distinguish internal implementation changes from contract changes
- Applying unlimited transitive propagation
- Reporting possibilities without confidence or rationale

# Mitigation

- Define relationship-specific impact semantics
- Compare meaning and contract surface, not only node timestamps
- Require every impact finding to explain its path and reason
- Bound automatic traversal and let AI assess ambiguous semantic impact
- Capture dismissals and reviewer decisions as feedback
- Measure usefulness through accepted, dismissed, and missed impact findings

# Early validation

During manual dogfooding, record representative changes at each layer and write the impact that knowledgeable humans expect. These examples should become executable Gherkin scenarios before implementing the impact engine.
