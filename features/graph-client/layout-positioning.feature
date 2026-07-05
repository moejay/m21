Feature: layout-positioning
  Stable architecture-first positioning for spec nodes.

  Scenario: Initialize computed positions
    Given specs have been parsed into nodes and links
    When the graph initializes
    Then each node receives a finite computed position

  Scenario: Default top-down depth position
    Given a dependency chain crosses multiple depths
    When the graph initializes
    Then deeper dependents are above depth-0 dependencies

  Scenario: Reverse tree direction
    Given the graph has rendered with top-down depth positions
    When the user checks the reverse tree checkbox
    Then depth-0 dependencies are above deeper dependents

  Scenario: Groups control horizontal position
    Given multiple nodes share a group
    When the graph initializes
    Then grouped nodes are placed closer to each other than to nodes in other groups

  Scenario: Link endpoints follow positioned nodes
    Given dependency links between positioned nodes
    When the graph renders
    Then link SVG elements connect the positioned source and target nodes

  Scenario: Collision offsets separate neighbors
    Given nodes share the same depth and group
    When positions are computed
    Then the nodes have distinct positions instead of overlapping
