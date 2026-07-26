Feature: debug-mode
  Global debug mode exposes exact canonical source for inspection without changing accepted knowledge.

  Scenario: Preserve raw Markdown source in the project snapshot
    Given an OKF project containing an accepted vision
    When I open the project
    Then the vision exposes its exact raw Markdown file

  Scenario: Every visible Concept exposes its own source action in debug mode
    Given an OKF project containing an accepted vision
    And an accepted Business Goal is visible beside it
    When I open the project in global debug mode
    Then every visible Concept card offers a source action without expansion
    When I inspect the Business Goal source action
    Then the modal contains the exact raw Business Goal Markdown

  Scenario: Inspecting raw source does not mutate canonical knowledge
    Given an OKF project containing an accepted vision
    When I open the project in global debug mode
    And I inspect the raw vision Markdown
    Then the canonical vision remains unchanged
