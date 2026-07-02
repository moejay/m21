---
name: feature-parser
description: Parses Gherkin .feature files — extracts feature names, scenarios, and Given/When/Then steps
group: foundation
tags: [parser, gherkin, feature-files, bdd]
depends_on: []
features: features/feature-parser/
---

# Feature Parser

Reads `.feature` files and extracts structured scenario data.

### Single file parsing

Parsing one `.feature` file extracts:

- **Feature name**: from the `Feature:` header line
- **Scenarios**: each `Scenario:` **or** `Scenario Outline:` block collects its name and steps. An outline is treated as one scenario — its example rows are not expanded into separate scenarios.
- **Steps**: lines starting with `Given`, `When`, `Then`, `And`, or `But`
- **Background**: a `Background:` block's steps are captured separately and are not counted as a scenario
- **Rule grouping**: scenarios written under a `Rule:` are still collected as scenarios of the feature; the `Rule:` line itself is not a scenario
- **Tags**: `@tag` lines are captured — those directly above `Feature:` as feature tags, those directly above a scenario as that scenario's tags
- **Raw content**: full file content preserved for display/editing
- **Filename**: base filename for identification
- **Relative path**: computed from a base path when one is provided

### Non-goals

- **Example expansion.** A `Scenario Outline` is not exploded into one scenario per `Examples` row. Full outline expansion — and matching each expanded row back to a test result — is out of scope for now.

### Directory parsing

Parsing a directory finds all `.feature` files in it and parses each, returning the collection. A directory that doesn't exist yields an empty collection (graceful degradation — never an error).

### Integration with spec-parser

The spec-parser parses the feature directory of each spec that declares a `features` path (resolved relative to the project root) and attaches the results to the spec.
