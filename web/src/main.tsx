import cytoscape, { type Core } from "cytoscape";
import type { ForceGraph3DInstance, LinkObject, NodeObject } from "3d-force-graph";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { APPLICATION_SCOPED_LAYERS, applicationScopes, definitionLayers, snapshotForApplicationLayer, snapshotForLayer, type DefinitionLayer } from "../../src/domain/definition-flow";
import { componentFeatureFiles, mainArtifactsForLayer, productCapabilityArtifacts, projectionForLayer, projectionGroup, systemArchitectureArtifacts } from "../../src/domain/projections";
import { projectGlobalGraph } from "../../src/domain/global-graph";
import { projectTheme } from "../../src/domain/theme";
import type { ChangeKind, ChangeProposal, Concept, ProjectSnapshot } from "../../src/domain/model";
import "./styles.css";

const TYPE_COLORS: Record<string, string> = {
  Project: "#7067cf",
  Vision: "#b45f8f",
  "Business Goal": "#c76f3f",
  "Definition Layer": "#667085",
  Persona: "#3f7f72",
  Capability: "#3f6fa8",
  "Business Capability": "#c76f3f",
  "Product Capability": "#3f6fa8",
  "Product Definition": "#8063a8",
  "Experience Principle": "#9b6f43",
  "User Journey": "#3d827f",
  "Information Architecture": "#527b98",
  Screen: "#876b9c",
  "Visual Language": "#aa5d72",
  "Design Foundation": "#9b6f43",
  "Design Direction": "#aa5d72",
  "Design System": "#976b45",
  "Component Story": "#3d827f",
  System: "#446a92",
  "System Service": "#4b769d",
  "System Data Store": "#3f7f72",
  "External System": "#b16a33",
  Application: "#4b769d",
  Component: "#5984a9",
  Decision: "#9b7042",
  Constraint: "#88755e",
  Risk: "#b65353",
  "AI Agent": "#5869a8",
};

const GLOBAL_LAYER_ORDER = ["business", "product", "design", "system", "architecture", "application", "components", "code-design", "implementation", "deployment"];
const GLOBAL_LAYER_LABELS: Record<string, string> = { business: "Business", product: "Product", design: "Visual Design", system: "System Design", architecture: "Architecture", application: "App Architecture", components: "Components", "code-design": "Code Design", implementation: "Implementation", deployment: "Deployment", unscoped: "Shared context" };
const GLOBAL_LAYER_COLORS: Record<string, string> = { business: "#ffb15c", product: "#6fa8ff", design: "#f47ea8", system: "#5de1e6", architecture: "#72e39a", application: "#9d88ff", components: "#ffd45f", "code-design": "#ff7a72", implementation: "#b8c4d8", deployment: "#61d0b2", unscoped: "#f4f7fb" };

const THEME_PROPERTIES: Record<string, string> = {
  canvas: "--canvas",
  surface: "--surface",
  "surface-muted": "--surface-muted",
  text: "--text",
  muted: "--muted",
  border: "--border",
  accent: "--accent",
  "accent-contrast": "--accent-contrast",
  chrome: "--chrome",
  "chrome-text": "--chrome-text",
  proposal: "--proposal",
  warning: "--warning",
  conflict: "--conflict",
  success: "--success",
  "font-sans": "--font-sans",
  "font-mono": "--font-mono",
  "radius-small": "--radius-small",
  "radius-medium": "--radius-medium",
  "radius-large": "--radius-large",
  shadow: "--shadow",
};

function themeValidationProperty(token: string): string {
  if (token.startsWith("font-")) return "font-family";
  if (token.startsWith("radius-")) return "border-radius";
  if (token === "shadow") return "box-shadow";
  return "color";
}

function applyProjectTheme(snapshot: ProjectSnapshot): void {
  const theme = projectTheme(snapshot.concepts);
  if (!theme) return;
  for (const [token, value] of Object.entries(theme.tokens)) {
    const property = THEME_PROPERTIES[token];
    if (property && value && CSS.supports(themeValidationProperty(token), value)) {
      document.documentElement.style.setProperty(property, value);
    }
  }
  document.documentElement.dataset.projectTheme = theme.sourceConceptId;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const failure = (await response.json().catch(() => ({ error: response.statusText }))) as { error?: string };
    throw new Error(failure.error ?? response.statusText);
  }
  const type = response.headers.get("content-type") ?? "";
  return (type.includes("json") ? response.json() : response.text()) as Promise<T>;
}

function GraphCanvas({ snapshot, selectedId, onSelect, groupNamespace, embedded = false }: {
  snapshot: ProjectSnapshot;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  groupNamespace?: "system" | "components";
  embedded?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<Core | undefined>(undefined);

  useEffect(() => {
    if (!container.current) return;
    graph.current?.destroy();
    const groupFor = (concept: Concept): string | undefined => {
      if (!groupNamespace) return undefined;
      const metadata = concept.metadata[groupNamespace];
      if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
      const group = (metadata as Record<string, unknown>).group;
      return typeof group === "string" ? group : undefined;
    };
    const visibleConcepts = snapshot.concepts.filter((concept) => concept.type !== "Definition Layer");
    const visibleIds = new Set(visibleConcepts.map((concept) => concept.id));
    const groups = [...new Set(visibleConcepts.flatMap((concept) => groupFor(concept) ?? []))];
    graph.current = cytoscape({
      container: container.current,
      elements: [
        ...groups.map((group) => ({ data: { id: `group:${group}`, label: group.replaceAll("-", " "), kind: "group" } })),
        ...visibleConcepts.map((concept) => ({
          data: {
            id: concept.id,
            label: concept.title,
            type: concept.type,
            color: TYPE_COLORS[concept.type] ?? "#718096",
            ...(groupFor(concept) ? { parent: `group:${groupFor(concept)}` } : {}),
          },
        })),
        ...snapshot.edges
          .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.targetId))
          .map((edge, index) => ({
            data: { id: `e-${index}-${edge.source}-${edge.targetId}`, source: edge.source, target: edge.targetId, label: edge.type },
          })),
      ],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            label: "data(label)",
            color: "#20252c",
            "font-size": 10,
            "font-weight": 600,
            "text-wrap": "wrap",
            "text-max-width": "100px",
            "text-valign": "bottom",
            "text-margin-y": 8,
            width: 30,
            height: 30,
            "border-width": 3,
            "border-color": "#f7f5f0",
          },
        },
        {
          selector: "node[kind = 'group']",
          style: {
            "background-opacity": 0.04,
            "background-color": "#52606d",
            "border-width": 1,
            "border-style": "dashed",
            "border-color": "#8b929b",
            shape: "round-rectangle",
            label: "data(label)",
            "text-valign": "top",
            "text-halign": "center",
            "font-size": 9,
            "font-weight": 600,
            padding: "18px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.3,
            "line-color": "#a8adb3",
            "target-arrow-color": "#8a9098",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 7,
            color: "#656b73",
            "text-background-color": "#f7f5f0",
            "text-background-opacity": 0.92,
            "text-background-padding": "2px",
            "text-rotation": "autorotate",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#161a20",
            "border-width": 5,
            width: 38,
            height: 38,
          },
        },
        {
          selector: ".faded",
          style: { opacity: 0.08, "text-opacity": 0 },
        },
        {
          selector: ".context",
          style: { opacity: 1, "text-opacity": 1 },
        },
      ],
      layout: { name: "cose", animate: false, fit: true, padding: 48, nodeRepulsion: () => 9000 },
      minZoom: 0.15,
      maxZoom: 2.5,
    });
    graph.current.on("tap", "node", (event) => {
      const id = event.target.id();
      if (!id.startsWith("group:")) onSelect(id);
    });
    return () => graph.current?.destroy();
  }, [snapshot, onSelect, groupNamespace]);

  useEffect(() => {
    const cy = graph.current;
    if (!cy) return;
    cy.elements().removeClass("faded context");
    if (!selectedId) return;
    const selected = cy.getElementById(selectedId);
    if (!selected.length) return;
    cy.elements().addClass("faded");
    selected.addClass("context").select();
    selected.closedNeighborhood().addClass("context");
  }, [selectedId]);

  return <div className={`graph-canvas ${embedded ? "embedded" : ""}`} ref={container} aria-label="Application component dependency graph" />;
}


interface KnowledgeGraphNode extends NodeObject {
  id: string;
  title: string;
  type: string;
  status?: string;
  layers: string[];
  layer: string;
  color: string;
  degree: number;
}

interface KnowledgeGraphLink extends LinkObject<KnowledgeGraphNode> {
  source: string | KnowledgeGraphNode;
  target: string | KnowledgeGraphNode;
  type: string;
}

function graphEndpointId(endpoint: string | number | KnowledgeGraphNode | undefined): string {
  return typeof endpoint === "object" ? endpoint.id : String(endpoint ?? "");
}

function GlobalKnowledgeGraph({ snapshot, selectedId, onSelect, onClose }: { snapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void; onClose: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<ForceGraph3DInstance<KnowledgeGraphNode, KnowledgeGraphLink> | undefined>(undefined);
  const graphNodes = useRef<KnowledgeGraphNode[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState("");
  const projection = useMemo(() => projectGlobalGraph(snapshot), [snapshot]);
  const selected = snapshot.concepts.find((concept) => concept.id === selectedId);
  const searchResults = query.trim() ? snapshot.concepts.filter((concept) => `${concept.title} ${concept.type} ${concept.id}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];

  const focusNode = React.useCallback((id: string) => {
    onSelect(id);
    const node = graphNodes.current.find((candidate) => candidate.id === id);
    if (!node || node.x === undefined || node.y === undefined || node.z === undefined) return;
    const distance = Math.hypot(node.x, node.y, node.z) || 1;
    const ratio = 1 + 95 / distance;
    graph.current?.cameraPosition({ x: node.x * ratio, y: node.y * ratio, z: node.z * ratio }, { x: node.x, y: node.y, z: node.z }, 900);
  }, [onSelect]);

  useEffect(() => {
    if (!container.current) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const host = container.current;
    const degree = new Map<string, number>();
    for (const link of projection.links) {
      degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
      degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
    }
    const nodes: KnowledgeGraphNode[] = projection.nodes.map((node) => {
      const layer = GLOBAL_LAYER_ORDER.find((candidate) => node.layers.includes(candidate)) ?? "unscoped";
      const layerIndex = layer === "unscoped" ? GLOBAL_LAYER_ORDER.length : GLOBAL_LAYER_ORDER.indexOf(layer);
      return { ...node, layer, color: GLOBAL_LAYER_COLORS[layer]!, degree: degree.get(node.id) ?? 0, fy: (layerIndex - GLOBAL_LAYER_ORDER.length / 2) * 42 };
    });
    const links: KnowledgeGraphLink[] = projection.links.map((link) => ({ ...link }));
    graphNodes.current = nodes;

    void import("3d-force-graph").then(({ default: ForceGraph3D }) => {
      if (cancelled) return;
      const KnowledgeGraph3D = ForceGraph3D as unknown as new (element: HTMLElement, options: { controlType: "orbit"; rendererConfig: { antialias: boolean; alpha: boolean } }) => ForceGraph3DInstance<KnowledgeGraphNode, KnowledgeGraphLink>;
      const instance = new KnowledgeGraph3D(host, { controlType: "orbit", rendererConfig: { antialias: true, alpha: true } });
      graph.current = instance;
      instance
        .width(host.clientWidth)
        .height(host.clientHeight)
        .backgroundColor("#080b12")
        .showNavInfo(false)
        .nodeId("id")
        .nodeColor((node) => node.id === selectedId ? "#ffffff" : node.color)
        .nodeVal((node) => node.id === selectedId ? 8 : 1.4 + Math.min(5, Math.sqrt(node.degree + 1)))
        .nodeResolution(10)
        .nodeOpacity(.96)
        .nodeLabel((node) => {
          const label = document.createElement("div");
          label.className = "global-graph-tooltip";
          const title = document.createElement("strong"); title.textContent = node.title;
          const context = document.createElement("span"); context.textContent = `${node.type} · ${GLOBAL_LAYER_LABELS[node.layer]}`;
          label.append(title, context);
          return label;
        })
        .linkColor(() => "#72809a")
        .linkOpacity(.16)
        .linkWidth(.35)
        .linkDirectionalArrowLength(.8)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalParticles(0)
        .onNodeClick((node) => focusNode(String(node.id)))
        .onBackgroundClick(() => onSelect(""))
        .onEngineStop(() => instance.zoomToFit(700, 90))
        .warmupTicks(80)
        .cooldownTicks(220)
        .graphData({ nodes, links });
      const charge = instance.d3Force("charge") as { strength?: (value: number) => unknown } | undefined;
      charge?.strength?.(-75);
      const linkForce = instance.d3Force("link") as { distance?: (value: number) => unknown } | undefined;
      linkForce?.distance?.(38);
      instance.cameraPosition({ x: 0, y: 0, z: 720 });
      resizeObserver = new ResizeObserver(() => instance.width(host.clientWidth).height(host.clientHeight));
      resizeObserver.observe(host);
    }).catch((failure: unknown) => setLoadError(failure instanceof Error ? failure.message : String(failure)));

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      graph.current?._destructor();
      graph.current = undefined;
      graphNodes.current = [];
    };
  }, [projection, focusNode, onSelect]);

  useEffect(() => {
    const instance = graph.current;
    if (!instance) return;
    const selectedNodeId = selectedId;
    instance
      .nodeColor((node) => node.id === selectedNodeId ? "#ffffff" : node.color)
      .nodeVal((node) => node.id === selectedNodeId ? 8 : 1.4 + Math.min(5, Math.sqrt(node.degree + 1)))
      .linkColor((link) => graphEndpointId(link.source) === selectedNodeId || graphEndpointId(link.target) === selectedNodeId ? "#dce6ff" : "#72809a")
      .linkWidth((link) => graphEndpointId(link.source) === selectedNodeId || graphEndpointId(link.target) === selectedNodeId ? 1.2 : .35)
      .refresh();
  }, [selectedId]);

  const related = selected ? snapshot.edges.filter((edge) => edge.source === selected.id || edge.targetId === selected.id) : [];
  return <section className="global-graph" aria-label="Global 3D OKF knowledge graph">
    <div className="global-graph-canvas" ref={container} />
    <header className="global-graph-header"><div><span className="eyebrow">Global OKF knowledge graph</span><h1>Everything connected.</h1><p>{projection.nodes.length} concepts · {projection.links.length} typed relationships · accepted revision {projection.sourceRevision.slice(0, 8)}</p></div><button onClick={onClose} aria-label="Close global knowledge graph">Close graph</button></header>
    <div className="global-graph-search"><label htmlFor="global-graph-search">Find a concept</label><input id="global-graph-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all OKF knowledge…" />{searchResults.length > 0 && <div>{searchResults.map((concept) => <button key={concept.id} onClick={() => { setQuery(""); focusNode(concept.id); }}><i style={{ background: GLOBAL_LAYER_COLORS[GLOBAL_LAYER_ORDER.find((layer) => concept.sdlc.includes(layer)) ?? "unscoped"] }} /><span><strong>{concept.title}</strong><small>{concept.type}</small></span></button>)}</div>}</div>
    <div className="global-graph-legend"><span>Definition depth</span>{[...GLOBAL_LAYER_ORDER, "unscoped"].map((layer) => <i key={layer}><b style={{ background: GLOBAL_LAYER_COLORS[layer] }} />{GLOBAL_LAYER_LABELS[layer]}</i>)}</div>
    <div className="global-graph-help">Drag to orbit · Scroll to zoom · Right-drag to pan · Select a dot to focus</div>
    {selected && <aside className="global-graph-focus"><button className="global-focus-close" onClick={() => onSelect("")} aria-label="Clear focused concept">×</button><span className="concept-type"><i style={{ background: GLOBAL_LAYER_COLORS[GLOBAL_LAYER_ORDER.find((layer) => selected.sdlc.includes(layer)) ?? "unscoped"] }} />{selected.type}</span><h2>{selected.title}</h2><code>{selected.id}</code><p>{selected.description || "No description yet."}</p><div><strong>{related.length} relationships</strong>{related.slice(0, 12).map((edge, index) => { const outgoing = edge.source === selected.id; const otherId = outgoing ? edge.targetId : edge.source; const other = snapshot.concepts.find((concept) => concept.id === otherId); return <button key={`${edge.source}-${edge.type}-${edge.targetId}-${index}`} onClick={() => focusNode(otherId)}><small>{outgoing ? "→" : "←"} {edge.type}</small><span>{other?.title ?? otherId}</span></button>; })}</div></aside>}
    {loadError && <div className="global-graph-error"><strong>3D graph unavailable</strong><span>{loadError}</span></div>}
  </section>;
}

function systemMetadata(concept: Concept): Record<string, unknown> {
  const metadata = concept.metadata.system;
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? metadata as Record<string, unknown>
    : {};
}

function SystemArchitectureMap({ snapshot }: { snapshot: ProjectSnapshot }) {
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<Core | undefined>(undefined);

  useEffect(() => {
    if (!container.current) return;
    graph.current?.destroy();
    const workspaceStyle = getComputedStyle(document.documentElement);
    const token = (name: string) => workspaceStyle.getPropertyValue(name).trim();
    graph.current = cytoscape({
      container: container.current,
      elements: [
        ...snapshot.concepts.map((concept) => {
          const metadata = systemMetadata(concept);
          return { data: { id: concept.id, label: concept.title, kind: String(metadata.kind ?? "other"), boundary: String(metadata.boundary ?? "unknown"), group: String(metadata.group ?? "ungrouped") } };
        }),
        ...snapshot.edges.map((edge, index) => ({ data: { id: `system-edge-${index}`, source: edge.source, target: edge.targetId, label: edge.type } })),
      ],
      style: [
        { selector: "node", style: { "background-color": token("--surface"), "border-color": token("--accent"), "border-width": 2, color: token("--text"), label: "data(label)", "font-size": 15, "font-weight": 650, "text-wrap": "wrap", "text-max-width": "115px", "text-valign": "center", "text-halign": "center", width: 116, height: 54, shape: "round-rectangle" } },
        { selector: "node[kind='system']", style: { "background-color": token("--accent"), color: token("--accent-contrast"), width: 150, height: 70, "font-size": 16, "border-width": 0 } },
        { selector: "node[kind='data-store'], node[kind='database']", style: { shape: "barrel", "background-color": token("--surface-muted"), "border-color": token("--success") } },
        { selector: "node[boundary='external']", style: { shape: "round-diamond", "background-color": token("--surface"), "border-color": token("--warning"), "border-style": "dashed", width: 125, height: 70 } },
        { selector: "node[boundary='managed']", style: { "border-color": token("--success"), "border-style": "double", "border-width": 4 } },
        { selector: "node:selected", style: { "overlay-color": token("--accent"), "overlay-opacity": .12, "overlay-padding": 8, "border-width": 4 } },
        { selector: "edge", style: { width: 1.5, "line-color": token("--border"), "target-arrow-color": token("--muted"), "target-arrow-shape": "triangle", "curve-style": "bezier", label: "data(label)", color: token("--muted"), "font-size": 11, "font-family": token("--font-mono"), "text-background-color": token("--canvas"), "text-background-opacity": .9, "text-background-padding": "3px", "text-rotation": "autorotate" } },
        { selector: "edge[label='part-of']", style: { "line-style": "dashed", "target-arrow-shape": "none" } },
        { selector: "edge[label='depends-on']", style: { "line-color": token("--accent"), "target-arrow-color": token("--accent"), width: 2 } },
      ],
      layout: {
        name: "concentric",
        animate: false,
        fit: true,
        padding: 54,
        minNodeSpacing: 64,
        spacingFactor: 1.08,
        concentric: (node) => node.data("kind") === "system" ? 3 : node.data("boundary") === "owned" ? 2 : node.data("boundary") === "managed" ? 1 : 0,
        levelWidth: () => 1,
      },
    });
    graph.current.center();
    graph.current.on("tap", "node", (event) => {
      const detail = document.getElementById(`system-doc-${event.target.id()}`) as HTMLDetailsElement | null;
      if (!detail) return;
      detail.open = true;
      detail.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => graph.current?.destroy();
  }, [snapshot]);

  return <div className="system-map" ref={container} aria-label="High-level system architecture map" />;
}

function SystemArtifactDocument({ concept }: { concept: Concept }) {
  const metadata = systemMetadata(concept);
  return <details className="business-document system-document" id={`system-doc-${concept.id}`}>
    <summary>
      <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "var(--accent)" }} />{String(metadata.kind ?? concept.type)}</span>
      <strong>{concept.title}</strong>
      <p>{concept.description}</p>
      <span className="system-badges"><i>{String(metadata.boundary ?? "unknown")}</i><i>{String(metadata.criticality ?? "unspecified")}</i></span>
    </summary>
    <article className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{concept.body || "_No architecture document body yet._"}</ReactMarkdown></article>
  </details>;
}

function SystemCanvas({ snapshot }: { snapshot: ProjectSnapshot }) {
  const artifacts = systemArchitectureArtifacts(snapshot.concepts);
  const ids = new Set(artifacts.map((concept) => concept.id));
  const architectureSnapshot: ProjectSnapshot = {
    ...snapshot,
    concepts: artifacts,
    edges: snapshot.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.targetId)),
  };
  const groups = new Map<string, Concept[]>();
  for (const concept of artifacts) {
    const group = String(systemMetadata(concept).group ?? "ungrouped");
    groups.set(group, [...(groups.get(group) ?? []), concept]);
  }
  const groupOrder = ["platform", "experience", "knowledge", "guidance", "views", "data", "external-services", "delivery"];
  const orderedGroups = [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = groupOrder.indexOf(left);
    const rightIndex = groupOrder.indexOf(right);
    return (leftIndex < 0 ? groupOrder.length : leftIndex) - (rightIndex < 0 ? groupOrder.length : rightIndex) || left.localeCompare(right);
  });
  const owned = artifacts.filter((concept) => systemMetadata(concept).boundary === "owned").length;
  const external = artifacts.filter((concept) => systemMetadata(concept).boundary === "external").length;
  const stores = artifacts.filter((concept) => ["data-store", "database"].includes(String(systemMetadata(concept).kind))).length;

  return <div className="purpose-canvas system-canvas">
    <div className="system-hero"><div className="purpose-intro"><span className="eyebrow">Conceptual System Design</span><h1>Responsibilities, boundaries, and information flow</h1><p>Each node is a canonical linked OKF System Design document. This view defines logical responsibilities, data, qualities, and external boundaries without deciding whether the product uses one full-stack Application or several deployable Applications.</p></div><div className="system-metrics"><div><strong>{owned}</strong><span>owned</span></div><div><strong>{stores}</strong><span>data stores</span></div><div><strong>{external}</strong><span>external</span></div></div></div>
    <section className="architecture-board"><div className="group-heading"><h2>System architecture map</h2><span>{artifacts.length} parts · {architectureSnapshot.edges.length} links</span></div><div className="system-legend"><span><i className="owned" />Owned system or service</span><span><i className="managed" />Managed data boundary</span><span><i className="external" />External system</span><small>Select a node to open its architecture document.</small></div><SystemArchitectureMap snapshot={architectureSnapshot} /></section>
    <section className="system-documents"><div className="group-heading"><h2>Architecture documents</h2><span>Canonical OKF</span></div>{orderedGroups.map(([group, concepts]) => <div className="system-document-group" key={group}><h3>{group.replaceAll("-", " ")}</h3><div className="business-document-list">{concepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <SystemArtifactDocument concept={concept} key={concept.id} />)}</div></div>)}</section>
  </div>;
}

function ExpandableDocument({ concept }: { concept: Concept }) {
  return <details className="business-document">
    <summary>
      <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} />{concept.type}</span>
      <strong>{concept.title}</strong>
      <p>{concept.description || "No description yet."}</p>
      <span className="expand-label">Read full document</span>
    </summary>
    <article className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{concept.body || "_No document body yet._"}</ReactMarkdown>
    </article>
  </details>;
}

function DocumentCanvas({ snapshot, layer, selectedId, onSelect }: {
  snapshot: ProjectSnapshot;
  layer: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const groups = new Map<string, Concept[]>();
  for (const concept of mainArtifactsForLayer(snapshot.concepts, layer)) {
    const group = projectionGroup(concept, layer);
    groups.set(group, [...(groups.get(group) ?? []), concept]);
  }
  const businessOrder = ["vision", "problems", "personas", "capabilities", "outcomes", "metrics", "regulation", "constraints", "risks", "decisions"];
  const orderedGroups = [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = businessOrder.indexOf(left);
    const rightIndex = businessOrder.indexOf(right);
    return (leftIndex === -1 ? businessOrder.length : leftIndex) - (rightIndex === -1 ? businessOrder.length : rightIndex) || left.localeCompare(right);
  });

  if (layer === "business") {
    return <div className="purpose-canvas document-canvas business-documents">
      <div className="purpose-intro"><span className="eyebrow">Business definition</span><h1>Why this product should exist</h1><p>Main Business artifacts only. Expand a card to read its complete canonical document.</p></div>
      {orderedGroups.map(([group, concepts]) => <section className="document-group" key={group}>
        <div className="group-heading"><h2>{group.replaceAll("-", " ")}</h2><span>{concepts.length}</span></div>
        <div className="business-document-list">{concepts.sort((a,b) => a.title.localeCompare(b.title)).map((concept) => <ExpandableDocument concept={concept} key={concept.id} />)}</div>
      </section>)}
    </div>;
  }

  if (layer === "product") {
    const capabilities = productCapabilityArtifacts(snapshot.concepts)
      .sort((left, right) => left.title.localeCompare(right.title));
    return <div className="purpose-canvas document-canvas business-documents product-documents">
      <div className="purpose-intro"><span className="eyebrow">Product definition</span><h1>How the product solves the problem</h1><p>Product Capability artifacts only. Expand a card to read its complete canonical document.</p></div>
      <section className="document-group">
        <div className="group-heading"><h2>Product capabilities</h2><span>{capabilities.length}</span></div>
        <div className="business-document-list">{capabilities.map((concept) => <ExpandableDocument concept={concept} key={concept.id} />)}</div>
      </section>
    </div>;
  }

  return <div className="purpose-canvas document-canvas">
    <div className="purpose-intro"><span className="eyebrow">{layer} definition</span><h1>Definition documents</h1><p>Structured knowledge documents remain canonical OKF concepts.</p></div>
    {orderedGroups.map(([group, concepts]) => <section className="document-group" key={group}>
      <div className="group-heading"><h2>{group.replaceAll("-", " ")}</h2><span>{concepts.length}</span></div>
      <div className="document-grid">{concepts.sort((a,b) => a.title.localeCompare(b.title)).map((concept) => <button className={`document-card ${selectedId === concept.id ? "selected" : ""}`} onClick={() => onSelect(concept.id)} key={concept.id}>
        <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} />{concept.type}</span>
        <strong>{concept.title}</strong><p>{concept.description || "No description yet."}</p>
      </button>)}</div>
    </section>)}
  </div>;
}

function DesignCanvas({ snapshot, fullSnapshot, onGenerateTheme, busy }: {
  snapshot: ProjectSnapshot;
  fullSnapshot: ProjectSnapshot;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onGenerateTheme: (conceptId: string) => void;
  busy: boolean;
}) {
  const theme = projectTheme(fullSnapshot.concepts);
  const primary = mainArtifactsForLayer(snapshot.concepts, "design");
  const foundations = primary.filter((concept) => ["Visual Language", "Design Foundation", "Design Direction", "Accessibility Constraint", "Design System"].includes(concept.type));
  const stories = primary.filter((concept) => concept.type === "Component Story");
  const experience = primary.filter((concept) => !foundations.includes(concept) && !stories.includes(concept));
  const colorTokens = new Set(["canvas", "surface", "surface-muted", "text", "muted", "border", "accent", "accent-contrast", "chrome", "chrome-text", "proposal", "warning", "conflict", "success"]);
  const visualLanguage = foundations.find((concept) => concept.type === "Visual Language");
  return <div className="purpose-canvas design-canvas design-documents">
    <div className="design-hero">
      <div className="purpose-intro"><span className="eyebrow">Visual Design</span><h1>Make the product feel coherent</h1><p>Foundations describe the type, color, shape, motion, and character. The accepted theme styles this M21 workspace and the generated component preview.</p></div>
      <div className="design-actions">
        {visualLanguage && <button onClick={() => onGenerateTheme(visualLanguage.id)} disabled={busy}>{busy ? "Generating theme…" : "Generate theme from design"}</button>}
        <a className="preview-link" href="/design-preview" target="_blank" rel="noreferrer">Open component preview ↗</a>
      </div>
    </div>
    {theme && <section className="theme-board"><div className="group-heading"><h2>Active semantic theme</h2><span>Applied from {theme.sourceConceptId}</span></div><div className="swatches">{Object.entries(theme.tokens).filter(([token]) => colorTokens.has(token)).map(([token,value]) => <div className="swatch" key={token}><i style={{ background: value }} /><strong>{token}</strong><code>{value}</code></div>)}</div><div className="theme-specimens"><div style={{ fontFamily: "var(--font-sans)" }}><small>Interface type</small><strong>Product knowledge should feel calm and precise.</strong></div><div style={{ fontFamily: "var(--font-mono)" }}><small>Structured type</small><strong>realizes → product/capabilities/design</strong></div><div><small>Shape</small><span className="shape-sample">small · medium · large</span></div></div></section>}
    <section className="document-group"><div className="group-heading"><h2>Visual language documents</h2><span>{foundations.length}</span></div><div className="business-document-list">{foundations.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <ExpandableDocument concept={concept} key={concept.id} />)}</div></section>
    <section className="document-group"><div className="group-heading"><h2>Component stories</h2><span>{stories.length}</span></div><div className="component-story-grid">{stories.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <article className="component-story-card" key={concept.id}><span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "var(--accent)" }} />{concept.type}</span><h3>{concept.title}</h3><p>{concept.description}</p></article>)}</div></section>
    <section className="document-group"><div className="group-heading"><h2>Experience definition</h2><span>{experience.length}</span></div><div className="business-document-list">{experience.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <ExpandableDocument concept={concept} key={concept.id} />)}</div></section>
  </div>;
}

function realizedSystemResponsibilities(application: Concept, snapshot: ProjectSnapshot): Concept[] {
  return snapshot.edges
    .filter((edge) => edge.source === application.id && edge.type === "realizes")
    .map((edge) => snapshot.concepts.find((concept) => concept.id === edge.targetId))
    .filter((concept): concept is Concept => concept !== undefined && ["System", "System Service", "System Data Store"].includes(concept.type));
}

function ArchitectureCanvas({ fullSnapshot, onSelectApplication }: { fullSnapshot: ProjectSnapshot; onSelectApplication: (id: string) => void }) {
  const applications = applicationScopes(fullSnapshot.concepts);
  const systemResponsibilities = fullSnapshot.concepts
    .filter((concept) => concept.type === "System Service" && systemMetadata(concept).boundary === "owned")
    .sort((left, right) => left.title.localeCompare(right.title));
  return <div className="purpose-canvas application-portfolio"><div className="purpose-intro"><span className="eyebrow">Product-wide Architecture</span><h1>Choose the actual Application topology</h1><p>Map conceptual System Design responsibilities to one full-stack or monolithic Application, or to several frontend, backend, worker, and service Applications. Select an owned Application to enter its internal architecture.</p></div><section className="realization-matrix"><div className="group-heading"><h2>System Design realization</h2><span>{systemResponsibilities.length} conceptual responsibilities</span></div>{systemResponsibilities.map((system) => { const realizing = applications.filter((application) => fullSnapshot.edges.some((edge) => edge.source === application.id && edge.targetId === system.id && edge.type === "realizes")); return <div className="realization-row" key={system.id}><div><strong>{system.title}</strong><small>{system.description}</small></div><span>realized by</span><div>{realizing.length ? realizing.map((application) => <button key={application.id} onClick={() => onSelectApplication(application.id)}>{application.title}</button>) : <i>No owned Application</i>}</div></div>; })}</section><div className="group-heading application-list-heading"><h2>Owned Applications</h2><span>{applications.length}</span></div><div className="application-grid">{applications.map((application) => {
    const architecture = application.metadata.architecture as Record<string, unknown> | undefined;
    const internal = application.metadata.application as Record<string, unknown> | undefined;
    const systems = realizedSystemResponsibilities(application, fullSnapshot);
    return <button key={application.id} className="application-card" onClick={() => onSelectApplication(application.id)}><span className="concept-type"><i style={{ background: TYPE_COLORS.Application }} />{String(architecture?.kind ?? "Application")}</span><h2>{application.title}</h2><p>{application.description}</p><div className="realization-list"><small>Realizes</small>{systems.length ? systems.map((system) => <span key={system.id}>{system.title}</span>) : <span className="missing">No System Design responsibility linked</span>}</div><dl><dt>Internal style</dt><dd>{String(internal?.architecture_style ?? "To define")}</dd><dt>Runtime</dt><dd>{Array.isArray(architecture?.runtime) ? architecture.runtime.join(", ") : "To define"}</dd></dl></button>;
  })}</div></div>;
}

function ApplicationCanvas({ snapshot, fullSnapshot, selectedApplicationId }: { snapshot: ProjectSnapshot; fullSnapshot: ProjectSnapshot; selectedApplicationId: string | undefined }) {
  const application = fullSnapshot.concepts.find((concept) => concept.id === selectedApplicationId && concept.type === "Application");
  if (!application) return <div className="purpose-canvas application-portfolio"><div className="purpose-intro"><span className="eyebrow">Application Architecture</span><h1>Select an Application in Architecture</h1><p>Application Architecture requires an owned Application scope.</p></div></div>;
  const architecture = application.metadata.architecture as Record<string, unknown> | undefined;
  const internal = application.metadata.application as Record<string, unknown> | undefined;
  const systems = realizedSystemResponsibilities(application, fullSnapshot);
  const localArtifacts = snapshot.concepts.filter((concept) => concept.id !== application.id && concept.type !== "Definition Layer");
  return <div className="purpose-canvas application-detail"><div className="application-detail-hero"><div className="purpose-intro"><span className="eyebrow">Selected Application · Application Architecture</span><h1>{application.title}</h1><p>{application.description}</p></div><div className="application-facts"><div><small>Kind</small><strong>{String(architecture?.kind ?? "Application")}</strong></div><div><small>Internal style</small><strong>{String(internal?.architecture_style ?? "To define")}</strong></div><div><small>Runtime</small><strong>{Array.isArray(architecture?.runtime) ? architecture.runtime.join(", ") : "To define"}</strong></div><div><small>Deployable</small><strong>{architecture?.deployable === true ? "Yes" : "No"}</strong></div></div></div>
    <section className="application-realization"><div className="group-heading"><h2>Realized System Design responsibilities</h2><span>{systems.length}</span></div><div className="realized-system-cards">{systems.map((system) => <article key={system.id}><span className="concept-type"><i style={{ background: TYPE_COLORS[system.type] ?? "var(--accent)" }} />{system.type}</span><strong>{system.title}</strong><p>{system.description}</p></article>)}</div></section>
    <section><div className="group-heading"><h2>Canonical Application Architecture document</h2><span>OKF</span></div><ExpandableDocument concept={application} /></section>
    {localArtifacts.length > 0 && <section><div className="group-heading"><h2>Application-local architecture artifacts</h2><span>{localArtifacts.length}</span></div><div className="business-document-list">{localArtifacts.map((concept) => <ExpandableDocument concept={concept} key={concept.id} />)}</div></section>}
  </div>;
}

function ComponentDocument({ concept }: { concept: Concept }) {
  const metadata = concept.metadata.components as Record<string, unknown> | undefined;
  const features = Array.isArray(metadata?.features) ? metadata.features.filter((feature): feature is string => typeof feature === "string") : [];
  return <div className="component-contract" id={`component-doc-${concept.id}`}><div className="component-feature-set"><span>Executable Gherkin</span>{features.map((feature) => <code key={feature}>{feature.replace(/^features\//, "")}</code>)}</div><ExpandableDocument concept={concept} /></div>;
}

function ComponentCanvas({ snapshot, selectedId, onSelect }: { snapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void }) {
  const components = snapshot.concepts.filter((concept) => concept.type === "Component");
  const groups = new Map<string, Concept[]>();
  for (const component of components) {
    const metadata = component.metadata.components as Record<string, unknown> | undefined;
    const group = String(metadata?.group ?? "ungrouped");
    groups.set(group, [...(groups.get(group) ?? []), component]);
  }
  const focus = (id: string) => {
    onSelect(id);
    const detail = document.getElementById(`component-doc-${id}`)?.querySelector("details") as HTMLDetailsElement | null;
    if (detail) { detail.open = true; detail.scrollIntoView({ behavior: "smooth", block: "center" }); }
  };
  return <div className="purpose-canvas component-workspace"><div className="purpose-intro"><span className="eyebrow">Selected Application · Components</span><h1>Cohesive responsibilities and dependency direction</h1><p>The map shows Application ownership, architectural groups, and typed dependencies. Expand a Component document for its responsibilities, invariants, and non-goals.</p></div><section className="component-map-board"><div className="group-heading"><h2>Component architecture</h2><span>{components.length} components · {snapshot.edges.length} links</span></div><GraphCanvas snapshot={snapshot} selectedId={selectedId} onSelect={focus} groupNamespace="components" embedded /></section><section className="component-documents"><div className="group-heading"><h2>Component contracts</h2><span>Canonical OKF</span></div>{[...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([group, concepts]) => <div className="system-document-group" key={group}><h3>{group.replaceAll("-", " ")}</h3><div className="business-document-list">{concepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <ComponentDocument concept={concept} key={concept.id} />)}</div></div>)}</section></div>;
}

function ContractCanvas({ snapshot }: { snapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void }) {
  const artifacts = snapshot.concepts.filter((concept) => concept.type !== "Application" && concept.type !== "Definition Layer");
  const groups = new Map<string, Concept[]>();
  for (const concept of artifacts) {
    const metadata = concept.metadata["code-design"] as Record<string, unknown> | undefined;
    const section = String(metadata?.section ?? concept.type);
    groups.set(section, [...(groups.get(section) ?? []), concept]);
  }
  const order = ["models", "interfaces", "contracts", "patterns", "events", "errors", "features", "constraints", "decisions"];
  const ordered = [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = order.indexOf(left); const rightIndex = order.indexOf(right);
    return (leftIndex < 0 ? order.length : leftIndex) - (rightIndex < 0 ? order.length : rightIndex) || left.localeCompare(right);
  });
  const count = (section: string) => groups.get(section)?.length ?? 0;
  return <div className="purpose-canvas contract-canvas"><div className="contract-hero"><div className="purpose-intro"><span className="eyebrow">Selected Application · Code Design</span><h1>Regeneration-quality implementation contracts</h1><p>Models, semantic interfaces, stateful contracts, dependency rules, and failures remain independent of incidental files and symbols.</p></div><div className="system-metrics"><div><strong>{count("models")}</strong><span>models</span></div><div><strong>{count("interfaces")}</strong><span>interfaces</span></div><div><strong>{count("contracts")}</strong><span>contracts</span></div><div><strong>{count("errors")}</strong><span>errors</span></div></div></div>{ordered.map(([section, concepts]) => <section className="code-design-section" key={section}><div className="group-heading"><h2>{section.replaceAll("-", " ")}</h2><span>{concepts.length}</span></div><div className="business-document-list">{concepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <ExpandableDocument concept={concept} key={concept.id} />)}</div></section>)}</div>;
}

function HandoffCanvas({ snapshot, layer, selectedId, onSelect }: { snapshot: ProjectSnapshot; layer: "implementation" | "deployment"; selectedId: string | undefined; onSelect: (id: string) => void }) {
  const requiredFeatures = componentFeatureFiles(snapshot.concepts);
  return <div className="purpose-canvas handoff-canvas"><div className="purpose-intro"><span className="eyebrow">{layer} handoff</span><h1>{layer === "implementation" ? "Package work for a coding agent" : "Define delivery without executing it"}</h1><p>{layer === "implementation" ? "M21 assembles accepted Code Design and the selected Application Components' executable Gherkin feature sets as the primary implementation testing contract." : "M21 defines environments, topology, rollout, rollback, observability, and evidence. A coding or delivery agent realizes it."}</p></div>
    <div className="handoff-status"><strong>Definition package</strong><span>{snapshot.concepts.length} relevant concepts</span><span>{snapshot.diagnostics.length} unresolved diagnostics</span></div>
    {layer === "implementation" && <section className="implementation-features"><div className="group-heading"><h2>Required executable Gherkin</h2><span>{requiredFeatures.length} feature files</span></div><div>{requiredFeatures.map((feature) => <code key={feature}>{feature}</code>)}</div><p>Implementation must satisfy these Component-owned features. Focused lower-level tests supplement rather than replace them.</p></section>}
    <div className="document-grid">{snapshot.concepts.filter((c) => c.type !== "Definition Layer").map((concept) => <button className={`document-card ${selectedId === concept.id ? "selected" : ""}`} key={concept.id} onClick={() => onSelect(concept.id)}><small>{concept.type}</small><strong>{concept.title}</strong><p>{concept.description}</p></button>)}</div>
  </div>;
}

function PurposeCanvas({ layer, snapshot, fullSnapshot, selectedId, onSelect, selectedApplicationId, onSelectApplication, onGenerateTheme, busy }: { layer: string | undefined; snapshot: ProjectSnapshot; fullSnapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void; selectedApplicationId: string | undefined; onSelectApplication: (id: string) => void; onGenerateTheme: (conceptId: string) => void; busy: boolean }) {
  const projection = layer ? projectionForLayer(layer) : undefined;
  if (projection === "documents" && layer) return <DocumentCanvas snapshot={snapshot} layer={layer} selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "design-system") return <DesignCanvas snapshot={snapshot} fullSnapshot={fullSnapshot} selectedId={selectedId} onSelect={onSelect} onGenerateTheme={onGenerateTheme} busy={busy} />;
  if (projection === "system-architecture") return <SystemCanvas snapshot={snapshot} />;
  if (projection === "application-portfolio") return <ArchitectureCanvas fullSnapshot={fullSnapshot} onSelectApplication={onSelectApplication} />;
  if (projection === "application-architecture") return <ApplicationCanvas snapshot={snapshot} fullSnapshot={fullSnapshot} selectedApplicationId={selectedApplicationId} />;
  if (projection === "contract-registry") return <ContractCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "implementation-handoff") return <HandoffCanvas snapshot={snapshot} layer="implementation" selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "deployment-definition") return <HandoffCanvas snapshot={snapshot} layer="deployment" selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "component-dependencies") return <ComponentCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} />;
  return <div className="purpose-canvas"><p className="quiet">No purpose-built workspace is defined for this layer.</p></div>;
}

function StageRail({ stages, selected, counts, onSelect }: {
  stages: DefinitionLayer[];
  selected: string | undefined;
  counts: Map<string, number>;
  onSelect: (stage: string | undefined) => void;
}) {
  const productWide = ["business", "product", "design", "system", "architecture"]
    .map((id) => stages.find((stage) => stage.id === id))
    .filter((stage): stage is DefinitionLayer => stage !== undefined);
  const applicationSelected = selected !== undefined && APPLICATION_SCOPED_LAYERS.includes(selected as typeof APPLICATION_SCOPED_LAYERS[number]);
  return <nav className="stage-rail" aria-label="Product-wide definition flow">
    <span className="stage-label">PRODUCT</span>
    {productWide.map((stage) => { const active = selected === stage.id || (stage.id === "architecture" && applicationSelected); return <button key={stage.id} className={active ? "selected" : ""} onClick={() => onSelect(stage.id)} title={stage.description}><strong>{stage.shortTitle}</strong><small>{counts.get(stage.id) ?? 0} {stage.id === "architecture" ? "owned applications" : "artifacts"}</small></button>; })}
  </nav>;
}

function ApplicationScopeRail({ stages, applications, selectedApplicationId, selectedLayer, counts, onSelectApplication, onSelectLayer }: {
  stages: DefinitionLayer[];
  applications: Concept[];
  selectedApplicationId: string | undefined;
  selectedLayer: string | undefined;
  counts: Map<string, number>;
  onSelectApplication: (id: string) => void;
  onSelectLayer: (layer: string) => void;
}) {
  const scopedStages = APPLICATION_SCOPED_LAYERS
    .map((id) => stages.find((stage) => stage.id === id))
    .filter((stage): stage is DefinitionLayer => stage !== undefined);
  return <nav className="application-scope-rail" aria-label="Selected Application definition flow">
    <label><span>Application scope</span><select value={selectedApplicationId ?? ""} onChange={(event) => onSelectApplication(event.target.value)}><option value="">Select an Application…</option>{applications.map((application) => <option value={application.id} key={application.id}>{application.title}</option>)}</select></label>
    <div className="application-layer-tabs">{scopedStages.map((stage) => <button key={stage.id} className={selectedLayer === stage.id ? "selected" : ""} disabled={!selectedApplicationId && stage.id !== "application"} onClick={() => onSelectLayer(stage.id)}><strong>{stage.shortTitle}</strong><small>{counts.get(stage.id) ?? 0}</small></button>)}</div>
  </nav>;
}

function ConceptNavigator({ concepts, selectedId, onSelect }: {
  concepts: Concept[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const types = useMemo(() => [...new Set(concepts.map((concept) => concept.type))].sort(), [concepts]);
  const visible = concepts.filter((concept) => {
    const matchesQuery = `${concept.title} ${concept.description} ${concept.id}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (type === "all" || concept.type === type);
  });

  return <aside className="navigator" aria-label="Project navigator">
    <div className="panel-heading">
      <span className="eyebrow">Navigate</span>
      <strong>{visible.length}</strong>
    </div>
    <label className="field compact">
      <span>Search knowledge</span>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Vision, journey, system…" />
    </label>
    <label className="field compact">
      <span>Concept type</span>
      <select value={type} onChange={(event) => setType(event.target.value)}>
        <option value="all">All types</option>
        {types.map((candidate) => <option key={candidate}>{candidate}</option>)}
      </select>
    </label>
    <div className="concept-list" role="list">
      {visible.sort((a, b) => a.title.localeCompare(b.title)).map((concept) =>
        <button
          className={`concept-row ${selectedId === concept.id ? "selected" : ""}`}
          key={concept.id}
          onClick={() => onSelect(concept.id)}
          role="listitem"
        >
          <span className="type-dot" style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} aria-hidden="true" />
          <span><strong>{concept.title}</strong><small>{concept.type}</small></span>
        </button>,
      )}
    </div>
  </aside>;
}

function ProposalReview({ proposal, snapshot, onAccept, busy }: {
  proposal: ChangeProposal;
  snapshot: ProjectSnapshot;
  onAccept: () => void;
  busy: boolean;
}) {
  const operation = proposal.operations[0];
  const changed = operation ? snapshot.concepts.find((concept) => concept.id === operation.conceptId) : undefined;
  return <section className="proposal" aria-labelledby="proposal-title">
    <div className="proposal-header">
      <div>
        <span className="eyebrow">{proposal.provenance} proposal</span>
        <h3 id="proposal-title">{proposal.summary}</h3>
      </div>
      <span className="status proposed">Proposed</span>
    </div>
    <p>Changes <strong>{changed?.title ?? operation?.conceptId}</strong>. Canonical knowledge is unchanged.</p>
    {operation && <dl className="change-preview">
      {Object.entries(operation.changes).map(([key, value]) => <React.Fragment key={key}>
        <dt>{key}</dt><dd>{typeof value === "string" ? value : JSON.stringify(value)}</dd>
      </React.Fragment>)}
    </dl>}
    <h4>Potential impact</h4>
    {proposal.impact.length === 0
      ? <p className="quiet">No dependent concepts require review under the current policy.</p>
      : <ul className="impact-list">{proposal.impact.map((finding) => <li key={`${finding.conceptId}-${finding.relationshipType}`}>
          <strong>{snapshot.concepts.find((concept) => concept.id === finding.conceptId)?.title ?? finding.conceptId}</strong>
          <span>{finding.reason}</span>
          <small>{finding.confidence} · {finding.path.join(" → ")}</small>
        </li>)}</ul>}
    <div className="actions">
      <button className="primary" onClick={onAccept} disabled={busy}>{busy ? "Accepting…" : "Accept change"}</button>
    </div>
  </section>;
}

function Inspector({ concept, snapshot, stage, onProposal, onAgentProposal }: {
  concept: Concept | undefined;
  snapshot: ProjectSnapshot;
  stage: string | undefined;
  onProposal: (proposal: ChangeProposal) => void;
  onAgentProposal: (proposal: ChangeProposal) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [changeKind, setChangeKind] = useState<ChangeKind>("contract");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDescription(concept?.description ?? "");
    setBody(concept?.body ?? "");
    setEditing(false);
    setInstruction("");
    setError("");
  }, [concept?.id]);

  if (!concept) return <aside className="inspector empty"><p>Select a concept to focus its context.</p></aside>;
  const outgoing = snapshot.edges.filter((edge) => edge.source === concept.id);
  const incoming = snapshot.edges.filter((edge) => edge.targetId === concept.id);

  async function createProposal() {
    setBusy(true); setError("");
    try {
      const proposal = await api<ChangeProposal>("/api/proposals", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ conceptId: concept?.id, changes: { description, body }, changeKind, summary: `Revise ${concept?.title}` }),
      });
      onProposal(proposal); setEditing(false);
    } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setBusy(false); }
  }

  async function askAgent() {
    if (!instruction.trim()) return;
    setBusy(true); setError("");
    try {
      const proposal = await api<ChangeProposal>("/api/agent", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ conceptId: concept?.id, instruction, stage }),
      });
      onAgentProposal(proposal);
    } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setBusy(false); }
  }

  return <aside className="inspector" aria-label={`Focused concept: ${concept.title}`}>
    <div className="inspector-scroll">
      <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} />{concept.type}</span>
      <h2>{concept.title}</h2>
      <code>{concept.id}</code>
      {editing ? <section className="edit-form">
        <label className="field"><span>Description</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="field"><span>Knowledge body</span><textarea rows={14} value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <label className="field"><span>Meaning of change</span><select value={changeKind} onChange={(event) => setChangeKind(event.target.value as ChangeKind)}>
          <option value="editorial">Editorial only</option><option value="internal">Internal realization</option><option value="contract">Contract or outcome</option><option value="structural">Graph structure</option>
        </select></label>
        <div className="actions"><button className="primary" onClick={createProposal} disabled={busy}>Review proposal</button><button onClick={() => setEditing(false)}>Cancel</button></div>
      </section> : <>
        <p className="description">{concept.description || "No description yet."}</p>
        <div className="actions"><button onClick={() => setEditing(true)}>Edit as proposal</button></div>
        <section className="knowledge-body"><h3>Knowledge</h3><pre>{concept.body || "No body content yet."}</pre></section>
      </>}

      <section><h3>Relationships</h3>
        {outgoing.length + incoming.length === 0 ? <p className="quiet">No typed relationships.</p> : <ul className="relationship-list">
          {outgoing.map((edge) => <li key={`out-${edge.type}-${edge.targetId}`}><span>→ {edge.type}</span><strong>{snapshot.concepts.find((item) => item.id === edge.targetId)?.title ?? edge.targetId}</strong></li>)}
          {incoming.map((edge) => <li key={`in-${edge.type}-${edge.source}`}><span>← {edge.type}</span><strong>{snapshot.concepts.find((item) => item.id === edge.source)?.title ?? edge.source}</strong></li>)}
        </ul>}
      </section>

      <section className="agent-card"><span className="eyebrow">M21 agent · {stage ? `${stage} layer` : "whole product"}</span><h3>Develop this concept</h3>
        <label className="field"><span>What should the agent examine?</span><textarea rows={3} value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Challenge the assumptions in this concept…" /></label>
        <button onClick={askAgent} disabled={busy || !instruction.trim()}>{busy ? "Thinking…" : "Create AI proposal"}</button>
      </section>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  </aside>;
}

function App() {
  const [snapshot, setSnapshot] = useState<ProjectSnapshot>();
  const [selectedId, setSelectedId] = useState<string>();
  const [proposal, setProposal] = useState<ChangeProposal>();
  const [selectedStage, setSelectedStage] = useState<string | undefined>(
    () => new URLSearchParams(window.location.search).get("layer") ?? "business",
  );
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>(
    () => new URLSearchParams(window.location.search).get("app") ?? undefined,
  );
  const [globalGraphOpen, setGlobalGraphOpen] = useState(
    () => new URLSearchParams(window.location.search).get("view") === "graph",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    api<ProjectSnapshot>("/api/project").then((project) => {
      setSnapshot(project);
    }).catch((failure) => setError(failure instanceof Error ? failure.message : String(failure)));
  }, []);

  useEffect(() => {
    if (snapshot) applyProjectTheme(snapshot);
  }, [snapshot]);

  const stages = useMemo(() => snapshot ? definitionLayers(snapshot.concepts) : [], [snapshot]);
  const applications = useMemo(() => snapshot ? applicationScopes(snapshot.concepts) : [], [snapshot]);
  const stageCounts = useMemo(() => new Map(stages.map((stage) => {
    if (!snapshot) return [stage.id, 0] as const;
    const count = stage.id === "product"
      ? productCapabilityArtifacts(snapshot.concepts).length
      : stage.id === "system"
        ? systemArchitectureArtifacts(snapshot.concepts).length
        : stage.id === "architecture"
          ? applications.length
          : mainArtifactsForLayer(snapshot.concepts, stage.id).length;
    return [stage.id, count] as const;
  })), [snapshot, stages, applications]);
  const applicationLayerSelected = selectedStage !== undefined && APPLICATION_SCOPED_LAYERS.includes(selectedStage as typeof APPLICATION_SCOPED_LAYERS[number]);
  const scopedSnapshot = useMemo(() => {
    if (!snapshot || !selectedStage) return snapshot;
    if (applicationLayerSelected && selectedApplicationId) return snapshotForApplicationLayer(snapshot, selectedApplicationId, selectedStage);
    return snapshotForLayer(snapshot, applicationLayerSelected ? "application" : selectedStage);
  }, [snapshot, selectedStage, selectedApplicationId, applicationLayerSelected]);
  const applicationLayerCounts = useMemo(() => new Map(APPLICATION_SCOPED_LAYERS.map((layer) => {
    if (!snapshot) return [layer, 0] as const;
    if (!selectedApplicationId) return [layer, layer === "application" ? applications.length : 0] as const;
    const scoped = snapshotForApplicationLayer(snapshot, selectedApplicationId, layer);
    const count = layer === "application" ? 1 : scoped.concepts.filter((concept) => concept.type !== "Application").length;
    return [layer, count] as const;
  })), [snapshot, selectedApplicationId, applications]);

  useEffect(() => {
    if (!snapshot) return;
    if (selectedApplicationId && !applications.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(undefined);
      const url = new URL(window.location.href);
      url.searchParams.delete("app");
      window.history.replaceState({}, "", url);
      return;
    }
    if (applicationLayerSelected && !selectedApplicationId) {
      setSelectedStage("architecture");
      const url = new URL(window.location.href);
      url.searchParams.set("layer", "architecture");
      window.history.replaceState({}, "", url);
    }
  }, [snapshot, applications, selectedApplicationId, selectedStage, applicationLayerSelected]);

  useEffect(() => {
    if (!scopedSnapshot || globalGraphOpen) return;
    const currentSelection = scopedSnapshot.concepts.find((concept) => concept.id === selectedId);
    if (currentSelection) return;
    if (applicationLayerSelected && selectedStage !== "application") {
      setSelectedId(undefined);
      return;
    }
    const preferredType: Record<string, string> = {
      business: "Business Goal",
      product: "Product Definition",
      design: "Visual Language",
      system: "System",
      architecture: "Application",
      application: "Application",
      components: "Component",
      "code-design": "Domain Model",
      implementation: "Definition Layer",
      deployment: "Definition Layer",
    };
    const preferred = selectedStage
      ? scopedSnapshot.concepts.find((concept) => concept.type === preferredType[selectedStage])
      : undefined;
    const layerConcept = stages.find((stage) => stage.id === selectedStage)?.conceptId;
    const firstVisible = scopedSnapshot.concepts.find((concept) => concept.type !== "Definition Layer");
    setSelectedId(preferred?.id ?? layerConcept ?? firstVisible?.id ?? scopedSnapshot.concepts[0]?.id);
  }, [scopedSnapshot, selectedId, selectedStage, stages, applicationLayerSelected, globalGraphOpen]);

  const select = React.useCallback((id: string) => setSelectedId(id), []);
  const selectLayer = React.useCallback((layer: string | undefined) => {
    setSelectedId(undefined);
    setSelectedStage(layer);
    const url = new URL(window.location.href);
    if (layer) url.searchParams.set("layer", layer);
    else url.searchParams.delete("layer");
    window.history.replaceState({}, "", url);
  }, []);
  const selectApplication = React.useCallback((applicationId: string) => {
    const nextApplicationId = applicationId || undefined;
    const nextLayer = nextApplicationId ? (applicationLayerSelected ? selectedStage ?? "application" : "application") : "architecture";
    setSelectedApplicationId(nextApplicationId);
    setSelectedStage(nextLayer);
    setSelectedId(nextApplicationId);
    const url = new URL(window.location.href);
    url.searchParams.set("layer", nextLayer);
    if (nextApplicationId) url.searchParams.set("app", nextApplicationId);
    else url.searchParams.delete("app");
    window.history.replaceState({}, "", url);
  }, [applicationLayerSelected, selectedStage]);
  const setGlobalGraph = React.useCallback((open: boolean) => {
    setGlobalGraphOpen(open);
    const url = new URL(window.location.href);
    if (open) url.searchParams.set("view", "graph");
    else url.searchParams.delete("view");
    window.history.replaceState({}, "", url);
  }, []);
  if (error && !snapshot) return <main className="fatal"><h1>Unable to open M21</h1><p>{error}</p></main>;
  if (!snapshot || !scopedSnapshot) return <main className="loading"><span className="brand-mark">M21</span><p>Opening product knowledge…</p></main>;
  const selected = snapshot.concepts.find((concept) => concept.id === selectedId);

  async function acceptProposal() {
    if (!proposal) return;
    setBusy(true); setError("");
    try {
      const updated = await api<ProjectSnapshot>(`/api/proposals/${proposal.id}/accept`, { method: "POST" });
      setSnapshot(updated); setProposal(undefined);
    } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setBusy(false); }
  }

  async function openSummary() {
    try {
      const query = selectedStage ? `?stage=${encodeURIComponent(selectedStage)}` : "";
      setSummary(await api<string>(`/api/views/project-summary${query}`));
    }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  }

  async function generateTheme(conceptId: string) {
    setBusy(true); setError("");
    try {
      const nextProposal = await api<ChangeProposal>("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conceptId,
          stage: "design",
          instruction: "Generate a complete semantic M21 theme from the accepted visual-language, accessibility, and design-foundation context. Preserve Visual Design organization metadata.",
        }),
      });
      setProposal(nextProposal);
    } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setBusy(false); }
  }

  const documentFocus = selectedStage === "business" || selectedStage === "product" || selectedStage === "design" || selectedStage === "system" || selectedStage === "architecture" || applicationLayerSelected;
  return <div className={`app-shell ${documentFocus ? "document-focus" : ""} ${applicationLayerSelected ? "application-context" : ""} ${globalGraphOpen ? "global-graph-open" : ""}`}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark">M21</span><div><strong>{snapshot.name}</strong><small>Product engineering workspace</small></div></div>
      <div className="project-health">
        <button className={`global-graph-action ${globalGraphOpen ? "selected" : ""}`} onClick={() => setGlobalGraph(!globalGraphOpen)} aria-pressed={globalGraphOpen}><span className="graph-action-icon" aria-hidden="true">✣</span>{globalGraphOpen ? "Return to workspace" : "Global graph"}</button>
        <button className="attention" onClick={() => setSelectedId(snapshot.diagnostics[0]?.conceptIds[0])} disabled={!snapshot.diagnostics.length}>
          <span>{snapshot.diagnostics.length}</span> needs attention
        </button>
        <button onClick={openSummary}>Generate summary</button>
      </div>
    </header>
    {globalGraphOpen && <GlobalKnowledgeGraph snapshot={snapshot} selectedId={selectedId} onSelect={select} onClose={() => setGlobalGraph(false)} />}
    <StageRail stages={stages} selected={selectedStage} counts={stageCounts} onSelect={selectLayer} />
    {applicationLayerSelected && <ApplicationScopeRail stages={stages} applications={applications} selectedApplicationId={selectedApplicationId} selectedLayer={selectedStage} counts={applicationLayerCounts} onSelectApplication={selectApplication} onSelectLayer={(layer) => selectLayer(layer)} />}
    {!documentFocus && <ConceptNavigator concepts={scopedSnapshot.concepts} selectedId={selectedId} onSelect={select} />}
    <main className="canvas-region">
      <div className="canvas-toolbar"><span><strong>{selectedStage ? `${stages.find((stage) => stage.id === selectedStage)?.title ?? selectedStage} definition` : "Product overview"}</strong> · {scopedSnapshot.concepts.length} concepts · {scopedSnapshot.edges.length} relationships</span><span className="quiet">Concept types remain independent of definition layers</span></div>
      <PurposeCanvas layer={selectedStage} snapshot={scopedSnapshot} fullSnapshot={snapshot} selectedId={selectedId} onSelect={select} selectedApplicationId={selectedApplicationId} onSelectApplication={selectApplication} onGenerateTheme={generateTheme} busy={busy} />
      {proposal && <div className="review-drawer"><ProposalReview proposal={proposal} snapshot={snapshot} onAccept={acceptProposal} busy={busy} /></div>}
      {summary && <div className="summary-drawer"><div className="drawer-heading"><div><span className="eyebrow">Generated view{selectedStage ? ` · ${selectedStage}` : ""}</span><h2>Project summary</h2></div><button onClick={() => setSummary("")}>Close</button></div><pre>{summary}</pre></div>}
      {error && <div className="toast error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
    </main>
    {!documentFocus && <Inspector concept={selected} snapshot={snapshot} stage={selectedStage} onProposal={setProposal} onAgentProposal={setProposal} />}
  </div>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
