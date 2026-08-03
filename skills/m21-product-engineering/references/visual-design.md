# Visual Design expert guide

Use for the shared product-wide visual language and its canonical executable specimens. In this repository, `m21-spec/visual-design.md` and `spec/visual-design-definition-area.md` are authoritative.

## Owns

Character and feel, visual principles, brand expression, color, typography and local fonts, spacing, layout, shape, borders, elevation, motion, iconography, imagery, themes, reusable Visual Components, assets, and visual accessibility rules.

## Does not own

Application journeys, service blueprints, navigation, screens, flows, content behavior, business logic, system responsibilities, Application topology, or production framework components.

## Expert stance

Act as a visual designer, design-system practitioner, CSS specialist, brand translator, and accessibility advocate. Translate intended qualities into coherent visual rules and executable evidence. Evaluate the complete system—not isolated attractive screens.

Challenge decoration without purpose, token inventories without semantic use, inaccessible pairings, remote or unsafe assets, and components that smuggle in Application behavior.

## Best practices

- Begin with intended qualities and anti-qualities before choosing styles.
- Define semantic roles before raw values: surface, text, accent, focus, success, warning, danger, spacing roles, type roles.
- Evaluate combinations and hierarchy, not isolated swatches or font sizes.
- Use a deliberate density and spacing rhythm.
- Treat focus, disabled, selected, loading, error, and reduced-motion states as first-class visual evidence within one Visual Component specimen.
- Keep local asset provenance, licensing, formats, and fallback behavior clear.
- Use linked bundle-local CSS/HTML as reusable canonical sources where the accepted profile requires them.
- Keep inline overrides bounded and deterministic; do not create competing sources of truth.
- Render untrusted specimens in isolated sandboxes with no workspace authority.
- Test contrast, non-color cues, zoom/reflow, focus visibility, text legibility, and reduced motion.
- Keep accepted themes opt-in; CSS presence alone must never restyle M21 or another host.

## High-value questions

### Direction

- What should the product feel like, and what must it avoid feeling like?
- Which Business and Solution qualities should be visible without words?
- What references are relevant, and what exactly should or should not be borrowed?
- Which qualities must survive across applications, media, density, and mode?

### Foundations

- Which semantic color roles are needed, and which pairings must pass contrast?
- What hierarchy should typography create? What languages and scripts must it support?
- What spacing rhythm communicates density and grouping?
- Which layout, shape, border, and elevation rules carry meaning rather than fashion?
- When does motion explain continuity or causality, and what is the reduced-motion equivalent?
- How do icons remain recognizable, labeled, and consistent across sizes?

### Themes

- What foundations compose the theme, in what explicit order?
- Is the theme a meaningful variant or merely a palette duplicate?
- What remains invariant across themes?
- How are missing variables, unsupported imports, or inaccessible combinations exposed?

### Components

- Is this visual pattern reused and independently meaningful?
- What variants and visual states belong in the same specimen?
- Which behavior is only illustrative, and which must be owned later by Application Experience?
- Can HTML and CSS demonstrate it without script?
- What guidance explains appropriate and inappropriate use?

### Assets and accessibility

- What is the source, license, intended use, and fallback?
- Does the design work without color, motion, imagery, or custom fonts?
- What happens at 200–400% zoom, narrow widths, long text, localization, or high contrast?
- Are focus and error treatments perceivable and distinguishable?

## Executable-artifact guardrails

- Sources are absolute bundle-relative paths and stay inside the bundle.
- Remote URLs, escaping paths, unsupported import cycles, inline event handlers, and hidden script execution are invalid.
- One inline HTML override replaces linked specimen HTML; one inline CSS override follows linked CSS.
- Component demonstration scripts are explicit, optional, isolated, and disposable.
- Generated SVG, screenshots, previews, and catalog state are projections, not canonical sources.

## Useful lenses—not required schemas

- Semantic design tokens and compositional design systems.
- Gestalt principles, typographic hierarchy, and information density.
- WCAG contrast, focus, reflow, text spacing, and motion criteria.
- Inclusive design and situational impairment.
- Progressive enhancement and resilient CSS.
- Content stress testing, localization, and theme comparison.

## Common failure modes

- Mixing app-specific navigation or screen behavior into shared Visual Design.
- Treating every token or state as a separate concept.
- Creating a “design system” that is only a palette.
- Depending on color alone for meaning.
- Auto-activating accepted theme CSS in the workspace.
- Running specimen scripts with same-origin or parent access.
- Confusing a Visual Component specimen with production source implementation.
- Ignoring asset licensing, fallback fonts, reduced motion, or content expansion.

## Strong outputs

A coherent Visual Design definition includes intentional direction, only the foundations needed, deterministic theme composition, inspectable component specimens, governed assets, and accessibility evidence. Every executable preview remains traceable to accepted source and has a readable document fallback.

## Handoff

Application Experience selects and uses shared Visual Design for one Application's interaction and content. Implementation may realize the visual contract in any technology. Neither may silently alter the shared theme or redefine its semantics.
