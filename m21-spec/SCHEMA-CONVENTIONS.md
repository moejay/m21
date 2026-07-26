# Definition-Area Schema Conventions

## Purpose

Every canonical frontmatter field used by M21 must be explicitly documented and validated. Metadata remains minimal: a field is admitted only when the workspace has a defined use for it.

## Metadata admission rule

A field belongs in frontmatter only when all of the following are true:

1. It is canonical product knowledge rather than temporary UI state.
2. It has a clear workspace use now: projection, filtering, grouping, sorting, comparison, calculation, or an actionable validation diagnostic.
3. Its meaning, scalar shape, optionality, and allowed values or format can be defined precisely.
4. It is not better represented as narrative body content or as a first-class related concept.
5. Its value can be maintained without duplicating another canonical relationship or concept.

A possible future use is not sufficient. Candidate fields remain discussion notes until a concrete workspace behavior is accepted.

## Value placement

- Free human orientation: `title`, `description`, and Markdown body.
- Controlled semantic identity: `type`, `area`, and area `section`.
- Important atomic values used by the workspace: type-specific scalar metadata.
- Independently addressable knowledge with its own meaning, evidence, relationships, or revision boundary: a first-class concept.
- Semantic connection between concepts: a typed relationship.
- Filters, selection, camera position, expanded state, and temporary layout: workspace state, never concept metadata.

## Required schema documentation

Every accepted field must be recorded with:

| Attribute | Meaning |
|---|---|
| Path | Exact frontmatter path, such as `business.section` or `business.value`. |
| Applies to | Area, section, and controlled types allowed to use it. |
| Scalar shape | `string`, `number`, `integer`, `boolean`, `date`, `datetime`, `enum`, or a bounded list of one scalar shape. |
| Requirement | Required, optional, or conditionally required with the condition stated. |
| Allowed values or format | Closed enum, identifier grammar, date format, unit contract, or other validation rule. |
| Meaning | Domain meaning independent of presentation. |
| Workspace use | The exact projection, filter, comparison, calculation, or diagnostic consuming it. |
| Missing behavior | How the workspace behaves when an optional value is absent. |

If a field has no documented workspace use, it is not part of the schema.

## Validation policy — working direction

- M21-managed concepts must use a known controlled `type` allowed by their area and section.
- Area namespace fields are closed and validated; unknown fields produce a diagnostic rather than being silently interpreted.
- Imported producer extensions remain losslessly preserved for OKF portability, but preservation does not make them valid M21 area metadata.
- Required fields are kept to the minimum needed for correct interpretation.
- Missing optional fields are omitted, not filled with empty strings, null placeholders, or invented values.
- Conditional requirements are type-specific and must state the condition explicitly.
- Examples illustrate a schema but never define fields that are absent from the normative schema table.

## Area specification structure

Each Definition Area specification will contain, in order:

1. Controlled sections and controlled concept types
2. Minimal shared area schema
3. Type-specific schema tables
4. Relationship contracts
5. Section projection contracts
6. Workspace interactions
7. Validation and missing-data behavior
8. Guided questions and optionality

The future implementation may encode these contracts as JSON Schema or another machine-readable profile. The readable area specification remains the design record. The machine-readable representation and specification must be validated against each other so neither can drift silently.

## Deferred decision

Choose the machine-readable schema representation after at least the Business area schema is accepted. Do not design a universal metadata-to-widget language as part of that choice.
