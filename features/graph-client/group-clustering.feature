Feature: group-clustering
  Draw convex hull overlays around specs sharing the same group.

  Scenario: Draw hull for specs in a group
    Given three specs have group "infrastructure"
    When the graph renders
    Then a convex hull polygon is drawn around those three nodes with a colored fill

  Scenario: No hull for single-member groups
    Given a group contains only one spec
    When the graph renders
    Then no hull is drawn for that group

  Scenario: Update hulls after node movement
    Given nodes can be manually moved when unlocked
    When a node in a group moves
    Then hull polygons are recalculated to follow node positions

  Scenario: Group label
    Given a group hull is drawn
    When the graph renders
    Then a text label with the group name is positioned at the hull centroid

  Scenario: Drag group label moves the group
    Given nodes are unlocked and a group label is visible
    When the user drags the group label
    Then every node in that group moves by the drag amount
    And the group hull follows the moved nodes
