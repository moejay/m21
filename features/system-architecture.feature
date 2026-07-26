Feature: system-design-workspace
  System Design presents conceptual responsibilities, information, flows, boundaries, and dependencies without choosing Application topology.

  Scenario: Singular area ownership selects controlled System concepts
    Given an owned System Responsibility is owned by System Design
    And an Application realizes that responsibility without System ownership
    When I select the System architecture artifacts
    Then the System Responsibility is displayed
    And the realizing Application is not a System architecture artifact

  Scenario: Boundary metadata distinguishes managed and external dependencies
    Given System Design contains a managed Logical Data Store and an external dependency
    When I select the System architecture artifacts
    Then the managed store retains its managed boundary
    And the external dependency retains its external boundary

  Scenario: First-class System Flows retain directed relationship detail
    Given a System Flow connects two System Responsibilities
    When I select the System architecture map
    Then the System Flow remains a first-class concept
    And the directed flow relationships are displayed

  Scenario: Application-shaped metadata is diagnostic in System Design
    Given a System Responsibility contains a runtime field
    When I open the project
    Then validation reports the unsupported System field
