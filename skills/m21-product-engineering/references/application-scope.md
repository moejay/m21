# Application scope guide

Load for any work in Application Experience, Application Architecture, Components, Code Design, Implementation, or Deployment. In this repository, `m21-spec/application-scope.md` is still in discussion; preserve its open decisions rather than treating them as settled globally.

## Core model

Architecture is the sole registry of owned Application identities. A downstream concept references exactly one stable Application ID; it does not declare a new Application.

```yaml
application-id: browser-workspace
```

Application selection is browser/workspace state. It is not canonical concept frontmatter.

## Safety invariants

- Product-wide Business, Solution, Visual Design, System Design, and Architecture do not require Application selection.
- Entering an Application-scoped area requires one valid owned Application.
- Invalid, unknown, duplicate, missing, or stale scope never falls back to every Application or the first Application.
- `depends-on` and cross-Application relationships never transfer ownership.
- Contextual knowledge never becomes primary merely because it is connected.
- Switching Applications clears or re-resolves focus that is not valid in the new scope.
- The global graph remains complete and does not inherit Application scope.
- AI context and generated handoffs do not include unrelated Application internals.
- Removing or changing an Application ID requires an impact-aware atomic migration of downstream references.

## Primary versus context

For selected Application `A` and area `L`:

```text
primary(A, L) = accepted concepts where application-id == A and area == L
```

Useful context may include:

- the selected Architecture Application;
- System Responsibilities it realizes;
- related Business, Solution, and Visual Design concepts;
- adjacent downstream concepts with the same Application ID;
- explicitly related public contracts from another Application.

Do not import another Application's private Components, Code Design, Implementation, Deployment, secrets, or provider context.

## Expert questions

- Does the selected ID resolve to exactly one accepted owned Application?
- Is this concept truly owned by that Application or merely consumed as context?
- Is a relationship being misused to infer ownership?
- Does a cross-Application dependency target a deliberate public contract?
- Would changing or removing the Application orphan downstream knowledge?
- Should genuinely shared non-executable knowledge be product-wide, owned by a qualifying library Application, duplicated, or governed by a future shared-ownership rule?
- Does the selected area apply to this Application kind? For example, a library normally has no interactive Application Experience.
- Is AI or handoff context bounded to what the task needs?

## Shared-knowledge caution

Never create a reserved `shared` Application to avoid an ownership decision. Product-wide intent and shared visual/system knowledge already have product-wide owners. Shared executable packages require a deliberate architecture and ownership decision. The project's accepted Application definition determines whether an independently governed library can be an Application.

## Cross-Application contracts

Architecture owns the existence and mode of significant Application Communications. Downstream concepts may define compatible public interfaces and implementation detail, but must not duplicate the provider's private model or contradict the accepted direction, trust, authority, or failure contract.

## Review checklist

Before accepting Application-scoped work, verify:

- direct stable ID exists and is valid;
- area and Application kind are compatible;
- primary and contextual concepts are distinguishable;
- focus and generated output remain scoped;
- public cross-Application dependencies are explicit;
- no ownership is inferred from folders, repository layout, or `depends-on`;
- impact includes the selected Application and any affected provider/consumer contracts;
- open shared-ownership decisions are not silently resolved by implementation.
