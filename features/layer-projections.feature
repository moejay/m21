Feature: purpose-built-layer-projections
  Each SDLC definition layer presents the shared OKF graph through an interface designed for that work.

  Scenario Outline: Select the appropriate projection for a definition layer
    Given the definition layer is <layer>
    When I choose its workspace projection
    Then the projection is <projection>

    Examples:
      | layer          | projection               |
      | business       | documents                |
      | product        | documents                |
      | design         | design-system            |
      | system         | grouped-topology         |
      | application    | application-architecture |
      | components     | component-dependencies   |
      | code-design    | contract-registry        |
      | implementation | implementation-handoff   |
      | deployment     | deployment-definition    |
