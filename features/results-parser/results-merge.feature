Feature: results-merge
  Merge normalized test results onto the parsed spec model.

  Scenario: Annotate matching scenarios with their status
    Given a spec with a feature "user-login" containing scenario "Successful login"
    And a results lookup marking "Successful login" as "passed"
    When results are merged onto specs
    Then the scenario "Successful login" has status "passed"

  Scenario: Match a feature to results by file path when names differ
    Given a spec feature whose file path matches a result's file path but whose feature name differs
    And another result whose name coincidentally matches the feature name
    When results are merged onto specs
    Then the scenario statuses come from the path-matched result, not the name-matched one

  Scenario: Scenario with no matching result gets null status
    Given a spec with a feature "user-login" containing scenario "Forgotten password"
    And a results lookup that has no entry for "Forgotten password"
    When results are merged onto specs
    Then the scenario "Forgotten password" has status null

  Scenario: Compute feature-level rollup and counts
    Given a spec feature with scenarios statuses ["passed", "failed"]
    When results are merged onto specs
    Then the feature testStatus is "failed"
    And the feature testCounts are passed 1 failed 1 total 2

  Scenario: Compute spec-level rollup across features
    Given a spec with one all-passing feature and one feature containing a failure
    When results are merged onto specs
    Then the spec testStatus is "failed"

  Scenario: Spec with no matching results has null test status
    Given a spec whose scenarios have no entries in the results lookup
    When results are merged onto specs
    Then the spec testStatus is null
    And the spec testCounts total is 0
