---
type: Domain Model
title: Product Knowledge Graph Model
description: The canonical concepts and typed relationships that represent a product in M21.
tags: [domain-model, graph, concepts, relationships]
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
- **Definition Area:** exactly one primary ownership area for migrated M21 concepts; legacy layer membership remains readable during migration
- **Tags:** cross-cutting categorization
- **Owners:** people or teams accountable for review
- **Extension metadata:** producer-defined values preserved losslessly
- **Linked artifacts:** validated revision-bearing bundle-local sources for concepts whose accepted area schema requires executable or media content

The controlled Business profile recognizes Mission, Vision, Business Problem, Stakeholder, Business Role, Persona, Persona Goal, Business Need, Business Outcome, Success Metric, Business Capability, Market, Market Segment, Competitor, Market Sizing, Research Study, Research Finding, Evidence Source, Business Model, Revenue Model, Cost Model, Regulation, Business Constraint, Business Risk, and Business Decision. The controlled Business Solution profile recognizes Solution Proposition, Solution Option, Solution Outcome, Solution Measure, Solution Capability, Solution Behavior, Solution Policy, Human Service, Business Process, Policy Intervention, Digital Product, Physical Product, Partner Service, Solution Boundary, Solution Constraint, Solution Assumption, Solution Risk, and Solution Decision. The controlled Visual Design profile recognizes shared direction, visual foundations, themes, components, assets, accessibility rules, and decisions. Other Definition Areas retain their current profile until migrated.

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
- Replacement is expressed explicitly through relationships and rationale; removal and historical recovery belong to version control.
