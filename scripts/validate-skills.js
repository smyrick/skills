#!/usr/bin/env node
/** Validate portable skill contracts, OpenAI adapters, links, and README synchronization. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  MODEL_INVOKED_SKILLS,
  listSkillPackages,
  validateMarkdownLinks,
  validateOpenAIDocument,
  validateSkillDocument,
} from "./lib/skill-contract.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const skillsDir = path.join(repoRoot, "skills");
const readmePath = path.join(repoRoot, "README.md");

function validatePackage(skill) {
  const errors = [];
  if (!fs.existsSync(skill.skillPath)) errors.push("SKILL.md is missing");
  else {
    errors.push(
      ...validateSkillDocument({
        content: fs.readFileSync(skill.skillPath, "utf8"),
        folderName: skill.name,
      }),
    );
    errors.push(...validateMarkdownLinks(skill.directory));
  }

  if (!fs.existsSync(skill.openaiPath)) errors.push("agents/openai.yaml is missing");
  else {
    errors.push(
      ...validateOpenAIDocument({
        content: fs.readFileSync(skill.openaiPath, "utf8"),
        skillName: skill.name,
      }),
    );
  }
  return errors;
}

function parseReadmeRows(readme) {
  const rows = new Map();
  const rowPattern = /^\| \[([^\]]+)\]\(\.\/skills\/([^/)]+)\/SKILL\.md\) \| ([^|]+) \|/gm;
  for (const match of readme.matchAll(rowPattern)) {
    rows.set(match[2], { label: match[1], invocation: match[3].trim() });
  }
  return rows;
}

function validateReadme(skills) {
  if (!fs.existsSync(readmePath)) return ["README.md is missing"];
  const readme = fs.readFileSync(readmePath, "utf8");
  const rows = parseReadmeRows(readme);
  const errors = [];
  for (const skill of skills) {
    const row = rows.get(skill.name);
    if (!row) {
      errors.push(`Skill Index is missing ./skills/${skill.name}/SKILL.md`);
      continue;
    }
    if (row.label !== skill.name) errors.push(`Skill Index label for ${skill.name} must match its folder name`);
    const expected = MODEL_INVOKED_SKILLS.has(skill.name) ? "Model" : "User";
    if (row.invocation !== expected) {
      errors.push(`Skill Index invocation for ${skill.name} must be ${expected} (got ${row.invocation})`);
    }
  }
  for (const name of rows.keys()) {
    if (!skills.some((skill) => skill.name === name)) {
      errors.push(`Skill Index references missing skill ./skills/${name}/SKILL.md`);
    }
  }
  return errors;
}

const skills = listSkillPackages(skillsDir);
if (!skills.length) {
  console.error("No skills/*/SKILL.md files found.");
  process.exit(1);
}

let errorCount = 0;
for (const skill of skills) {
  const errors = validatePackage(skill);
  if (!errors.length) console.log(`skills/${skill.name}  OK`);
  else {
    console.log(`skills/${skill.name}`);
    for (const error of errors) console.log(`  error: ${error}`);
    errorCount += errors.length;
  }
}

const readmeErrors = validateReadme(skills);
if (!readmeErrors.length) console.log("README.md  OK");
else {
  console.log("README.md");
  for (const error of readmeErrors) console.log(`  error: ${error}`);
  errorCount += readmeErrors.length;
}

console.log("");
if (errorCount) {
  console.log(`Failed: ${errorCount} error(s).`);
  process.exit(1);
}
console.log(`All ${skills.length} skill(s), adapters, links, and README entries passed.`);
