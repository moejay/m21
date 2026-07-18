import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { modelCommand, schemaCommand } from "../../src/commands.js";

function spec(name, entities = {}, operations = {}, diagnostics = []) {
  return {
    name,
    depends_on: [],
    models: { entities },
    interfaces: { operations },
    contractDiagnostics: diagnostics,
    featureFiles: [],
  };
}

const modelFeature = await loadFeature("features/cli-commands/model.feature");
describeFeature(modelFeature, ({ Scenario }) => {
  let specs;
  let result;

  Scenario("Export the complete registry as JSON", ({ Given, When, Then }) => {
    Given("parsed specs contain entities and operations", () => {
      specs = [spec("auth", { User: { fields: {}, constraints: [] } }, { "create-user": { failures: [], effects: [], emits: [], consumes: [] } })];
    });
    When("the model command runs with JSON output", () => { result = modelCommand(specs, { json: true }); });
    Then("it returns every owned model and interface with diagnostics", () => {
      const value = JSON.parse(result.output);
      expect(value.specs[0].models.entities).toHaveProperty("User");
      expect(value.specs[0].interfaces.operations).toHaveProperty("create-user");
      expect(value).toHaveProperty("diagnostics");
    });
  });

  Scenario("Scope model output to one spec", ({ Given, When, Then }) => {
    Given("parsed contracts for multiple specs", () => { specs = [spec("a"), spec("b")]; });
    When("the model command requests one spec", () => { result = modelCommand(specs, { name: "b", json: true }); });
    Then("only that spec's owned declarations are returned", () => {
      expect(JSON.parse(result.output).specs.map((s) => s.name)).toEqual(["b"]);
    });
  });

  Scenario("Reject an unknown spec", ({ Given, When, Then }) => {
    Given("no spec matches the requested model owner", () => { specs = [spec("a")]; });
    When("the model command runs", () => { result = modelCommand(specs, { name: "missing" }); });
    Then("it returns a non-zero result with a descriptive error", () => {
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("missing");
    });
  });
});

const schemaFeature = await loadFeature("features/cli-commands/schema.feature");
describeFeature(schemaFeature, ({ Scenario }) => {
  let specs;
  let result;

  Scenario("Export project JSON Schema", ({ Given, When, Then }) => {
    Given("parsed specs contain a valid contract registry", () => {
      specs = [spec("auth", { User: { fields: { id: { type: "string", required: true } }, constraints: [] } })];
    });
    When("the schema command runs", () => { result = schemaCommand(specs); });
    Then("it returns a JSON Schema document with qualified definitions", () => {
      expect(JSON.parse(result.output).$defs).toHaveProperty("auth.User");
    });
  });

  Scenario("Refuse invalid contracts", ({ Given, When, Then }) => {
    Given("the contract registry has unresolved model references", () => {
      specs = [spec("auth", { User: { fields: { manager: { type: "reference", ref: "Missing", required: false } }, constraints: [] } })];
    });
    When("the schema command runs", () => { result = schemaCommand(specs); });
    Then("it returns a non-zero result with contract diagnostics", () => {
      expect(result.exitCode).toBe(1);
      expect(JSON.parse(result.output).issues[0].type).toBe("unresolved-model-reference");
    });
  });

  Scenario("Reject an unknown spec", ({ Given, When, Then }) => {
    Given("no spec matches the requested schema owner", () => { specs = [spec("a")]; });
    When("the schema command runs", () => { result = schemaCommand(specs, { name: "missing" }); });
    Then("it returns a non-zero result with a descriptive error", () => {
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("missing");
    });
  });
});
