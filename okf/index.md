# M21 Product Knowledge

* [Project](project.md) - The product being defined by this knowledge bundle.
* [Vision](vision.md) - The long-term direction for an AI-native product engineering workspace.
* [M21 OKF Profile](profile.md) - The minimal typed-graph conventions used by this bundle.
* [Definition Layer Frontmatter Profile](profile/definition-layer-frontmatter.md) - Draft normative schemas for primary artifacts, contextual references, and layer-specific metadata.

# Business

* [Coherent product understanding](business/coherent-product-understanding.md) - The primary business outcome M21 exists to create.
* [Fragmented product knowledge](business/problems/fragmented-product-knowledge.md) - The core problem of disconnected product context.
* [Hidden change impact](business/problems/hidden-change-impact.md) - The problem of missed or noisy cross-disciplinary review.
* [Product knowledge governance](business/capabilities/product-knowledge-governance.md) - Maintain one portable, reviewable product model.
* [Cross-disciplinary impact governance](business/capabilities/cross-disciplinary-impact.md) - Direct meaningful changes to affected owners.
* [Initial regulatory context](business/regulatory-context.md) - Known uncertainty around privacy, accessibility, and AI governance.

# People

* [Product builder](people/product-builder.md) - An individual turning an idea into an operating product.
* [Multidisciplinary product team](people/product-team.md) - People working in different disciplines over one shared product model.

# MVP

* [MVP definition](product/mvp.md) - The capabilities and boundary of the first product.
* [M21 agent](agents/m21-agent.md) - The AI thought partner that helps users evolve the graph.
* [Develop a focused concept](agents/workflows/develop-concept.md) - Discovery, development, and challenge prompt contract.
* [Assess semantic change impact](agents/workflows/assess-change-impact.md) - Contextual impact-analysis prompt contract.
* [Validate product coherence](agents/workflows/validate-product-graph.md) - Semantic graph-validation prompt contract.

## Capabilities

* [SDLC definition flow](product/capabilities/lifecycle-workflows.md) - Use Business-to-Deployment depth as the primary working and AI-guidance lens.
* [OKF project workspace](product/capabilities/project-workspace.md) - Create, open, navigate, and persist an OKF project.
* [Non-linear knowledge graph](product/capabilities/knowledge-graph.md) - Work at any point in the product model and understand dependencies.
* [AI-guided product discovery](product/capabilities/guided-discovery.md) - Develop incomplete ideas through contextual questions and proposals.
* [Product definition](product/capabilities/product-definition.md) - Define the business and product without disconnecting them from delivery.
* [Integrated product design](product/capabilities/product-design.md) - Develop experience, interaction, and visual design in the shared graph.
* [Progressive architecture](product/capabilities/architecture.md) - Model systems, applications, and components with traceability.
* [Decision management](product/capabilities/decision-management.md) - Preserve alternatives, rationale, and consequences.
* [Change impact and review](product/capabilities/change-impact.md) - Assess directional impact and involve affected owners.
* [Continuous graph validation](product/capabilities/graph-validation.md) - Detect gaps, conflicts, and architectural risks.
* [Generated views](product/capabilities/generated-views.md) - Project the graph into useful documents and diagrams.

# Software development definition flow

* [SDLC definition-flow model](domain/sdlc-workflow.md) - Layers are many-to-many working lenses over canonical concepts.
* [Purpose-built definition projections](domain/layer-projections.md) - Each layer presents shared knowledge through an interface designed for its work.
* [Business](sdlc/business.md) - Define personas, business capabilities, problems, outcomes, and regulation.
* [Product](sdlc/product.md) - Define how the product solves the business problem.
* [Design and visual language](sdlc/design.md) - Define experience, brand, tokens, patterns, and accessibility.
* [System Design](sdlc/system.md) - Define conceptual responsibilities, data boundaries, flows, qualities, and external dependencies.
* [Architecture](sdlc/architecture.md) - Choose the actual owned Application topology that realizes System Design.
* [Application Architecture](sdlc/application.md) - Define each selected Application's internal architecture and responsibilities.
* [Components](sdlc/components.md) - Define cohesive application components and dependencies.
* [Code design](sdlc/code-design.md) - Define models, interfaces, patterns, contracts, and Gherkin behavior.
* [Implementation handoff](sdlc/implementation.md) - Package accepted design for an external coding agent.
* [Deployment definition](sdlc/deployment.md) - Define deployment for a coding or delivery agent to realize.

# Experience and design

## Principles

* [Context before output](experience/principles/connected-context.md) - Orient guidance and output in relevant product context.
* [Non-linear agency](experience/principles/non-linear-agency.md) - Let users work anywhere without losing coherence.
* [User-controlled canonical knowledge](experience/principles/user-control.md) - Keep AI changes reviewable and explicit.

## Journeys and workspace

* [Shape an idea](experience/journeys/shape-idea.md) - Develop an incomplete idea into connected product knowledge.
* [Work anywhere](experience/journeys/work-anywhere.md) - Focus and develop any concept in context.
* [Review impact](experience/journeys/review-impact.md) - Resolve changes that may affect owned knowledge.
* [Workspace information architecture](experience/information-architecture/workspace.md) - Organize focus, graph, agent, review, and views.
* [Graph workspace](experience/screens/graph-workspace.md) - Primary product workspace screen.
* [Change review](experience/screens/change-review.md) - Review semantic changes and impact.
* [Visual language](experience/visual-language.md) - Calm, precise visual foundations and the active M21 theme.
* [Typography](experience/foundations/typography.md) - Humanist interface text and restrained structured monospace.
* [Color system](experience/foundations/color.md) - Semantic working surfaces, accent, and status roles.
* [Character and feel](experience/foundations/feel.md) - The desired product personality and qualities to avoid.
* [Shape, spacing, and motion](experience/foundations/shape-motion.md) - Grouping, geometry, density, and transition principles.
* [Design system](experience/design-system.md) - Shared product interaction patterns.
* [Actions](experience/components/actions.md) - Primary, secondary, quiet, and disabled controls.
* [Form fields](experience/components/form-fields.md) - Labeled editing and guidance controls.
* [Knowledge cards](experience/components/knowledge-cards.md) - Expandable canonical documents and proposal states.
* [Definition navigation](experience/components/navigation.md) - Non-linear layer orientation and selection.
* [Accessibility](experience/accessibility.md) - Inclusive graph and AI workflow constraints.

# Domain model

* [Product knowledge graph](domain/product-knowledge.md) - Concepts, typed relationships, and graph invariants.
* [Change governance](domain/change-governance.md) - Change sets, operations, impact, and review.
* [Directional impact semantics](domain/impact-semantics.md) - Relationship-specific change propagation policy.

# Architecture

* [M21 workspace system](architecture/systems/m21-workspace.md) - Owned system context, responsibilities, and boundaries.
* [Knowledge workspace](architecture/systems/knowledge-workspace.md) - Human-facing product-definition interaction boundary.
* [Product knowledge runtime](architecture/systems/product-knowledge-runtime.md) - Semantic OKF, validation, impact, and change core.
* [AI guidance boundary](architecture/systems/ai-guidance-boundary.md) - Provider-neutral context and proposal orchestration.
* [View generation pipeline](architecture/systems/view-generation-pipeline.md) - Deterministic documents, diagrams, catalogs, and handoffs.
* [OKF project store](architecture/systems/okf-project-store.md) - User-owned canonical Markdown and YAML persistence.
* [Configured AI model provider](architecture/systems/external-ai-provider.md) - Replaceable external inference boundary.
* [Version control system](architecture/systems/version-control.md) - Optional history, distribution, diff, and merge support.
* [Coding and delivery agents](architecture/systems/delivery-agents.md) - External implementation and deployment execution systems.
* [Browser workspace](architecture/applications/web-workspace.md) - Interactive graph and review client.
* [Local project service](architecture/applications/project-service.md) - Local semantic API and coordinator.
* [Project workspace API](architecture/applications/project-api.md) - Semantic loopback queries, proposal commands, and generated views.
* [Workspace shell](architecture/components/workspace-shell.md) - Product-wide layout, route state, theming, and project health.
* [Definition workspace projector](architecture/components/definition-workspace.md) - Purpose-built layer view selection and rendering.
* [Application scope controller](architecture/components/application-scope-controller.md) - Persistent downstream ownership scope and deep links.
* [Proposal review workspace](architecture/components/proposal-review-workspace.md) - Explicit review before canonical persistence.
* [Project coordinator](architecture/components/project-coordinator.md) - Application-level query, proposal, acceptance, AI, and view coordination.
* [Workspace HTTP adapter](architecture/components/workspace-http-adapter.md) - Loopback transport adapter for the Browser Workspace.
* [OKF repository](architecture/components/okf-repository.md) - Lossless bundle persistence.
* [Product graph engine](architecture/components/graph-engine.md) - Typed graph construction and queries.
* [Change and impact engine](architecture/components/change-engine.md) - Reviewable mutation and directional impact.
* [Graph validation engine](architecture/components/validation-engine.md) - Evidence-backed diagnostics.
* [AI orchestrator](architecture/components/ai-orchestrator.md) - Bounded context and provider-neutral proposals.
* [Generated view projector](architecture/components/view-projector.md) - Reproducible documents and diagrams.

# Code design

* [Concept graph model](code-design/models/concept-graph.md) - Stable Concept, Relationship, Edge, Diagnostic, and identity contracts.
* [Project snapshot](code-design/contracts/project-snapshot.md) - Immutable accepted project query result.
* [Change proposal](code-design/contracts/change-proposal.md) - Revision-bound review and acceptance state.
* [Application scope](code-design/contracts/application-scope.md) - Deterministic relationship-derived downstream ownership.
* [Definition navigation state](code-design/contracts/navigation-state.md) - Deep-linkable product and Application workspace state.
* [Definition projection](code-design/contracts/definition-projection.md) - Layer-to-purpose-built-workspace mapping.
* [Proposal review](code-design/contracts/proposal-review.md) - Explicit accessible pending-change interaction.
* [Semantic theme](code-design/contracts/design-theme.md) - Safe accepted Visual Language projection.
* [AI provider port](code-design/interfaces/ai-provider-port.md) - Replaceable untrusted structured inference boundary.
* [OKF repository port](code-design/interfaces/okf-repository-port.md) - Safe bundle loading and atomic accepted revision.
* [Generated view port](code-design/interfaces/view-generator-port.md) - Deterministic disposable Markdown and HTML projections.
* [Workspace failure model](code-design/errors/failure-model.md) - Stable failure categories and recovery guarantees.
* [Application dependency rule](code-design/patterns/dependency-rule.md) - Inward dependency direction and adapter boundaries.

# Boundaries and risks

* [MVP boundary](constraints/mvp-boundary.md) - What the first release intentionally excludes.
* [Portable typed relationships](decisions/portable-typed-relationships.md) - How M21 adds graph semantics while remaining OKF-compatible.
* [False impact propagation](risks/false-impact-propagation.md) - The risk of overwhelming users with indiscriminate change warnings.
