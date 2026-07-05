---
name: graph-client
description: Browser-side interactive dependency graph — stable layout, side panel, editing
group: domain
tags: [graph, browser, client-side, interactive]
depends_on: []
features: features/graph-client/
---

# Graph Client

The interactive application that runs in the browser. It renders the spec dependency graph, lets the user explore it, and — in dev mode — edit specs and features inline.

### Default layout

The default layout combines dependency depth and grouping: dependency depth places modules in tree-like rows, while specs in the same group occupy the same horizontal band so related modules stay visually close. The default direction is top-down from deeper dependents toward depth-0 dependencies; a Reverse tree checkbox switches to the opposite direction. This gives the graph a stable architecture-first shape without requiring the user to choose a view.

### Graph elements

- **Nodes**: circles sized proportionally to how many specs depend on them, colored by dependency depth on a sequential color scale
- **Links**: directed edges with arrow markers, with optional feature-use labels
- **Group hulls**: convex outlines drawn around specs sharing the same `group` value, with colored fills and dashed borders

### Node locking

The graph has a single lock control instead of layout-mode buttons. Nodes are unlocked by default, starting from the computed tree-and-groups layout and allowing immediate manual positioning. When nodes are locked, the computed layout is restored and dragging is ignored. Dragging a group label moves every node in that group together when unlocked.

### Side panel

Clicking a node opens a slide-in panel with two tabs:
- **Spec tab**: renders the spec's markdown body
- **Features tab**: lists all associated `.feature` files with collapsible scenarios showing Given/When/Then steps. Clicking a scenario toggles available test details, including step result status, source location, and definition snippets when the results parser can resolve them from the test report.

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

Each spec's depth in the dependency graph is computed (memoized, cycle-tolerant): depth 0 means no dependencies. Depth drives both node coloring and the default layout's row placement.
