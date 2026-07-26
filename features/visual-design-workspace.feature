Feature: visual-design-workspace
  Accepted Visual Design knowledge projects linked executable artifacts into safe, traceable specimens.

  Scenario: Singular area ownership selects controlled Visual Design artifacts
    Given a Color System is owned by Visual Design with linked CSS
    And a legacy User Journey remains outside Visual Design ownership
    When I select the Visual Design main artifacts
    Then the Color System is a main artifact
    And the User Journey is not a Visual Design main artifact

  Scenario: Resolve linked foundation CSS into the project snapshot
    Given a Color System is owned by Visual Design with linked CSS
    When I open the project
    Then the Color System contains its accepted CSS artifact
    And the linked CSS contributes to the project revision

  Scenario: Apply deterministic inline CSS precedence
    Given a Visual Theme links foundation CSS and contains an inline CSS override
    When I compose the accepted Visual Theme
    Then linked theme CSS appears before the inline theme override

  Scenario: Render a Visual Component in an isolated specimen
    Given an accepted Visual Component links safe HTML and CSS
    And an accepted Visual Theme links foundation CSS
    When I render the Visual Component specimen
    Then the specimen contains the accepted component markup
    And the specimen applies theme CSS before component CSS
    And the specimen requires an isolated script sandbox

  Scenario: Unsafe component HTML falls back with a diagnostic
    Given a Visual Component links HTML containing an embedded script
    When I open the project
    Then validation reports unsafe Visual Component HTML
    And the readable Visual Component remains in the graph

  Scenario: Required linked artifacts are diagnostic when missing
    Given a Visual Component references a missing HTML source
    When I open the project
    Then validation reports the missing Visual Design artifact
