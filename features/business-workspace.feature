Feature: business-workspace
  Business presents only its main OKF documents as simple expandable cards.

  Scenario: Show Business-tagged concepts as main artifacts
    Given a business goal is tagged for Business
    And a connected product capability is tagged only for Product
    When I select the Business main artifacts
    Then the business goal is a main artifact
    And the product capability is not a main artifact

  Scenario: Definition-layer registry concepts are not business documents
    Given the Business definition-layer registry concept
    When I select the Business main artifacts
    Then the definition-layer registry concept is not a main artifact
