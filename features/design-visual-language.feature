Feature: design-visual-language
  Accepted visual-language knowledge can project safely into workspace and implementation handoffs.

  Scenario: Apply an active project's semantic theme
    Given an active visual language defines an accent theme token
    When I open the project
    Then the project theme uses the visual language as its source
    And the project theme exposes the accent token

  Scenario: Ignore theme metadata from an unaccepted visual language
    Given a draft visual language defines an accent theme token
    When I open the project
    Then no project theme is active

  Scenario: Generate a themed component preview from accepted design knowledge
    Given an active visual language defines an accent theme token
    And an active component story defines an actions preview
    When I generate the Visual Design component preview
    Then the preview contains the component story
    And the preview contains the active accent token

  Scenario: Generate and apply a theme as a reviewable Visual Design change
    Given an active visual language without a theme
    And an AI provider that proposes a semantic Visual Design theme
    When I ask the agent to generate the Visual Design theme
    Then the theme remains a reviewable proposal
    When I accept the proposal
    Then the accepted project uses the generated theme
