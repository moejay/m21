Feature: directional-change-impact
  Product changes create explainable review work only where relationship meaning supports it.

  Scenario: A capability contract change affects a realizing design concept
    Given a user journey realizes a product capability
    When I propose a contract change to the capability
    Then the proposal flags the user journey for review
    And the impact explains the realizes relationship path

  Scenario: An internal component change does not invalidate its product capability
    Given an architecture component realizes a product capability
    When I propose an internal change to the architecture component
    Then the proposal does not flag the product capability for review

  Scenario: Accepting a proposal persists the change and refreshes the graph
    Given an OKF project containing an accepted vision
    And I have proposed a revision to the vision
    When I accept the proposal
    Then the canonical vision contains the revision
    And the project revision changes
