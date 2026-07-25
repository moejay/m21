---
name: product-definition-workflow
description: Product-level contract for Business, Product, Visual Design, System Design, and Architecture definition documents, metadata, body content, and AI-guided authoring.
group: product-definition
tags: [okf, product-definition, metadata, guided-authoring]
depends_on: []
features: features/product-definition-workflow/
---

# Product Definition Workflow

## Data model

### Definition document

A Definition Document is one canonical OKF Markdown concept that contributes primary knowledge to one or more product-wide definition layers. Its YAML frontmatter carries machine-readable identity, lifecycle, classification, projection, and traceability metadata. Its Markdown body carries the durable human-readable meaning that cannot be reduced to labels or enums.

The five product-wide layers are ordered by increasing realization depth:

**Business → Product → Visual Design → System Design → Architecture**

The order expresses common influence and traceability, not mandatory chronology. Users may start anywhere, move backward when assumptions are exposed, and revise layers concurrently.

The stable layer and namespace identifier for Visual Design remains `design`; only its human-facing name changes.

### Common frontmatter

Every managed Definition Document has:

- `type` — descriptive OKF concept type. It classifies what the document means; it does not select a workflow layer.
- `title` — concise human-readable identity.
- `description` — one sentence explaining the concept's significance without requiring the body to be opened.
- `status` — `draft`, `active`, `superseded`, or `retired`.
- `sdlc` — non-empty unique list of layer identifiers. Membership makes the document a primary artifact in each listed layer.
- A namespace object matching each `sdlc` value, except on the Definition Layer documents that describe the workflow itself.
- `relationships` when semantic traceability, realization, dependency, constraint, or impact exists.

Optional common fields include `tags`, `owners`, `timestamp`, and `resource`. Tags aid discovery but never replace `sdlc`; owners identify review responsibility but never replace typed relationships.

```m21-model
entities:
  DefinitionDocumentHeader:
    fields:
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      status: { type: enum, values: [draft, active, superseded, retired], required: true }
      sdlc: { type: array, items: string, required: true }
      tags: { type: array, items: string }
      owners: { type: array, items: string }
      relationships: { type: array, items: object }
  BusinessMetadata:
    fields:
      section: { type: enum, values: [vision, problems, personas, capabilities, outcomes, metrics, regulation, constraints, risks, decisions], required: true }
      evidence: { type: enum, values: [unknown, assumption, hypothesis, observed, validated, not-applicable] }
      priority: { type: enum, values: [critical, high, medium, low, unranked] }
  ProductMetadata:
    fields:
      section: { type: enum, values: [proposition, users, outcomes, capabilities, behavior, policies, metrics, boundaries, constraints, risks, decisions], required: true }
      priority: { type: enum, values: [critical, high, medium, low, unranked] }
  VisualDesignMetadata:
    fields:
      section: { type: enum, values: [brand, principles, journeys, information-architecture, screens, visual-language, tokens, patterns, components, content, accessibility, decisions], required: true }
      platforms: { type: array, items: string }
      group: { type: string }
      theme: { type: object }
      preview: { type: object }
  SystemDesignMetadata:
    fields:
      kind: { type: enum, values: [system, subsystem, actor, application, service, database, data-store, queue, external-system, infrastructure, network, other], required: true }
      group: { type: string }
      boundary: { type: enum, values: [owned, managed, external, user, unknown], required: true }
      criticality: { type: enum, values: [critical, high, medium, low, unknown] }
  ArchitectureMetadata:
    fields:
      section: { type: enum, values: [applications, topology, communication, data, security, constraints, risks, decisions], required: true }
      kind: { type: string }
      group: { type: string }
      runtime: { type: array, items: string }
      deployable: { type: boolean }
  DefinitionGuidanceRequest:
    fields:
      layer: { type: enum, values: [business, product, design, system, architecture], required: true }
      intent: { type: string, required: true }
      conceptIds: { type: array, items: string }
  DefinitionGuidanceProposal:
    fields:
      layer: { type: enum, values: [business, product, design, system, architecture], required: true }
      questions: { type: array, items: string, required: true }
      proposedDocuments: { type: array, items: object, required: true }
      traceabilitySuggestions: { type: array, items: object, required: true }
      unresolvedAssumptions: { type: array, items: string, required: true }
```

### Body contract

Every active Definition Document has a non-empty Markdown body that:

- Explains the concept in the vocabulary of its layer.
- States scope and boundaries where ambiguity could change downstream work.
- Separates accepted knowledge from assumptions, hypotheses, evidence, and unresolved questions.
- Records rationale for consequential choices rather than merely restating the choice.
- Uses typed relationships for cross-document semantics instead of copying IDs or maintaining manual link lists in prose.
- Avoids current file layout, symbols, framework mechanics, and generated-view details unless a deliberate product constraint requires them.

The body has no mandatory boilerplate template. Headings should fit the concept type and preserve useful meaning. Empty headings and repeated frontmatter values are not valid substitutes for content.

## Interfaces

```m21-interface
operations:
  guide-product-definition:
    purpose: Help a user discover, clarify, and connect product-wide definition knowledge without treating model output as accepted truth.
    input: DefinitionGuidanceRequest
    output: DefinitionGuidanceProposal
    failures: [UnknownDefinitionLayer, InsufficientAcceptedContext]
    effects: [Creates reviewable questions and proposed document changes without mutating canonical knowledge]
  assess-product-definition:
    purpose: Identify missing required metadata, thin body content, unsupported assumptions, broken traceability, contradictions, and likely downstream impact in one product-wide layer.
    input: DefinitionGuidanceRequest
    output: DefinitionGuidanceProposal
    failures: [UnknownDefinitionLayer]
    effects: [Leaves accepted knowledge unchanged]
```

## Contract

### Shared agent posture

For every product-wide layer, the agent:

- Begins from accepted project knowledge and the user's stated intent.
- Asks bounded questions that help the user make one meaningful decision at a time.
- Distinguishes observations, validated evidence, hypotheses, assumptions, and preferences.
- Suggests concept types, namespace metadata, body structure, and typed relationships together so prose and machine-readable meaning remain aligned.
- Detects missing upstream context, contradictions, duplicate concepts, weak boundaries, and unsupported certainty.
- Explains likely downstream impact without claiming that layer order itself proves impact.
- Produces reviewable proposals. It never silently fills gaps, changes status, invents evidence, or persists AI output.

### Business

#### What it is

Business defines why the product should exist, who is affected, what business capability or outcome matters, and which commercial, organizational, regulatory, or policy environment constrains the work. It owns problem and outcome meaning, not product features or technical solutions.

#### How the agent helps

The agent elicits stakeholders, current conditions, desired outcomes, evidence, operating capabilities, regulation, assumptions, risks, and explicit exclusions. It challenges solution-shaped problems, unsupported urgency, unmeasurable outcomes, and personas disconnected from observed needs. It proposes links among problems, personas, capabilities, outcomes, constraints, and evidence.

#### Frontmatter expectation

A Business document includes `sdlc: [business]` and a `business` object with required `section`. `evidence` is strongly expected for problems, outcomes, and claims whose certainty affects prioritization. `priority` is optional and expresses reviewed business importance, not an agent-generated ranking.

```yaml
type: Business Problem
title: Fragmented product knowledge
description: Product intent and engineering decisions drift when they live in disconnected tools.
status: active
sdlc: [business]
business:
  section: problems
  evidence: observed
  priority: high
relationships:
  - type: affects
    target: /people/product-team.md
```

#### Body expectation

The body explains the present condition, affected people or operations, evidence and uncertainty, consequences of inaction, desired outcome, and boundaries. Capability documents describe an enduring business ability and accountability. Metrics define what is measured and why. Regulatory and constraint documents identify the source, obligation, applicability, and consequence. The body does not prescribe a product feature or Application topology.

### Product

#### What it is

Product translates accepted Business context into the value, behavior, capabilities, policies, boundaries, and measurable user outcomes the product promises. It defines what the product must enable without choosing visual treatment, system decomposition, or implementation.

#### How the agent helps

The agent connects capabilities to Business problems, personas, and outcomes; separates user outcomes from feature requests; finds overlapping capabilities; clarifies in-scope and out-of-scope behavior; surfaces policy and edge cases; and challenges requirements with no traceable value. It suggests acceptance-oriented language while avoiding UI and technical design.

#### Frontmatter expectation

A Product document includes `sdlc: [product]` and a `product` object with required `section`. `priority` is optional and records reviewed product priority. Active capabilities should have typed traceability to the Business knowledge they realize or support.

```yaml
type: Product Capability
title: Reviewable change proposals
description: Users can inspect and explicitly accept or reject proposed knowledge changes.
status: active
sdlc: [product]
product:
  section: capabilities
  priority: critical
relationships:
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
```

#### Body expectation

The body states the user or product outcome, provided capability or behavior, scope boundaries, governing policies, important scenarios and failure outcomes, measures of success, assumptions, and unresolved decisions. It stays solution-neutral: interaction details belong to Visual Design, logical technical responsibilities belong to System Design, and executable boundaries belong to Architecture.

### Visual Design

#### What it is

Visual Design defines how the product is understood, navigated, interacted with, and visually expressed. It covers experience principles, journeys, information architecture, screens and states, content patterns, accessibility, visual language, tokens, reusable patterns, and component stories. Its stable metadata identifier remains `design`.

#### How the agent helps

The agent traces journeys and screens to Product outcomes and personas; asks about states, hierarchy, content, feedback, responsive behavior, and accessibility; identifies inconsistent patterns and token use; proposes variants and edge states; and generates reviewable visual-language or component-story proposals. It does not invent Product behavior or make generated previews canonical.

#### Frontmatter expectation

A Visual Design document includes `sdlc: [design]` and a `design` object with required `section`. `platforms` is required when behavior or presentation varies by platform and recommended otherwise. `group` organizes related foundations or patterns. `theme` is valid only for Visual Language or Design System concepts. `preview` describes supported generated examples for component-story concepts.

```yaml
type: Component Story
title: Knowledge cards
description: Cards present concise concept context and reveal canonical detail on demand.
status: active
sdlc: [design]
design:
  section: components
  platforms: [web]
  group: knowledge
  preview:
    kind: knowledge-cards
    variants: [collapsed, expanded, proposed]
relationships:
  - type: realizes
    target: /product/capabilities/knowledge-graph.md
```

#### Body expectation

The body describes user intent, experience flow, information hierarchy, interaction and content behavior, required states and variants, accessibility constraints, responsive or platform differences, and rationale. Visual Language and token documents define semantic roles and usage rather than isolated values. Component stories define states and examples without becoming source-code component specifications.

### System Design

#### What it is

System Design defines the conceptual technical system needed to satisfy Product and Visual Design contracts: logical responsibilities, actors, information flows, data ownership, trust boundaries, external dependencies, quality attributes, constraints, risks, and failure modes. It deliberately does not choose the number of Applications or deployable units.

#### How the agent helps

The agent derives logical responsibilities from Product capabilities, identifies actors and external systems, traces information and ownership, exposes trust boundaries and missing failure behavior, and asks for measurable quality needs. It challenges technology-first decomposition and accidental executable boundaries. When discussion turns to monoliths, services, frontend/backend splits, or deployability, it moves that decision to Architecture.

#### Frontmatter expectation

A System Design document includes `sdlc: [system]` and a `system` object with required `kind` and `boundary`. `group` organizes the conceptual map without asserting ownership. `criticality` is recommended for owned or managed responsibilities and data stores whose failure affects Product outcomes.

```yaml
type: System Service
title: Product Knowledge Runtime
description: Resolves accepted concepts and relationships into coherent product knowledge.
status: active
sdlc: [system]
system:
  kind: subsystem
  group: knowledge
  boundary: owned
  criticality: critical
relationships:
  - type: realizes
    target: /product/capabilities/knowledge-graph.md
```

#### Body expectation

The body states the conceptual responsibility, provided and consumed information, ownership of data and decisions, actors and external dependencies, trust boundaries, quality expectations, failure and degradation behavior, constraints, risks, and rationale. It avoids source modules, protocols chosen only by implementation, and claims about which Application owns the responsibility.

### Architecture

#### What it is

Architecture turns conceptual System Design responsibilities into the actual portfolio of owned executable Applications. It decides whether the product uses one monolith or full-stack Application, or several web, mobile, backend, worker, CLI, local-service, or integration Applications. It defines realization, runtime, communication, trust, and independent-deployability boundaries without decomposing Application internals.

#### How the agent helps

The agent proposes the simplest topology that satisfies accepted constraints; compares combination and separation trade-offs; maps every owned System Design responsibility to at least one Application; detects orphan responsibilities, accidental distribution, hidden coupling, unclear data ownership, and ambiguous deployment boundaries; and records rationale and consequences. It does not invent microservices or proceed into Components before an Application is selected.

#### Frontmatter expectation

Every Architecture document includes `sdlc: [architecture]` and an `architecture` object with required `section`. For an active `Application`, `kind`, `runtime`, and `deployable` are required; `group` is optional. Application ownership and realization are expressed through typed relationships rather than copied System IDs in metadata.

```yaml
type: Application
title: Local Project Service
description: Owned executable service coordinating accepted project knowledge and reviewable changes.
status: active
sdlc: [architecture, application]
architecture:
  section: applications
  kind: backend-service
  group: workspace
  runtime: [nodejs]
  deployable: true
application:
  section: architecture
relationships:
  - type: realizes
    target: /architecture/systems/product-knowledge-runtime.md
```

#### Body expectation

The body explains the Application or topology boundary, System Design responsibilities realized, rationale for combining or separating responsibilities, runtime and deployability assumptions, communication and trust boundaries, data authority, external dependencies, operational consequences, constraints, risks, and rejected alternatives. Internal modules, ports, state models, and dependency rules belong to the later Application Architecture workflow.

### Cross-layer traceability

- Business knowledge establishes intent and constraints.
- Product capabilities realize or respond to Business knowledge.
- Visual Design realizes Product behavior and user outcomes.
- System Design realizes Product capabilities and accommodates relevant Visual Design constraints.
- Architecture Applications realize System Design responsibilities.

Typed relationships are authoritative. A connected document is contextual unless its own `sdlc` explicitly includes the active layer.

### Invariants

- Frontmatter is the machine-readable product-definition contract; body content may elaborate but never contradict it.
- `type` and `sdlc` remain independent.
- Each declared product-wide layer has exactly one matching namespace object, except Definition Layer documents.
- Namespace metadata controls validation and presentation but never duplicates semantic relationships.
- Active documents have meaningful non-empty bodies.
- The agent never manufactures evidence, certainty, priority, ownership, or acceptance.
- AI output remains a proposal until explicit successful acceptance.
- System Design does not decide Application topology.
- Architecture does not decide Application internals.

### Non-goals

This product-level workflow does not specify Application Architecture, Components, Code Design, implementation, or deployment metadata and body contracts. Those application-scoped contracts are defined separately after an owned Application is selected.
