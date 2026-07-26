---
type: Knowledge Model
title: M21 OKF Profile
description: Minimal OKF extensions for a typed, navigable product knowledge graph.
tags: [okf, graph, interoperability]
sdlc: [code-design, implementation]
---

# Purpose

M21 persists product knowledge as an Open Knowledge Format bundle. Standard OKF fields and Markdown remain readable without M21. This profile adds only the structure needed for deterministic graph relationships, ownership, lifecycle, and change impact.

A concept's stable identity is its bundle-relative file path without the `.md` suffix, following OKF.

# Extension fields

Concepts may add:

```yaml
owners: [person-or-team]
sdlc: [business, product, design] # zero or more definition-layer lenses
relationships:
  - type: realizes
    target: /vision.md
    rationale: Why this relationship exists.
```

`target` is an absolute, bundle-relative concept path. Migrated concepts use singular `area`; `sdlc` remains temporary compatibility for unmigrated areas. Concept lifecycle status is not part of the M21 profile. Unknown fields must be preserved when a document is read and written.

# Initial relationship vocabulary

- `realizes` — the source contributes to an outcome defined by the target.
- `part-of` — the source belongs to the target's conceptual whole.
- `serves` — the source exists for the target persona or stakeholder.
- `depends-on` — the source requires the target's contract or outcome.
- `informed-by` — the target influences the source without creating a hard dependency.
- `constrained-by` — the target limits valid forms of the source.
- `addresses` — the source responds to a risk, problem, or goal.
- `supports` — the source assists delivery of the target.
- `governs` — the source defines rules that apply to the target.

The vocabulary may evolve through explicit decisions rather than becoming an unrestricted set of near-synonyms.

# Change direction

Impact follows meaning rather than graph proximity.

If A `depends-on` or `realizes` B, a meaningful change to B may require review of A. An internal change to A does not imply that B changed unless A no longer satisfies B. `informed-by` relationships prompt contextual consideration, not automatic invalidation.

Impact analysis proposes review; it never silently rewrites related concepts.

# Portability

Typed relationships are canonical M21 metadata. Concept bodies and indexes use ordinary Markdown links so generic OKF consumers can still discover and traverse the knowledge. M21-specific consumers may provide richer filtering, validation, and impact reasoning.
