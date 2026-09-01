/** Generate installable skill collections without rewriting the portable source. */
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { collectPackageFiles, validatePackageReferences } from "./package-integrity.js";
import {
  parseSkillContent,
  serializeSkill,
  validateSkillDocument,
  listSkillPackages,
} from "./skill-contract.js";
import { parseOpenAIContent, validateOpenAIDocument } from "./openai-contract.js";
import { validateClaudeDocument } from "./claude-contract.js";
import { invocationForSkill } from "./repository-policy.js";

export const TARGETS = ["openai", "claude"];

export function buildTargetFiles(source, target) {
  if (!TARGETS.includes(target)) throw new Error(`Unknown target: ${target}`);
  const files = new Map();
  for (const [name, bytes] of source) {
    if (target === "claude" && name.endsWith("/agents/openai.yaml")) {
      const adapter = parseOpenAIContent(bytes.toString("utf8"));
      if (adapter.dependencies?.tools?.length)
        throw new Error(
          `${name}: Claude dependency mapping is not implemented; cannot discard required MCP dependencies`,
        );
      continue;
    }
    if (target === "claude" && /^[^/]+\/SKILL\.md$/.test(name)) {
      const { metadata, body } = parseSkillContent(bytes.toString("utf8"));
      const skillName = name.split("/")[0];
      const invalid = validateSkillDocument({ content: bytes.toString("utf8"), folderName: skillName });
      if (invalid.length) throw new Error(`${name}: ${invalid.join("; ")}`);
      if (metadata["allowed-tools"] !== undefined)
        throw new Error(`${name}: tool approval declarations require an explicit target mapping`);
      files.set(
        name,
        Buffer.from(
          serializeSkill(
            {
              ...metadata,
              "disable-model-invocation": invocationForSkill(skillName) === "user",
              "user-invocable": true,
            },
            body,
          ),
        ),
      );
    } else files.set(name, bytes);
  }
  return files;
}

export function validateTargetFiles(source, files, target) {
  if (!TARGETS.includes(target)) return [`Unknown target: ${target}`];
  const errors = validatePackageReferences(files);
  if (target === "claude") {
    for (const [name, bytes] of source) {
      if (!name.endsWith("/agents/openai.yaml")) continue;
      try {
        if (parseOpenAIContent(bytes.toString("utf8")).dependencies?.tools?.length) {
          errors.push(`${name}: Claude dependency mapping is not implemented`);
        }
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
      }
    }
  }
  const expectedNames = new Set(
    [...source.keys()].filter((name) => !(target === "claude" && name.endsWith("/agents/openai.yaml"))),
  );
  for (const name of expectedNames) if (!files.has(name)) errors.push(`Missing target file: ${name}`);
  for (const name of files.keys())
    if (!expectedNames.has(name)) errors.push(`Unexpected target file: ${name}`);
  for (const [name, bytes] of files) {
    const original = source.get(name);
    if (!original) continue;
    if (/^[^/]+\/SKILL\.md$/.test(name)) {
      const skillName = name.split("/")[0];
      const content = bytes.toString("utf8");
      errors.push(
        ...(target === "claude" ? validateClaudeDocument : validateSkillDocument)({
          content,
          folderName: skillName,
        }).map((error) => `${name}: ${error}`),
      );
      try {
        const actual = parseSkillContent(content);
        const portable = parseSkillContent(original.toString("utf8"));
        if (target === "claude") {
          if (actual.metadata["disable-model-invocation"] !== (invocationForSkill(skillName) === "user"))
            errors.push(`${name}: Claude invocation policy drift`);
          if (actual.metadata["user-invocable"] !== true)
            errors.push(`${name}: Claude explicit invocation must remain enabled`);
          delete actual.metadata["disable-model-invocation"];
          delete actual.metadata["user-invocable"];
        } else {
          const adapter = files.get(`${skillName}/agents/openai.yaml`);
          if (!adapter) errors.push(`${name}: missing OpenAI adapter`);
          else {
            const text = adapter.toString("utf8");
            errors.push(
              ...validateOpenAIDocument({ content: text }).map((error) => `${skillName}: ${error}`),
            );
            if (
              parseOpenAIContent(text).policy?.allow_implicit_invocation !==
              (invocationForSkill(skillName) === "model")
            )
              errors.push(`${name}: OpenAI invocation policy drift`);
          }
        }
        if (!isDeepStrictEqual(actual, portable))
          errors.push(`${name}: portable metadata or instruction body changed during packaging`);
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
      }
    } else if (!bytes.equals(original)) errors.push(`${name}: supporting resource changed during packaging`);
  }
  return errors;
}

export function buildTargets(repoRoot) {
  const skillsDir = path.join(repoRoot, "skills");
  const skills = listSkillPackages(skillsDir);
  if (!skills.length) throw new Error("No skill packages found");
  for (const skill of skills) {
    if (!fs.existsSync(skill.skillPath)) throw new Error(`Missing SKILL.md for ${skill.name}`);
  }
  const source = collectPackageFiles(skillsDir);
  // These generated directories are the only destinations this builder can replace.
  const outRoot = path.join(repoRoot, ".dist", "targets");
  if (
    fs.existsSync(path.join(repoRoot, ".dist")) &&
    fs.lstatSync(path.join(repoRoot, ".dist")).isSymbolicLink()
  )
    throw new Error("Refusing a symlinked .dist directory");
  if (fs.existsSync(outRoot) && fs.lstatSync(outRoot).isSymbolicLink())
    throw new Error("Refusing a symlinked target directory");
  for (const target of TARGETS) {
    const files = buildTargetFiles(source, target);
    const errors = validateTargetFiles(source, files, target);
    if (errors.length) throw new Error(`${target}: ${errors.join("\n")}`);
    const root = path.join(outRoot, target);
    fs.rmSync(root, { recursive: true, force: true });
    for (const [name, bytes] of files) {
      const dest = path.join(root, "skills", name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, bytes);
      fs.chmodSync(dest, fs.statSync(path.join(repoRoot, "skills", name)).mode & 0o777);
    }
    for (const name of ["LICENSE"]) {
      if (fs.existsSync(path.join(repoRoot, name)))
        fs.copyFileSync(path.join(repoRoot, name), path.join(root, name));
    }
  }
  return outRoot;
}
