---
name: application-scope
description: Working cross-area contract for stable Application identity, downstream concept ownership, workspace selection, contextual references, and safe Application-scoped operations.
group: cross-area-contracts
tags: [application, scope, ownership, navigation, working-draft]
depends_on:
  - architecture-definition-area
---

# Application Scope

> Status: **In discussion.** This is a cross-area contract, not another Definition Area.

## Data model

### Purpose

Architecture may define many owned Applications. Application Scope ensures that Application Experience Design, Application Architecture, Components, Code Design, Implementation, and Deployment always operate on exactly one selected Application without mixing another Application's owned internals.

### Application identity

The canonical Application concept is owned by Architecture:

```yaml
type: Application
title: Local Project Service
area: architecture
application-id: project-service
architecture:
  section: applications
  application-kind: backend-service
  independently-deployable: true
```

Architecture is the sole Application ID registry. Each `Application` concept declares exactly one `application-id`; downstream concepts only reference an ID from that registry and never define a new one.

`application-id` is:

- Required for every Architecture `Application`.
- Unique across the complete project, not merely within one file or topology group.
- Lowercase kebab-case.
- Stable across title and path changes.
- Changed only through an explicit identity migration that updates all scoped concepts atomically.
- Never declared by downstream concepts, managed services, or external dependencies merely to make them selectable.

The registry is derived by scanning accepted concepts where `area: architecture`, `architecture.section: applications`, and `type: Application`. The root Architecture does not maintain a duplicated list of IDs.

### Application-scoped concepts

Every concept in an Application-scoped area has exactly one Application ID:

```yaml
type: Screen
area: experience
application-id: web-workspace
experience:
  section: screens
```

The Application-scoped areas are:

```text
experience
application
components
code-design
implementation
deployment
```

Working ownership rule:

```text
owned-by(concept, application) = concept.application-id == application.application-id
```

On a downstream concept, `application-id` is a validated reference to the Architecture registry and is canonical scope ownership metadata. A duplicate direct `part-of` relationship to the Application is not required merely to restate scope. Typed relationships remain required for meaningful internal structure, realization, dependency, communication, and cross-area traceability.

For example, a Component may be `part-of` a parent Component and a Code Design contract may be `part-of` that Component. All still carry the same Application ID for direct validation and filtering.

### Scope selection

```yaml
selected-area: components
selected-application-id: project-service
```

Selection is workspace state, not concept frontmatter. The selected Application must resolve to exactly one accepted Architecture Application.

## Interfaces

The Application Scope workspace contract supports:

- List selectable owned Applications from Architecture.
- Select one Application by stable Application ID.
- Preserve selection while moving among Application-scoped areas.
- Project only concepts whose area and Application ID match the active selection as primary knowledge.
- Include related product-wide or cross-Application knowledge as contextual references without transferring ownership.
- Deep-link to an area, Application ID, and optional focused concept.
- Reject unknown, ambiguous, missing, or stale Application selection.
- Create new Application-scoped concept proposals with the selected Application ID visible for review.
- Generate Application-scoped handoffs and views without leaking unrelated Application internals.

## Contract

### Primary and contextual knowledge

For selected Application `A` and area `L`:

```text
primary(A, L) = accepted concepts where application-id == A and area == L
```

Context may include:

- The selected Architecture Application.
- System Responsibilities realized by the Application.
- Related Business, Solution, and Visual Design knowledge.
- Concepts from adjacent downstream areas with the same Application ID.
- Public contracts or dependencies from another Application when explicitly related.

Contextual knowledge never becomes primary merely because it is connected. `depends-on` and communication relationships never transfer ownership.

### Navigation

- Product-wide areas do not require an Application selection.
- Entering an Application-scoped area requires one valid selected Application.
- The selected Application persists across Experience, Application Architecture, Components, Code Design, Implementation, and Deployment.
- Switching Application preserves the active area but clears or re-resolves focus when the focused concept is not owned by the new selection.
- Returning to Architecture retains the selected Application as focus but removes the downstream scope restriction.
- The global graph always uses the complete accepted project and never inherits Application scope.

### Invalid scope safety

An invalid Application ID never falls back to all Applications, the first Application, or product-wide knowledge. A duplicate declaration, unknown downstream reference, reference to a non-Application, or Application ID on an invalid area produces an explicit diagnostic. The workspace shows a scope error and asks the user to select a valid owned Application.

Removing or changing an Application ID requires an impact-aware proposal that resolves every downstream scoped concept. Accepted knowledge cannot contain an orphan Application ID.

### Creation and AI guidance

- New downstream concepts inherit the currently selected Application ID in the proposal, not silently in accepted knowledge.
- The proposal review displays Application ownership explicitly.
- AI guidance receives the selected Application's primary knowledge plus bounded relevant context.
- AI guidance does not receive unrelated Application internals merely because they share a repository or dependency.
- Generated coding and delivery handoffs include the selected Application ID and never widen scope implicitly.

### Cross-Application relationships

An Application-scoped concept may depend on a public contract owned by another Application. The relationship makes that contract contextual; it does not import the provider Application's private Components, Code Design, Implementation, or Deployment knowledge.

Cross-Application communication is defined in Architecture. Downstream details must remain consistent with that accepted communication without duplicating the provider Application's internals.

### Shared knowledge

Product-wide Business, Solution, Visual Design, System, and Architecture knowledge is shared context by ownership, not by copying it into each Application.

The initial model does not create a fake `shared` Application. A genuinely shared non-executable implementation package needs a deliberate ownership rule before Components or Code Design are finalized; it must not be hidden behind a reserved Application ID.

### Accepted identity decision

Architecture is the sole authority that declares globally unique Application IDs. Downstream areas reference those IDs as canonical scope ownership without a mandatory duplicate direct relationship.

### Open decisions — discuss next

1. Confirm every concept in the six downstream areas carries exactly one Application ID.
2. Decide how genuinely shared non-executable Components or Code Design contracts are owned.
3. Confirm only owned Architecture Applications are selectable; managed services and databases remain context.
4. Confirm invalid scope never widens and selection persists across all downstream areas.
