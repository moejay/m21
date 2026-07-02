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
features: features/cli-commands/
---

# CLI Commands

Five read-only subcommands that let humans and coding agents explore a modspec project without spinning up the dev server. Each handler takes the parsed specs and options and returns its output — exit codes and printing flow back through the orchestrator.

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

### `validate`
Lint the spec graph. Surfaces:

- Broken `depends_on` references (spec name not found)
- Broken `uses` references (feature name not declared by the parent spec)
- Orphan `features:` paths (declared in frontmatter but directory missing)
- Specs that declare no features at all (warning, not error)
- Dependency cycles

Default output: grouped by severity, one issue per line with file path and message. Exit code is non-zero when any errors are present.

JSON output: `{ ok: boolean, issues: [{ severity, type, spec, message, path? }] }`.

## Invariants

Handlers are pure: they receive parsed specs and options and return output (text or JSON) — they never print, never exit, never touch the filesystem. This keeps them testable in isolation and reusable from a future programmatic API.
