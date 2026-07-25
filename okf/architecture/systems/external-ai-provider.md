---
type: External System
title: Configured AI Model Provider
description: A replaceable external inference service that returns structured suggestions from bounded context supplied by M21.
tags: [architecture, system, external, ai]
status: active
sdlc: [system]
system:
  kind: external-system
  group: external-services
  boundary: external
  criticality: medium
relationships:
  - type: supports
    target: /architecture/systems/ai-guidance-boundary.md
  - type: constrained-by
    target: /business/regulatory-context.md
---

# Role

Perform language-model inference for discovery, challenge, synthesis, and proposal generation.

# Contract

M21 sends bounded accepted context and expects structured output. The provider does not receive filesystem authority and cannot write canonical product knowledge.

# Failure posture

Provider unavailability disables AI assistance but must not prevent local reading, editing, validation, or generated views. Malformed output is rejected before proposal creation.
