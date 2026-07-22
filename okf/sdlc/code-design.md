---
type: Definition Layer
title: Code Design
short_title: Code Design
stage: code-design
order: 70
description: Define implementation-facing concepts, models, interfaces, patterns, contracts, and executable behavior for each application.
tags: [sdlc, code-design, models, interfaces, patterns, gherkin]
status: active
sdlc: [code-design]
relationships:
  - type: informed-by
    target: /sdlc/application.md
  - type: informed-by
    target: /sdlc/components.md
---

# Purpose

Produce a precise, technology-aware design that a coding agent can implement without forcing implementation details into higher-level product knowledge.

# Defines

- Domain concepts, value objects, states, and models
- Semantic interfaces, commands, queries, events, and failures
- Application patterns and dependency rules
- Data contracts and API contracts
- Error handling, concurrency, security, and operational design where relevant
- Gherkin features and executable acceptance scenarios
- Implementation constraints and deliberate technology decisions

# Agent posture

Apply regeneration-level precision, connect every public behavior to an accepted contract, challenge unnecessary abstraction, and separate durable design from current file or symbol trivia.

# Handoff

Code Design is the primary specification package for the external coding agent.
