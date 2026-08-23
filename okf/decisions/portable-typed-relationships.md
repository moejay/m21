---
type: Decision
title: Extend OKF with Portable Typed Relationships
description: Use preserved OKF extension metadata for deterministic graph semantics while retaining ordinary Markdown portability.
tags: [decision, okf, graph, interoperability]
sdlc: [components, code-design, implementation]
relationships:
  - type: governs
    target: /profile.md
  - type: addresses
    target: /risks/false-impact-propagation.md
---

# Context

OKF 0.1 represents relationships through standard Markdown links and conveys their meaning through surrounding prose. M21 needs deterministic relationship types to validate traceability and reason about directional change impact.

# Decision

Store typed relationships in producer-defined frontmatter under `relationships`. Keep concepts valid OKF documents, preserve all unknown fields, and use ordinary Markdown links in indexes and useful body references for generic traversal.

The graph represented by concept documents and typed relationship metadata is canonical. Rich documents and diagrams are projections.

# Alternatives

## Infer relationship types from prose

Maximizes plain-OKF minimalism but makes validation and impact reasoning nondeterministic.

## Represent every relationship as a concept document

Keeps all information as concepts but creates excessive ceremony and obscures ordinary navigation.

## Maintain a separate graph database as canonical

Improves graph querying but weakens portability, version-control clarity, and OKF-native ownership.

# Consequences

- M21 must define and version a small relationship vocabulary.
- Generic OKF consumers can read concepts but may ignore richer semantics.
- Round-trip preservation is mandatory.
- Markdown references and typed metadata can drift unless tooling validates or generates supporting views.
- The profile must tolerate extension by future intelligence modules.
