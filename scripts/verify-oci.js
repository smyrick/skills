#!/usr/bin/env node
/** Smoke-test the locally packaged OCI artifact and its embedded skill contracts. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { listSkillPackages } from "./lib/skill-contract.js";
import { MODEL_INVOKED_SKILLS } from "./lib/repository-policy.js";
import { collectPackageFiles, validatePackageReferences } from "./lib/package-integrity.js";
import { TARGETS, validateTargetFiles } from "./lib/target-packages.js";
import { parseTar } from "./lib/archive.js";
import { CATALOG_PATHS, jsonBytes, marketplace, pluginDirectory, readPluginInputs, validatePluginFiles } from "./lib/plugin-packages.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outDir = path.join(repoRoot, ".dist", "oci");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function digest(buffer) {
  return `sha256:${crypto.createHash("sha256").update(buffer).digest("hex")}`;
}

function assertDescriptor(descriptor, filePath, label) {
  const content = fs.readFileSync(filePath);
  if (descriptor.size !== content.length) {
    throw new Error(`${label} size mismatch: expected ${descriptor.size}, got ${content.length}`);
  }
  const actualDigest = digest(content);
  if (descriptor.digest !== actualDigest) {
    throw new Error(`${label} digest mismatch: expected ${descriptor.digest}, got ${actualDigest}`);
  }
}

function main() {
  const paths = {
    result: path.join(outDir, "package-result.json"),
    manifest: path.join(outDir, "manifest.json"),
    archive: path.join(outDir, "skills.tar.gz"),
    index: path.join(outDir, "skills-index.json"),
    config: path.join(outDir, "config.json"),
  };
  for (const [label, filePath] of Object.entries(paths)) {
    if (!fs.existsSync(filePath)) throw new Error(`Missing ${label}: ${path.relative(repoRoot, filePath)}`);
  }

  const result = readJson(paths.result);
  const manifest = readJson(paths.manifest);
  const index = readJson(paths.index);
  assertDescriptor(result.manifest, paths.manifest, "manifest");
  assertDescriptor(result.config, paths.config, "config");
  assertDescriptor(result.layers.archive, paths.archive, "archive layer");
  assertDescriptor(result.layers.index, paths.index, "index layer");

  if (manifest.config.digest !== result.config.digest) throw new Error("Manifest config descriptor drifted");
  if (manifest.layers?.[0]?.digest !== result.layers.archive.digest) {
    throw new Error("Manifest archive descriptor drifted");
  }
  if (manifest.layers?.[1]?.digest !== result.layers.index.digest) {
    throw new Error("Manifest index descriptor drifted");
  }

  const tarEntries = parseTar(zlib.gunzipSync(fs.readFileSync(paths.archive)));
  const archivedPaths = new Set();
  for (const entry of tarEntries) {
    const normalizedName = entry.name.replace(/\/$/, "");
    if (archivedPaths.has(normalizedName)) throw new Error(`Duplicate archive path: ${normalizedName}`);
    archivedPaths.add(normalizedName);
  }

  const archivedFiles = new Map(
    tarEntries.filter((entry) => entry.type === "0").map((entry) => [entry.name, entry.content]),
  );
  const subtree = (prefix) =>
    new Map(
      [...archivedFiles]
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, bytes]) => [name.slice(prefix.length), bytes]),
    );
  const source = subtree("skills/");
  const currentSource = collectPackageFiles(path.join(repoRoot, "skills"));
  if (source.size !== currentSource.size)
    throw new Error("Archived source inventory differs from repository");
  for (const [name, bytes] of currentSource) {
    if (!source.get(name)?.equals(bytes)) throw new Error(`Archived source differs: ${name}`);
  }
  const errors = validatePackageReferences(archivedFiles);
  for (const target of TARGETS)
    errors.push(
      ...validateTargetFiles(source, subtree(`targets/${target}/skills/`), target).map(
        (error) => `${target}: ${error}`,
      ),
    );
  const pluginInputs = readPluginInputs(repoRoot);
  const modes = new Map(tarEntries.filter((entry) => entry.type === "0")
    .map((entry) => [entry.name, entry.mode]));
  const portable = new Map([...archivedFiles].filter(([name]) =>
    name === "plugin.json" || name === "LICENSE" || name.startsWith("skills/")));
  errors.push(...validatePluginFiles(pluginInputs, "portable", portable, modes));
  for (const target of TARGETS) {
    const prefix = pluginDirectory(target, pluginInputs.manifest.name) + "/";
    const pluginModes = new Map([...modes].filter(([name]) => name.startsWith(prefix))
      .map(([name, mode]) => [name.slice(prefix.length), mode]));
    errors.push(...validatePluginFiles(pluginInputs, target, subtree(prefix), pluginModes));
    if (!archivedFiles.get(CATALOG_PATHS[target])?.equals(jsonBytes(marketplace(pluginInputs, target))))
      errors.push("Archived marketplace differs: " + CATALOG_PATHS[target]);
  }
  if (errors.length) throw new Error(errors.join("\n"));

  const skills = listSkillPackages(path.join(repoRoot, "skills"));
  const indexed = new Map(index.skills?.map((skill) => [skill.name, skill]) ?? []);
  if (indexed.size !== skills.length) {
    throw new Error(`Index contains ${indexed.size} skills; repository contains ${skills.length}`);
  }
  for (const skill of skills) {
    const skillPath = `skills/${skill.name}/SKILL.md`;
    const adapterPath = `skills/${skill.name}/agents/openai.yaml`;
    if (!archivedPaths.has(skillPath)) throw new Error(`Archive is missing ${skillPath}`);
    if (!archivedPaths.has(adapterPath)) throw new Error(`Archive is missing ${adapterPath}`);
    const record = indexed.get(skill.name);
    if (!record) throw new Error(`Index is missing ${skill.name}`);
    const expectedInvocation = MODEL_INVOKED_SKILLS.has(skill.name) ? "model" : "user";
    if (record.path !== skillPath || record.openai_adapter !== adapterPath) {
      throw new Error(`Index paths are incorrect for ${skill.name}`);
    }
    for (const target of TARGETS) {
      if (record.targets?.[target] !== `targets/${target}/skills/${skill.name}/SKILL.md`)
        throw new Error(`Missing or incorrect ${target} index path for ${skill.name}`);
    }
    if (record.invocation !== expectedInvocation) {
      throw new Error(`Index invocation is incorrect for ${skill.name}`);
    }
  }

  console.log(
    `OCI smoke test passed for ${skills.length} skills, both target collections, plugin packages/catalogs, and ${tarEntries.length} archive entries.`,
  );
}

main();
