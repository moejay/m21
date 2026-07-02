---
name: graph-generator
description: Generates a self-contained HTML document embedding specs, styling, and the graph-client application
group: domain
tags: [visualization, html-generation, template]
depends_on:
  - name: graph-client
    uses: [force-simulation, side-panel, layout-modes, group-clustering, test-status]
features: features/graph-generator/
---

# Graph Generator

Produces a complete HTML document, as a single string, that renders the interactive dependency graph. The same generator serves both the dev server (live mode) and static export.

### What the document contains

1. **Spec data**: all parsed specs embedded directly in the document, so it needs no data backend
2. **Styling**: an embedded dark theme — dark background, neon accents, monospace type
3. **The graph-client application**: embedded in full, so the document runs on its own
4. **Two rendering libraries** referenced from public CDNs — the document's only external requests

### Conditional content

When live reload is requested (dev server mode):
- The live-update subscription is embedded: the client listens for new spec data and swaps it in while preserving node positions, reconnecting automatically if the stream drops
- The inline editing UI is enabled (edit buttons and save handlers that write back through the server's editing endpoints)

For static export:
- No live-update code, no editing UI — a pure read-only visualization

### Decisions

- **No build step, no bundler, no external asset files** — the output is a single document produced by direct string construction. This keeps the tool runnable with zero build tooling, at the cost of the client application living embedded in the generator.
- **Rendering libraries load from CDNs** rather than being embedded — keeps the output small, but the exported document needs network access to render. Recorded as a known trade-off; revisiting it is on the backlog.
