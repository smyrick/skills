/** YAML formatting/parsing helpers. Core validation is delegated to skills-ref. */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { isMapping } from "./validation.js";
export { validateSkillDocument } from "./skills-ref.js";

// Fields projected from generated Claude documents for shared-core validation.
export const SKILL_FIELDS = ["name", "description", "license", "compatibility", "metadata", "allowed-tools"];

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
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function splitFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) throw new Error("File must start with YAML frontmatter (`---`)");
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) throw new Error("Frontmatter must end with a closing `---` line");
  return { raw: normalized.slice(4, end), body: normalized.slice(end + 5) };
}

export function parseYamlMapping(raw, label = "YAML") {
  const parsed = YAML.parse(raw);
  if (!isMapping(parsed)) throw new Error(`${label} must be a YAML mapping`);
  return parsed;
}

export function parseSkillContent(content) {
  const { raw, body } = splitFrontmatter(content);
  return { metadata: parseYamlMapping(raw, "Frontmatter"), body };
}

/** Formatting changes presentation only, including for unknown fields. Validation reports them. */
export function formatYamlMapping(raw) {
  parseYamlMapping(raw);
  const doc = YAML.parseDocument(raw);
  if (doc.errors.length) throw doc.errors[0];
  return doc.toString({ lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" });
}

export function formatSkillContent(content) {
  const { raw, body } = splitFrontmatter(content);
  return `---\n${formatYamlMapping(raw)}---\n${body}`;
}

export function serializeSkill(metadata, body) {
  const raw = YAML.stringify(metadata, {
    lineWidth: 0,
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
  });
  return `---\n${raw}---\n${body}`;
}
