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
