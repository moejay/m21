Feature: schema
  Export declared entities as JSON Schema.

  Scenario: Export project JSON Schema
    Given parsed specs contain a valid contract registry
    When the schema command runs
    Then it returns a JSON Schema document with qualified definitions

  Scenario: Refuse invalid contracts
    Given the contract registry has unresolved model references
    When the schema command runs
    Then it returns a non-zero result with contract diagnostics

  Scenario: Reject an unknown spec
    Given no spec matches the requested schema owner
    When the schema command runs
    Then it returns a non-zero result with a descriptive error
