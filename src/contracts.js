import yaml from "js-yaml";

export const FIELD_TYPES = new Set([
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "enum",
  "reference",
]);

const PRIMITIVE_REFS = new Set([
  "string", "number", "integer", "boolean", "object", "array", "void", "none", "unknown",
]);

function diagnostic(spec, type, message, severity = "error") {
  return { severity, type, spec, message };
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeField(field) {
  if (typeof field === "string") return { type: field, required: false };
  const value = asObject(field);
  return { ...value, type: value.type || "string", required: value.required === true };
}

function normalizeEntity(entity) {
  const value = asObject(entity);
  const fields = {};
  for (const [name, field] of Object.entries(asObject(value.fields))) {
    fields[name] = normalizeField(field);
  }
  return {
    ...value,
    fields,
    constraints: Array.isArray(value.constraints) ? value.constraints : [],
  };
}

function normalizeOperation(operation) {
  const value = typeof operation === "string" ? { purpose: operation } : asObject(operation);
  return {
    ...value,
    failures: Array.isArray(value.failures) ? value.failures : [],
    effects: Array.isArray(value.effects) ? value.effects : [],
    emits: Array.isArray(value.emits) ? value.emits : [],
    consumes: Array.isArray(value.consumes) ? value.consumes : [],
  };
}

export function parseContractBlocks(body, specName = "") {
  const entities = {};
  const operations = {};
  const diagnostics = [];
  const sectionPositions = ["Data model", "Interfaces", "Contract"]
    .map((heading) => ({ heading, index: (body || "").search(new RegExp(`^## ${heading}\\s*$`, "im")) }))
    .filter((section) => section.index >= 0);
  for (let index = 1; index < sectionPositions.length; index += 1) {
    if (sectionPositions[index].index < sectionPositions[index - 1].index) {
      diagnostics.push(diagnostic(
        specName,
        "contract-section-order",
        `${specName || "spec"} contract sections must follow Data model → Interfaces → Contract`,
      ));
      break;
    }
  }

  const blockPattern = /```(m21-model|m21-interface)[^\S\r\n]*\r?\n([\s\S]*?)```/g;
  let match;

  while ((match = blockPattern.exec(body || "")) !== null) {
    const kind = match[1];
    let parsed;
    try {
      parsed = yaml.load(match[2]) || {};
    } catch (error) {
      diagnostics.push(diagnostic(
        specName,
        "malformed-contract-block",
        `${specName || "spec"} has malformed ${kind} YAML: ${error.reason || error.message}`,
      ));
      continue;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      diagnostics.push(diagnostic(
        specName,
        "invalid-contract-block",
        `${specName || "spec"} ${kind} block must contain a YAML mapping`,
      ));
      continue;
    }

    if (kind === "m21-model") {
      for (const [name, entity] of Object.entries(asObject(parsed.entities))) {
        if (Object.keys(entities).some((existing) => existing.toLowerCase() === name.toLowerCase())) {
          diagnostics.push(diagnostic(
            specName,
            "duplicate-contract-identifier",
            `${specName} declares entity "${name}" more than once`,
          ));
          continue;
        }
        entities[name] = normalizeEntity(entity);
      }
    } else {
      for (const [name, operation] of Object.entries(asObject(parsed.operations))) {
        if (Object.keys(operations).some((existing) => existing.toLowerCase() === name.toLowerCase())) {
          diagnostics.push(diagnostic(
            specName,
            "duplicate-contract-identifier",
            `${specName} declares operation "${name}" more than once`,
          ));
          continue;
        }
        operations[name] = normalizeOperation(operation);
      }
    }
  }

  return { models: { entities }, interfaces: { operations }, diagnostics };
}

function qualifiedRef(owner, ref) {
  if (typeof ref !== "string" || !ref.trim()) return null;
  const value = ref.trim();
  if (PRIMITIVE_REFS.has(value.toLowerCase())) return null;
  return value.includes(".") ? value : `${owner}.${value}`;
}

function collectFieldRefs(field) {
  const refs = [];
  if (field.type === "reference" && field.ref) refs.push(field.ref);
  if (field.type === "array") {
    if (typeof field.items === "string" && !FIELD_TYPES.has(field.items)) refs.push(field.items);
    if (field.items && typeof field.items === "object" && field.items.ref) refs.push(field.items.ref);
  }
  return refs;
}

function operationRefs(operation) {
  const refs = [];
  for (const key of ["input", "output"]) {
    const value = operation[key];
    if (typeof value === "string") refs.push(...value.split("|").map((v) => v.trim()));
    if (Array.isArray(value)) refs.push(...value);
  }
  return refs;
}

export function validateContractRegistry(specs) {
  const issues = [];
  const entities = new Map();
  const specMap = new Map();

  for (const spec of specs) {
    specMap.set(spec.name.toLowerCase(), spec);
    issues.push(...(spec.contractDiagnostics || []));
    for (const [name, entity] of Object.entries(spec.models?.entities || {})) {
      entities.set(`${spec.name}.${name}`.toLowerCase(), { spec, name, entity });
    }
  }

  const checkReference = (spec, ref, context) => {
    const qualified = qualifiedRef(spec.name, ref);
    if (!qualified) return;
    const target = entities.get(qualified.toLowerCase());
    if (!target) {
      issues.push(diagnostic(
        spec.name,
        "unresolved-model-reference",
        `${spec.name} ${context} references unknown entity "${ref}"`,
      ));
      return;
    }
    if (target.spec.name.toLowerCase() !== spec.name.toLowerCase()) {
      const deps = new Set((spec.depends_on || []).map((d) => d.name.toLowerCase()));
      if (!deps.has(target.spec.name.toLowerCase())) {
        issues.push(diagnostic(
          spec.name,
          "missing-model-dependency",
          `${spec.name} references "${qualified}" without depending on "${target.spec.name}"`,
        ));
      }
    }
  };

  for (const spec of specs) {
    for (const [entityName, entity] of Object.entries(spec.models?.entities || {})) {
      if (entity.identity && !Object.hasOwn(entity.fields || {}, entity.identity)) {
        issues.push(diagnostic(
          spec.name,
          "invalid-model-identity",
          `${spec.name}.${entityName} identity field "${entity.identity}" does not exist`,
        ));
      }
      for (const [fieldName, field] of Object.entries(entity.fields || {})) {
        if (!FIELD_TYPES.has(field.type)) {
          issues.push(diagnostic(
            spec.name,
            "unsupported-type",
            `${spec.name}.${entityName}.${fieldName} uses unsupported type "${field.type}"`,
          ));
          continue;
        }
        if (field.type === "enum" && (!Array.isArray(field.values) || field.values.length === 0)) {
          issues.push(diagnostic(
            spec.name,
            "invalid-enum",
            `${spec.name}.${entityName}.${fieldName} must declare non-empty values`,
          ));
        }
        if (field.type === "reference" && !field.ref) {
          issues.push(diagnostic(
            spec.name,
            "missing-model-reference",
            `${spec.name}.${entityName}.${fieldName} must declare ref`,
          ));
        }
        for (const ref of collectFieldRefs(field)) {
          checkReference(spec, ref, `${entityName}.${fieldName}`);
        }
      }
    }
    for (const [operationName, operation] of Object.entries(spec.interfaces?.operations || {})) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(operationName)) {
        issues.push(diagnostic(
          spec.name,
          "invalid-operation-name",
          `${spec.name} operation "${operationName}" must be kebab-case`,
        ));
      }
      for (const ref of operationRefs(operation)) {
        checkReference(spec, ref, `operation "${operationName}"`);
      }
    }
  }

  return issues;
}

export function exportContractRegistry(specs, name = null) {
  const target = name
    ? specs.filter((spec) => spec.name.toLowerCase() === name.toLowerCase())
    : specs;
  if (name && target.length === 0) return null;
  return {
    specs: target.map((spec) => ({
      name: spec.name,
      models: spec.models || { entities: {} },
      interfaces: spec.interfaces || { operations: {} },
    })),
    diagnostics: validateContractRegistry(specs).filter((issue) =>
      !name || issue.spec.toLowerCase() === name.toLowerCase()),
  };
}

function fieldSchema(field, owner) {
  if (field.type === "reference") {
    return { $ref: `#/$defs/${qualifiedRef(owner, field.ref)}` };
  }
  if (field.type === "array") {
    let items = {};
    if (typeof field.items === "string") {
      items = FIELD_TYPES.has(field.items)
        ? fieldSchema({ type: field.items }, owner)
        : { $ref: `#/$defs/${qualifiedRef(owner, field.items)}` };
    } else if (field.items?.ref) {
      items = { $ref: `#/$defs/${qualifiedRef(owner, field.items.ref)}` };
    } else if (field.items?.type) {
      items = fieldSchema(field.items, owner);
    }
    return { type: "array", items };
  }
  const schema = {};
  if (field.type === "enum") schema.enum = field.values;
  else schema.type = field.type;
  if (field.description) schema.description = field.description;
  if (field.format) schema.format = field.format;
  for (const key of ["minimum", "maximum", "minLength", "maxLength", "pattern"]) {
    if (field[key] !== undefined) schema[key] = field[key];
  }
  return schema;
}

export function generateJsonSchema(specs, name = null) {
  const registry = exportContractRegistry(specs, name);
  if (!registry) return null;
  const errors = validateContractRegistry(specs).filter((issue) => issue.severity === "error");
  if (errors.length) return { schema: null, diagnostics: errors };

  const all = new Map();
  for (const spec of specs) {
    for (const [entityName, entity] of Object.entries(spec.models?.entities || {})) {
      all.set(`${spec.name}.${entityName}`, { owner: spec.name, entityName, entity });
    }
  }

  const selected = new Set();
  const addEntity = (key) => {
    if (selected.has(key) || !all.has(key)) return;
    selected.add(key);
    const { owner, entity } = all.get(key);
    for (const field of Object.values(entity.fields || {})) {
      for (const ref of collectFieldRefs(field)) {
        const qualified = qualifiedRef(owner, ref);
        if (qualified) addEntity(qualified);
      }
    }
  };

  for (const key of all.keys()) {
    if (!name || key.toLowerCase().startsWith(`${name}.`.toLowerCase())) addEntity(key);
  }

  const defs = {};
  for (const key of [...selected].sort()) {
    const { owner, entityName, entity } = all.get(key);
    const properties = {};
    const required = [];
    for (const [fieldName, field] of Object.entries(entity.fields || {})) {
      properties[fieldName] = fieldSchema(field, owner);
      if (field.required) required.push(fieldName);
    }
    defs[key] = {
      type: "object",
      title: entityName,
      properties,
      additionalProperties: false,
      ...(required.length ? { required } : {}),
      ...(entity.identity ? { "x-m21-identity": entity.identity } : {}),
      ...(entity.constraints?.length ? { "x-m21-constraints": entity.constraints } : {}),
    };
  }

  return {
    schema: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: name ? `M21 model: ${name}` : "M21 project model",
      $defs: defs,
    },
    diagnostics: [],
  };
}
