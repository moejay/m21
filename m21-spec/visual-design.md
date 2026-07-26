---
name: visual-design-definition-area
description: Working contract for the shared visual language, executable CSS foundations, HTML component specimens, assets, and visual accessibility.
group: definition-areas
tags: [visual-design, css, html, components, working-draft]
depends_on:
  - business-solution-definition-area
---

# Visual Design Definition Area

> Status: **Agreed initial contract.** Detailed renderer, sandbox, and media-format implementation remains deferred.

## Data model

### Purpose and boundary

Visual Design defines the shared visual language available to the complete Business Solution: character and feel, visual principles, brand expression, color, typography, spacing, layout, shape, borders, elevation, motion, iconography, imagery, themes, reusable visual components, visual assets, and visual accessibility rules.

Visual Design may contain executable CSS and safe HTML specimens so the workspace can render accepted design knowledge rather than only describe it. It remains independent of any particular Application.

Visual Design does not define Application navigation, journeys, screens, user flows, product behavior, system responsibilities, Application topology, or production source components. Application-specific Experience Design will consume this shared visual language after an Application exists.

### Minimal frontmatter

```yaml
type: Color System
title: M21 semantic colors
description: Shared semantic color roles for calm, precise product-definition work.
area: visual-design
visual-design:
  section: foundations
  css-source: /visual-design/styles/colors.css
```

`visual-design.section` selects the workspace projection. `css-source` and `html-source` are validated bundle-relative artifact paths admitted only for controlled types whose workspace presentation consumes them.

| Field | Applies to | Shape | Requirement | Workspace use | Missing behavior |
|---|---|---|---|---|---|
| `visual-design.section` | All Visual Design concepts | Closed section enum | Required | Selects grouping and primary projection | Concept cannot be treated as valid Visual Design knowledge |
| `visual-design.css-source` | CSS-backed foundation types and `Visual Theme`; optionally `Visual Component` | Absolute bundle-relative `.css` path | Required for CSS-backed foundations and themes; optional for components | Loads canonical CSS for specimens, theme composition, and component previews | Required source produces a diagnostic and no rendered specimen |
| `visual-design.html-source` | `Visual Component` | Absolute bundle-relative `.html` path | Required | Loads canonical component specimen markup and its visual states/variants | Diagnostic and document/card fallback |
| `visual-design.script-source` | `Visual Component` | Absolute bundle-relative `.js` path | Optional | Demonstrates specimen interaction when HTML/CSS alone is insufficient | Component remains renderable without scripted demonstration |
| `visual-design.asset-source` | `Font Asset`, `Icon Asset`, `Image Asset`, `Illustration Asset`, `Logo Asset` | Absolute bundle-relative path with type-appropriate media | Required | Loads the accepted asset into galleries, CSS, and previews | Diagnostic and metadata/card fallback |

Inline overrides do not make a required linked source optional. This preserves a stable reusable artifact while allowing a concept-local accepted override.

### Sections, controlled types, and presentation

| Section | Candidate controlled types | Primary presentation |
|---|---|---|
| `direction` | `Character and Feel`, `Visual Principle`, `Brand Direction`, `Imagery Direction` | Cards, quality/anti-quality board, and visual direction board |
| `foundations` | `Color System`, `Typography System`, `Spacing System`, `Layout System`, `Shape System`, `Border System`, `Elevation System`, `Motion System`, `Icon System` | Live visual specimens generated from accepted foundation CSS |
| `themes` | `Visual Theme` | Full theme preview and theme comparison |
| `components` | `Visual Component` | Rendered component catalog with canonical detail |
| `assets` | `Font Asset`, `Icon Asset`, `Image Asset`, `Illustration Asset`, `Logo Asset` | Asset gallery and detail cards |
| `accessibility` | `Visual Accessibility Rule` | Rule cards plus automated checks where evidence is available |
| `decisions` | `Visual Design Decision` | Decision cards |

The inventory is intentionally compact. New foundations or asset types require a concrete Visual Design workspace need.

### Direction responsibilities

`Character and Feel` is a first-class direction concept. It describes the qualities the product should evoke, qualities it should avoid, emotional tone, and rationale. It may reference example or counterexample assets, but it has no extra metadata until the workspace needs more than its title, description, body, and relationships.

Examples of useful body content include “calm, precise, trustworthy, quietly technical” and explicit anti-qualities such as “playful clutter, aggressive urgency, or decorative complexity.” The workspace presents these as a quality/anti-quality board rather than attempting to calculate them.

### Foundation responsibilities

| Foundation | What it defines | Workspace specimen |
|---|---|---|
| `Color System` | Semantic color roles, palettes, foreground/background pairings, accents, and status colors | Swatches, role pairings, and contrast evidence |
| `Typography System` | Local typefaces, text roles, font stacks, weights, sizes, line heights, and letter spacing | Type scale, paragraphs, labels, and hierarchy samples |
| `Spacing System` | Spacing rhythm, density, and recurring gaps | Spacing scale and density specimens |
| `Layout System` | Containers, grids, alignment, proportions, and shared layout primitives | Grid and container specimens |
| `Shape System` | Corner radii and recurring geometry | Shape specimens |
| `Border System` | Border widths, styles, semantic border roles, dividers, outlines, and focus-ring treatment | Border, divider, control-outline, and focus specimens |
| `Elevation System` | Shadows, overlays, and visual layering | Layer and shadow specimens |
| `Motion System` | Durations, easing, transition principles, and reduced-motion alternatives | Safe motion specimens with reduced-motion control |
| `Icon System` | Icon sizing, stroke/fill treatment, alignment, and visual consistency | Icon gallery across sizes and contexts |

A foundation is not mandatory merely because the type exists. Add one when the visual language needs it.

`Typography System` owns the CSS rules and semantic text roles. Actual local font files are linked `Font Asset` concepts when they need provenance, licensing, independent revision, or direct workspace inspection. The typography CSS uses bundle-local `@font-face` declarations and references those files; remote font loading is not required.

### Linked executable content with inline overrides

Linked bundle artifacts are the baseline executable source from the start.

A foundation concept points to CSS:

```yaml
visual-design:
  section: foundations
  css-source: /visual-design/styles/colors.css
```

A Visual Component points to HTML, may point to component-local CSS, and may include an optional demonstration script:

```yaml
visual-design:
  section: components
  html-source: /visual-design/components/primary-action.html
  css-source: /visual-design/components/primary-action.css
  script-source: /visual-design/components/primary-action.js
```

The script is omitted when HTML and CSS can demonstrate the specimen adequately.

Inline fenced content is an explicit override:

````markdown
```m21-html
<button class="primary-action" type="button">Accept proposal</button>
```

```m21-css
.primary-action {
  color: var(--color-on-accent);
  background: var(--color-accent);
}
```
````

Precedence is deterministic:

- One inline `m21-html` block replaces the linked HTML specimen for that concept.
- One inline `m21-css` block loads after the linked CSS and overrides it through normal CSS cascade rules.
- With no inline block, the linked artifact is used unchanged.
- Additional inline blocks of the same executable type are invalid because their precedence would be ambiguous.

Linked paths remain canonical even when an inline override is present. Paths are bundle-relative, must resolve inside the project bundle, and cannot be remote URLs. Missing, unreadable, or wrong-media-type artifacts produce diagnostics.

### Theme composition

A `Visual Theme` is the composed CSS entry point. Its linked CSS imports or otherwise composes accepted foundation CSS in explicit CSS order using bundle-local paths. This makes CSS itself the ordering contract instead of inventing ordering metadata.

For a component preview, the workspace applies sources in this order:

1. Linked Visual Theme entry CSS, including its local foundation imports.
2. Inline `m21-css` override on the Visual Theme, if present.
3. Linked component CSS, if present.
4. Inline `m21-css` override on the Visual Component, if present.
5. Linked component HTML, replaced entirely by inline `m21-html` when present.

Only accepted sources participate. Imports that are remote, escape the bundle, form unsupported cycles, or cannot be resolved produce diagnostics.

### Content placement

- `title`, `description`, rationale, usage guidance, and visual intent remain human-readable content.
- Linked CSS plus an optional inline CSS override is executable canonical content when the workspace uses it for specimens or themes.
- Linked HTML plus an optional replacing inline HTML override is executable canonical content when the workspace renders it in the component catalog.
- An optional linked script may demonstrate specimen behavior but does not define canonical Application behavior.
- A reusable visual element with its own meaning, guidance, relationships, or independent revision is a first-class Visual Component concept.
- Temporary preview settings and generated screenshots are not canonical.

Frontmatter stores only validated artifact paths, never duplicated CSS token values or HTML fragments.

## Interfaces

The Visual Design workspace is expected to:

- Group canonical concepts by `visual-design.section` and controlled type.
- Render foundation specimens from accepted CSS.
- Render Visual Component HTML with accepted foundation and component CSS.
- Show the source concept, rationale, and relationships beside every preview.
- Switch between document/card and rendered views without changing canonical content.
- Compare themes only when the theme contract defines deterministic composition.
- Surface CSS parse errors, missing variables, unsafe HTML, inaccessible contrast, and unavailable resources as diagnostics.
- Create reviewable proposals for CSS, HTML, prose, concepts, and relationships rather than directly accepting generated design output.

## Contract

### Rendering safety

Executable visual content is untrusted until accepted and remains untrusted at render time. Scripts are allowed only through the optional, explicit `script-source` of a Visual Component and execute inside the isolated preview. Script tags embedded in specimen HTML and inline event-handler attributes remain invalid so executable behavior is discoverable and separately reviewable.

The preview sandbox prevents unsafe URLs, uncontrolled external network loads, workspace or parent-page access, credentials, cookies, persistent storage, opener access, and mutation of the workspace shell. Script execution must be bounded and disposable. CSS must not escape the preview boundary or restyle M21 unless explicitly accepted as the active M21 theme through a separate controlled action.

### Components

A Visual Component defines shared visual appearance and specimen markup. Its default, hover, focus, active, disabled, selected, loading, error, success, and other relevant visual states and variants stay within the same Component concept and linked HTML specimen; they are not separate concepts in the initial model. Component CSS supplies visual state treatment, and an optional script may make state changes demonstrable.

A Visual Component does not define canonical Application behavior, data loading, business logic, or production framework code. Demonstration script behavior is illustrative unless a later Application Experience concept establishes the actual interaction contract. Application Experience Design may use a Visual Component in screens and interactions; implementation may realize it in any technology while preserving the accepted visual contract.

A tiny future-facing note: after explicit user selection, an accepted Visual Theme may optionally style M21's own workspace and make the project feel visually theirs. This is never automatic merely because CSS exists, and its implementation is deferred.

### Presentation

- Direction and decisions may use cards.
- Foundations require live specimens in addition to cards.
- Themes require a composed preview.
- Components require a catalog of sandboxed HTML/CSS specimens.
- Assets require a gallery appropriate to their media type.
- Accessibility combines rule cards with evidence-backed automated checks.

Every section retains a document/card fallback. Generated previews and screenshots are disposable projections.

### Deferred implementation detail

The exact supported CSS, HTML, JavaScript, font, image, icon, and import formats will be defined when the renderer is implemented. That work must preserve the source precedence, sandbox, ownership, and Visual-versus-Application behavior boundaries established here rather than weakening them for convenience.
