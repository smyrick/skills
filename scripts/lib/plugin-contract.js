/** Conditional manifest checks. Complex components fail as uncovered, never silently pass. */
import fs from "node:fs";
import path from "node:path";
import { fields, string, stringList } from "./validation.js";
import {
  collectPackageFiles,
  validateLocalReference,
  validatePackageReferences,
} from "./package-integrity.js";
import { parseSkillContent, validateSkillDocument } from "./skill-contract.js";
import { validateClaudeDocument } from "./claude-contract.js";

const COMMON = [
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "license",
  "keywords",
  "skills",
];
const OPENAI = ["interface", "apps", "mcpServers", "hooks"];
const CLAUDE = [
  "commands",
  "agents",
  "workflows",
  "hooks",
  "mcpServers",
  "outputStyles",
  "lspServers",
  "userConfig",
  "channels",
  "dependencies",
  "experimental",
  "enabledByDefault",
];

function normalizedPluginPath(value) {
  const normalized = path.posix.normalize(value).replace(/\/$/, "");
  if (normalized === "" || normalized === ".") return ".";
  return normalized.replace(/^\.\//, "");
}

function rootSkillFolderName(content) {
  try {
    const name = parseSkillContent(content).metadata.name;
    // Claude uses a root skill's frontmatter name for invocation. Passing that
    // name to skills-ref avoids imposing the install-directory basename instead.
    if (typeof name === "string" && name && !name.includes("/") && !name.includes("\\")) return name;
  } catch {
    // The document validator below reports malformed frontmatter precisely.
  }
  return "plugin-root";
}

export function validatePluginManifest({ manifest, target, files }) {
  const errors = [];
  if (!["openai", "claude"].includes(target)) return [`Unknown plugin target: ${target}`];
  if (
    !fields(
      manifest,
      [...COMMON, ...(target === "openai" ? OPENAI : CLAUDE)],
      `${target} plugin manifest`,
      errors,
      ["name"],
    )
  )
    return errors;
  for (const key of ["name", "version", "description", "homepage", "repository", "license"])
    string(manifest[key], key, errors, { required: key === "name" });
  if (manifest.keywords !== undefined) stringList(manifest.keywords, "keywords", errors);
  if (
    manifest.author !== undefined &&
    fields(manifest.author, ["name", "email", "url"], "author", errors, ["name"])
  ) {
    for (const key of ["name", "email", "url"])
      string(manifest.author[key], `author.${key}`, errors, { required: key === "name" });
  }
  if (target === "openai" && manifest.interface !== undefined) {
    const keys = [
      "displayName",
      "shortDescription",
      "longDescription",
      "developerName",
      "category",
      "capabilities",
      "websiteURL",
      "privacyPolicyURL",
      "termsOfServiceURL",
      "defaultPrompt",
      "brandColor",
      "composerIcon",
      "logo",
      "screenshots",
    ];
    if (fields(manifest.interface, keys, "interface", errors)) {
      for (const key of keys) {
        const value = manifest.interface[key];
        if (value === undefined) continue;
        if (["capabilities", "screenshots"].includes(key)) stringList(value, `interface.${key}`, errors);
        else string(value, `interface.${key}`, errors);
      }
      for (const value of [
        manifest.interface.composerIcon,
        manifest.interface.logo,
        ...(Array.isArray(manifest.interface.screenshots) ? manifest.interface.screenshots : []),
      ]) {
        if (typeof value === "string") {
          const error = validateLocalReference(files, "plugin.json", value);
          if (error) errors.push(error);
        }
      }
    }
  }
  // This repo currently produces skill collections, not runtime components. Do not
  // claim to validate a hook or MCP server by merely parsing its outer JSON object.
  const complex = target === "openai" ? OPENAI.filter((key) => key !== "interface") : CLAUDE;
  for (const key of complex)
    if (manifest[key] !== undefined)
      errors.push(
        `${target} plugin ${key}: coverage unavailable; add a component validator before shipping this feature`,
      );
  for (const name of [
    ".mcp.json",
    ".app.json",
    "hooks/hooks.json",
    "hooks.json",
    "settings.json",
    ".lsp.json",
  ]) {
    if (files.has(name)) errors.push(`${name}: runtime component validation is not implemented`);
  }
  for (const prefix of ["agents/", "commands/", "workflows/", "output-styles/"]) {
    if ([...files.keys()].some((name) => name.startsWith(prefix)))
      errors.push(`${prefix}: runtime component validation is not implemented`);
  }
  const skillPaths =
    manifest.skills === undefined ? [] : Array.isArray(manifest.skills) ? manifest.skills : [manifest.skills];
  if (target === "openai" && Array.isArray(manifest.skills))
    errors.push("OpenAI skills arrays are outside this manifest profile; use a single directory");
  for (const value of skillPaths) {
    if (typeof value !== "string" || !value.startsWith("./")) {
      errors.push("Plugin skill paths must start with ./");
      continue;
    }
    const directory = normalizedPluginPath(value);
    if (directory !== ".") {
      const error = validateLocalReference(files, "plugin.json", value);
      if (error) errors.push(error);
    }
    const prefix = directory === "." ? "" : `${directory}/`;
    const directSkill = directory === "." ? "SKILL.md" : `${directory}/SKILL.md`;
    const hasDirectClaudeSkill = target === "claude" && files.has(directSkill);
    const hasNestedSkill = [...files.keys()].some(
      (name) => name.startsWith(prefix) && name !== directSkill && name.endsWith("/SKILL.md"),
    );
    if (!hasDirectClaudeSkill && !hasNestedSkill)
      errors.push(`No skills found in declared directory ${value}`);
  }
  const hasDefaultClaudeSkills = [...files.keys()].some((name) => name.startsWith("skills/"));
  const hasDeclaredRootSkill = skillPaths.some(
    (value) => typeof value === "string" && value.startsWith("./") && normalizedPluginPath(value) === ".",
  );
  const rootSkillEnabled =
    target === "claude" &&
    files.has("SKILL.md") &&
    (hasDeclaredRootSkill || (manifest.skills === undefined && !hasDefaultClaudeSkills));
  for (const [name, bytes] of files) {
    const isRootSkill = name === "SKILL.md";
    if ((!isRootSkill && !name.endsWith("/SKILL.md")) || (isRootSkill && !rootSkillEnabled)) continue;
    const validate = target === "claude" ? validateClaudeDocument : validateSkillDocument;
    const content = bytes.toString("utf8");
    errors.push(
      ...validate({
        content,
        folderName: isRootSkill ? rootSkillFolderName(content) : path.posix.basename(path.posix.dirname(name)),
      }).map((error) => `${name}: ${error}`),
    );
  }
  errors.push(...validatePackageReferences(files));
  return errors;
}

export function findPluginManifests(root) {
  const result = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (
        !entry.isDirectory() ||
        [".git", "node_modules", ".dist", ".venv", "__pycache__"].includes(entry.name)
      )
        continue;
      if ([".codex-plugin", ".claude-plugin"].includes(entry.name)) {
        result.push({
          root: dir,
          path: path.join(dir, entry.name, "plugin.json"),
          target: entry.name === ".codex-plugin" ? "openai" : "claude",
        });
      } else visit(path.join(dir, entry.name));
    }
  }
  visit(root);
  return result;
}

export function checkPlugin(entry) {
  try {
    return validatePluginManifest({
      manifest: JSON.parse(fs.readFileSync(entry.path, "utf8")),
      target: entry.target,
      files: collectPackageFiles(entry.root),
    });
  } catch (error) {
    return [error.message];
  }
}
