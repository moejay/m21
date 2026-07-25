---
name: m21-workspace
description: Contract for the OKF-native product-engineering workspace, application-scoped definition flow, reviewable change, and generated views
group: product-engineering
tags: [okf, workspace, application-scope, proposals, generated-views]
depends_on:
  - product-definition-workflow
features: features/
---

# M21 Workspace

## Data model

### Concept

A portable OKF knowledge document with stable bundle-relative identity, descriptive type, title, description, lifecycle status, Markdown body, definition-layer membership, typed Relationships, and preserved producer metadata.

### Project snapshot

An immutable accepted view of project identity, revision, Concepts, resolved Edges, and Diagnostics. Product-wide, layer, and Application-scoped snapshots preserve the source revision while omitting unrelated knowledge.

### Application scope

One selected owned Application established by the product-wide Architecture layer plus one downstream layer. Scope ownership is derived by following incoming `part-of` and downstream `realizes` relationships from the selected Application. `depends-on` does not transfer ownership.

### Change proposal

A revision-bound, reviewable set of operations with provenance, impact findings, and lifecycle state. Proposal values remain separate from accepted Project Snapshot values until successful explicit acceptance.

### Semantic theme

A validated projection of color, typography, shape, and elevation tokens from one active Visual Language. The accepted theme styles both M21 and generated Visual Design previews.

```m21-model
entities:
  Relationship:
    fields:
      type: { type: string, required: true }
      target: { type: string, required: true }
      rationale: { type: string }
      evidence: { type: array, items: string }
  Concept:
    identity: id
    fields:
      id: { type: string, required: true }
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      status: { type: enum, values: [draft, active, superseded, retired], required: true }
      body: { type: string, required: true }
      sdlc: { type: array, items: string, required: true }
      relationships: { type: array, items: Relationship }
      metadata: { type: object, required: true }
  Diagnostic:
    fields:
      severity: { type: enum, values: [error, warning, info], required: true }
      code: { type: string, required: true }
      message: { type: string, required: true }
      conceptIds: { type: array, items: string }
  ProjectSnapshot:
    fields:
      name: { type: string, required: true }
      revision: { type: string, required: true }
      concepts: { type: array, items: Concept, required: true }
      edges: { type: array, items: object, required: true }
      diagnostics: { type: array, items: Diagnostic, required: true }
  LayerSelection:
    fields:
      layer: { type: enum, values: [business, product, design, system, architecture, application, components, code-design, implementation, deployment], required: true }
      applicationId: { type: string }
  WorkspacePresentationSelection:
    fields:
      layer: { type: enum, values: [business, product, design, system, architecture, application, components, code-design, implementation, deployment], required: true }
      applicationId: { type: string }
      presentation: { type: enum, values: [purpose-built, graph], required: true }
  ComponentContract:
    fields:
      componentId: { type: string, required: true }
      applicationId: { type: string, required: true }
      kind: { type: string, required: true }
      layer: { type: string, required: true }
      visibility: { type: enum, values: [public, internal, private], required: true }
      featureFiles: { type: array, items: string, required: true }
  RevisionRequest:
    fields:
      conceptId: { type: string, required: true }
      changes: { type: object, required: true }
      changeKind: { type: enum, values: [editorial, internal, contract, structural], required: true }
      summary: { type: string, required: true }
  ChangeProposal:
    identity: id
    fields:
      id: { type: string, required: true }
      baseRevision: { type: string, required: true }
      summary: { type: string, required: true }
      provenance: { type: enum, values: [user, ai], required: true }
      operations: { type: array, items: object, required: true }
      impact: { type: array, items: object, required: true }
      status: { type: enum, values: [proposed, accepted, rejected], required: true }
  ProposalIdentity:
    fields:
      proposalId: { type: string, required: true }
  ViewRequest:
    fields:
      kind: { type: enum, values: [project-summary, design-preview], required: true }
      layer: { type: string }
      applicationId: { type: string }
  GeneratedView:
    fields:
      mediaType: { type: string, required: true }
      content: { type: string, required: true }
      sourceRevision: { type: string, required: true }
```

## Interfaces

```m21-interface
operations:
  open-project:
    purpose: Load an OKF bundle into one immutable accepted Project Snapshot while preserving readable partial knowledge and diagnostics.
    output: ProjectSnapshot
    failures: [UnsafeProjectPath, UnreadableProject]
  select-definition-layer:
    purpose: Project accepted knowledge through the purpose-built workspace for one product-wide definition layer.
    input: LayerSelection
    output: ProjectSnapshot
    failures: [UnknownDefinitionLayer]
  select-application-scope:
    purpose: Scope Application through Deployment knowledge to one selected owned Application through canonical ownership relationships.
    input: LayerSelection
    output: ProjectSnapshot
    failures: [UnknownApplication, ApplicationScopeRequired]
  choose-workspace-presentation:
    purpose: Switch between the active layer's purpose-built workspace and a separate relationship graph without changing definition scope.
    input: WorkspacePresentationSelection
    output: WorkspacePresentationSelection
    failures: [UnknownDefinitionLayer, ApplicationScopeRequired]
    effects: [Changes deep-linkable browser view state without mutating accepted knowledge]
  propose-revision:
    purpose: Create a reviewable revision-bound semantic change without mutating accepted knowledge.
    input: RevisionRequest
    output: ChangeProposal
    failures: [UnknownConcept, InvalidRevision]
    effects: [Stores an in-memory proposal against the current accepted revision]
  accept-proposal:
    purpose: Atomically persist one non-stale proposed change and return the reloaded accepted Project Snapshot.
    input: ProposalIdentity
    output: ProjectSnapshot
    failures: [UnknownProposal, ProposalAlreadyResolved, StaleProposal, PersistenceFailure]
    effects: [Updates canonical OKF only after all acceptance preconditions pass]
  generate-view:
    purpose: Produce a disposable deterministic Markdown or HTML view exclusively from accepted knowledge.
    input: ViewRequest
    output: GeneratedView
    failures: [UnknownView, InvalidViewScope]
```

## Contract

### Responsibilities

- Keep OKF Markdown and YAML as canonical portable product knowledge.
- Present Business, Product, Visual Design, System Design, and Architecture as product-wide purpose-built workspaces governed by the Product Definition Workflow contract.
- Keep System Design conceptual and use Architecture to define one or more actual owned Applications that realize it.
- Present Application Architecture, Components, Code Design, Implementation, and Deployment under one persistent selected Application scope.
- Offer the same scoped documents as a separate relationship graph through a quiet workspace action, while keeping each purpose-built projection as the default.
- Make each active Component's declared Gherkin feature set the primary implementation testing contract.
- Preserve explicit user review between proposals and accepted knowledge.
- Apply accepted Visual Language tokens to M21 and generated component previews.
- Generate reproducible views and external-agent handoffs without creating another source of truth.

### Component boundaries

The Browser Workspace contains a Workspace Shell, Definition Workspace Projector, Application Scope Controller, and Proposal Review Workspace. It consumes the semantic Project Workspace API and never accesses canonical files or provider credentials. Architecture selects actual Application boundaries before any Application-internal workspace opens.

The Local Project Service contains a transport adapter, Project Coordinator, Product Graph Engine, Change and Impact Engine, Graph Validation Engine, AI Orchestrator, Generated View Projector, and OKF Repository. Application coordination depends on semantic domain contracts and explicit ports; adapters remain replaceable.

### Invariants

- Primary artifacts require explicit active-layer membership.
- System Design never implies a monolith or distributed Application topology; Architecture records that decision explicitly.
- Application scope never widens silently when its selected identity is invalid.
- Every active Component declares at least one existing executable Gherkin feature file, and implementation verifies those features.
- Cross-Application dependencies do not transfer ownership.
- Unknown OKF producer extensions survive supported revisions.
- Failed or stale mutation leaves accepted canonical knowledge unchanged.
- AI output is untrusted proposal input and has no persistence authority.
- Generated documents, diagrams, previews, and handoffs are disposable projections.
- Switching between a purpose-built workspace and its graph preserves the active definition layer, selected Application scope, and focused Concept.
- Application and domain contracts remain independent of browser, transport, filesystem, and model-provider implementation details.

### Non-goals

M21 does not implement product source changes, provision infrastructure, execute delivery pipelines, replace source control, or turn generated output into canonical knowledge without review.
