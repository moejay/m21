---
type: Code Contract
application-id: browser-workspace
title: Visual Theme Composition Contract
description: Deterministic composition of accepted linked Visual Design CSS into isolated theme and component previews.
tags: [code-design, contract, theme, design-system]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: token-contract
  namespace: design.theme
  technology: [css-custom-properties]
  visibility: public
relationships:
  - type: part-of
    target: /architecture/components/workspace-shell.md
  - type: informed-by
    target: /experience/visual-language.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Composition

An accepted Visual Theme links one canonical CSS entry point. Local imports compose accepted foundation CSS in explicit CSS order. One inline `m21-css` block follows linked theme CSS. Component linked and inline CSS then follow the theme before effective component HTML and optional demonstration script.

# Invariants

- Only an accepted singularly owned Visual Theme may supply preview composition.
- Linked artifacts are revision-bearing canonical knowledge; composed CSS is disposable.
- Remote, escaping, missing, cyclic, or unsupported imports are diagnostic.
- Component specimens run in isolation and cannot restyle the workspace shell.
- Theme presence never styles M21 automatically; activation requires a separate explicit user action.
- Composition failure falls back to readable document/card presentation.
