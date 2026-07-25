---
name: m21-workspace
description: Implement or revise the M21 OKF-native product-engineering workspace from its specification, executable features, and canonical OKF architecture contracts.
---

# M21 Workspace Engineering Skill

Use this skill for source, tests, architecture, UI, or contract work in this repository.

## Required reading order

1. Read `spec/product-definition-workflow.md` and `spec/m21-workspace.md` completely. The first owns product-wide definition metadata and authoring; the second owns the regeneration-quality workspace implementation contract.
2. Read every affected executable scenario under `features/` before changing behavior.
3. Read the affected canonical OKF concepts under `okf/`, especially:
   - `okf/domain/sdlc-workflow.md`
   - `okf/domain/layer-projections.md`
   - `okf/profile/definition-layer-frontmatter.md`
   - the selected Application under `okf/architecture/applications/`
   - its Components under `okf/architecture/components/`
   - its Code Design contracts under `okf/code-design/`
4. Follow typed relationships rather than inferring ownership from folders, names, or duplicated metadata.

If the spec, executable feature, and OKF knowledge disagree, stop and resolve the contract instead of guessing. OKF remains canonical product knowledge; the spec is the implementation contract derived from it; Gherkin is the executable behavioral contract.

## Architecture rules

- Keep Business, Product, Visual Design, System Design, and Architecture product-wide.
- Keep System Design conceptual: responsibilities, flows, data ownership, qualities, and external boundaries without deciding executable topology.
- Use Architecture to choose actual owned Applications; allow one full-stack or monolithic Application or several frontend, backend, worker, and service Applications.
- Require one selected owned Application for Application Architecture, Components, Code Design, Implementation, and Deployment.
- Derive Application ownership through incoming `part-of` and downstream `realizes` chains.
- Never let `depends-on` transfer ownership or silently include another Application's internals.
- Keep browser views behind the Project Workspace API; browser code never reads OKF files or provider credentials.
- Keep domain and application contracts independent of transport, filesystem, rendering, and model-provider adapters.
- Route persistence through the OKF Repository port and accepted mutation through proposal acceptance.
- Treat all AI output as untrusted proposal input.
- Treat summaries, diagrams, component previews, and handoffs as disposable generated views.

## Component expectations

Every durable Component definition needs:

- One cohesive responsibility
- Explicit non-responsibilities
- Architectural layer and visibility
- `part-of` ownership to exactly one Application or parent Component
- Dependencies on contracts or ports rather than adapter internals where possible
- No cycles across domain dependency direction
- Corresponding Code Design contracts for public behavior, state, interfaces, or failure semantics
- A non-empty `components.features` set of existing repository-relative Gherkin feature files

The Component's Gherkin set is the primary implementation testing contract. Implementation work must run and satisfy those features. Focused unit, integration, adapter, accessibility, or performance tests may supplement Gherkin when they verify lower-level evidence, but they must not replace or contradict the feature guarantees.

Do not promote incidental helpers, source files, framework wrappers, or visual fragments into Components.

## Code Design expectations

Code Design describes models, semantic interfaces, stateful contracts, dependency rules, failures, and executable behavior. It must survive changes in language, framework, file layout, and symbols.

- Public behavior requires a semantic interface or contract.
- State transitions and concurrency preconditions must be explicit.
- Persistence, provider, and generated-view dependencies use ports.
- Failures preserve accepted state and expose actionable categories without leaking secrets.
- Application-scoped contracts must be linked through the owning Application or Component.
- Every active Component declares the Gherkin feature files that verify its public behavior and durable guarantees.
- Implementation and coding-agent handoffs derive required testing primarily from those Component feature sets.
- Gherkin scenarios demonstrate observable guarantees; do not use scenarios for private helpers.

## Delivery workflow

1. Update model and ownership contracts first.
2. Update semantic interfaces and architectural invariants.
3. Add or revise the smallest durable Gherkin scenario.
4. Confirm the scenario is red for the intended reason.
5. Implement the minimum coherent change.
6. Run all verification:

```bash
npx @moejay/m21 validate ./spec --json
npm test
npm run build
```

7. Validate the complete OKF snapshot and global graph projection when canonical knowledge changes.

Never weaken a scenario to match an implementation defect. Never persist a proposal automatically. Never make generated output canonical by editing it in place.
