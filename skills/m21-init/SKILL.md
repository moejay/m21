---
name: m21-init
description: Generate M21 spec files and Gherkin features from an existing codebase. Use for brownfield adoption — analyze existing code structure and context to create specs that reflect the project's modules, durable contract concerns, and dependencies. Add --interactive to get some verification and chance to chat it out 
license: MIT
metadata:
  author: m21
  version: "2.0"
---

# M21-init — Brownfield Spec Generator

You are helping the user generate M21 specification files from an existing codebase. This is for **brownfield adoption** — the project already has code and context, and you need to create specs that reflect its current modules, durable contract concerns, and dependencies.

## Goal

Analyze the existing codebase and generate an ordered M21 contract stack:
1. **Data models** for domain concepts owned by each meaningful contract boundary
2. **Semantic interfaces** for capabilities, operations, commands, queries, and events
3. **Architectural specs** for responsibilities, dependencies, invariants, decisions, and guarantees
4. **Feature files** only for executable observable behavior or evidence-backed guarantees

A layer may be omitted when it has no useful contract content, but discovery and generation always proceed in this order.

## Process

### Step 1: Identify contract boundaries and ownership

Examine package boundaries, entry points, exports, imports, configuration, shared state, external systems, and project documentation. Identify meaningful contract concerns rather than mirroring files. Assign each domain concept to exactly one owning concern.

### Step 2: Discover data models first

For each concern, infer only durable domain concepts:

- entities, value objects, records, messages, and other named concepts
- semantic attributes, identity, cardinality, and optionality
- relationships and ownership
- valid states, transitions, and lifecycle
- constraints valid data must satisfy

Abstract away database schemas, ORM mappings, serialization trivia, and language types unless they represent deliberate project constraints. Encode enforceable structure in `m21-model` YAML blocks using M21's language-neutral types. If a concern owns no meaningful data model, omit the section.

### Step 3: Discover semantic interfaces second

Find public exports, endpoints, commands, events, user interactions, and calls between concerns, then express them without source-level signatures. Encode enforceable operations in `m21-interface` YAML blocks. For each durable interface define its purpose, inputs, outputs, failures, effects, and emitted/consumed events as applicable. Use the data-model concepts established in Step 2. Omit private helpers.

### Step 4: Identify architecture and dependencies third

For each concern determine its responsibilities, non-goals, invariants, decisions, guarantees, and direct dependencies. Record which behavioral capabilities it consumes through `depends_on[].uses`. Do not infer a direct dependency solely from a transitive implementation import.

### Step 5: Decide whether features are warranted fourth

Generate a feature only when an interface or architectural guarantee has an observable outcome with a meaningful pass/fail criterion. Features are executable examples, not substitutes for model or interface definitions. Skip discovery details, folder structure, helper utilities, build plumbing, documentation, CI configuration, generated assets, and implementation mechanics.

Name interfaces and features in **kebab-case**: `create-user`, `user-login`, `data-storage`, `api-routing`.

### Step 6: Generate spec files

Create a spec directory (default: `spec/`) and generate one `.md` file per concern. Include only useful sections, always in Data model → Interfaces → Contract order:

```markdown
---
name: module-name
description: Brief description of what this module does
group: logical-group
tags: [relevant, tags]
depends_on:
  - name: other-module
    uses: [feature-a, feature-b]
# Add features: features/module-name/ only when real feature files are generated
---

# Module Name

## Data model

Describe the concepts' meaning, relationships, lifecycle, and semantic constraints.

```m21-model
entities:
  DomainConcept:
    identity: id
    fields:
      id: { type: string, required: true }
      state: { type: enum, values: [active, inactive] }
```

## Interfaces

```m21-interface
operations:
  capability-name:
    input: DomainConcept
    output: DomainConcept
    failures: [ExpectedFailure]
    effects: [Durable state change or emitted event]
```

## Contract

State responsibilities, non-goals, invariants, decisions, and guarantees without repeating the sections above.
```

Omit Data model or Interfaces when genuinely irrelevant. Do not emit empty headings.

### Step 7: Generate feature files only when justified

If the user requests executable features and the behavior is observable, create a `features/` directory with subdirectories per module:

```gherkin
Feature: feature-name-in-kebab-case
  Description of what this feature provides.

  Scenario: Key behavior description
    Given some precondition
    When an action occurs
    Then expected outcome
```

### Step 8: Validate the graph

After generating or editing spec/feature files, run:

```bash
npx @moejay/m21 validate ./spec --json
```

Fix or discuss malformed contract blocks, unsupported model types, unresolved entity/interface references, missing model dependencies, broken spec or `uses` references, missing feature directories, and cycles before considering the generated M21 graph ready. Run `npx @moejay/m21 model ./spec --json` to inspect the normalized registry and `npx @moejay/m21 schema ./spec` to verify schema generation.

## Guidelines

### Technology-agnostic specs or not

**This is critical unless requested explicitly by the user.** Specs must describe modules and features at a high level of abstraction, independent of any specific programming language, framework, or technology. The spec captures **what** a module does and **why**, never **how** it does it.

- **No language-specific terms**: Don't reference classes, functions, decorators, hooks, middleware, or any language construct. Describe capabilities and responsibilities instead.
- **No framework references**: Don't mention Express, Django, React, Rails, Spring, etc. Describe the architectural role.
- **No implementation details**: Don't reference file extensions, import paths, specific libraries, ORMs, or drivers. Describe the concern being addressed.
- **Describe intent, not mechanism**: "Provides persistent data storage and retrieval" not "PostgreSQL connection pool and query interface". "Verifies caller identity" not "JWT token validation middleware".

The model, interfaces, architectural contract, and features should remain valid even if the project is rewritten in a completely different language or framework. Conceptual signatures such as `create-user(UserRegistration) → User | DuplicateIdentity` are allowed; source-language declarations are not.

If the user explicitly mentions to keep the tech stack as part of the spec, then make sure concepts, and modularity is reflected as part of the specs including the bootstrap 

### Module granularity

- **Right-sized**: Each spec should represent a meaningful unit that could be developed, tested, and reasoned about independently.
- **Not too granular**: Don't create a spec per file. Group related files into a single module spec.
- **Not too broad**: Don't lump unrelated concerns together. A "utils" spec is a code smell — break it into focused modules.

### Naming

- Spec names: **kebab-case**, matching the module/directory name where possible
- Feature names: **kebab-case**, describing the capability (e.g., `data-storage`, not `DatabaseClass`)
- File names: Match the spec/feature name (e.g., `data-storage.feature`, `auth.md`)

### Groups

Assign groups based on architectural layers, domains, or durable project context. Groups are view labels, not a fixed taxonomy:
- `foundation` / `core` — `bootstrap`, configuration, shared primitives, startup/scaffolding guarantees
- `infrastructure` — data persistence, caching, messaging, filesystem/network concerns, external integrations
- `domain` — core business logic modules
- `interface` — APIs, CLIs, protocols, public service contracts
- `experience` / `ui` — `visual-language`, design system, accessibility baseline, UI components, pages, layouts, interaction contracts
- `operations` — deployment topology, runtime configuration, observability, tracing, scale architecture, failure-mode behavior
- Or use domain-specific groupings that match the project

Useful potential specs to consider when they carry real contracts: `bootstrap`, `visual-language`, `design-system`, `external-services`, `deployment-topology`, `observability`, `tracing`, and `scale-architecture`. Do not create them as checklists; create them only when other specs consume their guarantees or the project needs those contracts preserved.

### Model and interface identification heuristics

| What you see in code | Contract abstraction |
|---------|----------------------|
| Database/ORM user record | `User` entity with semantic attributes and constraints |
| Request DTO and response type | Interface input and output concepts |
| Enum plus transition logic | Named states and permitted transitions |
| Public function or endpoint | Semantic operation with inputs, outputs, failures, and effects |
| Published or consumed event | Event interface and payload concept |

### Feature identification heuristics

After defining the model and interfaces, identify observable examples and **abstract them** into technology-neutral feature names. If you cannot write a meaningful pass/fail scenario, do not create the feature.

| What you see in code | Feature name (tech-agnostic) |
|---------|----------------------|
| Functions that create user records | `user-creation` |
| A health-check route/endpoint | `health-reporting` |
| Code that runs queries against a data store | `data-querying` |
| Code that wraps multiple operations atomically | `transactional-operations` |
| Event emission on order completion | `order-lifecycle-events` |
| Schema migration files | `schema-evolution` |

### Dependency detection heuristics

| What you see in code | Dependency (tech-agnostic) |
|---------|----------------|
| Module imports another module's data layer | Direct: uses data-persistence module |
| Dependency injection of an auth component | Direct: uses identity module |
| Network calls to another module's endpoints | Indirect: uses interface module |
| Reading configuration from environment/files | Infrastructure: depends on configuration module |
| Shared type definitions or contracts | Structural: depends on contracts module |

### Example output

For a project with auth, data storage, API, and configuration concerns:

**spec/configuration.md:**
```markdown
---
name: configuration
description: Manages application settings and environment-specific values
group: foundation
tags: [config, environment]
depends_on: []
features: features/configuration/
---

# Configuration

## Data model

A Setting is a named application value with a required shape and optional environment-specific value.

```m21-model
entities:
  Setting:
    identity: name
    fields:
      name: { type: string, required: true }
      value: { type: string, required: true }
```

## Interfaces

```m21-interface
operations:
  settings-access:
    input: Setting
    output: Setting
    failures: [MissingSetting, InvalidSetting]
```

## Contract

Provides validated application settings before dependent concerns start.
```

**spec/data-storage.md:**
```markdown
---
name: data-storage
description: Persistent data storage and retrieval
group: infrastructure
tags: [data, persistence]
depends_on:
  - name: configuration
    uses: [settings-access]
features: features/data-storage/
---

# Data Storage

## Data model

A StoredRecord is a persistable value with stable identity and validated content.

```m21-model
entities:
  StoredRecord:
    identity: id
    fields:
      id: { type: string, required: true }
      content: { type: object, required: true }
```

## Interfaces

```m21-interface
operations:
  data-querying:
    output: StoredRecord
    failures: [InvalidCriteria, StorageUnavailable]
  transactional-operations:
    output: StoredRecord
    failures: [TransactionRejected]
    effects: [All requested changes commit together or none commit]
```

## Contract

Provides reliable persistence and retrieval while preserving data integrity.
```

**spec/auth.md:**
```markdown
---
name: auth
description: Identity verification and session management
group: domain
tags: [auth, security, identity]
depends_on:
  - name: data-storage
    uses: [data-querying, transactional-operations]
  - name: configuration
    uses: [settings-access]
features: features/auth/
---

# Auth

## Data model

Identity is a uniquely identifiable principal. Session is a time-bounded association between a verified Identity and subsequent requests.

```m21-model
entities:
  Identity:
    identity: id
    fields:
      id: { type: string, required: true }
      state: { type: enum, values: [active, suspended], required: true }
  Session:
    fields:
      identity: { type: reference, ref: Identity, required: true }
      expiresAt: { type: string, format: date-time, required: true }
```

## Interfaces

```m21-interface
operations:
  verify-identity:
    output: Session
    failures: [InvalidEvidence, ExpiredEvidence, RevokedEvidence]
```

## Contract

Owns identity verification and session state, but does not own persistent storage or configuration.
```

**features/data-storage/data-querying.feature:**
```gherkin
Feature: data-querying
  Retrieve stored data by various criteria.

  Scenario: Retrieve records matching a filter
    Given the data store contains records
    When a query is submitted with filter criteria
    Then only matching records are returned

  Scenario: Handle invalid queries gracefully
    Given a connected data store
    When a malformed query is submitted
    Then a descriptive error is returned without exposing internals
```

## Interactive workflow if user specified --interactive

1. Ask which directory to analyze (or use the current project root).
2. Present proposed model ownership for review. Default: accept.
3. Present semantic interfaces derived from those models. Default: accept.
4. Present concerns and dependencies. Default: accept.
5. Ask whether to generate executable features. Default: no unless clear observable contracts were found.
6. Generate models first, then interfaces, architectural contracts, and features.
7. Run `npx @moejay/m21 validate ./spec --json`.
8. Suggest `npx @moejay/m21 ./spec/` to visualize the result and iterate on ownership, boundaries, interfaces, or scenarios.
