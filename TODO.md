# TODO — improvement backlog

Ordered roughly by impact. Items 1–2 are security fixes and should land first.
Per the modspec workflow, each item flows through a spec/feature update before
implementation.

## 1. Fix path traversal in the write API (security)
`PUT /api/features/:spec/:filename` (src/server.js) decodes the filename with
`decodeURIComponent`, so an encoded slash (`%2F`) survives the `[^/]+` route
regex and escapes via `join(projectRoot, spec.features, filename)`. Same for
`POST /api/specs` with a `name` like `../../x`. Validate resolved paths stay
inside the expected directory; reject names/filenames containing separators.

## 2. Bind the dev server to localhost
`server.listen(port)` binds all interfaces; write endpoints have no auth, so
anyone on the LAN can write files (amplified by #1). Bind `127.0.0.1` by
default, add an opt-in `--host` flag.

## 3. Extract the client app out of the generator template string
src/generator.js is ~1,660 lines, mostly browser JS/CSS in a template literal —
unlintable, untestable directly. Tarjan SCC exists twice (src/cycles.js and
`analyzeGraphData` inside the string). Move client code to real files read at
generation time; share the graph-analysis code between CLI and client.

## 4. Make the generated HTML actually self-contained
Output loads d3 and marked from CDNs, so `--output` HTML breaks offline and
behind strict CSPs. Inline the minified bundles (d3 is already a devDependency)
or at minimum add SRI hashes + fallback.

## 5. Support real Gherkin: Scenario Outline, Background, Rule, tags
`parseFeatureFile` (src/parser.js) only matches `Scenario:` lines. Outlines get
zero scenarios parsed, so counts, `validate`, and the results overlay silently
miss them. Extend the parser or adopt `@cucumber/gherkin`; match results after
outline expansion.

## 6. Fix file-watching gaps and drop always-on polling
`featureDirs` is computed once at startup — feature dirs added later are never
watched until restart. `usePolling: true` at 100ms burns CPU. Re-derive watch
paths on spec change (`watcher.add(...)`); native FS events with polling as
opt-in fallback.

## 7. Match test results by more than feature name
`mergeResults` (src/results.js) keys solely on the feature display name — two
specs with a same-named feature absorb the same results; renaming a `Feature:`
line silently detaches results. Prefer matching by feature file path (Cucumber
JSON `uri`), fall back to name.

## 8. Add lint/format/type checking to CI
No ESLint/Prettier/type checking; CI only runs tests. Add ESLint + Prettier,
`// @ts-check` + `tsc --noEmit` over the existing JSDoc. Add
`engines: { "node": ">=20" }` to package.json (CI tests 20/22/24).

## 9. Define a proper programmatic API surface
`"main": "./src/parser.js"` is an accidental API. Add an `exports` map
(`"."`, `"./server"`, `"./generator"`, `"./results"`), document programmatic
usage in the README. Drop the invalid `"@moejay/modspec"` bin alias key.

## 10. Better HTTP error semantics and body limits
Malformed JSON bodies return 500 — should be 400. `readBody` has no size cap.
Cap body size (~1MB), validate payload shape before writing files, distinguish
client (4xx) from server (5xx) errors.

## Honorable mentions
- `modspec init` scaffolding subcommand (skills cover agents, not CLI users)
- Recursive spec-directory support (`parseSpecDirectory` reads one level)
- Dedupe `buildSpecFileMap`'s dynamic `import("fs/promises")` (src/server.js)
