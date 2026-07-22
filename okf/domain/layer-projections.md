---
type: Domain Model
title: Purpose-Built Definition Projections
description: Each SDLC definition layer projects the shared OKF graph into an interface designed for that layer's work.
tags: [domain-model, projections, workspace, metadata]
status: draft
sdlc: [design, system, application, components, code-design, implementation, deployment]
relationships:
  - type: governs
    target: /product/capabilities/lifecycle-workflows.md
  - type: governs
    target: /architecture/applications/web-workspace.md
  - type: informed-by
    target: /domain/sdlc-workflow.md
---

# Principle

The graph is canonical persistence, not the mandatory interface. Each definition layer chooses the representation best suited to its questions and artifacts.

# Layer projections

- **Business:** structured documents grouped into vision, problems, personas, business capabilities, outcomes, regulation, constraints, and risks
- **Product:** product-definition documents grouped into proposition, users, product capabilities, policies, measures, and boundaries
- **Design and Visual Language:** brand board, semantic tokens, journeys, screens, patterns, component stories, accessibility, live theme preview, and generated catalog
- **System:** grouped topology graph of systems, services, applications, databases, infrastructure, external dependencies, trust boundaries, and ownership
- **Application:** application selector plus architecture style, layers, responsibilities, interfaces, data, constraints, and application-local dependency views
- **Components:** component dependency graph grouped by application and architectural layer, with owned models and provided/consumed interfaces
- **Code Design:** contract registry for concepts, models, interfaces, patterns, decisions, Gherkin features, and implementation constraints
- **Implementation Handoff:** bounded package, affected concepts, required scenarios, readiness, unresolved questions, and coding-agent exchange
- **Deployment Definition:** environments, deployment topology, configuration, build artifacts, rollout, rollback, observability, recovery, and delivery-agent handoff

# Namespaced metadata

Concept frontmatter may include metadata named for a layer, for example:

```yaml
business:
  section: capabilities
system:
  kind: database
  group: data-platform
  boundary: owned
application:
  architecture_style: hexagonal
components:
  application: project-service
  group: domain
```

Each projection owns its metadata schema. Generic OKF consumers preserve it, and other projections ignore fields they do not understand.

# Invariants

- Projection metadata never changes concept identity or canonical meaning.
- A concept may appear in multiple projections with different presentation metadata.
- Missing optional presentation metadata degrades to a generic document or ungrouped item.
- Editing through any projection creates the same reviewable graph change.
