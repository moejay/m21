Feature: model-validation
  Validate machine-readable model and interface declarations as one project registry.

  Scenario: Accept structurally valid contracts
    Given specs declare supported field types and resolvable model references
    When the contract registry is validated
    Then no contract errors are reported

  Scenario: Reject contract sections out of order
    Given a spec places Interfaces before Data model
    When the contract registry is validated
    Then a contract-section-order error is reported

  Scenario: Reject unsupported field types
    Given an entity field declares an unsupported structural type
    When the contract registry is validated
    Then an unsupported-type error identifies the owning spec and field

  Scenario: Reject unresolved model references
    Given a field or operation references an entity that does not exist
    When the contract registry is validated
    Then an unresolved-model-reference error is reported

  Scenario: Require dependencies for cross-spec references
    Given a spec references an entity owned by another spec without depending on it
    When the contract registry is validated
    Then a missing-model-dependency error is reported

  Scenario: Reject duplicate declarations
    Given multiple contract blocks in one spec declare the same entity or operation
    When the contract registry is validated
    Then a duplicate-contract-identifier error is reported
