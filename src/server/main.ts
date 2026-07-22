import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  DevelopmentAiProvider,
  OpenAiCompatibleProvider,
  type AiProvider,
} from "../application/ai.js";
import { ProjectService } from "../application/project-service.js";

interface CliOptions {
  bundle: string;
  port: number;
  development: boolean;
}

function parseOptions(argv: string[]): CliOptions {
  let bundle = "okf";
  let port = 3333;
  let development = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dev") {
      development = true;
    } else if (argument === "--port") {
      const value = argv[index + 1];
      if (!value || !/^\d+$/.test(value)) throw new Error("--port requires a number");
      port = Number(value);
      index += 1;
    } else if (argument && !argument.startsWith("-")) {
      bundle = argument;
    }
  }
  return { bundle: path.resolve(bundle), port, development };
}

export async function createServer(
  bundle: string,
  aiProvider: AiProvider = configuredAiProvider(),
  options: { development?: boolean } = {},
) {
  const project = await ProjectService.open(bundle);
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true, aiProvider: providerName(aiProvider) });
  });

  app.get("/api/project", (_request, response) => {
    response.json(project.snapshot());
  });

  app.post("/api/proposals", (request, response, next) => {
    try {
      const { conceptId, changes, changeKind = "contract", summary = "Revise concept" } = request.body as Record<string, unknown>;
      if (typeof conceptId !== "string" || !changes || typeof changes !== "object") {
        response.status(400).json({ error: "conceptId and changes are required" });
        return;
      }
      const proposal = project.proposeRevision({
        conceptId,
        changes: changes as { title?: string; description?: string; body?: string },
        changeKind: changeKind as "editorial" | "internal" | "contract" | "structural",
        summary: typeof summary === "string" ? summary : "Revise concept",
      });
      response.status(201).json(proposal);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agent", async (request, response, next) => {
    try {
      const { conceptId, instruction, stage } = request.body as Record<string, unknown>;
      if (typeof conceptId !== "string" || typeof instruction !== "string" || !instruction.trim()) {
        response.status(400).json({ error: "conceptId and instruction are required" });
        return;
      }
      const proposal = await project.askAgent({
        conceptId,
        instruction,
        ...(typeof stage === "string" && stage ? { stage } : {}),
        provider: aiProvider,
      });
      response.status(201).json(proposal);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/proposals/:proposalId", (request, response) => {
    const proposal = project.proposal(request.params.proposalId);
    if (!proposal) {
      response.status(404).json({ error: "proposal not found" });
      return;
    }
    response.json(proposal);
  });

  app.post("/api/proposals/:proposalId/accept", async (request, response, next) => {
    try {
      response.json(await project.accept(request.params.proposalId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/views/project-summary", (request, response) => {
    const stage = typeof request.query.stage === "string" ? request.query.stage : undefined;
    response.type("text/markdown").send(project.generateSummary(stage));
  });

  if (options.development) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.resolve("web"),
      appType: "spa",
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const webRoot = path.resolve(currentDirectory, "../../dist/web");
    app.use(express.static(webRoot));
    app.use((request, response, next) => {
      if (request.path.startsWith("/api/")) {
        next();
        return;
      }
      response.sendFile(path.join(webRoot, "index.html"), (error) => {
        if (error) next(error);
      });
    });
  }

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : String(error);
    const status = /Unknown|not found/i.test(message) ? 404 : /stale|already/i.test(message) ? 409 : 500;
    response.status(status).json({ error: message });
  });

  return app;
}

function configuredAiProvider(): AiProvider {
  const baseUrl = process.env.M21_AI_BASE_URL;
  const apiKey = process.env.M21_AI_API_KEY;
  const model = process.env.M21_AI_MODEL;
  if (baseUrl && apiKey && model) return new OpenAiCompatibleProvider({ baseUrl, apiKey, model });
  return new DevelopmentAiProvider();
}

function providerName(provider: AiProvider): string {
  return "name" in provider && typeof provider.name === "string" ? provider.name : "configured";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseOptions(process.argv.slice(2));
  const app = await createServer(options.bundle, configuredAiProvider(), { development: options.development });
  app.listen(options.port, "127.0.0.1", () => {
    console.log(`M21 workspace: http://127.0.0.1:${options.port}`);
    console.log(`OKF project: ${options.bundle}`);
    console.log(`Mode: ${options.development ? "development (Vite middleware)" : "production"}`);
    console.log(`AI provider: ${process.env.M21_AI_BASE_URL ? "openai-compatible" : "development"}`);
  });
}
