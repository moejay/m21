---
type: Definition Layer
title: Code Design
short_title: Code Design
stage: code-design
order: 80
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
- Component-owned Gherkin feature files and executable acceptance scenarios that become the primary implementation test contract
- Implementation constraints and deliberate technology decisions

# Workspace projection

Code Design remains scoped to the selected Application and includes models, semantic interfaces, stateful contracts, dependency rules, failure models, and executable behavior owned through its Component and Application relationship chains. Public behavior requires an explicit contract, dependencies on infrastructure and providers use ports, and contracts describe durable semantics rather than current files or symbols. Cross-Application contracts appear only as dependencies or contextual references unless deliberately shared.

# Agent posture

Apply regeneration-level precision, connect every public behavior to an accepted contract, challenge unnecessary abstraction, and separate durable design from current file or symbol trivia.

# Handoff

Code Design is the primary specification package for the external coding agent.
