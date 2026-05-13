#!/usr/bin/env node
/**
 * Validates each skills/<name>/SKILL.md in this repository.
 * The published skills CLI does not yet ship validate; this script mirrors common metadata rules.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const skillsDir = path.join(repoRoot, "skills");
const readmePath = path.join(repoRoot, "README.md");

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const URL_RE = /^https?:\/\/\S+$/;
const DESC_MIN = 20;
const DESC_MAX = 500;
const REQUIRED_STRING_FIELDS = ["name", "description", "author", "license", "repository", "compatibility"];

function listSkillFiles() {
  if (!fs.existsSync(skillsDir)) {
    console.error("No skills/ directory found.");
    process.exit(1);
  }
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = path.join(skillsDir, e.name, "SKILL.md");
    if (fs.existsSync(p)) files.push(p);
  }
  return files.sort();
}

function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) {
    return { error: "File must start with YAML frontmatter (---)" };
  }
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    return { error: "Missing closing --- for frontmatter" };
  }
  const raw = content.slice(4, end);
  try {
    const doc = YAML.parse(raw);
    if (doc === null || typeof doc !== "object" || Array.isArray(doc)) {
      return { error: "Frontmatter must parse to a YAML mapping" };
    }
    return { doc, rest: content.slice(end + 5) };
  } catch (err) {
    return { error: `Invalid YAML: ${err.message}` };
  }
}

function validateStringField(doc, field, errors) {
  if (typeof doc[field] !== "string" || !doc[field].trim()) {
    errors.push(`Missing or invalid \`${field}\` (non-empty string required)`);
  }
}

function checkSkill(filePath) {
  const rel = path.relative(repoRoot, filePath);
  const errors = [];

  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return { rel, errors: [`Cannot read file: ${e.message}`] };
  }

  const parsed = parseFrontmatter(content);
  if (parsed.error) {
    errors.push(parsed.error);
    return { rel, errors };
  }

  const { doc } = parsed;
  for (const field of REQUIRED_STRING_FIELDS) {
    validateStringField(doc, field, errors);
  }

  const name = doc.name;
  if (typeof name === "string" && name.trim()) {
    if (name.length < 1 || name.length > 64) {
      errors.push(`\`name\` length must be 1–64 (got ${name.length})`);
    }
    if (!NAME_RE.test(name)) {
      errors.push("`name` must be kebab-case (lowercase letters, digits, single hyphens)");
    }
    const folder = path.basename(path.dirname(filePath));
    if (name !== folder) {
      errors.push(`\`name\` "${name}" must match folder name "${folder}"`);
    }
  }

  let desc = doc.description;
  if (desc != null && typeof desc !== "string") {
    desc = String(desc);
  }
  if (typeof desc !== "string" || !desc.trim()) {
    errors.push("Missing or invalid `description` (non-empty string required)");
  } else {
    const t = desc.trim();
    if (t.length < DESC_MIN || t.length > DESC_MAX) {
      errors.push(`\`description\` length must be ${DESC_MIN}–${DESC_MAX} characters (got ${t.length})`);
    }
  }

  if (typeof doc.repository === "string" && !URL_RE.test(doc.repository.trim())) {
    errors.push("`repository` must be a plain http(s) URL string");
  }

  return { rel, errors };
}

function readSkillIndexLinks() {
  if (!fs.existsSync(readmePath)) {
    return { errors: ["README.md is missing"], links: new Set() };
  }

  const readme = fs.readFileSync(readmePath, "utf8");
  const links = new Set(
    [...readme.matchAll(/\]\(\.\/skills\/([^/)]+)\/SKILL\.md\)/g)].map((match) => match[1]),
  );
  return { errors: [], links };
}

function checkReadmeIndex(skillFiles) {
  const errors = [];
  const folders = skillFiles.map((filePath) => path.basename(path.dirname(filePath)));
  const { errors: readmeErrors, links } = readSkillIndexLinks();
  errors.push(...readmeErrors);
  if (readmeErrors.length > 0) return { rel: "README.md", errors };

  for (const folder of folders) {
    if (!links.has(folder)) {
      errors.push(`Skill index is missing ./skills/${folder}/SKILL.md`);
    }
  }
  for (const link of links) {
    if (!folders.includes(link)) {
      errors.push(`Skill index references missing skill ./skills/${link}/SKILL.md`);
    }
  }

  return { rel: "README.md", errors };
}

function main() {
  const files = listSkillFiles();
  if (files.length === 0) {
    console.error("No skills/*/SKILL.md files found.");
    process.exit(1);
  }

  let errorCount = 0;

  for (const result of [...files.map(checkSkill), checkReadmeIndex(files)]) {
    const { rel, errors } = result;
    const parts = [];
    if (errors.length) {
      errorCount += errors.length;
      parts.push(...errors.map((m) => `  error: ${m}`));
    }
    if (parts.length) {
      console.log(`${rel}`);
      console.log(parts.join("\n"));
    } else {
      console.log(`${rel}  OK`);
    }
  }

  console.log("");
  if (errorCount > 0) {
    console.log(`Failed: ${errorCount} error(s).`);
    process.exit(1);
  }
  console.log(`All ${files.length} skill(s) and README index passed.`);
}

main();
