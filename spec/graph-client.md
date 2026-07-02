---
name: graph-client
description: Browser-side interactive dependency graph — force simulation, side panel, editing
group: domain
tags: [graph, browser, client-side, interactive]
depends_on: []
features: features/graph-client/
---

# Graph Client

The interactive application that runs in the browser. It renders the spec dependency graph, lets the user explore it, and — in dev mode — edit specs and features inline.

### Force simulation

The default layout is a physics simulation: nodes repel each other, dependency edges act as springs, the graph stays centered in the viewport, and colliding nodes push apart. Nodes can be dragged and settle naturally.

### Graph elements

- **Nodes**: circles sized proportionally to how many specs depend on them, colored by dependency depth on a sequential color scale
- **Links**: directed edges with arrow markers, with optional feature-use labels
- **Group hulls**: convex outlines drawn around specs sharing the same `group` value, with colored fills and dashed borders

### Layout modes

Three modes switchable via toolbar buttons:
- **Force** (default): physics simulation — nodes can be dragged and settle
- **Tree**: hierarchical arrangement by dependency depth — roots at top, leaves at bottom
- **Manual**: freezes all nodes in place for precise positioning

### Side panel

Clicking a node opens a slide-in panel with two tabs:
- **Spec tab**: renders the spec's markdown body
- **Features tab**: lists all associated `.feature` files with collapsible scenarios showing Given/When/Then steps

### Test status

When specs carry merged test results (rolled-up status, counts, and per-scenario status from results-parser), the client surfaces them:
- **Node ring**: each status maps to a colour (green passed, red failed, amber for pending/skipped/undefined/ambiguous). Nodes with a test status get a thicker ring in that colour; nodes with no data keep their depth-based ring.
- **Node count**: a `passed/total` count (e.g. `15/19`) is rendered inside the circle when the spec carries counts.
- **Side panel**: each scenario shows a status pill (✓/✗/–), each feature file shows a `passed / total` summary, and the spec header shows an overall pass count.
- **Legend**: when any spec has test data, a small legend maps the colours to passed / failed / other / no data.

### Inline editing (dev mode only)

When live reload is active, the side panel includes edit buttons:
- **Spec body editing**: a plain-text editor replacing the rendered markdown, saved through the server's spec-body endpoint
- **Feature file editing**: a plain-text editor for raw `.feature` content, saved through the server's feature endpoint

### Live updates

In dev mode the client subscribes to the server's event stream. When new spec data arrives, the graph is rebuilt in place — current node positions are preserved so the layout doesn't jump. If the connection drops, the client reconnects after a short delay.

### Zoom and pan

Scroll to zoom, click-drag on the background to pan. Node drag is handled separately and doesn't trigger panning.

### Depth calculation

Each spec's depth in the dependency graph is computed (memoized, cycle-tolerant): depth 0 means no dependencies. Depth drives both node coloring and tree-layout row placement.
