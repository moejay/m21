---
type: Specification
title: Business Definition Area Profile
description: Normative M21 schema and projection rules for singularly owned Business knowledge.
tags: [okf, business, definition-area, schema]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: metadata-profile
  visibility: public
relationships:
  - type: governs
    target: /sdlc/business.md
  - type: governs
    target: /architecture/components/definition-workspace.md
  - type: informed-by
    target: /profile.md
---

# Ownership

A managed Business concept has exactly one `area: business` field and one `business` mapping containing only `section`. Business is the first Definition Area migrated from legacy many-to-many `sdlc` membership; unmigrated areas may retain legacy metadata during the transition.

# Controlled schema

Valid sections and types are:

- `direction`: Mission, Vision
- `problems`: Business Problem
- `people`: Stakeholder, Business Role, Persona, Persona Goal, Business Need
- `outcomes`: Business Outcome, Success Metric
- `capabilities`: Business Capability
- `market`: Market, Market Segment, Competitor, Market Sizing
- `research`: Research Study, Research Finding, Evidence Source
- `economics`: Business Model, Revenue Model, Cost Model
- `governance`: Regulation, Business Constraint
- `risks`: Business Risk
- `decisions`: Business Decision

Every concept also has non-empty title, description, status, and Markdown body. Unknown Business namespace fields, invalid sections, mismatched types, and empty placeholders produce diagnostics while readable source remains available.

# Relationships

Typed relationships use a non-empty type and an absolute bundle-relative Markdown target. Rationale is optional text; evidence is an optional list of absolute bundle-relative Markdown concept paths. Duplicate source/type/target tuples and malformed relationship values are diagnostic rather than silently projected.

# Projection

The Business workspace groups cards first by controlled section and then type, filters by section, type, and status, and reveals body plus incoming and outgoing relationships on expansion. Connected concepts from other areas remain contextual and retain their own ownership. The global graph retains `area` so Business can be highlighted without removing other knowledge.
