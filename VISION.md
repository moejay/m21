# Vision

M21 is an experiment in higher-level software tooling: tools that help people build systems that stay maintainable, extensible, reliable, professional, clean, and understandable as they grow.

Most software tools focus on code after decisions have already been made. M21 starts earlier. It treats a project as a network of purposeful modules with explicit responsibilities, dependencies, and executable feature contracts. The goal is not to replace code, tests, or architecture judgment; it is to make those things visible, traceable, and easier to keep aligned.

## What M21 is trying to prove

A software project can be easier to understand and safer to change when its structure is captured in a small set of living artifacts:

- **Data models define meaning.** Each concern owns the domain concepts, relationships, states, and constraints that its interfaces use.
- **Interfaces define the surface.** Semantic operations, commands, queries, events, inputs, outputs, failures, and effects are explicit without depending on a programming language.
- **Specs describe intent.** The architectural contract explains what a concern is responsible for, what it depends on, and what it deliberately does not own.
- **Features demonstrate behavior.** Gherkin scenarios provide executable examples of observable interface behavior and evidence-backed guarantees.
- **Dependencies are explicit.** A concern should not just depend on another concern; it should say which behavioral capabilities it relies on.
- **The graph tells the truth.** The system shape should be explorable by humans and useful to tools.
- **Tests close the loop.** Passing scenarios make the spec executable instead of aspirational.

## Why this matters

Modern codebases often fail quietly. The code may still run, but the architecture becomes implicit, onboarding becomes oral tradition, tests drift from intent, and changes become risky because nobody can see the contracts between parts.

M21 aims to make those contracts durable. A maintainer should be able to open a project and quickly answer:

- What are the major concerns?
- Which domain concepts does each one own?
- Which interfaces does each one provide?
- What does each one promise and depend on?
- Which behaviors are covered by executable scenarios?
- Where are the risky or cyclic relationships?
- What is safe to change?

## Principles

### Understandable by default

The primary audience is a human maintainer. Specs should be readable without knowing the implementation language, framework, or current file layout.

### Contracts over vibes

Models give shared terms precise meaning. Interfaces make inputs, outputs, failures, and effects explicit. Dependencies should name the behavioral capabilities they use. A graph edge is more valuable when it says _why_ the relationship exists.

### Top-down change

Contract changes flow from data model to interfaces to architectural spec to executable features, and only then to tests and implementation. Unaffected layers are skipped, but downstream artifacts must not become the accidental source of truth for upstream contracts.

### Living documentation

Documentation should not be a separate graveyard. Specs, features, test results, and the graph should reinforce each other.

### Professional software hygiene

Clean boundaries, explicit responsibilities, reproducible tests, and visible risk are not enterprise ceremony. They are how small teams and solo builders keep leverage over time.

### Tooling for regeneration

A good spec should help rebuild the same behavior later, possibly in a different language or stack. M21 experiments with making that source of truth precise enough for humans and agents to work from reliably.

## The long-term direction

M21 starts with markdown specs, Gherkin features, dependency graphs, browser editing, static export, and test-result overlays. The larger direction is a workflow where architecture, behavior, tests, and implementation stay synchronized:

1. Describe each concern's data model and semantic interfaces.
2. Capture architectural intent, ownership, dependencies, and guarantees.
3. Visualize the relationships and risks.
4. Bind observable behavior to executable scenarios.
5. Use tooling and agents to evolve model → interfaces → spec → features → implementation in order.
6. Keep contracts, tests, and implementation from drifting apart.

The experiment succeeds if M21 helps builders move faster without making the system harder to understand later.
