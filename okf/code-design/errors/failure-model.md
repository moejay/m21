---
type: Error Model
application-id: project-service
title: Workspace Failure Model
description: Stable failure categories that preserve accepted state and give users actionable recovery evidence.
tags: [code-design, errors, reliability]
sdlc: [code-design, implementation]
code-design:
  section: errors
  kind: error-taxonomy
  namespace: workspace.failure
  technology: [problem-details]
  visibility: public
relationships:
  - type: part-of
    target: /architecture/components/project-coordinator.md
---

# Categories

- **Invalid input:** command shape or value cannot satisfy the operation contract.
- **Not found:** requested Concept, Application, proposal, or generated view source is unknown.
- **Conflict:** proposal is stale, already resolved, or incompatible with current accepted revision.
- **Unsafe path:** requested persistence target escapes the project bundle.
- **Provider failure:** external inference is unavailable, unauthorized, empty, or malformed.
- **Persistence failure:** accepted write cannot complete atomically.
- **Internal failure:** unexpected defect without safe domain classification.

# Invariants

Failures expose a stable category and useful message without leaking credentials or unsafe filesystem details. Failed commands do not partially mutate canonical knowledge. AI and generated-view failure do not prevent local project reading.
