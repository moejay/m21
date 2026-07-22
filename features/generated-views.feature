Feature: generated-project-summary
  Generated views are reproducible projections of canonical graph knowledge.

  Scenario: Generate a traceable Markdown project summary
    Given an OKF project containing a project, vision, and MVP capability
    When I generate the project summary
    Then the summary includes the project, vision, and capability titles
    And the summary references their canonical concept identifiers

  Scenario: Generate equivalent output from an unchanged graph
    Given an OKF project containing a project and vision
    When I generate the project summary twice without changing the graph
    Then both generated summaries are identical
