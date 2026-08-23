---
type: Business Decision
title: Open-Source Personal Experiment
description: Test the approach as an open-source contribution across multiple lower-risk owned products and continue only when it produces clearly material personal value.
area: business
business:
  section: decisions
relationships:
  - type: informed-by
    target: /business/research/founder-maintainer-self-observation.md
    rationale: The experiment responds to a firsthand problem while recognizing the evidence is limited to one founder.
  - type: constrained-by
    target: /business/governance/lower-risk-initial-scope.md
    rationale: Weak initial evidence and false-authority risk require a bounded, reversible proving ground.
  - type: addresses
    target: /business/risks/portfolio-overfitting.md
    rationale: Testing across several products reduces single-product dependence without claiming broader generalization.
---

# Decision

Proceed with a bounded open-source experiment using several lower-risk software products owned by the founder-maintainer. Personal portfolio value is sufficient to justify the initial work; external adoption and revenue are not required.

# Evaluation

Continue when repeated use shows a clearly material improvement over asking coding agents to infer product context from repository artifacts and scattered sources. Relevant signals are:

- less effort to regain product understanding;
- fewer misleading conclusions from legacy artifacts;
- fewer corrections caused by missed known goals, rationale, or constraints;
- delivered behavior more consistently matching intent;
- clearer architectural consequences before implementation;
- knowledge upkeep costing less effort than it saves; and
- stale or conflicting knowledge becoming visible before it is trusted.

The founder may judge these signals qualitatively because the commitment is personal, lower-risk, and reversible.

# Evaluation method

Begin with one nontrivial maintenance change taken through the complete M21 loop: establish and accept sufficient product context, explain the software and its rationale, assess likely change impact, author and accept executable Gherkin behavior, hand the work to an external coding agent, ingest its execution results, and surface any discrepancy for operator action.

Repeat this loop across multiple owned products before judging whether M21 creates sustainable portfolio-wide value. Success on one change is useful evidence but is not enough to establish the broader personal-maintenance outcome.

# Stop conditions

Stop or change direction when results are only marginally better, worse than the current approach, or dependent on maintenance effort comparable to the benefit. Inability to expose stale authoritative knowledge is a critical failure.

# Alternatives and future options

The credible alternative is to continue asking coding agents to reconstruct context and manually correct misunderstandings. Improvements in general coding-agent capability may also reduce the problem independently.

Paid complementary tooling remains a future option only if open-source adoption supplies credible evidence of broader value. No commercial Business Model is accepted by this decision.
