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

### Invariants

- **Frontmatter is never touched by a body edit** — every YAML field survives a save unchanged. The browser editor edits prose; the structure stays owned by the file.

### Error handling

- Unknown spec name → 404 with an error message
- Spec without a features path → 404
- Write/parse failures → 500 with the error message
