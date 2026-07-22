Feature: product-workspace
  Product presents only Product Capability artifacts as expandable canonical documents.

  Scenario: Show Product Capability artifacts
    Given a product capability is tagged for Product
    And a related business persona is tagged only for Business
    When I select the Product capability artifacts
    Then the product capability is displayed
    And the business persona is not displayed as a Product capability

  Scenario: Ignore non-capability concepts even if incorrectly tagged for Product
    Given a Product-tagged decision concept
    When I select the Product capability artifacts
    Then the decision is not displayed as a Product capability
