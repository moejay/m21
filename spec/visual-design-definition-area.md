---
name: visual-design-definition-area
description: Accepted shared Visual Design schema, linked executable artifacts, safe specimen rendering, themes, components, assets, and accessibility contract.
group: product-definition
tags: [okf, visual-design, css, html, sandbox]
depends_on:
  - business-solution-definition-area
---

# Visual Design Definition Area

This contract implements the accepted model in `m21-spec/visual-design.md`. It supersedes the former `design` layer's combined experience-and-visual model. Application journeys, navigation, flows, screens, interaction, and content behavior are not Visual Design artifacts.

## Data model

A Visual Design concept has singular `area: visual-design` ownership, exactly one `visual-design.section`, a controlled type allowed by that section, meaningful common fields, and non-empty Markdown body. Accepted concepts present in the bundle are current; unaccepted work remains a Change Proposal rather than a draft status.

```m21-model
entities:
  VisualDesignMetadata:
    fields:
      section: { type: enum, values: [direction, foundations, themes, components, assets, accessibility, decisions], required: true }
      css-source: { type: string }
      html-source: { type: string }
      script-source: { type: string }
      asset-source: { type: string }
  VisualArtifact:
    fields:
      role: { type: enum, values: [css, html, script, asset], required: true }
      path: { type: string, required: true }
      mediaType: { type: string, required: true }
      content: { type: string, required: true }
      encoding: { type: enum, values: [utf8, base64], required: true }
  VisualDesignConcept:
    fields:
      type: { type: string, required: true }
      title: { type: string, required: true }
      description: { type: string, required: true }
      area: { type: enum, values: [visual-design], required: true }
      visual-design: { type: object, required: true }
      artifacts: { type: array, items: VisualArtifact }
      relationships: { type: array, items: object }
      body: { type: string, required: true }
```

Controlled sections and types:

| Section | Controlled types |
|---|---|
| `direction` | `Character and Feel`, `Visual Principle`, `Brand Direction`, `Imagery Direction` |
| `foundations` | `Color System`, `Typography System`, `Spacing System`, `Layout System`, `Shape System`, `Border System`, `Elevation System`, `Motion System`, `Icon System` |
| `themes` | `Visual Theme` |
| `components` | `Visual Component` |
| `assets` | `Font Asset`, `Icon Asset`, `Image Asset`, `Illustration Asset`, `Logo Asset` |
| `accessibility` | `Visual Accessibility Rule` |
| `decisions` | `Visual Design Decision` |

The namespace is closed. `section` is always required. `css-source` is required for foundations and Visual Theme and optional for Visual Component. `html-source` is required for Visual Component; `script-source` is optional only there. `asset-source` is required only for asset types. Source values are absolute bundle-relative paths with role-appropriate media extensions.

A body may contain at most one fenced `m21-css` and one fenced `m21-html` block. Inline HTML replaces linked component HTML. Inline CSS follows linked CSS in cascade order. Required linked paths remain required when overrides exist.

## Interfaces

```m21-interface
operations:
  project-visual-design-workspace:
    purpose: Present accepted Visual Design concepts through direction boards, live foundation specimens, composed themes, sandboxed component catalog, asset galleries, accessibility evidence, decisions, and document fallbacks.
    effects: [Leaves canonical knowledge and ownership unchanged]
  resolve-visual-artifacts:
    purpose: Resolve validated bundle-local CSS, HTML, script, and media sources into immutable snapshot artifacts while retaining source paths and revision traceability.
    effects: [External artifact changes create a new project revision]
  compose-visual-theme:
    purpose: Resolve a Visual Theme's local CSS imports in explicit CSS order and apply its inline override after linked theme CSS.
    effects: [Produces a disposable CSS projection]
  render-visual-component:
    purpose: Render accepted theme CSS, component CSS, effective HTML, and optional demonstration script in an isolated disposable specimen.
    effects: [Cannot access or mutate the workspace shell or canonical knowledge]
  render-markdown-diagram:
    purpose: Render a fenced Mermaid block in canonical Markdown as a safe disposable diagram while preserving the source text.
    effects: [Leaves canonical Markdown unchanged]
```

## Contract

Linked artifacts are canonical and contribute to the project revision. Missing, unreadable, remote, escaping, wrong-media, cyclic, or unsafe sources produce diagnostics and a card/document fallback.

Theme and component precedence is deterministic:

1. Linked Visual Theme CSS and its resolved local imports.
2. Inline `m21-css` on the Visual Theme.
3. Linked Visual Component CSS.
4. Inline `m21-css` on the Visual Component.
5. Linked component HTML, replaced by inline `m21-html` when present.
6. Optional explicit linked demonstration script in the isolated preview.

Specimen HTML rejects embedded scripts, inline event handlers, unsafe URLs, external network resources, and parent/workspace access. Demonstration scripts run only in a sandbox without same-origin, storage, cookies, credentials, opener, or parent authority. Generated previews are disposable.

A Visual Component owns shared appearance, markup, visual states, and variants, not Application behavior, business logic, data loading, framework code, or production implementation. States remain in one component concept.

Canonical Markdown may contain fenced `mermaid` diagrams in any concept body. The preview renders them with strict security, reports invalid diagram syntax visibly, and never replaces or mutates the source block. Mermaid is explanatory body content, not a substitute for typed relationships or canonical concepts.

No foundation or component type is mandatory merely because it exists. Unknown namespace fields and empty placeholders are invalid but readable with diagnostics. An accepted theme does not automatically restyle M21; workspace theming requires a separate explicit user action.
