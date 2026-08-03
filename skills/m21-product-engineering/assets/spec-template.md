---
name: concern-name
description: Owns one concise durable responsibility.
group: domain
tags: [replace-me]
depends_on:
  - name: dependency-name
    uses: [dependency-capability]
features: features/concern-name/
---

# Concern Name

## Data model

Describe domain meaning, identity, ownership, relationships, valid states, and constraints. Delete this section if the concern owns no useful model.

```m21-model
entities:
  DomainConcept:
    identity: id
    fields:
      id: { type: string, required: true }
      value: { type: string, required: true }
```

## Interfaces

Describe stable semantic operations, inputs, outputs, failures, effects, and events. Delete this section if the concern provides no useful interface.

```m21-interface
operations:
  perform-domain-operation:
    purpose: State the domain outcome without naming transport or source symbols.
    input: DomainConcept
    output: DomainConcept
    failures: [InvalidDomainConcept]
    effects: [State the accepted domain effect]
```

## Contract

### Responsibilities

- State outcomes this concern owns.

### Non-goals

- State adjacent responsibilities this concern deliberately does not own.

### Invariants

- State what must always hold regardless of implementation.

### Decisions

- Record only deliberate accepted choices and why they constrain implementation.

<!--
Authoring rules:
- Replace all placeholder values; never commit filler.
- Keep sections in Data model → Interfaces → Contract order.
- Remove empty sections.
- Use domain language, not current files/classes/routes/tables.
- Reference cross-spec models only through declared dependencies.
- Make the `features` value a directory.
- Create actual features before declaring `uses` from another spec.
-->
