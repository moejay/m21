Feature: product-definition-workflow
  Product-wide definition work has explicit metadata, body, and agent-guidance contracts before Application-level specification begins.

  Scenario: Define the first five product-wide workflow layers
    Given the product-level definition workflow specification
    When I inspect the product-wide layer contracts
    Then the workflow orders Business, Product, Visual Design, System Design, and Architecture
    And every product-wide layer defines what it is, agent assistance, frontmatter, and body expectations
    And Visual Design retains the stable design metadata identifier
