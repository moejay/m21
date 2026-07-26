---
name: business-definition-area
description: Accepted Business Definition Area schema, relationships, validation, and purpose-built workspace contract.
group: product-definition
tags: [okf, business, definition-area, schema]
depends_on: []
---

# Business Definition Area

This contract implements the accepted Business model in `m21-spec/business.md`. It supersedes the Business-specific `sdlc` membership, section vocabulary, and optional metadata in `product-definition-workflow` while other areas migrate incrementally.

## Data model

A Business concept defines why change is needed and the environment in which a response must succeed. It has singular ownership through `area: business`, exactly one `business.section`, one controlled type allowed in that section, concise common orientation fields, and meaningful Markdown body content.

```m21-model
entities:
  BusinessMetadata:
    fields:
      section:
        type: enum
        values: [direction, problems, people, outcomes, capabilities, market, research, economics, governance, risks, decisions]
        required: true
  BusinessConcept:
    fields:
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      area: { type: enum, values: [business], required: true }
      business: { type: object, required: true }
      relationships: { type: array, items: object }
      body: { type: string, required: true }
```

The Business namespace is closed: `section` is its only accepted field. Unknown producer extensions elsewhere in frontmatter remain preserved but are not treated as valid Business metadata.

| Section | Controlled types |
|---|---|
| `direction` | `Mission`, `Vision` |
| `problems` | `Business Problem` |
| `people` | `Stakeholder`, `Business Role`, `Persona`, `Persona Goal`, `Business Need` |
| `outcomes` | `Business Outcome`, `Success Metric` |
| `capabilities` | `Business Capability` |
| `market` | `Market`, `Market Segment`, `Competitor`, `Market Sizing` |
| `research` | `Research Study`, `Research Finding`, `Evidence Source` |
| `economics` | `Business Model`, `Revenue Model`, `Cost Model` |
| `governance` | `Regulation`, `Business Constraint` |
| `risks` | `Business Risk` |
| `decisions` | `Business Decision` |

A typed relationship contains `type` and an absolute bundle-relative Markdown `target`, with optional `rationale` and an optional list of evidence concept paths. Its identity is source, type, and normalized target. Malformed and duplicate relationships are diagnostic rather than silently interpreted.

## Interfaces

```m21-interface
operations:
  project-business-workspace:
    purpose: Present accepted Business-owned concepts grouped first by section and then by controlled type.
    effects: [Leaves canonical knowledge and concept ownership unchanged]
  validate-business-concept:
    purpose: Validate common fields, the closed Business namespace, controlled section-to-type membership, body content, and relationship shape while preserving readable knowledge.
    input: BusinessConcept
    effects: [Produces actionable diagnostics without discarding readable concepts]
  follow-business-relationship:
    purpose: Open connected context from any Definition Area without changing either concept's ownership.
    effects: [Changes workspace focus only]
```

## Contract

The Business workspace:

- Shows sections in their controlled order and types within each section.
- Filters by section and type.
- Shows title, type, and description on each concise card.
- Expands a card to show canonical Markdown plus incoming and outgoing typed relationships.
- Follows cross-area relationships to canonical context without copying or reclassifying it.
- Keeps unanswered concerns as questions rather than empty placeholder concepts.

Expected relationship meanings include Persona `plays-role` Business Role, Persona `has-goal` Persona Goal, Persona or Stakeholder `has-need` Business Need, Business Problem `affects` Persona or Stakeholder, Business Outcome `addresses` Business Problem, Success Metric `measures` Business Outcome, and Business Capability `supports` Business Outcome. Research supports or challenges claims; regulation, constraints, and decisions govern affected knowledge. The global vocabulary remains extensible until standardized across all Definition Areas.

Business does not define a Business Solution, interaction design, conceptual technical system, Application topology, or implementation. No controlled Business type is required only to satisfy a checklist. Empty placeholders and unrecognized Business metadata are invalid, but diagnostics do not make otherwise readable project knowledge disappear.
