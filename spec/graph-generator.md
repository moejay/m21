---
name: graph-generator
description: Generates a self-contained HTML document embedding specs, styling, and the graph-client application
group: domain
tags: [visualization, html-generation, template]
depends_on:
  - name: graph-client
    uses: [layout-positioning, side-panel, layout-modes, group-clustering, test-status, contract-tabs]
features: features/graph-generator/
---

# Graph Generator

## Data model

### Graph document

A self-contained, read-only or live-enabled representation of parsed project contracts—including normalized models, interfaces, and diagnostics—presentation assets, and the graph application.

```m21-model
entities:
  GraphDocument:
    fields:
      content: { type: string, required: true }
      liveEnabled: { type: boolean, required: true }
```

## Interfaces

### generate-graph-document

- Input: Parsed project contracts and rendering options
- Output: A complete Graph document
- Failures: Required presentation assets cannot be read
- Effects: None beyond reading packaged assets

```m21-interface
operations:
  generate-graph-document:
    output: GraphDocument
    failures: [UnreadablePresentationAsset]
```

## Contract

Produces a complete HTML document, as a single string, that renders the interactive dependency graph. The same generator serves both the dev server (live mode) and static export.

### What the document contains

1. **Spec data**: all parsed specs embedded directly in the document, so it needs no data backend
2. **Styling**: an embedded dark theme — dark background, neon accents, monospace type
3. **The graph-client application**: embedded in full, so the document runs on its own
4. **Two rendering libraries**: embedded inline, so the document has no external requests

### Conditional content

When live reload is requested (dev server mode):
- The live-update subscription is embedded: the client listens for new spec data and swaps it in while preserving node positions, reconnecting automatically if the stream drops
- The inline editing UI is enabled (edit buttons and save handlers that write back through the server's editing endpoints)

For static export:
- No live-update code, no editing UI — a pure read-only visualization

### Decisions

- **No build step, no bundler** — the output is a single document produced by direct string construction. The stylesheet and client application are kept in their own files and read at generation time (no template engine), and the rendering libraries are vendored in the repository. This keeps the tool runnable with zero build tooling.
- **Rendering libraries are inlined, not loaded from a CDN** — the exported document renders offline and under a strict CSP, at the cost of a larger document. Chosen because a self-contained document is the module's core purpose.
