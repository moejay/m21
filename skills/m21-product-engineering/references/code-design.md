# Code Design expert guide

Use for regeneration-quality semantic contracts within one selected Application. This Definition Area remains provisional unless the active project has accepted a newer contract.

## Provisional ownership

Domain and application models, semantic interfaces, state machines, commands, queries, events, errors, invariants, dependency rules, patterns, constraints, decisions, and executable behavior needed to implement accepted Components.

## Does not own

Current file paths, private helper symbols, framework syntax, generated code, implementation progress, repository task lists, infrastructure, or rollout.

## Expert stance

Act as a domain modeler, API/contract designer, state-machine thinker, and test-design expert. Produce contracts sufficiently precise that a competent developer could regenerate behavior in another language or framework.

Challenge anemic records, CRUD-only interfaces, primitive obsession, invalid states, generic errors, temporal ambiguity, and “design” documents that are inventories of today's classes and files.

## Best practices

- Begin with accepted Component responsibilities and observable feature guarantees.
- Use domain language and stable semantic names.
- Give models explicit identity, ownership, invariants, cardinality, and valid state.
- Make invalid states unrepresentable where the contract format supports it; otherwise state diagnostics and preconditions.
- Design interfaces around intent, not storage or transport verbs.
- Define inputs, outputs, preconditions, postconditions, failures, effects, and emitted/consumed events.
- Distinguish commands, queries, notifications, and long-running processes.
- Make concurrency, idempotency, ordering, retry, cancellation, and version compatibility explicit when relevant.
- Use domain-specific failure categories that preserve accepted state and avoid secret leakage.
- Keep ports independent of adapters and frameworks.
- Use patterns only to solve an identified force; record why.
- Tie public contracts back to executable scenarios and lower-level evidence.

## High-value questions

### Models and invariants

- What concept has identity, and what remains a value?
- Who owns creation, mutation, and lifecycle of this state?
- Which combinations are invalid?
- Which invariants span several values or operations?
- What must be preserved across serialization, migration, concurrency, or replay?
- Are units, time, locale, precision, and absence semantics explicit?

### Interfaces

- What user/domain intent does the operation express?
- What input is required, trusted, validated, or derived?
- What output and postcondition can consumers rely on?
- What side effects or events occur?
- What failures are expected and actionable?
- Does the interface leak storage, HTTP, UI, provider, or framework detail?

### State and time

- What states exist and which transitions are valid?
- Who may trigger each transition and under what preconditions?
- What happens on duplicate, stale, reordered, concurrent, timed-out, or cancelled requests?
- Is time an input, external fact, deadline, duration, or ordering source?
- Can partial effects occur, and how are they recovered or compensated?

### Events and errors

- Is the event a durable domain fact or an implementation notification?
- What identity, version, ordering, and correlation semantics matter?
- Can consumers process it idempotently?
- Which failure should be retried, rejected, surfaced, or translated?
- Does an error reveal secrets or unstable implementation detail?

### Patterns and dependencies

- What force requires this pattern?
- Which simpler design was considered?
- Does the dependency rule preserve the Application Architecture boundary?
- Can public behavior survive a framework, transport, or persistence change?

## Regeneration test

A Code Design contract should let another implementation preserve:

- semantic entities and values;
- valid states and invariants;
- operation intent and effects;
- expected failure meaning;
- event semantics;
- dependency boundaries;
- observable feature behavior.

If the contract requires current class names, paths, decorators, ORM mappings, or framework handlers to make sense, it is too implementation-specific.

## Useful lenses—not required schemas

- Domain-driven design and algebraic data modeling.
- Command/query separation and state machines.
- Design by contract and property-based thinking.
- Ports/adapters and dependency inversion.
- Event design, idempotency, and compatibility.
- API evolution and consumer-driven contracts.
- Secure input/output and failure design.

## Common failure modes

- One model per database table.
- Interfaces named after transport routes or repository methods with no domain intent.
- `string` or `object` used where constraints and units matter.
- Generic “validation failed” or leaked stack/provider errors.
- Hidden state transitions and race conditions.
- Events used as remote procedure calls.
- Patterns selected by preference rather than force.
- Tests asserting public behavior absent from any accepted feature.
- Specs updated to mirror renamed files or symbols.

## Contract-design questions for this provisional area

Before accepting the M21 area, decide:

- controlled sections and types for models, interfaces, contracts, states, events, errors, patterns, constraints, decisions, and features;
- structural model and semantic interface representation;
- ownership links to Components and direct Application scope;
- event, error, and state relationship vocabulary;
- compatibility and completeness diagnostics;
- executable Gherkin ownership and supporting test evidence;
- boundary with Application Architecture and Implementation.

## Handoff

Implementation receives semantic contracts and executable features, then chooses current language/framework symbols and files. Returned evidence should map to contracts and scenarios. Implementation must not redefine Code Design merely because a library makes another shape convenient.
