---
type: Business Problem
title: Context-Blind Software Changes
description: Humans and coding agents can implement changes without relevant accepted goals, rationale, or constraints.
area: business
business:
  section: problems
relationships:
  - type: affects
    target: /business/people/founder-maintainer.md
    rationale: The founder absorbs the rework, uncertainty, and maintenance consequences of changes made from incomplete context.
---

# Present condition

Software changes may be generated from only the context available in the immediate task or repository. Relevant goals, decision rationale, system restrictions, or scale requirements may be absent even when they are already known elsewhere.

Generative AI can amplify this condition because it can quickly produce additional work based on an earlier mistaken assumption. A locally plausible change can therefore become the basis for later decisions.

# Consequences

Possible consequences include delivered behavior that misses intent, undesirable architectural consequences, reduced software quality, and work that must be corrected or discarded after omitted context is rediscovered.

# Evidence and uncertainty

This is a founding hypothesis consistent with the founder-maintainer's experience, but no specific incident or measured frequency has yet been recorded. The case does not claim that every incorrect change is caused by missing context or that ordinary product learning is avoidable rework.

# Boundaries

Coding agents are operational participants, not the Business beneficiary. The affected people and organizations bear the cost and risk of their outputs.
