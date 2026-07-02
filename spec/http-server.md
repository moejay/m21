---
name: http-server
description: Serves the graph, spec data, live updates, and editing endpoints over HTTP
group: infrastructure
tags: [http, server, rest-api]
depends_on:
  - name: spec-parser
    uses: [directory-parsing]
  - name: graph-generator
    uses: [html-generation]
  - name: file-watcher
    uses: [file-change-detection]
  - name: sse-broadcaster
    uses: [event-streaming]
  - name: spec-editor
    uses: [spec-write-back, feature-write-back, spec-creation]
  - name: results-parser
    uses: [results-discovery, results-merge]
features: features/http-server/
---

# HTTP Server

The development server. Exposes the interactive graph, the parsed spec data, a live-update stream, and the editing endpoints. It composes the other infrastructure modules — parsing, generation, watching, broadcasting, editing — behind a single HTTP interface.

### Test results overlay

When a results file is available — given explicitly (the `--results` flag) or auto-detected by results-parser — the server merges test outcomes onto the parsed specs before serving HTML and before every live-update broadcast. The served spec data and the live-reload stream therefore carry per-scenario status, plus rolled-up status and counts on each feature and spec. With no results file, specs are served unannotated.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` or `/index.html` | Serves the generated graph HTML with live reload enabled |
| `GET` | `/api/specs` | Returns parsed specs as JSON |
| `POST` | `/api/specs` | Creates a new spec file (rejects missing name or duplicate) |
| `GET` | `/api/events` | Live-update event stream |
| `PUT` | `/api/specs/:name/body` | Update a spec's body (frontmatter preserved) |
| `PUT` | `/api/features/:specName/:filename` | Update a feature file's content |

Unmatched routes return 404. Responses are marked non-cacheable so the browser always sees current data.

### Server lifecycle

- Binds to the configured port (default 3333; port 0 requests a random free port, used by tests)
- Listens only on the loopback interface unless an explicit host is configured (the `--host` flag) — the editing endpoints have no authentication, so nothing outside the local machine may reach them by default
- Startup yields the bound port, the local address, and a close operation — closing tears down the watcher, ends all live-update connections, and stops accepting requests
- Graceful shutdown is triggered by the orchestrator on interrupt/terminate signals

### Non-goals

- Not a production web server: no TLS, no authentication, no static file serving. It exists to serve one local development session.
