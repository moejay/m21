---
type: Profile
application-id: project-service
title: Architecture Definition Area
description: Project-local schema and scoping contract for owned executable Application topology.
tags: [profile, architecture, applications, topology]
sdlc: [code-design]
code-design:
  section: contracts
  kind: workspace-contract
relationships:
  - type: constrains
    target: /sdlc/architecture.md
  - type: constrained-by
    target: /profile/definition-layer-frontmatter.md
---

# Ownership

Canonical Architecture concepts use `area: architecture` and one `architecture.section`. Controlled section/type pairs are overview/Architecture; applications/Application; communications/Application Communication; constraints/Architecture Constraint; risks/Architecture Risk; decisions/Architecture Decision.

# Applications

Every Application has a unique lowercase kebab-case `application-id`, a controlled `architecture.application-kind`, and boolean `architecture.independently-deployable`. Every downstream Application-scoped concept carries one valid `application-id`. Dependencies do not transfer ownership and an invalid scope never widens.

# Communications

Every Application Communication uses a controlled `architecture.communication-mode`: request-response, event, message, stream, batch, file, shared-store. Source and destination Applications, conceptual flows, information, trust, authority, qualities, failures, constraints, risks, and decisions remain typed relationships.

# Boundary

Architecture chooses Application portfolio topology and deployability. Application internals, source semantics, framework fields, infrastructure provisioning, environments, and rollout belong downstream.
