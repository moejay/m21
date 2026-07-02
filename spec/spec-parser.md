---
name: spec-parser
description: Parses markdown spec files with YAML frontmatter into normalized spec records
group: foundation
tags: [parser, markdown, yaml, frontmatter]
depends_on:
  - name: feature-parser
    uses: [directory-parsing]
features: features/spec-parser/
---

# Spec Parser

Core data ingestion for spec files. Reads `.md` files, extracts the YAML frontmatter, and produces normalized spec records. Also usable programmatically as the package's library entry point.

### Spec file contract

A valid spec file requires a `name` field in frontmatter. Optional fields: `description`, `group`, `tags` (list), `depends_on` (list), `features` (path). Everything below the frontmatter fence is the markdown `body`.

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
