// @vitest-environment jsdom
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { generateHTML } from "../../src/generator.js";

const feature = await loadFeature("features/graph-client/contract-tabs.feature");
describeFeature(feature, ({ Scenario }) => {
  let spec;
  let html;

  function render() {
    html = generateHTML([{
      name: "auth",
      depends_on: [],
      featureFiles: [],
      body: "# Auth",
      models: { entities: {} },
      interfaces: { operations: {} },
      contractDiagnostics: [],
      ...spec,
    }]);
  }

  Scenario("Show owned entities", ({ Given, When, Then }) => {
    Given("a selected spec contains normalized entities", () => {
      spec = {
        models: { entities: { User: { identity: "id", fields: { id: { type: "string", required: true } }, constraints: ["id is stable"] } } },
        contractDiagnostics: [{ type: "sample", message: "diagnostic" }],
      };
    });
    When("the Model tab is opened", () => { render(); });
    Then("entity fields, types, requirements, constraints, and diagnostics are shown", () => {
      expect(html).toContain("panel-model-tab");
      expect(html).toContain("contract-table");
      expect(html).toContain("contractDiagnostics");
      expect(html).toContain("id is stable");
    });
  });

  Scenario("Show semantic operations", ({ Given, When, Then }) => {
    Given("a selected spec contains normalized operations", () => {
      spec = { interfaces: { operations: { "create-user": { purpose: "Create", input: "User", output: "User", failures: ["Invalid"], effects: ["stored"], emits: [], consumes: [] } } } };
    });
    When("the Interfaces tab is opened", () => { render(); });
    Then("operation purpose, inputs, outputs, failures, and effects are shown", () => {
      expect(html).toContain("panel-interfaces-tab");
      expect(html).toContain("create-user");
      expect(html).toContain("failures");
      expect(html).toContain("effects");
    });
  });

  Scenario("Show empty contract layers", ({ Given, When, Then }) => {
    Given("a selected spec has no machine-readable model or interfaces", () => { spec = {}; });
    When("its contract tabs are opened", () => { render(); });
    Then("each tab explains that no declarations exist", () => {
      expect(html).toContain("No machine-readable model declared");
      expect(html).toContain("No machine-readable interfaces declared");
    });
  });
});
