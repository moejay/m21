---
type: Component
title: Graph Validation Engine
description: Evaluates structural validity, traceability, decisions, constraints, ownership, and unresolved impact.
tags: [architecture, component, validation, diagnostics]
status: draft
sdlc: [application, components, code-design, implementation]
system:
  kind: component
  group: project-service
components:
  application: project-service
  group: domain
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: realizes
    target: /product/capabilities/graph-validation.md
  - type: depends-on
    target: /architecture/components/graph-engine.md
---

# Responsibilities

- Run deterministic checks over a graph snapshot
- Return evidence-backed diagnostics without blocking readable partial projects
- Distinguish errors, warnings, risks, and open questions
- Allow intentional exceptions to be represented explicitly
- Support incremental reassessment after accepted changes

# Initial checks

The first vertical slice checks required OKF concept fields, duplicate IDs, malformed relationships, broken targets, and capabilities without business or persona traceability. Rich type-specific and semantic validation grows from dogfooded examples.
