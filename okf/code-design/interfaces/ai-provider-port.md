---
type: Code Interface
application-id: project-service
title: AI Provider Port
description: Replaceable inference boundary accepting bounded accepted context and returning one structured suggestion without persistence authority.
tags: [code-design, interface, ai, port]
sdlc: [code-design, implementation]
code-design:
  section: interfaces
  kind: outbound-port
  namespace: ai.provider
  technology: [structured-json]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/ai-orchestrator.md
  - type: constrained-by
    target: /agents/m21-agent.md
---

# Request

- User instruction
- Focused accepted Concept
- Bounded accepted context Concepts
- Optional selected definition layer
- Expected structured proposal schema

# Response

A summary and supported complete Concept revision fields. The response is untrusted input until shape validation succeeds and a reviewable Change Proposal is created.

# Failures

- Provider unavailable or unauthorized
- Empty response
- Invalid structured output
- Unsupported revision fields
- Legacy Visual Design metadata or direct linked-artifact mutation outside an accepted proposal contract

# Invariants

Provider choice does not alter canonical proposal semantics. Provider errors never mutate project knowledge, and credentials remain outside browser-visible state.
