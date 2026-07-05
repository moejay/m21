#!/usr/bin/env node

import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const resultsPath = join(root, "results", "vitest-results.json");
const args = [join(root, "bin", "m21.js"), join(root, "spec"), "--output", join(root, "docs", "graph-export.html")];

if (existsSync(resultsPath)) {
  args.push("--results", resultsPath);
  console.log(`Including test overlay from ${resultsPath}`);
} else {
  console.log("No results/vitest-results.json found; exporting graph without test overlay");
}

const result = spawnSync(process.execPath, args, {
  cwd: root,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
