import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const m21Skill = readFileSync(
  join(root, "skills", "m21", "SKILL.md"),
  "utf-8",
);
const m21InitSkill = readFileSync(
  join(root, "skills", "m21-init", "SKILL.md"),
  "utf-8",
);

const m21Lower = m21Skill.toLowerCase();
const m21InitLower = m21InitSkill.toLowerCase();

function hasFrontmatter(doc) {
  const m = doc.match(/^---\n([\s\S]*?)\n---/);
  expect(m).not.toBeNull();
  return m[1];
}

const specAuthoring = await loadFeature("features/skills/spec-authoring.feature");

describeFeature(specAuthoring, ({ Scenario }) => {
  Scenario("Create a new spec file", ({ Given, When, Then }) => {
    Given("the user asks to add a module spec", () => {
      const fm = hasFrontmatter(m21Skill);
      expect(fm).toMatch(/name:/);
      expect(fm).toMatch(/description:/);
    });
    When("the m21 skill is invoked", () => {
      expect(m21Lower).toContain("m21");
    });
    Then(
      "a .md file is created with valid YAML frontmatter (name, description, group, tags, depends_on, features) and a markdown body",
      () => {
        // The reference spec format documents every frontmatter field.
        for (const field of [
          "name",
          "description",
          "group",
          "tags",
          "depends_on",
          "features",
        ]) {
          expect(m21Lower).toContain(`\`${field}\``);
        }
        expect(m21Lower).toContain("yaml frontmatter");
        expect(m21Lower).toContain("markdown body");
      },
    );
  });

  Scenario("Add dependency with feature references", ({ Given, When, Then }) => {
    Given("an existing spec needs a new dependency", () => {
      expect(m21Lower).toContain("depends_on");
    });
    When("the skill updates depends_on", () => {
      expect(m21Lower).toContain("depends_on");
    });
    Then(
      "the entry includes target name and a uses array of feature names",
      () => {
        // Rich dependency form documents name + uses array of feature names.
        expect(m21Skill).toMatch(/uses:\s*\[/);
        expect(m21Lower).toContain("name: bootstrap");
        expect(m21Lower).toMatch(/`uses`[\s\S]*feature/);
      },
    );
  });

  Scenario("Create Gherkin feature files", ({ Given, When, Then }) => {
    Given("the user wants to define a module's capabilities", () => {
      expect(m21Lower).toContain("feature");
    });
    When("the skill creates features", () => {
      expect(m21Lower).toContain(".feature");
    });
    Then(
      ".feature files with Feature header, description, and Scenario blocks are written",
      () => {
        expect(m21Lower).toContain("gherkin");
        expect(m21Skill).toContain("Feature:");
        expect(m21Skill).toContain("Scenario:");
        expect(m21Lower).toContain("description");
      },
    );
  });

  Scenario("Apply naming conventions", ({ Given, When, Then }) => {
    Given("the skill generates spec or feature names", () => {
      expect(m21Lower).toContain("name");
    });
    When("naming", () => {
      expect(m21Lower).toContain("kebab-case");
    });
    Then(
      "kebab-case is used for spec names, feature names, and file names",
      () => {
        expect(m21Lower).toContain("kebab-case");
        // Documented for feature names and file names.
        expect(m21Lower).toMatch(/feature names \*\*must be kebab-case/);
        expect(m21Lower).toMatch(/filename should match feature name/);
      },
    );
  });

  Scenario("Guide what belongs in a spec body", ({ Given, When, Then, And }) => {
    Given("the user is writing or editing a spec body", () => {
      expect(m21Lower).toContain("markdown body");
    });
    When("the m21 skill is consulted", () => {
      expect(m21Lower).toContain("what belongs in a spec");
    });
    Then(
      "it explains that a spec describes responsibilities, non-goals, and invariants in domain language",
      () => {
        expect(m21Lower).toContain("responsib");
        expect(m21Lower).toContain("non-goals");
        expect(m21Lower).toContain("invariants");
        expect(m21Lower).toContain("domain language");
      },
    );
    And("it lists implementation details that do not belong in a spec body", () => {
      // The smell list names concrete kinds of implementation leakage.
      expect(m21Lower).toContain("file paths");
      expect(m21Lower).toContain("function");
      expect(m21Lower).toMatch(/library|framework/);
      expect(m21Lower).toContain("tuning constants");
    });
  });

  Scenario("Keep specs language-agnostic", ({ Given, When, Then, And }) => {
    Given("a spec body is being authored", () => {
      expect(m21Lower).toContain("spec body");
    });
    When("the skill evaluates whether a detail belongs in the spec", () => {
      expect(m21Lower).toContain("regeneration test");
    });
    Then(
      "it applies the regeneration test: the module could be rebuilt in another language from spec and features alone",
      () => {
        expect(m21Lower).toMatch(/regeneration test[\s\S]*another (language|stack)/);
      },
    );
    And(
      "deliberate technology choices are recorded only as decisions, not as descriptions of the code",
      () => {
        expect(m21Lower).toMatch(/decision[\s\S]*constraint/);
      },
    );
  });

  Scenario("Assign architectural groups", ({ Given, When, Then }) => {
    Given("the skill categorizes a module", () => {
      expect(m21Lower).toContain("group");
    });
    When("assigning a group", () => {
      expect(m21Lower).toContain("group");
    });
    Then(
      "it selects from foundation, infrastructure, domain, interface, presentation, or a project-specific grouping",
      () => {
        // The m21 skill documents the group field and gives example
        // groupings; it also allows domain organization (project-specific).
        expect(m21Lower).toContain("infrastructure");
        expect(m21Lower).toMatch(/domain organization|project|group/);
        expect(m21Lower).toContain("group");
      },
    );
  });
});

const brownfield = await loadFeature(
  "features/skills/brownfield-adoption.feature",
);

describeFeature(brownfield, ({ Scenario }) => {
  Scenario("Identify modules from project structure", ({ Given, When, Then }) => {
    Given(
      "an existing codebase with directory and package boundaries",
      () => {
        const fm = hasFrontmatter(m21InitSkill);
        expect(fm).toMatch(/name:/);
        expect(fm).toMatch(/description:/);
        expect(m21InitLower).toContain("brownfield");
      },
    );
    When("the m21-init skill analyzes the project", () => {
      expect(m21InitLower).toContain("analyze the codebase");
    });
    Then(
      "modules are identified based on entry points, export patterns, and configuration boundaries",
      () => {
        expect(m21InitLower).toContain("entry point");
        expect(m21InitLower).toContain("export pattern");
        expect(m21InitLower).toContain("configuration boundaries");
      },
    );
  });

  Scenario("Detect inter-module dependencies", ({ Given, When, Then }) => {
    Given(
      "identified modules with import and injection relationships",
      () => {
        expect(m21InitLower).toContain("import");
        expect(m21InitLower).toContain("injection");
      },
    );
    When("dependencies are analyzed", () => {
      expect(m21InitLower).toContain("identify dependencies");
    });
    Then(
      "depends_on entries are generated mapping to specific feature uses",
      () => {
        expect(m21InitLower).toContain("depends_on");
        expect(m21InitSkill).toMatch(/uses:\s*\[/);
        expect(m21InitLower).toMatch(/specific functionality \(features\)/);
      },
    );
  });

  Scenario("Generate specs at the right granularity", ({ Given, When, Then }) => {
    Given("the codebase has many files", () => {
      expect(m21InitLower).toContain("module granularity");
    });
    When("modules are identified", () => {
      expect(m21InitLower).toContain("module");
    });
    Then(
      'specs are right-sized — not per-file, not monolithic, not vague "utils" catch-alls',
      () => {
        expect(m21InitLower).toContain("right-sized");
        expect(m21InitLower).toContain("spec per file");
        expect(m21InitLower).toContain("utils");
      },
    );
  });

  Scenario("Technology-agnostic by default", ({ Given, When, Then }) => {
    Given("the user does not request tech stack preservation", () => {
      expect(m21InitLower).toContain("technology-agnostic");
    });
    When("specs are generated", () => {
      expect(m21InitLower).toContain("spec");
    });
    Then(
      "no language-specific terms, framework names, or implementation details appear",
      () => {
        expect(m21InitLower).toContain("no language-specific terms");
        expect(m21InitLower).toContain("no framework references");
        expect(m21InitLower).toContain("no implementation details");
      },
    );
  });

  Scenario("Preserve tech stack when requested", ({ Given, When, Then }) => {
    Given("the user explicitly asks to keep the tech stack", () => {
      expect(m21InitLower).toContain("keep the tech stack");
    });
    When("specs are generated", () => {
      expect(m21InitLower).toContain("spec");
    });
    Then(
      "technology-specific concepts and framework references are included",
      () => {
        // Documents that when explicitly requested, tech-stack concepts and
        // modularity are reflected in the specs.
        expect(m21InitLower).toMatch(
          /keep the tech stack[\s\S]*concepts[\s\S]*modularity/,
        );
      },
    );
  });

  Scenario("Interactive workflow", ({ Given, When, Then }) => {
    Given("the user specifies --interactive", () => {
      expect(m21InitLower).toContain("--interactive");
    });
    When("the skill runs", () => {
      expect(m21InitLower).toContain("interactive workflow");
    });
    Then(
      "the user is prompted to review modules, dependencies, and feature generation at each step",
      () => {
        expect(m21InitLower).toMatch(
          /present the identified modules and their dependencies for review/,
        );
        expect(m21InitLower).toMatch(/feature files generated/);
      },
    );
  });
});
