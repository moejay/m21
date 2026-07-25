---
type: Product Capability
title: Continuous Graph Validation
description: Detect incomplete, inconsistent, risky, or untraceable product knowledge without forcing false completeness.
tags: [mvp, validation, risk, traceability]
status: draft
sdlc: [product, components, code-design, implementation, deployment]
product:
  section: capabilities
relationships:
  - type: part-of
    target: /product/mvp.md
  - type: realizes
    target: /business/coherent-product-understanding.md
  - type: realizes
    target: /business/capabilities/product-knowledge-governance.md
  - type: depends-on
    target: /product/capabilities/knowledge-graph.md
  - type: supports
    target: /product/capabilities/change-impact.md
---

# User outcome

A user can distinguish intentional uncertainty from accidental gaps and understand what deserves attention next.

# MVP checks

- Missing or broken relationships
- Concepts lacking required context for their type
- Capabilities with no user or business traceability
- Journeys, screens, or components disconnected from product intent
- Architecture responsibilities without realized capabilities
- Conflicting or superseded decisions still treated as active
- Violated constraints
- Undefined ownership where review is required
- Circular hard dependencies
- Unresolved or stale impact assessments

Cycles and incomplete concepts are not automatically errors. Validation explains why a structure may be problematic and allows explicit acceptance of intentional states.

# Acceptance outcomes

- Every diagnostic identifies affected concepts and supporting evidence.
- Validation distinguishes errors, risks, warnings, and open questions.
- The AI suggests possible resolutions without silently applying them.
