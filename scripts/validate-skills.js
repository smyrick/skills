#!/usr/bin/env node
/** Separate static gates. No static gate claims live harness behavior was tested. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listSkillPackages } from "./lib/skill-contract.js";
import { validateSkillDirectories } from "./lib/skills-ref.js";
import { validateOpenAIDocument } from "./lib/openai-contract.js";
import { validateClaudeDocument } from "./lib/claude-contract.js";
import { validateReadme, validateRepositorySkill } from "./lib/repository-policy.js";
import { collectPackageFiles, validatePackageReferences } from "./lib/package-integrity.js";
import { buildTargetFiles, validateTargetFiles, TARGETS } from "./lib/target-packages.js";
import { findPluginManifests, checkPlugin } from "./lib/plugin-contract.js";
import { checkGeneratedPlugins } from "./lib/plugin-packages.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skills = listSkillPackages(path.join(root, "skills"));
const groups = ["skills", "openai", "claude", "policy", "package", "parity", "plugins"];
const requested = process.argv.slice(2);
if (requested.some((group) => !groups.includes(group))) {
  console.error(`Unknown check. Choose: ${groups.join(", ")}`);
  process.exit(1);
}
let failures = 0;
const read = (file) => fs.readFileSync(file, "utf8");
for (const group of requested.length ? requested : groups) {
  const errors = [];
  try {
    if (!skills.length) throw new Error("No skill packages found");
    if (group === "skills") {
      const results = validateSkillDirectories(skills.map((skill) => skill.directory));
      for (const [index, result] of results.entries()) {
        errors.push(...result.map((error) => `${skills[index].name}: ${error}`));
      }
    }
    if (["openai", "policy"].includes(group)) {
      for (const skill of skills) {
        try {
          let result;
          if (group === "openai")
            result = fs.existsSync(skill.openaiPath)
              ? validateOpenAIDocument({ content: read(skill.openaiPath) })
              : [];
          if (group === "policy")
            result = validateRepositorySkill({
              content: read(skill.skillPath),
              adapterContent: read(skill.openaiPath),
              skillName: skill.name,
            });
          errors.push(...result.map((error) => `${skill.name}: ${error}`));
        } catch (error) {
          errors.push(`${skill.name}: ${error.message}`);
        }
      }
      if (group === "policy")
        errors.push(
          ...validateReadme(
            read(path.join(root, "README.md")),
            skills.map((skill) => skill.name),
          ),
        );
    }
    if (["claude", "package", "parity"].includes(group)) {
      const source = collectPackageFiles(path.join(root, "skills"));
      if (group === "claude") {
        for (const [name, bytes] of buildTargetFiles(source, "claude")) {
          if (/^[^/]+\/SKILL\.md$/.test(name))
            errors.push(
              ...validateClaudeDocument({
                content: bytes.toString("utf8"),
                folderName: name.split("/")[0],
              }).map((error) => `${name}: ${error}`),
            );
        }
      }
      if (group === "package") errors.push(...validatePackageReferences(source));
      if (group === "parity")
        for (const target of TARGETS)
          errors.push(
            ...validateTargetFiles(source, buildTargetFiles(source, target), target).map(
              (error) => `${target}: ${error}`,
            ),
          );
    }
    if (group === "plugins") {
      errors.push(...checkGeneratedPlugins(root));
      const manifests = findPluginManifests(root);
      for (const entry of manifests)
        errors.push(...checkPlugin(entry).map((error) => `${path.relative(root, entry.path)}: ${error}`));
    }
  } catch (error) {
    errors.push(error.message);
  }
  console.log(
    `[${group}] ${errors.length ? "FAIL" : "PASS"}`,
  );
  for (const error of errors) console.error(`  ${error}`);
  failures += errors.length;
}
console.log(
  "[runtime] NOT RUN — live discovery, invocation, and execution require client/version-specific tests",
);
if (failures) process.exitCode = 1;
