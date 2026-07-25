Feature: sdlc-definition-flow
  Business-to-deployment layers guide work without becoming a one-to-one concept taxonomy or mandatory pipeline.

  Scenario: One concept participates in multiple definition layers
    Given a decision contributes to Product and System
    When I open the project
    Then the same decision appears in the Product definition view
    And the same decision appears in the System definition view
    And the project contains only one copy of the decision

  Scenario: A deeper definition layer remains available while upstream knowledge is incomplete
    Given a draft screen contributes to Visual Design
    And product definition remains incomplete
    When I open the Visual Design definition view
    Then the draft screen is available for work
    And the product definition diagnostic remains visible when relevant

  Scenario: The selected definition layer guides AI context
    Given an OKF project containing an active vision
    And an AI provider that records definition-layer context
    When I ask the agent in the Product layer to clarify the vision
    Then the AI provider receives Product as the definition-layer context
    And the agent returns a reviewable change proposal

  Scenario: Generated views follow the selected definition layer
    Given a draft screen contributes to Visual Design
    And a business goal contributes only to Business
    When I generate the project summary for Visual Design
    Then the summary includes the draft screen
    And the summary excludes the Business-only business goal
