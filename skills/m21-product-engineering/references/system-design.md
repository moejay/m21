# System Design expert guide

Use for product-wide conceptual technical responsibilities and information behavior. In this repository, `m21-spec/system.md` and `spec/system-design-definition-area.md` are authoritative.

## Owns

Root System scope, conceptual technical responsibilities, information and data ownership, Information Models, Logical Data Stores, System Flows, external and managed dependencies, trust boundaries, quality requirements, security requirements, failure and degradation behavior, constraints, risks, and System decisions.

## Does not own

The number of Applications, services, workers, functions, runtime, framework, protocol, database product, deployment unit, internal source architecture, or infrastructure.

## Expert stance

Act as a systems analyst, domain and data modeler, reliability and security thinker, and conceptual architect. Describe what technical accountabilities and information interactions must exist before choosing executable boundaries.

Challenge diagrams composed of fashionable boxes, noun-only responsibilities, unowned information, happy-path-only flows, generic “non-functional requirements,” and technology choices disguised as conceptual needs.

## Best practices

- Start from accepted Solution capabilities, behavior, policy, boundaries, and relevant Visual constraints.
- Define one root System with clear scope and system-wide qualities.
- Name Responsibilities as cohesive accountabilities, not services or components.
- Use `part-of` only for real conceptual responsibility hierarchy.
- Give information meaning and ownership before discussing storage.
- Distinguish Data Domains, Information Models, and Logical Data Stores.
- Make a Flow first-class only when its information, conditions, quality, security, failure, or rationale deserves identity.
- Model source and destination direction explicitly; never infer it from layout.
- Classify node boundaries as owned, managed, or external where the accepted schema requires it.
- Attach qualities, security, failures, constraints, risks, and decisions to affected concepts.
- Put scale context on the affected System, Responsibility, Store, or Flow until structured numbers have a validated workspace use.
- Describe degraded behavior, recovery, idempotency, audit, privacy, and trust early enough to influence Architecture.

## High-value questions

### Scope and responsibilities

- What technical outcome must the System be accountable for?
- Which accepted Solution capability or behavior requires each responsibility?
- What is outside the System boundary?
- Can the responsibility be stated without naming a technology or deployable unit?
- Which responsibilities must remain conceptually separate even if one Application realizes them?

### Information and data

- What information exists, what does it mean, and who has authority over it?
- Where is accepted state versus derived, cached, proposed, or external state?
- What must be retained, forgotten, audited, encrypted, or reconciled?
- Which consistency, freshness, provenance, and privacy expectations apply?
- Is a store conceptual responsibility or an prematurely selected database?

### Flows

- What initiates the flow, what information moves, and what is the destination?
- Is it synchronous in meaning, delayed, scheduled, or continuous—and does that matter before Architecture?
- What preconditions, policy, trust crossing, and quality expectations apply?
- What can fail midway? What is retried, compensated, rejected, or surfaced?
- Does the flow deserve its own concept or is a relationship enough?

### Dependencies and trust

- Is the capability owned, separately managed, or independently external?
- What is assumed about availability, correctness, latency, privacy, and change?
- What information crosses a trust boundary and under whose authority?
- How is dependency failure contained or made visible?

### Qualities, scale, and failure

- What measurable quality must hold, for which responsibility or flow, and under what conditions?
- What expected and peak volume, concurrency, growth, or geographic distribution matters?
- Which state must survive failure?
- What can degrade independently and what must fail closed?
- What recovery objective, audit evidence, or manual escape hatch is required?
- Which requirement would force an Architecture boundary later?

## Useful lenses—not required schemas

- Domain-driven decomposition and information ownership.
- Context, data-flow, trust-boundary, and threat-model diagrams.
- Quality-attribute scenarios: stimulus, context, response, measure.
- Failure-mode analysis, resilience patterns, and graceful degradation.
- Privacy-by-design and least privilege.
- Event storming for conceptual behavior, without assuming event-driven Architecture.

## Common failure modes

- Calling every Responsibility a service.
- Turning a database, queue, API, worker, or cloud product into a System requirement.
- Duplicating Business participants as System Actors without new System meaning.
- Creating stores with no information ownership.
- Drawing arrows whose direction or carried information is not modeled.
- Recording “scalable,” “secure,” or “highly available” without conditions or evidence.
- Ignoring partial failure, external dependency behavior, privacy, or recovery.
- Assuming conceptual containment implies deployability.

## Strong outputs

A coherent System Design makes it possible to explain:

- conceptual scope and owned responsibilities;
- information meaning, authority, retention, and flows;
- external and managed dependencies;
- trust and security boundaries;
- qualities, scale context, failure, degradation, and recovery expectations;
- traceability to Solution needs;
- Architecture-driving pressures without selecting topology.

## Handoff

Architecture must map every owned System Responsibility to one or more owned Applications and respond explicitly to quality, trust, authority, scale, and failure pressures. It may combine many Responsibilities in one Application. Never pre-create Applications from the System map.
