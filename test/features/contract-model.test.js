import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  parseContractBlocks,
  validateContractRegistry,
  generateJsonSchema,
} from "../../src/contracts.js";

function spec(name, body = "", depends_on = []) {
  const parsed = parseContractBlocks(body, name);
  return {
    name,
    depends_on,
    models: parsed.models,
    interfaces: parsed.interfaces,
    contractDiagnostics: parsed.diagnostics,
  };
}

const parsingFeature = await loadFeature("features/contract-model/contract-block-parsing.feature");
describeFeature(parsingFeature, ({ Scenario }) => {
  let body;
  let result;

  Scenario("Parse model and interface blocks", ({ Given, When, Then }) => {
    Given("a spec body contains valid m21-model and m21-interface YAML blocks", () => {
      body = "```m21-model\nentities:\n  User:\n    fields:\n      id: { type: string, required: true }\n```\n```m21-interface\noperations:\n  create-user:\n    input: User\n    output: User\n```";
    });
    When("its contract blocks are parsed", () => { result = parseContractBlocks(body, "auth"); });
    Then("entities and operations are normalized under the owning spec", () => {
      expect(result.models.entities.User.fields.id).toEqual({ type: "string", required: true });
      expect(result.interfaces.operations["create-user"].input).toBe("User");
    });
  });

  Scenario("Merge multiple blocks", ({ Given, When, Then }) => {
    Given("a spec body contains multiple model or interface blocks", () => {
      body = "```m21-model\nentities:\n  A: {}\n```\n```m21-model\nentities:\n  B: {}\n```";
    });
    When("its contract blocks are parsed", () => { result = parseContractBlocks(body, "x"); });
    Then("declarations from every block are included in the owned contract", () => {
      expect(Object.keys(result.models.entities)).toEqual(["A", "B"]);
    });
  });

  Scenario("Preserve parsing when a block is malformed", ({ Given, When, Then }) => {
    Given("a spec body contains malformed contract YAML", () => { body = "```m21-model\nentities: [broken\n```"; });
    When("its contract blocks are parsed", () => { result = parseContractBlocks(body, "x"); });
    Then("spec parsing succeeds with a contract diagnostic", () => {
      expect(result.diagnostics[0].type).toBe("malformed-contract-block");
    });
  });
});

const validationFeature = await loadFeature("features/contract-model/model-validation.feature");
describeFeature(validationFeature, ({ Scenario }) => {
  let specs;
  let issues;

  Scenario("Accept structurally valid contracts", ({ Given, When, Then }) => {
    Given("specs declare supported field types and resolvable model references", () => {
      specs = [spec("auth", "```m21-model\nentities:\n  User:\n    fields:\n      id: string\n      manager: { type: reference, ref: User }\n```")];
    });
    When("the contract registry is validated", () => { issues = validateContractRegistry(specs); });
    Then("no contract errors are reported", () => { expect(issues).toEqual([]); });
  });

  Scenario("Reject contract sections out of order", ({ Given, When, Then }) => {
    Given("a spec places Interfaces before Data model", () => {
      specs = [spec("x", "## Interfaces\n\n```m21-interface\noperations: {}\n```\n\n## Data model\n\n```m21-model\nentities: {}\n```\n\n## Contract")];
    });
    When("the contract registry is validated", () => { issues = validateContractRegistry(specs); });
    Then("a contract-section-order error is reported", () => {
      expect(issues.some((i) => i.type === "contract-section-order")).toBe(true);
    });
  });

  Scenario("Reject unsupported field types", ({ Given, When, Then }) => {
    Given("an entity field declares an unsupported structural type", () => {
      specs = [spec("x", "```m21-model\nentities:\n  A:\n    fields:\n      bad: spaceship\n```")];
    });
    When("the contract registry is validated", () => { issues = validateContractRegistry(specs); });
    Then("an unsupported-type error identifies the owning spec and field", () => {
      expect(issues[0]).toMatchObject({ type: "unsupported-type", spec: "x" });
      expect(issues[0].message).toContain("A.bad");
    });
  });

  Scenario("Reject unresolved model references", ({ Given, When, Then }) => {
    Given("a field or operation references an entity that does not exist", () => {
      specs = [spec("x", "```m21-interface\noperations:\n  find-user: { output: Missing }\n```")];
    });
    When("the contract registry is validated", () => { issues = validateContractRegistry(specs); });
    Then("an unresolved-model-reference error is reported", () => {
      expect(issues.some((i) => i.type === "unresolved-model-reference")).toBe(true);
    });
  });

  Scenario("Require dependencies for cross-spec references", ({ Given, When, Then }) => {
    Given("a spec references an entity owned by another spec without depending on it", () => {
      specs = [
        spec("base", "```m21-model\nentities:\n  User: {}\n```"),
        spec("api", "```m21-interface\noperations:\n  get-user: { output: base.User }\n```"),
      ];
    });
    When("the contract registry is validated", () => { issues = validateContractRegistry(specs); });
    Then("a missing-model-dependency error is reported", () => {
      expect(issues.some((i) => i.type === "missing-model-dependency")).toBe(true);
    });
  });

  Scenario("Reject duplicate declarations", ({ Given, When, Then }) => {
    Given("multiple contract blocks in one spec declare the same entity or operation", () => {
      specs = [spec("x", "```m21-model\nentities:\n  A: {}\n```\n```m21-model\nentities:\n  A: {}\n```")];
    });
    When("the contract registry is validated", () => { issues = validateContractRegistry(specs); });
    Then("a duplicate-contract-identifier error is reported", () => {
      expect(issues.some((i) => i.type === "duplicate-contract-identifier")).toBe(true);
    });
  });
});

const schemaFeature = await loadFeature("features/contract-model/schema-generation.feature");
describeFeature(schemaFeature, ({ Scenario }) => {
  let specs;
  let result;

  Scenario("Generate schema definitions", ({ Given, When, Then }) => {
    Given("a valid contract registry with entities and constrained fields", () => {
      specs = [spec("auth", "```m21-model\nentities:\n  User:\n    identity: id\n    constraints: [email is unique]\n    fields:\n      id: { type: string, required: true }\n      email: { type: string, format: email, required: true }\n      status: { type: enum, values: [active, suspended] }\n```")];
    });
    When("JSON Schema is generated", () => { result = generateJsonSchema(specs); });
    Then("every entity has a qualified definition with required fields, formats, enums, and constraints represented where supported", () => {
      const user = result.schema.$defs["auth.User"];
      expect(user.required).toEqual(["id", "email"]);
      expect(user.properties.email.format).toBe("email");
      expect(user.properties.status.enum).toEqual(["active", "suspended"]);
      expect(user["x-m21-constraints"]).toEqual(["email is unique"]);
    });
  });

  Scenario("Resolve entity references", ({ Given, When, Then }) => {
    Given("an entity field references a local or dependency-owned entity", () => {
      specs = [
        spec("base", "```m21-model\nentities:\n  User: {}\n```"),
        spec("api", "```m21-model\nentities:\n  Response:\n    fields:\n      user: { type: reference, ref: base.User }\n```", [{ name: "base", uses: [] }]),
      ];
    });
    When("JSON Schema is generated", () => { result = generateJsonSchema(specs); });
    Then("the field points to the referenced qualified definition", () => {
      expect(result.schema.$defs["api.Response"].properties.user.$ref).toBe("#/$defs/base.User");
    });
  });

  Scenario("Scope schema to one spec", ({ Given, When, Then }) => {
    Given("a valid registry containing multiple specs", () => {
      specs = [
        spec("base", "```m21-model\nentities:\n  User: {}\n```"),
        spec("api", "```m21-model\nentities:\n  Response:\n    fields:\n      user: { type: reference, ref: base.User }\n```", [{ name: "base", uses: [] }]),
        spec("other", "```m21-model\nentities:\n  Ignored: {}\n```"),
      ];
    });
    When("JSON Schema is generated for one spec", () => { result = generateJsonSchema(specs, "api"); });
    Then("its entities and transitively referenced entities are included", () => {
      expect(Object.keys(result.schema.$defs).sort()).toEqual(["api.Response", "base.User"]);
    });
  });
});
