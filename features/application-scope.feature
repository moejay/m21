Feature: application-scope
  Architecture defines owned Applications; downstream definition layers remain scoped to one selected Application.

  Scenario: Discover selectable owned Applications
    Given two owned Applications realize System responsibilities
    When I list the Application scopes
    Then both owned Applications are selectable

  Scenario: Keep downstream knowledge inside the selected Application
    Given two owned Applications with separate Components
    When I scope Components to the Project Service Application
    Then only the Project Service Components are displayed
    When I move to Code Design with the same Application scope
    Then the Project Service Code Design remains displayed
    And the Browser Application internals remain excluded
