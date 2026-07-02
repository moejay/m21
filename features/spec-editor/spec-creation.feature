Feature: spec-creation
  Create a new spec file from the browser.

  Scenario: Create a spec via POST
    Given a POST request to /api/specs with a name and optional fields
    When the request is processed
    Then a new spec file is created in the spec directory with the given frontmatter and body
    And 201 is returned with the new spec's name

  Scenario: Reject creation without a name
    Given a POST request to /api/specs with no name
    When the request is processed
    Then 400 is returned and nothing is written to disk

  Scenario: Reject a duplicate spec name
    Given a POST request naming a spec that already exists
    When the request is processed
    Then 409 is returned and the existing file is untouched

  Scenario: Reject a name that escapes the spec directory
    Given a POST request whose name contains path separators or parent references
    When the request is processed
    Then 400 is returned and nothing is written to disk
