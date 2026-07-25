---
type: Component
title: AI Orchestrator
description: Builds bounded project context, invokes replaceable model providers, and validates structured agent proposals.
tags: [architecture, component, ai, prompts]
status: active
sdlc: [components, implementation]
components:
  section: components
  kind: application-service
  group: intelligence
  layer: application
  visibility: internal
  features:
    - features/ai-guidance.feature
    - features/design-visual-language.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /architecture/systems/ai-guidance-boundary.md
  - type: realizes
    target: /agents/m21-agent.md
  - type: depends-on
    target: /architecture/components/graph-engine.md
  - type: depends-on
    target: /architecture/components/change-engine.md
---

# Responsibilities

- Select context for the focused concept and requested AI workflow
- Apply workflow-specific prompt contracts and structured output schemas
- Invoke a configured model-provider adapter
- Separate source evidence, user statements, inference, proposals, and open questions
- Validate proposed concepts and relationships before change assessment
- Return proposals without persisting them

# Provider boundary

Providers accept messages plus structured-output requirements and return model output plus provenance. Product behavior must not depend on one vendor's conversation or tool API.

# First vertical slice

A deterministic development provider exercises the proposal workflow in tests and without credentials. A production provider adapter may be configured separately; unavailable AI does not prevent direct graph work.
