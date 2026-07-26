---
name: business-definition-area
description: Contract for Business knowledge, minimal validated metadata, relationships, card-grouped presentation, and guided definition.
group: definition-areas
tags: [business, metadata, cards]
---

# Business Definition Area

> Status: **Agreed.** Revisit only when a concrete workspace or validation need justifies a change.

## Data model

### Purpose and boundary

Business defines why change is needed and the environment in which a solution must succeed. It owns mission and direction, present problems, affected people and organizations, desired business outcomes, evidence, market and competitive context, economics, regulation, constraints, risks, and enduring business capabilities.

Business does not define the selected socio-technical solution, user interaction, conceptual technical system, Application boundaries, or implementation.

### Minimal frontmatter

A Business concept uses the common controlled fields and exactly one Business section:

```yaml
type: Business Problem
title: Fragmented product knowledge
description: Product intent and engineering decisions drift when they live in disconnected tools.
area: business
business:
  section: problems
relationships: []
```

```m21-model
entities:
  BusinessMetadata:
    fields:
      section:
        type: enum
        values: [direction, problems, people, outcomes, capabilities, market, research, economics, governance, risks, decisions]
        required: true
```

No additional Business metadata is currently accepted. Important narrative detail belongs in the body. Independently meaningful information becomes a first-class concept and is connected through typed relationships. Type-specific scalar metadata may be added later only under `SCHEMA-CONVENTIONS.md` when an accepted workspace behavior requires it.

### Sections, controlled types, and presentation

| Section | Allowed controlled types | Presentation |
|---|---|---|
| `direction` | `Mission`, `Vision` | Cards grouped as current purpose and desired future direction |
| `problems` | `Business Problem` | Problem cards |
| `people` | `Stakeholder`, `Business Role`, `Persona`, `Persona Goal`, `Business Need` | Cards grouped by people concept type |
| `outcomes` | `Business Outcome`, `Success Metric` | Outcome and metric cards |
| `capabilities` | `Business Capability` | Capability cards |
| `market` | `Market`, `Market Segment`, `Competitor`, `Market Sizing` | Market cards grouped by type |
| `research` | `Research Study`, `Research Finding`, `Evidence Source` | Research and evidence cards grouped by type |
| `economics` | `Business Model`, `Revenue Model`, `Cost Model` | Economics cards grouped by type |
| `governance` | `Regulation`, `Business Constraint` | Regulation and constraint cards |
| `risks` | `Business Risk` | Risk cards |
| `decisions` | `Business Decision` | Decision cards |

`Research` is its own section because evidence may support problems, people, market claims, outcomes, risks, and decisions.

### People model

- A **Stakeholder** is an actual person, group, or organization with interest, influence, or accountability.
- A **Business Role** is a function such as Buyer, Operator, Administrator, or Product Manager.
- A **Persona** is an evidence-based archetype representing people who play one or more Business Roles.
- A **Persona Goal** is a desired condition from a Persona's perspective.
- A **Business Need** is something required to pursue a goal or address a problem without prescribing a solution.

Business Roles, Persona Goals, and Business Needs are first-class concepts rather than embedded arrays. Incidental Persona detail remains in the body.

## Interfaces

The Business workspace:

- Lists concepts grouped first by `business.section` and then by controlled `type`.
- Shows each concept as a concise card using title, type, and description.
- Expands a card to show its canonical body and incoming and outgoing relationships.
- Filters by section and type.
- Follows cross-area relationships without changing concept ownership.
- Creates reviewable concept and relationship proposals rather than mutating accepted knowledge directly.
- Surfaces unanswered Business questions without creating empty placeholder concepts.

## Contract

### Relationship expectations

The global relationship vocabulary must support these Business meanings:

- A Persona `plays-role` a Business Role.
- A Persona `has-goal` a Persona Goal.
- A Persona or Stakeholder `has-need` a Business Need.
- A Business Problem `affects` a Persona or Stakeholder.
- A Business Outcome `addresses` a Business Problem.
- A Success Metric `measures` a Business Outcome.
- A Business Capability `supports` a Business Outcome.
- Research supports or challenges a claim.
- Regulation, constraints, and decisions govern affected knowledge.

The exact global vocabulary and inverse UI labels will be standardized separately. Relationship targets remain first-class concepts, never copied IDs in Business metadata.

### Presentation

The initial Business workspace uses basic expandable card grouping. It does not require timelines, heatmaps, funnels, matrices, canvases, or metadata-driven charts. Those projections and their necessary scalar schemas may be added later in response to an accepted workspace requirement.

Card grouping and filtering are projections of canonical concepts. Expanded state, ordering preferences, and temporary filters are workspace state rather than frontmatter.

### Optionality and guidance

No Business type is required merely to satisfy a checklist. The workspace and agent ask whether each concern is relevant, then record it only when meaningful content exists. A concern may remain unresolved, deferred, or not applicable with rationale without producing an empty concept.

The agent distinguishes evidence from assumptions in its questions and proposals, but no evidence scalar is stored until a concrete workspace use and validated schema are accepted. Evidence can be represented through Research concepts and relationships in the meantime.

### Invariants

- Every Business concept has `area: business` and exactly one valid `business.section`.
- Every Business concept uses a controlled type allowed by its section.
- A Business concept is primary only in the Business workspace.
- Business knowledge does not prescribe a Business Solution or technical realization.
- Unknown Business fields are not silently treated as valid M21 metadata.
- Empty placeholder concepts are invalid.
