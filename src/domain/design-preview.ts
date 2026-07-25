import type { Concept } from "./model.js";
import { projectTheme, type ProjectTheme, type SemanticThemeToken } from "./theme.js";

export interface ComponentStory {
  id: string;
  title: string;
  description: string;
  kind: string;
  variants: string[];
}

export function componentStories(concepts: Concept[]): ComponentStory[] {
  return concepts
    .filter((concept) => concept.type === "Component Story" && concept.status === "active" && concept.sdlc.includes("design"))
    .flatMap((concept) => {
      const design = objectValue(concept.metadata.design);
      const preview = objectValue(design?.preview);
      if (!preview || typeof preview.kind !== "string") return [];
      return [{
        id: concept.id,
        title: concept.title,
        description: concept.description,
        kind: preview.kind,
        variants: Array.isArray(preview.variants)
          ? preview.variants.filter((variant): variant is string => typeof variant === "string")
          : [],
      }];
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function generateDesignPreview(concepts: Concept[]): string {
  const theme = projectTheme(concepts);
  const stories = componentStories(concepts);
  const title = escapeHtml(theme ? `Design preview · ${theme.sourceConceptId}` : "Design preview");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
${themeCss(theme)}
*{box-sizing:border-box} body{margin:0;background:var(--canvas);color:var(--text);font-family:var(--font-sans);font-size:14px} button,input,select,textarea{font:inherit} button{border:1px solid var(--border);border-radius:var(--radius-small);background:var(--surface);color:var(--text);padding:9px 14px;font-weight:650;cursor:pointer} button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 28%,transparent);outline-offset:2px}.shell{display:grid;grid-template-columns:250px 1fr;min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;padding:26px 18px;background:var(--chrome);color:var(--chrome-text)}.brand{font-size:20px;font-weight:750}.source{margin:8px 0 25px;color:color-mix(in srgb,var(--chrome-text) 65%,transparent);font:11px/1.5 var(--font-mono)}.sidebar a{display:block;margin:3px 0;padding:9px 10px;border-radius:var(--radius-small);color:inherit;text-decoration:none}.sidebar a:hover{background:color-mix(in srgb,var(--chrome-text) 10%,transparent)}main{max-width:1120px;width:100%;padding:48px clamp(28px,6vw,80px)}.eyebrow{color:var(--muted);font:600 11px var(--font-mono);letter-spacing:.08em;text-transform:uppercase}h1{margin:10px 0 8px;font-size:38px;letter-spacing:-.035em}h2{margin:0;font-size:22px}h3{font-size:15px}.intro{max-width:720px;color:var(--muted);font-size:16px;line-height:1.65}.tokens{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:28px 0 52px}.token{overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-medium);background:var(--surface)}.swatch{height:72px;border-bottom:1px solid var(--border)}.token div:last-child{padding:10px}.token strong,.token code{display:block}.token code{margin-top:3px;color:var(--muted);font-size:10px}.story{scroll-margin-top:30px;margin:0 0 28px;padding:28px;border:1px solid var(--border);border-radius:var(--radius-large);background:var(--surface);box-shadow:var(--shadow)}.story-head{display:flex;justify-content:space-between;gap:24px;margin-bottom:24px}.story-head p{max-width:620px;margin:6px 0 0;color:var(--muted);line-height:1.55}.variants{color:var(--muted);font:10px var(--font-mono)}.stage{padding:32px;border:1px dashed var(--border);border-radius:var(--radius-medium);background:var(--surface-muted)}.row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}.quiet{border-color:transparent;background:transparent}.field{display:grid;gap:6px;min-width:240px}.field label{font-weight:700;font-size:12px}.field input,.field select,.field textarea{width:100%;padding:10px 11px;border:1px solid var(--border);border-radius:var(--radius-small);background:var(--surface);color:var(--text)}.field small{color:var(--muted)}.knowledge{overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-medium);background:var(--surface)}.knowledge summary{padding:18px;cursor:pointer}.knowledge summary strong,.knowledge summary span{display:block}.knowledge summary span{margin-top:5px;color:var(--muted)}.knowledge article{padding:20px;border-top:1px solid var(--border);line-height:1.65}.rail{display:flex;overflow:auto;border-bottom:1px solid var(--border);background:var(--surface)}.rail button{min-width:120px;border:0;border-radius:0;background:transparent;text-align:left}.rail button.selected{box-shadow:inset 0 -3px var(--accent);background:var(--canvas)}.badge{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:10px;background:var(--warning);color:white;font-size:10px}@media(max-width:760px){.shell{grid-template-columns:1fr}.sidebar{position:relative;height:auto}.sidebar nav{display:flex;overflow:auto}main{padding:30px 20px}.story{padding:20px}.story-head{display:block}.variants{margin-top:10px}}
</style>
</head>
<body><div class="shell"><aside class="sidebar"><div class="brand">M21 Design</div><div class="source">Generated from ${escapeHtml(theme?.sourceConceptId ?? "default theme")}</div><nav><a href="#foundations">Foundations</a>${stories.map((story) => `<a href="#${escapeAttribute(story.id)}">${escapeHtml(story.title)}</a>`).join("")}</nav></aside><main>
<section id="foundations"><span class="eyebrow">Generated component preview</span><h1>Visual language in use</h1><p class="intro">This standalone catalog is projected from accepted OKF design knowledge. The same semantic theme is applied to M21 itself.</p>${tokenGallery(theme)}</section>
${stories.map(renderStory).join("\n")}
</main></div></body></html>`;
}

function renderStory(story: ComponentStory): string {
  return `<section class="story" id="${escapeAttribute(story.id)}"><div class="story-head"><div><h2>${escapeHtml(story.title)}</h2><p>${escapeHtml(story.description)}</p></div><div class="variants">${escapeHtml(story.variants.join(" · "))}</div></div><div class="stage">${storyMarkup(story.kind)}</div></section>`;
}

function storyMarkup(kind: string): string {
  switch (kind) {
    case "actions": return `<div class="row"><button class="primary">Accept change</button><button>Review impact</button><button class="quiet">Cancel</button><button disabled>Unavailable</button></div>`;
    case "form-fields": return `<div class="row"><div class="field"><label for="name">Concept title</label><input id="name" value="Generated Views"><small>Use a concise noun phrase.</small></div><div class="field"><label for="kind">Concept type</label><select id="kind"><option>Product Capability</option><option>Design Foundation</option></select></div><div class="field"><label for="instruction">Guidance</label><textarea id="instruction" rows="3">Challenge this definition.</textarea></div></div>`;
    case "knowledge-cards": return `<details class="knowledge"><summary><strong>Non-Linear Knowledge Graph</strong><span>Explore and evolve connected product knowledge from any point.</span></summary><article><h3>Outcome</h3><p>People can work at any definition layer without losing upstream intent or downstream consequences.</p></article></details>`;
    case "navigation": return `<nav class="rail"><button>Business<br><small>10 artifacts</small></button><button>Product<br><small>11 artifacts</small></button><button class="selected">Visual Design<br><small>Experience</small></button><button>System Design<br><small>Conceptual</small></button><button>Architecture<br><small>Applications</small></button></nav>`;
    default: return `<div class="knowledge"><div style="padding:20px"><strong>Preview not defined</strong><p>Add a supported design.preview kind to this component story.</p></div></div>`;
  }
}

function tokenGallery(theme: ProjectTheme | undefined): string {
  if (!theme) return "<p>No active theme is available.</p>";
  const colorTokens = Object.entries(theme.tokens).filter(([token]) => !token.startsWith("font-") && !token.startsWith("radius-") && token !== "shadow");
  return `<div class="tokens">${colorTokens.map(([token, value]) => `<div class="token"><div class="swatch" style="background:${safeCssValue(value)}"></div><div><strong>${escapeHtml(token)}</strong><code>${escapeHtml(value)}</code></div></div>`).join("")}</div>`;
}

function themeCss(theme: ProjectTheme | undefined): string {
  const defaults: Record<SemanticThemeToken, string> = {
    canvas: "#f7f5f0", surface: "#fffefa", "surface-muted": "#eeece6", text: "#20252c", muted: "#6b7077", border: "#d5d2ca", accent: "#3f4c83", "accent-contrast": "#ffffff", chrome: "#252b35", "chrome-text": "#f7f5f0", proposal: "#5e63b6", warning: "#b16a33", conflict: "#ad4949", success: "#3f7f72", "font-sans": "system-ui, sans-serif", "font-mono": "ui-monospace, monospace", "radius-small": "6px", "radius-medium": "10px", "radius-large": "16px", shadow: "0 12px 36px rgba(31,36,43,.12)",
  };
  const tokens = { ...defaults, ...theme?.tokens };
  return `:root{${Object.entries(tokens).map(([token, value]) => `--${token}:${safeCssValue(value)}`).join(";")}}`;
}

function safeCssValue(value: string): string {
  return /[;{}<>]/.test(value) || value.length > 240 ? "initial" : value;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value.replace(/[^a-zA-Z0-9_:/.-]/g, "-"));
}
