---
type: Visual Theme
title: M21 Visual Theme
description: Composes the accepted M21 foundations into a calm, precise, trustworthy working studio.
tags: [visual-design, theme, css, composition]
area: visual-design
visual-design:
  section: themes
  css-source: /visual-design/styles/m21-theme.css
relationships:
  - type: supports
    target: /product/capabilities/product-design.md
  - type: informed-by
    target: /experience/foundations/feel.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Theme intent

The M21 Visual Theme composes accepted color, typography, spacing, shape, and motion foundations in explicit CSS import order. It should feel intelligent without theatrical AI styling, technical without resembling an infrastructure dashboard, and structured without becoming bureaucratic.

# Composition

The linked CSS is the canonical composition entry point. It imports bundle-local foundation CSS; no frontmatter token map duplicates those sources. Component CSS and concept-local inline overrides follow the theme through the accepted cascade order.

# Use

The theme drives isolated foundation and Visual Component previews. It does not automatically restyle the M21 workspace merely because it is accepted; that requires a separate explicit user action.
