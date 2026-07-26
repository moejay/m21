# M21 Definition-Area Redesign Progress

Last updated: 2026-07-25

## Overall status

The durable context and provisional area inventory have been created. Business, Business Solution, Visual Design, System Design, and Architecture are agreed and migrated into specs, executable features, the OKF profile and canonical knowledge, parser validation, and purpose-built workspaces.

## Cross-cutting model

| Concern | Status | Notes |
|---|---|---|
| Singular Definition Area ownership | Agreed in principle | Working field is `area`; final terminology remains reviewable. |
| Common concept frontmatter | In discussion | Generic `status` removed; accepted bundle presence is current and unaccepted work is a proposal. Need identity, controlled type, title, description, area, ownership, resources, unknown-type handling, and extension rules. |
| Typed relationships | Existing basis; refinement needed | Baseline vocabulary exists; must test against all new areas. |
| Application identity and scope | Partially agreed | Architecture is the sole global Application ID registry; every downstream concept has exactly one validated direct ID; dependencies do not transfer ownership; shared non-executable ownership remains open. |
| Optionality and coverage questions | Agreed in principle | No empty placeholders; detailed model unresolved. |
| Projection-selection rules | Agreed in principle | Area `section` selects the projection; only schema fields with an accepted current workspace use and relationships populate it. Widget metadata and a universal metadata UI language are excluded. |
| Shared workspace interactions | Not started | Proposal review, filtering, comparison, context, and AI guidance need a common contract. |
| Schema representation | In discussion | Human-readable field tables are required; current M21 does not validate the redesign; choose the future machine-readable format after the area model stabilizes. See `SCHEMA-CONVENTIONS.md`. |
| Migration and compatibility | In progress by explicit area approval | Business, Solution, Visual Design, System Design, and Architecture use singular `area`; downstream unmigrated areas retain legacy `sdlc` compatibility plus stable Application scope. |

## Area status

| # | Area | Status | Specification |
|---:|---|---|---|
| 1 | Business | Agreed | `business.md`; minimal `business.section` schema and grouped-card workspace. |
| 2 | Business Solution | Agreed | `solution.md`; socio-technical model, minimal `solution.section` schema, and grouped-card workspace. |
| 3 | Visual Design | Agreed | `visual-design.md`; linked CSS/HTML, inline overrides, composed themes, visual foundations, assets, and sandboxed component specimens. |
| 4 | System Design | Agreed | `system.md`; root System, conceptual parts, relationship-driven map, ownership boundaries, and directional flows. |
| 5 | Architecture | Agreed | `architecture.md`; Application identity, portfolio topology, realization matrix, communications, and user decisions. |
| 6 | Application Experience Design | Not started | — |
| 7 | Application Architecture | Not started | — |
| 8 | Components | Not started | — |
| 9 | Code Design | Not started | — |
| 10 | Implementation | Not started | — |
| 11 | Deployment | Not started | — |

## Checklist required for every area

- [ ] Purpose and responsibility
- [ ] Explicit non-responsibilities and boundary with adjacent areas
- [ ] Scope: product-wide, shared, or Application-specific
- [ ] Area-specific frontmatter schema with documented workspace use for every field
- [ ] Controlled `section` vocabulary
- [ ] Controlled concept types allowed in each section
- [ ] Type-specific metadata and constraints
- [ ] Relevant relationship types and expected directions
- [ ] Default projection for every section
- [ ] Alternative and generic fallback projections
- [ ] Workspace filtering, navigation, comparison, and editing interactions
- [ ] Guided questions and agent posture
- [ ] Optionality, applicability, and completeness diagnostics
- [ ] Cross-area context and impact behavior
- [ ] Representative frontmatter and body examples
- [ ] User approval
- [ ] Future cross-area consistency validation design

## Business completion

- [x] Purpose and non-goals
- [x] Section and controlled-type inventory
- [x] People model and Research section
- [x] Minimal schema contract: `business.section`
- [x] Expandable cards grouped by section and type
- [x] Workspace interactions and relationship expectations
- [x] Questions and optionality rules
- [x] User approval
- [x] Parser and workspace validation implemented
- [ ] Future cross-area and relationship-vocabulary validation design

## Business Solution completion

- [x] Socio-technical purpose and non-goals
- [x] Section and controlled-type inventory
- [x] Human, process, policy, digital, physical, and partner delivery types
- [x] Minimal schema contract: `solution.section`
- [x] Expandable cards grouped by section and type
- [x] Workspace interactions and relationship expectations
- [x] Questions and optionality rules
- [x] User-directed initial approval
- [x] Parser and workspace validation implemented
- [ ] Future cross-area and relationship-vocabulary validation design

## Visual Design completion

- [x] Separate product-wide Visual Design from later Application Experience Design
- [x] Section and controlled-type inventory
- [x] Linked CSS/HTML baseline and deterministic inline overrides
- [x] Visual Theme as composed CSS entry point
- [x] Visual Component specimen and optional demonstration-script contract
- [x] Component states and variants remain in one concept
- [x] Local visual asset and font handling
- [x] Visual accessibility and sandbox safety boundary
- [x] User approval of initial contract
- [x] Parser, linked-artifact, sandboxed preview, and workspace projection implemented
- [ ] Future renderer-specific media and sandbox schema

## System Design completion

- [x] Purpose and Architecture boundary
- [x] Root System and simplified section/type inventory
- [x] Minimal `system.section` and ownership-boundary metadata
- [x] First-class concepts only for independently meaningful System-specific knowledge
- [x] Scale and local qualities remain on the relevant System concept by default
- [x] Relationship-driven system map with branch/section visibility and directional flow animation
- [x] External and managed dependency representation
- [x] Guided questions and optionality
- [x] User approval of initial contract
- [x] Canonical System knowledge migrated to singular area ownership and closed section metadata
- [x] Parser validation, executable features, and conceptual map projection implemented

## Architecture completion

- [x] Purpose and downstream boundaries
- [x] Root Architecture, sections, and controlled types
- [x] Stable Application ID and downstream scope key
- [x] Application kind vocabulary and independent-deployability metadata
- [x] First-class Application Communication rule and modes
- [x] Topology and realization-matrix projections
- [x] User decision and agent-guidance questions
- [x] User approval of initial contract
- [x] Canonical root, Applications, and communication migrated to singular area ownership
- [x] Parser validation, executable features, topology, realization matrix, and stable-ID scoping implemented

## Application Scope discussion

- [x] Architecture uniquely declares Application IDs; downstream references are canonical scope without mandatory duplicate direct relationship
- [x] Confirm exactly one Application ID on every downstream concept
- [x] Confirm selectable-Application and invalid-scope behavior
- [ ] Confirm contextual versus primary cross-Application knowledge
- [ ] Decide ownership of genuinely shared non-executable Components and contracts
- [ ] Approve cross-area Application Scope contract

## Application Experience Design — next after Application Scope

- [ ] Define stable Application ID scope
- [ ] Define journeys, service blueprints, information architecture, navigation, flows, screens, states, interaction, and content behavior
- [ ] Define consumption of shared Visual Design

## Resume instructions

1. Read `m21-spec/CONTEXT.md` and `m21-spec/SCHEMA-CONVENTIONS.md` completely.
2. Read this file and find the first area marked **In discussion**; otherwise choose the first **Not started** area.
3. Read that area's specification completely.
4. Continue with one bounded design decision at a time.
5. Record accepted decisions and unresolved questions immediately.
6. Modify `spec/`, `features/`, `okf/`, or implementation only for an area the user has explicitly approved for migration.
