Feature: okf-project-workspace
  M21 opens and safely changes portable OKF product projects.

  Scenario: Open an OKF project as a typed graph
    Given an OKF project containing a vision and a capability that realizes it
    When I open the project
    Then the project graph contains both concepts
    And the graph contains a realizes relationship from the capability to the vision

  Scenario: Preserve producer extensions when accepting a concept revision
    Given an OKF concept with an unknown producer extension
    When I propose and accept a revision to its description
    Then the revised description is persisted
    And the unknown producer extension is preserved

  Scenario: A proposal does not mutate canonical knowledge before acceptance
    Given an OKF project containing an accepted vision
    When I propose a revision to the vision
    Then the canonical vision remains unchanged
    And the proposal describes the pending revision

  Scenario: Reload an open project after an external file change
    Given an OKF project containing an accepted vision
    And I am watching the open project
    When the canonical vision file changes outside M21
    Then the open project publishes the changed vision
