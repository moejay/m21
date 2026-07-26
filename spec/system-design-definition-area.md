---
name: system-design-definition-area
description: Accepted conceptual System Design schema, relationship-driven map, boundaries, flows, qualities, failures, and Architecture separation.
group: product-definition
tags: [okf, system-design, conceptual, graph]
depends_on:
  - business-solution-definition-area
  - visual-design-definition-area
---

# System Design Definition Area

This contract implements `m21-spec/system.md` and supersedes the legacy kind/group/criticality System metadata.

## Data model

System Design owns conceptual technical responsibilities, information and data ownership, logical stores, flows, external dependencies, trust, qualities, security, failure behavior, constraints, risks, and decisions. It never chooses Applications, runtimes, protocols, products, deployment units, or internal source structure.

```m21-model
entities:
  SystemMetadata:
    fields:
      section: { type: enum, values: [overview, responsibilities, data, flows, dependencies, qualities, security, failures, constraints, risks, decisions], required: true }
      boundary: { type: enum, values: [owned, managed, external] }
  SystemConcept:
    fields:
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      body: { type: string, required: true }
      area: { type: enum, values: [system], required: true }
      system: { type: object, required: true }
      relationships: { type: array, items: object }
```

| Section | Controlled types |
|---|---|
| `overview` | System |
| `responsibilities` | System Responsibility |
| `data` | Data Domain, Information Model, Logical Data Store |
| `flows` | System Flow |
| `dependencies` | External Dependency |
| `qualities` | Quality Requirement |
| `security` | Trust Boundary, Security Requirement |
| `failures` | Failure Mode |
| `constraints` | System Constraint |
| `risks` | System Risk |
| `decisions` | System Decision |

`system.boundary` is required for map-node concepts: System, System Responsibility, Data Domain, Logical Data Store, and External Dependency. It is the only field beyond section. Human participants remain contextual Business concepts.

## Interfaces

```m21-interface
operations:
  project-system-map:
    purpose: Project accepted System concepts and typed relationships into a conceptual responsibility, information, flow, dependency, and trust map without inferring Application boundaries.
    effects: [Leaves canonical knowledge and ownership unchanged]
  filter-system-map:
    purpose: Toggle section, type, responsibility branch, ownership boundary, contextual knowledge, and optional quality, security, failure, constraint, risk, and decision overlays.
    effects: [Changes disposable workspace state only]
  inspect-system-concept:
    purpose: Expand any map node or first-class flow into canonical Markdown, relationships, boundary, and local scale or quality context.
    effects: [Leaves canonical knowledge unchanged]
```

## Contract

The map is relationship-driven. The root System anchors the conceptual whole. `part-of` forms collapsible responsibility hierarchy. First-class System Flows retain concept identity while appearing as directed edges or paths. Layout never implies direction. Reduced motion replaces directional animation with arrows and labels.

System responsibilities realize Solution capabilities and behaviors. Data domains own information; logical stores retain it; flows connect sources, destinations, information, and responsibilities; dependencies remain explicit. Qualities, security, failures, constraints, risks, and decisions govern affected concepts as optional overlays.

Scale normally remains body content on the affected System, Responsibility, Store, or Flow until a concrete numeric workspace requirement accepts scalar metadata. No concept type exists merely to satisfy a checklist. Missing information remains questions or diagnostics.

System Design may require isolation, delayed work, durability, auditability, availability, or external integration, but cannot turn those needs into services, workers, queues, database products, protocols, or deployable units. Architecture maps every owned System Responsibility to actual Applications later.
