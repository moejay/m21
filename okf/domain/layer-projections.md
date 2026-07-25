---
type: Domain Model
title: Purpose-Built Definition Projections
description: Each SDLC definition layer projects the shared OKF graph into an interface designed for that layer's work.
tags: [domain-model, projections, workspace, metadata]
status: draft
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: governs
    target: /product/capabilities/lifecycle-workflows.md
  - type: governs
    target: /architecture/applications/web-workspace.md
  - type: informed-by
    target: /domain/sdlc-workflow.md
---

# Principle

The graph is canonical persistence, not the mandatory interface. Each definition layer defaults to the purpose-built representation best suited to its questions and artifacts.

Every layer also offers a separate relationship-graph presentation of the same scoped primary artifacts. This alternate presentation replaces the purpose-built canvas rather than embedding a graph into its documents, boards, registries, or handoffs. Entering or leaving it preserves the active layer, selected Application, and focused Concept.

# Layer projections

- **Business:** structured documents grouped into vision, problems, personas, business capabilities, outcomes, regulation, constraints, and risks
- **Product:** product-definition documents grouped into proposition, users, product capabilities, policies, measures, and boundaries
- **Visual Design:** brand board, semantic tokens, journeys, screens, patterns, component stories, accessibility, live theme preview, and generated catalog
- **System Design:** conceptual responsibility and information-flow map plus canonical documents for the owned system, logical services, data boundaries, external dependencies, trust boundaries, qualities, and typed links without choosing executable topology
- **Architecture:** realization matrix and portfolio of actual owned Applications, supporting one full-stack or monolithic Application as well as separate frontend, backend, worker, or service Applications
- **Application Architecture:** persistent selected-Application workspace for internal responsibilities, interfaces, data, constraints, qualities, and dependency rules
- **Components:** dependency graph for Components owned by the selected Application, grouped by architectural layer, with provided and consumed interfaces
- **Code Design:** selected-Application contract registry for concepts, models, interfaces, patterns, decisions, Gherkin features, and implementation constraints
- **Implementation Handoff:** selected-Application bounded package, affected concepts, required scenarios, readiness, unresolved questions, and coding-agent exchange
- **Deployment Definition:** selected-Application deployment units, configuration, build artifacts, rollout, rollback, observability, recovery, and delivery-agent handoff

# Namespaced metadata

Concept frontmatter may include metadata named for a layer, for example:

```yaml
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
- A concept may appear in multiple projections with different presentation metadata.
- Missing optional presentation metadata degrades to a generic document or ungrouped item.
- The graph alternative never widens the active product-wide or selected-Application scope.
- Editing through any projection creates the same reviewable graph change.
