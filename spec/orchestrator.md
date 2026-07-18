---
name: orchestrator
description: CLI entry point — wires together parsing, generation, serving, and version checking
group: interface
tags: [cli, entry-point, orchestration]
depends_on:
  - name: arg-parser
    uses: [argument-parsing, subcommand-parsing]
  - name: spec-parser
    uses: [directory-parsing]
  - name: graph-generator
    uses: [html-generation]
  - name: http-server
    uses: [server-lifecycle]
  - name: version-checker
    uses: [update-check]
  - name: cli-commands
    uses: [list, show, features, deps, validate, model, schema]
  - name: results-parser
    uses: [results-discovery, results-merge]
features: features/orchestrator/
---

# Orchestrator

## Data model

### Execution outcome

The terminal output, exit status, and optional running server or generated graph document resulting from one Invocation.

```m21-model
entities:
  ExecutionOutcome:
    fields:
      output: { type: string, required: true }
      exitCode: { type: integer, required: true }
      running: { type: boolean, required: true }
```

## Interfaces

### run-invocation

- Input: A normalized Invocation and host-process capabilities
- Output: An Execution outcome
- Failures: Reported through terminal output and exit status
- Effects: May prompt, create a directory, read contracts, write a graph document, start a local server, or check for updates according to the selected mode

```m21-interface
operations:
  run-invocation:
    output: ExecutionOutcome
    failures: [InvalidInvocation, ExecutionFailure]
```

## Contract

The executable entry point. It is the only module that interacts with the host process — raw arguments, exit codes, interactive prompts, and signal handling all live here. Every other module stays side-effect-free at the top level so it can be tested and reused in isolation.

Responsibilities:

1. **Parse arguments** via arg-parser, then branch on help/error/mode
2. **Ensure the spec directory exists** — prompts interactively, or auto-creates with `-y`
3. **Parse specs** by calling spec-parser, with the project root derived as the spec directory's parent
4. **Route to mode**:
   - **Dev server** (default): delegates to http-server and shuts it down gracefully on interrupt/terminate
   - **Static export** (`--output`): calls graph-generator and writes the HTML to the given path, or to a temporary file opened in the browser when no path is given
   - **Subcommand modes** (`list` / `show` / `features` / `deps` / `validate` / `model` / `schema`): delegates to the matching cli-commands handler, prints the returned output, exits with the handler's reported exit code
5. **Kick off the version check** on startup, without blocking or failing startup if it errors

### Invariants

- Exit codes and all output to the terminal flow through the orchestrator; delegated modules return values instead of printing or exiting themselves.
