---
name: file-watcher
description: Watches spec and feature files on disk, debounces changes, triggers re-parse
group: infrastructure
tags: [file-watching, debounce, polling]
depends_on:
  - name: spec-parser
    uses: [directory-parsing]
features: features/file-watcher/
---

# File Watcher

Monitors the spec directory and all referenced feature directories for file changes, so edits made in any editor show up in the graph without a restart.

### Watch configuration

- **Paths watched**: the spec directory, every feature directory referenced by parsed specs (resolved relative to the project root), and the resolved test-results file when one is available
- **Newly referenced directories are picked up**: when a re-parse reveals a feature directory that isn't yet being watched (a spec added a `features:` path, or a new spec was created), that directory is added to the watch set without a restart
- **Events**: file additions, changes, and removals for `.md` files, `.feature` files, and the watched results file
- **Existing files are ignored on startup** — only changes after the watcher is ready trigger events

### Decisions

- **Polling-based watching** (100ms interval) instead of native filesystem events — chosen for reliable detection across filesystems where native events don't propagate (container volumes, network mounts).

### Debouncing

Rapid file changes (e.g., editor save + lint fix in quick succession) are debounced with a 100ms window. Only one re-parse + broadcast fires per debounce window. The pending timer is cancelled on shutdown.

### Re-parse cycle

On debounced file change:
1. Re-parses the entire spec directory (including feature files)
2. Rebuilds the spec-name → file-path map (so the editor knows which file to write back)
3. Re-reads the results file (if any) and merges test status onto the specs
4. Updates the served spec data
5. Delegates broadcast to the SSE broadcaster

### Cleanup

The watcher is closed during graceful shutdown, releasing file handles and stopping polling.
