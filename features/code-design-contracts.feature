Feature: code-design-contracts
  Durable implementation contracts remain owned through Application and Component boundaries and are packaged for coding agents.

  Scenario: Scope Code Design through the owning Component
    Given an Application owns a Component with a Code Design contract
    When I scope Code Design to that Application
    Then the owned Code Design contract is displayed
    And the Component is not duplicated as a Code Design artifact

  Scenario: Every canonical Component declares executable Gherkin coverage
    Given the canonical M21 Component definitions
    When I inspect their executable feature sets
    Then every canonical Component references one or more existing Gherkin feature files

  Scenario: Derive Implementation testing from the selected Components
    Given a selected Application Component declares a Gherkin feature
    When I assemble the Application Implementation feature set
    Then the declared Component feature is required by Implementation

  Scenario: Provide the coding agent with the validated workspace specification
    When I open the project engineering SKILL
    Then it directs the agent to the M21 workspace spec
    And it requires specification, feature, test, and build validation
