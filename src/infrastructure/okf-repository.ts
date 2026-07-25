import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { Concept, ConceptRevision, Diagnostic, TypedRelationship } from "../domain/model.js";

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
        concepts.push({
          id,
          filePath: relativePath,
          type,
          title: stringValue(parsed.metadata.title) || path.basename(id),
          description: stringValue(parsed.metadata.description),
          body: parsed.body,
          ...(typeof parsed.metadata.status === "string" ? { status: parsed.metadata.status } : {}),
          tags: stringArray(parsed.metadata.tags),
          owners: stringArray(parsed.metadata.owners),
          sdlc: stringArray(parsed.metadata.sdlc),
          relationships: relationships(parsed.metadata.relationships),
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
    if (changes.status !== undefined) metadata.status = changes.status;
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

function safeConceptPath(root: string, relativePath: string): string {
  const destination = path.resolve(root, relativePath);
  const relative = path.relative(root, destination);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("concept path escapes project bundle");
  return destination;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function relationships(value: unknown): TypedRelationship[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return [];
    const item = candidate as Record<string, unknown>;
    if (typeof item.type !== "string" || typeof item.target !== "string") return [];
    return [{
      type: item.type,
      target: item.target,
      ...(typeof item.rationale === "string" ? { rationale: item.rationale } : {}),
      ...(Array.isArray(item.evidence) ? { evidence: stringArray(item.evidence) } : {}),
    }];
  });
}
