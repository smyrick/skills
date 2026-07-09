#!/usr/bin/env node
/** Normalize portable skill frontmatter and OpenAI adapter metadata. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  formatOpenAIContent,
  formatSkillContent,
  listSkillPackages,
} from "./lib/skill-contract.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const skillsDir = path.join(repoRoot, "skills");
const check = process.argv.includes("--check");
const changed = [];
const errors = [];

function formatFile(filePath, formatter) {
  const relative = path.relative(repoRoot, filePath);
  if (!fs.existsSync(filePath)) {
    errors.push(`${relative}: missing required file`);
    return;
  }
  const current = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let formatted;
  try {
    formatted = formatter(current);
  } catch (error) {
    errors.push(`${relative}: ${error.message}`);
    return;
  }
  if (formatted === current) return;
  changed.push(relative);
  if (!check) fs.writeFileSync(filePath, formatted);
}

for (const skill of listSkillPackages(skillsDir)) {
  formatFile(skill.skillPath, formatSkillContent);
  formatFile(skill.openaiPath, formatOpenAIContent);
}

if (errors.length) {
  console.error("Formatting failed:");
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

if (changed.length) {
  console.log(`${check ? "Needs formatting" : "Formatted"}:`);
  for (const file of changed) console.log(`  ${file}`);
  if (check) process.exit(1);
} else {
  console.log("All skill and OpenAI adapter files are formatted.");
}
