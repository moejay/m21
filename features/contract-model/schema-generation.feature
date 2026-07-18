Feature: schema-generation
  Export M21 entities as language-neutral JSON Schema.

  Scenario: Generate schema definitions
    Given a valid contract registry with entities and constrained fields
    When JSON Schema is generated
    Then every entity has a qualified definition with required fields, formats, enums, and constraints represented where supported

  Scenario: Resolve entity references
    Given an entity field references a local or dependency-owned entity
    When JSON Schema is generated
    Then the field points to the referenced qualified definition

  Scenario: Scope schema to one spec
    Given a valid registry containing multiple specs
    When JSON Schema is generated for one spec
    Then its entities and transitively referenced entities are included
