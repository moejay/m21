---
name: system-design-definition-area
description: Working contract for conceptual technical responsibilities, information, flows, boundaries, qualities, failures, and external dependencies without choosing Applications.
group: definition-areas
tags: [system-design, conceptual, graph, boundaries, working-draft]
depends_on:
  - business-solution-definition-area
  - visual-design-definition-area
---

# System Design Definition Area

> Status: **Agreed initial contract.** System Design remains product-wide and does not choose the Application topology.

## Data model

### Purpose and boundary

System Design defines the conceptual technical system needed to satisfy Business Solution and relevant Visual Design contracts. It owns logical responsibilities, actors, information and data ownership, conceptual stores, information flows, external dependencies, trust boundaries, quality requirements, failure and degradation behavior, constraints, risks, and system-level decisions.

System Design answers what technical responsibilities and information interactions must exist. It does not decide how many Applications exist, whether the result is a monolith or distributed system, which runtime or framework is used, which responsibility is independently deployable, or how an Application is internally structured. Those choices begin in Architecture.

### Minimal frontmatter

```yaml
type: System Responsibility
title: Accepted knowledge management
description: Maintains the authoritative accepted product knowledge state.
area: system
system:
  section: responsibilities
  boundary: owned
relationships:
  - type: realizes
    target: /solution/capabilities/accepted-knowledge.md
```

Initial minimal fields:

| Field | Applies to | Shape | Requirement | Workspace use | Missing behavior |
|---|---|---|---|---|---|
| `system.section` | All System concepts | Closed section enum | Required | Selects grouping and purpose-built system projection | Concept is not valid primary System knowledge |
| `system.boundary` | Graph node concepts representing responsibilities, stores, or dependencies | `owned`, `managed`, or `external` | Required for applicable node types | Places and visually distinguishes nodes across ownership boundaries | Node remains diagnosable but is not silently treated as owned |

`boundary` replaces the earlier `external_dependency: boolean` idea. Human participants remain contextual Business concepts, so a `user` boundary value and duplicate System Actor type are unnecessary. Criticality, protocols, runtime, and graph-layout metadata are deferred until a concrete workspace requirement proves they are needed.

### Sections, controlled types, and presentation

| Section | Candidate controlled types | Primary presentation |
|---|---|---|
| `overview` | `System` | Root system definition, scope, overall qualities, and complete map entry point |
| `responsibilities` | `System Responsibility` | Hierarchical responsibility map and cards |
| `data` | `Data Domain`, `Information Model`, `Logical Data Store` | Data ownership and conceptual-store map |
| `flows` | `System Flow` | Directed flow map with expandable flow detail |
| `dependencies` | `External Dependency` | Managed and external dependency graph |
| `qualities` | `Quality Requirement` | Independently traceable, System-specific quality cards and optional overlays |
| `security` | `Trust Boundary`, `Security Requirement` | Trust-boundary and security overlay on the system map |
| `failures` | `Failure Mode` | Failure and degradation cards linked to affected system knowledge |
| `constraints` | `System Constraint` | Constraint cards and graph overlays |
| `risks` | `System Risk` | Risk cards |
| `decisions` | `System Decision` | Decision cards |

No type is mandatory merely because it is available. A property remains in the owning System concept body unless it independently justifies concept identity.

### Semantic distinctions

- A **System** is the single root concept for the conceptual system being designed. Its body owns overall scope, boundaries, system-wide scale expectations, and qualities that do not need independent identity.
- A **System Responsibility** is a cohesive conceptual technical accountability, not an Application, service, module, or deployable unit. Responsibilities may form a `part-of` hierarchy, which also provides meaningful collapsible map grouping without a presentation-only System Group concept.
- A **Data Domain** identifies coherent information ownership and meaning.
- An **Information Model** describes conceptual information exchanged or maintained without choosing storage schemas or language types.
- A **Logical Data Store** establishes a persistence responsibility without choosing a database product or deployable database boundary.
- A **System Flow** describes an end-to-end conceptual interaction, including background or information movement when those distinctions matter in its body. Separate Information Flow and Background Process types are unnecessary initially.
- An **External Dependency** represents either a managed or independently external capability; `system.boundary` distinguishes them without multiplying types.
- A **Quality Requirement** is first-class only when a System-specific expectation is independently traceable, cross-cutting, or Architecture-driving. Otherwise the quality remains part of the System or affected concept body.
- **Scale** is normally part of the System body or the affected Responsibility, Store, or Flow body: expected and peak throughput, concurrency, data volume, growth, or distribution. It is not a first-class type in the initial model. If an accepted numeric map overlay later needs scale scalars, they will be added to the applicable concept schemas rather than creating scale nodes merely for visualization.
- A **Failure Mode** includes required degradation and recovery behavior; a separate Degradation Rule type is unnecessary initially.
- Quality, scale, security, and failure concepts link to the responsibilities, data, flows, and dependencies they govern rather than becoming nested arrays.

### Flow representation

A flow becomes a first-class concept when it has meaningful information, conditions, failures, security considerations, quality requirements, or rationale of its own. Simple connectivity remains a typed relationship.

A purpose-built projection may visually collapse a first-class flow into a labeled edge while retaining the flow's concept identity and inspector detail. Source, destination, carried information, and affected responsibilities should use typed relationships rather than copied path fields.

## Interfaces

The System Design workspace is expected to:

- Show a connected conceptual system map organized by the root System, responsibility hierarchy, ownership, and trust boundary.
- Toggle visibility by section, controlled type, responsibility branch, ownership boundary, and contextual upstream knowledge.
- Collapse or expand `part-of` responsibility branches without changing canonical membership.
- Render System Flows as directed edges and optionally animate direction of information movement.
- Respect reduced-motion preferences by replacing animation with persistent arrows and labels.
- Expand responsibilities, data, stores, flows, and dependencies into canonical documents.
- Overlay independently modeled qualities, security, failures, constraints, risks, and decisions on affected graph elements while keeping non-first-class scale context in the relevant inspector.
- Show related Business Solution capabilities, behaviors, policies, boundaries, and delivery concepts as contextual references.
- Identify Solution capabilities with no realizing System responsibility and owned System responsibilities with no traceable Solution need.
- Create reviewable proposals for concepts and relationships without choosing an Application topology implicitly.
- Surface unanswered design questions without creating placeholder nodes.

## Contract

### System map projection

The System map is the primary System Design visualization. It is generated from accepted concepts and relationships rather than stored as a separate canonical diagram.

- The root `System`, `System Responsibility`, `Logical Data Store`, `Data Domain`, `External Dependency`, and optional contextual Business participants appear as nodes when relevant.
- `part-of` relationships form collapsible responsibility branches. Grouping therefore follows real conceptual containment rather than presentation-only group nodes or strings.
- A `System Flow` is rendered as a directed edge or path while retaining first-class concept identity and inspector detail.
- Information Models carried by a flow appear as edge labels or expandable flow context.
- Flow direction comes from explicit source and destination relationships; visual layout never implies direction.
- Directional animation communicates modeled movement only. It must not imply live telemetry, actual throughput, or current health.
- System-wide scale context appears on the root System detail; local scale context appears on the affected Responsibility, Store, or Flow detail. A future numeric overlay requires an explicitly accepted scalar schema and must never compare unlike units as if equivalent.
- Qualities, security, failures, constraints, risks, and decisions are optional overlays rather than permanent graph clutter.
- Node position, zoom, collapsed state, animation state, filters, and active overlays are workspace state, not concept metadata.

The map must remain understandable without color or animation through labels, shapes, grouping, and directional markers.

### Graph semantics

The System graph is relationship-driven. Directory location, card grouping, or visual proximity never establishes ownership, flow, realization, or dependency.

The global relationship vocabulary must support these meanings:

- System responsibilities realize Solution capabilities and behaviors.
- Contextual Business participants initiate or participate in flows without becoming duplicate System Actor concepts.
- The root System and parent Responsibilities contain related system concepts without becoming executable Application boundaries.
- Responsibilities provide, consume, manage, or transform information.
- Data domains own conceptual information.
- Logical stores retain information owned by a data domain or responsibility.
- Flows connect sources, destinations, information, and relevant responsibilities.
- Owned responsibilities depend on external or managed systems only through explicit relationships.
- Trust boundaries contain or separate relevant participants.
- Requirements, failures, constraints, risks, and decisions govern affected system concepts.

Exact global relationship names and inverse UI labels will be standardized across all areas.

### Architecture boundary

System Design may require local processing, delayed work, durable information, isolation, availability, auditability, or external integration. It must not turn those requirements into an Application, service, worker, function, queue technology, database product, API protocol, or deployment unit.

Architecture later maps every owned System Responsibility to one or more actual Applications and records why responsibilities are combined or separated.

### External dependencies

- `owned` means the product is accountable for the conceptual responsibility or store.
- `managed` means the product consumes a separately operated capability with an explicit dependency contract.
- `external` means an independent external system or source outside product control.

Human participants remain contextual Business concepts and do not need duplicated System boundary metadata.

Boundary classification supports visualization and risk questions; it does not transfer ownership through dependencies.

### Optionality and guidance

The agent begins with accepted Solution capabilities and asks about responsibilities, actors, information, ownership, flows, external dependencies, qualities, trust, and failure behavior. It challenges technology-first answers and moves Application, runtime, protocol, and deployment choices to Architecture.

Missing information remains a question or diagnostic. No empty store, flow, security, or quality concept is required.

### Deferred implementation detail

Numeric scale overlays, durable user-authored graph layouts, and exact animation controls remain deferred. Future implementation must preserve the root System ownership model, responsibility hierarchy, relationship-derived direction, reduced-motion behavior, and separation between conceptual System Design and executable Architecture.
