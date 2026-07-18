---
name: sse-broadcaster
description: Manages live-update connections and pushes spec update events to connected browsers
group: infrastructure
tags: [sse, server-sent-events, push, real-time]
depends_on: []
features: features/sse-broadcaster/
---

# SSE Broadcaster

## Data model

### Subscriber

An open event-stream connection eligible to receive project updates until it disconnects, fails, or the broadcaster closes.

### Project update

A serializable snapshot of the current parsed project contracts and merged test status.

```m21-model
entities:
  Subscriber:
    identity: id
    fields:
      id: { type: string, required: true }
      connected: { type: boolean, required: true }
  ProjectUpdate:
    fields:
      specs: { type: array, items: object, required: true }
```

## Interfaces

### subscribe

Registers a Subscriber and establishes its event stream.

### broadcast-update

Sends a Project update to every active Subscriber and removes failed connections.

### close-broadcaster

Ends all subscriptions and releases the subscriber set.

```m21-interface
operations:
  subscribe: { input: Subscriber, output: Subscriber }
  broadcast-update:
    input: ProjectUpdate
    effects: [Sends the update to active subscribers and removes failed connections]
  close-broadcaster:
    effects: [Ends all subscriptions]
```

## Contract

Manages the live-update connections that keep open browser tabs in sync with the files on disk.

### Decisions

- **Server-Sent Events** over the alternatives (polling, WebSockets): updates flow strictly server → client, SSE needs no extra dependency or handshake protocol, and browsers reconnect natively.

### Connection management

- Maintains the set of currently connected clients
- On `GET /api/events`: marks the response as an event stream that must not be cached or closed, sends an initial connection comment, and adds the client to the set
- When a client disconnects, it is removed from the set
- On shutdown, every open connection is ended and the set is cleared

### Broadcasting

Each update serializes the new spec data and sends it as an event to every connected client. A client whose connection fails mid-write is silently dropped from the set.

### Client-side counterpart

The graph-client subscribes to the event stream, swaps in new spec data as messages arrive, and on stream error closes and reconnects after 2 seconds (no backoff needed — local dev only).
