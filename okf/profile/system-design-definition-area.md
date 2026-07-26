---
type: Profile
application-id: project-service
title: System Design Definition Area
description: Project-local schema and boundary contract for conceptual technical knowledge owned by the singular System Design Definition Area.
tags: [profile, system-design, definition-area]
sdlc: [code-design]
code-design:
  section: contracts
  kind: workspace-contract
relationships:
  - type: constrains
    target: /sdlc/system.md
  - type: constrained-by
    target: /profile/definition-layer-frontmatter.md
---

# Ownership

Canonical System Design concepts use `area: system` and exactly one `system.section`. Controlled section/type pairs are overview/System; responsibilities/System Responsibility; data/Data Domain, Information Model, or Logical Data Store; flows/System Flow; dependencies/External Dependency; qualities/Quality Requirement; security/Trust Boundary or Security Requirement; failures/Failure Mode; constraints/System Constraint; risks/System Risk; decisions/System Decision.

# Boundary

System, System Responsibility, Data Domain, Logical Data Store, and External Dependency require `system.boundary` equal to `owned`, `managed`, or `external`. No other System metadata fields are accepted. Applications, runtimes, products, protocols, deployment units, and source structure are Architecture or downstream concerns.

# Projection

The workspace map is relationship-driven. `part-of` forms responsibility hierarchy. First-class System Flows retain concept identity and directed source/destination semantics. Boundaries and optional governing overlays remain derived from canonical concepts and relationships.
