# Definition Area review checklist

Use this as a review aid, not a requirement to manufacture concepts.

## Contract maturity

- [ ] Area status is explicit: accepted, in discussion, provisional, or legacy.
- [ ] Purpose, responsibilities, non-responsibilities, and adjacent boundaries are clear.
- [ ] Scope is explicit: product-wide, one Application, or bounded shared context.
- [ ] User approval exists before migration or implementation.

## Model

- [ ] Every primary concept has one owning area.
- [ ] Controlled sections and allowed types are coherent.
- [ ] Every metadata field has current workspace use, precise shape, allowed values, requirement, and missing behavior.
- [ ] Important independent knowledge is modeled as a concept rather than a nested list.
- [ ] Narrative remains in the body when structure adds no current value.
- [ ] No UI state, renderer trivia, source-symbol inventory, or generic lifecycle status is canonical.
- [ ] No empty placeholder concepts were created.

## Semantics and traceability

- [ ] Relationship vocabulary and direction follow the accepted profile.
- [ ] Ownership is not inferred from folders, tags, proximity, or `depends-on`.
- [ ] Non-obvious relationships include rationale.
- [ ] Material claims link to evidence or expose the evidence gap.
- [ ] Upstream reason and downstream realization are sufficient for impact analysis.
- [ ] Cross-area concepts remain contextual outside their owner.

## Expert guidance

- [ ] Guided questions target material decisions and uncertainty.
- [ ] Agent posture challenges common area-specific mistakes.
- [ ] Assumptions, options, recommendations, decisions, and accepted facts remain distinguishable.
- [ ] Safety, accessibility, privacy, security, regulatory, human, and operational concerns are included where applicable.
- [ ] Optionality rules avoid checklist-driven content.

## Workspace

- [ ] Every concept has a readable card/document fallback.
- [ ] Primary projection follows semantic area/section/type/relationships.
- [ ] Filters, comparison, expansion, focus, and layout remain disposable state.
- [ ] Context and primary knowledge are visually distinguishable.
- [ ] Editing and AI guidance create reviewable proposals.
- [ ] Generated diagrams/previews/handoffs remain disposable.
- [ ] Accessibility and reduced-motion behavior are defined where relevant.

## Application scope

- [ ] Product-wide areas do not require an Application.
- [ ] Every migrated downstream concept has one valid direct Application ID.
- [ ] Invalid scope never widens.
- [ ] `depends-on` never transfers ownership.
- [ ] Cross-Application context exposes no unrelated private internals.
- [ ] Stable-ID migration impact is understood.

## Validation and evidence

- [ ] Required and closed-schema diagnostics exist.
- [ ] Applicability and missing information produce questions/diagnostics, not invented values.
- [ ] Executable scenarios cover durable observable guarantees.
- [ ] Lower-level tests support rather than replace features.
- [ ] Canonical snapshot, relationships, and generated projection counts are coherent.
- [ ] Build and skill validation pass.
- [ ] Known validator limitations and warnings are reported accurately.

## Migration readiness

- [ ] Canonical concepts and linked artifacts have a migration plan.
- [ ] Legacy compatibility is intentionally preserved or removed.
- [ ] Downstream consumers and skills are updated.
- [ ] Identity, relationships, and raw producer extensions remain safe.
- [ ] Rollback/version-control recovery is possible.
