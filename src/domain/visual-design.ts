import type { Concept, Diagnostic, VisualArtifact, VisualArtifactRole } from "./model.js";

export const VISUAL_DESIGN_SECTION_TYPES = {
  direction: ["Character and Feel", "Visual Principle", "Brand Direction", "Imagery Direction"],
  foundations: ["Color System", "Typography System", "Spacing System", "Layout System", "Shape System", "Border System", "Elevation System", "Motion System", "Icon System"],
  themes: ["Visual Theme"],
  components: ["Visual Component"],
  assets: ["Font Asset", "Icon Asset", "Image Asset", "Illustration Asset", "Logo Asset"],
  accessibility: ["Visual Accessibility Rule"],
  decisions: ["Visual Design Decision"],
} as const;

export type VisualDesignSection = keyof typeof VISUAL_DESIGN_SECTION_TYPES;
export const VISUAL_DESIGN_SECTIONS = Object.keys(VISUAL_DESIGN_SECTION_TYPES) as VisualDesignSection[];
const FOUNDATION_TYPES = new Set<string>(VISUAL_DESIGN_SECTION_TYPES.foundations);
const ASSET_TYPES = new Set<string>(VISUAL_DESIGN_SECTION_TYPES.assets);
const NAMESPACE_FIELDS = new Set(["section", "css-source", "html-source", "script-source", "asset-source"]);

export interface VisualSpecimen {
  html: string;
  sandbox: "allow-scripts" | "";
  sourceConceptIds: string[];
}

export function visualDesignArtifacts(concepts: Concept[]): Concept[] {
  return concepts.filter((concept) => !["Definition Area", "Definition Layer"].includes(concept.type) && concept.area === "visual-design");
}

export function visualDesignSection(concept: Concept): VisualDesignSection | undefined {
  const section = visualNamespace(concept)?.section;
  return typeof section === "string" && VISUAL_DESIGN_SECTIONS.includes(section as VisualDesignSection) ? section as VisualDesignSection : undefined;
}

export function activeVisualTheme(concepts: Concept[]): Concept | undefined {
  return visualDesignArtifacts(concepts).find((concept) => concept.type === "Visual Theme");
}

export function linkedArtifact(concept: Concept, role: VisualArtifactRole): VisualArtifact | undefined {
  const field = `${role}-source`;
  const source = visualNamespace(concept)?.[field];
  return typeof source === "string" ? concept.artifacts.find((artifact) => artifact.role === role && artifact.path === source) : undefined;
}

export function inlineVisualBlock(concept: Concept, language: "m21-css" | "m21-html"): string | undefined {
  return inlineVisualBlocks(concept.body, language)[0];
}

export function composeVisualTheme(theme: Concept, concepts: Concept[]): string {
  const source = linkedArtifact(theme, "css");
  const artifactMap = new Map(concepts.flatMap((concept) => concept.artifacts.filter((artifact) => artifact.role === "css").map((artifact) => [artifact.path, artifact] as const)));
  const linked = source ? resolveCssImports(source, artifactMap, new Set()) : "";
  const inline = safeCss(inlineVisualBlock(theme, "m21-css") ?? "");
  return [linked, inline].filter(Boolean).join("\n/* m21 inline override */\n");
}

export function renderVisualComponent(component: Concept, concepts: Concept[]): VisualSpecimen {
  const theme = activeVisualTheme(concepts);
  const themeCss = theme ? composeVisualTheme(theme, concepts) : "";
  const componentCss = [safeCss(linkedArtifact(component, "css")?.content ?? ""), safeCss(inlineVisualBlock(component, "m21-css") ?? "")].filter(Boolean).join("\n/* m21 component override */\n");
  const html = inlineVisualBlock(component, "m21-html") ?? linkedArtifact(component, "html")?.content ?? "";
  const script = linkedArtifact(component, "script")?.content ?? "";
  const safeHtml = isUnsafeHtml(html) ? "<p>Unsafe component markup cannot be previewed.</p>" : html;
  return {
    html: specimenDocument(`${themeCss}\n${componentCss}`, safeHtml, script),
    sandbox: script ? "allow-scripts" : "",
    sourceConceptIds: [theme?.id, component.id].filter((id): id is string => Boolean(id)),
  };
}

export function renderFoundationSpecimen(foundation: Concept, concepts: Concept[]): VisualSpecimen {
  const theme = activeVisualTheme(concepts);
  const css = [theme ? composeVisualTheme(theme, concepts) : "", safeCss(linkedArtifact(foundation, "css")?.content ?? ""), safeCss(inlineVisualBlock(foundation, "m21-css") ?? "")].filter(Boolean).join("\n");
  return { html: specimenDocument(css, foundationMarkup(foundation.type), ""), sandbox: "", sourceConceptIds: [foundation.id] };
}

export function renderThemeSpecimen(theme: Concept, concepts: Concept[]): VisualSpecimen {
  return { html: specimenDocument(composeVisualTheme(theme, concepts), foundationMarkup("Visual Theme"), ""), sandbox: "", sourceConceptIds: [theme.id] };
}

export function validateVisualDesignConcept(concept: Concept): Diagnostic[] {
  const namespace = visualNamespace(concept);
  if (concept.area !== "visual-design") return namespace ? [diagnostic(concept, "visual-design-area-mismatch", "visual-design metadata requires singular area: visual-design ownership")] : [];
  const diagnostics: Diagnostic[] = [];
  for (const [field, value] of [["title", concept.title], ["description", concept.description], ["body", concept.body]] as const) {
    if (!value.trim()) diagnostics.push(diagnostic(concept, `missing-visual-design-${field}`, `Visual Design ${field} must not be empty`));
  }
  if (!namespace) {
    diagnostics.push(diagnostic(concept, "missing-visual-design-metadata", "Visual Design concepts require a visual-design mapping"));
    return diagnostics;
  }
  const unknown = Object.keys(namespace).filter((field) => !NAMESPACE_FIELDS.has(field));
  if (unknown.length) diagnostics.push(diagnostic(concept, "unknown-visual-design-field", `Unsupported Visual Design metadata: ${unknown.sort().join(", ")}`));
  const section = visualDesignSection(concept);
  if (!section) {
    diagnostics.push(diagnostic(concept, "invalid-visual-design-section", `Visual Design section must be one of: ${VISUAL_DESIGN_SECTIONS.join(", ")}`));
    return diagnostics;
  }
  const allowed = VISUAL_DESIGN_SECTION_TYPES[section] as readonly string[];
  if (!allowed.includes(concept.type)) diagnostics.push(diagnostic(concept, "visual-design-type-section-mismatch", `${concept.type} is not allowed in Visual Design section ${section}; expected ${allowed.join(", ")}`));

  validateSourceField(concept, namespace, "css-source", ".css", FOUNDATION_TYPES.has(concept.type) || concept.type === "Visual Theme", diagnostics);
  validateSourceField(concept, namespace, "html-source", ".html", concept.type === "Visual Component", diagnostics);
  validateSourceField(concept, namespace, "script-source", ".js", false, diagnostics, concept.type === "Visual Component");
  if (ASSET_TYPES.has(concept.type)) validateAssetSource(concept, namespace, diagnostics);
  else if (namespace["asset-source"] !== undefined) diagnostics.push(diagnostic(concept, "invalid-visual-design-source", "asset-source is allowed only for Visual Design asset types"));

  for (const language of ["m21-css", "m21-html"] as const) {
    if (inlineVisualBlocks(concept.body, language).length > 1) diagnostics.push(diagnostic(concept, "duplicate-visual-override", `Only one inline ${language} block is allowed`));
  }
  if (concept.type !== "Visual Component" && inlineVisualBlock(concept, "m21-html") !== undefined) diagnostics.push(diagnostic(concept, "invalid-visual-html-override", "Inline m21-html is allowed only for Visual Component"));
  return diagnostics;
}

export function validateVisualArtifacts(concepts: Concept[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const cssArtifacts = new Map(concepts.flatMap((concept) => concept.artifacts.filter((artifact) => artifact.role === "css").map((artifact) => [artifact.path, { artifact, concept }] as const)));
  for (const concept of visualDesignArtifacts(concepts)) {
    const html = linkedArtifact(concept, "html")?.content;
    const inlineHtml = inlineVisualBlock(concept, "m21-html");
    if ((html && isUnsafeHtml(html)) || (inlineHtml && isUnsafeHtml(inlineHtml))) diagnostics.push(diagnostic(concept, "unsafe-visual-html", "Visual Component HTML contains embedded script, inline handlers, or unsafe external URLs"));
    const inlineCss = inlineVisualBlock(concept, "m21-css");
    if (inlineCss && hasUnsafeCssUrl(inlineCss)) diagnostics.push(diagnostic(concept, "unsafe-visual-css", "Inline Visual Design CSS contains a remote or executable URL"));
    for (const artifact of concept.artifacts.filter((candidate) => candidate.role === "css")) {
      if (hasUnsafeCssUrl(artifact.content)) diagnostics.push(diagnostic(concept, "unsafe-visual-css", `${artifact.path} contains a remote or executable CSS URL`));
      for (const imported of cssImports(artifact)) {
        if (!cssArtifacts.has(imported)) diagnostics.push(diagnostic(concept, "missing-visual-css-import", `${artifact.path} imports unavailable CSS ${imported}`));
      }
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (source: string, trail: string[]): void => {
    if (visiting.has(source)) {
      const owner = cssArtifacts.get(source)?.concept;
      if (owner) diagnostics.push(diagnostic(owner, "cyclic-visual-css-import", `CSS import cycle: ${[...trail, source].join(" -> ")}`));
      return;
    }
    if (visited.has(source)) return;
    visiting.add(source);
    const entry = cssArtifacts.get(source);
    if (entry) for (const imported of cssImports(entry.artifact)) visit(imported, [...trail, source]);
    visiting.delete(source);
    visited.add(source);
  };
  for (const source of cssArtifacts.keys()) visit(source, []);
  return diagnostics;
}

function resolveCssImports(artifact: VisualArtifact, artifacts: Map<string, VisualArtifact>, visiting: Set<string>): string {
  if (visiting.has(artifact.path)) return `/* cyclic import blocked: ${artifact.path} */`;
  visiting.add(artifact.path);
  const resolved = safeCss(artifact.content).replace(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/gi, (_match, target: string) => {
    const importedPath = resolveArtifactReference(artifact.path, target);
    const imported = artifacts.get(importedPath);
    return imported ? resolveCssImports(imported, artifacts, visiting) : `/* missing import: ${importedPath} */`;
  });
  visiting.delete(artifact.path);
  return resolved;
}

function cssImports(artifact: VisualArtifact): string[] {
  return [...artifact.content.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/gi)].map((match) => resolveArtifactReference(artifact.path, match[1] ?? ""));
}

function resolveArtifactReference(source: string, target: string): string {
  const candidate = target.startsWith("/") ? target : `${source.slice(0, source.lastIndexOf("/") + 1)}${target}`;
  const segments: string[] = [];
  for (const segment of candidate.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return `/${segments.join("/")}`;
}

function visualNamespace(concept: Concept): Record<string, unknown> | undefined {
  const value = concept.metadata["visual-design"];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function inlineVisualBlocks(body: string, language: "m21-css" | "m21-html"): string[] {
  const blocks: string[] = [];
  const pattern = new RegExp("^(?:```|~~~)" + language + "[ \\t]*\\r?\\n([\\s\\S]*?)\\r?\\n(?:```|~~~)[ \\t]*$", "gim");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) blocks.push(match[1] ?? "");
  return blocks;
}

function validateSourceField(concept: Concept, namespace: Record<string, unknown>, field: string, extension: string, required: boolean, diagnostics: Diagnostic[], allowed = true): void {
  const value = namespace[field];
  if (required && typeof value !== "string") diagnostics.push(diagnostic(concept, "missing-visual-design-source", `${field} is required for ${concept.type}`));
  if (value === undefined) return;
  if (!allowed || typeof value !== "string" || !isBundlePath(value) || !value.toLowerCase().endsWith(extension)) diagnostics.push(diagnostic(concept, "invalid-visual-design-source", `${field} must be an absolute bundle-relative ${extension} path allowed for ${concept.type}`));
}

function validateAssetSource(concept: Concept, namespace: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const value = namespace["asset-source"];
  const allowed: Record<string, string[]> = {
    "Font Asset": [".woff", ".woff2", ".ttf", ".otf"], "Icon Asset": [".svg"],
    "Image Asset": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"],
    "Illustration Asset": [".svg", ".png", ".webp"], "Logo Asset": [".svg", ".png", ".webp"],
  };
  if (typeof value !== "string" || !isBundlePath(value) || !(allowed[concept.type] ?? []).some((extension) => value.toLowerCase().endsWith(extension))) diagnostics.push(diagnostic(concept, "invalid-visual-design-source", `asset-source requires a bundle-local media path appropriate for ${concept.type}`));
}

function isBundlePath(value: string): boolean {
  return value.startsWith("/") && !value.includes("\\") && !value.includes("//") && !value.split("/").some((segment) => segment === "..");
}

function isUnsafeHtml(html: string): boolean {
  return /<script\b/i.test(html) || /\son[a-z]+\s*=/i.test(html) || /(?:src|href)\s*=\s*["']\s*(?:https?:|\/\/|javascript:)/i.test(html) || /<iframe\b/i.test(html);
}

function hasUnsafeCssUrl(css: string): boolean {
  return /(?:@import|url\()\s*(?:["']?\s*)?(?:https?:|\/\/|javascript:)/i.test(css) || /<\/style|expression\s*\(|-moz-binding/i.test(css);
}

function safeCss(css: string): string {
  return hasUnsafeCssUrl(css) ? "/* unsafe CSS blocked */" : css;
}

function specimenDocument(css: string, markup: string, script: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>${css}\n*{box-sizing:border-box}body{margin:0;padding:24px;background:var(--canvas,#f7f5f0);color:var(--text,#20252c);font-family:var(--font-sans,system-ui,sans-serif)}</style></head><body>${markup}${script ? `<script>${script.replace(/<\/script/gi, "<\\/script")}</script>` : ""}</body></html>`;
}

function foundationMarkup(type: string): string {
  if (type === "Color System") return '<div class="m21-color-grid"><div class="m21-color-swatch accent">Accent</div><div class="m21-color-swatch surface">Surface</div><div class="m21-color-swatch success">Success</div><div class="m21-color-swatch warning">Warning</div></div>';
  if (type === "Typography System") return '<div class="m21-type-scale"><h1>Product knowledge in context</h1><h2>Shared visual language</h2><p>Readable body copy preserves meaning through long working sessions.</p><code>relationship → accepted-concept</code></div>';
  if (type === "Spacing System") return '<div class="m21-spacing-scale"><i></i><i></i><i></i><i></i><i></i></div>';
  if (type === "Motion System") return '<button class="m21-motion-sample">Focus and reveal</button>';
  if (type === "Visual Theme") return '<main class="m21-theme-sample"><span>Visual Theme</span><h1>A calm working studio</h1><p>Foundations compose in explicit CSS import order.</p><button>Primary action</button></main>';
  return '<div class="m21-foundation-sample"><div></div><div></div><div></div><p>Accepted visual foundation specimen</p></div>';
}

function diagnostic(concept: Concept, code: string, message: string): Diagnostic {
  return { code, severity: "error", message: `${concept.id}: ${message}.`, conceptIds: [concept.id] };
}
