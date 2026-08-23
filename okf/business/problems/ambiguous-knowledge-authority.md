---
type: Business Problem
title: Ambiguous Knowledge Authority
description: Current decisions and historical residue coexist without a reliable way to tell which knowledge should govern new work.
area: business
business:
  section: problems
relationships:
  - type: affects
    target: /business/people/founder-maintainer.md
    rationale: The maintainer must decide whether repository artifacts still represent current intent before relying on them.
---

# Present condition

When a maintainer asks a coding agent to explain an existing product, the agent infers meaning from the artifacts it can see. Legacy code, comments, documents, generated material, and abandoned approaches can appear as authoritative as current decisions.

Later agent runs may build upon these legacy trails. Neither the maintainer nor the agent can safely assume that a plausible artifact represents accepted current knowledge.

# Consequences

Ambiguous authority increases the chance that obsolete assumptions will influence new work. It also makes context recovery slower because each source must be interpreted rather than trusted at face value.

# Evidence and uncertainty

The founder-maintainer has observed coding agents leaving legacy trails that later runs may treat as authoritative. No systematic baseline or frequency has been recorded.

# Boundaries

Historical knowledge remains valuable when clearly distinguished from current accepted knowledge. The problem is silent ambiguity, not the existence of history.
