Feature: behavioral-capability
  State the durable observable capability and why its consumer can rely on it.

  Scenario: Demonstrate one valuable outcome
    Given an accepted domain precondition
    When a semantic action occurs
    Then an observable contract outcome holds
    And accepted invariants remain satisfied

# Authoring rules:
# - Use one lowercase kebab-case Feature name per file.
# - Match the filename to the Feature name.
# - Keep steps in domain language and independent of source/framework details.
# - Demonstrate public behavior or evidence-backed guarantees, not private helpers.
# - Add only scenarios worth preserving as regeneration contracts.
# - Place this file under the directory declared by the owning spec's `features:` field.
