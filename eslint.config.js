import js from "@eslint/js";

export default [
  {
    ignores: ["vendor/**", "docs/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    // Node ESM source, tests, and tooling.
    files: ["src/**/*.js", "bin/**/*.js", "test/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        AbortController: "readonly",
        TextDecoder: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
  {
    // jsdom-based tests exercise the generated client in a simulated browser.
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        EventSource: "readonly",
        TextDecoder: "readonly",
      },
    },
  },
  {
    // Browser client application — runs in the page, not in Node.
    files: ["src/client/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        d3: "readonly",
        marked: "readonly",
        EventSource: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        location: "readonly",
      },
    },
    rules: {
      // The client file is assembled with placeholders and shares helpers
      // across a single scope; unused-var analysis produces false positives.
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
