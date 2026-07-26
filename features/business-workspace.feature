Feature: business-workspace
  Business presents valid Business-owned knowledge as expandable cards grouped by section and controlled type.

  Scenario: Singular area ownership selects Business artifacts
    Given a Business Outcome is owned by the Business area
    And a connected Solution Capability is owned by the Solution area
    When I select the Business main artifacts
    Then the Business Outcome is a main artifact
    And the Solution Capability is not a main artifact

  Scenario: Business cards retain section and type grouping
    Given Business people include a Persona and a Business Role
    When I group the Business main artifacts
    Then the people section contains the Persona type
    And the people section contains the Business Role type

  Scenario: Invalid Business metadata remains readable with diagnostics
    Given a Business Problem contains an unsupported Business field
    When I open the project
    Then validation reports the unsupported Business field
    And the readable Business Problem remains in the graph

  Scenario: A controlled Business type must belong to its declared section
    Given a Success Metric is placed in the Business people section
    When I open the project
    Then validation reports the Business type and section mismatch

  Scenario: Definition-area registry concepts are not Business documents
    Given the Business definition-area registry concept
    When I select the Business main artifacts
    Then the definition-area registry concept is not a main artifact
