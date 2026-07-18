---
name: arg-parser
description: Pure CLI argument parser — extracts subcommand, flags, positional args, and mode from the raw argument list
group: interface
tags: [cli, args, parsing]
depends_on: []
features: features/arg-parser/
---

# Arg Parser

## Data model

### Invocation

An ordered argument list interpreted as a mode, spec directory, optional spec name, and mode-specific options. Read-only modes include contract registry and JSON Schema export. Invalid combinations carry a descriptive error instead of causing process termination.

```m21-model
entities:
  Invocation:
    fields:
      mode: { type: enum, values: [serve, static, list, show, features, deps, validate, model, schema], required: true }
      specDir: { type: string }
      name: { type: string }
      json: { type: boolean }
      error: { type: string }
```

## Interfaces

### parse-invocation

- Input: A raw command-line argument list
- Output: A normalized Invocation
- Failures: Invalid or incomplete options are represented in the result
- Effects: None

```m21-interface
operations:
  parse-invocation:
    input: Invocation
    output: Invocation
    failures: [InvalidInvocation]
```

## Contract

A pure transformation from the raw argument list to a structured options object. No I/O, no framework, no external dependencies.

Supports:

- **Subcommand keyword** (optional first non-flag arg): one of `list`, `show`, `features`, `deps`, `validate`, `model`, `schema`. When present, sets `mode` to that keyword and shifts subsequent positional args (specDir, then optional spec name).
- **Positional `specDir`**: in subcommand mode, the second positional arg; otherwise the first non-flag arg.
- **Positional `name`**: third positional arg, used by `show` / `features` / `deps`. Required for `show` and `deps`; optional for `features` (omit to list features for all specs).
- **`--output` / `-o`**: switches `mode` to `static`, captures output file path. Mutually exclusive with subcommands.
- **`--port`**: custom port number for dev server (default 3333). Only meaningful in `serve` mode.
- **`--host`**: host or address for the dev server to bind (default: loopback only). Captured as `host` (default none). Only meaningful in `serve` mode.
- **`--results`**: path to a Cucumber JSON test-results file to overlay on the graph. Captured as `results` (default none). When omitted, the orchestrator auto-detects a results file from conventional locations. Meaningful in `serve` and `static` modes.
- **`--json`**: emit JSON instead of human-readable text. Only meaningful in subcommand modes (list / show / features / deps / validate).
- **`-y` / `--yes`**: auto-confirm directory creation prompts.
- **`--help` / `-h`**: help flag (also triggers when no args given).
- **`--version` / `-v`**: print version and exit.
- **Error reporting**: returns an error value for invalid flag usage (e.g., `--output` without a path, `show` without a spec name).

### Mode values

| `mode` | Meaning |
|--------|---------|
| `serve` | Default — start dev server. |
| `static` | `--output` / `-o` was passed; render HTML to file. |
| `list` | Print all specs. |
| `show` | Print one spec's full info. |
| `features` | Print features (all or for one spec). |
| `deps` | Print dependency tree (forward + reverse) for one spec. |
| `validate` | Lint specs, models, interfaces, and features. |
| `model` | Export the machine-readable contract registry. |
| `schema` | Export JSON Schema for declared entities. |

### Disambiguating subcommand vs. spec dir

A bare word that exactly matches a subcommand keyword is a subcommand. Anything else (including paths like `./spec/` or `/abs/spec/`, or directory names not in the keyword set) is treated as `specDir`. Users with a directory literally named `list` must invoke it with a path indicator (`./list/`).

### Invariants

- Always returns a plain value — never throws, never reads the filesystem, never terminates the process. All side effects belong to the orchestrator.
