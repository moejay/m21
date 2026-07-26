# M21 Definition-Area Redesign Context

## Objective

Define a complete, business-friendly model for organizing product and solution knowledge in M21. For every Definition Area, specify:

- Purpose and ownership boundary
- Common and area-specific frontmatter
- Controlled concept types and area sections
- Appropriate default and alternative projections by section
- Relationships used to connect knowledge within and across areas
- Workspace interactions
- Validation and optionality rules
- Questions and guidance supplied by the M21 agent

The current codebase is an important source of tested ideas, but it is not the authority for this redesign. Accepted areas may be migrated coherently into specifications, features, the OKF profile, canonical knowledge, and implementation only when the user explicitly authorizes that area. Business, Business Solution, and Visual Design are the first such migrations; unmigrated areas retain legacy compatibility.

The current `@moejay/m21` validator does not validate this redesigned model. At most it can parse the familiar outer spec format, dependencies, and fenced model syntax. It does not know the new singular `area`, controlled type-to-section rules, metadata schemas, Application IDs, projection contracts, or conditional validation. During redesign, explicit user decisions and documented cross-area consistency are authoritative; a future validator will implement the accepted schemas.

## Decisions made so far

### Definition Areas replace SDLC membership

`SDLC` is too software-specific and implies a linear lifecycle. The working human-facing term is **Definition Area**.

Each managed concept belongs to exactly one area:

```yaml
area: solution
```

An area is an ownership and primary-workspace boundary, not a chronological gate. Other areas see the concept as contextual knowledge through typed relationships and generated projections.

The final field name and term remain reviewable until the global model is accepted, but singular ownership is a requirement.

### Concepts and frontmatter

- Canonical concepts are primarily portable OKF Markdown files; external artifacts may be linked.
- `type` is a controlled semantic concept type known to the M21 profile; it is not free descriptive text.
- Each area defines controlled `section` values that organize its knowledge and select its purpose-built workspace projection.
- `kind` is not part of the common model. An area may introduce it only if it represents durable domain meaning independent of presentation; it must never exist merely as a renderer selector.
- Area metadata describes domain meaning, not widget implementation.
- Every concept has a generic document/card fallback.
- Specialized projections derive primarily from area and section, then use type, relationships, scope, grouping, and other meaningful metadata to populate the projection.
- Temporary UI state such as graph position, expanded cards, filters, and camera position is not canonical concept metadata.

Working common shape:

```yaml
type: Human Service
title: Guided onboarding
description: Specialists help a team establish its initial product definition.
area: solution

solution:
  section: services
  delivery-mode: human-service
  group: onboarding

relationships: []
```

### No common concept status

The redesigned common frontmatter has no generic `status`. Accepted knowledge present in the bundle is current; unaccepted work exists as a Change Proposal rather than a draft concept. Replacement is expressed through explicit relationships and rationale, while removal and historical recovery belong to version control. A future area may introduce a specific state field only when that state has domain meaning and a concrete workspace use; it must not recreate a generic lifecycle status indirectly.

### Relationships

Baseline OKF uses ordinary Markdown links. M21 adds canonical typed relationships as preserved frontmatter extensions:

```yaml
relationships:
  - type: addresses
    target: /business/problems/fragmented-product-knowledge.md
    rationale: Explains why the source is connected to the target.
    evidence:
      - /business/research/team-interviews.md
```

The containing document is the source. The target is an absolute bundle-relative concept path. Relationship semantics, not graph proximity, drive traceability and impact.

The relationship vocabulary must remain small, directional, versioned, and extensible without becoming an unrestricted set of synonyms.

### Optionality

Empty placeholder documents are not allowed. Important concerns are represented as questions and validation coverage. A concern may be answered, unresolved, deferred, or not applicable with rationale. The system must not manufacture content merely to satisfy a type checklist.

### Business structure and projections

Business uses controlled `section` values and controlled `type` values within each section. `kind` is not used merely for UI routing. Research is a distinct Business section because it supplies evidence across problems, people, market, outcomes, risks, and decisions. The initial Business workspace uses expandable cards grouped by section and type. Its only area-specific metadata is the required `business.section`; richer metadata and projections are deferred until a concrete workspace need exists.

Structured metadata is added only when the current workspace uses it for projection, filtering, grouping, sorting, comparison, calculation, or an actionable validation diagnostic. A hypothetical future use is insufficient. Concept-specific important scalar values belong in that concept's area metadata when they are canonical and atomic. Each accepted field documents its exact path, applicable types, scalar shape, requirement, allowed values or format, meaning, workspace use, and missing-value behavior. Tooling validates these closed schemas. The redesign does not introduce a universal metadata-driven UI language; section projections use only accepted known fields, while every concept retains a generic fallback.

Independently meaningful roles, goals, needs, evidence, mitigations, and similar knowledge should become related concepts rather than unstructured nested arrays. Business Roles, Persona Goals, and Business Needs are confirmed as first-class controlled Business concepts; incidental Persona detail remains in the body. Project-specific roles such as Buyer, End User, or Product Manager are titled Business Role concepts rather than values in a fixed participation array. The People model distinguishes actual Stakeholders, functional Business Roles, evidence-based Personas, Persona Goals, and solution-neutral Business Needs. A Persona `plays-role` a Business Role.

### Business Solution

The former Product area is **Business Solution**, with identifier `solution`.

Business Solution describes the complete socio-technical response and solution space for Business problems. It may contain human services, processes, policies, digital or physical products, partner capabilities, or mixed delivery. It does not choose detailed experience treatment, conceptual technical decomposition, Application topology, or implementation. Like Business, its initial workspace uses expandable cards grouped by section and controlled type; its only area-specific metadata is `solution.section`.

### Visual Design and Application Experience

Visual Design is a product-wide area distinct from later Application-specific Experience Design. Visual Design owns shared character and feel, principles, brand, color, typography and local fonts, spacing, layout, shape, borders, elevation, motion, iconography, imagery, themes, visual components, assets, and visual accessibility. Executable CSS and safe HTML specimens are linked bundle artifacts from the start. A concept may contain one inline CSS and/or HTML override: inline HTML replaces linked HTML, while inline CSS loads after and overrides linked CSS. A Visual Theme is the composed CSS entry point and uses explicit local CSS import order rather than extra ordering metadata. After explicit user selection, an accepted Visual Theme may optionally style M21's workspace; implementation is deferred and CSS presence alone never activates it.

Visual Component states and variants remain inside one Component concept and linked HTML specimen rather than becoming many small concepts. Component CSS defines their appearance. An optional, explicit linked script may demonstrate interaction when HTML and CSS are insufficient, but it remains sandboxed illustrative behavior rather than an Application behavior contract.

Application Experience Design begins only after Architecture defines an Application. It will own that Application's journeys, service blueprints where applicable, information architecture, navigation, flows, screens, states, interaction, content behavior, and use of shared Visual Design. This separation keeps shared visual language independent of any one Application while giving app-specific experience an explicit Application ID.

### System Design

System Design is product-wide and conceptual. One root `System` concept owns overall scope, boundaries, system-wide scale expectations, and qualities that do not need independent identity. Technical responsibilities, data ownership, logical stores, flows, external dependencies, independently traceable qualities, trust, failures, constraints, risks, and decisions become first-class only when they carry System-specific meaning. Business participants appear contextually rather than being duplicated as System Actors. The model uses `system.section` plus a minimal `system.boundary` value (`owned`, `managed`, or `external`) because ownership boundaries directly drive the system graph. Meaningful flows are first-class concepts; trivial connectivity remains a relationship. Responsibility `part-of` hierarchy creates collapsible conceptual grouping without presentation-only group concepts. The generated System map supports section/branch/boundary visibility toggles, directed information-flow edges, reduced-motion-safe animation, and optional quality/security/failure overlays. Scale stays in the relevant System, Responsibility, Store, or Flow body until a concrete numeric workspace need justifies validated scalar fields.

### Architecture and Application identity

Architecture owns one root Architecture and the actual portfolio of owned executable Applications that realize System responsibilities. It defaults to one Application and adds boundaries only when accepted runtime, trust, release, scale, isolation, device, data-authority, or operational pressures justify them. Portfolio labels such as monolith, client-server, microservices, event-driven, serverless, local-first, and hybrid are discussion and decision vocabulary rather than one closed architecture-kind enum.

Architecture is the sole Application ID registry. Each Architecture Application declares one globally unique stable lowercase kebab-case `application-id`, a controlled `application-kind`, and an `independently-deployable` value. Downstream concepts reference a registry ID for direct ownership and filtering; they do not define IDs. Application Scope does not require a duplicate direct `part-of` relationship merely to restate scope, while meaningful hierarchy and dependency relationships must not contradict the ID. Application Communications become first-class only when direction, mode, trust, failure, quality, or rationale has independent meaning. Architecture provides an Application topology and System-Responsibility realization matrix.

## Complete provisional area list

| Order | Identifier | Human name | Scope | Provisional responsibility |
|---:|---|---|---|---|
| 1 | `business` | Business | Product-wide | Why change is needed: mission, problems, people, outcomes, evidence, market, economics, regulation, constraints, risks, and business capabilities. |
| 2 | `solution` | Business Solution | Product-wide | The socio-technical response and solution space: propositions, options, capabilities, human services, processes, policies, boundaries, measures, and decisions. |
| 3 | `visual-design` | Visual Design | Product-wide | Shared visual direction, brand, CSS foundations, themes, visual components and HTML specimens, assets, and visual accessibility. |
| 4 | `system` | System Design | Product-wide | Conceptual technical responsibilities, actors, information flows, data ownership, external dependencies, trust boundaries, qualities, and failure modes without choosing Applications. |
| 5 | `architecture` | Architecture | Product-wide | Actual owned Application portfolio, stable Application identities, realization of System responsibilities, executable boundaries, communication, data authority, and topology decisions. |
| 6 | `experience` | Application Experience Design | One Application | Application journeys, information architecture, navigation, flows, screens, states, interaction, content behavior, accessibility, and use of shared Visual Design. |
| 7 | `application` | Application Architecture | One Application | Internal responsibilities, architectural style, interfaces, data, security, operations, qualities, constraints, and dependency rules for one Application. |
| 8 | `components` | Components | One Application | Cohesive owned Components, responsibilities, boundaries, provided and consumed contracts, dependency direction, and executable feature ownership. |
| 9 | `code-design` | Code Design | One Application | Models, semantic interfaces, contracts, states, events, errors, patterns, constraints, decisions, and executable behavior. |
| 10 | `implementation` | Implementation | One Application | Bounded implementation increments and handoffs, target repositories, readiness, required verification, returned evidence, and unresolved questions. |
| 11 | `deployment` | Deployment | One Application, with shared context where necessary | Environments, deployment units, configuration, secrets, pipelines, rollout, rollback, observability, recovery, security, and delivery handoff. |

The ordering expresses common movement from intent toward delivery, not mandatory chronology.

## Global workspace principles

- Each area has a purpose-built workspace rather than one generic graph.
- Every concept has a document/card representation.
- Area profiles choose useful default projections from semantic metadata.
- Users may switch among appropriate projections without changing canonical knowledge.
- A separate global graph may show every accepted concept and typed relationship.
- Selection, focus, and context should persist when switching projections.
- Editing or AI guidance creates a reviewable proposal; canonical knowledge changes only after explicit acceptance.
- Cross-area concepts appear as contextual references and never become primary artifacts outside their owning area.

## Questions to resolve globally

- Final replacement name and field for `sdlc`: currently `Definition Area` / `area`.
- Exact common frontmatter schema after removal of generic concept status.
- Ownership of genuinely shared non-executable downstream knowledge; stable Application identity and invalid-scope behavior are accepted.
- Deterministic composition order for linked Visual Design foundations, themes, component CSS, and inline overrides.
- Whether any area needs a domain-significant `kind` in addition to controlled `type` and `section`; the default is no.
- Compatibility policy for imported OKF concepts whose types are not recognized by the M21 profile.
- Relationship vocabulary and inverse labels used in the UI.
- Where saved user-authored layout belongs, if M21 eventually supports durable canvases.
- How applicability, unresolved questions, and readiness are represented without empty concepts.
