---
type: Experience Principle
title: User-Controlled Canonical Knowledge
description: AI recommendations remain proposals until a person accepts them into the product model.
tags: [experience, trust, ai, review]
sdlc: [design, components, code-design, implementation, deployment]
design:
  section: principles
relationships:
  - type: supports
    target: /agents/m21-agent.md
  - type: supports
    target: /product/capabilities/change-impact.md
---

# Principle

M21 distinguishes user statements, sourced facts, accepted decisions, AI inference, and open questions. AI may accelerate reasoning but never hides a canonical mutation inside conversational prose.

# Implications

- Proposed changes are visible before acceptance.
- Users may accept, edit, reject, or defer each proposal.
- Impact is assessed before persistence.
- History identifies who or what proposed and accepted a change.
