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

## Data model

### Server session

A locally bound development service with its address, active watch and event resources, current parsed contracts, and a close operation.

### Editing request

A size-limited request to create a spec or revise spec/feature content, accepted only after its structure and target path are valid.

```m21-model
entities:
  ServerSession:
    fields:
      address: { type: string, required: true }
      active: { type: boolean, required: true }
  EditingRequest:
    fields:
      target: { type: string, required: true }
      content: { type: string, required: true }
```

## Interfaces

### start-server

- Input: Project locations, binding options, and optional result-report location
- Output: A Server session
- Failures: Invalid binding or unavailable project resources
- Effects: Serves graph and contract data, watches project files, and accepts local edits until closed

### serve-contract-api

Provides graph retrieval, parsed contract retrieval, event streaming, spec creation, and spec/feature revision through the endpoints below.

```m21-interface
operations:
  start-server: { output: ServerSession, failures: [BindingFailure, UnavailableProject] }
  serve-contract-api:
    input: EditingRequest
    output: ServerSession
    failures: [InvalidRequest, UnsafePath]
```

## Contract

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

### Request body handling

Write endpoints read a JSON request body. The body is size-limited: a request exceeding the limit is rejected (413) without being buffered further. A body that is present but not valid JSON is a client error (400), distinct from a genuine server-side failure (500). No write to disk happens until the body has been validated.

### Server lifecycle

- Binds to the configured port (default 3333; port 0 requests a random free port, used by tests)
- Listens only on the loopback interface unless an explicit host is configured (the `--host` flag) — the editing endpoints have no authentication, so nothing outside the local machine may reach them by default
- Startup yields the bound port, the local address, and a close operation — closing tears down the watcher, ends all live-update connections, and stops accepting requests
- Graceful shutdown is triggered by the orchestrator on interrupt/terminate signals

### Non-goals

- Not a production web server: no TLS, no authentication, no static file serving. It exists to serve one local development session.
