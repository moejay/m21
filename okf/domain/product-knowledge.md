---
type: Domain Model
title: Product Knowledge Graph Model
description: The canonical concepts and typed relationships that represent a product in M21.
tags: [domain-model, graph, concepts, relationships]
status: draft
sdlc: [components, code-design, implementation]
relationships:
  - type: governs
    target: /product/capabilities/knowledge-graph.md
  - type: informed-by
    target: /profile.md
---

# Concept

A Concept is one independently addressable unit of accepted or proposed product knowledge.

- **Identity:** stable OKF concept ID derived from its bundle-relative path
- **Type:** open, descriptive concept type used for routing, validation, and presentation
- **Title and description:** concise human orientation
- **Body:** structured Markdown carrying the concept's domain knowledge
- **Status:** draft, active, superseded, or retired
- **Tags:** cross-cutting categorization
- **Owners:** people or teams accountable for review
- **Extension metadata:** producer-defined values preserved losslessly

The initial product profile recognizes Project, Vision, Definition Layer, Business Problem, Business Goal, Business Capability, Success Metric, Persona, Product Capability, Experience Principle, User Journey, Information Architecture, Screen, Visual Language, Design System, UI Pattern, UI Component, System, Application, Component, Decision, Constraint, Risk, AI Agent, Change Set, Impact Assessment, and Generated View.

# Typed relationship

A Typed Relationship connects one source Concept to one target Concept.

- Relationship type
- Source and target concept IDs
- Optional rationale
- Optional evidence

Relationship identity is the tuple of source, type, and target unless a future module requires multiple qualified relationships of the same type.

# Graph

A Product Graph is the set of valid Concepts and Typed Relationships in one project bundle. Directory hierarchy aids navigation but does not define semantic parentage. Markdown links provide portable traversal; typed relationships provide deterministic reasoning.

# Invariants

- Every persisted concept is valid, readable OKF.
- Unknown concept types and extension metadata remain usable and round-trip intact.
- A missing relationship target is diagnosable but does not make the rest of the bundle unreadable.
- Generated views do not become canonical concepts merely by being generated.
- Retired and superseded knowledge remains available to history and decision reasoning.
