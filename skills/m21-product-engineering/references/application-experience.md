# Application Experience expert guide

Use for the experience of one selected owned Application. This area is provisional until the project accepts its purpose, schema, controlled sections/types, relationships, projections, and validation. Use this guide for discovery and contract design—not as authority to migrate concepts.

## Provisional ownership

Application-specific journeys, service blueprints where relevant, information architecture, navigation, user and system-assisted flows, screens/views, states, interaction behavior, content behavior, accessibility, and deliberate use of shared Visual Design.

## Does not own

Business truth, the complete socio-technical Solution, shared Visual Design foundations, conceptual System responsibilities, Application portfolio topology, internal software architecture, code symbols, or deployment.

## Expert stance

Act as a product designer, UX researcher, interaction designer, information architect, content designer, accessibility specialist, and service designer. Ground experience decisions in accepted people, needs, Solution behavior, Application boundary, evidence, and constraints.

Do not equate experience with screens. Include entry, exit, transition, waiting, errors, recovery, permission, empty states, non-visual interaction, support, and the surrounding service when relevant.

## Best practices

- Confirm the selected Application and the people/roles it serves.
- Start with user intent and end-to-end outcome before navigation or screens.
- Distinguish a cross-channel/service journey from one Application's interaction flow.
- Model information architecture around user meaning and tasks, not backend entities.
- Make system status, consequences, and next actions visible.
- Design default, empty, loading, partial, error, offline, permission, success, cancellation, and recovery states.
- Use shared Visual Design rather than redefining tokens or visual components.
- Specify behavior semantically so implementation technology can change.
- Include keyboard, screen reader, zoom/reflow, cognitive, motor, sensory, localization, and reduced-motion needs from the beginning.
- Validate with realistic content, permissions, latency, interruptions, and failure.
- Keep content clear, purposeful, consistent, and appropriate to user risk.

## High-value questions

### People and context

- Which accepted Persona, Role, Stakeholder, goal, or need is in scope?
- What triggers the interaction, where does it occur, and what constraints surround it?
- What knowledge, permission, device, connectivity, time, or assistance does the person have?
- Who is excluded or disadvantaged by the default path?

### Journey and task

- What outcome is the person trying to reach, not merely what action do they take?
- What happens before entering and after leaving this Application?
- Where are handoffs to people, process, partner, or another Application?
- Which moments create uncertainty, trust, effort, delay, or risk?
- What is the shortest safe path and what alternatives are needed?

### Information architecture and navigation

- What concepts and labels match the user's mental model?
- What must be findable globally versus contextual to a task?
- How does a person know where they are, what changed, and how to recover?
- Which navigation reflects product structure rather than user intent?
- How do search, browse, filtering, history, and deep links cooperate?

### Flow, screen, and state

- What preconditions and decision points exist?
- What information is required, optional, derived, or dangerous to change?
- What happens under latency, partial data, conflict, stale state, denial, and failure?
- Can the action be undone? What confirmation is proportional to consequence?
- What feedback communicates progress and accepted state without relying on color or motion?

### Content and accessibility

- What must the person understand before acting?
- Are labels specific, consistent, translatable, and free of internal jargon?
- What is announced to assistive technology as state changes?
- Does focus move predictably? Can every operation be completed by keyboard?
- What alternative exists for drag, hover, gesture, animation, audio, or visual-only content?

## Useful lenses—not required schemas

- Jobs-to-be-Done and task analysis.
- Journey mapping and service blueprinting.
- Information architecture, content modeling, and progressive disclosure.
- Human-interface heuristics, error prevention, and recognition over recall.
- WCAG and inclusive design.
- Usability testing, cognitive walkthroughs, and accessibility testing.
- Threat and privacy experience: consent, permissions, sensitive disclosure, and safe defaults.

## Common failure modes

- Designing screens before validating intent and flow.
- Copying the database or org chart into navigation.
- Happy-path-only mockups.
- Shared Visual Design duplicated or overridden per screen without reason.
- Accessibility added as a final checklist.
- Ambiguous destructive actions, hidden system state, or unrecoverable errors.
- A journey that silently crosses Applications without Architecture communication or service context.
- Treating generated mockups as accepted behavior.

## Contract-design questions for this provisional area

Before accepting an M21 schema, decide:

- controlled sections and concept types;
- whether journeys and service blueprints are app-owned or can be contextual product-wide views;
- how screens, flows, states, and content avoid duplication;
- relationships to Personas, Needs, Solution Behaviors, Visual Components, System Flows, and Applications;
- primary projections and generic fallback;
- required Application ID behavior;
- accessibility diagnostics and evidence;
- which artifacts, if any, are canonical versus generated.

## Handoff

Application Architecture consumes accepted experience behavior, data, latency, offline, security, and integration needs. Components and Code Design realize these contracts without redefining user intent. Implementation must verify observable experience and accessibility guarantees.
