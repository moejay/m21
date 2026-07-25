Feature: system-architecture
  System Design presents conceptual responsibilities, data boundaries, and typed links without choosing or exposing actual Application internals as primary nodes.

  Scenario: Show System architecture artifacts only
    Given an owned conceptual System subsystem
    And an Application realizes that subsystem without System membership
    When I select the System architecture artifacts
    Then the System subsystem is displayed
    And the realizing Application is not a System architecture artifact

  Scenario: Preserve typed links between System architecture documents
    Given two linked conceptual System parts
    When I select the System architecture map
    Then the System architecture link is displayed
