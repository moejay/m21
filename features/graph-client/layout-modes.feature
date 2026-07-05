Feature: layout-modes
  Present one default tree-and-groups layout with optional node locking.

  Scenario: Default tree-and-groups layout
    Given no layout mode is selected
    When the graph renders
    Then deeper dependents are arranged above depth-0 dependencies
    And nodes in the same group are placed near each other horizontally
    And force, tree, groups, and manual layout buttons are not shown

  Scenario: Nodes are unlocked by default
    Given the graph has rendered
    When the user drags a node
    Then the node moves to the cursor position
    And the node remains fixed at the dropped position

  Scenario: Lock nodes to prevent manual positioning
    Given the graph has rendered with nodes unlocked
    When the user checks the lock nodes checkbox
    Then dragging a node leaves it at its computed layout position

  Scenario: Re-lock nodes returns to computed layout
    Given a node has been manually moved while unlocked
    When the user checks the lock nodes checkbox
    Then nodes return to the tree-and-groups layout
