---
name: spec-parser
description: Parses markdown spec files with YAML frontmatter into normalized spec records
group: foundation
tags: [parser, markdown, yaml, frontmatter]
depends_on:
  - name: feature-parser
    uses: [directory-parsing]
  - name: contract-model
    uses: [contract-block-parsing]
features: features/spec-parser/
---

# Spec Parser

## Data model

### Spec

A named contract concern with optional description, group, tags, dependencies, feature-directory reference, Markdown body, owned Entities and Operations, and Contract diagnostics.

### Dependency

A reference to another Spec by name, optionally identifying the behavioral capabilities consumed from it. A simple name and a name with an explicit capability list have the same normalized shape.

### Parsed project

A collection of Specs whose feature documents have been resolved relative to the project root.

```m21-model
entities:
  Dependency:
    fields:
      name: { type: string, required: true }
      uses: { type: array, items: string, required: true }
  Spec:
    identity: name
    fields:
      name: { type: string, required: true }
      description: { type: string }
      group: { type: string }
      tags: { type: array, items: string }
      dependencies: { type: array, items: Dependency }
      body: { type: string }
  ParsedProject:
    fields:
      specs: { type: array, items: Spec, required: true }
```

## Interfaces

### parse-spec

- Input: A Markdown spec document
- Output: A normalized Spec with parsed contract blocks, or no Spec when the required name is absent
- Failures: Unreadable or malformed source

### parse-spec-directory

- Input: A spec directory and optional project root
- Output: The Parsed project, including resolved feature documents
- Effects: Reads contract documents without modifying them

```m21-interface
operations:
  parse-spec:
    output: Spec
    failures: [UnreadableSpec, MalformedSpec]
  parse-spec-directory:
    output: ParsedProject
    failures: [UnreadableSpecDirectory]
```

## Contract

Core data ingestion for spec files. Reads `.md` files, extracts the YAML frontmatter, and produces normalized spec records. Also usable programmatically as the package's library entry point.

### Spec file contract

A valid spec file requires a `name` field in frontmatter. Optional fields: `description`, `group`, `tags` (list), `depends_on` (list), `features` (path). Everything below the frontmatter fence is the Markdown `body`.

The authoring convention gives contract-bearing body sections the order `Data model` → `Interfaces` → `Contract`, omitting sections that do not apply. Existing free-form bodies remain valid. Parsing preserves the body as Markdown. Fenced `m21-model` and `m21-interface` YAML blocks are structurally interpreted by contract-model wherever they occur in the body; malformed blocks add diagnostics without preventing the rest of the Spec from loading.

### Dependency normalization

`depends_on` entries are polymorphic — both forms normalize to a canonical record with a `name` and a (possibly empty) `uses` list:

```yaml
# Simple string → { name: "config", uses: [] }
depends_on:
  - config

# Object with uses → { name: "auth", uses: ["token-validation", "session-management"] }
depends_on:
  - name: auth
    uses: [token-validation, session-management]
```

Invalid entries (no `name`) are filtered out. Dependency matching is case-insensitive.

### Directory parsing

Parsing a spec directory finds all `.md` files, parses each, silently skips files without a `name`, then resolves each spec's feature files by delegating to the feature-parser with paths resolved relative to the project root.
