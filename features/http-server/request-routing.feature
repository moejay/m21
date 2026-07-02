Feature: request-routing
  Route incoming HTTP requests to appropriate handlers.

  Scenario: Serve HTML on GET /
    Given the server is running
    When a GET request hits /
    Then the generated HTML is returned with Content-Type text/html and Cache-Control no-cache

  Scenario: Serve HTML on GET /index.html
    Given the server is running
    When a GET request hits /index.html
    Then the same HTML response as / is returned

  Scenario: Serve specs JSON on GET /api/specs
    Given the server is running
    When a GET request hits /api/specs
    Then the current parsed specs are returned as JSON

  Scenario: Specs JSON carries test status when a results file is present
    Given the server is running with a Cucumber JSON results file
    When a GET request hits /api/specs
    Then each matched spec carries testStatus and its scenarios carry a status

  Scenario: Return 404 for unknown routes
    Given the server is running
    When a GET request hits an unrecognized path
    Then 404 Not found is returned as text/plain

  Scenario: Reject a malformed JSON body with 400
    Given the server is running
    When a PUT request carries a body that is not valid JSON
    Then 400 is returned and nothing is written to disk

  Scenario: Reject an oversized request body
    Given the server is running
    When a write request body exceeds the size limit
    Then 413 is returned and the body is not processed
