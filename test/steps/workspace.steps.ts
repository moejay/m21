import assert from "node:assert/strict";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { createServer as createNetServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { After, Before, Given, Then, When, setWorldConstructor, World } from "@cucumber/cucumber";
import YAML from "yaml";
import { DevelopmentAiProvider, type AiProvider, type AiSuggestion } from "../../src/application/ai.js";
import { ProjectService } from "../../src/application/project-service.js";
import { applicationScopes, definitionLayers, snapshotForApplicationLayer, snapshotForLayer, type DefinitionLayer } from "../../src/domain/definition-flow.js";
import { businessArtifacts, businessSection } from "../../src/domain/business.js";
import { solutionArtifacts, solutionSection } from "../../src/domain/solution.js";
import { componentFeatureFiles, mainArtifactsForLayer, productCapabilityArtifacts, projectionForLayer, systemArchitectureArtifacts, type ProjectionKind } from "../../src/domain/projections.js";
import { projectTheme, type ProjectTheme } from "../../src/domain/theme.js";
import { mermaidDiagrams, type MermaidDiagramSource } from "../../src/domain/markdown.js";
import { composeVisualTheme, renderVisualComponent, visualDesignArtifacts } from "../../src/domain/visual-design.js";
import { architectureArtifacts } from "../../src/domain/architecture.js";
import { systemBoundary } from "../../src/domain/system-design.js";
import { generateDesignPreview } from "../../src/domain/design-preview.js";
import { projectGlobalGraph, type GlobalGraphProjection } from "../../src/domain/global-graph.js";
import type { ChangeProposal, Concept, ProjectSnapshot } from "../../src/domain/model.js";

class M21World extends World {
  root = "";
  service?: ProjectService;
  snapshot?: ProjectSnapshot;
  proposal?: ChangeProposal;
  initialRevision?: string;
  summaries: string[] = [];
  aiProvider?: AiProvider;
  lifecycleSnapshot?: ProjectSnapshot;
  receivedStage: string | undefined = undefined;
  theme: ProjectTheme | undefined = undefined;
  definitionLayer: string | undefined = undefined;
  projection: ProjectionKind | undefined = undefined;
  mainArtifacts: Concept[] = [];
  productArtifacts: Concept[] = [];
  designPreview = "";
  systemArtifacts: Concept[] = [];
  systemSnapshot?: ProjectSnapshot;
  applicationScopes: Concept[] = [];
  applicationSnapshot?: ProjectSnapshot;
  engineeringSkill = "";
  canonicalComponents: Concept[] = [];
  invalidComponentFeatures: string[] = [];
  implementationFeatures: string[] = [];
  productDefinitionSpec = "";
  globalGraph?: GlobalGraphProjection;
  globalGraphSource?: ProjectSnapshot;
  scopedConceptIds: string[] = [];
  businessGroups = new Map<string, Set<string>>();
  solutionGroups = new Map<string, Set<string>>();
  solutionArtifacts: Concept[] = [];
  unwatch?: () => void;
  watchedSnapshot?: Promise<ProjectSnapshot>;
  visualArtifacts: Concept[] = [];
  composedTheme = "";
  visualSpecimen = "";
  visualSandbox = "";
  mermaidSources: MermaidDiagramSource[] = [];
  originalMarkdown = "";
  artifactRevisionChanged = false;
  debugRaw = "";
  debugSourceIds: string[] = [];
  architectureArtifacts: Concept[] = [];
  workspacePorts: number[] = [];
  workspaceProcesses: ChildProcessWithoutNullStreams[] = [];
  availableDefinitionAreas: DefinitionLayer[] = [];
}

setWorldConstructor(M21World);

Before(async function (this: M21World) {
  this.root = await mkdtemp(path.join(os.tmpdir(), "m21-feature-"));
});

After(async function (this: M21World) {
  this.unwatch?.();
  await Promise.all(this.workspaceProcesses.map(stopProcess));
  await rm(this.root, { recursive: true, force: true });
});

async function writeConcept(
  world: M21World,
  relativePath: string,
  metadata: Record<string, unknown>,
  body = "",
): Promise<void> {
  const destination = path.join(world.root, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `---\n${YAML.stringify(metadata).trimEnd()}\n---\n${body}`, "utf8");
}

async function writeArtifact(world: M21World, bundlePath: string, content: string): Promise<void> {
  const destination = path.join(world.root, bundlePath.replace(/^\//, ""));
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, "utf8");
}

async function open(world: M21World): Promise<ProjectService> {
  world.service ??= await ProjectService.open(world.root);
  world.snapshot = world.service.snapshot();
  world.initialRevision ??= world.snapshot.revision;
  return world.service;
}

async function activeVision(world: M21World): Promise<void> {
  await writeConcept(world, "vision.md", {
    type: "Vision",
    title: "Active Vision",
    description: "Original vision",
  }, "# Mission\n\nBuild a coherent product.\n");
}

async function availablePort(): Promise<number> {
  const server = createNetServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address === "object");
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForWorkspace(process: ChildProcessWithoutNullStreams, port: number, log: () => string): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null || process.signalCode !== null) {
      throw new Error(`Workspace on port ${port} exited during startup:\n${log()}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok) return;
    } catch {
      // The listener may not be ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Workspace on port ${port} did not start:\n${log()}`);
}

async function connectLiveReload(port: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}/`, "vite-hmr");
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error(`No live-reload connection on selected port ${port}`));
    }, 2_000);
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as { type?: string };
      if (message.type !== "connected") return;
      clearTimeout(timeout);
      socket.close();
      resolve();
    });
    socket.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error(`Live-reload connection failed on selected port ${port}`));
    });
  });
}

async function stopProcess(process: ChildProcessWithoutNullStreams): Promise<void> {
  if (process.exitCode !== null || process.signalCode !== null) return;
  process.kill("SIGTERM");
  const exited = once(process, "exit");
  const forced = new Promise<void>((resolve) => setTimeout(() => {
    if (process.exitCode === null && process.signalCode === null) process.kill("SIGKILL");
    resolve();
  }, 1_000));
  await Promise.race([exited, forced]);
}

Given("two local workspace instances use different selected ports", async function (this: M21World) {
  const first = await availablePort();
  let second = await availablePort();
  while (second === first) second = await availablePort();
  this.workspacePorts = [first, second];
});

When("I start both instances in development mode", async function (this: M21World) {
  const tsxCli = path.resolve("node_modules/tsx/dist/cli.mjs");
  for (const port of this.workspacePorts) {
    assert(port !== undefined);
    let output = "";
    const child = spawn(process.execPath, [tsxCli, path.resolve("src/server/main.ts"), this.root, "--port", String(port), "--dev"], {
      cwd: process.cwd(),
      env: process.env,
    });
    child.stdout.on("data", (chunk: Buffer) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { output += chunk.toString(); });
    this.workspaceProcesses.push(child);
    await waitForWorkspace(child, port, () => output);
  }
});

Then("both workspace APIs are available on their selected ports", async function (this: M21World) {
  const responses = await Promise.all(this.workspacePorts.map((port) => fetch(`http://127.0.0.1:${port}/api/health`)));
  assert(responses.every((response) => response.ok));
});

Then("each selected port provides its own live-reload connection", async function (this: M21World) {
  await Promise.all(this.workspacePorts.map(connectLiveReload));
});

Given("accepted concepts belong to Business, Business Solution, and Visual Design", async function (this: M21World) {
  await writeConcept(this, "business/outcome.md", { type: "Business Outcome", title: "Business outcome", description: "A represented Business area.", area: "business", business: { section: "outcomes" } }, "# Outcome\n\nAccepted Business knowledge.\n");
  await writeConcept(this, "solution/proposition.md", { type: "Solution Proposition", title: "Solution proposition", description: "A represented Business Solution area.", area: "solution", solution: { section: "proposition" } }, "# Proposition\n\nAccepted Solution knowledge.\n");
  await writeConcept(this, "visual-design/theme.md", { type: "Visual Theme", title: "Visual theme", description: "A represented Visual Design area.", area: "visual-design", "visual-design": { section: "themes", "css-source": "/visual-design/theme.css" } }, "# Theme\n\nAccepted Visual Design knowledge.\n");
  await writeArtifact(this, "/visual-design/theme.css", ":root { --surface: white; }\n");
});

Given("the bundle has no Definition Area registry documents", async function (this: M21World) {
  const service = await open(this);
  assert.equal(service.snapshot().concepts.some((concept) => concept.type === "Definition Area"), false);
});

When("I inspect the available Definition Areas", async function (this: M21World) {
  const service = await open(this);
  this.availableDefinitionAreas = definitionLayers(service.snapshot().concepts);
});

Then("Business, Business Solution, and Visual Design are available in the area navigation", function (this: M21World) {
  assert.deepEqual(this.availableDefinitionAreas.map((area) => area.id), ["business", "solution", "visual-design"]);
  assert.deepEqual(this.availableDefinitionAreas.map((area) => area.title), ["Business", "Business Solution", "Visual Design"]);
});

Then("unrepresented Definition Areas are absent from the area navigation", function (this: M21World) {
  assert.equal(this.availableDefinitionAreas.some((area) => area.id === "system" || area.id === "architecture"), false);
});

Given("two conceptual System Design responsibilities", async function (this: M21World) {
  await writeConcept(this, "systems/workspace.md", { type: "System Responsibility", title: "Workspace", description: "Presents accepted knowledge.", area: "system", system: { section: "responsibilities", boundary: "owned" } }, "# Responsibility\n\nPresent accepted knowledge.\n");
  await writeConcept(this, "systems/runtime.md", { type: "System Responsibility", title: "Runtime", description: "Maintains accepted knowledge.", area: "system", system: { section: "responsibilities", boundary: "owned" } }, "# Responsibility\n\nMaintain accepted knowledge.\n");
});

Given("one full-stack Application realizes both responsibilities", async function (this: M21World) {
  await writeConcept(this, "architecture.md", { type: "Architecture", title: "Architecture", description: "One full-stack boundary.", area: "architecture", architecture: { section: "overview" } }, "# Topology\n\nOne Application is sufficient.\n");
  await writeConcept(this, "applications/full-stack.md", { type: "Application", title: "Full-Stack Application", description: "Owns browser and project responsibilities.", area: "architecture", "application-id": "full-stack", architecture: { section: "applications", "application-kind": "full-stack", "independently-deployable": true }, relationships: [{ type: "part-of", target: "/architecture.md" }, { type: "realizes", target: "/systems/workspace.md" }, { type: "realizes", target: "/systems/runtime.md" }] }, "# Application\n\nOne executable boundary.\n");
});

Given("product knowledge exists for several Applications", async function (this: M21World) {
  await writeConcept(this, "applications/one.md", { type: "Application", title: "One", description: "First Application.", area: "architecture", "application-id": "one", architecture: { section: "applications", "application-kind": "web-client", "independently-deployable": true } }, "# Application\n\nFirst boundary.\n");
  await writeConcept(this, "applications/two.md", { type: "Application", title: "Two", description: "Second Application.", area: "architecture", "application-id": "two", architecture: { section: "applications", "application-kind": "backend-service", "independently-deployable": true } }, "# Application\n\nSecond boundary.\n");
  await writeConcept(this, "components/one.md", { type: "Component", title: "One Component", "application-id": "one", sdlc: ["components"], components: { section: "components", kind: "module", features: ["features/architecture-topology.feature"] }, relationships: [{ type: "part-of", target: "/applications/one.md" }] });
});

Given("a selected Application Component declares a Gherkin feature", async function (this: M21World) {
  await writeConcept(this, "applications/service.md", { type: "Application", title: "Service", sdlc: ["architecture", "application", "implementation"], architecture: { section: "applications", kind: "backend-service" }, application: { section: "architecture" } });
  await writeConcept(this, "components/engine.md", { type: "Component", title: "Engine", sdlc: ["components", "implementation"], components: { section: "components", kind: "domain-service", features: ["features/engine.feature"] }, relationships: [{ type: "part-of", target: "/applications/service.md" }] });
});

Given("accepted OKF concepts span several product and Application layers", async function (this: M21World) {
  await writeConcept(this, "business/outcome.md", { type: "Business Outcome", title: "Outcome", description: "A measurable business result.", area: "business", business: { section: "outcomes" } }, "# Outcome\n\nCreate a coherent result.\n");
  await writeConcept(this, "product/capability.md", { type: "Product Capability", title: "Capability", sdlc: ["product"], product: { section: "capabilities" }, relationships: [{ type: "realizes", target: "/business/outcome.md" }] });
  await writeConcept(this, "systems/runtime.md", { type: "System Service", title: "Runtime", sdlc: ["system"], system: { kind: "subsystem", boundary: "owned" }, relationships: [{ type: "realizes", target: "/product/capability.md" }] });
  await writeConcept(this, "applications/service.md", { type: "Application", title: "Service", sdlc: ["architecture", "application"], architecture: { section: "applications", kind: "backend-service", runtime: ["nodejs"], deployable: true }, application: { section: "architecture" }, relationships: [{ type: "realizes", target: "/systems/runtime.md" }] });
  await writeConcept(this, "components/engine.md", { type: "Component", title: "Engine", sdlc: ["components"], components: { section: "components", features: ["features/global-knowledge-graph.feature"] }, relationships: [{ type: "part-of", target: "/applications/service.md" }] });
});

Given("the product-level definition workflow specification", async function (this: M21World) {
  this.productDefinitionSpec = await readFile(path.join(process.cwd(), "spec/product-definition-workflow.md"), "utf8");
});

Given("the canonical M21 Component definitions", async function (this: M21World) {
  const project = await ProjectService.open(path.join(process.cwd(), "okf"));
  this.canonicalComponents = project.snapshot().concepts.filter((concept) => concept.type === "Component");
});

Given("an Application owns a Component with a Code Design contract", async function (this: M21World) {
  await writeConcept(this, "applications/service.md", { type: "Application", title: "Service", sdlc: ["architecture", "application", "components", "code-design"], architecture: { section: "applications", kind: "backend-service" }, application: { section: "architecture" } });
  await writeConcept(this, "components/engine.md", { type: "Component", title: "Engine", sdlc: ["components"], components: { section: "components", kind: "domain-service", group: "domain", layer: "domain" }, relationships: [{ type: "part-of", target: "/applications/service.md" }] });
  await writeConcept(this, "contracts/snapshot.md", { type: "Code Contract", title: "Snapshot Contract", sdlc: ["code-design"], "code-design": { section: "contracts", kind: "immutable-snapshot" }, relationships: [{ type: "part-of", target: "/components/engine.md" }] });
});

Given("two owned Applications realize System responsibilities", async function (this: M21World) {
  await writeConcept(this, "systems/knowledge.md", { type: "System Service", title: "Knowledge Workspace", sdlc: ["system"], system: { kind: "subsystem", boundary: "owned" } });
  await writeConcept(this, "systems/runtime.md", { type: "System Service", title: "Knowledge Runtime", sdlc: ["system"], system: { kind: "subsystem", boundary: "owned" } });
  await writeConcept(this, "applications/browser.md", {
    type: "Application", title: "Browser Workspace", sdlc: ["architecture", "application", "components", "code-design"], architecture: { section: "applications", kind: "web-client" }, application: { section: "architecture" }, relationships: [{ type: "realizes", target: "/systems/knowledge.md" }],
  });
  await writeConcept(this, "applications/project-service.md", {
    type: "Application", title: "Project Service", sdlc: ["architecture", "application", "components", "code-design"], architecture: { section: "applications", kind: "backend-service" }, application: { section: "architecture" }, relationships: [{ type: "realizes", target: "/systems/runtime.md" }],
  });
});

Given("two owned Applications with separate Components", async function (this: M21World) {
  await writeConcept(this, "applications/browser.md", { type: "Application", title: "Browser Workspace", sdlc: ["architecture", "application", "components", "code-design"], architecture: { section: "applications", kind: "web-client" }, application: { section: "architecture" } });
  await writeConcept(this, "applications/project-service.md", { type: "Application", title: "Project Service", sdlc: ["architecture", "application", "components", "code-design"], architecture: { section: "applications", kind: "backend-service" }, application: { section: "architecture" } });
  await writeConcept(this, "components/browser-shell.md", {
    type: "Component", title: "Browser Shell", sdlc: ["components"], components: { section: "components", group: "interface" }, relationships: [{ type: "part-of", target: "/applications/browser.md" }],
  });
  await writeConcept(this, "components/graph-engine.md", {
    type: "Component", title: "Graph Engine", sdlc: ["components"], components: { section: "components", group: "domain" }, relationships: [{ type: "part-of", target: "/applications/project-service.md" }],
  });
  await writeConcept(this, "contracts/browser-navigation.md", { type: "Code Contract", title: "Browser Navigation", sdlc: ["code-design"], "code-design": { section: "contracts" }, relationships: [{ type: "part-of", target: "/components/browser-shell.md" }] });
  await writeConcept(this, "contracts/graph-query.md", { type: "Code Contract", title: "Graph Query", sdlc: ["code-design"], "code-design": { section: "contracts" }, relationships: [{ type: "part-of", target: "/components/graph-engine.md" }] });
});

Given("an owned System Responsibility is owned by System Design", async function (this: M21World) {
  await writeConcept(this, "responsibility.md", { type: "System Responsibility", title: "Accepted knowledge", description: "Maintains accepted product knowledge.", area: "system", system: { section: "responsibilities", boundary: "owned" } }, "# Responsibility\n\nMaintain accepted knowledge without choosing an Application.\n");
});

Given("an Application realizes that responsibility without System ownership", async function (this: M21World) {
  await writeConcept(this, "application.md", { type: "Application", title: "Project Service", description: "Executable project authority.", area: "architecture", "application-id": "project-service", architecture: { section: "applications", "application-kind": "backend-service", "independently-deployable": true }, relationships: [{ type: "realizes", target: "/responsibility.md" }] }, "# Application\n\nRealizes conceptual responsibility.\n");
});

Given("System Design contains a managed Logical Data Store and an external dependency", async function (this: M21World) {
  await writeConcept(this, "store.md", { type: "Logical Data Store", title: "Project store", description: "Retains canonical knowledge.", area: "system", system: { section: "data", boundary: "managed" } }, "# Store\n\nConceptual durable storage.\n");
  await writeConcept(this, "provider.md", { type: "External Dependency", title: "Model provider", description: "Supplies bounded inference.", area: "system", system: { section: "dependencies", boundary: "external" } }, "# Dependency\n\nExternal inference capability.\n");
});

Given("a System Flow connects two System Responsibilities", async function (this: M21World) {
  await writeConcept(this, "source.md", { type: "System Responsibility", title: "Source", description: "Provides accepted knowledge.", area: "system", system: { section: "responsibilities", boundary: "owned" } }, "# Source\n\nProvides information.\n");
  await writeConcept(this, "destination.md", { type: "System Responsibility", title: "Destination", description: "Consumes accepted knowledge.", area: "system", system: { section: "responsibilities", boundary: "owned" } }, "# Destination\n\nConsumes information.\n");
  await writeConcept(this, "flow.md", { type: "System Flow", title: "Accepted knowledge flow", description: "Carries accepted knowledge from source to destination.", area: "system", system: { section: "flows" }, relationships: [{ type: "source", target: "/source.md" }, { type: "destination", target: "/destination.md" }] }, "# Flow\n\nCarries accepted project knowledge.\n");
});

Given("a System Responsibility contains a runtime field", async function (this: M21World) {
  await writeConcept(this, "runtime.md", { type: "System Responsibility", title: "Runtime-shaped responsibility", description: "Incorrectly contains an Architecture choice.", area: "system", system: { section: "responsibilities", boundary: "owned", runtime: "nodejs" } }, "# Responsibility\n\nRuntime does not belong here.\n");
});

Given("two owned Applications use the same Application ID", async function (this: M21World) {
  await writeConcept(this, "one.md", { type: "Application", title: "One", description: "First boundary.", area: "architecture", "application-id": "duplicate", architecture: { section: "applications", "application-kind": "web-client", "independently-deployable": true } }, "# One\n\nFirst.\n");
  await writeConcept(this, "two.md", { type: "Application", title: "Two", description: "Second boundary.", area: "architecture", "application-id": "duplicate", architecture: { section: "applications", "application-kind": "backend-service", "independently-deployable": true } }, "# Two\n\nSecond.\n");
});

Given("a migrated Component has no Application ID", async function (this: M21World) {
  await writeConcept(this, "component.md", { type: "Component", title: "Unscoped Component", description: "A migrated downstream concept without required scope.", area: "components", components: { section: "components", kind: "module" } }, "# Component\n\nScope is intentionally missing.\n");
});

Given("two owned Applications communicate by event", async function (this: M21World) {
  await writeConcept(this, "one.md", { type: "Application", title: "Publisher", description: "Publishes accepted events.", area: "architecture", "application-id": "publisher", architecture: { section: "applications", "application-kind": "backend-service", "independently-deployable": true } }, "# Publisher\n\nPublishes events.\n");
  await writeConcept(this, "two.md", { type: "Application", title: "Consumer", description: "Consumes accepted events.", area: "architecture", "application-id": "consumer", architecture: { section: "applications", "application-kind": "worker", "independently-deployable": true } }, "# Consumer\n\nConsumes events.\n");
  await writeConcept(this, "communication.md", { type: "Application Communication", title: "Accepted event", description: "Carries accepted events from publisher to consumer.", area: "architecture", architecture: { section: "communications", "communication-mode": "event" }, relationships: [{ type: "source", target: "/one.md" }, { type: "destination", target: "/two.md" }] }, "# Communication\n\nEvent direction and failure remain explicit.\n");
});

Given("an owned conceptual System subsystem", async function (this: M21World) {
  await writeConcept(this, "runtime.md", {
    type: "System Service",
    title: "Product Knowledge Runtime",
    sdlc: ["system"],
    system: { kind: "subsystem", group: "knowledge", boundary: "owned" },
  });
});

Given("an Application realizes that subsystem without System membership", async function (this: M21World) {
  await writeConcept(this, "application.md", {
    type: "Application",
    title: "Project Service",
    sdlc: ["architecture", "application"],
    architecture: { section: "applications", kind: "backend-service" },
    application: { section: "architecture" },
    relationships: [{ type: "realizes", target: "/runtime.md" }],
  });
});

Given("two linked conceptual System parts", async function (this: M21World) {
  await writeConcept(this, "workspace.md", {
    type: "System",
    title: "Workspace",
    sdlc: ["system"],
    system: { kind: "system", group: "platform", boundary: "owned" },
  });
  await writeConcept(this, "store.md", {
    type: "System Data Store",
    title: "OKF Store",
    sdlc: ["system"],
    system: { kind: "data-store", group: "data", boundary: "managed" },
    relationships: [{ type: "part-of", target: "/workspace.md" }],
  });
});

Given("a Solution Capability is owned by the Solution area", async function (this: M21World) {
  await writeConcept(this, "capability.md", { type: "Solution Capability", title: "Connected workspace", description: "Maintains accepted connected product knowledge.", area: "solution", solution: { section: "capabilities" }, relationships: [{ type: "serves", target: "/persona.md" }] }, "# Capability\n\nProvide a connected definition workspace.\n");
});

Given("a related Persona is owned by the Business area", async function (this: M21World) {
  await writeConcept(this, "persona.md", { type: "Persona", title: "Builder", description: "A multidisciplinary product builder.", area: "business", business: { section: "people" } }, "# Persona\n\nBuilds products across disciplines.\n");
});

Given("Solution delivery includes a Human Service and a Digital Product", async function (this: M21World) {
  await writeConcept(this, "workshop.md", { type: "Human Service", title: "Guided workshop", description: "A facilitator helps establish initial definitions.", area: "solution", solution: { section: "delivery" } }, "# Service\n\nA facilitated definition session.\n");
  await writeConcept(this, "workspace.md", { type: "Digital Product", title: "M21 workspace", description: "A digital workspace maintains connected knowledge.", area: "solution", solution: { section: "delivery" } }, "# Product\n\nA local connected knowledge workspace.\n");
});

Given("a Solution Option contains an unsupported Solution field", async function (this: M21World) {
  await writeConcept(this, "option.md", { type: "Solution Option", title: "Facilitated adoption", description: "Combine a workshop with the workspace.", area: "solution", solution: { section: "options", selected: true } }, "# Option\n\nCombine human guidance and a digital workspace.\n");
});

Given("a Solution Measure is placed in the Solution delivery section", async function (this: M21World) {
  await writeConcept(this, "measure.md", { type: "Solution Measure", title: "Adoption completion", description: "Measures completion of guided adoption.", area: "solution", solution: { section: "delivery" } }, "# Measure\n\nObserve completion without treating it as a Business outcome.\n");
});

Given("a product capability is tagged for Product", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Knowledge Workspace",
    sdlc: ["product"],
    product: { section: "capabilities" },
    relationships: [{ type: "serves", target: "/persona.md" }],
  }, "# Outcome\n\nKeep product knowledge coherent.\n");
});

Given("a related business persona is tagged only for Business", async function (this: M21World) {
  await writeConcept(this, "persona.md", {
    type: "Persona",
    title: "Product Builder",
    sdlc: ["business"],
    business: { section: "personas" },
  });
});

Given("a Product-tagged decision concept", async function (this: M21World) {
  await writeConcept(this, "decision.md", {
    type: "Decision",
    title: "Product Decision",
    sdlc: ["product"],
    product: { section: "decisions" },
  });
});

Given("a Business Outcome is owned by the Business area", async function (this: M21World) {
  await writeConcept(this, "goal.md", {
    type: "Business Outcome",
    title: "Business Outcome",
    description: "Create coherent product understanding.",
    area: "business",
    business: { section: "outcomes" },
  }, "# Outcome\n\nCreate coherent product understanding.\n");
});

Given("a connected Solution Capability is owned by the Solution area", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Solution Capability",
    title: "Product Workspace",
    description: "A workspace for connected product definition.",
    area: "solution",
    solution: { section: "capabilities" },
    relationships: [{ type: "addresses", target: "/goal.md" }],
  }, "# Capability\n\nProvide a connected workspace.\n");
});

Given("Business people include a Persona and a Business Role", async function (this: M21World) {
  await writeConcept(this, "persona.md", { type: "Persona", title: "Builder", description: "A multidisciplinary product builder.", area: "business", business: { section: "people" } }, "# Persona\n\nBuilds products across disciplines.\n");
  await writeConcept(this, "role.md", { type: "Business Role", title: "Buyer", description: "Selects and funds the solution.", area: "business", business: { section: "people" } }, "# Role\n\nOwns the buying decision.\n");
});

Given("a Business Problem contains an unsupported Business field", async function (this: M21World) {
  await writeConcept(this, "problem.md", { type: "Business Problem", title: "Fragmented knowledge", description: "Knowledge is disconnected.", area: "business", business: { section: "problems", priority: "high" } }, "# Problem\n\nTeams reconstruct context manually.\n");
});

Given("a Success Metric is placed in the Business people section", async function (this: M21World) {
  await writeConcept(this, "metric.md", { type: "Success Metric", title: "Decision time", description: "Time needed to make a reviewed decision.", area: "business", business: { section: "people" } }, "# Metric\n\nMeasure elapsed decision time.\n");
});

Given("the Business definition-area registry concept", async function (this: M21World) {
  await writeConcept(this, "business-layer.md", {
    type: "Definition Area",
    title: "Business",
    stage: "business",
    order: 10,
    sdlc: ["business"],
  });
});

Given("accepted OKF concepts belong to Business and Solution areas", async function (this: M21World) {
  await writeConcept(this, "business/problem.md", { type: "Business Problem", title: "Problem", description: "A meaningful present condition.", area: "business", business: { section: "problems" } }, "# Problem\n\nA current condition needs change.\n");
  await writeConcept(this, "solution/capability.md", { type: "Solution Capability", title: "Capability", description: "An ability in the response.", area: "solution", solution: { section: "capabilities" }, relationships: [{ type: "addresses", target: "/business/problem.md" }] }, "# Capability\n\nAddresses the accepted problem.\n");
});

Given("the definition layer is {word}", function (this: M21World, layer: string) {
  this.definitionLayer = layer;
});

Given("a Color System is owned by Visual Design with linked CSS", async function (this: M21World) {
  await writeArtifact(this, "/visual-design/styles/colors.css", ":root { --accent: #4455aa; --surface: #ffffff; }\n");
  await writeConcept(this, "color.md", { type: "Color System", title: "Semantic colors", description: "Defines shared semantic color roles.", area: "visual-design", "visual-design": { section: "foundations", "css-source": "/visual-design/styles/colors.css" } }, "# Color system\n\nColor roles carry semantic meaning.\n");
});

Given("a legacy User Journey remains outside Visual Design ownership", async function (this: M21World) {
  await writeConcept(this, "journey.md", { type: "User Journey", title: "Legacy journey", description: "An unmigrated Application Experience concept.", sdlc: ["design"], design: { section: "journeys" } }, "# Journey\n\nApplication-specific flow.\n");
});

Given("a Visual Theme links foundation CSS and contains an inline CSS override", async function (this: M21World) {
  await writeArtifact(this, "/visual-design/styles/colors.css", ":root { --accent: #4455aa; }\n");
  await writeArtifact(this, "/visual-design/styles/theme.css", "@import \"./colors.css\";\n:root { --surface: #ffffff; }\n");
  await writeConcept(this, "color.md", { type: "Color System", title: "Colors", description: "Shared colors.", area: "visual-design", "visual-design": { section: "foundations", "css-source": "/visual-design/styles/colors.css" } }, "# Colors\n\nSemantic roles.\n");
  await writeConcept(this, "theme.md", { type: "Visual Theme", title: "Theme", description: "Composed accepted foundations.", area: "visual-design", "visual-design": { section: "themes", "css-source": "/visual-design/styles/theme.css" } }, "# Theme\n\n```m21-css\n:root { --accent: #7357a6; }\n```\n");
});

Given("an accepted Visual Component links safe HTML and CSS", async function (this: M21World) {
  await writeArtifact(this, "/visual-design/components/action.html", "<button class=\"action\" type=\"button\">Accept proposal</button>\n");
  await writeArtifact(this, "/visual-design/components/action.css", ".action { color: var(--accent-contrast); background: var(--accent); }\n");
  await writeConcept(this, "action.md", { type: "Visual Component", title: "Action", description: "Shared action appearance.", area: "visual-design", "visual-design": { section: "components", "html-source": "/visual-design/components/action.html", "css-source": "/visual-design/components/action.css" } }, "# Action\n\nPrimary and secondary visual states.\n");
});

Given("an accepted Visual Theme links foundation CSS", async function (this: M21World) {
  await writeArtifact(this, "/visual-design/styles/colors.css", ":root { --accent: #4455aa; --accent-contrast: white; }\n");
  await writeArtifact(this, "/visual-design/styles/theme.css", "@import \"./colors.css\";\n");
  await writeConcept(this, "color.md", { type: "Color System", title: "Colors", description: "Shared colors.", area: "visual-design", "visual-design": { section: "foundations", "css-source": "/visual-design/styles/colors.css" } }, "# Colors\n\nSemantic roles.\n");
  await writeConcept(this, "theme.md", { type: "Visual Theme", title: "Theme", description: "Composed accepted foundations.", area: "visual-design", "visual-design": { section: "themes", "css-source": "/visual-design/styles/theme.css" } }, "# Theme\n\nAccepted composition.\n");
});

Given("a Visual Component links HTML containing an embedded script", async function (this: M21World) {
  await writeArtifact(this, "/visual-design/components/unsafe.html", "<button>Unsafe</button><script>alert('no')</script>\n");
  await writeConcept(this, "unsafe.md", { type: "Visual Component", title: "Unsafe component", description: "Readable concept with unsafe specimen markup.", area: "visual-design", "visual-design": { section: "components", "html-source": "/visual-design/components/unsafe.html" } }, "# Unsafe component\n\nThe concept remains readable when preview is blocked.\n");
});

Given("a Visual Component references a missing HTML source", async function (this: M21World) {
  await writeConcept(this, "missing-component.md", { type: "Visual Component", title: "Missing component", description: "References an unavailable specimen.", area: "visual-design", "visual-design": { section: "components", "html-source": "/visual-design/components/missing.html" } }, "# Missing component\n\nFallback to canonical detail.\n");
});

Given("a concept body contains a fenced Mermaid diagram", async function (this: M21World) {
  this.originalMarkdown = "# Flow\n\n```mermaid\ngraph TD\n  A[Business] --> B[Solution]\n```\n";
  await writeConcept(this, "flow.md", { type: "Decision", title: "Definition flow", description: "Explains an accepted relationship flow." }, this.originalMarkdown);
});

Given("a concept body contains a fenced TypeScript example", async function (this: M21World) {
  this.originalMarkdown = "# Example\n\n```typescript\nconst accepted = true;\n```\n";
  await writeConcept(this, "example.md", { type: "Decision", title: "Code example", description: "An ordinary code block." }, this.originalMarkdown);
});

Given("an active visual language without a theme", async function (this: M21World) {
  await writeConcept(this, "visual-language.md", {
    type: "Visual Language",
    title: "Project Visual Language",
    sdlc: ["design"],
    design: { section: "visual-language" },
  });
});

Given("an AI provider that proposes a semantic Visual Design theme", function (this: M21World) {
  this.aiProvider = {
    async suggest(): Promise<AiSuggestion> {
      return {
        summary: "Generate semantic theme",
        changes: {
          design: {
            section: "visual-language",
            theme: { accent: "#7357a6", canvas: "#f8f6fb", "font-sans": "Inter, sans-serif" },
          },
        },
      };
    },
  };
});

Given("an active visual language defines an accent theme token", async function (this: M21World) {
  await writeConcept(this, "visual-language.md", {
    type: "Visual Language",
    title: "Project Visual Language",
    sdlc: ["design"],
    design: { section: "visual-language", theme: { accent: "#4455aa" } },
  });
});

Given("an active component story defines an actions preview", async function (this: M21World) {
  await writeConcept(this, "actions.md", {
    type: "Component Story",
    title: "Actions",
    description: "Primary and secondary controls.",
    sdlc: ["design"],
    design: {
      section: "components",
      preview: { kind: "actions", variants: ["primary", "secondary"] },
    },
  });
});

Given("a draft visual language defines an accent theme token", async function (this: M21World) {
  await writeConcept(this, "visual-language.md", {
    type: "Visual Language",
    title: "Draft Visual Language",
    sdlc: ["design"],
    design: { section: "visual-language", theme: { accent: "#4455aa" } },
  });
});

Given("a decision contributes to Product and System", async function (this: M21World) {
  await writeConcept(this, "decision.md", {
    type: "Decision",
    title: "Shared Decision",
    sdlc: ["product", "system"],
  });
});

Given("a screen contributes to Visual Design", async function (this: M21World) {
  await writeConcept(this, "screen.md", {
    type: "Screen",
    title: "Draft Workspace",
    sdlc: ["design"],
  });
});

Given("product definition remains incomplete", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Untraceable Product Capability",
    sdlc: ["product", "design"],
  });
});

Given("a business goal contributes only to Business", async function (this: M21World) {
  await writeConcept(this, "goal.md", {
    type: "Business Goal",
    title: "Business Only Goal",
    sdlc: ["business"],
  });
});

Given("an AI provider that records definition-layer context", function (this: M21World) {
  const world = this;
  this.aiProvider = {
    async suggest(input: { instruction: string; focus: Concept; context: Concept[]; stage?: string }): Promise<AiSuggestion> {
      world.receivedStage = input.stage;
      return { summary: "Clarify vision in definition context", changes: { description: "Clarified vision" } };
    },
  };
});

Given("an OKF project containing a vision and a capability that realizes it", async function (this: M21World) {
  await activeVision(this);
  await writeConcept(this, "capabilities/workspace.md", {
    type: "Product Capability",
    title: "Workspace",
    description: "A graph workspace",
    relationships: [{ type: "realizes", target: "/vision.md" }],
  });
});

Given("an OKF concept with an unknown producer extension", async function (this: M21World) {
  await writeConcept(this, "project.md", {
    type: "Project",
    title: "Extended Project",
    description: "Before",
    "x-producer": { source: "another-tool", keep: true },
  });
});

Given("an OKF project containing an accepted vision", async function (this: M21World) {
  await activeVision(this);
});

Given("an accepted Business Goal is visible beside it", async function (this: M21World) {
  await writeConcept(this, "goal.md", { type: "Business Goal", title: "Coherent decisions", description: "Improve product decisions.", area: "business", business: { section: "direction" } }, "# Goal\n\nImprove product decisions from coherent knowledge.\n");
});

Given("a user journey realizes a product capability", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Product Capability",
    relationships: [{ type: "serves", target: "/persona.md" }],
  });
  await writeConcept(this, "persona.md", { type: "Persona", title: "Builder" });
  await writeConcept(this, "journey.md", {
    type: "User Journey",
    title: "Builder Journey",
    relationships: [{ type: "realizes", target: "/capability.md" }],
  });
});

Given("an architecture component realizes a product capability", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Product Capability",
    relationships: [{ type: "serves", target: "/persona.md" }],
  });
  await writeConcept(this, "persona.md", { type: "Persona", title: "Builder" });
  await writeConcept(this, "component.md", {
    type: "Component",
    title: "Persistence Component",
    relationships: [{ type: "realizes", target: "/capability.md" }],
  });
});

Given("an OKF concept relates to a missing target", async function (this: M21World) {
  await writeConcept(this, "concept.md", {
    type: "System",
    title: "Readable System",
    relationships: [{ type: "depends-on", target: "/missing.md" }],
  }, "Still readable.\n");
});

Given("an OKF capability with no business or persona relationship", async function (this: M21World) {
  await writeConcept(this, "capability.md", { type: "Product Capability", title: "Untethered Capability" });
});

Given("a configured development AI provider", function (this: M21World) {
  this.aiProvider = new DevelopmentAiProvider();
});

Given("an AI proposal to clarify an accepted vision", async function (this: M21World) {
  await activeVision(this);
  this.aiProvider = new DevelopmentAiProvider();
  const service = await open(this);
  this.proposal = await service.askAgent({
    conceptId: "vision",
    instruction: "Make the user outcome explicit.",
    provider: this.aiProvider,
  });
});

Given("an OKF project containing a project, vision, and MVP capability", async function (this: M21World) {
  await writeConcept(this, "project.md", { type: "Project", title: "M21" });
  await writeConcept(this, "vision.md", { type: "Vision", title: "Living Product Model" });
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Graph Workspace",
    relationships: [{ type: "realizes", target: "/vision.md" }],
  });
});

Given("an OKF project containing a project and vision", async function (this: M21World) {
  await writeConcept(this, "project.md", { type: "Project", title: "M21" });
  await writeConcept(this, "vision.md", { type: "Vision", title: "Living Product Model" });
});

Given("I have proposed a revision to the vision", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "vision",
    changes: { body: "# Mission\n\nBuild a revised coherent product.\n" },
    changeKind: "contract",
    summary: "Revise the vision",
  });
});

When("I list the Architecture Applications", async function (this: M21World) {
  const service = await open(this);
  this.applicationScopes = applicationScopes(service.snapshot().concepts);
  this.applicationSnapshot = service.snapshot();
});

When("I inspect the Architecture topology", async function (this: M21World) {
  const service = await open(this);
  this.applicationSnapshot = service.snapshot();
  this.architectureArtifacts = architectureArtifacts(this.applicationSnapshot.concepts);
});

When("I request Components for an unknown Application", async function (this: M21World) {
  const service = await open(this);
  this.applicationSnapshot = snapshotForApplicationLayer(service.snapshot(), "applications/missing", "components");
});

When("I scope Code Design to that Application", async function (this: M21World) {
  const service = await open(this);
  this.applicationSnapshot = snapshotForApplicationLayer(service.snapshot(), "applications/service", "code-design");
});

When("I project the global knowledge graph", async function (this: M21World) {
  const service = await open(this);
  this.globalGraphSource = service.snapshot();
  this.globalGraph = projectGlobalGraph(this.globalGraphSource);
});

When("I open the global graph from a scoped Application workspace", async function (this: M21World) {
  const service = await open(this);
  const full = service.snapshot();
  this.scopedConceptIds = snapshotForApplicationLayer(full, "applications/service", "components").concepts.map((concept) => concept.id);
  this.globalGraphSource = full;
  this.globalGraph = projectGlobalGraph(full);
});

When("I inspect the product-wide layer contracts", function (this: M21World) {
  assert(this.productDefinitionSpec.length > 0);
});

When("I assemble the Application Implementation feature set", async function (this: M21World) {
  const service = await open(this);
  const scoped = snapshotForApplicationLayer(service.snapshot(), "applications/service", "implementation");
  this.implementationFeatures = componentFeatureFiles(scoped.concepts);
});

When("I inspect their executable feature sets", async function (this: M21World) {
  this.invalidComponentFeatures = [];
  for (const component of this.canonicalComponents) {
    const metadata = component.metadata.components as Record<string, unknown> | undefined;
    const features = Array.isArray(metadata?.features) ? metadata.features.filter((feature): feature is string => typeof feature === "string") : [];
    if (features.length === 0) this.invalidComponentFeatures.push(`${component.id}: no features`);
    for (const feature of features) {
      try { await readFile(path.join(process.cwd(), feature), "utf8"); }
      catch { this.invalidComponentFeatures.push(`${component.id}: missing ${feature}`); }
    }
  }
});

When("I open the project engineering SKILL", async function (this: M21World) {
  this.engineeringSkill = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/SKILL.md"), "utf8");
});

When("I list the Application scopes", async function (this: M21World) {
  const service = await open(this);
  this.applicationScopes = applicationScopes(service.snapshot().concepts);
});

When("I scope Components to the Project Service Application", async function (this: M21World) {
  const service = await open(this);
  this.applicationSnapshot = snapshotForApplicationLayer(service.snapshot(), "applications/project-service", "components");
});

When("I move to Code Design with the same Application scope", async function (this: M21World) {
  const service = await open(this);
  this.applicationSnapshot = snapshotForApplicationLayer(service.snapshot(), "applications/project-service", "code-design");
});

When("I select the System architecture artifacts", async function (this: M21World) {
  const service = await open(this);
  this.systemArtifacts = systemArchitectureArtifacts(service.snapshot().concepts);
});

When("I select the System architecture map", async function (this: M21World) {
  const service = await open(this);
  this.systemSnapshot = snapshotForLayer(service.snapshot(), "system");
});

When("I select the Business Solution main artifacts", async function (this: M21World) {
  const service = await open(this);
  this.solutionArtifacts = solutionArtifacts(service.snapshot().concepts);
});

When("I group the Business Solution main artifacts", async function (this: M21World) {
  const service = await open(this);
  for (const concept of solutionArtifacts(service.snapshot().concepts)) {
    const section = solutionSection(concept);
    if (!section) continue;
    const types = this.solutionGroups.get(section) ?? new Set<string>();
    types.add(concept.type);
    this.solutionGroups.set(section, types);
  }
});

When("I select the Product capability artifacts", async function (this: M21World) {
  const service = await open(this);
  this.productArtifacts = productCapabilityArtifacts(service.snapshot().concepts);
});

When("I select the Business main artifacts", async function (this: M21World) {
  const service = await open(this);
  this.mainArtifacts = mainArtifactsForLayer(service.snapshot().concepts, "business");
});

When("I group the Business main artifacts", async function (this: M21World) {
  const service = await open(this);
  for (const concept of businessArtifacts(service.snapshot().concepts)) {
    const section = businessSection(concept);
    if (!section) continue;
    const types = this.businessGroups.get(section) ?? new Set<string>();
    types.add(concept.type);
    this.businessGroups.set(section, types);
  }
});

Given("I am watching the open project", async function (this: M21World) {
  const service = await open(this);
  this.watchedSnapshot = new Promise<ProjectSnapshot>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for project reload")), 3_000);
    this.unwatch = service.watch((snapshot) => { clearTimeout(timeout); resolve(snapshot); }, 25);
  });
});

When("the canonical vision file changes outside M21", async function (this: M21World) {
  await writeConcept(this, "vision.md", { type: "Vision", title: "Active Vision", description: "Changed outside M21" }, "# Mission\n\nExternally changed product knowledge.\n");
});

When("I choose its workspace projection", function (this: M21World) {
  assert(this.definitionLayer);
  this.projection = projectionForLayer(this.definitionLayer);
});

When("I select the Visual Design main artifacts", async function (this: M21World) {
  const service = await open(this);
  this.visualArtifacts = visualDesignArtifacts(service.snapshot().concepts);
});

When("I compose the accepted Visual Theme", async function (this: M21World) {
  const service = await open(this);
  const theme = service.snapshot().concepts.find((concept) => concept.type === "Visual Theme");
  assert(theme);
  this.composedTheme = composeVisualTheme(theme, service.snapshot().concepts);
});

When("I render the Visual Component specimen", async function (this: M21World) {
  const service = await open(this);
  const snapshot = service.snapshot();
  const component = snapshot.concepts.find((concept) => concept.type === "Visual Component");
  assert(component);
  const specimen = renderVisualComponent(component, snapshot.concepts);
  this.visualSpecimen = specimen.html;
  this.visualSandbox = specimen.sandbox;
});

When("I inspect its Markdown preview content", async function (this: M21World) {
  const service = await open(this);
  const concept = service.snapshot().concepts[0];
  assert(concept);
  this.mermaidSources = mermaidDiagrams(concept.body);
});

When("I ask the agent to generate the Visual Design theme", async function (this: M21World) {
  const service = await open(this);
  assert(this.aiProvider);
  this.proposal = await service.askAgent({
    conceptId: "visual-language",
    instruction: "Generate the semantic theme.",
    stage: "design",
    provider: this.aiProvider,
  });
});

When("I generate the Visual Design component preview", async function (this: M21World) {
  const service = await open(this);
  this.designPreview = generateDesignPreview(service.snapshot().concepts);
});

When("I open the project", async function (this: M21World) {
  await open(this);
});

When("I open the project in global debug mode", async function (this: M21World) {
  await open(this);
  this.debugSourceIds = this.snapshot?.concepts.map((concept) => concept.id) ?? [];
});

When("I inspect the Business Goal source action", function (this: M21World) {
  this.debugRaw = this.snapshot?.concepts.find((concept) => concept.id === "goal")?.raw ?? "";
});

When("I inspect the raw vision Markdown", function (this: M21World) {
  this.debugRaw = this.snapshot?.concepts.find((concept) => concept.id === "vision")?.raw ?? "";
});

When("I open the Visual Design definition view", async function (this: M21World) {
  await open(this);
  assert(this.snapshot);
  this.lifecycleSnapshot = snapshotForLayer(this.snapshot, "design");
});

When("I ask the agent in the Product layer to clarify the vision", async function (this: M21World) {
  const service = await open(this);
  assert(this.aiProvider);
  this.proposal = await service.askAgent({
    conceptId: "vision",
    instruction: "Clarify the intended outcome.",
    stage: "product",
    provider: this.aiProvider,
  });
});

When("I propose and accept a revision to its description", async function (this: M21World) {
  const service = await open(this);
  const proposal = service.proposeRevision({
    conceptId: "project",
    changes: { description: "After" },
    changeKind: "contract",
    summary: "Revise description",
  });
  await service.accept(proposal.id);
  this.snapshot = service.snapshot();
});

When("I propose a revision to the vision", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "vision",
    changes: { description: "Proposed vision" },
    changeKind: "contract",
    summary: "Revise the vision",
  });
});

When("I propose a contract change to the capability", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "capability",
    changes: { description: "Changed user-visible capability contract" },
    changeKind: "contract",
    summary: "Change capability contract",
  });
});

When("I propose an internal change to the architecture component", async function (this: M21World) {
  const service = await open(this);
  this.proposal = service.proposeRevision({
    conceptId: "component",
    changes: { body: "Use a different internal persistence algorithm.\n" },
    changeKind: "internal",
    summary: "Replace internal implementation",
  });
});

When("I accept the proposal", async function (this: M21World) {
  assert(this.proposal);
  const service = await open(this);
  this.snapshot = await service.accept(this.proposal.id);
});

When("I ask the agent to clarify the vision", async function (this: M21World) {
  const service = await open(this);
  assert(this.aiProvider);
  this.proposal = await service.askAgent({
    conceptId: "vision",
    instruction: "Make the user outcome explicit.",
    provider: this.aiProvider,
  });
});

When("I accept the AI proposal", async function (this: M21World) {
  assert(this.proposal);
  const service = await open(this);
  this.snapshot = await service.accept(this.proposal.id);
});

When("I generate the project summary", async function (this: M21World) {
  const service = await open(this);
  this.summaries = [service.generateSummary()];
});

When("I generate the project summary for Visual Design", async function (this: M21World) {
  const service = await open(this);
  this.summaries = [service.generateSummary("design")];
});

When("I generate the project summary twice without changing the graph", async function (this: M21World) {
  const service = await open(this);
  this.summaries = [service.generateSummary(), service.generateSummary()];
});

Then("one owned Application is defined", function (this: M21World) {
  assert.equal(this.applicationScopes.length, 1);
  assert.equal(this.applicationScopes[0]?.id, "applications/full-stack");
});

Then("it has a stable Application ID", function (this: M21World) {
  assert.equal(this.applicationScopes[0]?.applicationId, "full-stack");
});

Then("it realizes both System Design responsibilities", function (this: M21World) {
  const edges = this.applicationSnapshot?.edges.filter((edge) => edge.source === "applications/full-stack" && edge.type === "realizes") ?? [];
  assert.equal(edges.length, 2);
});

Then("no downstream artifacts are disclosed", function (this: M21World) {
  assert.equal(this.applicationSnapshot?.concepts.length, 0);
  assert.equal(this.applicationSnapshot?.edges.length, 0);
});

Then("the owned Code Design contract is displayed", function (this: M21World) {
  assert(this.applicationSnapshot?.concepts.some((concept) => concept.id === "contracts/snapshot"));
});

Then("the Component is not duplicated as a Code Design artifact", function (this: M21World) {
  assert(!this.applicationSnapshot?.concepts.some((concept) => concept.id === "components/engine"));
});

Then("every accepted OKF concept appears exactly once", function (this: M21World) {
  assert(this.globalGraph && this.globalGraphSource);
  assert.equal(this.globalGraph.nodes.length, this.globalGraphSource.concepts.length);
  assert.equal(new Set(this.globalGraph.nodes.map((node) => node.id)).size, this.globalGraph.nodes.length);
});

Then("every resolved typed relationship appears exactly once", function (this: M21World) {
  assert(this.globalGraph && this.globalGraphSource);
  assert.equal(this.globalGraph.links.length, this.globalGraphSource.edges.length);
  const identities = this.globalGraph.links.map((link) => `${link.source}|${link.type}|${link.target}`);
  assert.equal(new Set(identities).size, identities.length);
});

Then("the projection retains the accepted source revision", function (this: M21World) {
  assert.equal(this.globalGraph?.sourceRevision, this.globalGraphSource?.revision);
});

Then("the global graph still contains knowledge outside that Application", function (this: M21World) {
  assert(this.globalGraph);
  assert(!this.scopedConceptIds.includes("business/outcome"));
  assert(this.globalGraph.nodes.some((node) => node.id === "business/outcome"));
});

Then("the workflow orders Business, Product, Visual Design, System Design, and Architecture", function (this: M21World) {
  const order = ["### Business", "### Product", "### Visual Design", "### System Design", "### Architecture"].map((heading) => this.productDefinitionSpec.indexOf(heading));
  assert(order.every((index) => index >= 0));
  assert.deepEqual([...order].sort((left, right) => left - right), order);
});

Then("every product-wide layer defines what it is, agent assistance, frontmatter, and body expectations", function (this: M21World) {
  const headings = ["Business", "Product", "Visual Design", "System Design", "Architecture"];
  for (const [index, heading] of headings.entries()) {
    const start = this.productDefinitionSpec.indexOf(`### ${heading}`);
    const end = index + 1 < headings.length ? this.productDefinitionSpec.indexOf(`### ${headings[index + 1]}`, start) : this.productDefinitionSpec.indexOf("### Cross-layer traceability", start);
    const section = this.productDefinitionSpec.slice(start, end);
    for (const contractHeading of ["#### What it is", "#### How the agent helps", "#### Frontmatter expectation", "#### Body expectation"]) assert(section.includes(contractHeading), `${heading} lacks ${contractHeading}`);
  }
});

Then("Visual Design retains the stable design metadata identifier", function (this: M21World) {
  assert.match(this.productDefinitionSpec, /stable layer and namespace identifier for Visual Design remains `design`/);
});

Then("the declared Component feature is required by Implementation", function (this: M21World) {
  assert.deepEqual(this.implementationFeatures, ["features/engine.feature"]);
});

Then("every canonical Component references one or more existing Gherkin feature files", function (this: M21World) {
  assert(this.canonicalComponents.length > 0);
  assert.deepEqual(this.invalidComponentFeatures, []);
});

Then("it directs the agent to the M21 workspace spec", function (this: M21World) {
  assert.match(this.engineeringSkill, /spec\/m21-workspace\.md/);
});

Then("it provides standalone M21 specification and feature authoring guidance", async function (this: M21World) {
  assert.match(this.engineeringSkill, /references\/m21-spec-authoring\.md/);
  assert.match(this.engineeringSkill, /references\/m21-project-workflow\.md/);
  assert.match(this.engineeringSkill, /Do \*\*not\*\* generate one generic spec/);
  const authoring = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/references/m21-spec-authoring.md"), "utf8");
  assert.match(authoring, /## What an M21 spec is/);
  assert.match(authoring, /```m21-model/);
  assert.match(authoring, /```m21-interface/);
  assert.match(authoring, /## Executable features/);
  const projectWorkflow = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/references/m21-project-workflow.md"), "utf8");
  assert.match(projectWorkflow, /## Concern map before files/);
  await readFile(path.join(process.cwd(), "skills/m21-product-engineering/assets/spec-template.md"), "utf8");
  await readFile(path.join(process.cwd(), "skills/m21-product-engineering/assets/feature-template.feature"), "utf8");
});

Then("it exposes expert resources for every Definition Area", async function (this: M21World) {
  const areaResources = ["business", "business-solution", "visual-design", "system-design", "architecture", "application-experience", "application-architecture", "components", "code-design", "implementation", "deployment"];
  for (const resource of areaResources) {
    assert.match(this.engineeringSkill, new RegExp(`references/${resource}\\.md`));
    const content = await readFile(path.join(process.cwd(), `skills/m21-product-engineering/references/${resource}.md`), "utf8");
    assert.match(content, /## Expert stance/);
    assert.match(content, /## Best practices/);
    assert.match(content, /## High-value questions/);
  }
});

Then("its Business resource requires evidence-led business-case interrogation", async function (this: M21World) {
  assert.match(this.engineeringSkill, /evidence-led interrogation/);
  const business = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/references/business.md"), "utf8");
  assert.match(business, /## Business-case interrogation/);
  assert.match(business, /### Maintain a live case ledger/);
  assert.match(business, /## Challenge weak answers/);
  assert.match(business, /## Interview exit and adversarial review/);
  assert.match(business, /business-definition-area\.md/);
  const contract = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/references/business-definition-area.md"), "utf8");
  assert.match(contract, /## Data model/);
  assert.match(contract, /```m21-model/);
  assert.match(contract, /## Interfaces/);
});

Then("its Business Solution resource requires socio-technical option interrogation", async function (this: M21World) {
  assert.match(this.engineeringSkill, /interrogate and compare socio-technical options/);
  const solution = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/references/business-solution.md"), "utf8");
  assert.match(solution, /## Solution interrogation and option design/);
  assert.match(solution, /### Maintain a live option ledger/);
  assert.match(solution, /## Challenge weak answers/);
  assert.match(solution, /## Interview exit and adversarial review/);
  assert.match(solution, /business-solution-definition-area\.md/);
  const contract = await readFile(path.join(process.cwd(), "skills/m21-product-engineering/references/business-solution-definition-area.md"), "utf8");
  assert.match(contract, /## Data model/);
  assert.match(contract, /```m21-model/);
  assert.match(contract, /## Interfaces/);
});

Then("it requires specification, feature, test, and build validation", function (this: M21World) {
  assert.match(this.engineeringSkill, /npx @moejay\/m21 validate \.\/spec --json/);
  assert.match(this.engineeringSkill, /npm test/);
  assert.match(this.engineeringSkill, /npm run build/);
});

Then("both owned Applications are selectable", function (this: M21World) {
  assert.deepEqual(this.applicationScopes.map((concept) => concept.id), ["applications/browser", "applications/project-service"]);
});

Then("only the Project Service Components are displayed", function (this: M21World) {
  assert(this.applicationSnapshot?.concepts.some((concept) => concept.id === "components/graph-engine"));
  assert(!this.applicationSnapshot?.concepts.some((concept) => concept.id === "components/browser-shell"));
});

Then("the Project Service Code Design remains displayed", function (this: M21World) {
  assert(this.applicationSnapshot?.concepts.some((concept) => concept.id === "contracts/graph-query"));
});

Then("the Browser Application internals remain excluded", function (this: M21World) {
  assert(!this.applicationSnapshot?.concepts.some((concept) => concept.id.includes("browser")));
});

Then("the System Responsibility is displayed", function (this: M21World) {
  assert(this.systemArtifacts.some((concept) => concept.type === "System Responsibility"));
});

Then("the realizing Application is not a System architecture artifact", function (this: M21World) {
  assert(!this.systemArtifacts.some((concept) => concept.type === "Application"));
});

Then("the managed store retains its managed boundary", function (this: M21World) {
  assert.equal(systemBoundary(this.systemArtifacts.find((concept) => concept.type === "Logical Data Store")!), "managed");
});

Then("the external dependency retains its external boundary", function (this: M21World) {
  assert.equal(systemBoundary(this.systemArtifacts.find((concept) => concept.type === "External Dependency")!), "external");
});

Then("the System Flow remains a first-class concept", function (this: M21World) {
  assert(this.systemSnapshot?.concepts.some((concept) => concept.type === "System Flow"));
});

Then("the directed flow relationships are displayed", function (this: M21World) {
  const edges = this.systemSnapshot?.edges.filter((edge) => edge.source === "flow") ?? [];
  assert(edges.some((edge) => edge.type === "source" && edge.targetId === "source"));
  assert(edges.some((edge) => edge.type === "destination" && edge.targetId === "destination"));
});

Then("validation reports the unsupported System field", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "unknown-system-field"));
});

Then("validation reports the duplicate Application ID", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "duplicate-application-id"));
});

Then("validation reports the missing downstream Application ID", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "missing-downstream-application-id"));
});

Then("the Application Communication uses event mode", function (this: M21World) {
  const communication = this.architectureArtifacts.find((concept) => concept.type === "Application Communication");
  assert.equal((communication?.metadata.architecture as Record<string, unknown> | undefined)?.["communication-mode"], "event");
});

Then("its source and destination relationships remain directed", function (this: M21World) {
  const edges = this.applicationSnapshot?.edges.filter((edge) => edge.source === "communication") ?? [];
  assert(edges.some((edge) => edge.type === "source" && edge.targetId === "one"));
  assert(edges.some((edge) => edge.type === "destination" && edge.targetId === "two"));
});

Then("the System subsystem is displayed", function (this: M21World) {
  assert(this.systemArtifacts.some((concept) => concept.id === "runtime"));
});

Then("the System architecture link is displayed", function (this: M21World) {
  assert(this.systemSnapshot?.edges.some((edge) => edge.source === "store" && edge.targetId === "workspace" && edge.type === "part-of"));
});

Then("the Solution Capability is a main artifact", function (this: M21World) {
  assert(this.solutionArtifacts.some((concept) => concept.id === "capability"));
});

Then("the Business Persona is not a Solution main artifact", function (this: M21World) {
  assert(!this.solutionArtifacts.some((concept) => concept.id === "persona"));
});

Then("the delivery section contains the Human Service type", function (this: M21World) {
  assert(this.solutionGroups.get("delivery")?.has("Human Service"));
});

Then("the delivery section contains the Digital Product type", function (this: M21World) {
  assert(this.solutionGroups.get("delivery")?.has("Digital Product"));
});

Then("validation reports the unsupported Solution field", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "unknown-solution-field"));
});

Then("the readable Solution Option remains in the graph", function (this: M21World) {
  assert(this.snapshot?.concepts.some((concept) => concept.id === "option" && concept.body.includes("human guidance")));
});

Then("validation reports the Solution type and section mismatch", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "solution-type-section-mismatch"));
});

Then("the product capability is displayed", function (this: M21World) {
  assert(this.productArtifacts.some((concept) => concept.id === "capability"));
});

Then("the business persona is not displayed as a Product capability", function (this: M21World) {
  assert(!this.productArtifacts.some((concept) => concept.id === "persona"));
});

Then("the decision is not displayed as a Product capability", function (this: M21World) {
  assert(!this.productArtifacts.some((concept) => concept.id === "decision"));
});

Then("the Business Outcome is a main artifact", function (this: M21World) {
  assert(this.mainArtifacts.some((concept) => concept.id === "goal"));
});

Then("the Solution Capability is not a main artifact", function (this: M21World) {
  assert(!this.mainArtifacts.some((concept) => concept.id === "capability"));
});

Then("the people section contains the Persona type", function (this: M21World) {
  assert(this.businessGroups.get("people")?.has("Persona"));
});

Then("the people section contains the Business Role type", function (this: M21World) {
  assert(this.businessGroups.get("people")?.has("Business Role"));
});

Then("validation reports the unsupported Business field", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "unknown-business-field"));
});

Then("the readable Business Problem remains in the graph", function (this: M21World) {
  assert(this.snapshot?.concepts.some((concept) => concept.id === "problem" && concept.body.includes("Teams reconstruct context")));
});

Then("validation reports the Business type and section mismatch", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "business-type-section-mismatch"));
});

Then("the definition-area registry concept is not a main artifact", function (this: M21World) {
  assert(!this.mainArtifacts.some((concept) => ["Definition Area", "Definition Layer"].includes(concept.type)));
});

Then("every area-owned graph node retains its Definition Area", function (this: M21World) {
  assert(this.globalGraph);
  assert.equal(this.globalGraph.nodes.find((node) => node.id === "business/problem")?.area, "business");
  assert.equal(this.globalGraph.nodes.find((node) => node.id === "solution/capability")?.area, "solution");
});

Then("highlighting Business does not remove Solution knowledge", function (this: M21World) {
  assert(this.globalGraph?.nodes.some((node) => node.id === "solution/capability"));
});

Then("the open project publishes the changed vision", async function (this: M21World) {
  const snapshot = await this.watchedSnapshot;
  assert.equal(snapshot?.concepts.find((concept) => concept.id === "vision")?.description, "Changed outside M21");
});

Then("the projection is {word}", function (this: M21World, projection: string) {
  assert.equal(this.projection, projection);
});

Then("the active definition layer remains {word}", function (this: M21World, layer: string) {
  assert.equal(this.definitionLayer, layer);
});

Then("the Color System is a main artifact", function (this: M21World) {
  assert(this.visualArtifacts.some((concept) => concept.type === "Color System"));
});

Then("the User Journey is not a Visual Design main artifact", function (this: M21World) {
  assert(!this.visualArtifacts.some((concept) => concept.type === "User Journey"));
});

Then("the Color System contains its accepted CSS artifact", function (this: M21World) {
  const concept = this.snapshot?.concepts.find((candidate) => candidate.type === "Color System");
  assert(concept?.artifacts.some((artifact) => artifact.role === "css" && artifact.content.includes("--accent")));
});

Then("the linked CSS contributes to the project revision", async function (this: M21World) {
  const service = await open(this);
  const before = service.snapshot().revision;
  await writeArtifact(this, "/visual-design/styles/colors.css", ":root { --accent: #7357a6; --surface: #ffffff; }\n");
  const refreshed = await service.refreshFromDisk();
  assert(refreshed);
  this.artifactRevisionChanged = refreshed.revision !== before;
  assert(this.artifactRevisionChanged);
});

Then("linked theme CSS appears before the inline theme override", function (this: M21World) {
  const linked = this.composedTheme.indexOf("--accent: #4455aa");
  const inline = this.composedTheme.indexOf("--accent: #7357a6");
  assert(linked >= 0 && inline > linked);
});

Then("the specimen contains the accepted component markup", function (this: M21World) {
  assert.match(this.visualSpecimen, /Accept proposal/);
});

Then("the specimen applies theme CSS before component CSS", function (this: M21World) {
  assert(this.visualSpecimen.indexOf("--accent: #4455aa") < this.visualSpecimen.indexOf("\.action"));
});

Then("the specimen requires an isolated script sandbox", function (this: M21World) {
  assert(["", "allow-scripts"].includes(this.visualSandbox));
  assert.doesNotMatch(this.visualSandbox, /allow-same-origin/);
});

Then("validation reports unsafe Visual Component HTML", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "unsafe-visual-html"));
});

Then("the readable Visual Component remains in the graph", function (this: M21World) {
  assert(this.snapshot?.concepts.some((concept) => concept.id === "unsafe" && concept.body.includes("remains readable")));
});

Then("validation reports the missing Visual Design artifact", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "missing-visual-artifact"));
});

Then("the Mermaid diagram source is recognized", function (this: M21World) {
  assert.equal(this.mermaidSources.length, 1);
  assert.match(this.mermaidSources[0]?.source ?? "", /graph TD/);
});

Then("the canonical Markdown source remains unchanged", function (this: M21World) {
  assert.equal(this.snapshot?.concepts[0]?.body, this.originalMarkdown);
});

Then("no Mermaid diagram source is recognized", function (this: M21World) {
  assert.deepEqual(this.mermaidSources, []);
});

Then("the project theme uses the visual language as its source", function (this: M21World) {
  assert(this.snapshot);
  this.theme = projectTheme(this.snapshot.concepts);
  assert.equal(this.theme?.sourceConceptId, "visual-language");
});

Then("the project theme exposes the accent token", function (this: M21World) {
  assert.equal(this.theme?.tokens.accent, "#4455aa");
});

Then("no project theme is active", function (this: M21World) {
  assert(this.snapshot);
  assert.equal(projectTheme(this.snapshot.concepts), undefined);
});

Then("the theme remains a reviewable proposal", async function (this: M21World) {
  assert(this.proposal);
  const operation = this.proposal.operations[0];
  assert(operation?.changes.design);
  const service = await open(this);
  assert.equal(projectTheme(service.snapshot().concepts), undefined);
});

Then("the accepted project uses the generated theme", function (this: M21World) {
  assert(this.snapshot);
  assert.equal(projectTheme(this.snapshot.concepts)?.tokens.accent, "#7357a6");
});

Then("the preview contains the component story", function (this: M21World) {
  assert.match(this.designPreview, /Actions/);
  assert.match(this.designPreview, /Accept change/);
});

Then("the preview contains the active accent token", function (this: M21World) {
  assert.match(this.designPreview, /--accent:#4455aa/);
});

Then("the same decision appears in the Product definition view", function (this: M21World) {
  assert(this.snapshot);
  assert(snapshotForLayer(this.snapshot, "product").concepts.some((concept) => concept.id === "decision"));
});

Then("the same decision appears in the System definition view", function (this: M21World) {
  assert(this.snapshot);
  assert(snapshotForLayer(this.snapshot, "system").concepts.some((concept) => concept.id === "decision"));
});

Then("the project contains only one copy of the decision", function (this: M21World) {
  assert.equal(this.snapshot?.concepts.filter((concept) => concept.id === "decision").length, 1);
});

Then("the screen is available for work", function (this: M21World) {
  assert(this.lifecycleSnapshot?.concepts.some((concept) => concept.id === "screen"));
});

Then("the product definition diagnostic remains visible when relevant", function (this: M21World) {
  assert(this.lifecycleSnapshot?.diagnostics.some((diagnostic) => diagnostic.code === "capability-traceability-gap"));
});

Then("the AI provider receives Product as the definition-layer context", function (this: M21World) {
  assert.equal(this.receivedStage, "product");
});

Then("every visible Concept card offers a source action without expansion", function (this: M21World) {
  assert.deepEqual(this.debugSourceIds.sort(), ["goal", "vision"]);
});

Then("the modal contains the exact raw Business Goal Markdown", function (this: M21World) {
  assert.match(this.debugRaw, /title: Coherent decisions/);
  assert.match(this.debugRaw, /# Goal/);
});

Then("the vision exposes its exact raw Markdown file", function (this: M21World) {
  const raw = this.snapshot?.concepts.find((concept) => concept.id === "vision")?.raw ?? "";
  assert.match(raw, /^---\n/);
  assert.match(raw, /title: Active Vision/);
  assert.match(raw, /# Mission/);
});

Then("the project graph contains both concepts", function (this: M21World) {
  assert(this.snapshot);
  assert.equal(this.snapshot.concepts.length, 2);
});

Then("the graph contains a realizes relationship from the capability to the vision", function (this: M21World) {
  assert(this.snapshot?.edges.some((edge) => edge.source === "capabilities/workspace" && edge.targetId === "vision" && edge.type === "realizes"));
});

Then("the revised description is persisted", function (this: M21World) {
  assert.equal(this.snapshot?.concepts.find((concept) => concept.id === "project")?.description, "After");
});

Then("the unknown producer extension is preserved", function (this: M21World) {
  assert.deepEqual(this.snapshot?.concepts.find((concept) => concept.id === "project")?.metadata["x-producer"], {
    source: "another-tool",
    keep: true,
  });
});

Then("the canonical vision remains unchanged", async function (this: M21World) {
  const content = await readFile(path.join(this.root, "vision.md"), "utf8");
  assert.match(content, /Original vision|Build a coherent product/);
  assert.doesNotMatch(content, /Proposed vision|Make the user outcome explicit/);
});

Then("the proposal describes the pending revision", function (this: M21World) {
  assert.equal(this.proposal?.operations[0]?.type, "revise-concept");
  assert.equal(this.proposal?.status, "proposed");
});

Then("the proposal flags the user journey for review", function (this: M21World) {
  assert(this.proposal?.impact.some((finding) => finding.conceptId === "journey"));
});

Then("the impact explains the realizes relationship path", function (this: M21World) {
  const finding = this.proposal?.impact.find((candidate) => candidate.conceptId === "journey");
  assert.equal(finding?.relationshipType, "realizes");
  assert.deepEqual(finding?.path, ["journey", "capability"]);
});

Then("the proposal does not flag the product capability for review", function (this: M21World) {
  assert.equal(this.proposal?.impact.some((finding) => finding.conceptId === "capability"), false);
});

Then("the canonical vision contains the revision", function (this: M21World) {
  assert.match(this.snapshot?.concepts.find((concept) => concept.id === "vision")?.body ?? "", /revised coherent product/);
});

Then("the project revision changes", function (this: M21World) {
  assert(this.initialRevision);
  assert.notEqual(this.snapshot?.revision, this.initialRevision);
});

Then("validation reports the broken relationship", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "broken-relationship"));
});

Then("the readable concept remains in the graph", function (this: M21World) {
  assert(this.snapshot?.concepts.some((concept) => concept.id === "concept" && concept.body.includes("Still readable")));
});

Then("validation reports the capability traceability gap", function (this: M21World) {
  assert(this.snapshot?.diagnostics.some((diagnostic) => diagnostic.code === "capability-traceability-gap"));
});

Then("the agent returns a reviewable change proposal", function (this: M21World) {
  assert.equal(this.proposal?.provenance, "ai");
  assert.equal(this.proposal?.status, "proposed");
});

Then("the canonical vision contains the proposed clarification", function (this: M21World) {
  assert.match(this.snapshot?.concepts.find((concept) => concept.id === "vision")?.body ?? "", /Make the user outcome explicit/);
});

Then("the summary includes the screen", function (this: M21World) {
  assert.match(this.summaries[0] ?? "", /Draft Workspace/);
});

Then("the summary excludes the Business-only business goal", function (this: M21World) {
  assert.doesNotMatch(this.summaries[0] ?? "", /Business Only Goal/);
});

Then("the summary includes the project, vision, and capability titles", function (this: M21World) {
  const summary = this.summaries[0] ?? "";
  assert.match(summary, /## M21/);
  assert.match(summary, /## Living Product Model/);
  assert.match(summary, /## Graph Workspace/);
});

Then("the summary references their canonical concept identifiers", function (this: M21World) {
  const summary = this.summaries[0] ?? "";
  assert.match(summary, /`project`/);
  assert.match(summary, /`vision`/);
  assert.match(summary, /`capability`/);
});

Then("both generated summaries are identical", function (this: M21World) {
  assert.equal(this.summaries.length, 2);
  assert.equal(this.summaries[0], this.summaries[1]);
});
