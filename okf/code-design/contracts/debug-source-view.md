---
type: Code Contract
application-id: browser-workspace
title: Debug Source View Contract
description: Read-only global debug mode for inspecting the exact canonical Markdown of any visible Concept directly from its card or opened node.
tags: [code-design, debug, source, markdown]
sdlc: [code-design, implementation]
code-design:
  section: contracts
  kind: view-state-contract
  namespace: workspace.debug
  visibility: internal
relationships:
  - type: part-of
    target: /architecture/components/workspace-shell.md
  - type: depends-on
    target: /code-design/contracts/project-snapshot.md
---

# State

Debug mode is global browser workspace state. When enabled, every visible Concept card exposes a top-right `</>` source action without requiring expansion or focus. An opened graph node or focused inspector exposes the same action. Activating an action opens a modal containing that specific Concept's exact raw Markdown and canonical file path from the accepted Project Snapshot.

# Invariants

- Debug mode, modal state, scroll position, and formatting are non-canonical.
- Inspection never writes files, creates proposals, or changes selection ownership.
- A source action never toggles, expands, navigates, or otherwise activates its containing card or node.
- The modal source matches the selected Concept in the accepted snapshot revision and updates after watched file reload.
- Disabling debug mode closes the source modal.
- The modal is keyboard operable, dismissible, and does not hide source behind rendered Markdown.
