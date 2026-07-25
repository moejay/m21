---
type: Definition Layer
title: Visual Design
short_title: Visual Design
stage: design
order: 30
description: Define the experience, brand, visual language, interaction patterns, and design system that realize the product.
tags: [sdlc, design, brand, visual-language, design-system]
status: active
sdlc: [design]
relationships:
  - type: informed-by
    target: /sdlc/business.md
  - type: informed-by
    target: /sdlc/product.md
  - type: supports
    target: /product/capabilities/product-design.md
---

# Purpose

Define how the product is understood, experienced, navigated, interacted with, and visually expressed. The stable layer and namespace identifier remains `design`.

# Defines

- Brand character, voice, and visual identity
- User journeys, flows, information architecture, screens, and states
- Interaction and content patterns
- Color, typography, spacing, shape, iconography, motion, and design tokens
- Design-system patterns and UI components
- Accessibility and inclusive-design constraints
- Story and component examples suitable for a generated design catalog or Storybook handoff

# Agent posture

Connect design to personas and product outcomes, expose missing upstream assumptions, enforce coherent visual and interaction language, and preserve accessibility as a constraint rather than a polish step.

# Workspace theming

When a project has an active Visual Language, M21 applies its safe semantic color, typography, shape, and elevation tokens to the workspace as a live dogfooded preview. M21 also generates a standalone HTML component catalog from active Component Story concepts. The OKF knowledge remains canonical; both the workspace theme and preview catalog are generated projections.
