# M21

M21 is an AI-native product engineering workspace built around a shared, living [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) graph.

The product is being specified by dogfooding its own OKF project before and during implementation.

- [Browse the product knowledge](okf/index.md)
- [Read the vision](okf/vision.md)
- [Read the MVP definition](okf/product/mvp.md)
- [Read the system architecture](okf/architecture/systems/m21-workspace.md)

## First vertical slice

The current workspace can:

- Drive work through Business → Product → Visual Design → System Design → Architecture → Application Architecture → Components → Code Design → Implementation → Deployment
- Keep System Design conceptual, choose actual Application boundaries in Architecture, and scope downstream work to one owned Application
- Keep definition-layer participation many-to-many with concept types
- Open an OKF bundle as a typed graph
- Explore every accepted concept and typed relationship in one global interactive 3D knowledge graph
- Search, filter, navigate, and focus concepts
- Give AI guidance the selected definition layer and its contract as context
- Create reviewable direct-edit and AI proposals
- Explain deterministic directional impact
- Accept proposals into canonical OKF while preserving extensions
- Validate broken relationships and capability traceability
- Generate a traceable Markdown project summary

## Run the workspace

Requires Node.js 22 or newer.

```bash
npm install
npm run build
npm start -- okf --port 3333
```

Open <http://127.0.0.1:3333>.

For development with live reload:

```bash
npm run dev
```

Development uses one HTTP server. Vite runs as middleware inside the local project service rather than listening on a second port.

### AI provider

Without configuration, M21 uses a deterministic development provider so the proposal workflow remains testable. To use an OpenAI-compatible chat-completions provider:

```bash
export M21_AI_BASE_URL="https://provider.example/v1"
export M21_AI_API_KEY="..."
export M21_AI_MODEL="model-name"
npm start -- okf
```

AI output is always returned as a proposal; it is never persisted without explicit acceptance.

## Engineering contracts

- Product knowledge and architecture: [`okf/`](okf/index.md)
- Product-wide workflow, metadata, and authoring spec: [`spec/product-definition-workflow.md`](spec/product-definition-workflow.md)
- Regeneration-quality workspace implementation spec: [`spec/m21-workspace.md`](spec/m21-workspace.md)
- Executable behavior: [`features/`](features/)
- Project-local coding-agent skill: [`.agents/skills/m21-workspace/SKILL.md`](.agents/skills/m21-workspace/SKILL.md)

```bash
npx @moejay/m21 validate ./spec --json
npm test          # Gherkin scenarios and focused unit tests
npm run build     # Type checking and production browser build
```

The Product Definition Workflow spec defines Business through Architecture documents, frontmatter, body content, and agent assistance. The workspace implementation spec consumes that contract; Gherkin remains the executable behavior source.

## Global knowledge graph

Open **Global graph** from the workspace header to explore every accepted OKF concept and resolved typed relationship in one interactive 3D view. The graph is projected directly from the complete accepted Project Snapshot and does not create another persistence format or generated HTML artifact.
