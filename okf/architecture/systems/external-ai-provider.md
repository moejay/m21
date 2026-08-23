---
type: External Dependency
title: Configured AI Model Provider
description: A replaceable external inference service that returns structured suggestions from bounded context supplied by M21.
tags: [architecture, system, external, ai]
area: system
system:
  section: dependencies
  boundary: external
relationships:
  - type: supports
    target: /architecture/systems/ai-guidance-boundary.md
---

# Role

Perform language-model inference for discovery, challenge, synthesis, and proposal generation.

# Contract

M21 sends bounded accepted context and expects structured output. The provider does not receive filesystem authority and cannot write canonical product knowledge.

# Failure posture

Provider unavailability disables AI assistance but must not prevent local reading, editing, validation, or generated views. Malformed output is rejected before proposal creation.
