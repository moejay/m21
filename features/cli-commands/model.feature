Feature: model
  Export normalized machine-readable models and interfaces.

  Scenario: Export the complete registry as JSON
    Given parsed specs contain entities and operations
    When the model command runs with JSON output
    Then it returns every owned model and interface with diagnostics

  Scenario: Scope model output to one spec
    Given parsed contracts for multiple specs
    When the model command requests one spec
    Then only that spec's owned declarations are returned

  Scenario: Reject an unknown spec
    Given no spec matches the requested model owner
    When the model command runs
    Then it returns a non-zero result with a descriptive error
