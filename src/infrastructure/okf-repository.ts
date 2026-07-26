import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { Concept, ConceptRevision, Diagnostic, TypedRelationship, VisualArtifact, VisualArtifactRole } from "../domain/model.js";

export interface LoadedProject {
  root: string;
  name: string;
  revision: string;
  concepts: Concept[];
  diagnostics: Diagnostic[];
}

interface ParsedDocument {
  metadata: Record<string, unknown>;
  body: string;
}

export class OkfRepository {
  async load(rootInput: string): Promise<LoadedProject> {
    const root = path.resolve(rootInput);
    const files = await discoverMarkdown(root);
    const concepts: Concept[] = [];
    const diagnostics: Diagnostic[] = [];
    const hash = createHash("sha256");

    for (const filePath of files) {
      const relativePath = path.relative(root, filePath).split(path.sep).join("/");
      const content = await readFile(filePath, "utf8");
      hash.update(relativePath).update("\0").update(content).update("\0");
      try {
        const parsed = parseDocument(content);
        const type = typeof parsed.metadata.type === "string" ? parsed.metadata.type : "Unknown";
        const id = relativePath.replace(/\.md$/, "");
        const parsedRelationships = relationships(parsed.metadata.relationships, id, diagnostics);
        const artifacts = await loadVisualArtifacts(root, parsed.metadata, id, diagnostics, hash);
        concepts.push({
          id,
          filePath: relativePath,
          type,
          title: stringValue(parsed.metadata.title) || path.basename(id),
          description: stringValue(parsed.metadata.description),
          body: parsed.body,
          raw: content,
          tags: stringArray(parsed.metadata.tags),
          owners: stringArray(parsed.metadata.owners),
          ...(typeof parsed.metadata.area === "string" ? { area: parsed.metadata.area } : {}),
          ...(typeof parsed.metadata["application-id"] === "string" ? { applicationId: parsed.metadata["application-id"] } : {}),
          sdlc: stringArray(parsed.metadata.sdlc),
          relationships: parsedRelationships,
          artifacts,
          metadata: parsed.metadata,
        });
        if (type === "Unknown") {
          diagnostics.push({
            code: "missing-concept-type",
            severity: "error",
            message: `${id} has no OKF type.`,
            conceptIds: [id],
          });
        }
      } catch (error) {
        diagnostics.push({
          code: "malformed-concept",
          severity: "error",
          message: `${relativePath} could not be parsed: ${error instanceof Error ? error.message : String(error)}`,
          conceptIds: [relativePath.replace(/\.md$/, "")],
        });
      }
    }

    return {
      root,
      name: path.basename(root),
      revision: hash.digest("hex"),
      concepts,
      diagnostics,
    };
  }

  async revise(rootInput: string, concept: Concept, changes: ConceptRevision): Promise<void> {
    const root = path.resolve(rootInput);
    const destination = safeConceptPath(root, concept.filePath);
    const content = await readFile(destination, "utf8");
    const parsed = parseDocument(content);
    const metadata = { ...parsed.metadata };

    if (changes.title !== undefined) metadata.title = changes.title;
    if (changes.description !== undefined) metadata.description = changes.description;
    if (changes.relationships !== undefined) metadata.relationships = changes.relationships;
    if (changes.design !== undefined) metadata.design = changes.design;
    const body = changes.body ?? parsed.body;
    const serialized = `---\n${YAML.stringify(metadata).trimEnd()}\n---\n${body.startsWith("\n") ? body.slice(1) : body}`;

    await mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.m21-${process.pid}.tmp`;
    await writeFile(temporary, serialized, "utf8");
    await rename(temporary, destination);
  }
}

async function discoverMarkdown(root: string): Promise<string[]> {
  const discovered: string[] = [];
  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(target);
      else if (entry.name.endsWith(".md") && !["index.md", "log.md"].includes(entry.name)) discovered.push(target);
    }
  }
  await walk(root);
  return discovered.sort();
}

function parseDocument(content: string): ParsedDocument {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("missing YAML frontmatter");
  const metadata = YAML.parse(match[1] ?? "");
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("frontmatter must be a mapping");
  return { metadata: metadata as Record<string, unknown>, body: match[2] ?? "" };
}

async function loadVisualArtifacts(
  root: string,
  metadata: Record<string, unknown>,
  conceptId: string,
  diagnostics: Diagnostic[],
  hash: ReturnType<typeof createHash>,
): Promise<VisualArtifact[]> {
  if (metadata.area !== "visual-design") return [];
  const namespace = objectValue(metadata["visual-design"]);
  if (!namespace) return [];
  const sources: Array<{ field: string; role: VisualArtifactRole }> = [
    { field: "css-source", role: "css" },
    { field: "html-source", role: "html" },
    { field: "script-source", role: "script" },
    { field: "asset-source", role: "asset" },
  ];
  const artifacts: VisualArtifact[] = [];
  for (const source of sources) {
    const candidate = namespace[source.field];
    if (typeof candidate !== "string" || !isBundleArtifactPath(candidate)) continue;
    const destination = safeArtifactPath(root, candidate);
    try {
      const content = await readFile(destination);
      const encoding = source.role === "asset" ? "base64" : "utf8";
      artifacts.push({
        role: source.role,
        path: candidate,
        mediaType: mediaType(candidate),
        content: content.toString(encoding),
        encoding,
      });
      hash.update(candidate).update("\0").update(content).update("\0");
    } catch {
      hash.update(candidate).update("\0missing\0");
      diagnostics.push({
        code: "missing-visual-artifact",
        severity: "error",
        message: `${conceptId} references missing or unreadable ${source.field} ${candidate}.`,
        conceptIds: [conceptId],
      });
    }
  }
  return artifacts;
}

function safeConceptPath(root: string, relativePath: string): string {
  const destination = path.resolve(root, relativePath);
  const relative = path.relative(root, destination);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("concept path escapes project bundle");
  return destination;
}

function safeArtifactPath(root: string, bundlePath: string): string {
  const destination = path.resolve(root, bundlePath.slice(1));
  const relative = path.relative(root, destination);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("artifact path escapes project bundle");
  return destination;
}

function isBundleArtifactPath(value: string): boolean {
  return value.startsWith("/") && !value.includes("\\") && !value.includes("//") && !value.split("/").some((segment) => segment === "..");
}

function mediaType(source: string): string {
  const extension = path.extname(source).toLowerCase();
  return ({
    ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
    ".gif": "image/gif", ".avif": "image/avif", ".woff": "font/woff", ".woff2": "font/woff2",
    ".ttf": "font/ttf", ".otf": "font/otf",
  } as Record<string, string>)[extension] ?? "application/octet-stream";
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function relationships(value: unknown, conceptId: string, diagnostics: Diagnostic[]): TypedRelationship[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    diagnostics.push(relationshipDiagnostic(conceptId, "relationships must be a list"));
    return [];
  }
  return value.flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      diagnostics.push(relationshipDiagnostic(conceptId, `relationship ${index + 1} must be a mapping`));
      return [];
    }
    const item = candidate as Record<string, unknown>;
    if (typeof item.type !== "string" || !item.type.trim()) {
      diagnostics.push(relationshipDiagnostic(conceptId, `relationship ${index + 1} requires a non-empty type`));
      return [];
    }
    if (typeof item.target !== "string" || !isPortableRelationshipTarget(item.target)) {
      diagnostics.push(relationshipDiagnostic(conceptId, `relationship ${index + 1} target must be an absolute bundle-relative Markdown path`));
      return [];
    }
    if (item.rationale !== undefined && typeof item.rationale !== "string") {
      diagnostics.push(relationshipDiagnostic(conceptId, `relationship ${index + 1} rationale must be a string`));
      return [];
    }
    if (item.evidence !== undefined && (!Array.isArray(item.evidence) || item.evidence.some((entry) => typeof entry !== "string" || !isPortableRelationshipTarget(entry)))) {
      diagnostics.push(relationshipDiagnostic(conceptId, `relationship ${index + 1} evidence must contain absolute bundle-relative Markdown paths`));
      return [];
    }
    return [{
      type: item.type.trim(),
      target: item.target,
      ...(typeof item.rationale === "string" ? { rationale: item.rationale } : {}),
      ...(Array.isArray(item.evidence) ? { evidence: stringArray(item.evidence) } : {}),
    }];
  });
}

function isPortableRelationshipTarget(target: string): boolean {
  if (!target.startsWith("/") || !target.endsWith(".md") || target.includes("\\")) return false;
  return !target.split("/").includes("..");
}

function relationshipDiagnostic(conceptId: string, detail: string): Diagnostic {
  return {
    code: "invalid-relationship",
    severity: "error",
    message: `${conceptId}: ${detail}.`,
    conceptIds: [conceptId],
  };
}
