---
name: results-parser
description: Parses Cucumber, Jest, and vitest JSON test results and merges scenario pass/fail status onto specs
group: foundation
tags: [parser, test-results, cucumber, bdd]
depends_on:
  - name: feature-parser
    uses: [file-parsing]
features: features/results-parser/
---

# Results Parser

## Data model

### Scenario result

A normalized status for one named scenario, optionally carrying source-backed step evidence.

### Result lookup

Scenario results grouped by behavioral capability, with source identity retained when available to disambiguate equal names.

### Result summary

The highest-severity status and passed, failed, and total counts attached at scenario, feature, and spec levels.

```m21-model
entities:
  ScenarioResult:
    fields:
      name: { type: string, required: true }
      status: { type: enum, values: [passed, failed, ambiguous, undefined, pending, skipped], required: true }
  ResultLookup:
    fields:
      features: { type: object, required: true }
  ResultSummary:
    fields:
      status: { type: enum, values: [passed, failed, ambiguous, undefined, pending, skipped] }
      passed: { type: integer, required: true }
      failed: { type: integer, required: true }
      total: { type: integer, required: true }
```

## Interfaces

### normalize-results

- Input: A supported test-report value or its JSON representation
- Output: A Result lookup, or no result for an unsupported or malformed report

### discover-results

- Input: A project root and optional explicit report location
- Output: The selected report location, preferring an explicit location

### merge-results

- Input: Parsed project contracts and a Result lookup
- Output: The same contracts annotated with Scenario results and Result summaries
- Effects: Updates the supplied parsed records; never changes source contract files

```m21-interface
operations:
  normalize-results: { output: ResultLookup, failures: [UnsupportedReport] }
  discover-results: { output: ResultLookup }
  merge-results:
    input: ResultLookup
    output: ResultSummary
    effects: [Annotates parsed project records without changing source files]
```

## Contract

Ingests a test report and merges per-scenario pass/fail status onto the parsed spec model, so the graph can visualize test outcomes.

### Non-goals

M21 never runs tests — it consumes a results artifact produced by whatever runner the project uses.

### Decisions

**Cucumber JSON is the primary format** because it is emitted by Gherkin runners in every major language ecosystem, keeping the feature language-agnostic. It also maps 1:1 onto M21's existing `feature → scenario` model.

### Supported formats

Two report formats are accepted, distinguished by shape:

1. **Cucumber JSON** — a top-level **array** of feature objects. The primary, language-agnostic format.
2. **Jest / vitest JSON** — a top-level **object** with a `testResults` array (the JSON-reporter output common across the JS ecosystem). Each assertion's ancestor titles are mapped onto features and scenarios; for `vitest-cucumber` runs the titles are `"Feature: <name>"` / `"Scenario: <name>"`, so they join directly. For a plain describe/it suite the top-level describe is the feature and the test title is the scenario. Multiple assertions under one scenario (e.g. Gherkin steps) are rolled up to a single scenario status. Statuses map `passed`/`failed`/`skipped`/`pending` through unchanged and `todo` → `pending`.

The format is detected automatically from the report's shape: array ⇒ Cucumber, object with `testResults` ⇒ Jest/vitest.

### Cucumber JSON shape

The report is an array of feature objects. Each feature has a `name` (the kebab-case `Feature:` name) and an `elements` array of scenarios. Each scenario has a `name` and a `steps` array, where each step carries `result.status`.

```json
[
  {
    "name": "user-login",
    "elements": [
      {
        "type": "scenario",
        "name": "Successful login",
        "steps": [{ "keyword": "Given ", "result": { "status": "passed" } }]
      }
    ]
  }
]
```

### Scenario status derivation

A scenario's status is the **highest-severity** status among its steps, by precedence:

```
failed > ambiguous > undefined > pending > skipped > passed
```

A scenario passes only when every step passes. A scenario with no steps is `undefined`.

### Capabilities

- **Status rollup** — a list of statuses reduces to the highest-severity one; used at scenario, feature, and spec level.
- **Report normalization** — a raw report (parsed value or JSON text) becomes a lookup of feature name → scenario name → status, with the input format auto-detected. Missing or malformed fields are tolerated.
- **Source-backed test details** — when a Jest/vitest JSON report points at a readable test source file, step assertions can be enriched with source path, line number, and a best-effort definition snippet so the graph can show how Given/When/Then steps are implemented.
- **Results file reading** — reading a results file yields the normalized lookup, or nothing if the file is missing or unparseable (graceful degradation — never an error), mirroring how feature directories degrade.
- **Results discovery** — an explicit path always wins (resolved to absolute and honored even if the file doesn't exist yet, so it can be watched into existence). Otherwise conventional locations are probed in order.
- **Merging** — annotates each spec's scenarios with a status, and each feature file and spec with a rolled-up status and pass/fail counts.

### Auto-detection

When no explicit `--results` path is given, M21 looks for a report in conventional places. Root-level report filenames are checked first, then the same filenames inside common results directories:

- **Filenames:** `cucumber.json`, `cucumber-report.json`, `cucumber_report.json`, `vitest-results.json`, `jest-results.json`, `test-results.json`, `results.json`
- **Directories:** `results/`, `reports/`, `test-results/`, `cucumber/`

Any matched file is content-sniffed, so a Jest/vitest report works at any of these locations too. The first existing match (root files before directory files) is used. This keeps zero-config the common case where a runner drops its report in a conventional spot.

### Merge semantics

- Features join on **file path** when the report identifies each feature by its source file (Cucumber JSON carries this), falling back to **feature name** (kebab-case) otherwise. Matching by path disambiguates two features that share a name. Scenarios join on exact **scenario name**.
- A scenario in a spec with no matching result gets a null status (no data).
- If normalized results include source-backed step details for a scenario, those details are attached to the parsed scenario as `testDetails` without changing status rollup.
- Counts are `{ passed, failed, total }` where `total` counts only scenarios that have result data.
- A feature or spec with zero matched results has a null status — the graph renders this as a neutral "no data" state, distinct from a real pass/fail.

### Integration (downstream)

The dev server watches the results file alongside specs/features, re-merges on change, and broadcasts the update. graph-generator and graph-client read the merged status and counts to colour nodes and annotate the side panel. Those concerns live in their own specs; this spec owns only parsing and merging.
