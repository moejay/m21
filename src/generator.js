import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

// Inline the client stylesheet and the vendored rendering libraries so the
// generated document is self-contained — it renders offline and under a
// strict CSP, with no external requests.
const STYLES = readFileSync(join(moduleDir, "client", "styles.css"), "utf-8");
const D3_MIN = readFileSync(join(moduleDir, "..", "vendor", "d3.min.js"), "utf-8");
const MARKED_MIN = readFileSync(join(moduleDir, "..", "vendor", "marked.min.js"), "utf-8");

/**
 * Generate a self-contained HTML file with an interactive D3 dependency graph.
 *
 * @param {Array} specs - parsed spec objects
 * @param {Object} [options]
 * @param {boolean} [options.liveReload] - include SSE client for dev server mode
 */
export function generateHTML(specs, options = {}) {
  const specsJSON = JSON.stringify(specs, null, 2);
  const { liveReload = false } = options;

  const sseClientScript = liveReload
    ? `
    // SSE live reload
    function connectSSE() {
      const evtSource = new EventSource('/api/events');

      evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.specs) {
          updateGraph(data.specs);
        }
      };

      evtSource.onerror = function() {
        evtSource.close();
        // Reconnect after 2 seconds
        setTimeout(connectSSE, 2000);
      };
    }

    function updateGraph(newSpecs) {
      // Preserve current node positions
      const posMap = {};
      if (typeof nodes !== 'undefined') {
        nodes.forEach(n => {
          posMap[n.id] = { x: n.x, y: n.y, vx: n.vx, vy: n.vy };
        });
      }

      // Rebuild data via cycle-aware analyzer
      const analysis = analyzeGraphData(newSpecs);
      const newNodes = newSpecs.map(s => {
        const pos = posMap[s.name];
        const node = { id: s.name, ...s, inCycle: !!analysis.inCycle[s.name] };
        if (pos) {
          node.x = pos.x;
          node.y = pos.y;
          node.vx = pos.vx;
          node.vy = pos.vy;
        }
        return node;
      });

      const newLinks = analysis.links;
      const newDependentsCount = analysis.dependentsCount;
      const newDepthMemo = analysis.depth;
      const newMaxDepth = Math.max(0, ...Object.values(newDepthMemo));
      colorScale.domain([0, Math.max(newMaxDepth, 1)]);

      // Update cycle state
      graphInCycle = { ...analysis.inCycle };
      graphCycles = analysis.cycles.slice();
      updateCycleBadge();
      updateTestLegend();

      // Update global refs
      nodes.length = 0;
      nodes.push(...newNodes);
      links.length = 0;
      links.push(...newLinks);
      Object.assign(dependentsCount, newDependentsCount);
      Object.keys(depthMemo).forEach(k => delete depthMemo[k]);
      Object.assign(depthMemo, newDepthMemo);

      // Update simulation
      simulation.nodes(nodes);
      const linkForce = simulation.force("link");
      if (linkForce) {
        linkForce.links(links);
      } else {
        // Manually resolve string source/target to node objects
        const nodeById = {};
        nodes.forEach(n => nodeById[n.id] = n);
        links.forEach(l => {
          if (typeof l.source === 'string') l.source = nodeById[l.source];
          if (typeof l.target === 'string') l.target = nodeById[l.target];
        });
      }

      // Rebind data
      const linkSel = g.selectAll(".link").data(links, d => (d.source.id || d.source) + '-' + (d.target.id || d.target));
      linkSel.exit().remove();
      linkSel.enter().append("line")
        .merge(linkSel)
        .attr("class", d => "link" + (d.cycle ? " cycle" : ""))
        .attr("marker-end", d => d.cycle ? "url(#arrowhead-cycle)" : "url(#arrowhead)");

      // Rebind link labels
      const linkLabelSel = g.selectAll(".link-label").data(
        links.filter(l => l.uses && l.uses.length > 0),
        d => (d.source.id || d.source) + '-' + (d.target.id || d.target)
      );
      linkLabelSel.exit().remove();
      linkLabelSel.enter().append("text")
        .attr("class", "link-label")
        .text(d => d.uses.join(', '));

      const nodeSel = g.selectAll(".node").data(nodes, d => d.id);
      nodeSel.exit().remove();
      const nodeEnter = nodeSel.enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded));

      nodeEnter.append("circle");
      nodeEnter.append("text");
      nodeEnter.append("text").attr("class", "node-count");

      nodeEnter.on("click", (event, d) => {
        event.stopPropagation();
        selectNode(d);
      });

      // Update all circles and text
      const allNodes = g.selectAll(".node");
      allNodes.classed("cycle", d => !!d.inCycle);
      allNodes.select("circle")
        .attr("r", d => 14 + (dependentsCount[d.id] || 0) * 4)
        .attr("fill", d => colorScale(depthMemo[d.id] || 0))
        .attr("stroke", d => statusColor(d.testStatus) || d3.color(colorScale(depthMemo[d.id] || 0)).brighter(0.8))
        .style("stroke-width", d => statusColor(d.testStatus) ? "4px" : null);

      allNodes.select("text:not(.node-count)")
        .attr("dy", d => (14 + (dependentsCount[d.id] || 0) * 4) + 16)
        .text(d => d.name);

      allNodes.select("text.node-count")
        .attr("dy", "0.35em")
        .text(d => countLabel(d.testCounts));

      // Update group hulls
      updateGroupHulls();

      // If panel is open, refresh its content without resetting tab or clobbering edits
      if (selectedNode) {
        const updated = nodes.find(n => n.id === selectedNode.id);
        if (updated) {
          selectedNode = updated;
          // Update metadata
          document.getElementById("panel-name").textContent = updated.name;
          renderTestSummary(updated);
          document.getElementById("panel-description").textContent = updated.description || "\\u2014";
          document.getElementById("panel-features-path").textContent = updated.features || "\\u2014";
          document.getElementById("panel-group").textContent = updated.group || "\\u2014";
          document.getElementById("panel-tags").textContent = (updated.tags && updated.tags.length > 0) ? updated.tags.join(', ') : "\\u2014";
          renderPanelDeps(updated);
          // Only re-render tab content if not actively editing
          const specEditArea = document.getElementById('spec-edit-area');
          if (!specEditArea) {
            renderSpecBody(updated);
          }
          // Re-render features only if no feature textarea is open
          const anyFeatureEdit = document.querySelector('[id^="feat-area-"]');
          if (!anyFeatureEdit) {
            renderFeatures(updated);
          }
        }
      }

      // Re-apply current lock state after data changes.
      if (nodesLocked) {
        applyComputedLayout();
      } else {
        nodes.forEach(n => { n.fx = n.x; n.fy = n.y; });
        tickUpdate();
      }
    }

    // Inline editing for spec body
    function startSpecEdit() {
      if (!selectedNode) return;
      const container = document.getElementById('panel-body');
      const body = selectedNode.body || '';
      container.innerHTML = '<textarea id="spec-edit-area" style="width:100%;min-height:300px;background:#0d0d1a;color:#ccc;border:1px solid #0f3460;border-radius:4px;padding:12px;font-family:monospace;font-size:13px;resize:vertical;">' + escapeHtml(body) + '</textarea>' +
        '<div style="margin-top:8px;display:flex;gap:8px;">' +
        '<button onclick="saveSpecBody()" style="background:#e94560;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;">Save</button>' +
        '<button onclick="cancelSpecEdit()" style="background:#333;color:#ccc;border:1px solid #555;padding:6px 16px;border-radius:4px;cursor:pointer;">Cancel</button>' +
        '</div>';
      document.getElementById('spec-edit-btn').style.display = 'none';
    }

    async function saveSpecBody() {
      if (!selectedNode) return;
      const textarea = document.getElementById('spec-edit-area');
      const newBody = textarea.value;
      try {
        const res = await fetch('/api/specs/' + encodeURIComponent(selectedNode.name) + '/body', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: newBody })
        });
        if (!res.ok) throw new Error('Save failed');
        // SSE will push the update
      } catch (err) {
        alert('Error saving: ' + err.message);
      }
    }

    function cancelSpecEdit() {
      if (!selectedNode) return;
      renderSpecBody(selectedNode);
      document.getElementById('spec-edit-btn').style.display = '';
    }

    // Inline editing for feature files
    function startFeatureEdit(specName, filename, content) {
      const containerId = 'feature-edit-' + filename.replace(/[^a-zA-Z0-9]/g, '_');
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '<textarea id="feat-area-' + containerId + '" style="width:100%;min-height:200px;background:#0d0d1a;color:#ccc;border:1px solid #0f3460;border-radius:4px;padding:12px;font-family:monospace;font-size:13px;resize:vertical;">' + escapeHtml(content) + '</textarea>' +
        '<div style="margin-top:8px;display:flex;gap:8px;">' +
        '<button onclick="saveFeatureFile(\\'' + escapeHtml(specName) + '\\', \\'' + escapeHtml(filename) + '\\', \\'' + containerId + '\\')" style="background:#e94560;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;">Save</button>' +
        '<button onclick="cancelFeatureEdit()" style="background:#333;color:#ccc;border:1px solid #555;padding:6px 16px;border-radius:4px;cursor:pointer;">Cancel</button>' +
        '</div>';
    }

    async function saveFeatureFile(specName, filename, containerId) {
      const textarea = document.getElementById('feat-area-' + containerId);
      const newContent = textarea.value;
      try {
        const res = await fetch('/api/features/' + encodeURIComponent(specName) + '/' + encodeURIComponent(filename), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent })
        });
        if (!res.ok) throw new Error('Save failed');
        // SSE will push the update
      } catch (err) {
        alert('Error saving: ' + err.message);
      }
    }

    function cancelFeatureEdit() {
      if (selectedNode) renderFeatures(selectedNode);
    }


    connectSSE();
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>M21 — Dependency Graph</title>
  <style>
${STYLES}
  </style>
</head>
<body>
  <div class="title-bar"><span>M21</span> dependency graph <span id="cycle-badge" class="cycle-badge" style="display:none;"></span></div>
  <div class="layout-toolbar">
    <label class="layout-lock">
      <input type="checkbox" id="lock-nodes">
      Lock nodes
    </label>
    <label class="layout-lock">
      <input type="checkbox" id="reverse-tree">
      Reverse tree
    </label>
    <span style="width:1px;height:20px;background:#0f3460;margin:0 8px;"></span>
    <button class="layout-btn" id="toggle-edge-labels" onclick="toggleEdgeLabels()">Edge Labels</button>
  </div>
  <svg id="graph"></svg>
  <div id="test-legend" style="display:none;">
    <span class="legend-item"><span class="legend-dot" style="background:#3fb950;"></span>passed</span>
    <span class="legend-item"><span class="legend-dot" style="background:#f85149;"></span>failed</span>
    <span class="legend-item"><span class="legend-dot" style="background:#d29922;"></span>other</span>
    <span class="legend-item"><span class="legend-dot legend-dot-empty"></span>no data</span>
  </div>
  <div id="info-panel">
    <button class="close-btn" onclick="closePanel()">&times;</button>
    <div id="panel-meta">
      <h2 id="panel-name"></h2>
      <div id="panel-test-summary" class="test-summary"></div>
      <div class="field">
        <label>Description</label>
        <div class="value" id="panel-description"></div>
      </div>
      <div class="field">
        <label>Group</label>
        <div class="value" id="panel-group"></div>
      </div>
      <div class="field">
        <label>Tags</label>
        <div class="value" id="panel-tags"></div>
      </div>
      <div class="field">
        <label>Dependencies</label>
        <div class="value" id="panel-deps"></div>
      </div>
      <div class="field">
        <label>Features Path</label>
        <div class="value" id="panel-features-path"></div>
      </div>
    </div>
    <div class="panel-tabs">
      <button class="panel-tab active" id="panel-tab-spec" onclick="switchTab('spec')">Spec</button>
      <button class="panel-tab" id="panel-tab-features" onclick="switchTab('features')">Features</button>
    </div>
    <div id="panel-spec-tab" class="panel-tab-content">
      <div class="spec-edit-header">
        <button class="edit-btn" id="spec-edit-btn" onclick="startSpecEdit()">Edit</button>
      </div>
      <div id="panel-body"></div>
    </div>
    <div id="panel-features-tab" class="panel-tab-content">
      <div id="panel-features-content"></div>
    </div>
  </div>

  <script data-vendor="d3">${D3_MIN}</script>
  <script data-vendor="marked">${MARKED_MIN}</script>
  <script>
    const specs = ${specsJSON};
    let selectedNode = null;

    // Analyze graph: detects cycles via Tarjan's SCC and computes cycle-safe
    // depth so A<->B cycles don't infinite-loop. Edges within a cycle SCC are
    // marked with { cycle: true } so they can be rendered distinctly.
    function analyzeGraphData(specsArr) {
      const nameMap = {};
      specsArr.forEach(s => { nameMap[s.name.toLowerCase()] = s; });

      const adj = {};
      specsArr.forEach(s => {
        const targets = [];
        (s.depends_on || []).forEach(dep => {
          const depName = typeof dep === 'string' ? dep : (dep && dep.name);
          if (!depName) return;
          const t = nameMap[depName.toLowerCase()];
          if (t) targets.push(t.name);
        });
        adj[s.name] = targets;
      });

      // Tarjan's SCC
      let idx = 0;
      const stack = [];
      const onStack = {};
      const indices = {};
      const low = {};
      const sccs = [];
      const nodeScc = {};

      function strongconnect(v) {
        indices[v] = idx;
        low[v] = idx;
        idx++;
        stack.push(v);
        onStack[v] = true;
        (adj[v] || []).forEach(w => {
          if (indices[w] === undefined) {
            strongconnect(w);
            if (low[w] < low[v]) low[v] = low[w];
          } else if (onStack[w]) {
            if (indices[w] < low[v]) low[v] = indices[w];
          }
        });
        if (low[v] === indices[v]) {
          const scc = [];
          let w;
          do {
            w = stack.pop();
            delete onStack[w];
            nodeScc[w] = sccs.length;
            scc.push(w);
          } while (w !== v);
          sccs.push(scc);
        }
      }
      specsArr.forEach(s => {
        if (indices[s.name] === undefined) strongconnect(s.name);
      });

      const inCycle = {};
      const cycles = [];
      sccs.forEach(scc => {
        const isCycle = scc.length > 1 ||
          (scc.length === 1 && (adj[scc[0]] || []).includes(scc[0]));
        if (isCycle) {
          cycles.push(scc);
          scc.forEach(n => { inCycle[n] = true; });
        }
      });

      function isCycleEdge(a, b) {
        return !!(inCycle[a] && inCycle[b] && nodeScc[a] === nodeScc[b]);
      }

      // Cycle-safe depth (operate on condensed DAG)
      const depth = {};
      function calcD(name, visiting) {
        if (depth[name] !== undefined) return depth[name];
        if (visiting[name]) return 0;
        visiting[name] = true;
        const effective = (adj[name] || []).filter(t => !isCycleEdge(name, t));
        let d = 0;
        if (effective.length > 0) {
          let maxParent = 0;
          effective.forEach(t => {
            const td = calcD(t, visiting);
            if (td > maxParent) maxParent = td;
          });
          d = maxParent + 1;
        }
        delete visiting[name];
        depth[name] = d;
        return d;
      }
      specsArr.forEach(s => calcD(s.name, {}));

      // Build links with cycle flag
      const links = [];
      specsArr.forEach(s => {
        (s.depends_on || []).forEach(dep => {
          const depName = typeof dep === 'string' ? dep : (dep && dep.name);
          const uses = (typeof dep === 'object' && dep.uses) ? dep.uses : [];
          if (!depName) return;
          const target = nameMap[depName.toLowerCase()];
          if (target) {
            links.push({
              source: s.name,
              target: target.name,
              uses,
              cycle: isCycleEdge(s.name, target.name),
            });
          }
        });
      });

      // Dependents count
      const dependentsCount = {};
      specsArr.forEach(s => { dependentsCount[s.name] = 0; });
      Object.keys(adj).forEach(src => {
        adj[src].forEach(tgt => {
          dependentsCount[tgt] = (dependentsCount[tgt] || 0) + 1;
        });
      });

      return { adj, nodeScc, inCycle, cycles, depth, dependentsCount, links };
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Tab switching
    function switchTab(tab) {
      const specTab = document.getElementById('panel-spec-tab');
      const featuresTab = document.getElementById('panel-features-tab');
      const specBtn = document.getElementById('panel-tab-spec');
      const featuresBtn = document.getElementById('panel-tab-features');

      if (tab === 'spec') {
        specTab.style.display = 'block';
        featuresTab.style.display = 'none';
        specBtn.classList.add('active');
        featuresBtn.classList.remove('active');
      } else {
        specTab.style.display = 'none';
        featuresTab.style.display = 'block';
        specBtn.classList.remove('active');
        featuresBtn.classList.add('active');
      }
    }

    // Render panel dependencies with uses tags
    function renderPanelDeps(d) {
      const depsContainer = document.getElementById("panel-deps");
      if (!d.depends_on || d.depends_on.length === 0) {
        depsContainer.textContent = "None (root node)";
        return;
      }
      let html = '';
      if (d.inCycle) {
        html += '<div style="margin-bottom:8px;color:#e94560;font-size:11px;">&#9888; This spec is part of a dependency cycle.</div>';
      }
      d.depends_on.forEach(dep => {
        const depName = typeof dep === 'string' ? dep : dep.name;
        const uses = (typeof dep === 'object' && dep.uses) ? dep.uses : [];
        // A dep is "cyclic" from this node's perspective if both ends sit in
        // the same cycle SCC — match via name lookup against graphInCycle.
        const isCyclic = !!(d.inCycle && depName && graphInCycle && graphInCycle[
          (specs.find(s => s.name.toLowerCase() === depName.toLowerCase()) || {}).name
        ]);
        html += '<div style="margin-bottom:6px;">';
        html += '<span class="dep-tag' + (isCyclic ? ' cycle' : '') + '">' + escapeHtml(depName) + (isCyclic ? ' &#8635;' : '') + '</span>';
        if (uses.length > 0) {
          html += '<br>';
          uses.forEach(u => {
            html += '<span class="uses-tag">' + escapeHtml(u) + '</span>';
          });
        }
        html += '</div>';
      });
      depsContainer.innerHTML = html;
    }

    // Render features tab content
    // Map a test status to a colour. Returns null for "no data".
    function statusColor(status) {
      if (status === 'passed') return '#3fb950';
      if (status === 'failed') return '#f85149';
      if (status === 'skipped' || status === 'pending' || status === 'undefined' || status === 'ambiguous') return '#d29922';
      return null;
    }

    // "passed/total" label for inside a node circle, or '' when no data.
    function countLabel(counts) {
      return (counts && counts.total) ? counts.passed + '/' + counts.total : '';
    }

    // Render a small inline status pill, or '' when there is no result data.
    function statusBadge(status) {
      if (!status) return '';
      const sym = status === 'passed' ? '\\u2713' : status === 'failed' ? '\\u2717' : '\\u2013';
      return '<span class="status-pill status-' + status + '" title="' + status + '">' + sym + '</span>';
    }

    // "passed / total" summary text from a testCounts object, or ''.
    function countsSummary(counts) {
      if (!counts || !counts.total) return '';
      return counts.passed + ' / ' + counts.total + ' passing';
    }

    // Populate the spec-level test summary in the side panel header.
    function renderTestSummary(d) {
      const el = document.getElementById('panel-test-summary');
      if (!el) return;
      const summary = countsSummary(d.testCounts);
      if (summary) {
        el.innerHTML = statusBadge(d.testStatus) + '<span>' + summary + '</span>';
        el.style.display = '';
      } else {
        el.innerHTML = '';
        el.style.display = 'none';
      }
    }

    // Show the legend only when some spec carries test data.
    function updateTestLegend() {
      const el = document.getElementById('test-legend');
      if (!el) return;
      el.style.display = nodes.some(n => n.testStatus) ? '' : 'none';
    }

    function scenarioTestDetailsHtml(scenario, id) {
      const details = scenario.testDetails;
      if (!details || !details.steps || details.steps.length === 0) {
        return '<div class="scenario-test-details" id="' + id + '" onclick="event.stopPropagation()"><p>No test details available.</p></div>';
      }
      let html = '<div class="scenario-test-details" id="' + id + '" onclick="event.stopPropagation()">';
      if (details.source) {
        html += '<div class="test-source">' + escapeHtml(details.source) + '</div>';
      }
      details.steps.forEach(step => {
        html += '<div class="test-step-detail">';
        html += '<div class="test-step-title">' + statusBadge(step.status) + '<span>' + escapeHtml(step.text || '') + '</span></div>';
        if (step.source) html += '<div class="test-step-source">' + escapeHtml(step.source) + '</div>';
        if (step.definition) html += '<pre><code>' + escapeHtml(step.definition) + '</code></pre>';
        html += '</div>';
      });
      html += '</div>';
      return html;
    }

    function renderFeatures(d) {
      const container = document.getElementById('panel-features-content');
      const featureFiles = d.featureFiles || [];

      if (featureFiles.length === 0) {
        container.innerHTML = '<p class="no-features-msg">No feature files found</p>';
        return;
      }

      let html = '';
      featureFiles.forEach((f, idx) => {
        const safeId = f.filename.replace(/[^a-zA-Z0-9]/g, '_');
        html += '<div class="feature-section">';
        html += '<div class="feature-header" onclick="toggleFeature(\\'feat-' + idx + '\\')">';
        html += '<span class="feature-toggle" id="toggle-feat-' + idx + '">&#9654;</span>';
        html += statusBadge(f.testStatus);
        html += '<h3>' + escapeHtml(f.name) + '</h3>';
        html += '<span class="feature-filename">' + escapeHtml(f.filename) + '</span>';
        const fSummary = countsSummary(f.testCounts);
        if (fSummary) html += '<span class="feature-counts">' + fSummary + '</span>';
        ${liveReload ? `html += '<button class="edit-btn" style="margin-left:auto;" onclick="event.stopPropagation(); startFeatureEdit(\\'' + escapeHtml(d.name) + '\\', \\'' + escapeHtml(f.filename) + '\\', \\'' + escapeHtml(f.content).replace(/\\n/g, '\\\\n').replace(/'/g, "\\\\'") + '\\')">Edit</button>';` : ''}
        html += '</div>';
        html += '<div class="feature-scenarios" id="feat-' + idx + '">';
        html += '<ul class="scenario-list">';
        (f.scenarios || []).forEach((s, scenarioIdx) => {
          const scenario = typeof s === 'string' ? { name: s, steps: [] } : s;
          const detailId = 'scenario-detail-' + idx + '-' + scenarioIdx;
          html += '<li class="scenario-item" data-detail-id="' + detailId + '">';
          html += '<div class="scenario-title-row">';
          html += statusBadge(scenario.status);
          html += '<strong>' + escapeHtml(scenario.name) + '</strong>';
          html += '<span class="scenario-detail-hint">details</span>';
          html += '</div>';
          if (scenario.steps && scenario.steps.length > 0) {
            html += '<ul class="scenario-steps">';
            scenario.steps.forEach(step => {
              html += '<li>' + escapeHtml(step) + '</li>';
            });
            html += '</ul>';
          }
          html += scenarioTestDetailsHtml(scenario, detailId);
          html += '</li>';
        });
        html += '</ul>';
        html += '<div id="feature-edit-' + safeId + '"></div>';
        html += '</div>';
        html += '</div>';
      });

      container.innerHTML = html;
      container.querySelectorAll('.scenario-item').forEach(item => {
        item.addEventListener('click', () => {
          toggleScenarioDetails(item.dataset.detailId);
        });
      });
    }

    function toggleFeature(id) {
      const el = document.getElementById(id);
      const toggle = document.getElementById('toggle-' + id);
      if (el.classList.contains('expanded')) {
        el.classList.remove('expanded');
        if (toggle) toggle.classList.remove('expanded');
      } else {
        el.classList.add('expanded');
        if (toggle) toggle.classList.add('expanded');
      }
    }

    function toggleScenarioDetails(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('expanded');
    }

    // Render spec body (markdown preview)
    function renderSpecBody(d) {
      const bodyContainer = document.getElementById('panel-body');
      if (d.body && d.body.trim()) {
        bodyContainer.innerHTML = typeof marked !== 'undefined'
          ? marked.parse(d.body)
          : '<pre>' + escapeHtml(d.body) + '</pre>';
      } else {
        bodyContainer.innerHTML = '<p style="color: #666;">No content</p>';
      }
    }

    // Update the cycle badge in the title bar based on current graphCycles state
    function updateCycleBadge() {
      const el = document.getElementById('cycle-badge');
      if (!el) return;
      const n = (graphCycles || []).length;
      if (n === 0) {
        el.style.display = 'none';
        el.textContent = '';
      } else {
        el.style.display = '';
        el.textContent = n + ' cycle' + (n === 1 ? '' : 's');
        el.title = graphCycles.map(scc => scc.join(' -> ') + ' -> ' + scc[0]).join('\\n');
      }
    }

    // Build nodes and links via cycle-aware analyzer
    const initialAnalysis = analyzeGraphData(specs);
    const nodes = specs.map(s => ({ id: s.name, ...s }));
    const links = initialAnalysis.links;
    const dependentsCount = { ...initialAnalysis.dependentsCount };
    const depthMemo = { ...initialAnalysis.depth };
    const maxDepth = Math.max(0, ...Object.values(depthMemo));
    let graphInCycle = { ...initialAnalysis.inCycle };
    let graphCycles = initialAnalysis.cycles.slice();
    // Annotate nodes with cycle membership for panel rendering
    nodes.forEach(n => { n.inCycle = !!graphInCycle[n.id]; });
    // Show cycle badge if cycles exist (runs once at startup; updateGraph
    // calls updateCycleBadge itself after rebuild).
    setTimeout(updateCycleBadge, 0);
    setTimeout(updateTestLegend, 0);

    const colorScale = d3.scaleSequential(d3.interpolateCool)
      .domain([0, Math.max(maxDepth, 1)]);

    // Group colors
    const groups = [...new Set(specs.map(s => s.group).filter(Boolean))];
    const groupColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(groups);

    // SVG setup
    const svg = d3.select("#graph");
    const width = window.innerWidth;
    const height = window.innerHeight;

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    // Arrow markers (normal + cycle variant)
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5L2.5,0Z")
      .attr("class", "link-arrow");
    defs.append("marker")
      .attr("id", "arrowhead-cycle")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5L2.5,0Z")
      .attr("class", "link-arrow cycle");

    // Group hulls layer (drawn behind everything)
    const hullGroup = g.append("g").attr("class", "hulls");
    const hullLabelGroup = g.append("g").attr("class", "hull-labels");

    // Layout state: locked keeps the computed tree-and-groups layout;
    // unlocked lets users manually position nodes by dragging.
    let nodesLocked = false;
    let reverseTree = false;

    // A stopped simulation owns node/link data for d3 compatibility, but the
    // default view is computed and stable.
    const simulation = d3.forceSimulation(nodes).stop();

    // Draw links
    const link = g.selectAll(".link")
      .data(links)
      .join("line")
      .attr("class", d => "link" + (d.cycle ? " cycle" : ""))
      .attr("marker-end", d => d.cycle ? "url(#arrowhead-cycle)" : "url(#arrowhead)");

    // Draw link labels (feature uses) — hidden by default
    let showEdgeLabels = false;
    const linkLabel = g.selectAll(".link-label")
      .data(links.filter(l => l.uses && l.uses.length > 0))
      .join("text")
      .attr("class", "link-label")
      .attr("display", "none")
      .text(d => d.uses.join(', '));

    function toggleEdgeLabels() {
      showEdgeLabels = !showEdgeLabels;
      g.selectAll(".link-label").attr("display", showEdgeLabels ? null : "none");
      document.getElementById("toggle-edge-labels").classList.toggle("active", showEdgeLabels);
    }

    // Draw nodes
    const node = g.selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .classed("cycle", d => !!d.inCycle)
      .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded));

    node.append("circle")
      .attr("r", d => 14 + (dependentsCount[d.id] || 0) * 4)
      .attr("fill", d => colorScale(depthMemo[d.id] || 0))
      .attr("stroke", d => statusColor(d.testStatus) || d3.color(colorScale(depthMemo[d.id] || 0)).brighter(0.8))
      .style("stroke-width", d => statusColor(d.testStatus) ? "4px" : null);

    node.append("text")
      .attr("dy", d => (14 + (dependentsCount[d.id] || 0) * 4) + 16)
      .text(d => d.name);

    node.append("text")
      .attr("class", "node-count")
      .attr("dy", "0.35em")
      .text(d => countLabel(d.testCounts));

    // Click to select
    node.on("click", (event, d) => {
      event.stopPropagation();
      selectNode(d);
    });

    svg.on("click", () => closePanel());

    function selectNode(d) {
      selectedNode = d;
      node.classed("selected", n => n.id === d.id);
      document.getElementById("panel-name").textContent = d.name;
      renderTestSummary(d);
      document.getElementById("panel-description").textContent = d.description || "\\u2014";
      document.getElementById("panel-features-path").textContent = d.features || "\\u2014";
      document.getElementById("panel-group").textContent = d.group || "\\u2014";

      const tagsContainer = document.getElementById("panel-tags");
      if (d.tags && d.tags.length > 0) {
        tagsContainer.innerHTML = d.tags.map(t => '<span class="tag-pill">' + escapeHtml(t) + '</span>').join('');
      } else {
        tagsContainer.textContent = "\\u2014";
      }

      renderPanelDeps(d);

      // Render spec body
      renderSpecBody(d);
      document.getElementById('spec-edit-btn').style.display = '';

      // Render features
      renderFeatures(d);

      // Only reset to spec tab if panel is not already open
      const panel = document.getElementById("info-panel");
      if (!panel.classList.contains("open")) {
        switchTab('spec');
      }

      panel.classList.add("open");
    }

    function closePanel() {
      document.getElementById("info-panel").classList.remove("open");
      node.classed("selected", false);
      selectedNode = null;
    }

    // Group hull rendering
    function updateGroupHulls() {
      const groupMap = {};
      nodes.forEach(n => {
        if (n.group) {
          if (!groupMap[n.group]) groupMap[n.group] = [];
          groupMap[n.group].push(n);
        }
      });

      const hullData = Object.entries(groupMap)
        .filter(([, members]) => members.length >= 2)
        .map(([group, members]) => {
          const points = [];
          const pad = 40;
          members.forEach(m => {
            const r = 14 + (dependentsCount[m.id] || 0) * 4 + pad;
            // Add points around each node for a rounder hull
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              points.push([m.x + Math.cos(a) * r, m.y + Math.sin(a) * r]);
            }
          });
          return { group, points, members };
        });

      const hulls = hullGroup.selectAll(".group-hull")
        .data(hullData, d => d.group);

      hulls.exit().remove();

      hulls.enter()
        .append("path")
        .attr("class", "group-hull")
        .merge(hulls)
        .attr("d", d => {
          const hull = d3.polygonHull(d.points);
          return hull ? "M" + hull.join("L") + "Z" : "";
        })
        .attr("fill", d => groupColorScale(d.group))
        .attr("stroke", d => groupColorScale(d.group));

      // Group labels
      const labels = hullLabelGroup.selectAll(".group-label")
        .data(hullData, d => d.group);

      labels.exit().remove();

      labels.enter()
        .append("text")
        .attr("class", "group-label")
        .call(d3.drag()
          .on("start", groupDragStarted)
          .on("drag", groupDragged)
          .on("end", groupDragEnded))
        .merge(labels)
        .text(d => d.group)
        .attr("x", d => {
          const xs = d.members.map(m => m.x);
          return (Math.min(...xs) + Math.max(...xs)) / 2;
        })
        .attr("y", d => {
          const ys = d.members.map(m => m.y);
          return Math.min(...ys) - 50;
        })
        .attr("text-anchor", "middle")
        .attr("fill", d => groupColorScale(d.group));
    }

    function linkEndpoint(ref) {
      if (typeof ref !== 'string') return ref;
      return nodes.find(n => n.id === ref) || { x: 0, y: 0 };
    }

    // Updates positions for links, labels, nodes, and hulls
    function tickUpdate() {
      link
        .attr("x1", d => linkEndpoint(d.source).x)
        .attr("y1", d => linkEndpoint(d.source).y)
        .attr("x2", d => linkEndpoint(d.target).x)
        .attr("y2", d => linkEndpoint(d.target).y);

      linkLabel
        .attr("x", d => (linkEndpoint(d.source).x + linkEndpoint(d.target).x) / 2)
        .attr("y", d => (linkEndpoint(d.source).y + linkEndpoint(d.target).y) / 2 - 6);

      node.attr("transform", d => "translate(" + d.x + "," + d.y + ")");

      updateGroupHulls();
    }

    simulation.on("tick", tickUpdate);

    // Drag handlers
    function dragStarted(event, d) {
      if (nodesLocked || !d) return;
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      if (nodesLocked || !d) return;
      d.x = event.x;
      d.y = event.y;
      d.fx = event.x;
      d.fy = event.y;
      tickUpdate();
    }

    function dragEnded(event, d) {
      if (nodesLocked || !d) return;
      d.fx = d.x;
      d.fy = d.y;
      tickUpdate();
    }

    function groupDragStarted(event, d) {
      if (nodesLocked || !d) return;
      (d.members || []).forEach(n => {
        n.fx = n.x;
        n.fy = n.y;
      });
    }

    function groupDragged(event, d) {
      if (nodesLocked || !d) return;
      const dx = event.dx || 0;
      const dy = event.dy || 0;
      (d.members || []).forEach(n => {
        n.x += dx;
        n.y += dy;
        n.fx = n.x;
        n.fy = n.y;
      });
      tickUpdate();
    }

    function groupDragEnded(event, d) {
      if (nodesLocked || !d) return;
      (d.members || []).forEach(n => {
        n.fx = n.x;
        n.fy = n.y;
      });
      tickUpdate();
    }

    // --- Default tree-and-groups layout ---
    // Depth controls vertical rows. Group controls horizontal bands. Nodes that
    // share both depth and group receive small offsets so they never overlap.
    function computeDefaultPositions() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const marginX = 120;
      const yPad = 90;

      const groupKeys = [...new Set(nodes.map(n => n.group || '(ungrouped)'))].sort();
      const groupCenter = {};
      const usableW = Math.max(1, w - marginX * 2);
      groupKeys.forEach((group, i) => {
        groupCenter[group] = groupKeys.length === 1
          ? w / 2
          : marginX + (usableW * i) / (groupKeys.length - 1);
      });

      const depths = nodes.map(n => depthMemo[n.id] || 0);
      const maxD = Math.max(0, ...depths);
      const ySpacing = maxD === 0 ? 0 : Math.min(150, (h - yPad * 2) / maxD);

      const buckets = {};
      nodes.forEach(n => {
        const depth = depthMemo[n.id] || 0;
        const displayDepth = reverseTree ? depth : maxD - depth;
        const group = n.group || '(ungrouped)';
        const key = displayDepth + '|' + group;
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(n);
      });

      Object.values(buckets).forEach(bucket => {
        bucket.sort((a, b) => a.id.localeCompare(b.id));
        const depth = depthMemo[bucket[0].id] || 0;
        const displayDepth = reverseTree ? depth : maxD - depth;
        const group = bucket[0].group || '(ungrouped)';
        const centerX = groupCenter[group];
        const y = yPad + displayDepth * ySpacing;
        const spacing = 72;
        const start = -((bucket.length - 1) * spacing) / 2;
        bucket.forEach((n, i) => {
          n.x = centerX + start + i * spacing;
          n.y = y;
          n.fx = n.x;
          n.fy = n.y;
        });
      });
    }

    function applyComputedLayout() {
      computeDefaultPositions();
      simulation.stop();
      tickUpdate();
    }

    function setNodesLocked(locked) {
      nodesLocked = !!locked;
      const checkbox = document.getElementById('lock-nodes');
      if (checkbox) checkbox.checked = nodesLocked;

      if (nodesLocked) {
        applyComputedLayout();
      } else {
        simulation.stop();
        nodes.forEach(n => {
          n.fx = n.x;
          n.fy = n.y;
        });
        tickUpdate();
      }
    }

    function setReverseTree(reversed) {
      reverseTree = !!reversed;
      const checkbox = document.getElementById('reverse-tree');
      if (checkbox) checkbox.checked = reverseTree;
      applyComputedLayout();
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      applyComputedLayout();
    });

    const lockNodesCheckbox = document.getElementById('lock-nodes');
    if (lockNodesCheckbox) {
      lockNodesCheckbox.addEventListener('change', event => {
        setNodesLocked(event.target.checked);
      });
    }

    const reverseTreeCheckbox = document.getElementById('reverse-tree');
    if (reverseTreeCheckbox) {
      reverseTreeCheckbox.addEventListener('change', event => {
        setReverseTree(event.target.checked);
      });
    }

    applyComputedLayout();

    // Non-live-reload stubs for edit functions
    function startSpecEdit() {}

    ${sseClientScript}
  </script>
</body>
</html>`;
}
