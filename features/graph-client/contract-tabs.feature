Feature: contract-tabs
  Inspect machine-readable models and interfaces in the graph side panel.

  Scenario: Show owned entities
    Given a selected spec contains normalized entities
    When the Model tab is opened
    Then entity fields, types, requirements, constraints, and diagnostics are shown

  Scenario: Show semantic operations
    Given a selected spec contains normalized operations
    When the Interfaces tab is opened
    Then operation purpose, inputs, outputs, failures, and effects are shown

  Scenario: Show empty contract layers
    Given a selected spec has no machine-readable model or interfaces
    When its contract tabs are opened
    Then each tab explains that no declarations exist
