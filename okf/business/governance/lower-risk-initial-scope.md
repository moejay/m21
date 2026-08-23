---
type: Business Constraint
title: Lower-Risk Initial Scope
description: Initial evaluation is limited to lower-risk owned software where experimental failure has bounded consequences.
area: business
business:
  section: governance
relationships:
  - type: governs
    target: /business/decisions/open-source-personal-experiment.md
    rationale: The experiment should remain reversible and proportionate to its weak initial evidence.
---

# Constraint

Initial evaluation uses lower-risk software products owned by the founder-maintainer. The experiment does not initially claim suitability for safety-critical, heavily regulated, security-critical, or high-consequence customer-data systems.

# Rationale

The evidence base is limited and stale authoritative knowledge is a potentially serious failure. A lower-risk scope allows learning and stopping without exposing others to disproportionate harm.

# Consequence

Evidence from this scope cannot by itself justify claims about high-risk use. Any expansion into materially higher-risk domains requires separate evidence, constraints, accountability, and governance.
