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
- **Scenarios**: each `Scenario:` block collects its name and steps
- **Steps**: lines starting with `Given`, `When`, `Then`, `And`, or `But`
- **Raw content**: full file content preserved for display/editing
- **Filename**: base filename for identification
- **Relative path**: computed from a base path when one is provided

### Directory parsing

Parsing a directory finds all `.feature` files in it and parses each, returning the collection. A directory that doesn't exist yields an empty collection (graceful degradation — never an error).

### Integration with spec-parser

The spec-parser parses the feature directory of each spec that declares a `features` path (resolved relative to the project root) and attaches the results to the spec.
