# TODO — improvement backlog

All ten items below are done, each routed through the M21 workflow
(spec/feature update first, then red/green). Commit hashes in `git log`.

## Done

1. **Path traversal in the write API** ✅ — resolved write paths are validated to
   stay inside the spec/features directory; separator-containing names rejected.
2. **Dev server binds localhost by default** ✅ — `127.0.0.1` unless `--host` is given.
3. **Client app extracted from the generator** ✅ (partial) — static CSS moved to
   `src/client/styles.css`, read at generation time. The client **JS** stays
   inline: it carries template-literal escaping and a `liveReload` interpolation
   that make a standalone extraction a separate, riskier change. *(Remaining:
   extract `src/client/app.js` by decoupling data/flags from code.)*
4. **Self-contained HTML** ✅ — d3 and marked are vendored (`vendor/`) and inlined;
   generated documents make zero external requests (render offline / strict CSP).
5. **Real Gherkin** ✅ — `Scenario Outline`, `Background`, `Rule`, and tags parsed.
   Example-row expansion is intentionally out of scope (documented in the spec).
6. **File-watching gaps** ✅ — feature directories referenced after startup are now
   added to the watcher. Polling is kept deliberately (recorded as a spec decision).
7. **Results matched by feature path** ✅ — join on Cucumber JSON `uri` when present,
   fall back to feature name.
8. **Lint + engines + CI** ✅ — ESLint flat config, `npm run lint`, CI lint step,
   `engines: node >=20`.
9. **Programmatic API surface** ✅ — `exports` map for parser/server/generator/
   results/cycles, invalid scoped bin alias dropped, README API section added.
10. **HTTP error semantics + body limits** ✅ — 400 for malformed JSON, 413 for
    oversized bodies, 1MB cap, shared error responder preserving genuine 500s.

## Remaining / future

- **Extract the client JS** (tail of item 3) — move `src/client/app.js` out of the
  generator template by injecting data + a `liveReload` flag as globals rather than
  compile-time interpolation, and dedupe the Tarjan SCC code shared with `src/cycles.js`.
- `m21 init` scaffolding subcommand (skills cover agents, not CLI users).
- Recursive spec-directory support (`parseSpecDirectory` reads one level).
- Greenfield spec-elicitation flow + handover-readiness check in the skill
  (discussed with the maintainer; not yet built).
