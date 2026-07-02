import http from "http";
import chokidar from "chokidar";
import { readFile, writeFile } from "fs/promises";
import { join, dirname, resolve, relative, isAbsolute } from "path";
import matter from "gray-matter";
import { parseSpecDirectory } from "./parser.js";
import { generateHTML } from "./generator.js";
import { resolveResultsPath, parseResultsFile, mergeResults } from "./results.js";

/**
 * Create a modspec dev server with file watching and SSE.
 *
 * @param {Object} options
 * @param {string} options.specDir - Path to the spec directory
 * @param {number} options.port - Port to listen on (0 for random)
 * @param {string} [options.resultsPath] - Explicit path to a Cucumber JSON results file
 * @returns {Promise<{port: number, address: string, close: () => Promise<void>}>}
 */
export async function createModspecServer({ specDir, port = 3333, host = null, projectRoot: explicitRoot, resultsPath = null } = {}) {
  // Project root is explicit or parent of the spec directory
  const projectRoot = explicitRoot || dirname(resolve(specDir));

  // Bind loopback-only unless a host is explicitly requested — the editing
  // endpoints have no auth, so the server must not be reachable off-machine
  // by default.
  const bindHost = host || "127.0.0.1";

  // Resolve the results file once for watching (explicit path or auto-detected)
  const resultsFile = resolveResultsPath(projectRoot, resultsPath);

  // Overlay Cucumber JSON test status onto specs, in place. Re-resolves each
  // call so an explicit path created after startup is still picked up.
  async function applyResults(list) {
    const file = resolveResultsPath(projectRoot, resultsPath);
    if (!file) return list;
    const lookup = await parseResultsFile(file);
    if (lookup) mergeResults(list, lookup);
    return list;
  }

  let specs = await applyResults(await parseSpecDirectory(specDir, { projectRoot }));

  // Map spec file paths by name for write-back operations
  const specFilePaths = await buildSpecFileMap(specDir);

  const sseClients = new Set();

  let debounceTimer = null;

  function broadcastUpdate(newSpecs) {
    const message = `data: ${JSON.stringify({ specs: newSpecs })}\n\n`;
    for (const res of sseClients) {
      try {
        res.write(message);
      } catch {
        sseClients.delete(res);
      }
    }
  }

  // Feature directories currently on the watcher, by resolved path. Kept in
  // sync as specs gain or drop `features:` paths so directories referenced
  // after startup start being watched without a restart.
  const watchedFeatureDirs = new Set();

  function syncFeatureWatches(list) {
    for (const spec of list) {
      if (!spec.features) continue;
      const dir = resolve(join(projectRoot, spec.features));
      if (!watchedFeatureDirs.has(dir)) {
        watchedFeatureDirs.add(dir);
        watcher.add(dir);
      }
    }
  }

  async function handleFileChange() {
    try {
      const newSpecs = await applyResults(
        await parseSpecDirectory(specDir, { projectRoot }),
      );
      specs = newSpecs;

      // Rebuild file map in case files were added/removed
      const newMap = await buildSpecFileMap(specDir);
      Object.keys(specFilePaths).forEach((k) => delete specFilePaths[k]);
      Object.assign(specFilePaths, newMap);

      // Watch any feature directory a spec now references but that wasn't
      // being watched yet.
      syncFeatureWatches(specs);

      broadcastUpdate(specs);
    } catch (err) {
      console.error("Error re-parsing specs:", err.message);
    }
  }

  function debouncedFileChange() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleFileChange, 100);
  }

  // Collect feature directories to watch
  const featureDirs = specs
    .filter((s) => s.features)
    .map((s) => join(projectRoot, s.features));
  featureDirs.forEach((dir) => watchedFeatureDirs.add(resolve(dir)));

  // Set up file watcher for spec dir, feature dirs, and the results file
  const watchPaths = [specDir, ...featureDirs, ...(resultsFile ? [resultsFile] : [])];
  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    usePolling: true,
    interval: 100,
  });

  const watcherReady = new Promise((resolve) => watcher.on("ready", resolve));

  function onFileEvent(filePath) {
    const isResults = resultsFile && resolve(filePath) === resolve(resultsFile);
    if (filePath.endsWith(".md") || filePath.endsWith(".feature") || isResults) {
      debouncedFileChange();
    }
  }

  watcher.on("add", onFileEvent);
  watcher.on("change", onFileEvent);
  watcher.on("unlink", onFileEvent);

  /**
   * True when `child` resolves to a path inside `parent` (or equal to it).
   * Used to reject writes that escape the directory they belong in.
   */
  function isInside(parent, child) {
    const rel = relative(resolve(parent), resolve(child));
    return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
  }

  // Cap request bodies so a client can't stream unbounded data into memory.
  const MAX_BODY_BYTES = 1024 * 1024;

  /**
   * Read the request body as a string, rejecting once it exceeds
   * MAX_BODY_BYTES. The rejection carries statusCode 413 so the caller can
   * distinguish "too large" from a genuine server error.
   */
  function readBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      let exceeded = false;
      req.on("data", (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          // Stop buffering to bound memory, but keep draining the socket so
          // the 413 response can be delivered cleanly instead of resetting.
          exceeded = true;
          chunks.length = 0;
          return;
        }
        chunks.push(chunk);
      });
      req.on("end", () => {
        if (exceeded) {
          const err = new Error("Request body too large");
          err.statusCode = 413;
          reject(err);
          return;
        }
        resolve(Buffer.concat(chunks).toString());
      });
      req.on("error", reject);
    });
  }

  /**
   * Read and JSON-parse a request body. Throws with statusCode 413 when the
   * body is too large and 400 when it is present but not valid JSON, so
   * handlers can map both to the right client-error response.
   */
  async function readJsonBody(req) {
    const raw = await readBody(req);
    try {
      return JSON.parse(raw);
    } catch {
      const err = new Error("Request body is not valid JSON");
      err.statusCode = 400;
      throw err;
    }
  }

  /**
   * Send an error response, using the error's statusCode when it carries one
   * (413 too large, 400 malformed) and 500 otherwise.
   */
  function sendError(res, err) {
    const status = err.statusCode || 500;
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = generateHTML(specs, { liveReload: true });
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(html);
      return;
    }

    if (url.pathname === "/api/specs" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(JSON.stringify(specs));
      return;
    }

    if (url.pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");

      sseClients.add(res);
      req.on("close", () => sseClients.delete(res));
      return;
    }

    // PUT /api/specs/:name/body
    const specBodyMatch = url.pathname.match(
      /^\/api\/specs\/([^/]+)\/body$/,
    );
    if (specBodyMatch && req.method === "PUT") {
      const specName = decodeURIComponent(specBodyMatch[1]);
      const filePath = specFilePaths[specName];

      if (!filePath) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Spec not found" }));
        return;
      }

      try {
        const { body: newBody } = await readJsonBody(req);

        const fileContent = await readFile(filePath, "utf-8");
        const { data } = matter(fileContent);

        // Reconstruct file with original frontmatter and new body
        const updatedContent = matter.stringify(newBody, data);
        await writeFile(filePath, updatedContent, "utf-8");

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        sendError(res, err);
      }
      return;
    }

    // PUT /api/features/:specName/:filename
    const featureMatch = url.pathname.match(
      /^\/api\/features\/([^/]+)\/([^/]+)$/,
    );
    if (featureMatch && req.method === "PUT") {
      const specName = decodeURIComponent(featureMatch[1]);
      const filename = decodeURIComponent(featureMatch[2]);

      const spec = specs.find((s) => s.name === specName);
      if (!spec || !spec.features) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Spec or features path not found" }));
        return;
      }

      const featuresDir = join(projectRoot, spec.features);
      const featurePath = join(featuresDir, filename);

      // Reject any filename that escapes the spec's features directory
      // (e.g. an encoded "../" that survives the route regex as %2F).
      if (!isInside(featuresDir, featurePath)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid feature filename" }));
        return;
      }

      try {
        const { content } = await readJsonBody(req);

        await writeFile(featurePath, content, "utf-8");

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        sendError(res, err);
      }
      return;
    }

    // POST /api/specs - create a new spec file
    if (url.pathname === "/api/specs" && req.method === "POST") {
      try {
        const { name, description, group, tags, depends_on, body } =
          await readJsonBody(req);

        if (!name) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Spec must have a name field" }));
          return;
        }

        // Reject names that would escape the spec directory or contain
        // path separators — the name becomes a filename on disk.
        const candidatePath = join(specDir, `${name}.md`);
        if (/[/\\]/.test(name) || !isInside(specDir, candidatePath)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid spec name" }));
          return;
        }

        if (specFilePaths[name]) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: "A spec with this name already exists" }),
          );
          return;
        }

        const frontmatterData = { name };
        if (description) frontmatterData.description = description;
        if (group) frontmatterData.group = group;
        if (tags && tags.length > 0) frontmatterData.tags = tags;
        if (depends_on && depends_on.length > 0)
          frontmatterData.depends_on = depends_on;

        const fileContent = matter.stringify(body || "", frontmatterData);
        await writeFile(candidatePath, fileContent, "utf-8");

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, name }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });

  await watcherReady;

  return new Promise((resolve, reject) => {
    server.listen(port, bindHost, () => {
      const addr = server.address();
      resolve({
        port: addr.port,
        host: bindHost,
        address: `http://localhost:${addr.port}`,
        close: async () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          await watcher.close();

          // Close all SSE connections
          for (const client of sseClients) {
            client.end();
          }
          sseClients.clear();

          return new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          });
        },
      });
    });

    server.on("error", reject);
  });
}

/**
 * Build a map of spec name -> file path by scanning the spec directory.
 */
async function buildSpecFileMap(specDir) {
  const { readdir } = await import("fs/promises");
  const { extname } = await import("path");
  const entries = await readdir(specDir);
  const map = {};

  for (const entry of entries) {
    if (extname(entry) !== ".md") continue;
    const filePath = join(specDir, entry);
    try {
      const content = await readFile(filePath, "utf-8");
      const { data } = matter(content);
      if (data.name) {
        map[data.name] = filePath;
      }
    } catch {
      // skip unreadable files
    }
  }

  return map;
}
