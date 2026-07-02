Feature: directory-parsing
  Parse all .feature files in a directory.

  Scenario: Parse all features in a directory
    Given a directory with three .feature files
    When the feature directory is parsed
    Then an array of three parsed feature objects is returned

  Scenario: Return empty array for nonexistent directory
    Given a path to a directory that does not exist
    When the feature directory is parsed
    Then an empty array is returned without throwing

  Scenario: Skip non-feature files
    Given a directory with .md, .txt, and .feature files
    When the feature directory is parsed
    Then only .feature files are parsed

  Scenario: Parallel parsing
    Given a directory with multiple .feature files
    When the feature directory is parsed
    Then all feature files are parsed without waiting on one another
