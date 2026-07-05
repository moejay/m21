Feature: zoom-and-drag
  Navigate the graph via zoom, pan, and node dragging.

  Scenario: Zoom with scroll wheel
    Given the graph is rendered in the SVG
    When the user scrolls the mouse wheel
    Then the view zooms in or out around the cursor position

  Scenario: Pan by dragging background
    Given the graph is rendered
    When the user clicks and drags on the SVG background
    Then the view pans in the drag direction

  Scenario: Drag a node when unlocked
    Given nodes are unlocked for manual positioning
    When the user clicks and drags a node
    Then the node follows the cursor and stays at the dropped position

  Scenario: Drag does not trigger pan
    Given the user is dragging a node
    When the drag is in progress
    Then the background pan behavior does not activate
