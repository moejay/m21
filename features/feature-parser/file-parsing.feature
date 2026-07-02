Feature: file-parsing
  Parse a single Gherkin .feature file into structured data.

  Scenario: Extract feature name from header
    Given a .feature file starting with "Feature: user-login"
    When the feature file is parsed
    Then name is "user-login"

  Scenario: Extract scenarios and steps
    Given a .feature file with two Scenario blocks containing Given/When/Then steps
    When the feature file is parsed
    Then scenarios is an array of two objects, each with name and steps array

  Scenario: Capture And/But steps
    Given a scenario contains "And" and "But" steps after Given/When/Then
    When the feature file is parsed
    Then the And/But lines are included in the scenario's steps array

  Scenario: Preserve raw content
    Given any .feature file
    When the feature file is parsed
    Then the content field contains the full file text unchanged

  Scenario: Compute relative path from basePath
    Given basePath is provided in options
    When the feature file is parsed
    Then path is the file's location relative to basePath

  Scenario: Return filename
    Given a file at /project/features/auth/login.feature
    When the feature file is parsed
    Then filename is "login.feature"
