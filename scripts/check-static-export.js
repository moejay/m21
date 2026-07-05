#!/usr/bin/env node

import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(process.execPath, [join(root, "scripts", "export-static.js")]);

const diff = spawnSync("git", ["diff", "--exit-code", "--", "docs/graph.html"], {
  cwd: root,
  stdio: "inherit",
});

if (diff.status !== 0) {
  console.error("\nStatic export is out of date. Run `npm run docs:graph` and commit docs/graph.html.");
  process.exit(diff.status ?? 1);
}
