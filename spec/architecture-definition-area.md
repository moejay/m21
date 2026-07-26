---
name: architecture-definition-area
description: Accepted owned Application portfolio, stable identity, realization, communication, deployability, data authority, topology, and Architecture guidance contract.
group: product-definition
tags: [okf, architecture, applications, topology]
depends_on:
  - system-design-definition-area
---

# Architecture Definition Area

This contract implements `m21-spec/architecture.md`. Architecture turns conceptual System Design into the simplest justified portfolio of owned executable Applications.

## Data model

```m21-model
entities:
  ArchitectureMetadata:
    fields:
      section: { type: enum, values: [overview, applications, communications, constraints, risks, decisions], required: true }
      application-kind: { type: enum, values: [full-stack, web-client, mobile-application, desktop-application, backend-service, worker, cli, serverless-application, integration, data-pipeline] }
      independently-deployable: { type: boolean }
      communication-mode: { type: enum, values: [request-response, event, message, stream, batch, file, shared-store] }
  ArchitectureConcept:
    fields:
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      body: { type: string, required: true }
      area: { type: enum, values: [architecture], required: true }
      application-id: { type: string }
      architecture: { type: object, required: true }
      relationships: { type: array, items: object }
```

| Section | Controlled types |
|---|---|
| `overview` | Architecture |
| `applications` | Application |
| `communications` | Application Communication |
| `constraints` | Architecture Constraint |
| `risks` | Architecture Risk |
| `decisions` | Architecture Decision |

Every Application requires a unique stable lowercase kebab-case `application-id`, controlled `application-kind`, and boolean `independently-deployable`. Every downstream Application-scoped concept carries exactly one valid `application-id`. Communication requires controlled `communication-mode`; source, destination, System Flow, information, and trust use relationships.

## Interfaces

```m21-interface
operations:
  project-application-topology:
    purpose: Show root Architecture, every owned Application, contextual dependencies, directed communications, realization, authority, trust, quality, risk, constraint, and decision overlays.
    effects: [Leaves canonical knowledge unchanged]
  project-realization-matrix:
    purpose: Compare every owned System Responsibility against realizing Applications and diagnose orphan responsibilities.
    effects: [Leaves canonical knowledge unchanged]
  select-application-scope:
    purpose: Preserve stable Application identity while entering downstream Application Experience, Application Architecture, Components, Code Design, Implementation, and Deployment.
    effects: [Changes workspace scope without transferring ownership through dependencies]
```

## Contract

One Application is the default hypothesis. Another boundary requires accepted pressure from runtime, trust, ownership, offline operation, independent release, scaling, isolation, durability, failure, or technology constraints. Architecture records combination and separation rationale and rejected alternatives.

An Application is an owned executable boundary—not a source module, library, logical store, managed database, queue, provider, or deployment resource. One full-stack or monolithic Application may realize many responsibilities. A serverless function is an Application only with independent ownership, identity, deployment, and revision boundary.

The workspace combines a portfolio topology and realization matrix. Application nodes expose stable IDs, kind, and deployability. First-class communications render as directed mode-labeled edges. System Responsibilities may be summarized inside realizing Applications. Animation indicates modeled direction, never traffic or health, and has reduced-motion-safe alternatives.

Data authority, trust realization, external dependency placement, qualities, failures, constraints, risks, and decisions remain relationship-derived overlays. `depends-on` never transfers Application ownership. Invalid scope never widens to all Applications.

Architecture does not define Application internals, source interfaces, runtime/framework fields, infrastructure provisioning, environment rollout, or deployment implementation.
