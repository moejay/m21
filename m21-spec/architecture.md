---
name: architecture-definition-area
description: Working contract for selecting the owned software-delivery portfolio, stable Application identities, executable and library boundaries, responsibility realization, communication, data authority, and architectural decisions.
group: definition-areas
tags: [architecture, applications, topology, decisions, working-draft]
depends_on:
  - system-design-definition-area
---

# Architecture Definition Area

> Status: **Agreed initial contract.** Architecture turns conceptual System Design into actual owned executable or consumable software-delivery boundaries.

## Data model

### Purpose and boundary

Architecture selects the simplest portfolio of owned Applications that can realize or support accepted System responsibilities and qualities. An Application is a stable owned software-delivery boundary: usually executable, but it may be a consumable library when that library needs independent identity, ownership, architecture, contracts, implementation, release, or distribution. Architecture owns the portfolio topology, stable Application identities, responsibility allocation, combination and separation rationale, independent release boundaries, runtime communication, library dependencies, data authority, trust realization, external dependency placement, architectural constraints, risks, and decisions.

Architecture does not decompose Application internals, define source modules, select internal patterns such as hexagonal or layered architecture, specify code interfaces, provision infrastructure, or define environment-specific rollout. Those concerns belong to Application Architecture, Components, Code Design, and Deployment.

### Root Architecture

One root `Architecture` concept owns the overall selected topology, rationale, relevant system-wide consequences, and rejected alternatives that do not require separate identity.

```yaml
type: Architecture
title: M21 executable architecture
area: architecture
architecture:
  section: overview
```

### Application identity

Every owned Application is a first-class concept with one stable Application ID:

```yaml
type: Application
title: Local Project Service
description: Coordinates accepted project knowledge, proposals, validation, AI guidance, and generated views.
area: architecture
application-id: project-service
architecture:
  section: applications
  application-kind: backend-service
  independently-releasable: true
relationships:
  - type: part-of
    target: /architecture/m21-architecture.md
  - type: realizes
    target: /system/responsibilities/accepted-knowledge-management.md
```

The Application ID:

- Is unique among active Applications.
- Uses lowercase kebab-case.
- Is stable across title and file-path changes.
- Changes only through an explicit identity migration.
- Is the canonical scope key used by Application Experience Design, Application Architecture, Components, Code Design, Implementation, and Deployment.
- Must not conflict with any typed structural or ownership relationship.

Application ID provides direct validated downstream scope. A duplicate direct `part-of` relationship to the Application is not required merely to restate that ID; meaningful hierarchy, realization, dependency, and communication relationships remain canonical graph semantics.

### Minimal metadata

| Field | Applies to | Shape | Requirement | Workspace use | Missing behavior |
|---|---|---|---|---|---|
| `architecture.section` | All Architecture concepts | Closed section enum | Required | Selects grouping and architecture projection | Concept is not valid primary Architecture knowledge |
| `application-id` | `Application` and every Application-scoped downstream concept | Lowercase kebab-case identifier | Required where Application scope exists | Stable selection, filtering, deep links, and ownership validation | Invalid or missing scope never widens to all Applications |
| `architecture.application-kind` | `Application` | Controlled enum | Required | Application portfolio filtering, iconography, and topology summaries | Generic Application card plus diagnostic |
| `architecture.independently-releasable` | `Application` | Boolean | Required | Distinguishes independent version/release boundaries from deliberately co-released Applications; for executable kinds release may include deployment, while libraries may be published or distributed | Release boundary remains unresolved |
| `architecture.communication-mode` | `Application Communication` | Controlled enum | Required | Selects edge treatment and communication filtering | Communication remains diagnosable but is not inferred |

No runtime, framework, repository, provider, region, protocol, or source-path metadata is accepted initially. Such values remain body content or later-area knowledge until a concrete workspace or validation requirement justifies structure.

### Sections, controlled types, and presentation

| Section | Controlled types | Primary presentation |
|---|---|---|
| `overview` | `Architecture` | Root architecture summary and complete topology entry point |
| `applications` | `Application` | Application portfolio cards and topology nodes |
| `communications` | `Application Communication` | Directed communication edges with canonical detail |
| `constraints` | `Architecture Constraint` | Constraint cards and topology overlays |
| `risks` | `Architecture Risk` | Risk cards and affected-Application overlays |
| `decisions` | `Architecture Decision` | Decision cards and rejected-alternative context |

Data authority, System realization, trust boundaries, and external dependencies are relationship-derived overlays rather than duplicate Architecture concept types.

### Controlled Application kinds

Initial Application kinds:

| Value | Meaning |
|---|---|
| `full-stack` | One Application owns user-facing and server-side execution responsibilities. |
| `web-client` | Browser-executed user-facing Application. |
| `mobile-application` | Installed mobile Application. |
| `desktop-application` | Installed desktop Application. |
| `backend-service` | Server-side Application providing owned capabilities. |
| `worker` | Application primarily executing deferred or background work. |
| `cli` | Command-line Application. |
| `serverless-application` | Function-oriented Application operated through a serverless execution model. |
| `integration` | Application primarily mediating an owned external-system integration. |
| `data-pipeline` | Application primarily ingesting, transforming, or distributing data. |
| `library` | Consumable owned software package with its own stable contracts, implementation scope, and release or distribution boundary. |

An Application gets one primary kind for portfolio presentation. Mixed details belong in its body. New kinds require a distinct workspace or validation need rather than a naming preference.

### Communication modes

Initial communication modes:

```text
request-response
event
message
stream
batch
file
shared-store
```

An `Application Communication` becomes first-class when the connection has its own direction, contract, trust, failure, quality, rationale, relationships, or independent revision. A trivial dependency remains a typed relationship.

Source and destination Applications, realized System Flow, carried Information Models, and relevant trust boundaries use typed relationships. They are not copied into communication metadata.

## Interfaces

The Architecture workspace is expected to:

- Show the root Architecture and every owned Application in a portfolio topology.
- Show contextual external and managed dependencies without treating them as owned Applications.
- Show which System Responsibilities each Application realizes.
- Provide a realization matrix of System Responsibilities against Applications.
- Detect owned System Responsibilities with no realizing Application.
- Allow one Application to realize many responsibilities and one responsibility to be realized by several Applications when rationale exists.
- Render Application Communications as directed edges, optionally animated with reduced-motion-safe alternatives.
- Toggle Application kind, realization, communication mode, data authority, external dependencies, trust boundaries, constraints, risks, and decisions.
- Focus one Application and preserve that stable selection when entering downstream areas.
- Compare combination and separation alternatives through reviewable proposals.
- Never create Applications merely to mirror source folders, framework modules, databases, queues, or deployment resources.

## Contract

### Decisions the user must make

Architecture guidance helps the user decide:

1. **Application portfolio** — can one owned Application satisfy the System, or are several necessary?
2. **Responsibility allocation** — which Application realizes every owned System Responsibility?
3. **Combination and separation** — why are responsibilities kept together or split?
4. **Application identity and kind** — what stable executable or consumable delivery boundary exists and how should it be classified?
5. **Releasability** — can each Application be versioned and released independently, and if not, why is a separate Application boundary still useful?
6. **Interaction** — which executable Applications communicate at runtime, and which Applications consume libraries through build or package dependencies?
7. **Data authority** — which Application has authority to create or change each owned data domain or logical store?
8. **Trust realization** — where do accepted System trust boundaries fall across Applications and communications?
9. **External dependency placement** — which Application depends on each managed or external capability?
10. **Quality response** — how does topology respond to scale, availability, durability, latency, isolation, and recovery expectations recorded in System Design?
11. **Failure isolation** — what fails together, what can degrade independently, and what accepted state must survive?
12. **Alternatives** — which plausible topologies were rejected and why?

The user need not answer every question with a separate document. Answers remain in the root Architecture or Application body unless they independently justify an Architecture Decision, Constraint, Risk, or Communication concept.

### Common topology choices

Architecture labels are discussion tools, not a single closed `architecture-kind` enum. Real products are often hybrid.

| Choice | Meaning and appropriate pressure |
|---|---|
| **Single full-stack Application / monolith** | Default when one executable and release boundary can satisfy accepted responsibilities and qualities. |
| **Application with owned libraries** | One or more executable Applications consume shared owned libraries that warrant independent contract and release scope. |
| **Modular monolith** | One Application with deliberate internal boundaries; internal module structure belongs to Application Architecture. |
| **Client–server** | Separate client and server Applications where runtime, trust, offline, or release boundaries require separation. |
| **Multiple clients with shared backend** | Web, mobile, desktop, or CLI Applications share server-side responsibilities and data authority. |
| **Service-oriented or microservice portfolio** | Several independently deployable backend Applications justified by ownership, scaling, isolation, release, or technology constraints—not fashion. |
| **Event-driven topology** | Applications coordinate through accepted asynchronous events; may coexist with any portfolio shape. |
| **Worker or pipeline topology** | Deferred, scheduled, or data-intensive responsibilities require a separately owned executable boundary. |
| **Serverless topology** | Function-oriented execution is selected for workload, operational, or provider reasons. Provider configuration belongs to Deployment. |
| **Local-first or edge topology** | Important state or work occurs on user devices or near data sources, with explicit synchronization and authority decisions. |
| **Hybrid topology** | Deliberate combination of the above, with each boundary justified independently. |

Layered, hexagonal, clean, MVC, component-based, and similar internal styles are not portfolio topologies; they belong to Application Architecture.

### Topology projection

The generated topology uses:

- Application nodes identified by stable Application ID and kind.
- System Responsibilities nested or summarized inside realizing Applications.
- Directed communication edges with mode labels and optional animation.
- Contextual external dependencies outside the owned Application boundary.
- Data-authority, trust, quality, risk, constraint, and decision overlays.
- A realization matrix alongside the spatial graph.

Animation indicates modeled direction, not live traffic or health. Position, zoom, filters, overlays, and collapsed state remain workspace state.

### Application boundary rules

- An Application is an owned software-delivery boundary: executable or a qualifying consumable library, not every dependency or infrastructure resource.
- A managed database remains a managed dependency or Deployment resource, not an owned Application.
- A logical data store remains System knowledge until Architecture assigns authority and Deployment selects realization.
- A library is an Application only when it needs its own stable identity, ownership, contracts, implementation scope, and release or distribution boundary. Incidental packages, helpers, and source modules remain Components.
- A third-party or managed library remains an External Dependency, not an owned Application.
- A full-stack or monolithic Application may realize many System Responsibilities without creating artificial child Applications.
- A serverless function is a separate Application only when it has independent ownership, identity, release, and deployment boundary; otherwise it is a later Component or Deployment unit.
- A library may have Application Architecture, Components, Code Design, Implementation, and package delivery knowledge, but normally has no Application Experience Design.
- `depends-on` never transfers Application ownership.

### Guidance posture

The agent begins with one Application as the default hypothesis and asks what accepted constraint or quality forces another boundary. It compares alternatives, detects orphan responsibilities, hidden shared data, accidental distribution, circular communication, unclear authority, libraries that should remain Components, and unjustified independent release boundaries.

The agent proposes rather than selects Architecture. It never promotes System parts into Applications merely because common frameworks or diagrams use those shapes.

### Deferred refinement

Runtime and exact protocol remain body content initially. Future structured fields require a concrete Architecture workspace or validation use. Owned shared libraries use real `application-kind: library` identities when they meet the Application-boundary criteria; they never use a fake reserved `shared` ID.
