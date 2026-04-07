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

const strict = process.argv.includes("--strict");
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DESC_MIN = 20;
const DESC_MAX = 500;

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

function checkSkill(filePath) {
  const rel = path.relative(repoRoot, filePath);
  const errors = [];
  const warnings = [];

  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return { rel, errors: [`Cannot read file: ${e.message}`], warnings };
  }

  const parsed = parseFrontmatter(content);
  if (parsed.error) {
    errors.push(parsed.error);
    return { rel, errors, warnings };
  }

  const { doc } = parsed;
  const name = doc.name;
  if (typeof name !== "string" || !name.trim()) {
    errors.push("Missing or invalid `name` (non-empty string required)");
  } else {
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

  const compat = doc.compatibility;
  if (typeof compat !== "string" || !compat.trim()) {
    errors.push("Missing or invalid `compatibility` (non-empty string required)");
  }

  if (strict) {
    if (typeof doc.author !== "string" || !doc.author.trim()) {
      warnings.push("Missing recommended `author` (non-empty string)");
    }
    if (typeof doc.license !== "string" || !doc.license.trim()) {
      warnings.push("Missing recommended `license` (e.g. SPDX id: MIT)");
    }
    if (doc.repository != null && typeof doc.repository !== "string") {
      warnings.push("`repository` should be a string URL if set");
    }
  }

  return { rel, errors, warnings };
}

function main() {
  const files = listSkillFiles();
  if (files.length === 0) {
    console.error("No skills/*/SKILL.md files found.");
    process.exit(1);
  }

  let errorCount = 0;
  let warnCount = 0;

  for (const file of files) {
    const { rel, errors, warnings } = checkSkill(file);
    const parts = [];
    if (errors.length) {
      errorCount += errors.length;
      parts.push(...errors.map((m) => `  error: ${m}`));
    }
    if (strict && warnings.length) {
      warnCount += warnings.length;
      parts.push(...warnings.map((m) => `  warning: ${m}`));
    }
    if (parts.length) {
      console.log(`${rel}`);
      console.log(parts.join("\n"));
    } else {
      console.log(`${rel}  OK`);
    }
  }

  console.log("");
  if (strict && warnCount > 0) {
    console.log(`Strict mode: ${warnCount} warning(s) treated as failure.`);
    process.exit(1);
  }
  if (errorCount > 0) {
    console.log(`Failed: ${errorCount} error(s).`);
    process.exit(1);
  }
  console.log(`All ${files.length} skill(s) passed.`);
}

main();
