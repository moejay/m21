# M21 Definition-Area Specification

This directory is the working source for the next M21 product-definition model. Accepted areas drive incremental, coordinated updates to `spec/`, executable features, the OKF profile, canonical OKF knowledge, and implementation when the user explicitly authorizes that area. Business, Business Solution, Visual Design, System Design, and Architecture are migrated; later areas remain design work here until accepted.

## Working method

1. Process one Definition Area at a time.
2. Agree its purpose, ownership boundary, metadata, concept kinds, relationships, projections, interactions, validation, and guided questions.
3. Record unresolved choices rather than silently deciding them.
4. Update `PROGRESS.md` after every discussion.
5. Treat `CONTEXT.md` as the durable handoff for resuming the work.
6. Migrate only an explicitly authorized accepted area; do not infer that later areas are ready from earlier migrations.

## Files

- `CONTEXT.md` — durable decisions, terminology, constraints, and the complete area list.
- `SCHEMA-CONVENTIONS.md` — metadata admission, documentation, and validation rules.
- `PROGRESS.md` — status and checklist for every area.
- `<area>.md` — one root-level M21 specification per area as it enters discussion.

## Validation during redesign

The current `@moejay/m21` CLI does not understand the redesigned `area`, controlled-type, section, Application-scope, or projection contracts. Running it against this directory is at most a legacy-format parse check for recognizable frontmatter, dependencies, and fenced `m21-model` syntax. Its result is not evidence that the redesigned model is valid, and its missing-feature warnings are not actionable during this phase.

Until a shared profile validator covers every area, acceptance still means explicit user review plus consistency recorded here. The local M21 workspace now validates migrated Business, Solution, Visual Design, System Design, and Architecture schemas, stable Application scope, linked artifacts, and executable features; the published `@moejay/m21` validator remains only a legacy-format check for this directory.

## Status language

- **Not started** — only the area name and provisional description exist.
- **In discussion** — alternatives and working proposals are recorded; they are not final.
- **Agreed** — the user has approved the area's semantic contract.
- **Validated** — the complete set has been checked for consistency with adjacent areas and the global model.
