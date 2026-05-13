#!/usr/bin/env node
/**
 * Normalizes skills/<name>/SKILL.md frontmatter without reflowing Markdown bodies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const skillsDir = path.join(repoRoot, "skills");

const check = process.argv.includes("--check");
const FIELD_ORDER = ["name", "description", "author", "license", "repository", "compatibility"];
const DEFAULTS = {
  author: "Shane Myrick",
  license: "MIT",
  repository: "https://github.com/smyrick/skills",
  compatibility: "No external MCPs required.",
};

function listSkillFiles() {
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsDir, entry.name, "SKILL.md"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort();
}

function splitFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { raw: "", body: normalized };
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end !== -1) {
    return {
      raw: normalized.slice(4, end),
      body: normalized.slice(end + 5),
    };
  }

  const lines = normalized.split("\n");
  const bodyStart = lines.findIndex((line, index) => index > 0 && /^#\s+/.test(line));
  if (bodyStart === -1) {
    return { raw: lines.slice(1).join("\n"), body: "" };
  }

  return {
    raw: lines.slice(1, bodyStart).join("\n"),
    body: `${lines.slice(bodyStart).join("\n")}`,
  };
}

function cleanRawFrontmatter(raw) {
  return raw
    .replace(/^##\s+([A-Za-z][A-Za-z0-9_-]*):/gm, "$1:")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$2");
}

function parseFrontmatter(raw) {
  const cleaned = cleanRawFrontmatter(raw);
  const parsed = YAML.parse(cleaned);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed;
}

function cleanRepository(value) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
  return match ? match[2] : value;
}

function orderedMetadata(doc, folderName) {
  const normalized = { ...doc };
  normalized.name = folderName;
  normalized.repository = cleanRepository(normalized.repository);

  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (typeof normalized[key] !== "string" || !normalized[key].trim()) {
      normalized[key] = value;
    }
  }

  const ordered = {};
  for (const key of FIELD_ORDER) {
    if (normalized[key] != null) ordered[key] = normalized[key];
  }
  for (const [key, value] of Object.entries(normalized)) {
    if (!FIELD_ORDER.includes(key)) ordered[key] = value;
  }
  return ordered;
}

function stringifyMetadata(doc) {
  const yaml = YAML.stringify(doc, {
    blockQuote: "literal",
    lineWidth: 100,
    singleQuote: false,
  }).trimEnd();
  return `---\n${yaml}\n---\n\n`;
}

function normalizeBody(body) {
  return `${body.replace(/^\s*\n*/, "").replace(/\s*$/g, "")}\n`;
}

function formatSkill(filePath) {
  const folderName = path.basename(path.dirname(filePath));
  const content = fs.readFileSync(filePath, "utf8");
  const { raw, body } = splitFrontmatter(content);
  const doc = parseFrontmatter(raw);
  return `${stringifyMetadata(orderedMetadata(doc, folderName))}${normalizeBody(body)}`;
}

const changed = [];
for (const filePath of listSkillFiles()) {
  const formatted = formatSkill(filePath);
  const current = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  if (formatted !== current) {
    changed.push(path.relative(repoRoot, filePath));
    if (!check) fs.writeFileSync(filePath, formatted);
  }
}

if (changed.length > 0) {
  console.log(`${check ? "Needs formatting" : "Formatted"}:`);
  for (const file of changed) console.log(`  ${file}`);
  if (check) process.exit(1);
} else {
  console.log("All skill files are formatted.");
}
