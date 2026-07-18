---
name: contract-model
description: Parses, validates, and exports machine-readable data models and semantic interfaces embedded in M21 specs
group: foundation
tags: [contracts, data-model, interfaces, validation, json-schema]
depends_on: []
features: features/contract-model/
---

# Contract Model

## Data model

### Contract block

A fenced YAML document embedded in a Spec body and identified as either `m21-model` or `m21-interface`. A Spec may contain multiple blocks of either kind; their declarations contribute to one owned contract namespace.

### Entity

A named domain concept owned by one Spec. An Entity may declare an identity field, named Fields, and textual semantic constraints.

### Field

A named attribute with a type, required status, optional format, optional allowed values, and optional item or reference target. Supported structural types are `string`, `number`, `integer`, `boolean`, `object`, `array`, `enum`, and `reference`.

### Operation

A stable kebab-case semantic interface with optional purpose, input model reference, output model reference, expected failures, effects, and emitted or consumed events.

### Contract diagnostic

A severity, issue type, owner, and message describing malformed YAML, an invalid declaration, a duplicate identifier, an unresolved model reference, or an unsupported type.

### Contract registry

The Entities and Operations grouped by owning Spec, together with Contract diagnostics.

### Schema document

A language-neutral JSON Schema document whose definitions represent all structurally valid Entities in a Contract registry. Cross-entity references resolve through qualified definition names.

```m21-model
entities:
  ContractDiagnostic:
    fields:
      severity: { type: enum, values: [error, warning], required: true }
      type: { type: string, required: true }
      spec: { type: string, required: true }
      message: { type: string, required: true }
  Field:
    fields:
      type: { type: enum, values: [string, number, integer, boolean, object, array, enum, reference], required: true }
      required: { type: boolean }
      format: { type: string }
      values: { type: array, items: string }
      ref: { type: string }
  Entity:
    fields:
      identity: { type: string }
      fields: { type: object, required: true }
      constraints: { type: array, items: string }
  Operation:
    fields:
      purpose: { type: string }
      input: { type: string }
      output: { type: string }
      failures: { type: array, items: string }
      effects: { type: array, items: string }
      emits: { type: array, items: string }
      consumes: { type: array, items: string }
  ContractRegistry:
    fields:
      specs: { type: array, items: object, required: true }
      diagnostics: { type: array, items: ContractDiagnostic, required: true }
  SchemaDocument:
    fields:
      definitions: { type: object, required: true }
```

## Interfaces

### parse-contract-blocks

- Input: A Spec name and Markdown body
- Output: Its normalized Entities, Operations, and parse diagnostics
- Failures: Malformed blocks become diagnostics rather than aborting spec parsing
- Effects: None

### validate-contract-registry

- Input: Parsed Specs containing Entities and Operations
- Output: Contract diagnostics for invalid declarations and unresolved references
- Effects: None

### export-contract-registry

- Input: Parsed Specs and an optional owning Spec name
- Output: A stable machine-readable Contract registry
- Failures: Unknown requested Spec

### generate-json-schema

- Input: A structurally valid Contract registry and optional owning Spec name
- Output: A JSON Schema document containing the selected Entity definitions and their referenced definitions
- Failures: Invalid or unresolved model declarations are reported before generation
- Effects: None

```m21-interface
operations:
  parse-contract-blocks:
    purpose: Parse machine-readable model and interface declarations from Markdown.
    output: ContractRegistry
    failures: [MalformedContractBlock]
  validate-contract-registry:
    purpose: Validate declarations and references across parsed specs.
    input: ContractRegistry
    output: ContractDiagnostic
  export-contract-registry:
    purpose: Export stable normalized model and interface declarations.
    input: ContractRegistry
    output: ContractRegistry
  generate-json-schema:
    purpose: Generate language-neutral structural schemas.
    input: ContractRegistry
    output: SchemaDocument
```

## Contract

Contract blocks make M21's model and interface layers deterministic and enforceable while keeping surrounding Markdown human-readable. The block representation is language-neutral and is the source of truth for structural model constraints. Prose may explain meaning but cannot override a machine-readable declaration.

A local model reference uses an Entity name, such as `User`. A cross-spec reference uses `spec-name.Entity`. Cross-spec references require the owning Spec to declare a dependency on the referenced Spec. Entity and Operation identifiers are unique within their owning Spec.

Textual `constraints` preserve semantic rules that JSON Schema cannot express, but they are not claimed as mechanically enforced. Such rules require state declarations, executable features, or a future constraint language.

### Non-goals

- Inferring enforceable declarations from prose
- Generating source-language types directly in the core package
- Treating database schemas or ORM mappings as the canonical model
- Claiming that arbitrary textual constraints are runtime-enforced
