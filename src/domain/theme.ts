import type { Concept } from "./model.js";

export const SEMANTIC_THEME_TOKENS = [
  "canvas",
  "surface",
  "surface-muted",
  "text",
  "muted",
  "border",
  "accent",
  "accent-contrast",
  "chrome",
  "chrome-text",
  "proposal",
  "warning",
  "conflict",
  "success",
  "font-sans",
  "font-mono",
  "radius-small",
  "radius-medium",
  "radius-large",
  "shadow",
] as const;

export type SemanticThemeToken = typeof SEMANTIC_THEME_TOKENS[number];

export interface ProjectTheme {
  sourceConceptId: string;
  tokens: Partial<Record<SemanticThemeToken, string>>;
}

export function projectTheme(concepts: Concept[]): ProjectTheme | undefined {
  const visualLanguage = concepts.find(
    (concept) => concept.type === "Visual Language" && concept.status === "active" && themeCandidate(concept),
  );
  const candidate = visualLanguage ? themeCandidate(visualLanguage) : undefined;
  if (!visualLanguage || !candidate) return undefined;

  const tokens: Partial<Record<SemanticThemeToken, string>> = {};
  for (const token of SEMANTIC_THEME_TOKENS) {
    const value = candidate[token];
    if (typeof value === "string") tokens[token] = value;
  }
  return { sourceConceptId: visualLanguage.id, tokens };
}

function themeCandidate(concept: Concept): Record<string, unknown> | undefined {
  const design = concept.metadata.design;
  if (!design || typeof design !== "object" || Array.isArray(design)) return undefined;
  const theme = (design as Record<string, unknown>).theme;
  return theme && typeof theme === "object" && !Array.isArray(theme)
    ? theme as Record<string, unknown>
    : undefined;
}
