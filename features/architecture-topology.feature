Feature: architecture-topology
  Architecture chooses stable owned Application boundaries and maps every owned System Responsibility into the simplest justified executable topology.

  Scenario: One full-stack Application may realize several System responsibilities
    Given two conceptual System Design responsibilities
    And one full-stack Application realizes both responsibilities
    When I list the Architecture Applications
    Then one owned Application is defined
    And it has a stable Application ID
    And it realizes both System Design responsibilities

  Scenario: Duplicate Application identity is diagnostic
    Given two owned Applications use the same Application ID
    When I open the project
    Then validation reports the duplicate Application ID

  Scenario: Migrated downstream knowledge requires direct Application scope
    Given a migrated Component has no Application ID
    When I open the project
    Then validation reports the missing downstream Application ID

  Scenario: Architecture communication retains controlled mode and direction
    Given two owned Applications communicate by event
    When I inspect the Architecture topology
    Then the Application Communication uses event mode
    And its source and destination relationships remain directed

  Scenario: An invalid Application scope never widens downstream knowledge
    Given product knowledge exists for several Applications
    When I request Components for an unknown Application
    Then no downstream artifacts are disclosed
