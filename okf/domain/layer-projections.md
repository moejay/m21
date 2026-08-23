---
type: Domain Model
title: Purpose-Built Definition Projections
description: Each SDLC definition layer projects the shared OKF graph into an interface designed for that layer's work.
tags: [domain-model, projections, workspace, metadata]
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: governs
    target: /architecture/applications/web-workspace.md
  - type: informed-by
    target: /domain/sdlc-workflow.md
---

# Principle

The graph is canonical persistence, not the mandatory interface. Each definition layer defaults to the purpose-built representation best suited to its questions and artifacts.

# Layer projections

- **Business:** expandable cards grouped first by controlled Business section and then controlled type, with section, type, and status filters plus incoming and outgoing relationship context
- **Business Solution:** expandable cards grouped by controlled Solution section and type, including propositions, options, outcomes, capabilities, behaviors, delivery, boundaries, assumptions, risks, and decisions
- **Visual Design:** direction boards, live linked-CSS foundation specimens, composed themes, sandboxed linked-HTML Visual Components, asset galleries, visual accessibility evidence, decisions, and document fallbacks
- **System Design:** conceptual responsibility and information-flow map plus canonical documents for the owned system, logical services, data boundaries, external dependencies, trust boundaries, qualities, and typed links without choosing executable topology
- **Architecture:** realization matrix and portfolio of actual owned Applications, supporting one full-stack or monolithic Application as well as separate frontend, backend, worker, or service Applications
- **Application Architecture:** persistent selected-Application workspace for internal responsibilities, interfaces, data, constraints, qualities, and dependency rules
- **Components:** dependency graph for Components owned by the selected Application, grouped by architectural layer, with provided and consumed interfaces
- **Code Design:** selected-Application contract registry for concepts, models, interfaces, patterns, decisions, Gherkin features, and implementation constraints
- **Implementation Handoff:** selected-Application bounded package, affected concepts, required scenarios, readiness, unresolved questions, and coding-agent exchange
- **Deployment Definition:** selected-Application deployment units, configuration, build artifacts, rollout, rollback, observability, recovery, and delivery-agent handoff

# Global knowledge graph

A separate product-wide 3D graph projects every accepted OKF concept and every resolved typed relationship, regardless of active area or selected Application. It is entered from global workspace navigation rather than offered as an area presentation. Selecting a node focuses canonical concept context; highlighting a Definition Area changes emphasis without removing other knowledge; navigating the graph never changes membership, ownership, or accepted knowledge.

The global graph complements rather than replaces purpose-built authoring views. Layer and Application projections remain scoped to their own work.

# Namespaced metadata

Migrated concepts declare singular ownership and matching area metadata; unmigrated concepts may still use legacy layer metadata during transition. For example:

```yaml
area: business
business:
  section: capabilities
system:
  kind: database
  group: data-platform
  boundary: owned
architecture:
  section: applications
  kind: backend-service
  runtime: [nodejs]
application:
  section: architecture
  architecture_style: hexagonal
components:
  group: domain
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
```

Each projection owns its metadata schema. Generic OKF consumers preserve it, and other projections ignore fields they do not understand.

# Invariants

- Projection metadata never changes concept identity or canonical meaning.
- A migrated concept is primary in exactly its owning Definition Area; relationships provide cross-area context without transferring ownership.
- Missing optional presentation metadata degrades to a generic document or ungrouped item.
- Linked Visual Design artifacts are canonical and revision-bearing; specimen state and generated previews remain disposable.
- Fenced Mermaid in canonical Markdown renders as a strict explanatory view without replacing typed relationships or source text.
- The global graph always uses the complete accepted Project Snapshot and never inherits a layer or Application scope.
- Editing through any projection creates the same reviewable graph change.
