# Application Architecture expert guide

Use for the internal architecture of one selected Application. This area is provisional until its project contract is accepted. Do not turn these practices into canonical sections or metadata without explicit design and approval.

## Provisional ownership

Internal responsibilities and boundaries, architectural style, internal and public interfaces, data handling, security, operations, quality responses, dependency rules, constraints, risks, and Application-level decisions for one Application.

## Does not own

Product-wide Application portfolio topology, another Application's internals, detailed source symbols, implementation increments, infrastructure provisioning, or environment rollout.

## Expert stance

Act as an application architect who optimizes for clarity, changeability, correctness, security, operability, and proportional complexity. Derive internal boundaries from accepted Application responsibilities and experience/system contracts rather than importing a favorite pattern.

Challenge “layered/hexagonal/clean” labels without explicit responsibilities and dependency rules. Keep architecture independent of current files and frameworks unless a technology choice is an accepted constraint or decision.

## Best practices

- Begin with the selected Application's realized System Responsibilities and public obligations.
- Define cohesive internal responsibilities before naming Components.
- Separate policy/domain meaning from adapters and delivery mechanisms where that improves changeability and testability.
- Make dependency direction explicit; avoid cycles and hidden service locators.
- Define public and cross-boundary contracts before internals that consume them.
- State data authority, transaction boundaries, consistency, caching, retention, and migration responsibilities.
- Model authentication, authorization, secrets, sensitive data, audit, and trust crossings.
- Address startup, shutdown, concurrency, backpressure, resource limits, degraded operation, and observability.
- Tie quality responses to accepted System/Architecture scenarios.
- Record meaningful alternatives and architecture decisions, not framework defaults.
- Keep source package/file decomposition in Components, Code Design, or Implementation as appropriate.

## High-value questions

### Responsibilities and boundaries

- Which accepted System Responsibilities does this Application realize?
- What internal responsibility groups change for different reasons?
- What must remain independent of transport, persistence, UI framework, provider, or operating environment?
- Where would coupling create unsafe or expensive change?
- Which proposed boundary is architectural versus merely organizational?

### Interfaces and dependency direction

- What does the Application provide to users, other Applications, and operators?
- Which external contracts does it consume?
- What direction may dependencies take, and what must never depend on what?
- How are adapters replaced and tested?
- Where can versioning or compatibility fail?

### Data and state

- What state is authoritative, proposed, derived, cached, ephemeral, or external?
- What consistency and transaction boundaries are required?
- How are concurrent change, idempotency, migration, corruption, and recovery handled?
- Which data must be encrypted, minimized, retained, deleted, or audited?
- What state can be rebuilt and from what authority?

### Security and operations

- What are the trust boundaries and attacker-controlled inputs?
- Where are authentication and authorization decisions made?
- How do secrets enter without leaking into logs, UI, or canonical knowledge?
- What evidence explains failure in production?
- How does the Application start, stop, degrade, recover, and expose health?

### Qualities and trade-offs

- Which latency, throughput, availability, durability, offline, privacy, or maintainability scenario is driving the design?
- Which complexity is essential and which is accidental?
- What should fail independently within the Application?
- What fitness evidence would reveal architectural erosion?

## Useful lenses—not required schemas

- Ports and adapters, layered, pipeline, event-driven, actor, plugin, and functional-core patterns—as options, not defaults.
- Domain-driven boundaries and aggregate/transaction reasoning.
- Threat modeling and secure design.
- Reliability patterns, backpressure, and graceful shutdown.
- Architecture Decision Records and fitness functions.
- Observability by design.

## Common failure modes

- Selecting an architecture style by fashion.
- One “service” per entity with no cohesive policy.
- Domain code coupled to filesystem, transport, framework, or provider details.
- Cyclic dependencies hidden behind interfaces.
- Shared mutable state with unclear authority.
- Security and observability delegated entirely to Deployment.
- Application Architecture documents that mirror current folders and symbols.
- Defining cross-Application topology that belongs to Architecture.

## Contract-design questions for this provisional area

Before accepting the M21 area, decide:

- controlled sections and types;
- how internal Responsibilities differ from Components;
- which Application-level interfaces and data concepts deserve first-class identity;
- relationship vocabulary for provides, consumes, part-of, governs, and depends-on;
- default projections and dependency views;
- how architecture styles and quality responses are represented without renderer metadata;
- completeness diagnostics and evidence;
- boundaries with Components, Code Design, and Deployment.

## Handoff

Components refine cohesive internal responsibilities and own executable feature contracts. Code Design defines semantic models and interfaces. Implementation realizes them. Deployment supplies environments and operational mechanisms. These areas must preserve Application Architecture invariants rather than restating them as source structure.
