---
type: Specification
title: Business Solution Definition Area Profile
description: Normative M21 schema and projection rules for singularly owned socio-technical Solution knowledge.
tags: [okf, solution, definition-area, schema]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: metadata-profile
  visibility: public
relationships:
  - type: governs
    target: /sdlc/product.md
  - type: governs
    target: /architecture/components/definition-workspace.md
  - type: informed-by
    target: /profile/business-definition-area.md
---

# Ownership and boundary

A managed Business Solution concept has exactly one `area: solution` field and one `solution` mapping containing only `section`. It describes the complete socio-technical response and solution space without redefining Business meaning or choosing detailed experience, conceptual technical decomposition, Application topology, or implementation.

# Controlled schema

- `proposition`: Solution Proposition
- `options`: Solution Option
- `outcomes`: Solution Outcome, Solution Measure
- `capabilities`: Solution Capability
- `behaviors`: Solution Behavior, Solution Policy
- `delivery`: Human Service, Business Process, Policy Intervention, Digital Product, Physical Product, Partner Service
- `boundaries`: Solution Boundary, Solution Constraint
- `assumptions`: Solution Assumption
- `risks`: Solution Risk
- `decisions`: Solution Decision

Every concept also has non-empty title, description, status, and Markdown body. Unknown Solution namespace fields, invalid sections, mismatched types, and empty placeholders produce diagnostics while readable source remains available.

# Projection

The workspace groups cards by controlled section then type, filters by section, type, and status, and reveals body plus incoming and outgoing relationships on expansion. Connected Business concepts remain contextual. Candidate and rejected options remain visible without being presented as accepted truth. Human, process, policy, digital, physical, and partner delivery are equal first-class possibilities.
