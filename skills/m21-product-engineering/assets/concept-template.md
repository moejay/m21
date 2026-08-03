# OKF concept proposal template

Adapt only to the active project's accepted schema. Delete unused fields; never invent placeholders.

```markdown
---
type: <controlled-type>
title: <human title>
description: <one-sentence meaning>
area: <owning-area>
application-id: <required only for accepted Application-scoped areas>

<area-namespace>:
  section: <controlled-section>
  # Only accepted fields with a current workspace use.

relationships:
  - type: <controlled-directional-type>
    target: /<bundle-relative-concept>.md
    rationale: <why this semantic connection exists>
    evidence:
      - /<bundle-relative-evidence-concept>.md
---

# Purpose

<What this concept means and why it matters.>

# Context and evidence

<Accepted facts, observations, provenance, limitations, and counterevidence.>

# Contract or decision

<Durable meaning appropriate to the owning area. Avoid downstream implementation detail.>

# Boundaries

<Included responsibility, explicit non-responsibility, assumptions, and constraints.>

# Failure, risk, or alternatives

<Only when meaningful for this concept. Preserve material rejected alternatives and consequences.>

# Open questions

<Material unknowns. If unresolved content is not accepted, keep it in the Change Proposal rather than manufacturing canonical truth.>
```

## Proposal summary

When presenting the draft for review, accompany it with:

```text
Owning area:
Contract maturity:
Why this is a first-class concept:
Accepted evidence:
Assumptions:
Relationships added/changed:
Downstream review needed:
Diagnostics or open questions:
```

## Authoring checks

- Title, description, and body are meaningful and non-empty.
- Type is controlled for the section.
- Area owns the meaning.
- Application ID is present only where required and resolves to one owned Application.
- Metadata contains no UI state or hypothetical fields.
- Relationships use exact accepted vocabulary and absolute bundle-relative paths.
- Rationale and evidence add information rather than restating the edge.
- Content distinguishes accepted fact from assumption or proposal.
- No generic concept status is present.
