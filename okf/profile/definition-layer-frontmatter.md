---
type: Specification
title: Definition Layer Frontmatter Profile
description: Normative M21 metadata and projection rules for primary artifacts and contextual references in each SDLC definition layer.
tags: [okf, frontmatter, sdlc, projections, contract]
sdlc: [code-design]
code-design:
  section: contracts
  kind: metadata-profile
  visibility: public
relationships:
  - type: governs
    target: /domain/sdlc-workflow.md
  - type: governs
    target: /domain/layer-projections.md
  - type: depends-on
    target: /profile.md
---

# Purpose

This profile defines how M21 determines the main artifacts in a definition layer, how connected knowledge appears as contextual references, and which namespaced frontmatter each layer understands.

The profile extends OKF without changing OKF concept identity or preventing generic consumers from reading a bundle.

# Common concept frontmatter

Every M21-managed concept MUST contain:

```yaml
type: Product Capability
title: Non-Linear Knowledge Graph
description: Explore and evolve connected product knowledge.
sdlc: [product]
```

It MAY contain:

```yaml
tags: [graph, traceability]
timestamp: 2026-07-20T12:00:00Z
resource: https://example.com/canonical-resource
owners: [product-platform]
relationships:
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
    rationale: The graph is the product realization of shared knowledge governance.
    evidence: [/research/architecture-drift.md]
```

## Common fields

| Field | Requirement | Contract |
|---|---|---|
| `type` | required by OKF | Descriptive concept type; consumers tolerate unknown values. |
| `title` | required by M21 | Human display name. |
| `description` | required by M21 | One-sentence orientation suitable for cards and references. |
| `sdlc` | required by M21 | Non-empty unique list of definition-layer identifiers. |
| `tags` | optional | Topic labels; MUST NOT replace `sdlc`. |
| `owners` | optional | Person or team identifiers responsible for review. |
| `relationships` | optional | Canonical typed semantic connections. |

Valid `sdlc` identifiers are:

```yaml
[business, product, design, system, architecture, application, components, code-design, implementation, deployment]
```

# Primary artifact rule

For selected layer `L`:

```text
primary(L) = every concept whose sdlc list contains L
```

Primary artifacts:

- Appear in the layer's main document set, board, topology, registry, or handoff.
- Are organized using the matching namespaced metadata object.
- May be edited from that layer through the normal proposal workflow.
- May be primary in more than one layer when that is deliberate.

A concept MUST NOT be tagged with a layer merely because it is connected to knowledge in that layer.

# Contextual reference rule

For every primary artifact, M21 examines its incoming and outgoing typed relationships. A connected concept that is not primary in the selected layer is a contextual reference.

References:

- Appear beside the relationship or section where their meaning is relevant.
- Show common orientation fields: type, title, description, status, and relationship rationale.
- Do not appear as main cards, topology nodes, registry entries, or handoff items by default.
- May be expanded or followed to their owning definition layer.
- Default to one relationship hop; deeper context requires explicit expansion.
- Are deduplicated by concept ID while preserving every relevant relationship.

Reference placement uses target concept type and relationship direction:

| Connected knowledge | Default reference slot |
|---|---|
| Vision, Goal, Problem, Persona, Business Capability, Product Capability | Intent and upstream context |
| Decision | Decisions and rationale |
| Constraint, Regulation, Policy | Governing constraints |
| Risk | Risks and mitigations |
| System, Application, Component | Architecture and realization |
| Model, Interface, Contract, Feature | Code design and evidence |
| Implementation or Deployment artifact | Downstream handoff and evidence |
| Unknown type | Related knowledge |

A layer MAY refine these slots but MUST NOT convert a reference into a primary artifact without an explicit `sdlc` tag.

# Namespace rule

For every identifier in `sdlc`, the matching namespaced object MUST exist and satisfy that layer's schema. Canonical `Definition Layer` documents are the sole exception because they describe a layer rather than contributing a primary artifact to it.

```yaml
sdlc: [system, deployment]

system:
  kind: service
  group: ingestion
  boundary: owned

deployment:
  section: deployment-units
  kind: deployment-unit
  environment: [staging, production]
```

A layer namespace SHOULD NOT exist when the concept is not tagged for that layer. Semantic ownership and dependencies remain relationships; namespace metadata controls organization, filtering, and presentation and MUST NOT duplicate relationship meaning.

# Common body contract

Every accepted primary artifact MUST have a non-empty Markdown body that explains the concept in the language of its layer, states material scope and boundaries, distinguishes accepted knowledge from assumptions and evidence, and records rationale for consequential choices. Bodies use typed relationships instead of copied ID lists and avoid current source files, symbols, framework mechanics, and generated-view details unless they are explicit constraints.

There is no mandatory empty-heading template. Body headings fit the concept type; repeated frontmatter values are not a substitute for durable meaning.

# Shared agent posture

For every product-wide layer, the agent starts from accepted knowledge, asks bounded questions, distinguishes evidence from assumptions, suggests frontmatter and body changes together, and identifies missing context, contradictions, weak boundaries, and likely impact. All output remains a reviewable proposal. The agent MUST NOT invent evidence, priority, ownership, certainty, status, or acceptance.

# Business

## What it is

Business defines why the product should exist, who is affected, what outcomes and enduring business capabilities matter, and which organizational, regulatory, policy, and commercial constraints apply. It owns problem and outcome meaning, not product features or technical solutions.

## Agent assistance

The agent helps elicit stakeholders, current conditions, desired outcomes, evidence, capabilities, regulation, assumptions, risks, and exclusions. It challenges solution-shaped problems, unsupported certainty, unmeasurable outcomes, and personas disconnected from observed needs. It proposes typed links among problems, personas, capabilities, outcomes, constraints, and evidence without inventing or accepting them.

## Frontmatter

```yaml
business:
  section: problems
  evidence: observed
  priority: high
```

| Field | Requirement | Values |
|---|---|---|
| `section` | required | `vision`, `problems`, `personas`, `capabilities`, `outcomes`, `metrics`, `regulation`, `constraints`, `risks`, `decisions` |
| `evidence` | optional | `unknown`, `assumption`, `hypothesis`, `observed`, `validated`, `not-applicable` |
| `priority` | optional | `critical`, `high`, `medium`, `low`, `unranked` |

Business presents structured documents grouped by `section`. `evidence` is strongly expected for problems, outcomes, and consequential claims. `priority` records reviewed business importance and MUST NOT be inferred solely by the agent.

## Body expectation

The body explains the present condition, affected people or operations, evidence and uncertainty, consequences, desired outcome, and boundaries. Capability bodies define an enduring business ability and accountability. Metrics define what is measured and why. Regulatory and constraint bodies identify source, obligation, applicability, and consequence. Business bodies MUST NOT prescribe Product features or Application topology.

# Product

## What it is

Product translates accepted Business context into the value, behavior, capabilities, policies, boundaries, and measurable user outcomes the product promises. It defines what the product must enable without choosing visual treatment or technical realization.

## Agent assistance

The agent connects Product capabilities to Business problems, personas, and outcomes; separates outcomes from feature requests; finds overlap; clarifies scope and policies; surfaces edge cases; and challenges requirements with no traceable value. It proposes acceptance-oriented language while avoiding Visual Design and technical decisions.

## Frontmatter

```yaml
product:
  section: capabilities
  priority: critical
```

| Field | Requirement | Values |
|---|---|---|
| `section` | required | `proposition`, `users`, `outcomes`, `capabilities`, `behavior`, `policies`, `metrics`, `boundaries`, `constraints`, `risks`, `decisions` |
| `priority` | optional | `critical`, `high`, `medium`, `low`, `unranked` |

Product presents structured product-definition documents grouped by `section`. Active capabilities SHOULD trace through typed relationships to the Business knowledge they realize or support.

## Body expectation

The body states the user or Product outcome, provided capability or behavior, scope boundaries, governing policies, important scenarios and failure outcomes, measures of success, assumptions, and unresolved decisions. Product bodies remain solution-neutral: interaction belongs to Visual Design, conceptual technical responsibility to System Design, and executable boundaries to Architecture.

# Visual Design migration

The former `design` namespace and many-to-many layer contract is superseded by the singular Visual Design Definition Area profile at `/profile/visual-design-definition-area.md`. Legacy imported journeys, screens, interaction principles, and information architecture remain readable but are not primary Visual Design artifacts; they await Application Experience migration.

# System Design

## What it is

System Design defines the conceptual technical system needed to satisfy Product and Visual Design contracts: logical responsibilities, actors, information flows, data ownership, trust boundaries, external dependencies, qualities, constraints, risks, and failure modes. It does not choose the number of Applications or deployable units.

## Agent assistance

The agent derives responsibilities from Product capabilities, identifies actors and external systems, traces information and ownership, exposes trust boundaries and missing failure behavior, and asks for measurable quality needs. It challenges technology-first decomposition and moves monolith, service, frontend/backend, and deployability decisions to Architecture.

## Frontmatter

```yaml
system:
  kind: database
  group: data-platform
  boundary: owned
  criticality: high
```

| Field | Requirement | Values |
|---|---|---|
| `kind` | required | `system`, `subsystem`, `actor`, `application`, `service`, `database`, `data-store`, `queue`, `external-system`, `infrastructure`, `network`, `other` |
| `group` | optional | Stable topology group identifier; defaults to `ungrouped`. |
| `boundary` | required | `owned`, `managed`, `external`, `user`, `unknown` |
| `criticality` | optional | `critical`, `high`, `medium`, `low`, `unknown` |

System Design presents a conceptual responsibility and information-flow map. `criticality` is recommended for owned or managed responsibilities and data stores whose failure affects Product outcomes. Connected Product, Visual Design, Decision, Constraint, and Risk concepts appear as references.

## Body expectation

The body states the conceptual responsibility, provided and consumed information, ownership of data and decisions, actors and external dependencies, trust boundaries, quality expectations, failure and degradation behavior, constraints, risks, and rationale. It avoids source modules and claims about which Application owns the responsibility.

# Architecture

## What it is

Architecture turns conceptual System Design responsibilities into the actual portfolio of owned executable Applications. It decides whether the product uses one monolith or full-stack Application or several web, mobile, backend, worker, CLI, local-service, or integration Applications without decomposing their internals.

## Agent assistance

The agent proposes the simplest topology that satisfies accepted constraints, compares combination and separation trade-offs, maps every owned System Design responsibility to at least one Application, and detects orphan responsibilities, accidental distribution, hidden coupling, unclear data ownership, and ambiguous deployment boundaries.

## Frontmatter

```yaml
architecture:
  section: applications
  kind: full-stack
  group: product-platform
  runtime: [nodejs, browser]
  deployable: true
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `applications`, `topology`, `communication`, `data`, `security`, `constraints`, `risks`, `decisions` |
| `kind` | required for Applications | Executable boundary kind such as `full-stack`, `web-client`, `backend-service`, `api`, `worker`, `cli`, or `local-service`. |
| `group` | optional | Application portfolio or deployment grouping identifier. |
| `runtime` | required for accepted Applications | Non-empty list of descriptive runtime identifiers. |
| `deployable` | required for accepted Applications | Whether the Application is independently deployable. |

For every accepted Application, `kind`, `runtime`, and `deployable` are required. Architecture defines the actual owned Application topology that realizes conceptual System Design responsibilities. One Application may realize many responsibilities, and one responsibility may be realized by several Applications. Ownership and realization MUST use typed relationships rather than copied IDs in metadata.

## Body expectation

The body explains the Application or topology boundary, System Design responsibilities realized, rationale for combining or separating responsibilities, runtime and deployability assumptions, communication and trust boundaries, data authority, external dependencies, operational consequences, constraints, risks, and rejected alternatives. Internal modules, ports, state models, and dependency rules belong to Application Architecture.

# Application Architecture metadata

```yaml
application:
  section: architecture
  architecture_style: hexagonal
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `architecture`, `interfaces`, `data`, `security`, `operations`, `constraints`, `risks`, `decisions` |
| `architecture_style` | optional | Stable internal style such as `layered`, `hexagonal`, `mvc`, `component-based`, or `event-driven`. |

Application Architecture presents the selected Application's internal responsibilities, interfaces, data, security, operations, and dependency rules. Membership and ownership MUST be represented by relationships rather than repeated Application IDs.

# Components metadata

```yaml
components:
  section: components
  kind: repository
  group: persistence
  layer: infrastructure
  visibility: internal
  features:
    - features/project-workspace.feature
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `components`, `interfaces`, `data`, `events`, `constraints`, `risks`, `decisions` |
| `kind` | optional | Producer-defined component kind such as `module`, `service`, `adapter`, `repository`, `controller`, or `view`. |
| `group` | optional | Stable grouping identifier within the owning application. |
| `layer` | optional | Architectural layer identifier. |
| `visibility` | optional | `public`, `internal`, or `private`. |
| `features` | required for accepted Components | Non-empty list of repository-relative executable Gherkin feature files that verify the Component's public behavior and durable guarantees. |

Components presents an application-local dependency graph. The owning Application is determined through typed relationships, not duplicated metadata. Gherkin features are the primary implementation testing contract; focused unit or adapter tests may supplement them but MUST NOT replace their observable guarantees.

# Code Design metadata

```yaml
code-design:
  section: interfaces
  kind: command
  namespace: project.change
  technology: [typescript]
  visibility: public
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `models`, `interfaces`, `patterns`, `contracts`, `events`, `errors`, `features`, `constraints`, `decisions` |
| `kind` | optional | Producer-defined design kind such as `entity`, `value-object`, `command`, `query`, `event`, `service`, `schema`, or `feature`. |
| `namespace` | optional | Stable logical namespace, independent of current file layout. |
| `technology` | optional | List of deliberately selected technology identifiers. |
| `visibility` | optional | `public`, `internal`, or `private`. |

Code Design presents models, interfaces, patterns, contracts, decisions, and executable Gherkin behavior as a contract registry.

# Implementation Handoff metadata

```yaml
implementation:
  section: handoffs
  target:
    repository: github.com/example/product
    ref: main
    path: apps/workspace
  readiness: ready
  agent: coding-agent
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `handoffs`, `increments`, `changes`, `verification`, `questions`, `evidence` |
| `target` | optional | Repository, base reference, and optional bounded path for the external coding agent. |
| `readiness` | required for handoffs | `draft`, `blocked`, `ready`, `in-progress`, `returned`, or `accepted`. |
| `agent` | optional | Intended external agent or execution profile. |

Implementation presents bounded work packages. Scope is established through relationships to Code Design, Component, Decision, Constraint, and Feature concepts rather than copied ID lists.

# Deployment Definition metadata

```yaml
deployment:
  section: deployment-units
  kind: deployment-unit
  environment: [staging, production]
  group: workspace
  strategy: rolling
  regions: [us-central1]
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `environments`, `deployment-units`, `configuration`, `pipelines`, `rollout`, `observability`, `recovery`, `security`, `constraints`, `decisions` |
| `kind` | optional | `environment`, `deployment-unit`, `pipeline`, `configuration`, `secret`, `migration`, `health-check`, `runbook`, `policy`, or `other`. |
| `environment` | optional | List of stable environment identifiers. |
| `group` | optional | Deployment topology grouping identifier. |
| `strategy` | optional | `rolling`, `blue-green`, `canary`, `recreate`, `manual`, or `other`. |
| `regions` | optional | List of region or location identifiers. |

Deployment presents environments, topology, rollout, rollback, observability, recovery, and the delivery-agent handoff. Application and System membership remain typed relationships.

# Validation

M21 validation MUST report:

- Unknown `sdlc` identifiers
- Missing namespace for a declared layer
- Namespace present without its corresponding `sdlc` tag
- Missing required namespace fields
- Unsupported closed-enum values
- Invalid field shapes
- Broken relationship targets

Validation SHOULD warn about:

- Concepts tagged as primary in many layers without layer-specific meaning
- Presentation metadata that duplicates semantic relationships
- Primary artifacts with no traceability to adjacent layers
- Handoffs marked ready while required references or diagnostics remain unresolved

# Compatibility

Unknown concept types, relationship types, namespace extension fields, and producer-defined open values MUST be preserved during round trips. Closed enums in this profile apply only where explicitly stated.
