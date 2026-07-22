import cytoscape, { type Core } from "cytoscape";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { definitionLayers, snapshotForLayer, type DefinitionLayer } from "../../src/domain/definition-flow";
import { mainArtifactsForLayer, productCapabilityArtifacts, projectionForLayer, projectionGroup } from "../../src/domain/projections";
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
  "Design System": "#976b45",
  System: "#446a92",
  Application: "#4b769d",
  Component: "#5984a9",
  Decision: "#9b7042",
  Constraint: "#88755e",
  Risk: "#b65353",
  "AI Agent": "#5869a8",
};

const THEME_PROPERTIES: Record<string, string> = {
  canvas: "--canvas",
  surface: "--surface",
  "surface-muted": "--surface-muted",
  text: "--text",
  muted: "--muted",
  border: "--border",
  accent: "--accent",
  proposal: "--proposal",
  warning: "--warning",
  conflict: "--conflict",
};

function applyProjectTheme(snapshot: ProjectSnapshot): void {
  const theme = projectTheme(snapshot.concepts);
  if (!theme) return;
  for (const [token, value] of Object.entries(theme.tokens)) {
    const property = THEME_PROPERTIES[token];
    if (property && value && CSS.supports("color", value)) {
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

function GraphCanvas({ snapshot, selectedId, onSelect, groupNamespace }: {
  snapshot: ProjectSnapshot;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  groupNamespace?: "system" | "components";
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
    const groups = [...new Set(snapshot.concepts.flatMap((concept) => groupFor(concept) ?? []))];
    graph.current = cytoscape({
      container: container.current,
      elements: [
        ...groups.map((group) => ({ data: { id: `group:${group}`, label: group.replaceAll("-", " "), kind: "group" } })),
        ...snapshot.concepts.map((concept) => ({
          data: {
            id: concept.id,
            label: concept.title,
            type: concept.type,
            color: TYPE_COLORS[concept.type] ?? "#718096",
            ...(groupFor(concept) ? { parent: `group:${groupFor(concept)}` } : {}),
          },
        })),
        ...snapshot.edges
          .filter((edge) => snapshot.concepts.some((concept) => concept.id === edge.targetId))
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

  return <div className="graph-canvas" ref={container} aria-label="Interactive product knowledge graph" />;
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

function DesignCanvas({ snapshot, fullSnapshot, selectedId, onSelect }: {
  snapshot: ProjectSnapshot;
  fullSnapshot: ProjectSnapshot;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const theme = projectTheme(fullSnapshot.concepts);
  const visual = snapshot.concepts.filter((concept) => ["Visual Language", "Design System", "Accessibility Constraint", "Experience Principle"].includes(concept.type));
  const experience = snapshot.concepts.filter((concept) => ["User Journey", "Information Architecture", "Screen"].includes(concept.type));
  const other = snapshot.concepts.filter((concept) => !visual.includes(concept) && !experience.includes(concept) && concept.type !== "Definition Layer");
  const card = (concept: Concept) => <button key={concept.id} className={`design-card ${selectedId === concept.id ? "selected" : ""}`} onClick={() => onSelect(concept.id)}><small>{concept.type}</small><strong>{concept.title}</strong><p>{concept.description}</p></button>;
  return <div className="purpose-canvas design-canvas">
    <div className="purpose-intro"><span className="eyebrow">Design and visual language</span><h1>Experience, brand, and system</h1><p>The visual language is both documented here and projected into the workspace theme.</p></div>
    {theme && <section className="theme-board"><div className="group-heading"><h2>Semantic theme</h2><span>from {theme.sourceConceptId}</span></div><div className="swatches">{Object.entries(theme.tokens).map(([token,value]) => <div className="swatch" key={token}><i style={{ background: value }} /><strong>{token}</strong><code>{value}</code></div>)}</div></section>}
    <section><div className="group-heading"><h2>Visual foundations</h2><span>{visual.length}</span></div><div className="design-grid">{visual.map(card)}</div></section>
    <section><div className="group-heading"><h2>Journeys and screens</h2><span>{experience.length}</span></div><div className="design-grid">{experience.map(card)}</div></section>
    <section><div className="group-heading"><h2>Component-story inputs</h2><span>{other.length}</span></div><div className="design-grid compact">{other.map(card)}</div></section>
  </div>;
}

function ApplicationCanvas({ snapshot, selectedId, onSelect }: { snapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void }) {
  const applications = snapshot.concepts.filter((concept) => concept.type === "Application");
  return <div className="purpose-canvas application-canvas"><div className="purpose-intro"><span className="eyebrow">Application architecture</span><h1>Owned applications</h1><p>Select an application to examine its architectural style, responsibilities, components, and dependency rules.</p></div>
    <div className="application-grid">{applications.map((app) => { const metadata = app.metadata.application as Record<string, unknown> | undefined; return <button key={app.id} className={`application-card ${selectedId === app.id ? "selected" : ""}`} onClick={() => onSelect(app.id)}><span className="concept-type"><i style={{ background: TYPE_COLORS.Application }} />Application</span><h2>{app.title}</h2><p>{app.description}</p><dl><dt>Style</dt><dd>{String(metadata?.architecture_style ?? "To define")}</dd><dt>Group</dt><dd>{String(metadata?.group ?? "Ungrouped")}</dd></dl></button>; })}</div>
    <section><div className="group-heading"><h2>Application context</h2><span>{snapshot.concepts.length - applications.length}</span></div><div className="document-grid">{snapshot.concepts.filter((c) => !applications.includes(c) && c.type !== "Definition Layer").map((concept) => <button className="document-card" key={concept.id} onClick={() => onSelect(concept.id)}><small>{concept.type}</small><strong>{concept.title}</strong><p>{concept.description}</p></button>)}</div></section>
  </div>;
}

function ContractCanvas({ snapshot, selectedId, onSelect }: { snapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void }) {
  const contractTypes = ["Domain Model", "AI Workflow", "Impact Policy", "Decision", "Component"];
  return <div className="purpose-canvas contract-canvas"><div className="purpose-intro"><span className="eyebrow">Code design</span><h1>Models, interfaces, patterns, and behavior</h1><p>This layer becomes the regeneration-quality specification and Gherkin package handed to a coding agent.</p></div>
    {contractTypes.map((type) => { const concepts = snapshot.concepts.filter((concept) => concept.type === type); return concepts.length > 0 && <section key={type}><div className="group-heading"><h2>{type}</h2><span>{concepts.length}</span></div><div className="document-grid">{concepts.map((concept) => <button className={`document-card ${selectedId === concept.id ? "selected" : ""}`} key={concept.id} onClick={() => onSelect(concept.id)}><strong>{concept.title}</strong><p>{concept.description}</p></button>)}</div></section>; })}
  </div>;
}

function HandoffCanvas({ snapshot, layer, selectedId, onSelect }: { snapshot: ProjectSnapshot; layer: "implementation" | "deployment"; selectedId: string | undefined; onSelect: (id: string) => void }) {
  return <div className="purpose-canvas handoff-canvas"><div className="purpose-intro"><span className="eyebrow">{layer} handoff</span><h1>{layer === "implementation" ? "Package work for a coding agent" : "Define delivery without executing it"}</h1><p>{layer === "implementation" ? "M21 assembles accepted Code Design, Gherkin behavior, constraints, and affected concepts. Source changes are outsourced." : "M21 defines environments, topology, rollout, rollback, observability, and evidence. A coding or delivery agent realizes it."}</p></div>
    <div className="handoff-status"><strong>Definition package</strong><span>{snapshot.concepts.length} relevant concepts</span><span>{snapshot.diagnostics.length} unresolved diagnostics</span></div>
    <div className="document-grid">{snapshot.concepts.filter((c) => c.type !== "Definition Layer").map((concept) => <button className={`document-card ${selectedId === concept.id ? "selected" : ""}`} key={concept.id} onClick={() => onSelect(concept.id)}><small>{concept.type}</small><strong>{concept.title}</strong><p>{concept.description}</p></button>)}</div>
  </div>;
}

function PurposeCanvas({ layer, snapshot, fullSnapshot, selectedId, onSelect }: { layer: string | undefined; snapshot: ProjectSnapshot; fullSnapshot: ProjectSnapshot; selectedId: string | undefined; onSelect: (id: string) => void }) {
  const projection = layer ? projectionForLayer(layer) : undefined;
  if (projection === "documents" && layer) return <DocumentCanvas snapshot={snapshot} layer={layer} selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "design-system") return <DesignCanvas snapshot={snapshot} fullSnapshot={fullSnapshot} selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "application-architecture") return <ApplicationCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "contract-registry") return <ContractCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "implementation-handoff") return <HandoffCanvas snapshot={snapshot} layer="implementation" selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "deployment-definition") return <HandoffCanvas snapshot={snapshot} layer="deployment" selectedId={selectedId} onSelect={onSelect} />;
  if (projection === "grouped-topology") return <GraphCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} groupNamespace="system" />;
  if (projection === "component-dependencies") return <GraphCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} groupNamespace="components" />;
  return <GraphCanvas snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} />;
}

function StageRail({ stages, selected, counts, onSelect }: {
  stages: DefinitionLayer[];
  selected: string | undefined;
  counts: Map<string, number>;
  onSelect: (stage: string | undefined) => void;
}) {
  return <nav className="stage-rail" aria-label="Software development definition flow">
    <span className="stage-label">SDLC</span>
    {stages.map((stage) => <button
      key={stage.id}
      className={selected === stage.id ? "selected" : ""}
      onClick={() => onSelect(stage.id)}
      title={stage.description}
    >
      <strong>{stage.shortTitle}</strong><small>{counts.get(stage.id) ?? 0} concepts</small>
    </button>)}
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
  const stageCounts = useMemo(() => new Map(stages.map((stage) => {
    if (!snapshot) return [stage.id, 0] as const;
    const count = stage.id === "product"
      ? productCapabilityArtifacts(snapshot.concepts).length
      : mainArtifactsForLayer(snapshot.concepts, stage.id).length;
    return [stage.id, count] as const;
  })), [snapshot, stages]);
  const scopedSnapshot = useMemo(
    () => snapshot && selectedStage ? snapshotForLayer(snapshot, selectedStage) : snapshot,
    [snapshot, selectedStage],
  );

  useEffect(() => {
    if (!scopedSnapshot || scopedSnapshot.concepts.some((concept) => concept.id === selectedId)) return;
    const preferredType: Record<string, string> = {
      business: "Business Goal",
      product: "Product Definition",
      design: "Visual Language",
      system: "System",
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
    setSelectedId(preferred?.id ?? layerConcept ?? scopedSnapshot.concepts[0]?.id);
  }, [scopedSnapshot, selectedId, selectedStage, stages]);

  const select = React.useCallback((id: string) => setSelectedId(id), []);
  const selectLayer = React.useCallback((layer: string | undefined) => {
    setSelectedId(undefined);
    setSelectedStage(layer);
    const url = new URL(window.location.href);
    if (layer) url.searchParams.set("layer", layer);
    else url.searchParams.delete("layer");
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

  const documentFocus = selectedStage === "business" || selectedStage === "product";
  return <div className={`app-shell ${documentFocus ? "document-focus" : ""}`}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark">M21</span><div><strong>{snapshot.name}</strong><small>Product engineering workspace</small></div></div>
      <div className="project-health">
        <button className="attention" onClick={() => setSelectedId(snapshot.diagnostics[0]?.conceptIds[0])} disabled={!snapshot.diagnostics.length}>
          <span>{snapshot.diagnostics.length}</span> needs attention
        </button>
        <button onClick={openSummary}>Generate summary</button>
      </div>
    </header>
    <StageRail stages={stages} selected={selectedStage} counts={stageCounts} onSelect={selectLayer} />
    {!documentFocus && <ConceptNavigator concepts={scopedSnapshot.concepts} selectedId={selectedId} onSelect={select} />}
    <main className="canvas-region">
      <div className="canvas-toolbar"><span><strong>{selectedStage ? `${stages.find((stage) => stage.id === selectedStage)?.title ?? selectedStage} definition` : "Product overview"}</strong> · {scopedSnapshot.concepts.length} concepts · {scopedSnapshot.edges.length} relationships</span><span className="quiet">Concept types remain independent of definition layers</span></div>
      <PurposeCanvas layer={selectedStage} snapshot={scopedSnapshot} fullSnapshot={snapshot} selectedId={selectedId} onSelect={select} />
      {proposal && <div className="review-drawer"><ProposalReview proposal={proposal} snapshot={snapshot} onAccept={acceptProposal} busy={busy} /></div>}
      {summary && <div className="summary-drawer"><div className="drawer-heading"><div><span className="eyebrow">Generated view{selectedStage ? ` · ${selectedStage}` : ""}</span><h2>Project summary</h2></div><button onClick={() => setSummary("")}>Close</button></div><pre>{summary}</pre></div>}
      {error && <div className="toast error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
    </main>
    {!documentFocus && <Inspector concept={selected} snapshot={snapshot} stage={selectedStage} onProposal={setProposal} onAgentProposal={setProposal} />}
  </div>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
