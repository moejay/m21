---
type: System Responsibility
title: AI Guidance Boundary
description: Provider-neutral orchestration that assembles accepted context and converts model output into bounded reviewable proposals.
tags: [architecture, system, ai, orchestration]
area: system
system:
  section: responsibilities
  boundary: owned
relationships:
  - type: part-of
    target: /architecture/systems/m21-workspace.md
  - type: depends-on
    target: /architecture/systems/product-knowledge-runtime.md
  - type: depends-on
    target: /architecture/systems/external-ai-provider.md
  - type: constrained-by
    target: /experience/principles/user-control.md
---

# Responsibility

Use accepted project context to help develop product knowledge while keeping all canonical change under explicit user control.

# System behavior

- Build bounded context from focus, relationships, layer, decisions, and constraints.
- Send provider-neutral structured requests.
- Validate supported response shapes.
- Create proposals rather than direct writes.
- Keep provider failures outside the canonical graph.

# Trust boundary

Prompt context crosses into the configured model provider. M21 must make this boundary visible, minimize disclosed content, and never treat model output as accepted evidence or knowledge.
