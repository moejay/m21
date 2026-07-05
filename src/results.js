import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";

/**
 * Conventional Cucumber JSON report filenames, checked in order. Root-level
 * matches are preferred over the same filename inside a results directory.
 */
const RESULTS_FILENAMES = [
  "cucumber.json",
  "cucumber-report.json",
  "cucumber_report.json",
  "vitest-results.json",
  "jest-results.json",
  "test-results.json",
  "results.json",
];

/** Conventional directories a runner may drop its report into. */
const RESULTS_DIRS = ["results", "reports", "test-results", "cucumber"];

/**
 * Status severity, highest first. A scenario/feature/spec rolls up to the
 * highest-severity status present. `passed` is the lowest severity so that a
 * group passes only when every member passes.
 */
const SEVERITY = ["failed", "ambiguous", "undefined", "pending", "skipped", "passed"];

/**
 * Return the highest-severity status from a list, or null if the list is empty.
 *
 * @param {string[]} statuses
 * @returns {string|null}
 */
export function rollupStatus(statuses) {
  let best = null;
  let bestRank = Infinity;
  for (const status of statuses) {
    const rank = SEVERITY.indexOf(status);
    if (rank === -1) continue;
    if (rank < bestRank) {
      bestRank = rank;
      best = status;
    }
  }
  return best;
}

/**
 * Derive a single scenario status from its Cucumber step results.
 * A scenario with no steps is `undefined` (no defined behavior).
 *
 * @param {Array} steps - Cucumber step objects with `result.status`
 * @returns {string}
 */
export function deriveScenarioStatus(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return "undefined";
  }
  const statuses = steps.map((s) => s?.result?.status).filter(Boolean);
  return rollupStatus(statuses) || "undefined";
}

/**
 * Normalize a test report into a lookup keyed by feature name. The input format
 * is auto-detected: a top-level array is treated as Cucumber JSON, a top-level
 * object with `testResults` as a Jest/vitest JSON report. Accepts a parsed
 * value or a JSON string. Tolerates missing fields.
 *
 * @param {Array|Object|string} report
 * @returns {Object} { [featureName]: { name, scenarios: { [scenarioName]: status } } }
 */
export function normalizeResults(report) {
  let data = report;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (Array.isArray(data)) {
    return normalizeCucumberResults(data);
  }
  if (data && Array.isArray(data.testResults)) {
    return normalizeVitestResults(data);
  }
  return {};
}

/**
 * Normalize a Cucumber JSON report (array of feature objects) into a lookup.
 */
function normalizeCucumberResults(data) {
  const lookup = {};
  for (const feature of data) {
    if (!feature || !feature.name) continue;
    const scenarios = {};
    const scenarioDetails = {};
    for (const element of feature.elements || []) {
      if (!element || !element.name) continue;
      if (element.type && element.type !== "scenario") continue;
      scenarios[element.name] = deriveScenarioStatus(element.steps);
      scenarioDetails[element.name] = {
        steps: (element.steps || []).map((step) => ({
          text: `${step.keyword || ""}${step.name || ""}`.trim(),
          status: step.result?.status || "undefined",
        })),
      };
    }
    const entry = { name: feature.name, scenarios, scenarioDetails };
    // Cucumber JSON identifies each feature by its source file; keep it so
    // the merge can join on path and disambiguate same-named features.
    if (feature.uri) entry.uri = feature.uri;
    lookup[feature.name] = entry;
  }
  return lookup;
}

/** Jest/vitest statuses mapped onto the Cucumber status vocabulary. */
const VITEST_STATUS = {
  passed: "passed",
  failed: "failed",
  skipped: "skipped",
  pending: "pending",
  todo: "pending",
};

/**
 * Derive a (feature, scenario) key for a Jest/vitest assertion. For
 * `vitest-cucumber` the ancestor titles are `"Feature: <name>"` /
 * `"Scenario: <name>"`; otherwise the top-level describe is the feature and the
 * assertion title is the scenario.
 */
function mapVitestTitles(assertion) {
  const ancestors = assertion.ancestorTitles || [];
  const top = ancestors[0] || "";
  if (top.startsWith("Feature:") && ancestors[1]) {
    const feature = top.slice("Feature:".length).trim();
    const second = ancestors[1];
    const scenario = second.startsWith("Scenario:")
      ? second.slice("Scenario:".length).trim()
      : second;
    return { feature, scenario };
  }
  return { feature: top || null, scenario: assertion.title || null };
}

/**
 * Normalize a Jest/vitest JSON report into a lookup. Assertions are grouped by
 * (feature, scenario) and rolled up — so the multiple step assertions a
 * vitest-cucumber scenario produces collapse to a single scenario status.
 */
function normalizeVitestResults(data) {
  const acc = {}; // feature -> scenario -> string[]
  const detailAcc = {}; // feature -> scenario -> { source, steps[] }
  for (const file of data.testResults || []) {
    for (const assertion of file.assertionResults || []) {
      const { feature, scenario } = mapVitestTitles(assertion);
      if (!feature || !scenario) continue;
      const status = VITEST_STATUS[assertion.status] || assertion.status;
      if (!acc[feature]) acc[feature] = {};
      if (!acc[feature][scenario]) acc[feature][scenario] = [];
      acc[feature][scenario].push(status);

      if (!detailAcc[feature]) detailAcc[feature] = {};
      if (!detailAcc[feature][scenario]) {
        detailAcc[feature][scenario] = { source: file.name || "", steps: [] };
      }
      detailAcc[feature][scenario].steps.push({
        text: assertion.title || scenario,
        status,
        source: file.name || "",
      });
    }
  }

  const lookup = {};
  for (const [feature, scenarios] of Object.entries(acc)) {
    const sc = {};
    for (const [name, statuses] of Object.entries(scenarios)) {
      sc[name] = rollupStatus(statuses) || "undefined";
    }
    lookup[feature] = {
      name: feature,
      scenarios: sc,
      scenarioDetails: detailAcc[feature] || {},
    };
  }
  return lookup;
}

/** Escape a string for use in a RegExp literal. */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function findMatchingParen(source, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findStepDefinition(source, stepText) {
  const literalPattern = new RegExp("(['\"`])" + escapeRegExp(stepText) + "\\1");
  const literalMatch = literalPattern.exec(source);
  if (!literalMatch) return null;

  const before = source.slice(Math.max(0, literalMatch.index - 120), literalMatch.index);
  const keywordMatch = /(Given|When|Then|And|But)\s*\(\s*$/.exec(before);
  if (!keywordMatch) return null;

  const callStart = literalMatch.index - (keywordMatch[0].length);
  const openParen = source.indexOf("(", callStart);
  const closeParen = findMatchingParen(source, openParen);
  const end = closeParen === -1 ? literalMatch.index + literalMatch[0].length : closeParen + 1;
  const line = lineNumberAt(source, callStart);
  return {
    keyword: keywordMatch[1],
    line,
    code: source.slice(callStart, end).trim(),
  };
}

async function enrichVitestDetails(data, lookup) {
  if (!data || !Array.isArray(data.testResults)) return;

  const sourceCache = new Map();
  for (const file of data.testResults) {
    if (!file.name) continue;
    if (!sourceCache.has(file.name)) {
      try {
        sourceCache.set(file.name, await readFile(file.name, "utf-8"));
      } catch {
        sourceCache.set(file.name, null);
      }
    }
    const source = sourceCache.get(file.name);
    if (!source) continue;

    for (const assertion of file.assertionResults || []) {
      const { feature, scenario } = mapVitestTitles(assertion);
      const detail = lookup[feature]?.scenarioDetails?.[scenario];
      if (!detail) continue;
      const step = detail.steps.find(
        (candidate) => candidate.text === assertion.title && !candidate.definition,
      );
      if (!step) continue;
      const title = assertion.title || "";
      const titleWithoutKeyword = title.replace(/^(Given|When|Then|And|But)\s+/, "");
      const definition =
        findStepDefinition(source, title) ||
        (titleWithoutKeyword !== title
          ? findStepDefinition(source, titleWithoutKeyword)
          : null);
      if (definition) {
        step.line = definition.line;
        step.keyword = definition.keyword;
        step.definition = definition.code;
        step.source = `${file.name}:${definition.line}`;
      }
    }
  }
}

/**
 * Read a Cucumber JSON results file and return the normalized lookup.
 * Returns null if the file is missing or unparseable (graceful degradation).
 *
 * @param {string} filePath
 * @returns {Promise<Object|null>}
 */
export async function parseResultsFile(filePath) {
  let content;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(content);
    const lookup = normalizeResults(data);
    await enrichVitestDetails(data, lookup);
    return lookup;
  } catch {
    return null;
  }
}

/**
 * Locate a Cucumber JSON results file.
 *
 * An explicit path always wins — it is resolved to absolute and returned even
 * if it does not exist yet (so a watcher can pick it up once written).
 * Otherwise the conventional locations under `projectRoot` are probed in order
 * (root-level filenames first, then the same filenames inside results
 * directories) and the first existing file is returned, or `null` if none.
 *
 * @param {string} projectRoot
 * @param {string|null} [explicitPath]
 * @returns {string|null} absolute path or null
 */
export function resolveResultsPath(projectRoot, explicitPath) {
  if (explicitPath) {
    return resolve(explicitPath);
  }
  const candidates = [
    ...RESULTS_FILENAMES.map((f) => join(projectRoot, f)),
    ...RESULTS_DIRS.flatMap((dir) =>
      RESULTS_FILENAMES.map((f) => join(projectRoot, dir, f)),
    ),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Tally a list of statuses into { passed, failed, total }, where `total`
 * counts only entries that carry result data (non-null).
 */
function tally(statuses) {
  const counts = { passed: 0, failed: 0, total: 0 };
  for (const status of statuses) {
    if (status == null) continue;
    counts.total += 1;
    if (status === "passed") counts.passed += 1;
    else if (status === "failed") counts.failed += 1;
  }
  return counts;
}

/**
 * Merge a normalized results lookup onto parsed specs in place.
 *
 * Annotates each `spec.featureFiles[].scenarios[]` with a `status` (null when
 * no matching result), each feature file with `testStatus` + `testCounts`, and
 * each spec with `testStatus` + `testCounts`. A feature or spec with no matched
 * results has `testStatus: null`.
 *
 * @param {Array} specs
 * @param {Object} lookup - output of normalizeResults / parseResultsFile
 * @returns {Array} the same specs array, annotated
 */
/** Normalize a path for comparison: strip a leading "./" and any leading slashes. */
function normalizePath(p) {
  return String(p).replace(/^\.?\/+/, "");
}

/**
 * Index results entries that carry a `uri` by normalized path, so a feature
 * file can be joined to its result by source file rather than display name.
 */
function indexByPath(lookup) {
  const byPath = {};
  for (const entry of Object.values(lookup)) {
    if (entry && entry.uri) byPath[normalizePath(entry.uri)] = entry;
  }
  return byPath;
}

/**
 * Find the results entry for a parsed feature file. Prefers a match on the
 * feature's source path (via the report's `uri`); a path match wins even when
 * a differently-named entry shares the feature's name. Falls back to matching
 * on feature name.
 */
function resultsForFeature(feature, lookup, byPath) {
  if (feature.path) {
    const norm = normalizePath(feature.path);
    if (byPath[norm]) return byPath[norm];
    // Also accept an absolute or longer uri that ends with the feature path.
    for (const [uriPath, entry] of Object.entries(byPath)) {
      if (uriPath.endsWith(norm) || norm.endsWith(uriPath)) return entry;
    }
  }
  return lookup[feature.name] || null;
}

export function mergeResults(specs, lookup = {}) {
  const byPath = indexByPath(lookup);
  for (const spec of specs) {
    const specStatuses = [];

    for (const feature of spec.featureFiles || []) {
      const resultEntry = resultsForFeature(feature, lookup, byPath);
      const featureResults = resultEntry?.scenarios || {};
      const featureDetails = resultEntry?.scenarioDetails || {};
      const statuses = [];

      for (const scenario of feature.scenarios || []) {
        const status = Object.prototype.hasOwnProperty.call(
          featureResults,
          scenario.name,
        )
          ? featureResults[scenario.name]
          : null;
        scenario.status = status;
        if (featureDetails[scenario.name]) {
          scenario.testDetails = featureDetails[scenario.name];
        }
        statuses.push(status);
      }

      const present = statuses.filter((s) => s != null);
      feature.testStatus = rollupStatus(present);
      feature.testCounts = tally(statuses);
      specStatuses.push(...present);
    }

    spec.testStatus = rollupStatus(specStatuses);
    spec.testCounts = tally(specStatuses);
  }
  return specs;
}
