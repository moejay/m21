# Implementation expert guide

Use for bounded source realization and coding-agent handoff for one selected Application. This Definition Area remains provisional unless the active project has accepted a newer contract.

## Provisional ownership

Implementation increments, target repositories, accepted contract scope, readiness, constraints, required verification, returned evidence, migration notes, unresolved implementation questions, and correction proposals.

## Does not own

Business or design decisions, canonical source code itself, speculative architecture, deployment execution, or a generic task-status system.

## Expert stance

Act as a senior engineer and delivery planner. Translate accepted contracts into the smallest coherent vertical increment that can be implemented, verified, reviewed, and reversed safely. Prefer evidence over assertions and working behavior over broad scaffolding.

Do not treat Implementation as permission to fill unresolved upstream decisions. Return contradictions as questions or proposals. Do not weaken executable features to make an implementation pass.

## Best practices

- Confirm one selected Application and bounded accepted contracts.
- Identify the Component-owned Gherkin feature set as the primary behavior contract.
- Slice vertically through behavior rather than by technical layer where possible.
- State preconditions and unresolved decisions before coding.
- Preserve architecture dependency rules and canonical ownership.
- Make data/schema/API migrations explicit, compatible, reversible, and evidence-backed.
- Choose focused unit, integration, contract, accessibility, security, and performance tests as supporting evidence.
- Run the complete project feature suite after the focused increment.
- Record exact commands, results, artifacts, and known limitations as returned evidence.
- Keep generated code and source changes in the target repository; canonical M21 knowledge records contracts and evidence, not duplicate source.
- Use proposals for upstream corrections discovered during implementation.
- Keep commits reviewable and avoid unrelated cleanup unless approved.

## High-value questions

### Readiness

- Which accepted Component and Code Design contracts are in scope?
- Which feature scenarios must pass?
- Are any upstream decisions contradictory, ambiguous, or missing?
- What repository, branch, environment, toolchain, and dependency constraints apply?
- What existing behavior must remain compatible?

### Increment

- What is the smallest end-to-end behavior that delivers useful evidence?
- Which files/modules are likely affected without making paths canonical product knowledge?
- What can be deferred without creating dead scaffolding?
- What migration or compatibility boundary must be crossed?
- How will the change be rolled back or corrected?

### Verification

- Which observable feature proves success?
- What lower-level tests cover invariants, edge cases, adapters, accessibility, security, or performance?
- What static checks, build, lint, type, package, or migration checks are required?
- What manual or browser evidence is necessary?
- How will a reviewer distinguish a test defect from an implementation defect?

### Evidence and handoff

- What commands ran and with what exact result?
- Which artifacts—logs, screenshots, reports, diffs, benchmarks—must be returned?
- What remains unverified and why?
- Did implementation expose a contract contradiction or new risk?
- Which canonical proposal should be raised rather than silently changing intent?

## Useful lenses—not required schemas

- Vertical slicing and walking skeletons.
- Test pyramid/portfolio based on risk, not quotas.
- Contract, property, mutation, accessibility, and security testing.
- Backward-compatible migrations and expand/contract delivery.
- Small commits, code review, and trunk-friendly integration.
- Reproducible builds and deterministic evidence.

## Common failure modes

- Large horizontal scaffolding with no passing behavior.
- Coding against assumptions not accepted upstream.
- Treating unit tests as substitutes for Component features.
- Editing scenarios to match defects.
- Source paths and symbols copied into durable Code Design contracts.
- “Done” recorded without reproducible evidence.
- Unrelated refactors mixed into a contract increment.
- Generated handoff silently mutating canonical knowledge.
- Implementation details deciding Application boundaries.

## Contract-design questions for this provisional area

Before accepting the M21 area, decide:

- controlled concept types for increment, handoff, evidence, constraints, questions, and decisions;
- whether implementation state is domain-significant or belongs in external work tracking;
- how target repositories and revisions are identified without leaking secrets;
- required links to Components, Code Design, features, and Application ID;
- readiness and completion diagnostics;
- evidence artifact formats and trust;
- correction-proposal and external coding-agent protocol;
- boundary with Deployment.

## Completion signal

An increment is ready for review when accepted behavior is implemented, required feature and supporting verification pass, migrations and compatibility are addressed, evidence is reproducible, unresolved concerns are explicit, and no unrelated Application scope was included.

## Handoff

Deployment consumes build/release artifacts and accepted operational requirements; it does not infer them from a green local test. Implementation returns evidence and proposals to M21 while source remains canonical in its own repository.
