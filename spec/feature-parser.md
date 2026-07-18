---
name: feature-parser
description: Parses Gherkin .feature files — extracts feature names, scenarios, and Given/When/Then steps
group: foundation
tags: [parser, gherkin, feature-files, bdd]
depends_on: []
features: features/feature-parser/
---

# Feature Parser

## Data model

### Feature document

A named behavioral capability with tags, optional background steps, scenarios, source identity, and preserved source content.

### Scenario

A named executable example with tags and an ordered sequence of Steps. A scenario outline remains one Scenario rather than expanding its examples.

### Step

A Given, When, Then, And, or But statement belonging to a background or Scenario.

```m21-model
entities:
  Step:
    fields:
      text: { type: string, required: true }
  Scenario:
    fields:
      name: { type: string, required: true }
      steps: { type: array, items: Step, required: true }
      tags: { type: array, items: string }
  FeatureDocument:
    fields:
      name: { type: string, required: true }
      scenarios: { type: array, items: Scenario, required: true }
      content: { type: string, required: true }
```

## Interfaces

### parse-feature

- Input: One Gherkin feature document and an optional base location
- Output: A normalized Feature document
- Failures: Unreadable source

### parse-feature-directory

- Input: A directory containing feature documents
- Output: All parseable Feature documents, or an empty collection when the directory is absent
- Effects: Reads documents without modifying them

```m21-interface
operations:
  parse-feature:
    output: FeatureDocument
    failures: [UnreadableFeature]
  parse-feature-directory:
    output: FeatureDocument
    failures: [UnreadableDirectory]
```

## Contract

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
