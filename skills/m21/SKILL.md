---
name: m21
description: Spec-driven development workflow for M21 projects. Use whenever you author specs, edit them, or implement code in an M21 project.
license: MIT
metadata:
  author: m21
  version: "2.0"
---

# M21 — Spec-Driven Development Workflow

This skill defines the workflow for working in an M21 project: authoring specs, editing them, and implementing code. M21 uses markdown spec files with YAML frontmatter to define meaningful modules, their dependencies, and optional links to Gherkin `.feature` files. Features are for executable behavior contracts only — not every spec needs features, and not every repository concern needs a spec.

## The contract — use judgment

When a change affects a module's durable contract, follow this flow:

1. **Phase 1 — Update the spec and/or features first.** If the change alters module responsibility, dependency contracts, invariants, or externally observable behavior, update the owning spec and any relevant `.feature` scenarios before implementation.

2. **Phase 2 — Red/green TDD for executable scenarios.** New or modified scenarios should fail first, then implementation makes them pass, then the full feature suite checks regressions.

Do **not** create specs or features just to mirror files, folders, helper functions, repo chores, or implementation mechanics. Specs are load-bearing only when they describe architecture or behavior that should survive regeneration. Features are load-bearing only when they describe an observable outcome that can be tested.

> If the user requests a code-only maintenance change with no contract change — dependency bumps, refactors that preserve behavior, generated assets, CI plumbing, docs-only edits — do not invent a scenario. If the change reveals a missing behavioral contract, pause and add the smallest useful scenario.

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

## What belongs in a spec

The spec body is deliberately unstructured — free markdown prose, written to be read and edited by humans. This section is guidance on **content**, not a template. Do not impose headings or sections on the user's specs.

A good spec body answers, in **domain language** anyone can read:

- **Responsibilities** — what this module is accountable for, stated as outcomes, not mechanisms.
- **Non-goals** — what it deliberately does *not* do. Often the highest-value sentence in the spec, because it's the thing scenarios can't express.
- **Invariants** — what must always hold, no matter how the module is built ("edits never touch frontmatter", "no file outside the project root is ever written").
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

### Prose vs. scenario

If a sentence in the spec body describes behavior with an **observable outcome** ("when the results file changes, the graph updates"), it belongs in a scenario — that's the executable contract. Spec prose that restates scenarios drifts; spec prose should carry what scenarios can't: purpose, non-goals, invariants, decisions.

---

## Phase 1 — Update the spec and features

Use this phase when the user asks to add, change, or remove behavior, responsibilities, dependencies, invariants, or other durable contract information.

### 1.1 Understand the request
- *What* is being added/changed/removed? (spec, feature, scenario, dependency)
- *Which module* owns it? If unclear, present candidates — don't guess.

### 1.2 Find the right spec
- Named explicitly by the user → use that
- Fits an existing spec's responsibility → use the best fit (match by `description`, `group`, existing features)
- Represents a new durable module concern not covered by any spec → create a new spec
- Is a repo chore, generated asset, helper-only refactor, or implementation detail → no new spec; keep it out of the M21 contract

### 1.3 Read current state before changing
Read the target spec, all its existing feature files, and any specs that depend on it. This prevents duplicate features, conflicting scenarios, and broken dependency contracts.

### 1.4 Make the changes
- **Add a feature** → only when the module exposes observable behavior worth testing as a public contract. Create a new `.feature` file in `features/<spec>/` and add the `features` field to spec frontmatter if missing.
- **Add a scenario** → only for an observable outcome. Append to the existing `.feature` file, matching the surrounding step phrasing and detail level.
- **New spec** → create the spec for a meaningful module boundary. Do not add a `features` directory unless it has real executable behavior to describe.
- **Modify dependencies** → update `depends_on`. If new `uses` references don't exist yet, offer to add them as scenarios.
- **Remove a feature/spec** → check downstream `uses` first. Warn the user about broken contracts before deleting.

### 1.5 Show what changed
Summarize files created/modified/deleted. Flag downstream specs that may need attention.

### Phase 1 rules
- Don't change features without asking, specs are owned by the user.
- Match existing style (step phrasing, scenario detail, naming).
- Check downstream before removing.

---

## Phase 2 — Implement red/green

Use this phase to make the new or modified executable feature scenarios pass. If no feature changed, run the project's normal validation for the code change instead.

### 2.1 Read the spec
- What is this module responsible for? (`description`, body)
- What does it depend on? (`depends_on` and `uses`)
- Where do its features live? (`features` field)

If implementing multiple specs, walk the dependency graph: start with specs that have no `depends_on` (roots) and work down. The features a spec `uses` from a dependency must already pass before that spec is implemented.

## 2.3 Red — confirm scenarios fail
Run the feature suite. Every scenario for this spec must fail because the implementation doesn't exist yet. If a scenario passes before code is written, investigate — either the test setup is wrong or the feature is already implemented elsewhere.

### 2.4 Green — implement one scenario at a time
1. Pick the simplest scenario first.
2. Write the minimum code to make it pass.
3. Run the feature → confirm green.
4. Move to the next scenario.
5. Refactor only after all scenarios in a feature pass.

**Do not** add functionality that contradicts an existing scenario. If new externally observable behavior seems missing from the contract → return to Phase 1, add the smallest useful scenario, then implement.

### 2.5 Verify dependency contracts
If the spec declares `uses` against a dependency, the implementation must actually consume those features. If it doesn't, either the implementation is wrong or the spec needs updating — flag it and return to Phase 1 if the user agrees.

### 2.6 Run the full feature suite
After implementing one spec, run *all* features — not just the one you worked on. Implementation of one spec must not break another's.

### Phase 2 rules
- Features are the contract. A passing suite means the implementation is correct; a failing scenario means the implementation is wrong (not the feature).
- If a feature seems wrong → stop, ask the user, return to Phase 1 if they confirm a change.
- Never silently skip or disable a scenario.
- Step definitions must be thin, they translate Gherkin to calls into `src/`. No business logic in step definitions.

---

## Reference: spec file format

Each spec is a `.md` file inside the spec directory with YAML frontmatter and an optional markdown body.

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

This spec covers the database abstraction layer.

## Decisions
- Use SQLite for local-first storage
- Migrations managed via versioned SQL files
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

### Groups
Specs sharing a `group` value are clustered with a colored hull. Use them for domain organization (`infrastructure`, `data`, `api`, `ui`).

---

## Reference: Gherkin feature files

Feature files use standard Gherkin. They live in the directory referenced by `features:`. Feature names are the **public interface** of a spec — other specs declare which features they `uses`.

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

```bash
m21 ./spec/                       # Dev server with live reload (default)
m21 ./spec/ -y                    # Auto-create spec dir if missing
m21 ./spec/ --port 4000           # Custom port
m21 ./spec/ --output graph.html   # Static HTML export
```

| Flag | Description |
|------|-------------|
| `--output`, `-o` | Save HTML to path instead of serving |
| `--port` | Dev server port (default 3333) |
| `-y`, `--yes` | Auto-create spec dir if missing |
| `--help`, `-h` | Show help |

The dev server watches spec and feature files for changes and pushes updates to the browser in real time.
