---
type: Code Contract
title: Semantic Theme Contract
description: Safe projection of accepted Visual Language tokens into M21 workspace variables and generated component previews.
tags: [code-design, contract, theme, design-system]
status: active
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

# Token classes

- Semantic color roles for canvas, surfaces, text, borders, accent, chrome, status, and contrast
- Interface and structured typography families
- Small, medium, and large shape radii
- Shared elevation shadow

# Invariants

- Only an active Visual Language may become the theme source.
- AI-generated tokens remain inert until their proposal is accepted.
- Values must pass the relevant color, font, radius, or shadow syntax check before application.
- Unknown tokens are preserved as design knowledge but ignored by unsupported consumers.
- Theme failure falls back to readable workspace defaults.
- The same accepted token source themes M21 and the generated component preview.
