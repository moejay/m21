Feature: markdown-preview
  Canonical concept Markdown supports safe explanatory Mermaid diagrams without changing graph semantics.

  Scenario: Recognize and preserve a Mermaid diagram
    Given a concept body contains a fenced Mermaid diagram
    When I inspect its Markdown preview content
    Then the Mermaid diagram source is recognized
    And the canonical Markdown source remains unchanged

  Scenario: Ordinary code fences remain ordinary code
    Given a concept body contains a fenced TypeScript example
    When I inspect its Markdown preview content
    Then no Mermaid diagram source is recognized
