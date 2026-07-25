# 2026-07-25 — Global 3D knowledge graph

- Removed the scoped generic relationship-graph alternative from definition-layer workspaces and deleted the generated Google-reference `okf/viz.html` pipeline.
- Added one global interactive 3D view containing every accepted OKF concept and resolved typed relationship, independent of active layer or selected Application.
- Added definition-depth color bands, search, orbit and zoom controls, concept focus, relationship traversal, complete-snapshot revision traceability, and a visible WebGL failure state.
- Added the Global Graph Workspace Component, durable projection contract, executable feature coverage, and a lazy-loaded 3D rendering dependency.
- Preserved purpose-built layer and Application workspaces as the authoring surfaces; the global graph remains a disposable read-only projection.

# 2026-07-22 — Product-wide definition workflow specification

- Added `spec/product-definition-workflow.md` as the product-level contract for Business, Product, Visual Design, System Design, and Architecture.
- Defined common and layer-specific frontmatter models, durable body expectations, cross-layer traceability, and AI-guided authoring behavior for the first five workflow layers.
- Renamed the human-facing Design and Visual Language layer to Visual Design while retaining the stable `design` identifier and namespace.
- Expanded the canonical definition-layer frontmatter profile with what each layer is, how the agent assists, and what belongs in frontmatter and the Markdown body.
- Deferred Application Architecture and deeper workflow specifications to a later application-scoped contract.

# 2026-07-22 — Separate System Design from Architecture

- Renamed the product-wide System view to System Design and made its conceptual responsibility, information-flow, data, quality, and external-boundary role explicit.
- Added a product-wide Architecture layer that chooses actual owned Application boundaries and supports one full-stack or monolithic Application as well as multiple frontend, backend, worker, or service Applications.
- Moved the Application realization matrix and portfolio into Architecture; selecting an Application now enters Application Architecture and preserves that scope through Components, Code Design, Implementation, and Deployment.
- Added Architecture frontmatter and updated the ten-layer definition flow, projections, specification, coding-agent SKILL, deep-link behavior, and navigation.
- Added required Gherkin feature sets to every active Component and exposed them in Component contracts and Implementation handoffs as the primary implementation test contract.
- Prevented invalid Application identities from widening downstream scoped snapshots.

# 2026-07-22 — Component and Code Design contracts

- Expanded Browser Workspace and Local Project Service into twelve cohesive Components with explicit layer, visibility, responsibilities, non-goals, ownership, and dependency direction.
- Added the semantic Project Workspace API and replaced direct Browser-to-Application dependency with an interface dependency.
- Added Application-scoped Code Design models, ports, stateful contracts, projection rules, failure taxonomy, semantic theme, and inward dependency rule.
- Removed Components from Code Design primary membership; linked contracts now carry regeneration-quality implementation semantics.
- Rebuilt Components as an architecture map plus expandable canonical Component contracts.
- Rebuilt Code Design as a grouped expandable contract registry.
- Added `spec/m21-workspace.md` as the validated implementation specification and `.agents/skills/m21-workspace/SKILL.md` as the project-local coding-agent workflow.

# 2026-07-22 — Application-scoped downstream workspace

- Reorganized product-wide navigation around Business, Product, Design, System, and an Application Workspace entry point.
- Added an owned-Application portfolio grouped by realized System responsibilities.
- Added a persistent Application selector and secondary Application, Components, Code Design, Implementation, and Deployment tabs.
- Derived downstream scope through canonical `part-of` and `realizes` relationships rather than duplicated Application IDs.
- Added deep-link state for both selected layer and Application.
- Pruned Application membership to actual Application artifacts and removed duplicated Component ownership metadata.
- Added full rendered Application documents, runtime and architecture facts, and realized System responsibility cards.

# 2026-07-21 — High-level System architecture workspace

- Pruned System membership to deliberate high-level architecture artifacts.
- Defined the owned M21 system, experience, semantic runtime, AI boundary, generated-view pipeline, OKF data store, version control, model provider, and external delivery agents as linked OKF documents.
- Connected Application and Component realization to System contracts without exposing their internals as primary System nodes.
- Replaced the generic grouped graph with a themed architecture map showing responsibilities, data boundaries, external systems, typed dependencies, and ownership.
- Added grouped expandable Markdown architecture documents beneath the map.

# 2026-07-21 — Design studio and generated component preview

- Pruned Design membership to actual experience and visual-design artifacts.
- Added canonical Typography, Color, Character, Shape, Spacing, and Motion foundations.
- Added active component stories for actions, form fields, knowledge cards, and definition navigation.
- Expanded semantic themes to cover color, typography, shape, elevation, and workspace chrome.
- Applied the active Visual Language theme to M21 itself.
- Added reviewable AI theme proposals; M21 restyles only after the proposal is accepted.
- Generated a standalone Storybook-like HTML catalog from accepted theme and component-story knowledge.
- Rebuilt Design as a focused studio with rendered foundation documents, token specimens, component stories, and a preview entry point.

# 2026-07-21 — Simplify the Product workspace

- Pruned Product membership to Product Capability concepts instead of cross-layer references.
- Removed the left navigator and inspector from Product.
- Rendered Product Capabilities as expandable full-document cards matching the Business layout.
- Replaced raw Markdown source in Business and Product expansions with safe rendered Markdown, including GFM tables.

# 2026-07-20 — Simplify the Business workspace

- Removed the Overview tab.
- Pruned Business membership to actual Business documents instead of cross-layer supporting concepts.
- Removed the left navigator and inspector from Business.
- Rendered Business main artifacts as sectioned expandable cards containing their full canonical Markdown body.
- Deferred contextual links and references for this view.

# 2026-07-20 — Draft layer frontmatter specification

- Defined `sdlc` membership as the sole selector for primary artifacts in a definition layer.
- Defined connected non-member concepts as one-hop contextual references placed by relationship meaning and concept type.
- Drafted common M21 frontmatter requirements and namespaced Business, Product, Design, System, Application, Components, Code Design, Implementation, and Deployment metadata schemas.
- Defined validation and compatibility rules for the profile; migration remains pending agreement on the draft.

# 2026-07-20 — Purpose-built layer workspaces

- Stopped treating the filtered graph as the interface for every definition layer.
- Added document workspaces for Business and Product, a visual-language and component board for Design, grouped topology for System and Components, application architecture cards, a Code Design contract registry, and dedicated Implementation and Deployment handoff views.
- Added namespaced frontmatter metadata so each projection can own sections, groups, architecture styles, and other presentation semantics without changing concept identity.
- Added Business Problem and Business Capability concepts and separated Product Capability as its own type.
- Applied active visual-language semantic tokens to the workspace theme.
- Added executable projection and visual-theme scenarios.

# 2026-07-19 — Correct SDLC flow to definition depth

- Replaced temporal Discover-to-Learn phases with Business, Product, Design and Visual Language, System, Application, Components, Code Design, Implementation Handoff, and Deployment Definition.
- Clarified what each layer defines and how upstream contracts influence deeper realization.
- Kept layers many-to-many with concept types and preserved non-linear work and directional impact.
- Made Implementation and Deployment explicit definition layers while outsourcing execution to coding or delivery agents.
- Added structured visual-language theme tokens for live workspace dogfooding and Storybook-compatible design handoffs.
- Collapsed development onto one HTTP server by running Vite as project-service middleware.

# 2026-07-19 — SDLC becomes the primary workflow

- Defined Discover, Define, Design, Architect, Plan, Build, Verify, Release, Operate, and Learn as lifecycle working lenses.
- Kept lifecycle participation many-to-many with concept types so one canonical Decision, Journey, Constraint, or Component can support several steps.
- Annotated all current product concepts with explicit lifecycle relevance.
- Added lifecycle navigation to the workspace and scoped graph, search, diagnostics, and AI context to the selected step.
- Added executable scenarios proving multi-step concept participation, non-gating workflow, and stage-aware AI guidance.

# 2026-07-19 — First dogfooded vertical slice

- Added concrete experience principles, user journeys, information architecture, screens, visual language, design system, and accessibility knowledge.
- Defined the product-graph, change-governance, and directional-impact domain models.
- Defined the local-first system, browser and service applications, and initial domain components.
- Added focused AI workflow and prompt contracts for concept development, impact assessment, and validation.
- Derived twelve executable Gherkin scenarios across project persistence, impact, validation, AI proposals, and generated views.
- Implemented a TypeScript vertical slice that opens this bundle, visualizes its typed graph, creates and accepts reviewable changes, validates traceability, and generates a project summary.
- Dogfooded validation against this bundle and resolved five capability traceability gaps.

# 2026-07-19 — OKF dogfooding begins

- Reframed M21 as an AI-native product engineering workspace.
- Established this OKF bundle as the canonical product definition.
- Added business, product, design, architecture, change-impact, validation, and generated-view MVP capabilities.
- Added a minimal typed-relationship profile for evaluation during dogfooding.
- Defined the initial role and workflow contracts of the M21 agent.
- Deferred executable Gherkin scenarios until the manually authored capability graph has been reviewed.
