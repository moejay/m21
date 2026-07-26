Feature: global-knowledge-graph
  The global graph reveals the complete connected OKF product model independently from the active definition workspace.

  Scenario: Project all accepted OKF knowledge into one graph
    Given accepted OKF concepts span several product and Application layers
    When I project the global knowledge graph
    Then every accepted OKF concept appears exactly once
    And every resolved typed relationship appears exactly once
    And the projection retains the accepted source revision

  Scenario: Global graph scope is independent of the active workspace
    Given accepted OKF concepts span several product and Application layers
    When I open the global graph from a scoped Application workspace
    Then the global graph still contains knowledge outside that Application

  Scenario: Retain singular Definition Areas for highlighting
    Given accepted OKF concepts belong to Business and Solution areas
    When I project the global knowledge graph
    Then every area-owned graph node retains its Definition Area
    And highlighting Business does not remove Solution knowledge
