---
name: business-solution-definition-area
description: Contract for socio-technical Business Solution knowledge, minimal validated metadata, relationships, card-grouped presentation, and guided definition.
group: definition-areas
tags: [solution, socio-technical, metadata, cards]
depends_on:
  - business-definition-area
---

# Business Solution Definition Area

> Status: **Agreed initial contract.** Revisit when a concrete workspace or validation need justifies additional structure.

## Data model

### Purpose and boundary

Business Solution describes the proposed response and solution space for accepted Business problems, needs, goals, and outcomes. It may combine human services, business processes, policy interventions, digital products, physical products, partners, and other delivery mechanisms.

Business Solution owns the proposition, considered options, promised solution outcomes, capabilities, solution-neutral behavior and policy, delivery model, boundaries, assumptions, risks, and consequential choices.

Business Solution does not own Business problem meaning, detailed experience and visual treatment, conceptual technical decomposition, actual Application topology, or implementation.

### Minimal frontmatter

A Business Solution concept uses the common controlled fields and exactly one Solution section:

```yaml
type: Human Service
title: Assisted eligibility review
description: A specialist helps applicants resolve exceptional evidence before a decision.
area: solution
solution:
  section: delivery
relationships:
  - type: addresses
    target: /business/problems/delayed-benefit-access.md
```

```m21-model
entities:
  SolutionMetadata:
    fields:
      section:
        type: enum
        values: [proposition, options, outcomes, capabilities, behaviors, delivery, boundaries, assumptions, risks, decisions]
        required: true
```

No additional Solution metadata is currently accepted. Delivery mode is represented by controlled concept type rather than a duplicated metadata field. Type-specific scalar metadata may be added later only when an accepted workspace behavior requires it.

### Sections, controlled types, and presentation

| Section | Allowed controlled types | Presentation |
|---|---|---|
| `proposition` | `Solution Proposition` | Proposition cards |
| `options` | `Solution Option` | Option cards preserving alternatives, rationale, and selection or rejection decisions through body content and relationships |
| `outcomes` | `Solution Outcome`, `Solution Measure` | Solution outcome and measure cards |
| `capabilities` | `Solution Capability` | Capability cards |
| `behaviors` | `Solution Behavior`, `Solution Policy` | Behavior and policy cards |
| `delivery` | `Human Service`, `Business Process`, `Policy Intervention`, `Digital Product`, `Physical Product`, `Partner Service` | Delivery cards grouped by controlled type |
| `boundaries` | `Solution Boundary`, `Solution Constraint` | Boundary and constraint cards |
| `assumptions` | `Solution Assumption` | Assumption cards |
| `risks` | `Solution Risk` | Risk cards |
| `decisions` | `Solution Decision` | Decision cards |

### Semantic distinctions

- A **Solution Proposition** summarizes the value and response being offered.
- A **Solution Option** is one considered approach, including rejected alternatives worth preserving.
- A **Solution Outcome** is an observable effect expected from adopting or using the solution; it contributes to, but does not redefine, a Business Outcome.
- A **Solution Capability** is an ability the complete solution provides regardless of delivery mechanism.
- A **Solution Behavior** describes externally meaningful behavior without prescribing interaction or technical design.
- A **Solution Policy** governs valid Solution behavior.
- Delivery concepts describe how capabilities are provided across human, process, policy, digital, physical, and partner mechanisms.
- Boundaries define included and excluded solution responsibility.
- Assumptions, risks, and decisions remain explicit first-class concepts rather than being hidden in delivery descriptions.

## Interfaces

The Business Solution workspace:

- Lists concepts grouped first by `solution.section` and then by controlled `type`.
- Shows each concept as a concise card using title, type, and description.
- Expands a card to show its canonical body and incoming and outgoing relationships.
- Filters by section and type.
- Shows connected Business problems, people, goals, needs, outcomes, evidence, and constraints as contextual references.
- Preserves candidate and rejected options without presenting them as selected truth.
- Creates reviewable concept and relationship proposals rather than mutating accepted knowledge directly.
- Surfaces unanswered Solution questions without creating empty placeholders.

## Contract

### Relationship expectations

The global relationship vocabulary must support these Solution meanings:

- A Solution Proposition or Capability `addresses` a Business Problem or Business Need.
- A Solution exists to `serve` a Persona, Business Role, or Stakeholder.
- A Solution Outcome contributes to or realizes a Business Outcome.
- A Solution Measure measures a Solution Outcome.
- A delivery concept realizes or supports a Solution Capability.
- A Solution Behavior belongs to or realizes a Solution Capability.
- A Solution Policy governs Solution behavior or capabilities.
- A Solution is constrained by Business regulation and constraints.
- Research informs or supplies evidence for options and assumptions.
- Solution Decisions govern selected options, boundaries, and delivery choices.

Exact relationship names and inverse UI labels will be standardized globally. Cross-area context is expressed through relationships, never duplicated Business metadata.

### Presentation

The initial Business Solution workspace uses basic expandable card grouping. It does not require option matrices, capability maps, service blueprints, value flows, or delivery diagrams. Those projections and their necessary metadata may be added later when a concrete workspace requirement is accepted.

The card view must still make section, type, and cross-area relationships visible. Expanded state, local ordering, and temporary filters remain workspace state.

### Optionality and guidance

No Solution type is mandatory solely because it exists in the profile. The agent asks which solution concerns are relevant, distinguishes accepted decisions from options and assumptions, and proposes only meaningful concepts.

A Solution must remain traceable to Business context before it is accepted. Incomplete work remains a Change Proposal with explicit questions rather than a status-bearing draft concept. Human services, processes, policy, and partner delivery are equal first-class possibilities; the workspace must not assume the solution is software.

### Invariants

- Every Business Solution concept has `area: solution` and exactly one valid `solution.section`.
- Every Business Solution concept uses a controlled type allowed by its section.
- A Business Solution concept is primary only in the Business Solution workspace.
- Solution knowledge does not redefine the Business problem or prematurely choose experience, system, Application, or implementation design.
- Delivery mechanisms remain distinguishable from the capabilities they realize.
- Unknown Solution fields are not silently treated as valid M21 metadata.
- Empty placeholder concepts are invalid.
