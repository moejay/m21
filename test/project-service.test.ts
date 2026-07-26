import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectService } from "../src/application/project-service.js";

const roots: string[] = [];

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "m21-unit-"));
  roots.push(root);
  await mkdir(path.join(root, "capabilities"), { recursive: true });
  await writeFile(path.join(root, "vision.md"), document({
    type: "Vision",
    title: "Product Vision",
    description: "Before",
    extension: { preserved: true },
  }), "utf8");
  await writeFile(path.join(root, "capabilities", "workspace.md"), document({
    type: "Product Capability",
    title: "Workspace",
    relationships: [{ type: "realizes", target: "/vision.md" }],
  }), "utf8");
  return root;
}

function document(metadata: Record<string, unknown>): string {
  return `---\n${YAML.stringify(metadata).trimEnd()}\n---\n# Knowledge\n`;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("ProjectService", () => {
  it("opens typed OKF relationships", async () => {
    const service = await ProjectService.open(await fixture());
    expect(service.snapshot().edges).toContainEqual(expect.objectContaining({
      source: "capabilities/workspace",
      targetId: "vision",
      type: "realizes",
    }));
  });

  it("keeps proposals separate until acceptance", async () => {
    const root = await fixture();
    const service = await ProjectService.open(root);
    const proposal = service.proposeRevision({
      conceptId: "vision",
      changes: { description: "After" },
      changeKind: "contract",
      summary: "Clarify vision",
    });

    expect(service.snapshot().concepts.find((concept) => concept.id === "vision")?.description).toBe("Before");
    await service.accept(proposal.id);
    expect(service.snapshot().concepts.find((concept) => concept.id === "vision")?.description).toBe("After");
    expect(service.snapshot().concepts.find((concept) => concept.id === "vision")?.metadata.extension).toEqual({ preserved: true });
    expect(await readFile(path.join(root, "vision.md"), "utf8")).toContain("preserved: true");
  });

  it("parses singular Definition Area ownership and validates closed Business metadata", async () => {
    const root = await fixture();
    await writeFile(path.join(root, "problem.md"), document({
      type: "Business Problem",
      title: "Fragmented knowledge",
      description: "Knowledge is disconnected.",
      area: "business",
      business: { section: "problems", priority: "high" },
    }).replace("# Knowledge", "# Problem\n\nTeams reconstruct context manually."), "utf8");
    const snapshot = (await ProjectService.open(root)).snapshot();
    expect(snapshot.concepts.find((concept) => concept.id === "problem")?.area).toBe("business");
    expect(snapshot.diagnostics).toContainEqual(expect.objectContaining({ code: "unknown-business-field", conceptIds: ["problem"] }));
  });

  it("diagnoses malformed portable relationships instead of silently resolving them", async () => {
    const root = await fixture();
    await writeFile(path.join(root, "invalid-link.md"), document({
      type: "Decision",
      title: "Invalid relationship",
      relationships: [{ type: "supports", target: "vision.md" }],
    }), "utf8");
    const snapshot = (await ProjectService.open(root)).snapshot();
    expect(snapshot.diagnostics).toContainEqual(expect.objectContaining({ code: "invalid-relationship", conceptIds: ["invalid-link"] }));
    expect(snapshot.edges.some((edge) => edge.source === "invalid-link")).toBe(false);
  });

  it("does not propagate internal realization changes upstream", async () => {
    const service = await ProjectService.open(await fixture());
    const proposal = service.proposeRevision({
      conceptId: "capabilities/workspace",
      changes: { body: "Different internal realization" },
      changeKind: "internal",
      summary: "Refactor implementation",
    });
    expect(proposal.impact).toEqual([]);
  });
});
