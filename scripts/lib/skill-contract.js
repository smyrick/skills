import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DESCRIPTION_MAX = 1024;
export const SHORT_DESCRIPTION_MIN = 25;
export const SHORT_DESCRIPTION_MAX = 64;
export const MODEL_INVOKED_SKILLS = new Set(["research-orchestrator"]);

const SKILL_FIELDS = ["name", "description"];
const OPENAI_TOP_LEVEL_FIELDS = ["interface", "policy"];
const OPENAI_INTERFACE_FIELDS = ["display_name", "short_description", "default_prompt"];
const OPENAI_POLICY_FIELDS = ["allow_implicit_invocation"];

function isMapping(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameKeys(value, expected) {
  if (!isMapping(value)) return false;
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === [...expected].sort()[index]);
}

function quoted(value) {
  return JSON.stringify(value);
}

export function listSkillPackages(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      directory: path.join(skillsDir, entry.name),
      skillPath: path.join(skillsDir, entry.name, "SKILL.md"),
      openaiPath: path.join(skillsDir, entry.name, "agents", "openai.yaml"),
    }))
    .filter(({ skillPath }) => fs.existsSync(skillPath))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function splitFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    throw new Error("File must start with YAML frontmatter (`---`)");
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error("Frontmatter must end with a closing `---` line");
  }

  return {
    raw: normalized.slice(4, end),
    body: normalized.slice(end + 5),
  };
}

export function parseYamlMapping(raw, label) {
  let parsed;
  try {
    parsed = YAML.parse(raw);
  } catch (error) {
    throw new Error(`${label} is invalid YAML: ${error.message}`);
  }
  if (!isMapping(parsed)) {
    throw new Error(`${label} must be a YAML mapping`);
  }
  return parsed;
}

export function parseSkillContent(content) {
  const { raw, body } = splitFrontmatter(content);
  return { metadata: parseYamlMapping(raw, "Frontmatter"), body };
}

export function parseOpenAIContent(content) {
  return parseYamlMapping(content.replace(/\r\n/g, "\n"), "agents/openai.yaml");
}

export function formatSkillContent(content) {
  const { metadata, body } = parseSkillContent(content);
  const name = typeof metadata.name === "string" ? metadata.name.trim() : metadata.name;
  const description =
    typeof metadata.description === "string" ? metadata.description.trim() : metadata.description;
  if (typeof name !== "string" || !name) throw new Error("Frontmatter `name` must be a non-empty string");
  if (typeof description !== "string" || !description) {
    throw new Error("Frontmatter `description` must be a non-empty string");
  }

  const normalizedBody = body.replace(/^\s*\n*/, "").replace(/\s*$/u, "");
  return `---\nname: ${quoted(name)}\ndescription: ${quoted(description)}\n---\n\n${normalizedBody}\n`;
}

export function formatOpenAIContent(content) {
  const doc = parseOpenAIContent(content);
  const interfaceDoc = doc.interface;
  const policy = doc.policy;
  if (!isMapping(interfaceDoc)) throw new Error("`interface` must be a mapping");
  if (!isMapping(policy)) throw new Error("`policy` must be a mapping");

  const { display_name: displayName, short_description: shortDescription, default_prompt: defaultPrompt } =
    interfaceDoc;
  const implicit = policy.allow_implicit_invocation;
  if (typeof displayName !== "string" || !displayName.trim()) {
    throw new Error("`interface.display_name` must be a non-empty string");
  }
  if (typeof shortDescription !== "string" || !shortDescription.trim()) {
    throw new Error("`interface.short_description` must be a non-empty string");
  }
  if (typeof defaultPrompt !== "string" || !defaultPrompt.trim()) {
    throw new Error("`interface.default_prompt` must be a non-empty string");
  }
  if (typeof implicit !== "boolean") {
    throw new Error("`policy.allow_implicit_invocation` must be a boolean");
  }

  return [
    "interface:",
    `  display_name: ${quoted(displayName.trim())}`,
    `  short_description: ${quoted(shortDescription.trim())}`,
    `  default_prompt: ${quoted(defaultPrompt.trim())}`,
    "policy:",
    `  allow_implicit_invocation: ${implicit}`,
    "",
  ].join("\n");
}

function requireExactFields(value, expected, label, errors) {
  if (!isMapping(value)) {
    errors.push(`${label} must be a mapping`);
    return;
  }
  for (const field of expected) {
    if (!(field in value)) errors.push(`${label} is missing \`${field}\``);
  }
  for (const field of Object.keys(value)) {
    if (!expected.includes(field)) errors.push(`${label} contains unsupported field \`${field}\``);
  }
}

function requireNonEmptyString(value, label, errors) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} must be a non-empty string`);
    return null;
  }
  return value.trim();
}

export function validateSkillDocument({ content, folderName }) {
  const errors = [];
  let parsed;
  try {
    parsed = parseSkillContent(content);
  } catch (error) {
    return [error.message];
  }

  const { metadata, body } = parsed;
  requireExactFields(metadata, SKILL_FIELDS, "Frontmatter", errors);
  const name = requireNonEmptyString(metadata.name, "Frontmatter `name`", errors);
  const description = requireNonEmptyString(metadata.description, "Frontmatter `description`", errors);

  if (name) {
    if (name.length > 64) errors.push(`Frontmatter \`name\` must be at most 64 characters (got ${name.length})`);
    if (!NAME_RE.test(name)) errors.push("Frontmatter `name` must use lowercase kebab-case");
    if (name !== folderName) errors.push(`Frontmatter \`name\` "${name}" must match folder "${folderName}"`);
  }
  if (description && description.length > DESCRIPTION_MAX) {
    errors.push(
      `Frontmatter \`description\` must be at most ${DESCRIPTION_MAX} characters (got ${description.length})`,
    );
  }
  if (!body.trim()) errors.push("Skill body must not be empty");
  return errors;
}

export function validateOpenAIDocument({ content, skillName }) {
  const errors = [];
  let doc;
  try {
    doc = parseOpenAIContent(content);
  } catch (error) {
    return [error.message];
  }

  requireExactFields(doc, OPENAI_TOP_LEVEL_FIELDS, "agents/openai.yaml", errors);
  requireExactFields(doc.interface, OPENAI_INTERFACE_FIELDS, "`interface`", errors);
  requireExactFields(doc.policy, OPENAI_POLICY_FIELDS, "`policy`", errors);
  if (!isMapping(doc.interface) || !isMapping(doc.policy)) return errors;

  requireNonEmptyString(doc.interface.display_name, "`interface.display_name`", errors);
  const shortDescription = requireNonEmptyString(
    doc.interface.short_description,
    "`interface.short_description`",
    errors,
  );
  const defaultPrompt = requireNonEmptyString(doc.interface.default_prompt, "`interface.default_prompt`", errors);

  if (
    shortDescription &&
    (shortDescription.length < SHORT_DESCRIPTION_MIN || shortDescription.length > SHORT_DESCRIPTION_MAX)
  ) {
    errors.push(
      `\`interface.short_description\` must be ${SHORT_DESCRIPTION_MIN}–${SHORT_DESCRIPTION_MAX} characters (got ${shortDescription.length})`,
    );
  }
  if (defaultPrompt && !defaultPrompt.includes(`$${skillName}`)) {
    errors.push(`\`interface.default_prompt\` must include \`$${skillName}\``);
  }

  const implicit = doc.policy.allow_implicit_invocation;
  if (typeof implicit !== "boolean") {
    errors.push("`policy.allow_implicit_invocation` must be an explicit boolean");
  } else {
    const expected = MODEL_INVOKED_SKILLS.has(skillName);
    if (implicit !== expected) {
      errors.push(
        `\`policy.allow_implicit_invocation\` must be ${expected} for ${skillName}'s recorded invocation mode`,
      );
    }
  }

  return errors;
}

function markdownFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(absolute);
  }
  return files;
}

export function validateMarkdownLinks(skillDirectory) {
  const errors = [];
  for (const filePath of markdownFiles(skillDirectory)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const match of content.matchAll(/\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+['"][^'"]*['"])?\)/g)) {
      let target = match[1];
      if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
      if (/^(?:https?:|mailto:|data:|#)/i.test(target)) continue;
      target = target.split("#", 1)[0];
      if (!target) continue;
      let decoded;
      try {
        decoded = decodeURIComponent(target);
      } catch {
        errors.push(`${path.relative(skillDirectory, filePath)} has an invalid encoded link: ${target}`);
        continue;
      }
      const resolved = path.resolve(path.dirname(filePath), decoded);
      if (!fs.existsSync(resolved)) {
        errors.push(`${path.relative(skillDirectory, filePath)} links to missing path: ${target}`);
      }
    }
  }
  return errors;
}

export function hasExactSkillFields(metadata) {
  return sameKeys(metadata, SKILL_FIELDS);
}
