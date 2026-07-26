---
type: Domain Model
title: SDLC Definition Flow Model
description: Business-to-deployment definition layers guide product engineering while remaining many-to-many with knowledge types.
tags: [domain-model, sdlc, workflow, abstraction]
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: governs
    target: /product/capabilities/lifecycle-workflows.md
  - type: governs
    target: /agents/m21-agent.md
  - type: informed-by
    target: /experience/principles/non-linear-agency.md
---

# Definition flow

M21 organizes work through increasing product-engineering depth:

Business → Business Solution → Visual Design → System Design → Architecture → Application Experience Design → Application Architecture → Components → Code Design → Implementation Handoff → Deployment Definition

The flow communicates traceability and common direction of influence. It is not a temporal project plan, fixed questionnaire, or mandatory gate sequence.

# Definition layer

A Definition Layer supplies:

- Purpose and ownership boundary
- Questions the M21 agent should ask
- Knowledge and evidence expected at that depth
- Validation and traceability concerns
- Common upstream and downstream impact
- Handoff expectations

# Participation

A Concept may declare one or more layer identifiers in `sdlc` metadata. Participation means the concept is a primary artifact in that layer; it does not change concept type or create a copy. Connected non-members remain contextual references.

Types and layers are independent. A Decision may govern Business, Product, Visual Design, System Design, Architecture, or Code Design. A Constraint may apply across several layers. An Application is defined as an executable boundary in Architecture, then participates in its own Application Architecture, Components, Code Design, Implementation, and Deployment while realizing one or more conceptual System Design responsibilities through typed relationships.

# Application-scoped depth

Business, Business Solution, Visual Design, System Design, and Architecture are product-wide Definition Areas. System Design defines conceptual responsibilities without choosing deployable boundaries. Architecture chooses one or more actual owned Applications and maps them to those responsibilities. After Architecture, users select an owned Application as the scope root and work through Application Experience Design → Application Architecture → Components → Code Design → Implementation → Deployment for that Application. The selected Application persists while moving between these downstream areas.

Application scope is derived from canonical relationships rather than copied ownership metadata. An artifact belongs to the scope when a `part-of` or downstream `realizes` chain reaches the selected Application. Cross-application dependencies appear as contextual references and do not mix another Application's internals into the active scope.

# Non-linearity

Users may enter any area and work concurrently. Visual Design may expose a missing Business Solution assumption. System Design may reveal an impossible Solution constraint. Such findings become explicit upstream proposals.

Layer order never creates impact by itself. Typed relationships and changed meaning determine impact. Changes to upstream contracts commonly require downstream review; internal downstream changes remain local while upstream contracts are preserved.

# Outsourced execution boundary

M21 defines Code Design, Implementation Handoff, and Deployment Definition. Source-code implementation, pipeline execution, and infrastructure provisioning are performed by external coding or delivery agents in the MVP. Evidence and requested contract changes return to the shared graph.
