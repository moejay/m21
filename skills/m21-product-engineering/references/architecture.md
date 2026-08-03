# Architecture expert guide

Use for the actual portfolio of owned software-delivery Applications and their topology. In this repository, compare `m21-spec/architecture.md`, `spec/architecture-definition-area.md`, and the accepted profile; where draft terminology differs, the accepted project contract and validator win until the design conflict is resolved explicitly.

## Owns

Root Architecture rationale, owned Application portfolio, stable Application IDs, responsibility realization, executable/release boundaries, Application Communications, data authority, trust realization, external dependency placement, topology constraints, risks, and decisions.

## Does not own

Application-internal decomposition, source modules, internal architectural patterns, code interfaces, framework selection without accepted need, infrastructure provisioning, environments, or rollout.

## Expert stance

Act as a pragmatic software architect and distributed-systems skeptic. Begin with one Application as the default hypothesis. Add boundaries only when accepted ownership, runtime, trust, device, offline, independent release/deployment, scaling, isolation, durability, failure, data-authority, or technology pressure requires them.

Architecture is a user decision. Compare options and recommend; never manufacture microservices, workers, libraries, or functions from a diagram or framework convention.

## Best practices

- Map every owned System Responsibility to at least one owned Application.
- Give each Application one stable lowercase kebab-case identity from the Architecture registry.
- Keep identity stable across title, path, repository, and implementation changes.
- State why responsibilities are combined and why any boundary is separated.
- Distinguish runtime communication from build/package dependency.
- Make significant cross-Application communication directional and explicit.
- Assign authority for owned data; shared access is not shared authority.
- Place accepted trust boundaries and external dependencies deliberately.
- Model failure isolation and what state survives.
- Preserve rejected topology alternatives when their rationale matters.
- Treat topology labels—monolith, client-server, microservices, event-driven, local-first, hybrid—as discussion vocabulary, not proof.
- Keep managed databases, queues, providers, and deployment resources out of the owned Application portfolio unless the accepted Application definition genuinely includes them.

## High-value questions

### Portfolio

- Can one Application realize all owned Responsibilities and qualities? If not, what accepted pressure forces separation?
- Is each proposed Application a coherent owned software-delivery boundary or merely a source folder/module/resource?
- Who owns, changes, releases, and operates it?
- What would become simpler if two proposed Applications were combined?
- What risk or constraint would be violated if they were combined?

### Realization and authority

- Which Application realizes every owned System Responsibility?
- Does any Responsibility have no realization or unexplained duplicate realization?
- Which Application can author each owned data domain or accepted state?
- Where do read models, caches, replicas, and external copies derive authority?
- Does an ownership relationship contradict the stable Application ID?

### Communication

- Why must this interaction cross an Application boundary?
- What is source, destination, mode, carried information, and trust crossing?
- What happens on timeout, duplication, reordering, disconnection, or partial success?
- Does a first-class communication concept have enough independent meaning, or is a typed dependency enough?
- Is an asynchronous mechanism solving an accepted need or adding accidental complexity?

### Release, scale, and failure

- Must the boundary be released or deployed independently? Why?
- Which load or growth pattern differs enough to justify independent scaling?
- What fails together, what degrades independently, and what state must survive?
- Which operational burden does the split create?
- Which quality scenario from System Design is satisfied by the topology?

### Alternatives

- What is the simplest credible topology?
- Which alternative optimizes for a different constraint?
- What evidence would cause consolidation or further separation?
- Which decisions are reversible and which create migration cost or lock-in?

## Application boundary tests

A proposed boundary is likely an Application when it has coherent ownership and identity plus a meaningful executable, release, distribution, device, or trust boundary. It is likely not an Application when it is only:

- a source module, package folder, class, UI component, or helper;
- a logical data store or database product;
- a queue, topic, bucket, provider, or deployment resource;
- a third-party dependency;
- a serverless function with no independent ownership and release identity.

A consumable owned library qualifies only if the project's accepted Architecture contract permits it and it needs independent identity, ownership, contracts, implementation scope, and release/distribution. Never invent a fake `shared` Application.

## Useful lenses—not required schemas

- Architecture Decision Records and explicit trade-off analysis.
- C4 context/container thinking at Application portfolio level.
- Quality-attribute scenarios and fitness functions.
- Team ownership, cognitive load, and change coupling.
- Distributed-systems failure and consistency analysis.
- Threat modeling, data authority, and trust boundaries.
- Evolutionary architecture and reversibility.

## Common failure modes

- Starting with microservices or a cloud diagram rather than accepted pressures.
- One Application per System Responsibility.
- Services split by CRUD entity with shared database authority.
- Hidden distributed transactions or circular synchronous calls.
- Duplicate or path-derived Application identities.
- `depends-on` treated as ownership.
- Infrastructure resources shown as owned Applications.
- A boundary claimed independently deployable without independent operation or failure handling.
- Architecture choosing internal patterns that belong to Application Architecture.

## Strong outputs

A coherent Architecture explains:

- the simplest justified owned Application portfolio;
- stable identities and controlled kinds;
- complete System Responsibility realization;
- data authority, trust, and external dependency placement;
- significant communication direction and failure behavior;
- combination/separation rationale and rejected alternatives;
- safe entry into one selected downstream Application scope.

## Handoff

Application Experience, Application Architecture, Components, Code Design, Implementation, and Deployment reference the stable Application ID. Architecture defines cross-Application topology; downstream areas may refine a boundary but must not silently create or redefine Applications.
