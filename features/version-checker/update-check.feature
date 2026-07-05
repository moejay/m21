Feature: update-check
  Check npm registry for newer versions of @moejay/m21.

  Scenario: Notify when update is available
    Given the current version is "0.2.1" and npm latest is "0.3.0"
    When the update check completes
    Then a message is logged: "Update available: 0.2.1 → 0.3.0"

  Scenario: Stay silent when up to date
    Given the current version matches the npm latest
    When the update check completes
    Then nothing is logged

  Scenario: Silently handle network errors
    Given the npm registry is unreachable
    When the update check runs
    Then no error is thrown and no output is produced

  Scenario: Abort after 3 seconds
    Given the registry response takes longer than 3 seconds
    When the timeout fires
    Then the fetch is cancelled and the function resolves silently

  Scenario: Read current version from package.json
    Given the tool locates its own package metadata regardless of the caller's working directory
    When the current version is read
    Then the version field from package.json is returned
