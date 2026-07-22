Feature: reviewable-ai-guidance
  AI guidance produces explicit proposals while the user controls canonical knowledge.

  Scenario: AI guidance proposes rather than persists a graph change
    Given an OKF project containing an active vision
    And a configured development AI provider
    When I ask the agent to clarify the vision
    Then the agent returns a reviewable change proposal
    And the canonical vision remains unchanged

  Scenario: Accepted AI guidance becomes canonical knowledge
    Given an AI proposal to clarify an active vision
    When I accept the AI proposal
    Then the canonical vision contains the proposed clarification
