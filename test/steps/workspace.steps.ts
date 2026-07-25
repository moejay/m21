import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { After, Before, Given, Then, When, setWorldConstructor, World } from "@cucumber/cucumber";
import YAML from "yaml";
import { DevelopmentAiProvider, type AiProvider, type AiSuggestion } from "../../src/application/ai.js";
import { ProjectService } from "../../src/application/project-service.js";
import { applicationScopes, snapshotForApplicationLayer, snapshotForLayer } from "../../src/domain/definition-flow.js";
import { componentFeatureFiles, mainArtifactsForLayer, productCapabilityArtifacts, projectionForLayer, systemArchitectureArtifacts, type ProjectionKind } from "../../src/domain/projections.js";
import { projectTheme, type ProjectTheme } from "../../src/domain/theme.js";
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
}

setWorldConstructor(M21World);

Before(async function (this: M21World) {
  this.root = await mkdtemp(path.join(os.tmpdir(), "m21-feature-"));
});

After(async function (this: M21World) {
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
    status: "active",
  }, "# Mission\n\nBuild a coherent product.\n");
}

Given("two conceptual System Design responsibilities", async function (this: M21World) {
  await writeConcept(this, "systems/workspace.md", { type: "System Service", title: "Workspace", sdlc: ["system"], system: { kind: "subsystem", boundary: "owned" } });
  await writeConcept(this, "systems/runtime.md", { type: "System Service", title: "Runtime", sdlc: ["system"], system: { kind: "subsystem", boundary: "owned" } });
});

Given("one full-stack Application realizes both responsibilities", async function (this: M21World) {
  await writeConcept(this, "applications/full-stack.md", { type: "Application", title: "Full-Stack Application", sdlc: ["architecture", "application"], architecture: { section: "applications", kind: "full-stack", runtime: ["nodejs", "browser"], deployable: true }, application: { section: "architecture", architecture_style: "modular-monolith" }, relationships: [{ type: "realizes", target: "/systems/workspace.md" }, { type: "realizes", target: "/systems/runtime.md" }] });
});

Given("product knowledge exists for several Applications", async function (this: M21World) {
  await writeConcept(this, "applications/one.md", { type: "Application", title: "One", sdlc: ["architecture", "application", "components"], architecture: { section: "applications", kind: "web-client" }, application: { section: "architecture" } });
  await writeConcept(this, "applications/two.md", { type: "Application", title: "Two", sdlc: ["architecture", "application", "components"], architecture: { section: "applications", kind: "backend-service" }, application: { section: "architecture" } });
  await writeConcept(this, "components/one.md", { type: "Component", title: "One Component", sdlc: ["components"], components: { section: "components", kind: "module", features: ["features/architecture-topology.feature"] }, relationships: [{ type: "part-of", target: "/applications/one.md" }] });
});

Given("a selected Application Component declares a Gherkin feature", async function (this: M21World) {
  await writeConcept(this, "applications/service.md", { type: "Application", title: "Service", status: "active", sdlc: ["architecture", "application", "implementation"], architecture: { section: "applications", kind: "backend-service" }, application: { section: "architecture" } });
  await writeConcept(this, "components/engine.md", { type: "Component", title: "Engine", status: "active", sdlc: ["components", "implementation"], components: { section: "components", kind: "domain-service", features: ["features/engine.feature"] }, relationships: [{ type: "part-of", target: "/applications/service.md" }] });
});

Given("accepted OKF concepts span several product and Application layers", async function (this: M21World) {
  await writeConcept(this, "business/outcome.md", { type: "Business Goal", title: "Outcome", status: "active", sdlc: ["business"], business: { section: "outcomes" } });
  await writeConcept(this, "product/capability.md", { type: "Product Capability", title: "Capability", status: "active", sdlc: ["product"], product: { section: "capabilities" }, relationships: [{ type: "realizes", target: "/business/outcome.md" }] });
  await writeConcept(this, "systems/runtime.md", { type: "System Service", title: "Runtime", status: "active", sdlc: ["system"], system: { kind: "subsystem", boundary: "owned" }, relationships: [{ type: "realizes", target: "/product/capability.md" }] });
  await writeConcept(this, "applications/service.md", { type: "Application", title: "Service", status: "active", sdlc: ["architecture", "application"], architecture: { section: "applications", kind: "backend-service", runtime: ["nodejs"], deployable: true }, application: { section: "architecture" }, relationships: [{ type: "realizes", target: "/systems/runtime.md" }] });
  await writeConcept(this, "components/engine.md", { type: "Component", title: "Engine", status: "active", sdlc: ["components"], components: { section: "components", features: ["features/global-knowledge-graph.feature"] }, relationships: [{ type: "part-of", target: "/applications/service.md" }] });
});

Given("the product-level definition workflow specification", async function (this: M21World) {
  this.productDefinitionSpec = await readFile(path.join(process.cwd(), "spec/product-definition-workflow.md"), "utf8");
});

Given("the canonical M21 Component definitions", async function (this: M21World) {
  const project = await ProjectService.open(path.join(process.cwd(), "okf"));
  this.canonicalComponents = project.snapshot().concepts.filter((concept) => concept.type === "Component" && concept.status === "active");
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

Given("a business goal is tagged for Business", async function (this: M21World) {
  await writeConcept(this, "goal.md", {
    type: "Business Goal",
    title: "Business Outcome",
    sdlc: ["business"],
    business: { section: "outcomes" },
  }, "# Outcome\n\nCreate coherent product understanding.\n");
});

Given("a connected product capability is tagged only for Product", async function (this: M21World) {
  await writeConcept(this, "capability.md", {
    type: "Product Capability",
    title: "Product Workspace",
    sdlc: ["product"],
    product: { section: "capabilities" },
    relationships: [{ type: "realizes", target: "/goal.md" }],
  });
});

Given("the Business definition-layer registry concept", async function (this: M21World) {
  await writeConcept(this, "business-layer.md", {
    type: "Definition Layer",
    title: "Business",
    stage: "business",
    order: 10,
    sdlc: ["business"],
  });
});

Given("the definition layer is {word}", function (this: M21World, layer: string) {
  this.definitionLayer = layer;
});

Given("an active visual language without a theme", async function (this: M21World) {
  await writeConcept(this, "visual-language.md", {
    type: "Visual Language",
    title: "Project Visual Language",
    status: "active",
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
    status: "active",
    sdlc: ["design"],
    design: { section: "visual-language", theme: { accent: "#4455aa" } },
  });
});

Given("an active component story defines an actions preview", async function (this: M21World) {
  await writeConcept(this, "actions.md", {
    type: "Component Story",
    title: "Actions",
    description: "Primary and secondary controls.",
    status: "active",
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
    status: "draft",
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

Given("a draft screen contributes to Visual Design", async function (this: M21World) {
  await writeConcept(this, "screen.md", {
    type: "Screen",
    title: "Draft Workspace",
    status: "draft",
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

Given("an OKF project containing an active vision", async function (this: M21World) {
  await activeVision(this);
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

Given("an AI proposal to clarify an active vision", async function (this: M21World) {
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
  this.engineeringSkill = await readFile(path.join(process.cwd(), ".agents/skills/m21-workspace/SKILL.md"), "utf8");
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

When("I select the Product capability artifacts", async function (this: M21World) {
  const service = await open(this);
  this.productArtifacts = productCapabilityArtifacts(service.snapshot().concepts);
});

When("I select the Business main artifacts", async function (this: M21World) {
  const service = await open(this);
  this.mainArtifacts = mainArtifactsForLayer(service.snapshot().concepts, "business");
});

When("I choose its workspace projection", function (this: M21World) {
  assert(this.definitionLayer);
  this.projection = projectionForLayer(this.definitionLayer);
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

Then("every active Component references one or more existing Gherkin feature files", function (this: M21World) {
  assert(this.canonicalComponents.length > 0);
  assert.deepEqual(this.invalidComponentFeatures, []);
});

Then("it directs the agent to the M21 workspace spec", function (this: M21World) {
  assert.match(this.engineeringSkill, /spec\/m21-workspace\.md/);
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

Then("the System subsystem is displayed", function (this: M21World) {
  assert(this.systemArtifacts.some((concept) => concept.id === "runtime"));
});

Then("the realizing Application is not a System architecture artifact", function (this: M21World) {
  assert(!this.systemArtifacts.some((concept) => concept.id === "application"));
});

Then("the System architecture link is displayed", function (this: M21World) {
  assert(this.systemSnapshot?.edges.some((edge) => edge.source === "store" && edge.targetId === "workspace" && edge.type === "part-of"));
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

Then("the business goal is a main artifact", function (this: M21World) {
  assert(this.mainArtifacts.some((concept) => concept.id === "goal"));
});

Then("the product capability is not a main artifact", function (this: M21World) {
  assert(!this.mainArtifacts.some((concept) => concept.id === "capability"));
});

Then("the definition-layer registry concept is not a main artifact", function (this: M21World) {
  assert(!this.mainArtifacts.some((concept) => concept.type === "Definition Layer"));
});

Then("the projection is {word}", function (this: M21World, projection: string) {
  assert.equal(this.projection, projection);
});

Then("the active definition layer remains {word}", function (this: M21World, layer: string) {
  assert.equal(this.definitionLayer, layer);
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

Then("the draft screen is available for work", function (this: M21World) {
  assert(this.lifecycleSnapshot?.concepts.some((concept) => concept.id === "screen"));
});

Then("the product definition diagnostic remains visible when relevant", function (this: M21World) {
  assert(this.lifecycleSnapshot?.diagnostics.some((diagnostic) => diagnostic.code === "capability-traceability-gap"));
});

Then("the AI provider receives Product as the definition-layer context", function (this: M21World) {
  assert.equal(this.receivedStage, "product");
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

Then("the summary includes the draft screen", function (this: M21World) {
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
