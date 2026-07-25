---
type: Visual Language
title: M21 Visual Language
description: A calm, precise visual system that makes dense product knowledge
  approachable and trustworthy.
tags:
  - visual-language
  - design-system
  - accessibility
status: active
sdlc:
  - design
  - components
  - code-design
  - implementation
design:
  section: visual-language
  platforms:
    - web
    - cross-platform
  theme:
    canvas: "#f7f5f0"
    surface: "#fffefa"
    surface-muted: "#eeece6"
    text: "#20252c"
    muted: "#6b7077"
    border: "#d5d2ca"
    accent: "#3f4c83"
    accent-contrast: "#ffffff"
    chrome: "#252b35"
    chrome-text: "#f7f5f0"
    proposal: "#5e63b6"
    warning: "#b16a33"
    conflict: "#ad4949"
    success: "#3f7f72"
    font-sans: Manrope, system-ui, sans-serif
    font-mono: DM Mono, ui-monospace, monospace
    radius-small: 6px
    radius-medium: 10px
    radius-large: 16px
    shadow: 0 12px 36px rgba(31, 36, 43, 0.12)
relationships:
  - type: part-of
    target: /product/capabilities/product-design.md
  - type: informed-by
    target: /experience/principles/connected-context.md
  - type: constrained-by
    target: /experience/accessibility.md
---
# Character

M21 should feel like a focused working studio: intelligent without theatrical AI styling, technical without resembling an infrastructure dashboard, and structured without feeling bureaucratic.

# Foundations

- **Typography:** highly legible humanist sans for interface text; restrained monospace for identifiers, relationship types, and structured values
- **Color:** quiet neutral surfaces with type colors used sparingly for orientation; semantic status colors reserved for actionable meaning
- **Spacing:** compact enough for connected knowledge, with strong grouping and progressive disclosure to prevent density from becoming noise
- **Shape:** modest radii, crisp boundaries, and differentiated panels; graph nodes use shape or icon as well as color for type
- **Motion:** short explanatory transitions that preserve spatial context; respect reduced-motion preferences
- **Tone:** direct, curious, and evidence-oriented; avoid anthropomorphic hype and false certainty

# Graph language

- Selection is visually dominant over type decoration.
- Hard dependencies differ from informative relationships by line treatment and labels.
- Impact paths are highlighted temporarily rather than permanently coloring the entire graph.
- Uncertainty, proposal, accepted knowledge, and conflict have distinct non-color indicators.

# Initial tokens

The structured `theme` metadata defines the current safe semantic workspace projection: canvas, surfaces, text, border, accent, proposal, warning, and conflict. Raw values remain reviewable design knowledge rather than hard-coded workspace truth.

Additional token roles include elevated surface, focus, selection, success, and a categorical sequence for concept types. Storybook and coding-agent handoffs may generate platform-specific token files from these semantic values.
