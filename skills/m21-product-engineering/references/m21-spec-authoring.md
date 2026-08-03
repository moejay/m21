# M21 specification authoring

Load this reference before creating, editing, reviewing, or implementing any file under `spec/` or `features/`. This is the standalone contract-format guide bundled with the skill.

## What an M21 spec is

An M21 spec is a durable, regeneration-quality contract for one meaningful concern. It tells a competent developer what domain concepts, semantic interfaces, guarantees, boundaries, and observable behavior must exist without requiring today's source tree or framework.

A spec is **not**:

- a generic document for each Definition Area;
- a project plan, task list, status report, or file inventory;
- a mirror of source modules, classes, endpoints, tables, or folders;
- a container for every fact discovered in Business or design work;
- a substitute for canonical OKF product knowledge.

Definition Areas organize product knowledge. M21 specs organize durable implementation and operational contracts. They intersect, but they are not the same taxonomy.

Do not automatically generate `business.md`, `solution.md`, `visual-design.md`, and so on. Create an area-named spec only when the product being built actually provides that Definition Area's schema/workspace contract—as M21 itself does. For another product, derive concern boundaries from its accepted product knowledge: identity, catalog, ordering, billing, document collaboration, telemetry, deployment platform, visual language, and similar contract providers.

## Detect the project mode

### Module contract mode

Signs:

- `spec/*.md` files use `name`, `depends_on`, and optional `features`.
- Bodies contain `m21-model` and `m21-interface` blocks.
- Features live under directories referenced by specs.

Author actual product/module/operational concerns. Follow the existing dependency graph and naming style.

### OKF Definition Area mode

Signs:

- `m21-spec/SCHEMA-CONVENTIONS.md` exists.
- Canonical concepts use singular `area` plus an area namespace.
- `okf/` contains accepted product knowledge.

Read `m21-spec/CONTEXT.md`, `SCHEMA-CONVENTIONS.md`, `PROGRESS.md`, and the target area contract completely. Area specs define the profile/workspace contract; product knowledge remains in OKF concepts.

### Incremental migration

Both modes may coexist. Use accepted singular-area contracts where migrated and preserve legacy metadata elsewhere. Never infer that an unstarted area is approved because a previous one is migrated.

## Choose spec boundaries

A spec deserves independent identity when the concern:

- owns domain concepts or semantic contracts used elsewhere;
- provides a stable capability or operational guarantee;
- has explicit responsibilities and non-goals;
- can change for reasons meaningfully distinct from neighboring concerns;
- participates in the dependency graph;
- can be rebuilt and verified independently enough to explain its contract.

Do not create a spec solely for a file, folder, helper, framework adapter, documentation section, UI widget, or repository chore.

### Boundary questions

- What durable concern owns this behavior or data?
- What concepts and interfaces does it provide?
- Which other concerns consume them?
- What must remain true if implementation technology changes?
- What does it explicitly not own?
- Would combining it with a neighboring spec improve cohesion?
- Would splitting it expose a real stable contract or only mirror code organization?

## Required file shape

Each spec is a Markdown file under the project's spec directory:

```markdown
---
name: order-management
description: Owns order intent, validation, lifecycle, and fulfillment handoff.
group: commerce
tags: [orders, domain]
depends_on:
  - name: product-catalog
    uses: [product-availability]
features: features/order-management/
---

# Order Management

## Data model

<Domain meaning, identity, ownership, relationships, valid states, and constraints.>

```m21-model
entities:
  Order:
    identity: id
    fields:
      id: { type: string, required: true }
      state: { type: enum, values: [pending, confirmed, cancelled], required: true }
```

## Interfaces

<Stable semantic operations, inputs, outputs, failures, effects, and events.>

```m21-interface
operations:
  confirm-order:
    purpose: Confirm a valid pending order for fulfillment.
    input: Order
    output: Order
    failures: [InvalidOrder, OrderNotPending, ProductUnavailable]
    effects: [The order becomes available for fulfillment]
```

## Contract

<Responsibilities, non-goals, invariants, decisions, assumptions, and operational guarantees.>
```

Use only useful sections. Do not generate empty headings. When present, preserve the order: Data model → Interfaces → Contract.

## Frontmatter

| Field | Requirement | Meaning |
|---|---|---|
| `name` | Required | Unique lowercase kebab-case spec identifier |
| `description` | Optional but recommended | Concise durable responsibility |
| `group` | Optional | Visualization grouping, not architecture by itself |
| `tags` | Optional | Discovery/filter labels |
| `depends_on` | Optional | Specs whose owned contracts this spec consumes |
| `features` | Optional | Relative directory containing this spec's `.feature` files |

### Dependencies

Simple form:

```yaml
depends_on:
  - bootstrap
  - identity
```

Rich form with consumed behavioral capabilities:

```yaml
depends_on:
  - name: identity
    uses: [authenticated-identity, authorization-decision]
```

`uses` values reference `Feature:` names declared by the dependency. They are dependency-level behavioral capabilities, not scenario names or source functions.

Do not add a dependency merely because two concerns are related in prose. Add it when one spec consumes concepts, interfaces, or guarantees owned by the other.

## Data model

Describe domain meaning rather than persistence or language declarations.

Include as applicable:

- entities and stable identity;
- value objects and units;
- ownership and cardinality;
- valid states and transitions;
- invariants and constraints;
- messages/events with domain meaning;
- cross-spec references to concepts owned by dependencies.

Supported structural field types include:

```text
string, number, integer, boolean, object, array, enum, reference
```

Example cross-spec reference:

```yaml
fields:
  customer:
    type: reference
    target: identity.Customer
    required: true
```

Declare `identity` in `depends_on` when consuming `identity.Customer`.

Use `m21-model` only for structure that should be validated. Prose explains meaning and constraints unsupported by the structural language; it cannot contradict the block.

Avoid:

- table/column/ORM mappings unless deliberately accepted as a durable constraint;
- TypeScript/Java/Python declarations;
- UI form state;
- invented fields to make a schema look complete;
- generic lifecycle state with no domain meaning.

## Interfaces

Interfaces describe stable semantic surfaces—not source-level methods or routes. They may be operations, commands, queries, events, protocols, or human interactions.

Use lowercase kebab-case operation IDs. Define as applicable:

- purpose;
- input and preconditions;
- output and postconditions;
- expected failures;
- effects/state changes;
- events emitted or consumed.

Example:

```m21-interface
operations:
  reserve-product:
    purpose: Reserve currently available product quantity for one pending order.
    input: ReservationRequest
    output: Reservation
    failures: [ProductUnavailable, InvalidQuantity, ReservationConflict]
    effects: [Reduces quantity available to competing reservations until expiry]
```

Avoid language signatures, HTTP details, current handler names, database calls, and private helpers unless the user has accepted one as a deliberate external constraint.

## Contract

The Contract section records durable architecture in domain language.

### Responsibilities

State outcomes the concern is accountable for.

### Non-goals

State adjacent responsibilities it deliberately does not own. This prevents boundary erosion.

### Invariants

State what must always hold regardless of implementation: accepted state is never partially persisted; secrets never enter generated output; invalid scope never widens; and similar guarantees.

### Decisions

Record deliberate technology or architecture constraints only when the user owns the choice and its reason. This is the appropriate place for necessary implementation vocabulary.

### Operational guarantees

Include failure, recovery, performance, security, accessibility, compatibility, observability, or external assumptions when they are durable parts of the concern's contract.

## Regeneration test

Before adding spec prose, ask:

> Could a competent developer rebuild this concern in another language, framework, repository layout, or decade and preserve the same behavior and guarantees?

If not, the content likely belongs in Implementation evidence, source documentation, or a deliberate Decision—not the durable spec.

## Executable features

A spec's features live in the directory declared by `features:`:

```text
features/order-management/
  order-confirmation.feature
  order-cancellation.feature
```

Each file contains one kebab-case `Feature:` capability:

```gherkin
Feature: order-confirmation
  Accepted valid orders can enter fulfillment without overselling unavailable products.

  Scenario: Confirm an available order
    Given a pending valid order with available products
    When the order is confirmed
    Then the order becomes available for fulfillment
    And the reserved product quantity is no longer available to another order
```

Feature rules:

- scenarios demonstrate observable interface outcomes or evidence-backed guarantees;
- unmatched steps are failures, never silently skipped;
- steps remain domain language and technology-neutral;
- private helpers, source symbols, repository chores, and every edge case do not become scenarios;
- lower-level tests supplement accepted scenarios rather than replacing them;
- changing a scenario means changing a contract, not making a defect pass.

## Model → interface → contract → feature order

For a durable change:

1. Update owned data concepts and constraints.
2. Update semantic interfaces consuming that model.
3. Update responsibilities, non-goals, invariants, decisions, and dependencies.
4. Add or revise the smallest valuable executable scenario.
5. Confirm the scenario fails for the intended reason.
6. Implement and make it pass.
7. Run all features, focused tests, build, and spec validation.

Skip unaffected layers; never create filler.

## CLI feedback loop

Use the published CLI in user projects:

```bash
npx @moejay/m21 validate ./spec --json
npx @moejay/m21 list ./spec --json
npx @moejay/m21 show ./spec <name> --json
npx @moejay/m21 features ./spec [<name>] --json
npx @moejay/m21 deps ./spec <name> --json
npx @moejay/m21 model ./spec [<name>] --json
npx @moejay/m21 schema ./spec [<name>]
```

Run `validate` before and after edits. Use `list`, `show`, `deps`, `features`, and `model` to understand an existing project before generating files.

## Frequent generation mistakes

- Creating one spec per Definition Area for an unrelated product.
- Creating `business.md` containing generic business notes instead of a concern contract.
- Omitting frontmatter `name` so the CLI silently skips the file.
- Writing prose without `m21-model` or `m21-interface` where enforceable structure matters.
- Defining models in multiple specs instead of one owner plus dependencies.
- Adding `depends_on` without actual consumption.
- Using feature file paths instead of a feature directory.
- Naming features as sentences rather than kebab-case capabilities.
- Mirroring code files, endpoints, classes, or database tables.
- Generating empty Data model, Interfaces, or Contract headings.
- Treating specs as canonical product research rather than implementation contracts.
