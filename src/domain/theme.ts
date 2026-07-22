import type { Concept } from "./model.js";

export const SEMANTIC_THEME_TOKENS = [
  "canvas",
  "surface",
  "surface-muted",
  "text",
  "muted",
  "border",
  "accent",
  "proposal",
  "warning",
  "conflict",
] as const;

export type SemanticThemeToken = typeof SEMANTIC_THEME_TOKENS[number];

export interface ProjectTheme {
  sourceConceptId: string;
  tokens: Partial<Record<SemanticThemeToken, string>>;
}

export function projectTheme(concepts: Concept[]): ProjectTheme | undefined {
  const visualLanguage = concepts.find(
    (concept) => concept.type === "Visual Language" && concept.status === "active" && concept.metadata.theme,
  );
  const candidate = visualLanguage?.metadata.theme;
  if (!visualLanguage || !candidate || typeof candidate !== "object" || Array.isArray(candidate)) return undefined;

  const tokens: Partial<Record<SemanticThemeToken, string>> = {};
  for (const token of SEMANTIC_THEME_TOKENS) {
    const value = (candidate as Record<string, unknown>)[token];
    if (typeof value === "string") tokens[token] = value;
  }
  return { sourceConceptId: visualLanguage.id, tokens };
}
