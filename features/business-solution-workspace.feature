Feature: business-solution-workspace
  Business Solution presents valid Solution-owned knowledge as expandable cards grouped by section and controlled type.

  Scenario: Singular area ownership selects Solution artifacts
    Given a Solution Capability is owned by the Solution area
    And a related Persona is owned by the Business area
    When I select the Business Solution main artifacts
    Then the Solution Capability is a main artifact
    And the Business Persona is not a Solution main artifact

  Scenario: Delivery mechanisms remain distinct controlled types
    Given Solution delivery includes a Human Service and a Digital Product
    When I group the Business Solution main artifacts
    Then the delivery section contains the Human Service type
    And the delivery section contains the Digital Product type

  Scenario: Invalid Solution metadata remains readable with diagnostics
    Given a Solution Option contains an unsupported Solution field
    When I open the project
    Then validation reports the unsupported Solution field
    And the readable Solution Option remains in the graph

  Scenario: A controlled Solution type must belong to its declared section
    Given a Solution Measure is placed in the Solution delivery section
    When I open the project
    Then validation reports the Solution type and section mismatch
