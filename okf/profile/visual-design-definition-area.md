---
type: Specification
title: Visual Design Definition Area Profile
description: Normative schema, artifact, composition, safety, and projection rules for shared Visual Design knowledge.
tags: [okf, visual-design, css, html, sandbox]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: metadata-profile
  visibility: public
relationships:
  - type: governs
    target: /sdlc/design.md
  - type: governs
    target: /architecture/components/definition-workspace.md
  - type: informed-by
    target: /profile/business-solution-definition-area.md
---

# Ownership and controlled schema

A managed Visual Design concept has singular `area: visual-design` ownership and one closed `visual-design` namespace.

- `direction`: Character and Feel, Visual Principle, Brand Direction, Imagery Direction
- `foundations`: Color System, Typography System, Spacing System, Layout System, Shape System, Border System, Elevation System, Motion System, Icon System
- `themes`: Visual Theme
- `components`: Visual Component
- `assets`: Font Asset, Icon Asset, Image Asset, Illustration Asset, Logo Asset
- `accessibility`: Visual Accessibility Rule
- `decisions`: Visual Design Decision

`section` is required. `css-source` is required for foundations and themes and optional for components. `html-source` is required for components; `script-source` is optional only there. `asset-source` is required for assets. Paths are absolute bundle-relative and media-constrained.

# Artifact and override contract

Linked artifacts are canonical and revision-bearing. One inline `m21-html` body block may replace linked component HTML. One inline `m21-css` block follows linked CSS. Additional blocks of the same kind are invalid; inline overrides never remove linked-source requirements.

Visual Theme CSS resolves local foundation imports in explicit CSS order. Component previews apply theme CSS, theme inline CSS, component CSS, component inline CSS, effective HTML, then optional demonstration script.

# Safety

HTML scripts, inline handlers, frames, executable URLs, remote loads, escaping paths, unsupported CSS imports, and CSS import cycles are diagnostic. Optional explicit scripts run only in a sandbox without same-origin, storage, credentials, opener, parent, or canonical mutation authority.

# Projection

Direction uses cards and quality boards. Foundations and themes use live CSS specimens. Components use an isolated catalog with canonical detail. Assets use media galleries. Accessibility combines rule cards and available automated evidence. Every section retains a document fallback. Theme presence alone never restyles M21.
