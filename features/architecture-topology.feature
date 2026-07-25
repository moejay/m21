Feature: architecture-topology
  Architecture chooses actual owned Application boundaries independently from conceptual System Design responsibilities.

  Scenario: One full-stack Application may realize several System responsibilities
    Given two conceptual System Design responsibilities
    And one full-stack Application realizes both responsibilities
    When I list the Architecture Applications
    Then one owned Application is defined
    And it realizes both System Design responsibilities

  Scenario: An invalid Application scope never widens downstream knowledge
    Given product knowledge exists for several Applications
    When I request Components for an unknown Application
    Then no downstream artifacts are disclosed
