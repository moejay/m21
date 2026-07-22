Feature: continuous-graph-validation
  M21 explains structural and traceability problems without making readable projects unusable.

  Scenario: Report a broken typed relationship
    Given an OKF concept relates to a missing target
    When I open the project
    Then validation reports the broken relationship
    And the readable concept remains in the graph

  Scenario: Report an untraceable capability
    Given an OKF capability with no business or persona relationship
    When I open the project
    Then validation reports the capability traceability gap
