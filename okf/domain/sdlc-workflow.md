---
type: Domain Model
title: SDLC Definition Flow Model
description: Business-to-deployment definition layers guide product engineering while remaining many-to-many with knowledge types.
tags: [domain-model, sdlc, workflow, abstraction]
status: draft
sdlc: [design, system, application, components, code-design, implementation, deployment]
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

Business → Product → Design and Visual Language → System → Application → Components → Code Design → Implementation Handoff → Deployment Definition

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

A Concept may declare one or more layer identifiers in `sdlc` metadata. Participation means the concept is relevant working context in that layer; it does not change concept type or create a copy.

Types and layers are independent. A Decision may govern Business, Product, Design, System, or Code Design. A Constraint may apply across every layer. An Application participates in System context, Application architecture, Components, Code Design, Implementation, and Deployment.

# Non-linearity

Users may enter any layer and work concurrently. Design may expose a missing Product assumption. System architecture may reveal an impossible Product constraint. Such findings become explicit upstream proposals.

Layer order never creates impact by itself. Typed relationships and changed meaning determine impact. Changes to upstream contracts commonly require downstream review; internal downstream changes remain local while upstream contracts are preserved.

# Outsourced execution boundary

M21 defines Code Design, Implementation Handoff, and Deployment Definition. Source-code implementation, pipeline execution, and infrastructure provisioning are performed by external coding or delivery agents in the MVP. Evidence and requested contract changes return to the shared graph.
