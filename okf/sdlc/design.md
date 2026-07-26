---
type: Definition Area
title: Visual Design
short_title: Visual Design
stage: visual-design
order: 30
description: Define the shared visual direction, CSS foundations, themes, visual components, assets, and visual accessibility available to the complete Business Solution.
tags: [definition-area, visual-design, css, html, themes, components]
sdlc: [visual-design]
relationships:
  - type: informed-by
    target: /sdlc/business.md
  - type: informed-by
    target: /sdlc/product.md
  - type: supports
    target: /product/capabilities/product-design.md
---

# Purpose

Define the shared visual language independently of any one Application. Application journeys, navigation, screens, flows, interaction, and content behavior belong to Application Experience Design.

# Defines

- Character and feel, visual principles, brand, and imagery direction
- Color, typography, spacing, layout, shape, borders, elevation, motion, and icon systems
- Composed Visual Themes
- Shared Visual Components with sandboxed HTML/CSS specimens
- Local visual assets and visual accessibility rules

# Agent posture

Connect visual choices to accepted Solution context, ask what qualities and anti-qualities should be expressed, keep foundations coherent, challenge decorative or inaccessible choices, and avoid inventing Application behavior.

# Executable visual knowledge

Linked bundle-local CSS is canonical for foundations and themes. Visual Components link safe HTML, optional CSS, and optional sandboxed demonstration scripts. Inline fenced overrides have deterministic precedence. Accepted themes and specimens are rendered as disposable isolated previews; theme presence alone never restyles M21 automatically.
