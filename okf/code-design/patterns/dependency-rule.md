---
type: Architecture Pattern
application-id: project-service
title: Application Dependency Rule
description: Semantic domain and application contracts remain independent of transport, persistence, browser rendering, and model-provider adapters.
tags: [code-design, pattern, dependency-inversion, architecture]
sdlc: [code-design, implementation]
code-design:
  section: patterns
  kind: dependency-rule
  namespace: workspace.architecture
  technology: [ports-and-adapters]
  visibility: public
relationships:
  - type: part-of
    target: /architecture/applications/project-service.md
  - type: informed-by
    target: /decisions/web-typescript-stack.md
---

# Rule

Dependencies point inward toward stable product-knowledge and application contracts:

1. Domain models and policies depend on no transport, filesystem, UI, or provider adapter.
2. Application coordination depends on domain contracts and explicit ports.
3. Adapters implement ports and translate external protocols.
4. Browser views consume semantic snapshots and commands rather than persistence structures.

# Consequences

- Model providers remain replaceable.
- OKF persistence can evolve without changing proposal semantics.
- Generated views stay deterministic pure projections where practical.
- Transport route changes do not redefine application operations.
- Tests exercise contracts with in-memory or deterministic adapters.

# Prohibition

Domain components do not import browser, server framework, filesystem, or vendor inference concerns. Convenience does not justify reversing the dependency direction.
