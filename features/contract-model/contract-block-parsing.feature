Feature: contract-block-parsing
  Parse machine-readable model and interface declarations from spec Markdown.

  Scenario: Parse model and interface blocks
    Given a spec body contains valid m21-model and m21-interface YAML blocks
    When its contract blocks are parsed
    Then entities and operations are normalized under the owning spec

  Scenario: Merge multiple blocks
    Given a spec body contains multiple model or interface blocks
    When its contract blocks are parsed
    Then declarations from every block are included in the owned contract

  Scenario: Preserve parsing when a block is malformed
    Given a spec body contains malformed contract YAML
    When its contract blocks are parsed
    Then spec parsing succeeds with a contract diagnostic
