import cytoscape, { type Core } from "cytoscape";
import type { ForceGraph3DInstance, LinkObject, NodeObject } from "3d-force-graph";
import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { APPLICATION_SCOPED_LAYERS, applicationScopes, definitionLayers, snapshotForApplicationLayer, snapshotForLayer, type DefinitionLayer } from "../../src/domain/definition-flow";
import { BUSINESS_SECTIONS, businessArtifacts, businessSection, type BusinessSection } from "../../src/domain/business";
import { componentFeatureFiles, mainArtifactsForLayer, productCapabilityArtifacts, projectionForLayer, projectionGroup, systemArchitectureArtifacts } from "../../src/domain/projections";
import { projectGlobalGraph } from "../../src/domain/global-graph";
import { SOLUTION_SECTIONS, solutionArtifacts, solutionSection, type SolutionSection } from "../../src/domain/solution";
import { VISUAL_DESIGN_SECTIONS, activeVisualTheme, renderFoundationSpecimen, renderThemeSpecimen, renderVisualComponent, visualDesignArtifacts, visualDesignSection, type VisualDesignSection, type VisualSpecimen } from "../../src/domain/visual-design";
import { systemBoundary, systemSection } from "../../src/domain/system-design";
import { architectureApplications, architectureArtifacts } from "../../src/domain/architecture";
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

const GLOBAL_AREA_ORDER = ["business", "solution", "visual-design", "system", "architecture", "experience", "application", "components", "code-design", "implementation", "deployment"];
const GLOBAL_AREA_LABELS: Record<string, string> = { business: "Business", solution: "Business Solution", "visual-design": "Visual Design", system: "System Design", architecture: "Architecture", experience: "App Experience", application: "App Architecture", components: "Components", "code-design": "Code Design", implementation: "Implementation", deployment: "Deployment", unscoped: "Shared context" };
const GLOBAL_AREA_COLORS: Record<string, string> = { business: "#ffb15c", solution: "#6fa8ff", "visual-design": "#f47ea8", system: "#5de1e6", architecture: "#72e39a", experience: "#c58cff", application: "#9d88ff", components: "#ffd45f", "code-design": "#ff7a72", implementation: "#b8c4d8", deployment: "#61d0b2", unscoped: "#f4f7fb" };
const LEGACY_AREA: Record<string, string> = { product: "solution", design: "experience" };

function conceptArea(concept: Pick<Concept, "area" | "sdlc">): string {
  const legacy = concept.sdlc[0];
  return concept.area ?? (legacy ? LEGACY_AREA[legacy] ?? legacy : "unscoped");
}

const DebugSourceContext = createContext<{ enabled: boolean; inspect: (concept: Concept) => void }>({ enabled: false, inspect: () => undefined });

function ConceptSourceAction({ concept, className = "" }: { concept: Concept; className?: string }) {
  const debug = useContext(DebugSourceContext);
  if (!debug.enabled) return null;
  return <button type="button" className={`concept-source-action ${className}`.trim()} title={`Show raw Markdown for ${concept.title}`} aria-label={`Show raw Markdown for ${concept.title}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); debug.inspect(concept); }}><span aria-hidden="true">&lt;/&gt;</span></button>;
}

function MermaidDiagram({ source }: { source: string }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setSvg(""); setError("");
    void import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral", suppressErrorRendering: true });
      const rendered = await mermaid.render(id, source);
      if (!cancelled) setSvg(rendered.svg);
    }).catch((failure: unknown) => {
      if (!cancelled) setError(failure instanceof Error ? failure.message : String(failure));
    });
    return () => { cancelled = true; document.getElementById(`d${id}`)?.remove(); };
  }, [id, source]);
  if (error) return <div className="mermaid-error" role="alert"><strong>Diagram could not be rendered</strong><span>{error}</span><pre><code>{source}</code></pre></div>;
  if (!svg) return <div className="mermaid-loading">Rendering diagram…</div>;
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function MarkdownDocument({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    pre({ children: preChildren, ...props }) {
      const child = React.Children.only(preChildren);
      return React.isValidElement(child) && child.type === MermaidDiagram ? child : <pre {...props}>{preChildren}</pre>;
    },
    code({ className, children: codeChildren, ...props }) {
      const language = /language-([^ ]+)/.exec(className ?? "")?.[1];
      if (language === "mermaid") return <MermaidDiagram source={String(codeChildren).replace(/\n$/, "")} />;
      return <code className={className} {...props}>{codeChildren}</code>;
    },
  }}>{children}</ReactMarkdown>;
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
  groupNamespace?: "system" | "architecture" | "components";
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
      const values = metadata as Record<string, unknown>;
      const group = values.group ?? values.section;
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

  return <div className={`graph-canvas ${embedded ? "embedded" : ""}`} ref={container} aria-label="Typed concept relationship graph" />;
}


interface KnowledgeGraphNode extends NodeObject {
  id: string;
  title: string;
  type: string;
  area?: string;
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

function graphEndpointArea(endpoint: string | number | KnowledgeGraphNode | undefined, nodes: KnowledgeGraphNode[]): string {
  if (typeof endpoint === "object") return endpoint.layer;
  return nodes.find((node) => node.id === String(endpoint ?? ""))?.layer ?? "unscoped";
}

function GlobalKnowledgeGraph({ snapshot, selectedId, onSelect, onClose }: { snapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void; onClose: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<ForceGraph3DInstance<KnowledgeGraphNode, KnowledgeGraphLink> | undefined>(undefined);
  const graphNodes = useRef<KnowledgeGraphNode[]>([]);
  const [query, setQuery] = useState("");
  const [highlightArea, setHighlightArea] = useState("");
  const [loadError, setLoadError] = useState("");
  const projection = useMemo(() => projectGlobalGraph(snapshot), [snapshot]);
  const availableAreas = GLOBAL_AREA_ORDER.filter((area) => projection.nodes.some((node) => {
    const legacyLayer = node.layers[0];
    return (node.area ?? (legacyLayer ? LEGACY_AREA[legacyLayer] ?? legacyLayer : "unscoped")) === area;
  }));
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
      const legacyLayer = node.layers[0];
      const layer = node.area ?? (legacyLayer ? LEGACY_AREA[legacyLayer] ?? legacyLayer : "unscoped");
      const layerIndex = layer === "unscoped" ? GLOBAL_AREA_ORDER.length : GLOBAL_AREA_ORDER.indexOf(layer);
      return { ...node, layer, color: GLOBAL_AREA_COLORS[layer] ?? GLOBAL_AREA_COLORS.unscoped!, degree: degree.get(node.id) ?? 0, fy: ((layerIndex < 0 ? GLOBAL_AREA_ORDER.length : layerIndex) - GLOBAL_AREA_ORDER.length / 2) * 42 };
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
        .nodeColor((node) => node.id === selectedId ? "#ffffff" : highlightArea && node.layer !== highlightArea ? "#252d3b" : node.color)
        .nodeVal((node) => node.id === selectedId ? 8 : 1.4 + Math.min(5, Math.sqrt(node.degree + 1)))
        .nodeResolution(10)
        .nodeOpacity(.96)
        .nodeLabel((node) => {
          const label = document.createElement("div");
          label.className = "global-graph-tooltip";
          const title = document.createElement("strong"); title.textContent = node.title;
          const context = document.createElement("span"); context.textContent = `${node.type} · ${GLOBAL_AREA_LABELS[node.layer] ?? node.layer}`;
          label.append(title, context);
          return label;
        })
        .linkColor((link) => highlightArea && (graphEndpointArea(link.source, nodes) !== highlightArea || graphEndpointArea(link.target, nodes) !== highlightArea) ? "#202736" : "#72809a")
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
    const nodes = graphNodes.current;
    instance
      .nodeColor((node) => node.id === selectedNodeId ? "#ffffff" : highlightArea && node.layer !== highlightArea ? "#252d3b" : node.color)
      .nodeVal((node) => node.id === selectedNodeId ? 8 : 1.4 + Math.min(5, Math.sqrt(node.degree + 1)))
      .linkColor((link) => graphEndpointId(link.source) === selectedNodeId || graphEndpointId(link.target) === selectedNodeId
        ? "#dce6ff"
        : highlightArea && (graphEndpointArea(link.source, nodes) !== highlightArea || graphEndpointArea(link.target, nodes) !== highlightArea) ? "#202736" : "#72809a")
      .linkWidth((link) => graphEndpointId(link.source) === selectedNodeId || graphEndpointId(link.target) === selectedNodeId ? 1.2 : .35)
      .refresh();
  }, [selectedId, highlightArea]);

  const related = selected ? snapshot.edges.filter((edge) => edge.source === selected.id || edge.targetId === selected.id) : [];
  return <section className="global-graph" aria-label="Global 3D OKF knowledge graph">
    <div className="global-graph-canvas" ref={container} />
    <header className="global-graph-header"><div><span className="eyebrow">Global OKF knowledge graph</span><h1>Everything connected.</h1><p>{projection.nodes.length} concepts · {projection.links.length} typed relationships · accepted revision {projection.sourceRevision.slice(0, 8)}</p></div><button onClick={onClose} aria-label="Close global knowledge graph">Close graph</button></header>
    <div className="global-graph-search"><label htmlFor="global-graph-search">Find a concept</label><input id="global-graph-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all OKF knowledge…" />{searchResults.length > 0 && <div>{searchResults.map((concept) => <button key={concept.id} onClick={() => { setQuery(""); focusNode(concept.id); }}><i style={{ background: GLOBAL_AREA_COLORS[conceptArea(concept)] ?? GLOBAL_AREA_COLORS.unscoped }} /><span><strong>{concept.title}</strong><small>{concept.type}</small></span></button>)}</div>}</div>
    <div className="global-graph-legend"><label><span>Highlight Definition Area</span><select value={highlightArea} onChange={(event) => setHighlightArea(event.target.value)}><option value="">All areas</option>{availableAreas.map((area) => <option key={area} value={area}>{GLOBAL_AREA_LABELS[area]}</option>)}</select></label>{availableAreas.map((area) => <button className={highlightArea === area ? "selected" : ""} onClick={() => setHighlightArea(highlightArea === area ? "" : area)} key={area}><b style={{ background: GLOBAL_AREA_COLORS[area] ?? GLOBAL_AREA_COLORS.unscoped }} />{GLOBAL_AREA_LABELS[area] ?? area}</button>)}</div>
    <div className="global-graph-help">Drag to orbit · Scroll to zoom · Right-drag to pan · Select a dot to focus</div>
    {selected && <aside className="global-graph-focus"><button className="global-focus-close" onClick={() => onSelect("")} aria-label="Clear focused concept">×</button><ConceptSourceAction concept={selected} /><span className="concept-type"><i style={{ background: GLOBAL_AREA_COLORS[conceptArea(selected)] ?? GLOBAL_AREA_COLORS.unscoped }} />{selected.type}</span><h2>{selected.title}</h2><code>{selected.id}</code><p>{selected.description || "No description yet."}</p><div><strong>{related.length} relationships</strong>{related.slice(0, 12).map((edge, index) => { const outgoing = edge.source === selected.id; const otherId = outgoing ? edge.targetId : edge.source; const other = snapshot.concepts.find((concept) => concept.id === otherId); return <button key={`${edge.source}-${edge.type}-${edge.targetId}-${index}`} onClick={() => focusNode(otherId)}><small>{outgoing ? "→" : "←"} {edge.type}</small><span>{other?.title ?? otherId}</span></button>; })}</div></aside>}
    {loadError && <div className="global-graph-error"><strong>3D graph unavailable</strong><span>{loadError}</span></div>}
  </section>;
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
          const parent = snapshot.edges.find((edge) => edge.source === concept.id && edge.type === "part-of" && snapshot.concepts.some((candidate) => candidate.id === edge.targetId));
          return { data: { id: concept.id, label: concept.title, kind: concept.type, section: systemSection(concept) ?? "other", boundary: systemBoundary(concept) ?? "none", ...(parent ? { parent: parent.targetId } : {}) } };
        }),
        ...snapshot.edges.map((edge, index) => ({ data: { id: `system-edge-${index}`, source: edge.source, target: edge.targetId, label: edge.type } })),
      ],
      style: [
        { selector: "node", style: { "background-color": token("--surface"), "border-color": token("--accent"), "border-width": 2, color: token("--text"), label: "data(label)", "font-size": 15, "font-weight": 650, "text-wrap": "wrap", "text-max-width": "115px", "text-valign": "center", "text-halign": "center", width: 116, height: 54, shape: "round-rectangle" } },
        { selector: "node[kind='System']", style: { "background-opacity": .05, "background-color": token("--accent"), "border-color": token("--accent"), "border-style": "dashed", shape: "round-rectangle", label: "data(label)", "text-valign": "top", padding: "28px" } },
        { selector: "node[kind='Logical Data Store']", style: { shape: "barrel", "background-color": token("--surface-muted"), "border-color": token("--success") } },
        { selector: "node[kind='System Flow']", style: { shape: "diamond", "background-color": token("--surface-muted"), "border-color": token("--proposal") } },
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
        concentric: (node) => node.data("kind") === "System" ? 3 : node.data("boundary") === "owned" ? 2 : node.data("boundary") === "managed" ? 1 : 0,
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
  return <details className="business-document system-document" id={`system-doc-${concept.id}`}>
    <summary>
      <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "var(--accent)" }} />{concept.type}</span>
      <strong>{concept.title}</strong>
      <p>{concept.description}</p>
      <span className="system-badges">{systemBoundary(concept) && <i>{systemBoundary(concept)}</i>}<i>{systemSection(concept) ?? "unclassified"}</i></span>
      <ConceptSourceAction concept={concept} />
    </summary>
    <article className="markdown-body"><MarkdownDocument>{concept.body || "_No architecture document body yet._"}</MarkdownDocument></article>
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
    const group = systemSection(concept) ?? "unclassified";
    groups.set(group, [...(groups.get(group) ?? []), concept]);
  }
  const groupOrder = ["overview", "responsibilities", "data", "flows", "dependencies", "qualities", "security", "failures", "constraints", "risks", "decisions"];
  const orderedGroups = [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = groupOrder.indexOf(left);
    const rightIndex = groupOrder.indexOf(right);
    return (leftIndex < 0 ? groupOrder.length : leftIndex) - (rightIndex < 0 ? groupOrder.length : rightIndex) || left.localeCompare(right);
  });
  const owned = artifacts.filter((concept) => systemBoundary(concept) === "owned").length;
  const external = artifacts.filter((concept) => systemBoundary(concept) === "external").length;
  const stores = artifacts.filter((concept) => concept.type === "Logical Data Store").length;

  return <div className="purpose-canvas system-canvas">
    <div className="system-hero"><div className="purpose-intro"><span className="eyebrow">Conceptual System Design</span><h1>Responsibilities, boundaries, and information flow</h1><p>Each node is a canonical linked OKF System Design document. This view defines logical responsibilities, data, qualities, and external boundaries without deciding whether the product uses one full-stack Application or several deployable Applications.</p></div><div className="system-metrics"><div><strong>{owned}</strong><span>owned</span></div><div><strong>{stores}</strong><span>data stores</span></div><div><strong>{external}</strong><span>external</span></div></div></div>
    <section className="architecture-board"><div className="group-heading"><h2>Conceptual system map</h2><span>{artifacts.length} parts · {architectureSnapshot.edges.length} links</span></div><div className="system-legend"><span><i className="owned" />Owned responsibility or store</span><span><i className="managed" />Managed data boundary</span><span><i className="external" />External dependency</span><small>Select a node to open its architecture document.</small></div><SystemArchitectureMap snapshot={architectureSnapshot} /></section>
    <section className="system-documents"><div className="group-heading"><h2>Architecture documents</h2><span>Canonical OKF</span></div>{orderedGroups.map(([group, concepts]) => <div className="system-document-group" key={group}><h3>{group.replaceAll("-", " ")}</h3><div className="business-document-list">{concepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <SystemArtifactDocument concept={concept} key={concept.id} />)}</div></div>)}</section>
  </div>;
}

function BusinessDocument({ concept, snapshot, onFollow }: { concept: Concept; snapshot: ProjectSnapshot; onFollow: (concept: Concept) => void }) {
  const relationships = snapshot.edges.filter((edge) => edge.source === concept.id || edge.targetId === concept.id);
  return <details className="business-document business-concept-card">
    <summary onClick={() => onFollow(concept)}>
      <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} />{concept.type}</span>
      <strong>{concept.title}</strong>
      <p>{concept.description}</p>
      <span className="relationship-count">{relationships.length} typed links</span>
      <ConceptSourceAction concept={concept} />
    </summary>
    <div className="business-document-content">
      <article className="markdown-body"><MarkdownDocument>{concept.body}</MarkdownDocument></article>
      <aside className="business-relationships"><h3>Relationships</h3>{relationships.length === 0 ? <p>No typed relationships.</p> : relationships.map((edge, index) => {
        const outgoing = edge.source === concept.id;
        const relatedId = outgoing ? edge.targetId : edge.source;
        const related = snapshot.concepts.find((candidate) => candidate.id === relatedId);
        return <button key={`${edge.source}-${edge.type}-${edge.targetId}-${index}`} disabled={!related} onClick={() => related && onFollow(related)}><small>{outgoing ? "Outgoing" : "Incoming"} · {edge.type}</small><strong>{related?.title ?? relatedId}</strong><span>{related ? `${GLOBAL_AREA_LABELS[conceptArea(related)] ?? conceptArea(related)} · ${related.type}` : relatedId}</span></button>;
      })}</aside>
    </div>
  </details>;
}

function BusinessCanvas({ snapshot, onFollow }: { snapshot: ProjectSnapshot; onFollow: (concept: Concept) => void }) {
  const concepts = businessArtifacts(snapshot.concepts);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const types = [...new Set(concepts.map((concept) => concept.type))].sort();
  const visible = concepts.filter((concept) => (sectionFilter === "all" || businessSection(concept) === sectionFilter) && (typeFilter === "all" || concept.type === typeFilter));
  const grouped = new Map<BusinessSection, Map<string, Concept[]>>();
  for (const concept of visible) {
    const section = businessSection(concept);
    if (!section) continue;
    const byType = grouped.get(section) ?? new Map<string, Concept[]>();
    byType.set(concept.type, [...(byType.get(concept.type) ?? []), concept]);
    grouped.set(section, byType);
  }

  return <div className="purpose-canvas document-canvas business-documents">
    <div className="business-workspace-header"><div className="purpose-intro"><span className="eyebrow">Business Definition Area</span><h1>Why change is needed</h1><p>Business-owned knowledge about direction, problems, people, outcomes, evidence, economics, governance, capabilities, and risk. Connected Solution and engineering concepts remain contextual.</p></div><div className="business-summary"><strong>{visible.length}</strong><span>of {concepts.length} concepts</span></div></div>
    <div className="business-filters" aria-label="Business concept filters">
      <label><span>Section</span><select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}><option value="all">All sections</option>{BUSINESS_SECTIONS.map((section) => <option value={section} key={section}>{section}</option>)}</select></label>
      <label><span>Type</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All types</option>{types.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
      {(sectionFilter !== "all" || typeFilter !== "all") && <button onClick={() => { setSectionFilter("all"); setTypeFilter("all"); }}>Clear filters</button>}
    </div>
    {BUSINESS_SECTIONS.filter((section) => grouped.has(section)).map((section) => <section className="document-group business-section" key={section}>
      <div className="group-heading"><h2>{section.replaceAll("-", " ")}</h2><span>{[...(grouped.get(section)?.values() ?? [])].flat().length}</span></div>
      {[...(grouped.get(section)?.entries() ?? [])].sort(([left], [right]) => left.localeCompare(right)).map(([type, typedConcepts]) => <div className="business-type-group" key={type}><h3>{type}</h3><div className="business-document-list">{typedConcepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <BusinessDocument concept={concept} snapshot={snapshot} onFollow={onFollow} key={concept.id} />)}</div></div>)}
    </section>)}
    {visible.length === 0 && <div className="business-empty"><strong>No Business concepts match these filters.</strong><p>Unanswered concerns remain questions; M21 does not create empty placeholders.</p></div>}
  </div>;
}

function SolutionCanvas({ snapshot, onFollow }: { snapshot: ProjectSnapshot; onFollow: (concept: Concept) => void }) {
  const concepts = solutionArtifacts(snapshot.concepts);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const types = [...new Set(concepts.map((concept) => concept.type))].sort();
  const visible = concepts.filter((concept) => (sectionFilter === "all" || solutionSection(concept) === sectionFilter) && (typeFilter === "all" || concept.type === typeFilter));
  const grouped = new Map<SolutionSection, Map<string, Concept[]>>();
  for (const concept of visible) {
    const section = solutionSection(concept);
    if (!section) continue;
    const byType = grouped.get(section) ?? new Map<string, Concept[]>();
    byType.set(concept.type, [...(byType.get(concept.type) ?? []), concept]);
    grouped.set(section, byType);
  }
  return <div className="purpose-canvas document-canvas business-documents solution-documents">
    <div className="business-workspace-header"><div className="purpose-intro"><span className="eyebrow">Business Solution Definition Area</span><h1>Shape the complete response</h1><p>Explore propositions, options, outcomes, capabilities, behavior, and delivery across human services, processes, policy, digital and physical products, and partners.</p></div><div className="business-summary"><strong>{visible.length}</strong><span>of {concepts.length} concepts</span></div></div>
    <div className="business-filters" aria-label="Business Solution concept filters">
      <label><span>Section</span><select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}><option value="all">All sections</option>{SOLUTION_SECTIONS.map((section) => <option value={section} key={section}>{section}</option>)}</select></label>
      <label><span>Type</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All types</option>{types.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
      {(sectionFilter !== "all" || typeFilter !== "all") && <button onClick={() => { setSectionFilter("all"); setTypeFilter("all"); }}>Clear filters</button>}
    </div>
    {SOLUTION_SECTIONS.filter((section) => grouped.has(section)).map((section) => <section className="document-group business-section" key={section}><div className="group-heading"><h2>{section.replaceAll("-", " ")}</h2><span>{[...(grouped.get(section)?.values() ?? [])].flat().length}</span></div>{[...(grouped.get(section)?.entries() ?? [])].sort(([left], [right]) => left.localeCompare(right)).map(([type, typedConcepts]) => <div className="business-type-group" key={type}><h3>{type}</h3><div className="business-document-list">{typedConcepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => <BusinessDocument concept={concept} snapshot={snapshot} onFollow={onFollow} key={concept.id} />)}</div></div>)}</section>)}
    {visible.length === 0 && <div className="business-empty"><strong>No Solution concepts match these filters.</strong><p>Options and unresolved concerns remain explicit; M21 does not invent placeholders.</p></div>}
  </div>;
}

function ExpandableDocument({ concept }: { concept: Concept }) {
  return <details className="business-document">
    <summary>
      <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} />{concept.type}</span>
      <strong>{concept.title}</strong>
      <p>{concept.description || "No description yet."}</p>
      <span className="expand-label">Read full document</span>
      <ConceptSourceAction concept={concept} />
    </summary>
    <article className="markdown-body">
      <MarkdownDocument>{concept.body || "_No document body yet._"}</MarkdownDocument>
    </article>
  </details>;
}

function DocumentCanvas({ snapshot, fullSnapshot, layer, selectedId, onSelect, onFollowConcept }: {
  snapshot: ProjectSnapshot;
  fullSnapshot: ProjectSnapshot;
  layer: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onFollowConcept: (concept: Concept) => void;
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

  if (layer === "business") return <BusinessCanvas snapshot={fullSnapshot} onFollow={onFollowConcept} />;
  if (layer === "solution") return <SolutionCanvas snapshot={fullSnapshot} onFollow={onFollowConcept} />;

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
      <div className="document-grid">{concepts.sort((a,b) => a.title.localeCompare(b.title)).map((concept) => <div className="concept-card-shell" key={concept.id}><button className={`document-card ${selectedId === concept.id ? "selected" : ""}`} onClick={() => onSelect(concept.id)}>
        <span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "#718096" }} />{concept.type}</span>
        <strong>{concept.title}</strong><p>{concept.description || "No description yet."}</p>
      </button><ConceptSourceAction concept={concept} /></div>)}</div>
    </section>)}
  </div>;
}

function VisualSpecimenFrame({ specimen, title }: { specimen: VisualSpecimen; title: string }) {
  return <iframe className="visual-specimen-frame" title={title} sandbox={specimen.sandbox} srcDoc={specimen.html} />;
}

function VisualDesignCanvas({ fullSnapshot, onFollow }: { fullSnapshot: ProjectSnapshot; onFollow: (concept: Concept) => void }) {
  const concepts = visualDesignArtifacts(fullSnapshot.concepts);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const types = [...new Set(concepts.map((concept) => concept.type))].sort();
  const visible = concepts.filter((concept) => (sectionFilter === "all" || visualDesignSection(concept) === sectionFilter) && (typeFilter === "all" || concept.type === typeFilter));
  const grouped = new Map<VisualDesignSection, Concept[]>();
  for (const concept of visible) {
    const section = visualDesignSection(concept);
    if (section) grouped.set(section, [...(grouped.get(section) ?? []), concept]);
  }
  const diagnostics = fullSnapshot.diagnostics.filter((diagnostic) => diagnostic.conceptIds.some((id) => concepts.some((concept) => concept.id === id)));
  const theme = activeVisualTheme(fullSnapshot.concepts);
  return <div className="purpose-canvas design-canvas design-documents visual-design-workspace">
    <div className="design-hero"><div className="purpose-intro"><span className="eyebrow">Visual Design Definition Area</span><h1>A shared visual language, rendered</h1><p>Accepted direction, CSS foundations, themes, visual components, assets, and accessibility remain product-wide. Application journeys, screens, navigation, and behavior belong to Application Experience Design.</p></div><div className="design-actions"><a className="preview-link" href="/design-preview" target="_blank" rel="noreferrer">Open isolated catalog ↗</a></div></div>
    <div className="business-filters" aria-label="Visual Design filters"><label><span>Section</span><select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}><option value="all">All sections</option>{VISUAL_DESIGN_SECTIONS.map((section) => <option key={section} value={section}>{section}</option>)}</select></label><label><span>Type</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All types</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label>{(sectionFilter !== "all" || typeFilter !== "all") && <button onClick={() => { setSectionFilter("all"); setTypeFilter("all"); }}>Clear filters</button>}</div>
    {diagnostics.length > 0 && <section className="visual-diagnostics"><strong>{diagnostics.length} Visual Design diagnostics</strong>{diagnostics.map((diagnostic) => <span key={`${diagnostic.code}-${diagnostic.conceptIds.join("-")}`}>{diagnostic.message}</span>)}</section>}
    {VISUAL_DESIGN_SECTIONS.filter((section) => grouped.has(section)).map((section) => <section className={`visual-section visual-section-${section}`} key={section}><div className="group-heading"><h2>{section.replaceAll("-", " ")}</h2><span>{grouped.get(section)?.length}</span></div><div className={section === "components" || section === "foundations" || section === "themes" ? "visual-preview-grid" : "business-document-list"}>{(grouped.get(section) ?? []).sort((left, right) => left.title.localeCompare(right.title)).map((concept) => {
      const specimen = section === "components" ? renderVisualComponent(concept, fullSnapshot.concepts) : section === "foundations" ? renderFoundationSpecimen(concept, fullSnapshot.concepts) : section === "themes" ? renderThemeSpecimen(concept, fullSnapshot.concepts) : undefined;
      if (!specimen) return <BusinessDocument key={concept.id} concept={concept} snapshot={fullSnapshot} onFollow={onFollow} />;
      return <article className="visual-preview-card" key={concept.id}><header><span className="concept-type"><i style={{ background: TYPE_COLORS[concept.type] ?? "var(--accent)" }} />{concept.type}</span><ConceptSourceAction concept={concept} /><h3>{concept.title}</h3><p>{concept.description}</p></header><VisualSpecimenFrame specimen={specimen} title={`${concept.title} specimen`} /><details><summary>Canonical detail and sources</summary><div className="visual-source-list">{concept.artifacts.map((artifact) => <code key={`${artifact.role}-${artifact.path}`}>{artifact.role}: {artifact.path}</code>)}</div><article className="markdown-body"><MarkdownDocument>{concept.body}</MarkdownDocument></article></details></article>;
    })}</div></section>)}
    {!theme && <p className="quiet">No Visual Theme is available; specimens use readable fallback values.</p>}
  </div>;
}

function realizedSystemResponsibilities(application: Concept, snapshot: ProjectSnapshot): Concept[] {
  return snapshot.edges
    .filter((edge) => edge.source === application.id && edge.type === "realizes")
    .map((edge) => snapshot.concepts.find((concept) => concept.id === edge.targetId))
    .filter((concept): concept is Concept => concept !== undefined && ["System Responsibility", "System", "System Service", "System Data Store"].includes(concept.type));
}

function ArchitectureCanvas({ fullSnapshot, onSelectApplication }: { fullSnapshot: ProjectSnapshot; onSelectApplication: (id: string) => void }) {
  const applications = architectureApplications(fullSnapshot.concepts);
  const [focusedTopologyId, setFocusedTopologyId] = useState<string>();
  const architectureConcepts = architectureArtifacts(fullSnapshot.concepts);
  const systemResponsibilities = fullSnapshot.concepts
    .filter((concept) => concept.type === "System Responsibility" && systemBoundary(concept) === "owned")
    .sort((left, right) => left.title.localeCompare(right.title));
  const topologyIds = new Set([...architectureConcepts.map((concept) => concept.id), ...systemResponsibilities.map((concept) => concept.id)]);
  const topologySnapshot = { ...fullSnapshot, concepts: fullSnapshot.concepts.filter((concept) => topologyIds.has(concept.id)), edges: fullSnapshot.edges.filter((edge) => topologyIds.has(edge.source) && topologyIds.has(edge.targetId)) };
  const focusedTopologyConcept = topologySnapshot.concepts.find((concept) => concept.id === focusedTopologyId);
  return <div className="purpose-canvas application-portfolio"><div className="purpose-intro"><span className="eyebrow">Product-wide Architecture</span><h1>Choose the actual Application topology</h1><p>Map every owned System Responsibility to the simplest justified set of executable Applications. Stable Application IDs preserve downstream scope while communications, trust, and deployability remain explicit.</p></div><section className="architecture-board"><div className="group-heading"><h2>Owned Application topology</h2><span>{architectureConcepts.length} Architecture concepts</span></div><GraphCanvas snapshot={topologySnapshot} selectedId={focusedTopologyId} onSelect={(id) => { const application = applications.find((candidate) => candidate.id === id); if (application) onSelectApplication(application.applicationId ?? application.id); else setFocusedTopologyId(id); }} groupNamespace="architecture" embedded />{focusedTopologyConcept && <article className="architecture-node-focus"><ConceptSourceAction concept={focusedTopologyConcept} /><span className="concept-type"><i style={{ background: TYPE_COLORS[focusedTopologyConcept.type] ?? "var(--accent)" }} />{focusedTopologyConcept.type}</span><strong>{focusedTopologyConcept.title}</strong><p>{focusedTopologyConcept.description}</p></article>}</section><section className="realization-matrix"><div className="group-heading"><h2>System Design realization</h2><span>{systemResponsibilities.length} conceptual responsibilities</span></div>{systemResponsibilities.map((system) => { const realizing = applications.filter((application) => fullSnapshot.edges.some((edge) => edge.source === application.id && edge.targetId === system.id && edge.type === "realizes")); return <div className="realization-row" key={system.id}><div><strong>{system.title}</strong><small>{system.description}</small></div><span>realized by</span><div>{realizing.length ? realizing.map((application) => <button key={application.id} onClick={() => onSelectApplication(application.applicationId ?? application.id)}>{application.title}</button>) : <i>No owned Application</i>}</div></div>; })}</section><div className="group-heading application-list-heading"><h2>Owned Applications</h2><span>{applications.length}</span></div><div className="application-grid">{applications.map((application) => {
    const architecture = application.metadata.architecture as Record<string, unknown> | undefined;
    const systems = realizedSystemResponsibilities(application, fullSnapshot);
    return <div className="concept-card-shell application-card-shell" key={application.id}><button className="application-card" onClick={() => onSelectApplication(application.applicationId ?? application.id)}><span className="concept-type"><i style={{ background: TYPE_COLORS.Application }} />{String(architecture?.["application-kind"] ?? "Application")}</span><h2>{application.title}</h2><p>{application.description}</p><div className="realization-list"><small>Realizes</small>{systems.length ? systems.map((system) => <span key={system.id}>{system.title}</span>) : <span className="missing">No System Design responsibility linked</span>}</div><dl><dt>Stable ID</dt><dd><code>{application.applicationId}</code></dd><dt>Independently deployable</dt><dd>{architecture?.["independently-deployable"] === true ? "Yes" : "No"}</dd></dl></button><ConceptSourceAction concept={application} /></div>;
  })}</div></div>;
}

function ApplicationCanvas({ snapshot, fullSnapshot, selectedApplicationId }: { snapshot: ProjectSnapshot; fullSnapshot: ProjectSnapshot; selectedApplicationId: string | undefined }) {
  const application = fullSnapshot.concepts.find((concept) => (concept.id === selectedApplicationId || concept.applicationId === selectedApplicationId) && concept.type === "Application");
  if (!application) return <div className="purpose-canvas application-portfolio"><div className="purpose-intro"><span className="eyebrow">Application Architecture</span><h1>Select an Application in Architecture</h1><p>Application Architecture requires an owned Application scope.</p></div></div>;
  const architecture = application.metadata.architecture as Record<string, unknown> | undefined;
  const systems = realizedSystemResponsibilities(application, fullSnapshot);
  const localArtifacts = snapshot.concepts.filter((concept) => concept.id !== application.id && concept.type !== "Definition Layer");
  return <div className="purpose-canvas application-detail"><div className="application-detail-hero"><div className="purpose-intro"><span className="eyebrow">Selected Application · Application Architecture</span><h1>{application.title}</h1><p>{application.description}</p></div><div className="application-facts"><div><small>Stable ID</small><strong>{application.applicationId}</strong></div><div><small>Kind</small><strong>{String(architecture?.["application-kind"] ?? "Application")}</strong></div><div><small>Independently deployable</small><strong>{architecture?.["independently-deployable"] === true ? "Yes" : "No"}</strong></div></div></div>
    <section className="application-realization"><div className="group-heading"><h2>Realized System Design responsibilities</h2><span>{systems.length}</span></div><div className="realized-system-cards">{systems.map((system) => <article className="concept-card-shell" key={system.id}><ConceptSourceAction concept={system} /><span className="concept-type"><i style={{ background: TYPE_COLORS[system.type] ?? "var(--accent)" }} />{system.type}</span><strong>{system.title}</strong><p>{system.description}</p></article>)}</div></section>
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
    <div className="document-grid">{snapshot.concepts.filter((c) => c.type !== "Definition Layer").map((concept) => <div className="concept-card-shell" key={concept.id}><button className={`document-card ${selectedId === concept.id ? "selected" : ""}`} onClick={() => onSelect(concept.id)}><small>{concept.type}</small><strong>{concept.title}</strong><p>{concept.description}</p></button><ConceptSourceAction concept={concept} /></div>)}</div>
  </div>;
}

function PurposeCanvas({ layer, snapshot, fullSnapshot, selectedId, onSelect, onFollowConcept, selectedApplicationId, onSelectApplication }: { layer: string | undefined; snapshot: ProjectSnapshot; fullSnapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void; onFollowConcept: (concept: Concept) => void; selectedApplicationId: string | undefined; onSelectApplication: (id: string) => void }) {
  const projection = layer ? projectionForLayer(layer) : undefined;
  if (projection === "documents" && layer) return <DocumentCanvas snapshot={snapshot} fullSnapshot={fullSnapshot} layer={layer} selectedId={selectedId} onSelect={onSelect} onFollowConcept={onFollowConcept} />;
  if (projection === "design-system") return <VisualDesignCanvas fullSnapshot={fullSnapshot} onFollow={onFollowConcept} />;
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
  const productWide = ["business", "solution", "product", "visual-design", "design", "system", "architecture"]
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
    <label><span>Application scope</span><select value={selectedApplicationId ?? ""} onChange={(event) => onSelectApplication(event.target.value)}><option value="">Select an Application…</option>{applications.map((application) => <option value={application.applicationId ?? application.id} key={application.id}>{application.title}</option>)}</select></label>
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
      <ConceptSourceAction concept={concept} />
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
  const [debugMode, setDebugMode] = useState(false);
  const [rawModalOpen, setRawModalOpen] = useState(false);
  const [rawSourceConceptId, setRawSourceConceptId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    api<ProjectSnapshot>("/api/project").then((project) => {
      setSnapshot(project);
    }).catch((failure) => setError(failure instanceof Error ? failure.message : String(failure)));
    const events = new EventSource("/api/events");
    events.addEventListener("project", (event) => {
      try { setSnapshot(JSON.parse((event as MessageEvent<string>).data) as ProjectSnapshot); }
      catch { setError("M21 received an invalid project update"); }
    });
    events.onerror = () => setError("Live project updates are temporarily disconnected");
    return () => events.close();
  }, []);

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
    if (!rawModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setRawModalOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [rawModalOpen]);

  useEffect(() => {
    if (!snapshot) return;
    if (selectedApplicationId && !applications.some((application) => application.id === selectedApplicationId || application.applicationId === selectedApplicationId)) {
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
      business: "Business Outcome",
      solution: "Solution Proposition",
      product: "Product Definition",
      "visual-design": "Visual Theme",
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
  const inspectSource = React.useCallback((concept: Concept) => {
    setRawSourceConceptId(concept.id);
    setRawModalOpen(true);
  }, []);
  const selectLayer = React.useCallback((layer: string | undefined) => {
    setSelectedId(undefined);
    setSelectedStage(layer);
    const url = new URL(window.location.href);
    if (layer) url.searchParams.set("layer", layer);
    else url.searchParams.delete("layer");
    window.history.replaceState({}, "", url);
  }, []);
  const followConcept = React.useCallback((concept: Concept) => {
    const requestedArea = conceptArea(concept);
    const routeArea = stages.some((stage) => stage.id === requestedArea) ? requestedArea : requestedArea === "solution" ? "product" : requestedArea === "visual-design" ? "design" : requestedArea;
    if (stages.some((stage) => stage.id === routeArea)) {
      setSelectedStage(routeArea);
      const url = new URL(window.location.href);
      url.searchParams.set("layer", routeArea);
      window.history.replaceState({}, "", url);
    } else {
      setGlobalGraphOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.set("view", "graph");
      window.history.replaceState({}, "", url);
    }
    setSelectedId(concept.id);
  }, [stages]);
  const selectApplication = React.useCallback((applicationId: string) => {
    const nextApplicationId = applicationId || undefined;
    const nextLayer = nextApplicationId ? (applicationLayerSelected ? selectedStage ?? "application" : "application") : "architecture";
    setSelectedApplicationId(nextApplicationId);
    setSelectedStage(nextLayer);
    setSelectedId(applications.find((application) => application.id === nextApplicationId || application.applicationId === nextApplicationId)?.id);
    const url = new URL(window.location.href);
    url.searchParams.set("layer", nextLayer);
    if (nextApplicationId) url.searchParams.set("app", nextApplicationId);
    else url.searchParams.delete("app");
    window.history.replaceState({}, "", url);
  }, [applicationLayerSelected, selectedStage, applications]);
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
  const rawSourceConcept = snapshot.concepts.find((concept) => concept.id === rawSourceConceptId);

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

  const documentFocus = selectedStage === "business" || selectedStage === "solution" || selectedStage === "product" || selectedStage === "visual-design" || selectedStage === "design" || selectedStage === "system" || selectedStage === "architecture" || applicationLayerSelected;
  return <DebugSourceContext.Provider value={{ enabled: debugMode, inspect: inspectSource }}><div className={`app-shell ${documentFocus ? "document-focus" : ""} ${applicationLayerSelected ? "application-context" : ""} ${globalGraphOpen ? "global-graph-open" : ""}`}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark">M21</span><div><strong>{snapshot.name}</strong><small>Product engineering workspace</small></div></div>
      <div className="project-health">
        <button className={`debug-mode-action ${debugMode ? "selected" : ""}`} onClick={() => { setDebugMode(!debugMode); if (debugMode) { setRawModalOpen(false); setRawSourceConceptId(undefined); } }} aria-pressed={debugMode} title="Show source actions on every Concept" aria-label={`Global debug mode ${debugMode ? "on" : "off"}`}><span aria-hidden="true">&lt;/&gt;</span>{debugMode ? "Debug on" : "Debug"}</button>
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
      <PurposeCanvas layer={selectedStage} snapshot={scopedSnapshot} fullSnapshot={snapshot} selectedId={selectedId} onSelect={select} onFollowConcept={followConcept} selectedApplicationId={selectedApplicationId} onSelectApplication={selectApplication} />
      {proposal && <div className="review-drawer"><ProposalReview proposal={proposal} snapshot={snapshot} onAccept={acceptProposal} busy={busy} /></div>}
      {summary && <div className="summary-drawer"><div className="drawer-heading"><div><span className="eyebrow">Generated view{selectedStage ? ` · ${selectedStage}` : ""}</span><h2>Project summary</h2></div><button onClick={() => setSummary("")}>Close</button></div><pre>{summary}</pre></div>}
      {error && <div className="toast error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
    </main>
    {!documentFocus && <Inspector concept={selected} snapshot={snapshot} stage={selectedStage} onProposal={setProposal} onAgentProposal={setProposal} />}
    {rawModalOpen && rawSourceConcept && <div className="raw-source-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRawModalOpen(false); }}><section className="raw-source-modal" role="dialog" aria-modal="true" aria-labelledby="raw-source-title"><header><div><span className="eyebrow">Global debug mode · canonical source</span><h2 id="raw-source-title">{rawSourceConcept.filePath}</h2></div><button onClick={() => setRawModalOpen(false)} aria-label="Close raw Markdown">Close</button></header><pre><code>{rawSourceConcept.raw}</code></pre></section></div>}
  </div></DebugSourceContext.Provider>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
