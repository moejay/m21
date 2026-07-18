---
name: cli-commands
description: Subcommand handlers that surface spec/feature data for agent and human consumption — list, show, features, deps, validate
group: interface
tags: [cli, commands, output]
depends_on:
  - name: arg-parser
    uses: [subcommand-parsing]
  - name: spec-parser
    uses: [directory-parsing]
  - name: feature-parser
    uses: [directory-parsing]
  - name: contract-model
    uses: [model-validation, schema-generation]
features: features/cli-commands/
---

# CLI Commands

## Data model

### Command result

Human-readable or machine-readable output paired with the exit status requested from the orchestrator.

### Validation issue

A severity, issue type, owning spec, explanatory message, and optional source path describing a contract-graph problem.

```m21-model
entities:
  CommandResult:
    fields:
      output: { type: string, required: true }
      exitCode: { type: integer, required: true }
  ValidationIssue:
    fields:
      severity: { type: enum, values: [error, warning], required: true }
      type: { type: string, required: true }
      spec: { type: string, required: true }
      message: { type: string, required: true }
      path: { type: string }
```

## Interfaces

### list-specs
### show-spec
### list-features
### show-dependencies
### validate-project
### export-model
### export-schema

Each operation accepts parsed project contracts plus command options and returns a Command result. None writes files, prints output, or terminates the process. `show-spec` and `show-dependencies` report an unsuccessful result when the requested spec is unknown.

```m21-interface
operations:
  list-specs: { output: CommandResult }
  show-spec: { output: CommandResult, failures: [UnknownSpec] }
  list-features: { output: CommandResult }
  show-dependencies: { output: CommandResult, failures: [UnknownSpec] }
  validate-project: { output: CommandResult }
  export-model: { output: CommandResult, failures: [UnknownSpec] }
  export-schema: { output: CommandResult, failures: [UnknownSpec, InvalidContract] }
```

## Contract

Seven read-only subcommands that let humans and coding agents explore and enforce an M21 project without spinning up the dev server. Each handler takes the parsed specs and options and returns its output — exit codes and printing flow back through the orchestrator.

Every command supports `--json` for machine-readable output; default output is concise human-readable text.

## Commands

### `list`
Print all specs as a table. Columns: index, name, group, dep count, feature count. Sort by group then name.

JSON output: array of `{ name, group, description, tags, dependsOn, features: [{name, scenarios}], specPath }` objects. Stable order matches text output.

### `show <name>`
Print one spec's full info: name, description, group, tags, body, forward deps (with `uses`), reverse deps (who depends on this), each feature with its scenarios and path, the spec file's path.

JSON output: a single object containing all of the above. Errors with non-zero exit if `<name>` does not match any spec (case-insensitive).

### `features [<spec>]`
List features. With no spec name: every feature grouped by owning spec. With a spec name: only that spec's features. Each feature line shows name, scenario count, and path.

JSON output: array of `{ spec, feature, scenarios: [name], path }` objects.

### `deps <name>`
Show the dependency neighborhood of a spec. Two sections: forward (specs this spec depends on, transitive) and reverse (specs that depend on this spec, transitive). Edge labels show `uses` references when present.

JSON output: `{ dependsOn: [{name, uses}], dependents: [{name, uses}] }` flattened to the transitive closure. Errors with non-zero exit if `<name>` does not match.

### `model [<name>]`
Export the normalized Contract registry for all specs or one owning spec. JSON output is the canonical representation; text output summarizes entity and operation identifiers.

### `schema [<name>]`
Export a JSON Schema document for all entities or one spec's entities plus transitively referenced entities. Output is always JSON.

### `validate`
Lint the spec graph and contract registry. Surfaces:

- Broken `depends_on` references (spec name not found)
- Broken `uses` references (feature name not declared by the parent spec)
- Orphan `features:` paths (declared in frontmatter but directory missing)
- Specs that declare no features at all (warning, not error)
- Dependency cycles
- Malformed contract blocks and duplicate entity/operation identifiers
- Unsupported field types and unresolved model references
- Cross-spec model references without a declared dependency

Default output: grouped by severity, one issue per line with file path and message. Exit code is non-zero when any errors are present.

JSON output: `{ ok: boolean, issues: [{ severity, type, spec, message, path? }] }`.

## Invariants

Handlers are pure: they receive parsed specs and options and return output (text or JSON) — they never print, never exit, never touch the filesystem. This keeps them testable in isolation and reusable from a future programmatic API.
