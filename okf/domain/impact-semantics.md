---
type: Impact Policy
title: Directional Impact Semantics
description: Initial rules for determining when a change may require review elsewhere in the product graph.
tags: [impact, relationships, policy]
sdlc: [components, code-design, implementation, deployment]
relationships:
  - type: governs
    target: /product/capabilities/change-impact.md
  - type: addresses
    target: /risks/false-impact-propagation.md
  - type: informed-by
    target: /profile.md
---

# General rule

Impact follows changed meaning and relationship semantics, not every reachable edge. A finding means “review may be required,” not “the dependent concept is wrong.”

# Initial semantics

- **A realizes B:** a contract or outcome change in B may affect A; an internal change in A does not affect B while realization remains valid.
- **A depends-on B:** a relevant contract change in B affects A; unrelated internal changes in B do not.
- **A constrained-by B:** a change in B may invalidate A; a change in A affects B only if it challenges the constraint itself.
- **A informed-by B:** changes in B may be useful context but do not automatically invalidate A.
- **A part-of B:** structural changes may affect either side, but ordinary content edits remain local unless the whole's contract changes.
- **A supports B:** a change in B may require review of A's support; A changes remain local while support is preserved.
- **A serves B:** changed needs in B may affect A; changes in A do not redefine B.
- **A governs B:** changes in A may affect B directly.
- **A addresses B:** changed risk or goal B may affect A; A may change without changing B's definition.

# Propagation

Definite hard-contract impact may propagate one additional semantic step. Likely or possible findings do not automatically fan out. AI may propose further findings when content meaning supplies evidence, but each requires an explicit path and reason.

# Representative expectations

- Changing a business goal's desired outcome flags realizing product capabilities, then relevant journeys and architecture for review.
- Changing a capability's user-visible contract flags realizing journeys, screens, and architecture interfaces, not unrelated business goals.
- Changing visual spacing tokens flags conforming UI components and screens, not product capabilities.
- Replacing an internal persistence implementation creates no upstream impact when the OKF project contract remains satisfied.
