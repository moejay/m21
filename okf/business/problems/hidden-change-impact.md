---
type: Business Problem
title: Hidden Cross-Disciplinary Change Impact
description: Teams cannot reliably see which product, design, or engineering knowledge a meaningful change may affect.
tags: [business, problem, change-impact]
area: business
business:
  section: problems
relationships:
  - type: affects
    target: /people/product-team.md
  - type: informed-by
    target: /risks/false-impact-propagation.md
---

# Problem

A business change may invalidate product, design, and architecture work, while many internal technical changes should remain local. Existing artifact boundaries hide this directionality, so teams either miss important impact or broadcast noisy review requests.

# Consequences

- Stale downstream assumptions
- Surprising implementation and release failures
- Unnecessary upstream review of internal changes
- Low trust in dependency and notification systems
