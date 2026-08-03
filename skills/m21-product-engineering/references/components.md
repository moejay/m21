# Components expert guide

Use for cohesive owned parts of one selected Application and their dependency/feature contracts. This Definition Area remains provisional unless the active project has accepted a newer contract.

## Provisional ownership

Component responsibilities, non-responsibilities, boundaries, provided and consumed contracts, parent ownership, dependency direction, visibility, and executable feature ownership.

## Does not own

Product capabilities, System Responsibilities, separate Applications, arbitrary files/classes, detailed semantic model design, implementation task status, or deployment resources.

## Expert stance

Act as a modular design and testability expert. Seek high cohesion, explicit contracts, low coupling, stable dependency direction, and boundaries that support safe independent reasoning—not maximal fragmentation.

A Component is a meaningful part of one Application. Do not promote every helper, adapter class, page, endpoint, package, or visual fragment into a canonical Component.

## Boundary tests

A Component is more likely justified when it:

- has one cohesive responsibility and explicit non-goals;
- owns behavior or policy that can be described independently;
- provides or consumes meaningful contracts;
- has a stable dependency boundary;
- owns executable features or evidence;
- can be reasoned about without enumerating source symbols.

It is less likely justified when it merely mirrors a folder, framework construct, generated file, thin wrapper, one-off helper, or visual specimen.

## Best practices

- Carry the selected stable Application ID directly.
- Use meaningful `part-of` hierarchy for parent Component ownership when applicable.
- State responsibility as an outcome/accountability, not “contains files for X.”
- State non-responsibilities to prevent boundary erosion.
- Separate public, internal, and private contracts where the project model supports visibility.
- Depend on semantic interfaces or ports rather than adapter internals.
- Make cross-layer dependency direction explicit and cycle-free.
- Assign every durable public guarantee to executable Gherkin features.
- Keep feature scenarios observable and technology-neutral.
- Use focused unit/integration/accessibility/performance tests as supporting evidence, never replacements for accepted feature guarantees.
- Reconsider Components that always change together or communicate through broad shared state.

## High-value questions

### Cohesion

- What one responsibility is this Component accountable for?
- What does it explicitly not do?
- Which behaviors and data must change together to preserve invariants?
- Would a maintainer understand the boundary without seeing the source tree?
- Is this one Component or several accidental responsibilities sharing a name?

### Contracts

- What does the Component provide, to whom, and with what failures?
- What does it consume, and can that dependency be expressed semantically?
- Which invariant must hold across calls, retries, concurrency, or state changes?
- Is the contract public to another Component/Application or internal implementation detail?

### Dependencies

- What direction should dependencies take and why?
- Does any dependency create a cycle, hidden shared state, or adapter-to-domain inversion?
- Is a cross-Application dependency targeting a deliberate public contract?
- Could the Component be tested with dependencies replaced through stable ports?

### Feature ownership

- Which observable user, system, or operator guarantee is owned here?
- Which existing Gherkin feature proves it?
- Is a scenario testing public behavior or an incidental helper?
- What lower-level evidence supplements the scenario for edge cases, accessibility, performance, or adapters?

### Change and scale

- Which reasons cause this Component to change?
- Does it have a different security, performance, or failure profile from its neighbors?
- Would splitting it reduce coupling or only increase coordination?
- Should a supposed Component actually be an Application boundary—or remain code-local?

## Useful lenses—not required schemas

- Cohesion and coupling, information hiding, and stable dependencies.
- Domain boundaries and ports/adapters.
- Contract testing and executable specifications.
- Acyclic dependency principles.
- Change-frequency and ownership analysis.
- Feature slicing versus technical-layer slicing.

## Common failure modes

- One Component per file, route, table, class, or visual element.
- “Manager,” “utils,” or “shared” Components with unbounded responsibility.
- Components grouped by framework layer but coupled through shared mutable state.
- Public contracts implicit in direct adapter calls.
- Gherkin files listed without real ownership or missing from the repository.
- Unit tests replacing observable feature scenarios.
- A Component assigned to multiple Applications through dependencies.
- Cycles rationalized as convenience.

## Contract-design questions for this provisional area

Before accepting the M21 area, decide:

- controlled sections and types;
- required responsibility, visibility, layer, parent, and feature ownership representation;
- direct Application ID rules;
- public/provided/consumed contract relationships;
- dependency map and cycle diagnostics;
- relationship to Application Architecture responsibilities and Code Design contracts;
- how genuinely shared non-executable Components are owned;
- completeness and test-evidence requirements.

## Handoff

Code Design refines Component-owned semantic models, interfaces, events, errors, and state contracts. Implementation receives the Component's accepted Gherkin set as the primary behavior contract. Deployment normally operates Applications, not arbitrary Components, unless a deployment concern has independent meaning.
