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
