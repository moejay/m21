# M21 operating model

Load this reference whenever evaluating, authoring, migrating, or implementing M21 product knowledge.

## One connected model

M21 treats product definition as a connected graph of canonical concepts rather than a stack of disconnected documents. The common movement from Business toward Deployment communicates influence and traceability, not mandatory chronology. Work may begin anywhere, but every decision should remain connected to the intent and constraints it affects.

A Definition Area owns primary meaning and workspace behavior. It does not own every concept it can see. Cross-area concepts appear as contextual references through typed relationships.

## Knowledge categories

Keep these categories distinct:

| Category | Meaning | Canonical handling |
|---|---|---|
| Observed evidence | Research, measurement, source, or direct observation | Evidence concept or relationship; cite provenance |
| Accepted fact | User-approved current product knowledge | Canonical OKF concept |
| Assumption | Belief that may be invalidated | Explicit assumption concept/body and evidence gap |
| Option | Plausible alternative not selected as current truth | Option concept or proposal with trade-offs |
| Recommendation | Expert advice | Explain rationale; remains non-canonical until accepted |
| Decision | Accepted choice with rationale and consequences | Decision concept/body and governing relationships |
| Question | Material unknown | Keep visible; do not fabricate an answer or empty concept |
| Proposal | Reviewable candidate change | Separate from accepted snapshot until explicit acceptance |
| Projection | Generated view of accepted knowledge | Disposable unless separately accepted |

## Concept placement test

Before creating or changing a concept, ask:

1. Does it have independent meaning, evidence, relationships, or revision needs?
2. Is it useful to address, inspect, govern, or trace separately?
3. Is it more than a heading, UI group, renderer selector, source file, or checklist entry?

If yes, a first-class concept may be appropriate. Otherwise use the owning concept's body, an existing relationship, or workspace state.

### Frontmatter admission

Add structured metadata only when all are true:

- it is canonical domain meaning;
- a current workspace projection, filter, comparison, calculation, or actionable diagnostic consumes it;
- shape, optionality, allowed values, and missing behavior are precise;
- body content or a first-class concept would be worse;
- it does not duplicate another authority.

Temporary selection, filters, card expansion, graph layout, camera position, preview state, and generated rendering never belong in concept metadata.

## Area selection test

Choose the area whose expert question owns the meaning:

- **Business:** Why is change needed and what environment must it succeed in?
- **Business Solution:** What complete socio-technical response should exist?
- **Visual Design:** What shared visual language should communicate the solution?
- **System Design:** What conceptual technical responsibilities and information behavior are required?
- **Architecture:** What actual owned Application boundaries realize those responsibilities?
- **Application Experience:** How do people experience and interact with one Application?
- **Application Architecture:** How is one Application internally organized to meet its contracts?
- **Components:** What cohesive owned parts and dependency boundaries make up that Application?
- **Code Design:** What semantic models, interfaces, states, events, and failures enable implementation?
- **Implementation:** What bounded source change should be performed and what evidence proves it?
- **Deployment:** How is an Application configured, delivered, observed, recovered, and operated?

If a statement answers several, split it into owned concepts connected by relationships rather than giving it multiple primary owners.

## Expert conversation pattern

### Orient

Summarize current accepted knowledge and the decision under discussion. Name missing evidence and conflicts before asking questions.

### Ask progressively

Ask at most a few high-value questions at once. Begin with questions that could invalidate the framing. Follow the user's answer rather than marching through a template.

Useful forms:

- “What observation supports this, and what would contradict it?”
- “Who experiences the consequence, and in what context?”
- “Is this an accepted requirement, an option, or a working assumption?”
- “What must remain true if the realization changes?”
- “Which failure or constraint would force a different boundary?”
- “What decision are we trying to make with this information?”

### Challenge responsibly

Challenge claims, not the user. Explain the consequence of ambiguity. Offer alternatives and recommend one only when the evidence and constraints warrant it. Highlight reversible versus hard-to-reverse decisions.

### Close the loop

At the end of a bounded discussion, state:

- what is accepted versus proposed;
- what changed in the model;
- what remains unknown;
- which relationships or downstream areas need review;
- what validation or evidence is next.

## Traceability expectations

Traceability is semantic, not merely “everything links to everything.” Prefer directional relationships that explain why a downstream concept exists and what governs it. Add rationale when the edge meaning is not obvious. Add evidence links when a claim depends on a source.

Typical chain:

```text
Business problem / need
  → Business outcome
  → Solution proposition / capability / behavior
  → System responsibility / flow / quality
  → Architecture Application / communication
  → Application experience or internal architecture
  → Component
  → Code Design contract
  → Implementation increment and evidence
  → Deployment and operational evidence
```

Not every concept needs the entire chain. Every consequential choice should have enough upstream reason and downstream realization to explain impact.

## Completeness without checklists

Completeness is contextual. Do not require one concept of every allowed type. Instead assess:

- required schema validity;
- traceability for accepted claims and obligations;
- unresolved questions that materially block a decision;
- contradictions or orphan responsibilities;
- applicable safety, accessibility, privacy, security, regulatory, operational, and human concerns;
- evidence proportional to risk and irreversibility.

A sparse coherent model is better than a complete-looking graph of placeholders.

## Canonical-change safety

- Preserve exact raw Markdown and producer extensions.
- Use reviewable proposals for edits, new concepts, relationships, and removals.
- Reassess diagnostics and directional impact before acceptance.
- Never silently widen Application scope.
- Never make a generated diagram, preview, or handoff canonical by editing the projection.
- Use version control for historical recovery; do not recreate generic lifecycle status.
