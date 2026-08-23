---
type: Business Problem
title: Fragmented Product Context
description: Goals, rationale, constraints, feature knowledge, and system understanding are scattered across sources and difficult to recover as a coherent whole.
area: business
business:
  section: problems
relationships:
  - type: affects
    target: /business/people/founder-maintainer.md
    rationale: A founder returning to one of several products must reconstruct its purpose, behavior, and constraints before changing it safely.
---

# Present condition

Product context is distributed across Slack conversations, Linear tickets, specifications in Git, documents in Google Workspace, source code, and people's memory. Goals and decision rationale are especially likely to become disconnected from later work.

After time away, a maintainer may no longer know the product's feature set, how it works, or why previous choices were made. Recovering that understanding requires searching and interpreting several sources whose completeness and currency are uncertain.

# Consequences

Fragmentation increases context-recovery effort and makes it harder to predict whether a proposed change will preserve intent, respect constraints, or have acceptable architectural consequences. Missing context can contribute to incorrect implementation and avoidable correction work.

# Evidence and uncertainty

This problem is supported by limited firsthand experience from one founder-maintainer. Its prevalence, frequency, and cost across other teams have not been established.

# Boundaries

Distribution across tools is not inherently a problem. The undesirable condition is the inability to recover coherent, trustworthy meaning when decisions must be made.
