#!/usr/bin/env node
/** Smoke-test the locally packaged OCI artifact and its embedded skill contracts. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { MODEL_INVOKED_SKILLS, listSkillPackages } from "./lib/skill-contract.js";

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

function parseOctal(buffer, start, length) {
  const raw = buffer.subarray(start, start + length).toString("ascii").replace(/\0.*$/s, "").trim();
  return raw ? Number.parseInt(raw, 8) : 0;
}

function parseTar(buffer) {
  const entries = [];
  for (let offset = 0; offset + 512 <= buffer.length; ) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/s, "");
    const size = parseOctal(header, 124, 12);
    const type = header.subarray(156, 157).toString("ascii") || "0";
    const linkname = header.subarray(157, 257).toString("utf8").replace(/\0.*$/s, "");
    entries.push({ name, type, linkname });
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}

function assertSafeTarPath(value, label) {
  const normalized = path.posix.normalize(value);
  if (!value || value.startsWith("/") || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`Unsafe ${label} in archive: ${value}`);
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
    assertSafeTarPath(entry.name, "path");
    archivedPaths.add(entry.name.replace(/\/$/, ""));
    if (entry.type === "2") assertSafeTarPath(entry.linkname, "symlink target");
  }

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
    if (record.invocation !== expectedInvocation) {
      throw new Error(`Index invocation is incorrect for ${skill.name}`);
    }
  }

  console.log(`OCI smoke test passed for ${skills.length} skills and ${tarEntries.length} archive entries.`);
}

main();
