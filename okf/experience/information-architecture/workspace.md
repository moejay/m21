---
type: Information Architecture
title: Product Workspace Information Architecture
description: Organize M21 around focus, context, guidance, changes, and views rather than document folders.
tags: [information-architecture, workspace, navigation]
status: draft
sdlc: [design, application]
design:
  section: information-architecture
relationships:
  - type: part-of
    target: /product/capabilities/product-design.md
  - type: informed-by
    target: /experience/journeys/shape-idea.md
  - type: informed-by
    target: /experience/journeys/work-anywhere.md
  - type: informed-by
    target: /experience/journeys/review-impact.md
---

# Primary workspace areas

- **SDLC definition rail** — Business, Product, Design, System, Application, Components, Code Design, Implementation, and Deployment
- **Project navigator** — search, filters, layers, saved scopes, and unresolved attention
- **Graph canvas** — relationships, dependency direction, selection, and neighborhood exploration
- **Focus inspector** — canonical concept content, relationships, rationale, history, ownership, and status
- **Agent workspace** — contextual conversation, questions, challenges, and structured proposals
- **Change review** — semantic diff, impact findings, reviewer decisions, and acceptance
- **Views** — generated documents, diagrams, and reports

# Navigation model

The selected definition layer is the primary scope for concepts, graph context, diagnostics, AI guidance, and generated views. Concept types remain filters within that layer rather than replacing it.

Selection is shared across the canvas, navigator, inspector, and agent. Users can collapse context to focus, expand relationship paths, or switch to an audience-specific generated view without losing their place.
