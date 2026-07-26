---
name: business-solution-definition-area
description: Accepted socio-technical Business Solution Definition Area schema, relationships, validation, guidance, and workspace contract.
group: product-definition
tags: [okf, solution, definition-area, schema]
depends_on:
  - business-definition-area
---

# Business Solution Definition Area

This contract implements the accepted model in `m21-spec/solution.md`. It supersedes the Product-specific `sdlc`, `product` namespace, and software-product-only framing in `product-definition-workflow`.

## Data model

Business Solution describes the complete socio-technical response and solution space for accepted Business problems, needs, goals, and outcomes. A concept has singular `area: solution` ownership, exactly one `solution.section`, a controlled type allowed in that section, meaningful common fields, and non-empty Markdown body.

```m21-model
entities:
  SolutionMetadata:
    fields:
      section:
        type: enum
        values: [proposition, options, outcomes, capabilities, behaviors, delivery, boundaries, assumptions, risks, decisions]
        required: true
  SolutionConcept:
    fields:
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      area: { type: enum, values: [solution], required: true }
      solution: { type: object, required: true }
      relationships: { type: array, items: object }
      body: { type: string, required: true }
```

`solution.section` is the only accepted Solution namespace field until a concrete workspace behavior justifies more.

| Section | Controlled types |
|---|---|
| `proposition` | `Solution Proposition` |
| `options` | `Solution Option` |
| `outcomes` | `Solution Outcome`, `Solution Measure` |
| `capabilities` | `Solution Capability` |
| `behaviors` | `Solution Behavior`, `Solution Policy` |
| `delivery` | `Human Service`, `Business Process`, `Policy Intervention`, `Digital Product`, `Physical Product`, `Partner Service` |
| `boundaries` | `Solution Boundary`, `Solution Constraint` |
| `assumptions` | `Solution Assumption` |
| `risks` | `Solution Risk` |
| `decisions` | `Solution Decision` |

## Interfaces

```m21-interface
operations:
  project-solution-workspace:
    purpose: Present accepted Solution-owned concepts grouped first by section and then controlled type without importing Business concepts as primary artifacts.
    effects: [Leaves canonical knowledge and concept ownership unchanged]
  validate-solution-concept:
    purpose: Validate common fields, the closed Solution namespace, controlled section-to-type membership, body content, and relationship shape while preserving readable knowledge.
    effects: [Produces actionable diagnostics without discarding readable concepts]
  follow-solution-relationship:
    purpose: Open connected Business or downstream context without changing either concept's Definition Area ownership.
    effects: [Changes workspace focus only]
```

## Contract

The Business Solution workspace:

- Groups cards first by controlled `solution.section` and then controlled `type`.
- Filters by section and type.
- Shows title, type, and description, then expands to canonical body and incoming and outgoing relationships.
- Shows connected Business problems, people, goals, needs, outcomes, evidence, and constraints as contextual references.
- Preserves candidate and rejected options without presenting them as accepted choices.
- Treats human services, processes, policy, digital and physical products, and partner delivery as equal first-class possibilities.
- Creates reviewable proposals and keeps unanswered concerns as questions rather than placeholders.

Expected meanings include Proposition or Capability `addresses` Business Problem or Need; a Solution `serves` a Persona, Role, or Stakeholder; Solution Outcome contributes to a Business Outcome; Solution Measure measures a Solution Outcome; delivery realizes or supports a Solution Capability; behavior belongs to or realizes a Capability; policy governs behavior or capabilities; Business regulation and constraints constrain Solution knowledge; research informs options and assumptions; and Solution Decisions govern options, boundaries, and delivery choices.

Business Solution does not redefine Business problems, choose detailed experience or visual treatment, perform conceptual technical decomposition, decide Application topology, or describe implementation. No type is mandatory only to satisfy a checklist. Unknown Solution fields and empty placeholders are invalid but remain readable with diagnostics.
