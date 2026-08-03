# Relationships, evidence, impact, and proposals

Use when connecting concepts, assessing change, representing uncertainty, or modifying accepted knowledge.

## Typed relationship model

The containing concept is the source. The target is an absolute bundle-relative Markdown concept path.

```yaml
relationships:
  - type: addresses
    target: /business/problems/fragmented-product-knowledge.md
    rationale: Explains why this response exists.
    evidence:
      - /business/research/team-interviews.md
```

Relationship semantics—not file location, graph proximity, folders, tags, or visual layout—drive traceability and impact.

## Relationship quality

A useful relationship answers:

- What directional claim does this edge make?
- Why does the source relate to this target?
- What evidence supports the claim when evidence matters?
- What would be affected if either endpoint changed?

Use the project's controlled vocabulary exactly. Do not invent synonyms because a label sounds better. When no accepted relationship expresses the meaning, raise a vocabulary proposal rather than encoding ambiguity.

## Common semantic families

These are reasoning families, not permission to bypass the project vocabulary:

- **Purpose/response:** addresses, serves, realizes, supports.
- **Structure/ownership:** part-of, contains.
- **Behavior/information:** source, destination, provides, consumes, carries, transforms.
- **Dependency:** depends-on.
- **Governance:** constrains, governs, decided-by.
- **Evidence:** informed-by, supported-by, challenged-by, measures.
- **People:** affects, plays-role, has-goal, has-need.

Check exact direction against the accepted profile. A relationship and its inverse UI label are not interchangeable in canonical frontmatter.

## Ownership versus connection

- One concept has one primary Definition Area.
- `part-of` expresses meaningful hierarchy, not necessarily Application scope.
- `application-id` is direct downstream Application ownership where the accepted scope contract requires it.
- `depends-on` creates context and impact; it never transfers ownership.
- Cross-area relationships make concepts visible contextually but do not make them primary in another workspace.
- Cross-Application dependencies expose deliberate public context, not provider-private internals.

## Evidence discipline

Distinguish:

- source provenance;
- observation;
- interpretation;
- confidence and limitations;
- contradictory evidence;
- decision made from evidence.

Evidence should support a claim through a relationship rather than being copied as an untraceable scalar. Do not overstate research. A small interview sample can reveal needs but may not establish prevalence. Analytics can reveal behavior but not motive by itself.

Ask:

- Who or what produced this evidence?
- When and under what conditions?
- What does it directly support?
- What alternative explanation exists?
- How representative and current is it?
- What decision would change if the evidence changed?

## Directional impact

Assess impact from relationship semantics and change meaning, not graph distance alone.

Useful change categories:

- **Editorial:** meaning and contracts unchanged.
- **Internal realization:** public/owned contracts remain satisfied.
- **Contract/outcome:** consumers, realizations, tests, or operating guarantees may need review.
- **Structural:** identity, ownership, relationship, Application boundary, or scope changes.

For a proposed change:

1. Identify the changed claim or contract.
2. Follow outgoing obligations and incoming consumers according to relationship meaning.
3. Include decisions, constraints, risks, evidence, and realization links that could invalidate or require review.
4. Distinguish “must change,” “must review,” and “context only.”
5. Avoid impact inflation from generic `depends-on` or proximity.
6. Re-run validation on the complete accepted-plus-proposed graph.

## Proposal discipline

A proposal should contain:

- stable identity and base accepted revision;
- concise summary and provenance;
- bounded operations;
- exact concepts and relationships affected;
- change meaning/category;
- impact findings with rationale;
- diagnostics, unresolved questions, and evidence;
- explicit acceptance control.

AI output, generated diagrams, previews, or suggested prose remain untrusted proposal input. They have no canonical persistence authority.

## No generic concept status

Accepted concepts present in the bundle are current. Unaccepted work remains a Change Proposal. Replacement uses explicit relationships and rationale; removal/history uses version control. Domain-specific states are valid only when their owning concept requires them and the workspace has a concrete use.

Do not create `draft`, `active`, `retired`, `selected`, or similar common concept metadata to simulate proposal or version-control state.

## Removal and identity changes

Before removing, moving, or changing stable identity:

- find all incoming and outgoing relationships;
- find downstream Application scope references;
- assess generated views, features, and external handoffs;
- preserve rationale or replacement where meaningful;
- perform atomic updates where partial acceptance would orphan knowledge;
- rely on version control for history.

## Review questions

- Is each edge directional and semantically controlled?
- Does rationale explain non-obvious meaning rather than restate the label?
- Is evidence attached to the claim it supports?
- Does any edge accidentally imply ownership?
- Are duplicate or inverse duplicate relationships present?
- Does the proposal preserve raw Markdown and producer extensions?
- Is impact proportional and explainable?
- Can the user see exactly what becomes accepted?
