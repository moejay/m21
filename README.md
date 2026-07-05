# M21

Markdown-driven spec files with dependency graphs, feature tracking, and group clustering — visualized as an interactive, explorable graph.

## What is M21?

M21 lets you define project specs as simple markdown files with YAML frontmatter. Each spec declares its name, dependencies, group, tags, and an optional path to Gherkin `.feature` files. Specs are composable modules — child specs declare which features they use from parent specs, creating traceable contracts between modules. M21 renders everything as a live, interactive dependency graph in the browser.

## Vision

M21 is an experiment in higher-level software tooling for building maintainable, extensible, reliable, professional, clean, and understandable software. It treats a project as a network of purposeful modules with explicit responsibilities, dependencies, and executable feature contracts.

The goal is living architecture: specs describe intent, Gherkin features define contracts, dependency edges explain which capabilities are used, and test results close the loop so documentation, behavior, and implementation stay aligned.

Read the full vision in [VISION.md](VISION.md).

## Install

```bash
npm install -g @moejay/m21
```

Or run directly:

```bash
npx @moejay/m21 ./spec/
```

## Skills

M21 ships with skills for spec authoring and brownfield adoption. Install them with:

```bash
npx skills install moejay/m21
```

This installs two skills:

- **m21** — helps you create and maintain spec files, dependencies, and feature files
- **m21-init** — analyzes an existing codebase and generates specs + features from it (brownfield adoption)

## Quick start

### 1. Create a spec directory

```
myproject/
├── spec/
│   ├── bootstrap.md
│   ├── persistence.md
│   └── repos.md
└── features/
    ├── bootstrap/
    │   ├── project-scaffolding.feature
    │   └── health-endpoint.feature
    ├── persistence/
    │   ├── data-storage.feature
    │   └── query-interface.feature
    └── repos/
        └── repo-onboarding.feature
```

### 2. Write a spec file

Each spec is a markdown file with YAML frontmatter:

```markdown
---
name: bootstrap
description: One-time project scaffolding
group: foundation
tags: [setup, init]
depends_on: []
features: features/bootstrap/
---

# Bootstrap

This is the bootstrap spec. Any markdown content goes here —
it renders in the side panel when you click a node.
```

### 3. Declare dependencies with feature tracking

Specs declare which features they use from their dependencies:

```markdown
---
name: persistence
description: SQLite database layer
group: infrastructure
tags: [database, storage]
depends_on:
  - name: bootstrap
    uses: [project-scaffolding, health-endpoint]
features: features/persistence/
---
```

The `uses` array references `Feature:` names from the parent spec's `.feature` files. This creates a traceable contract — you know exactly which capabilities each module relies on.

#### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier for the spec |
| `description` | No | Short summary shown in the info panel |
| `group` | No | Logical grouping — specs in the same group are visually clustered |
| `tags` | No | Array of tags for categorization |
| `depends_on` | No | Dependencies — simple strings or objects with `name` and `uses` |
| `features` | No | Path to a directory of `.feature` files |

#### `depends_on` format

Simple (backwards compatible):
```yaml
depends_on:
  - bootstrap
  - config
```

Rich (with feature references):
```yaml
depends_on:
  - name: bootstrap
    uses: [project-scaffolding]
  - name: persistence
    uses: [data-storage, query-interface]
```

Mixed:
```yaml
depends_on:
  - name: persistence
    uses: [data-storage]
  - server-api
```

### 4. Write Gherkin features

Feature names must be **kebab-case**:

```gherkin
Feature: project-scaffolding
  The project compiles and all tooling works from a fresh checkout.

  Scenario: Clean build with zero warnings
    Given a fresh clone of the repository
    When I run the build command
    Then the build succeeds
```

### 5. Run M21

```bash
# Start the dev server (default: http://localhost:3333)
npx @moejay/m21 ./spec/

# Auto-create the spec directory
npx @moejay/m21 ./spec/ -y

# Custom port
npx @moejay/m21 ./spec/ --port 4000

# Export a static HTML file instead
npx @moejay/m21 ./spec/ --output graph.html

# Overlay test results (auto-detected from results/, reports/, test-results/ when omitted)
npx @moejay/m21 ./spec/ --results results/cucumber.json
```

### Visualizing test results

M21 never runs your tests — it ingests a test report and overlays the outcomes. Two formats are accepted, auto-detected by shape:

- **Cucumber JSON** — emitted by every Gherkin runner (`cucumber-js`, `cucumber-jvm`, `behave`, `cucumber-ruby`, `godog`, Reqnroll, `cucumber-rs`), so it stays language-agnostic.
- **Jest / vitest JSON** — the `--reporter=json` output common across the JS ecosystem. For `vitest-cucumber`/`jest-cucumber` runs the `Feature:`/`Scenario:` titles join directly; for plain `describe`/`it` suites the top-level `describe` is the feature and the `it` is the scenario.

```bash
# vitest / jest example
npx vitest run --reporter=json --outputFile=results/vitest-results.json
npx @moejay/m21 ./spec/          # auto-detected
```

Results join onto specs by feature name and scenario name: each node is ringed green (all passing), red (any failing), or amber (pending/skipped) and shows a `passed/total` count (e.g. `15/19`) inside the circle, and the side panel shows per-scenario ✓/✗ pills plus a `passed / total` summary. A legend appears whenever any spec has test data. In dev-server mode the overlay live-updates as the report file changes.

## Features

- **Interactive graph** — D3 dependency visualization with zoom, pan, and drag
- **Group clustering** — Specs in the same group are visually clustered with colored hulls
- **Feature tracking** — See which features flow along each dependency edge
- **Test results overlay** — Point M21 at a Cucumber JSON **or** Jest/vitest JSON report and the graph colours each node by pass/fail, shows a `passed/total` count inside every circle, and lists per-scenario status pills in the side panel. Click a scenario to inspect step statuses and, for source-backed Jest/vitest reports, the Given/When/Then definition snippets. Auto-detected from `results/`, `reports/`, `test-results/`, or pass `--results <file>`. Live-updates as tests re-run
- **Tree-and-groups layout** — Default architecture view combines dependency depth with group clustering. Nodes start unlocked for manual positioning, group labels drag whole groups, and checkboxes can lock nodes or reverse the tree direction
- **Side panel** — Click any node to see description, group, tags, dependencies with used features, rendered markdown body, and Gherkin scenarios
- **Composable specs** — Specs are modules with clear interfaces defined by their features
- **Live reload** — Dev server watches your spec and feature files, pushes changes via SSE instantly
- **Inline editing** — Edit spec bodies and feature files directly in the browser (dev server mode)
- **Static export** — Generate a self-contained HTML file with `--output`
- **Version check** — Notifies you when a new version is available

## CLI reference

```
npx @moejay/m21 <directory>                       Start dev server with live reload (default)
npx @moejay/m21 <directory> --output <file>       Save graph to a static HTML file
npx @moejay/m21 <directory> --port <number>       Custom port for dev server (default: 3333)
npx @moejay/m21 <directory> --results <file>      Overlay Cucumber, Jest, or vitest JSON test results
npx @moejay/m21 <directory> -y                    Auto-create spec directory if missing
npx @moejay/m21 --help                            Show help
```

### Read-only subcommands (for humans and coding agents)

Each subcommand also accepts `--json` for machine-readable output.

```
npx @moejay/m21 list <directory>                  Print all specs (group, dep count, feature count)
npx @moejay/m21 show <directory> <name>           Print one spec's full info — deps, dependents, features, body
npx @moejay/m21 features <directory> [<name>]     List features (across all specs, or scoped to one)
npx @moejay/m21 deps <directory> <name>           Print forward + reverse dependency tree
npx @moejay/m21 validate <directory>              Lint specs: broken refs, missing feature dirs, cycles
```

## Brownfield adoption

Already have a codebase? Install the skills (`npx skills install moejay/m21`) and use `m21-init` to analyze your existing code and generate spec + feature files automatically. It identifies modules, their dependencies, and public interfaces from your project structure and import patterns.

## Development

M21 is itself spec-driven: every module has a spec in `spec/` and Gherkin scenarios in `features/`, and **every feature file is bound to executable tests** (via `@amiceli/vitest-cucumber`), so the scenarios are the contract.

```bash
npm test          # run the suite once; also writes results/vitest-results.json
npm run test:watch
npm run docs:graph        # refresh docs/graph.html, including test overlay when results exist
npm run docs:graph:check  # CI check: generated static export must match docs/graph.html
npm run setup:githooks    # install the local pre-commit hook for static export refreshes
```

`npm test` emits a `results/vitest-results.json` report, so you can dogfood the overlay on M21 itself:

```bash
npm test
npx . ./spec/     # the graph lights up green with each module's passed/total count
npm run docs:graph # writes the same overlay into docs/graph.html for GitHub Pages
```

Requires Node ≥ 20.

## Programmatic API

M21 can be used as a library. Entry points are exposed through the package `exports` map:

```js
import { parseSpecDirectory } from "@moejay/m21";           // parse specs + features
import { generateHTML } from "@moejay/m21/generator";       // render the graph HTML
import { createM21Server } from "@moejay/m21/server";   // run the dev server
import { parseResultsFile, mergeResults } from "@moejay/m21/results"; // overlay test results
import { analyzeGraph } from "@moejay/m21/cycles";          // dependency + cycle analysis

// Parse a spec directory and render a self-contained graph.
const specs = await parseSpecDirectory("./spec", { projectRoot: "." });
const html = generateHTML(specs);

// Overlay Cucumber/vitest results onto the specs, then render.
const lookup = await parseResultsFile("./results/cucumber.json");
if (lookup) mergeResults(specs, lookup);
const withStatus = generateHTML(specs);

// Start the dev server (loopback-only by default).
const server = await createM21Server({ specDir: "./spec", port: 3333 });
console.log(server.address);
await server.close();
```

The default import (`@moejay/m21`) is the parser. `generateHTML` produces a fully self-contained document — the rendering libraries are inlined, so it works offline.

## License

MIT
