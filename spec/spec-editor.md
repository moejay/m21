---
name: spec-editor
description: Inline write-back of spec bodies and feature files from browser edits
group: infrastructure
tags: [editing, write-back, frontmatter-preservation]
depends_on:
  - name: spec-parser
    uses: [spec-format]
features: features/spec-editor/
---

# Spec Editor

## Data model

### Spec draft

A requested spec name with optional metadata, dependencies, and Markdown body.

### Body revision

Replacement Markdown body content for an existing Spec; frontmatter is outside the revision and remains unchanged.

### Feature revision

Replacement source content for one existing feature document owned by a Spec.

```m21-model
entities:
  SpecDraft:
    fields:
      name: { type: string, required: true }
      description: { type: string }
      body: { type: string }
  BodyRevision:
    fields:
      body: { type: string, required: true }
  FeatureRevision:
    fields:
      content: { type: string, required: true }
```

## Interfaces

### create-spec

Creates a Spec from a valid Spec draft and rejects missing, duplicate, or path-escaping names.

### revise-spec-body

Replaces a Spec's Body revision while preserving all frontmatter.

### revise-feature

Replaces one Feature revision while keeping the write inside its owning feature directory.

```m21-interface
operations:
  create-spec: { input: SpecDraft, failures: [MissingName, DuplicateSpec, UnsafePath] }
  revise-spec-body: { input: BodyRevision, failures: [UnknownSpec, UnsafePath] }
  revise-feature: { input: FeatureRevision, failures: [UnknownFeature, UnsafePath] }
```

## Contract

Persists edits made in the browser's inline editor back to the spec and feature files on disk.

### Spec body editing (`PUT /api/specs/:name/body`)

1. Looks up the spec's file path from a name → file-path map built by scanning the spec directory
2. Reads the current file and separates frontmatter from body
3. Reconstructs the file with the original frontmatter and the new body
4. Writes the updated file, which triggers the file-watcher → re-parse → broadcast cycle

### Feature file editing (`PUT /api/features/:specName/:filename`)

1. Finds the spec by name, resolves the feature path from the project root, the spec's `features` path, and the filename
2. Writes the raw content directly (feature files have no frontmatter to preserve)
3. The file-watcher picks up the change automatically

### Spec file map

The name → file-path lookup is built by scanning the spec directory and reading each `.md` file's frontmatter `name`. It is rebuilt on every file change to handle added/removed specs.

### Spec creation (`POST /api/specs`)

Creates a new spec file in the spec directory from a name plus optional description, group, tags, dependencies, and body. Requests without a name are rejected (400); names that already exist are rejected (409).

### Invariants

- **Frontmatter is never touched by a body edit** — every YAML field survives a save unchanged. The browser editor edits prose; the structure stays owned by the file.
- **Writes never escape the project** — a spec name or feature filename containing path separators or parent references is rejected (400) before anything touches disk. Every resolved write path must stay inside the spec directory (spec files) or the spec's features directory (feature files).

### Error handling

- Unknown spec name → 404 with an error message
- Spec without a features path → 404
- Write/parse failures → 500 with the error message
