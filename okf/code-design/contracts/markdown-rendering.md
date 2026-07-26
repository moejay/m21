---
type: Code Contract
application-id: browser-workspace
title: Canonical Markdown Rendering Contract
description: Safe rendering of canonical GFM and fenced Mermaid diagrams without changing source knowledge or graph semantics.
tags: [code-design, markdown, mermaid, security]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: rendering-contract
  namespace: workspace.markdown
  technology: [markdown, mermaid]
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/definition-workspace.md
  - type: constrained-by
    target: /experience/accessibility.md
---

# Input and output

Input is accepted canonical Markdown body text. Ordinary Markdown and GFM render as document content. A fenced `mermaid` block renders as a strict SVG diagram projection; invalid syntax renders an actionable visible failure with source available.

# Invariants

- Canonical Markdown source remains unchanged.
- Mermaid SVG, layout, interaction state, and generated identifiers are disposable.
- Mermaid security is strict and cannot execute arbitrary HTML or script.
- A diagram explains knowledge but never replaces typed relationships, concept identity, ownership, or validation.
- Ordinary code fences remain ordinary code.
- Rendering failure does not hide the rest of the concept body.
