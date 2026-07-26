---
type: Component
application-id: project-service
title: Product Graph Engine
description: Builds and queries the typed graph from normalized OKF concepts.
tags: [architecture, component, graph, query]
sdlc: [components, implementation]
components:
  section: components
  kind: domain-service
  group: domain
  layer: domain
  visibility: internal
  features:
    - features/application-scope.feature
    - features/lifecycle-workflows.feature
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /architecture/systems/product-knowledge-runtime.md
  - type: realizes
    target: /product/capabilities/knowledge-graph.md
  - type: constrained-by
    target: /domain/product-knowledge.md
---

# Responsibilities

- Build nodes and typed edges from normalized concepts
- Preserve unknown concept and relationship types
- Query incoming, outgoing, neighborhood, path, layer, owner, and status views
- Distinguish dependency, traceability, informative, and governance relationships
- Provide deterministic snapshots to validation, impact, AI context, projections, and clients

# Non-responsibilities

- Filesystem persistence
- Deciding whether a proposed change is accepted
- Rendering graph coordinates
- Inferring canonical relationships from arbitrary prose
