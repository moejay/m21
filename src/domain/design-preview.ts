import type { Concept } from "./model.js";
import { activeVisualTheme, renderFoundationSpecimen, renderThemeSpecimen, renderVisualComponent, visualDesignArtifacts, visualDesignSection } from "./visual-design.js";

export function generateDesignPreview(concepts: Concept[]): string {
  const visual = visualDesignArtifacts(concepts);
  const theme = activeVisualTheme(concepts);
  const sections = new Map<string, Concept[]>();
  for (const concept of visual) {
    const section = visualDesignSection(concept);
    if (section) sections.set(section, [...(sections.get(section) ?? []), concept]);
  }
  const order = ["direction", "foundations", "themes", "components", "assets", "accessibility", "decisions"];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>M21 Visual Design catalog</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#ece9e2;color:#20252c;font:14px/1.55 system-ui,sans-serif}.shell{display:grid;grid-template-columns:240px 1fr;min-height:100vh}aside{position:sticky;top:0;height:100vh;padding:26px 18px;background:#252b35;color:#f7f5f0}aside strong{font-size:18px}aside p{color:#aeb4bf;font-size:11px}aside a{display:block;padding:7px 8px;color:inherit;text-decoration:none;text-transform:capitalize}main{max-width:1280px;width:100%;padding:48px clamp(24px,5vw,72px)}h1{font-size:38px;letter-spacing:-.04em}h2{text-transform:capitalize;border-bottom:1px solid #cfcbc2;padding-bottom:8px}.intro{max-width:760px;color:#646a72}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}.card{overflow:hidden;border:1px solid #d5d2ca;border-radius:14px;background:#fffefa;box-shadow:0 5px 20px rgba(31,36,43,.08)}.head{padding:18px}.head small{color:#6b7077;text-transform:uppercase}.head h3{margin:11px 0 4px}.head p{margin:0;color:#6b7077;font-size:11px}.specimen{width:100%;min-height:300px;border:0;border-top:1px solid #d5d2ca;background:white}.document{padding:18px;white-space:pre-wrap;font-size:11px}.section{margin:42px 0}.empty{color:#6b7077}@media(max-width:760px){.shell{grid-template-columns:1fr}aside{position:relative;height:auto}main{padding:28px 18px}}
</style></head><body><div class="shell"><aside><strong>M21 Visual Design</strong><p>Disposable catalog from accepted sources${theme ? `<br>Theme: ${escapeHtml(theme.title)}` : ""}</p><nav>${order.filter((section) => sections.has(section)).map((section) => `<a href="#${section}">${section}</a>`).join("")}</nav></aside><main><span>Accepted Visual Design</span><h1>Shared visual language</h1><p class="intro">Direction, linked CSS foundations, composed themes, and isolated HTML component specimens. Canonical sources remain in the OKF bundle.</p>${order.filter((section) => sections.has(section)).map((section) => renderSection(section, sections.get(section) ?? [], concepts)).join("\n")}${visual.length === 0 ? '<p class="empty">No accepted Visual Design concepts are available.</p>' : ""}</main></div></body></html>`;
}

function renderSection(section: string, concepts: Concept[], allConcepts: Concept[]): string {
  return `<section class="section" id="${section}"><h2>${section}</h2><div class="grid">${concepts.sort((left, right) => left.title.localeCompare(right.title)).map((concept) => {
    const specimen = section === "components" ? renderVisualComponent(concept, allConcepts) : section === "foundations" ? renderFoundationSpecimen(concept, allConcepts) : section === "themes" ? renderThemeSpecimen(concept, allConcepts) : undefined;
    return `<article class="card"><div class="head"><small>${escapeHtml(concept.type)}</small><h3>${escapeHtml(concept.title)}</h3><p>${escapeHtml(concept.description)}</p></div>${specimen ? `<iframe class="specimen" title="${escapeAttribute(concept.title)} specimen" sandbox="${specimen.sandbox}" srcdoc="${escapeAttribute(specimen.html)}"></iframe>` : `<div class="document">${escapeHtml(concept.body)}</div>`}</article>`;
  }).join("")}</div></section>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
