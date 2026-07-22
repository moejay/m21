---
type: Specification
title: Definition Layer Frontmatter Profile
description: Normative M21 metadata and projection rules for primary artifacts and contextual references in each SDLC definition layer.
tags: [okf, frontmatter, sdlc, projections, contract]
status: draft
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
status: active
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
| `status` | required by M21 | `draft`, `active`, `superseded`, or `retired`. |
| `sdlc` | required by M21 | Non-empty unique list of definition-layer identifiers. |
| `tags` | optional | Topic labels; MUST NOT replace `sdlc`. |
| `owners` | optional | Person or team identifiers responsible for review. |
| `relationships` | optional | Canonical typed semantic connections. |

Valid `sdlc` identifiers are:

```yaml
[business, product, design, system, application, components, code-design, implementation, deployment]
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

For every identifier in `sdlc`, the matching namespaced object MUST exist and satisfy that layer's schema.

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

# Business metadata

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

Business presents structured documents grouped by `section`.

# Product metadata

```yaml
product:
  section: capabilities
  priority: critical
```

| Field | Requirement | Values |
|---|---|---|
| `section` | required | `proposition`, `users`, `outcomes`, `capabilities`, `behavior`, `policies`, `metrics`, `boundaries`, `constraints`, `risks`, `decisions` |
| `priority` | optional | `critical`, `high`, `medium`, `low`, `unranked` |

Product presents structured product-definition documents grouped by `section`.

# Design and Visual Language metadata

```yaml
design:
  section: components
  platforms: [web]
  group: navigation
```

| Field | Requirement | Values |
|---|---|---|
| `section` | required | `brand`, `principles`, `journeys`, `information-architecture`, `screens`, `visual-language`, `tokens`, `patterns`, `components`, `content`, `accessibility`, `decisions` |
| `platforms` | optional | List containing `web`, `ios`, `android`, `desktop`, `email`, `print`, `cross-platform`, or producer extension values. |
| `group` | optional | Stable producer-defined grouping identifier. |
| `theme` | optional | Semantic token map; valid only for visual-language or design-system concepts. |

Design presents brand and token boards, journeys, screens, patterns, component stories, accessibility, and generated Storybook-compatible handoffs.

# System metadata

```yaml
system:
  kind: database
  group: data-platform
  boundary: owned
  criticality: high
```

| Field | Requirement | Values |
|---|---|---|
| `kind` | required | `system`, `actor`, `application`, `service`, `database`, `data-store`, `queue`, `external-system`, `infrastructure`, `network`, `other` |
| `group` | optional | Stable topology group identifier; defaults to `ungrouped`. |
| `boundary` | required | `owned`, `managed`, `external`, `user`, `unknown` |
| `criticality` | optional | `critical`, `high`, `medium`, `low`, `unknown` |

System presents a grouped topology graph. Only primary System artifacts become topology nodes; connected Product, Design, Decision, Constraint, and Risk concepts appear as references.

# Application metadata

```yaml
application:
  section: applications
  architecture_style: hexagonal
  group: product-platform
  runtime: [nodejs, browser]
  deployable: true
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `applications`, `architecture`, `interfaces`, `data`, `security`, `operations`, `constraints`, `risks`, `decisions` |
| `architecture_style` | optional | Stable descriptive identifier such as `layered`, `hexagonal`, `mvc`, or `event-driven`. |
| `group` | optional | Application portfolio or suite identifier. |
| `runtime` | optional | List of descriptive runtime identifiers. |
| `deployable` | optional | Whether the concept represents an independently deployable application. |

Application presents an application selector and an application-local architecture workspace. Membership and ownership MUST be represented by relationships rather than repeated application IDs.

# Components metadata

```yaml
components:
  section: components
  kind: repository
  group: persistence
  layer: infrastructure
  visibility: internal
```

| Field | Requirement | Contract |
|---|---|---|
| `section` | required | `components`, `interfaces`, `data`, `events`, `constraints`, `risks`, `decisions` |
| `kind` | optional | Producer-defined component kind such as `module`, `service`, `adapter`, `repository`, `controller`, or `view`. |
| `group` | optional | Stable grouping identifier within the owning application. |
| `layer` | optional | Architectural layer identifier. |
| `visibility` | optional | `public`, `internal`, or `private`. |

Components presents an application-local dependency graph. The owning Application is determined through typed relationships, not duplicated metadata.

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
