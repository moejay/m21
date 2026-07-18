---
name: m21
description: Spec-driven development workflow for M21 projects. Use whenever you author specs, edit them, or implement code in an M21 project.
license: MIT
metadata:
  author: m21
  version: "3.0"
---

# M21 — Spec-Driven Development Workflow

This skill defines the workflow for working in an M21 project: authoring contracts, editing them, and implementing code. An M21 contract has four ordered layers: the concern's data model, its semantic interfaces, its architectural spec, and its executable Gherkin features. Specs often describe code modules, but they may also describe durable project concerns such as design systems, external services, deployments, observability, tracing, or scale architecture when those concerns provide or consume explicit contracts. Not every concern needs every layer.

## The contract stack — always work top-down

For every durable contract change, inspect and update these layers in order:

1. **Data model** — domain concepts, attributes, relationships, states, and constraints.
2. **Interfaces** — capabilities, operations, commands, queries, and events expressed through the data model.
3. **Architectural spec** — responsibilities, non-goals, invariants, dependencies, decisions, assumptions, and operational guarantees.
4. **Features** — executable examples of observable behavior or evidence-backed guarantees.
5. **Tests and implementation** — red/green delivery of the contract.

A layer may be skipped when the requested change does not affect it, but it must be evaluated before moving to the next layer. A feature change therefore requires an interface review first; an interface change requires a data-model review first. Do not modify a downstream layer and then silently retrofit an upstream contract around the implementation.

When changing several concerns, apply this order across the affected dependency graph: update owned models before interfaces that consume them, then architectural specs, then features, then implementation. Check downstream consumers before renaming or removing any model concept, interface, feature, or spec.

Do **not** create specs or features just to mirror files, folders, helper functions, repo chores, checklists, or implementation mechanics. Specs are load-bearing only when they describe architecture, behavior, external assumptions, or operational guarantees that should survive regeneration. Features are load-bearing only when they describe an observable outcome that can be tested or verified by evidence.

> If the user requests a code-only maintenance change with no contract change — dependency bumps, refactors that preserve behavior, generated assets, CI plumbing, docs-only edits — do not invent a scenario. If the change reveals a missing behavioral or operational contract, pause and add the smallest useful scenario.

## Test runner contract

M21 does not prescribe a runner — the choice (cucumber, vitest-cucumber, jest-cucumber, behave, custom, etc.) and the wiring (where step defs live, file extensions, discovery mechanism) are decided per project. What is non-negotiable is the contract the runner must uphold:

- The runner MUST treat the project's `features/` directory as its executable source of truth when features exist — every `.feature` file there is part of the contract.
- A scenario with no matching step definition is **red** (pending or failing — the agent's signal to write the stub and the implementation).
- Tests that assert behavior not described in any `.feature` file are forbidden — that signal is "go to Phase 1 and add a scenario," not "skip the spec."
- `src/` code that contradicts a passing scenario is the bug, not the scenario.

When entering a project, read its test config to learn how the project wired its runner. Match that convention; do not impose a different one.

## Project structure

The shape below is illustrative. `spec/`, `features/`, and `src/` are conventional; the rest (test entry, step definition layout) is per-project.

```
project/
├── spec/                       # Spec markdown files (one per module)
│   ├── auth.md
│   └── persistence.md
├── features/                   # Gherkin .feature files (one subdir per spec)
│   ├── auth/
│   │   └── user-login.feature
│   └── persistence/
│       └── data-storage.feature
├── src/                        # Implementation (one module per spec)
└── test/                       # Runner-specific — see project's test config
```

---

## Use the M21 CLI while working

Use the M21 tool as a feedback loop for spec work. Prefer the published package command in user projects:

```bash
npx @moejay/m21 validate ./spec --json
npx @moejay/m21 list ./spec --json
npx @moejay/m21 show ./spec <name> --json
npx @moejay/m21 features ./spec [<name>] --json
npx @moejay/m21 deps ./spec <name> --json
npx @moejay/m21 model ./spec [<name>] --json
npx @moejay/m21 schema ./spec [<name>]
```

On entering an M21 project, run `npx @moejay/m21 validate ./spec --json` after locating the spec directory. Use `list`, `show`, `features`, `deps`, and `model` to understand the existing graph and contract registry before editing. After changing specs or features, run `validate` again and treat broken dependency references, broken `uses` references, missing feature directories, and cycles as work to resolve or explicitly discuss with the user.

In the M21 repository itself, `npx . validate ./spec --json` or `node bin/m21.js validate ./spec --json` may be used to exercise the local checkout instead of the published package.

---

## What belongs in a spec

The Markdown body is human-owned but has an optional canonical order. Include only sections that carry useful contract information; never generate empty boilerplate. When present, sections MUST appear in this order:

```markdown
# Concern Name

## Data model
...

## Interfaces
...

## Contract
...
```

Existing unsectioned specs remain valid. When a contract-bearing spec is materially edited, migrate the affected content into this order without inventing missing concepts.

### Data model

Describe domain meaning, not storage or language structures:

- entities, value objects, records, messages, and other named concepts
- attributes and their meaning, identity, cardinality, and optionality
- relationships and ownership
- valid states, transitions, and lifecycle
- constraints that valid data must satisfy

Each concept has one owning spec. Other specs reference that concept through a declared dependency rather than redefining it. Database tables, ORM mappings, serialized field trivia, and language type declarations do not belong here unless the user records them as deliberate constraints.

When model structure must be enforced, declare it in fenced `m21-model` YAML. Prose may explain the model but cannot override the block:

```m21-model
entities:
  User:
    identity: id
    fields:
      id: { type: string, required: true }
      email: { type: string, format: email, required: true }
      status: { type: enum, values: [active, suspended] }
```

Supported structural types are `string`, `number`, `integer`, `boolean`, `object`, `array`, `enum`, and `reference`. Local references use `Entity`; cross-spec references use `spec-name.Entity` and require `depends_on` for that spec. Textual constraints are documentation until backed by a structural declaration, state model, executable feature, or supported constraint language.

### Interfaces

Describe stable semantic surfaces, not source-level signatures. An interface may be a capability, operation, command, query, event, protocol interaction, or user interaction. Give it a stable kebab-case identifier when other contracts need to reference it, and define as applicable:

- purpose
- inputs and preconditions, using data-model concepts
- outputs and postconditions
- expected failures
- state changes and other effects
- events emitted or consumed

Conceptual notation such as `create-user(UserRegistration) → User | DuplicateIdentity` is acceptable. Enforceable interfaces use fenced `m21-interface` YAML and reference declared entities:

```m21-interface
operations:
  create-user:
    purpose: Register a new user.
    input: UserRegistration
    output: User
    failures: [DuplicateIdentity, InvalidRegistration]
    effects: [The user becomes available for authentication]
```

Operation identifiers must be kebab-case. Language declarations, source paths, framework handlers, and incidental helper functions are not. Public implementation behavior must be covered by an interface; private implementation helpers must not be promoted into the contract.

### Contract

The architectural contract answers, in **domain language** anyone can read:

- **Responsibilities** — what this spec concern is accountable for, stated as outcomes, not mechanisms.
- **Non-goals** — what it deliberately does *not* do. Often the highest-value sentence in the spec, because it's the thing scenarios can't express.
- **Invariants** — what must always hold, no matter how the concern is built or operated ("edits never touch frontmatter", "no file outside the project root is ever written").
- **Decisions** — constraints the user deliberately chose, recorded with the reason. A decision may name a technology ("local-first storage using SQLite — no server dependency"): that is a **constraint the user owns**, not a description of the code. This is the *only* place implementation vocabulary belongs.

### The regeneration test

Specs and features must stay language-agnostic: a competent developer — in a different language, framework, or decade — should be able to rebuild the module from the spec and its features alone and get the same behavior. Before writing a sentence into a spec body, apply the **regeneration test**: *would this sentence survive translation to another language or stack?* If not, it doesn't belong — it describes the current implementation, not the module.

### Implementation smells

These do not belong in a spec body (or in scenarios). Each one couples the spec to today's code and will silently rot:

- **File paths and symbol names** — `src/server.js`, function or class names, module file layout
- **Library and framework names** — outside a recorded decision
- **Tuning constants and magic numbers** — timeouts, force strengths, buffer sizes, port defaults that aren't part of the contract
- **Size and location trivia** — line counts, "defined in", "implemented with"
- **Language idioms** — promises, goroutines, decorators, anything that presumes the stack

When editing a spec that already contains these, flag them to the user and offer to remove them — don't update them to match the code, delete them.

### Interface vs. scenario

Interfaces define the available surface and its rules; scenarios demonstrate selected observable outcomes. Do not use Gherkin as the only declaration of inputs, outputs, failures, or effects, and do not duplicate every scenario in prose. If a contract statement is best understood as an example of behavior ("when the results file changes, the graph updates"), it belongs in a scenario tied to the relevant interface or guarantee.

### Specs beyond code modules

M21 specs can describe any durable contract provider or consumer, not only implementation modules. Use this when the project needs to preserve architectural context that would otherwise live in scattered docs or assumptions:

- **Design systems / visual language** — tokens, components, accessibility baseline, interaction patterns, information hierarchy.
- **External services** — APIs, managed platforms, registries, payment providers, identity providers, telemetry backends.
- **Deployments and runtime topology** — what runs where, required infrastructure contracts, rollout and rollback expectations.
- **Observability and tracing** — logs, metrics, spans, correlation IDs, alertable symptoms, diagnostic affordances.
- **Scale and failure modes** — expected load shape, degradation behavior, backpressure, durability or recovery guarantees.

Keep these specs contract-shaped. A deployment spec is not a checklist; it describes guarantees the deployed system depends on or provides. An observability spec is not a tool inventory; it describes evidence the system emits so operators can understand it.

---

## Phase 1 — Update the contract stack

Use this phase when the user asks to add, change, or remove data, interfaces, behavior, responsibilities, dependencies, invariants, assumptions, operational guarantees, or other durable contract information.

### 1.1 Understand and locate ownership
- Identify what changes and which concern owns it. If ownership is unclear, present candidates rather than guessing.
- Reuse an existing meaningful boundary when it fits; create a new spec only for a new durable contract concern.
- Keep repo chores, generated assets, helper-only refactors, and implementation details out of the M21 contract.

### 1.2 Read the current stack and consumers
Read the target spec's data model, interfaces, contract, and feature files. Read dependencies whose concepts/interfaces it consumes and downstream specs that depend on it. Use `show`, `features`, and `deps` before editing.

### 1.3 Update the data model first, if affected
- Add or change owned concepts, attributes, relationships, states, and constraints in prose and any enforceable `m21-model` blocks.
- Resolve naming and ownership before describing operations over the concepts.
- Run `m21 validate` after this layer; do not proceed with invalid or unresolved model references.
- Before removal or rename, find interfaces and downstream specs that reference the concept.
- If unaffected, leave it unchanged and continue; do not add filler.

### 1.4 Update interfaces second, if affected
- Define or revise semantic inputs, outputs, failures, effects, and events using the current data model and any `m21-interface` blocks.
- Keep stable identifiers stable unless the contract intentionally breaks.
- Run `m21 validate` after this layer; use `m21 schema` when structural compatibility matters.
- Check downstream consumers before removing or changing an interface.
- If unaffected, leave it unchanged and continue.

### 1.5 Update the architectural contract third, if affected
- Update responsibilities, non-goals, invariants, decisions, dependencies, assumptions, and operational guarantees.
- Update `depends_on` when model or interface consumption changes.
- Do not restate the model, interface definitions, or scenarios in prose.

### 1.6 Update features fourth, if affected
- Add or change a feature only for an observable interface outcome or evidence-backed guarantee worth making executable.
- Create `.feature` files under `features/<spec>/`, matching surrounding phrasing and detail.
- Feature names remain dependency-level capability identifiers used by `depends_on[].uses`; scenarios exercise one or more declared interfaces or architectural guarantees.
- Before removing a feature, check downstream `uses` references.

### 1.7 Validate and report
Run M21 validation, fix or discuss graph issues, summarize files changed, and flag downstream consumers requiring migration.

### Phase 1 rules
- Contract files are user-owned; obtain approval before changing their meaning. Approval of a requested contract change covers the necessary ordered layers.
- Match existing style while preserving model → interfaces → contract ordering where sections are present.
- Never change a downstream layer first merely because it is easier to infer from code.
- Skip unaffected layers rather than manufacturing content.

---

## Phase 2 — Implement red/green

Use this phase to make the new or modified executable feature scenarios pass. If no feature changed, run the project's normal validation for the code change instead.

### 2.1 Read the complete contract
- Which data concepts and constraints does this concern own or consume?
- Which interfaces must the implementation provide or call?
- What is the concern responsible for, and what does it depend on?
- Which executable features demonstrate the behavior?

If implementing multiple specs, walk the dependency graph: start with specs that have no `depends_on` (roots) and work down. The features a spec `uses` from a dependency must already pass before that spec is implemented.

## 2.3 Red — confirm scenarios fail
Run the feature suite. Every scenario for this spec must fail because the implementation doesn't exist yet. If a scenario passes before code is written, investigate — either the test setup is wrong or the feature is already implemented elsewhere.

### 2.4 Green — implement one scenario at a time
1. Pick the simplest scenario first.
2. Write the minimum code to make it pass.
3. Run the feature → confirm green.
4. Move to the next scenario.
5. Refactor only after all scenarios in a feature pass.

**Do not** add public data, interfaces, or behavior absent from the contract stack. If something is missing, return to Phase 1 and update model → interfaces → contract → features in order, skipping unaffected layers, then implement.

### 2.5 Verify dependency contracts
If the spec declares `uses` against a dependency, the implementation must actually consume those features. If it doesn't, either the implementation is wrong or the spec needs updating — flag it and return to Phase 1 if the user agrees.

### 2.6 Run the full feature suite
After implementing one spec, run *all* features — not just the one you worked on. Implementation of one spec must not break another's. Then run `npx @moejay/m21 validate ./spec --json` to confirm the contract graph still resolves.

### Phase 2 rules
- Features are the contract. A passing suite means the implementation is correct; a failing scenario means the implementation is wrong (not the feature).
- If a feature seems wrong → stop, ask the user, return to Phase 1 if they confirm a change.
- Never silently skip or disable a scenario.
- Step definitions must be thin, they translate Gherkin to calls into `src/`. No business logic in step definitions.

---

## Reference: spec file format

Each spec is a `.md` file inside the spec directory with YAML frontmatter and an optional markdown body. The parser keeps the body as Markdown; M21 authoring convention gives its optional sections the semantic order Data model → Interfaces → Contract.

### Frontmatter fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | **Yes** | `string` | Unique identifier. How other specs reference it in `depends_on`. |
| `description` | No | `string` | Short summary. Shown in the graph info panel. |
| `group` | No | `string` | Logical grouping. Specs in the same group are visually clustered. |
| `tags` | No | `string[]` | Tags for filtering and categorization. |
| `depends_on` | No | `array` | Dependencies. Supports simple strings and objects with `uses`. |
| `features` | No | `string` | Relative path to the directory containing this spec's `.feature` files. |

A file without a `name` is silently skipped.

### Minimal spec

```markdown
---
name: bootstrap
---
```

### Full spec
```markdown
---
name: persistence
description: Database layer for local storage
group: infrastructure
tags: [database, storage]
depends_on:
  - name: bootstrap
    uses: [project-scaffolding, health-endpoint]
features: features/persistence/
---

# Persistence

## Data model

A Record is a persistable domain value with stable identity and validated content.

```m21-model
entities:
  Record:
    identity: id
    fields:
      id: { type: string, required: true }
      content: { type: object, required: true }
```

## Interfaces

```m21-interface
operations:
  data-storage:
    input: Record
    output: Record
    failures: [InvalidRecord, StorageUnavailable]
    effects: [Makes the Record available to later retrieval]
```

## Contract

Provides durable local storage without owning domain-specific record content.

### Decisions

- Use SQLite for local-first storage — avoids a server dependency
```


### Dependency format

`depends_on` supports two forms that can be mixed:

**Simple:**
```yaml
depends_on:
  - bootstrap
  - config
```

**Rich (with feature references):**
```yaml
depends_on:
  - name: bootstrap
    uses: [project-scaffolding, health-endpoint]
  - name: persistence
    uses: [data-storage]
```

The `uses` array references `Feature:` names declared in the parent spec's `.feature` files. This creates a traceable contract between modules and shows up as a labeled edge in the graph.

### Dependency rules
- Matched **case-insensitively** against other specs' `name`.
- A reference to a non-existent name is silently ignored.
- Cycles are allowed but visualized as cycles.
- Roots (no `depends_on`) appear at the top in tree layout.

### Groups and candidate spec boundaries
Specs sharing a `group` value are clustered with a colored hull. Groups are view labels, not a fixed taxonomy. Choose names that help a maintainer see the system's shape.

Useful starting groups and specs:

- `foundation` / `core` — `bootstrap`, configuration, shared contracts, startup or initialization guarantees.
- `domain` — business rules and core product capabilities.
- `infrastructure` — persistence, caching, messaging, filesystem, network, external integrations.
- `interface` — CLI, API, protocol boundaries, public service contracts.
- `experience` / `ui` — `visual-language`, design system, accessibility baseline, interaction and presentation contracts.
- `operations` — deployment topology, runtime configuration, observability, tracing, scale architecture, failure-mode behavior.

Prefer a `bootstrap` spec when the project has startup/scaffolding/setup guarantees that many specs rely on. Prefer a `visual-language` or design-system spec when UI behavior depends on shared visual, interaction, or accessibility contracts. Prefer operations specs only when they carry durable guarantees, not as a dumping ground for release checklists.

---

## Reference: Gherkin feature files

Feature files use standard Gherkin. They live in the directory referenced by `features:`. Feature names are **behavioral capability identifiers** — other specs declare which capabilities they `uses`. The semantic interface itself is declared in the owning spec's Interfaces section; scenarios provide executable examples of its observable behavior.

### Structure
```gherkin
@optional-tag
Feature: feature-name-in-kebab-case
  Optional description text.

  Scenario: First scenario name
    Given some precondition
    When an action is performed
    Then an expected outcome occurs
    And another assertion

  Scenario: Second scenario name
    Given a different setup
    When something else happens
    Then verify the result
```

### Rules
- One `Feature:` per file (first one is used).
- Feature names **must be kebab-case**: `Feature: data-storage`, not `Feature: Data Storage`.
- Same kebab-case applies to `uses` references.
- Steps use `Given`, `When`, `Then`, `And`, `But`.
- File extension must be `.feature`.
- Filename should match feature name: `data-storage.feature`.

### Step definitions
- Location, language, and file convention are decided per project — match what's already there.
- Steps are thin — they translate Gherkin to calls into `src/`. No business logic in steps.

---

## Reference: CLI

Use `npx @moejay/m21` in projects unless the user has a local/global `m21` command they prefer.

```bash
npx @moejay/m21 ./spec/                         # Dev server with live reload (default)
npx @moejay/m21 ./spec/ -y                      # Auto-create spec dir if missing
npx @moejay/m21 ./spec/ --port 4000             # Custom port
npx @moejay/m21 ./spec/ --host 127.0.0.1        # Explicit host binding
npx @moejay/m21 ./spec/ --output graph.html     # Static HTML export
npx @moejay/m21 ./spec/ --results results.json  # Overlay Cucumber, Jest, or vitest JSON results
```

Read-only subcommands for humans and agents:

```bash
npx @moejay/m21 list ./spec/                    # Print all specs
npx @moejay/m21 show ./spec/ <name>             # Print one spec's deps, dependents, features, body
npx @moejay/m21 features ./spec/ [<name>]       # List features across all specs or one spec
npx @moejay/m21 deps ./spec/ <name>             # Print forward + reverse dependency tree
npx @moejay/m21 validate ./spec/                # Lint graph, model, interface, and feature contracts
npx @moejay/m21 model ./spec/ [<name>]           # Export normalized model/interface registry
npx @moejay/m21 schema ./spec/ [<name>]          # Export entity contracts as JSON Schema
```

Each read-only subcommand accepts `--json`; agents should prefer JSON output when parsing command results.

| Flag | Description |
|------|-------------|
| `--output`, `-o` | Save HTML to path instead of serving |
| `--port` | Dev server port (default 3333) |
| `--host` | Host/address for the dev server to bind; default is loopback only |
| `--results` | Explicit test-results file for status overlay; otherwise conventional paths are auto-detected |
| `--json` | Machine-readable output for read-only subcommands |
| `-y`, `--yes` | Auto-create spec dir if missing |
| `--help`, `-h` | Show help |
| `--version`, `-v` | Show version |

The dev server watches spec, feature, and result files for changes and pushes updates to the browser in real time.
