# M21 project workflow

Load with [M21 specification authoring](m21-spec-authoring.md) when creating a new spec set, adopting M21 in an existing codebase, or implementing accepted contracts.

## Core flow

```text
Product knowledge and user decisions
  → durable concern boundaries
  → M21 data models
  → semantic interfaces
  → architectural contracts
  → executable Gherkin capabilities
  → implementation and evidence
```

M21 is spec-driven, not spec-after-the-code. Specs and features are build inputs and review contracts. Source implementation is one realization.

## Greenfield discovery

Do not begin by generating files. First establish:

1. Product intent, users, outcomes, constraints, and relevant Definition Area knowledge.
2. The first end-to-end capability worth proving.
3. Durable concerns that own the necessary data and interfaces.
4. Dependency order among those concerns.
5. Observable feature capabilities that demonstrate useful behavior.

Start with the smallest connected spec graph needed for the first vertical slice. Add specs as real contract boundaries emerge.

### Greenfield questions

- What outcome must the first slice create?
- What concepts need stable identity and rules?
- Which concern owns each concept?
- What semantic operation crosses a concern boundary?
- What external service, deployment, security, visual, or operational guarantee is load-bearing?
- Which observable scenario proves the slice works?
- Which decisions are accepted and which are still discovery questions?

## Brownfield adoption

Inspect before authoring:

- repository structure and package manifests;
- public APIs and entry points;
- domain models and persistence boundaries;
- tests and test runners;
- deployment/runtime configuration;
- external integrations;
- architecture and product documentation;
- ownership and change patterns when available.

Infer candidate durable concerns, then verify them with the user. Existing code reveals current behavior, not necessarily intended contract.

### Brownfield output sequence

1. Inventory candidate concerns and dependencies.
2. Identify public behavior already protected by tests.
3. Separate durable domain meaning from framework/incidental structure.
4. Draft the smallest root specs first.
5. Add dependent specs in graph order.
6. Express current accepted behavior as semantic interfaces and scenarios.
7. Expose contradictions, untested guarantees, and accidental coupling rather than canonizing them silently.
8. Validate the spec graph and feature discovery.

Do not create one spec per top-level source folder by default.

## Concern map before files

Present a proposed map such as:

| Concern | Owns | Provides | Depends on | Why separate |
|---|---|---|---|---|
| identity | Account identity and authorization decisions | authenticated-identity | — | Stable security boundary used broadly |
| catalog | Product meaning and availability | product-availability | identity | Independent domain rules and consumers |
| ordering | Order lifecycle and fulfillment handoff | order-confirmation | catalog, identity | Owns transactional intent and lifecycle |

Ask the user to confirm or revise this map. Only then create files.

## File generation order

Given an approved concern map:

1. Create root specs with no dependencies.
2. Add their models and interfaces.
3. Create their feature directories and smallest capability scenarios.
4. Run M21 validation.
5. Create dependent specs with explicit `depends_on` and `uses`.
6. Re-run validation after each meaningful layer.
7. Do not create implementation until the required scenarios are red for the intended missing behavior.

## Definition Areas versus spec concerns

Definition Area resources help the agent ask expert questions and shape canonical product knowledge. They do not prescribe spec filenames.

Examples:

- Business discovery may reveal pricing, governance, and consent constraints. These inform actual concern specs such as `subscription-billing`, `policy-enforcement`, or `identity-consent` if those concerns own durable contracts.
- Visual Design may justify a `visual-language` spec when shared tokens, components, accessibility, and theming are load-bearing contracts.
- System Design may reveal accepted-knowledge management and view generation Responsibilities. Architecture might allocate both to one Application; Component/Code Design may then produce specs such as `project-snapshot`, `definition-projection`, or `okf-repository` based on real contract ownership.
- Deployment questions may justify `release-promotion` or `recovery` specs when they provide durable guarantees; they do not require a generic `deployment.md` in every product.

## Feature ownership

A `Feature:` name is a behavioral capability other specs may consume through `depends_on[].uses`.

Choose names that are:

- lowercase kebab-case;
- stable and meaningful to consumers;
- broader than one scenario;
- independent of source symbols and transport.

A feature directory belongs to one owning spec. Scenarios within it may use supporting contracts from dependencies, but must not redefine them.

## Implementation loop

For each accepted feature:

1. Run it and confirm red for the intended reason.
2. Implement the minimum coherent behavior.
3. Run the owning feature.
4. Add focused supporting tests for invariants/adapters/edge cases as justified.
5. Refactor after behavior is green.
6. Run every feature in the project.
7. Run type, lint, unit, integration, build, and other project checks.
8. Validate the spec graph again.
9. Return reproducible evidence and contract corrections discovered.

Never weaken a scenario to match a defect. If the accepted contract is wrong, get agreement and update model → interface → contract → feature before changing implementation expectations.

## External and operational specs

Create specs beyond code modules when they carry explicit provided or consumed contracts:

- visual language and accessibility;
- external services and provider assumptions;
- deployment topology and runtime guarantees;
- observability and tracing evidence;
- scale and failure behavior;
- data migration and compatibility;
- security/privacy controls.

Keep them contract-shaped. An operations spec is not a release checklist; an observability spec defines evidence consumers can rely on.

## Review checklist for generated spec sets

- Does every file have valid `name` frontmatter?
- Are filenames and names lowercase kebab-case and meaningful?
- Does each domain concept have exactly one owning spec?
- Are dependencies real and acyclic enough to implement coherently?
- Do rich dependencies reference actual parent `Feature:` names?
- Are model references resolvable?
- Do interfaces use declared models and semantic operation IDs?
- Does every feature path name a directory that exists?
- Are features behavioral capabilities and scenarios observable?
- Are responsibilities, non-goals, invariants, and accepted decisions explicit?
- Is incidental code structure absent?
- Could the project be regenerated from the contracts and features?
- Were the specs validated with the actual M21 CLI?

## Minimal reporting after generation

Report:

- concern map and dependency roots;
- specs and feature capabilities created;
- important model/interface ownership;
- assumptions requiring user confirmation;
- validator results and limitations;
- areas deliberately not specified yet;
- implementation order implied by the dependency graph.
