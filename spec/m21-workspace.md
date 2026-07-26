---
name: m21-workspace
description: Contract for the OKF-native product-engineering workspace, application-scoped definition flow, reviewable change, and generated views
group: product-engineering
tags: [okf, workspace, application-scope, proposals, generated-views]
depends_on:
  - product-definition-workflow
  - business-definition-area
  - business-solution-definition-area
  - visual-design-definition-area
  - system-design-definition-area
  - architecture-definition-area
features: features/
---

# M21 Workspace

## Data model

### Concept

A portable OKF knowledge document with stable bundle-relative identity, controlled or producer-defined type, title, description, exact raw Markdown, parsed body, singular Definition Area ownership where migrated, legacy definition-layer membership where not yet migrated, typed Relationships, resolved admitted artifacts, and preserved producer metadata. Concepts have no generic lifecycle status.

### Project snapshot

An immutable accepted view of project identity, revision, Concepts, resolved Edges, and Diagnostics. Product-wide, layer, and Application-scoped snapshots preserve the source revision while omitting unrelated knowledge.

### Application scope

One selected owned Application established by the product-wide Architecture layer plus one downstream layer. Scope ownership is derived by following incoming `part-of` and downstream `realizes` relationships from the selected Application. `depends-on` does not transfer ownership.

### Change proposal

A revision-bound, reviewable set of operations with provenance, impact findings, and lifecycle state. Proposal values remain separate from accepted Project Snapshot values until successful explicit acceptance.

### Visual artifact projection

Validated bundle-local CSS, HTML, script, and media content resolved from accepted Visual Design source paths. Linked artifacts contribute to the accepted project revision; composed themes and sandboxed specimens remain disposable generated views.

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
      body: { type: string, required: true }
      raw: { type: string, required: true }
      area: { type: string }
      sdlc: { type: array, items: string }
      relationships: { type: array, items: Relationship }
      artifacts: { type: array, items: object, required: true }
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
      layer: { type: enum, values: [business, solution, visual-design, product, design, system, architecture, application, components, code-design, implementation, deployment], required: true }
      applicationId: { type: string }
  GlobalGraphNode:
    fields:
      id: { type: string, required: true }
      title: { type: string, required: true }
      type: { type: string, required: true }
      area: { type: string }
      layers: { type: array, items: string, required: true }
  GlobalGraphLink:
    fields:
      source: { type: string, required: true }
      target: { type: string, required: true }
      type: { type: string, required: true }
  GlobalGraphProjection:
    fields:
      sourceRevision: { type: string, required: true }
      nodes: { type: array, items: GlobalGraphNode, required: true }
      links: { type: array, items: GlobalGraphLink, required: true }
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
  DebugSourceView:
    fields:
      conceptId: { type: string, required: true }
      filePath: { type: string, required: true }
      rawMarkdown: { type: string, required: true }
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
  project-global-graph:
    purpose: Project every accepted OKF concept and resolved typed relationship into one interactive product-wide graph independent of active area or Application scope, retaining singular Definition Area ownership for optional highlighting.
    input: ProjectSnapshot
    output: GlobalGraphProjection
    failures: []
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
  watch-project:
    purpose: Publish a reloaded accepted Project Snapshot when canonical project files change outside the current M21 process.
    output: ProjectSnapshot
    failures: [UnreadableProject]
    effects: [Replaces derived in-memory state only after a complete reload]
  inspect-debug-source:
    purpose: Expose the exact raw Markdown of one accepted Concept selected directly from any visible card or opened graph node while global debug mode is enabled.
    input: Concept
    output: DebugSourceView
    failures: [UnknownConcept]
    effects: [Leaves canonical knowledge unchanged]
```

## Contract

### Responsibilities

- Keep OKF Markdown and YAML as canonical portable product knowledge.
- Present Business and Business Solution through singular Definition Area schemas and purpose-built grouped-card workspaces.
- Present Visual Design through its singular Definition Area schema, linked CSS/HTML artifacts, composed themes, and sandboxed specimen catalog.
- Present System Design through its singular Definition Area schema and relationship-driven conceptual system map.
- Present Architecture through its singular Definition Area schema, stable Application IDs, owned topology, directed communications, and responsibility realization matrix.
- Keep System Design conceptual and use Architecture to define one or more actual owned Applications that realize it.
- Present Application Architecture, Components, Code Design, Implementation, and Deployment under one persistent selected Application scope.
- Make each canonical Component's declared Gherkin feature set the primary implementation testing contract.
- Preserve explicit user review between proposals and accepted knowledge.
- Resolve accepted Visual Design artifacts, render isolated foundation and component previews, and never activate a workspace theme without a separate explicit user action.
- Render fenced Mermaid blocks in canonical Markdown as strict, disposable diagrams while preserving source text and typed graph semantics.
- Provide one product-wide interactive 3D graph of every accepted OKF concept and resolved typed relationship, independent of current area or Application scope, with optional visual highlighting by Definition Area.
- Watch canonical project files and publish a fresh accepted snapshot to the open browser when their content, presence, or relationships change.
- Provide a global browser-only debug mode that places a `</>` source action on every visible Concept card and opened graph node and opens that specific Concept's exact raw Markdown in a modal without requiring expansion or focus.
- Generate reproducible views and external-agent handoffs without creating another source of truth.

### Component boundaries

The Browser Workspace contains a Workspace Shell, Definition Workspace Projector, Application Scope Controller, and Proposal Review Workspace. It consumes the semantic Project Workspace API and never accesses canonical files or provider credentials. Architecture selects actual Application boundaries before any Application-internal workspace opens.

The Local Project Service contains a transport adapter, Project Coordinator, Product Graph Engine, Change and Impact Engine, Graph Validation Engine, AI Orchestrator, Generated View Projector, and OKF Repository. Application coordination depends on semantic domain contracts and explicit ports; adapters remain replaceable.

### Invariants

- The global graph contains every accepted concept exactly once and every resolved typed relationship exactly once.
- Area highlighting changes emphasis only; it never removes knowledge from the global projection.
- Opening, rotating, filtering, highlighting, or focusing the global graph never mutates canonical knowledge or changes Definition Area ownership.
- Layer-specific workspaces remain purpose-built and do not embed a substitute global graph.
- Primary artifacts require explicit active-layer membership.
- System Design never implies a monolith or distributed Application topology; Architecture records that decision explicitly.
- Application scope never widens silently when its selected identity is invalid.
- Every canonical Component declares at least one existing executable Gherkin feature file, and implementation verifies those features.
- Cross-Application dependencies do not transfer ownership.
- Unknown OKF producer extensions survive supported revisions; unknown fields inside a closed migrated area namespace remain preserved but produce diagnostics.
- A failed external reload leaves the last complete accepted snapshot available and exposes a diagnostic or transport failure.
- Failed or stale mutation leaves accepted canonical knowledge unchanged.
- AI output is untrusted proposal input and has no persistence authority.
- Generated documents, Mermaid diagrams, visual specimens, previews, and handoffs are disposable projections.
- Linked Visual Design artifacts are canonical and revision-bearing; rendered output, iframe state, Mermaid SVG, debug-mode state, and raw-source modal state are not.
- Debug inspection is read-only, does not activate its containing card or node, and displays the selected Concept's exact source associated with the accepted snapshot revision.
- Visual Component scripts run only in isolated previews without same-origin or workspace authority.
- Switching between a purpose-built workspace and its graph preserves the active definition layer, selected Application scope, and focused Concept.
- Application and domain contracts remain independent of browser, transport, filesystem, and model-provider implementation details.

### Non-goals

M21 does not implement product source changes, provision infrastructure, execute delivery pipelines, replace source control, turn generated output into canonical knowledge without review, or use the global graph as a replacement for purpose-built layer authoring.
