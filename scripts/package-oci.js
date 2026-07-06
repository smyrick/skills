#!/usr/bin/env node
/**
 * Builds a deterministic OCI artifact payload for this skills collection.
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import YAML from "yaml";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outDir = path.join(repoRoot, ".dist", "oci");
const skillsDir = path.join(repoRoot, "skills");

const IMAGE_MEDIA_TYPE = "application/vnd.oci.image.manifest.v1+json";
const ARTIFACT_TYPE = "application/vnd.smyrick.skills.collection.v1+tar";
const EMPTY_MEDIA_TYPE = "application/vnd.oci.empty.v1+json";
const ARCHIVE_MEDIA_TYPE = "application/vnd.smyrick.skills.archive.v1.tar+gzip";
const INDEX_MEDIA_TYPE = "application/vnd.smyrick.skills.index.v1+json";
const EMPTY_JSON = Buffer.from("{}");

function comparePath(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function runGit(args, fallback = "") {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) return fallback;
  return result.stdout.trim() || fallback;
}

function sha256(buffer) {
  return `sha256:${crypto.createHash("sha256").update(buffer).digest("hex")}`;
}

function descriptor(buffer, mediaType, annotations = undefined) {
  const value = {
    mediaType,
    digest: sha256(buffer),
    size: buffer.length,
  };
  if (annotations) value.annotations = annotations;
  return value;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function listSkillFiles() {
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsDir, entry.name, "SKILL.md"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort();
}

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  if (!content.startsWith("---\n")) {
    throw new Error(`${path.relative(repoRoot, filePath)} is missing YAML frontmatter`);
  }

  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error(`${path.relative(repoRoot, filePath)} is missing closing YAML delimiter`);
  }

  const parsed = YAML.parse(content.slice(4, end));
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${path.relative(repoRoot, filePath)} frontmatter must be a mapping`);
  }
  return parsed;
}

function buildSkillsIndex(revision, created) {
  return {
    name: "smyrick/skills",
    revision,
    created,
    skills: listSkillFiles().map((filePath) => {
      const metadata = parseFrontmatter(filePath);
      return {
        name: metadata.name,
        path: path.relative(repoRoot, filePath).split(path.sep).join("/"),
        description: metadata.description,
      };
    }),
  };
}

function shouldSkip(relPath) {
  const parts = relPath.split("/");
  return (
    parts.includes(".git") ||
    parts.includes("node_modules") ||
    parts.includes(".dist") ||
    parts.includes(".regesto") ||
    parts.some((part) => part === ".DS_Store")
  );
}

function collectEntries() {
  const roots = ["README.md", "LICENSE", "CONTRIBUTING.md", "skills"];
  const entries = [];

  function visit(absPath) {
    const relPath = path.relative(repoRoot, absPath).split(path.sep).join("/");
    if (!relPath || shouldSkip(relPath)) return;

    const stat = fs.lstatSync(absPath);
    entries.push({ absPath, relPath, stat });
    if (!stat.isDirectory()) return;

    for (const child of fs.readdirSync(absPath).sort(comparePath)) {
      visit(path.join(absPath, child));
    }
  }

  for (const root of roots) {
    const absPath = path.join(repoRoot, root);
    if (fs.existsSync(absPath)) visit(absPath);
  }

  return entries.sort((a, b) => comparePath(a.relPath, b.relPath));
}

function writeString(buffer, offset, length, value) {
  buffer.write(value.slice(0, length), offset, length, "utf8");
}

function writeOctal(buffer, offset, length, value) {
  const text = value.toString(8).padStart(length - 1, "0");
  buffer.write(`${text}\0`, offset, length, "ascii");
}

function tarHeader(entry, size, typeflag, linkname = "") {
  const header = Buffer.alloc(512);
  const name = typeflag === "5" && !entry.relPath.endsWith("/") ? `${entry.relPath}/` : entry.relPath;
  if (Buffer.byteLength(name) > 100) {
    throw new Error(`Tar path is too long for ustar header: ${name}`);
  }

  const mode = entry.stat.isDirectory() ? 0o755 : 0o644;
  writeString(header, 0, 100, name);
  writeOctal(header, 100, 8, mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  writeString(header, 156, 1, typeflag);
  writeString(header, 157, 100, linkname);
  writeString(header, 257, 6, "ustar");
  writeString(header, 263, 2, "00");

  let checksum = 0;
  for (const byte of header) checksum += byte;
  const checksumText = checksum.toString(8).padStart(6, "0");
  header.write(`${checksumText}\0 `, 148, 8, "ascii");
  return header;
}

function buildTar() {
  const chunks = [];
  for (const entry of collectEntries()) {
    if (entry.stat.isDirectory()) {
      chunks.push(tarHeader(entry, 0, "5"));
      continue;
    }

    if (entry.stat.isSymbolicLink()) {
      chunks.push(tarHeader(entry, 0, "2", fs.readlinkSync(entry.absPath)));
      continue;
    }

    if (!entry.stat.isFile()) continue;

    const content = fs.readFileSync(entry.absPath);
    chunks.push(tarHeader(entry, content.length, "0"));
    chunks.push(content);
    const padding = (512 - (content.length % 512)) % 512;
    if (padding) chunks.push(Buffer.alloc(padding));
  }

  chunks.push(Buffer.alloc(1024));
  return Buffer.concat(chunks);
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const revision = runGit(["rev-parse", "HEAD^{commit}"], process.env.GITHUB_SHA || "unknown");
  const shortRevision = revision === "unknown" ? "unknown" : revision.slice(0, 12);
  const created =
    process.env.SOURCE_DATE_EPOCH != null
      ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
      : runGit(["show", "-s", "--format=%cI", "HEAD"], new Date().toISOString());

  const archive = zlib.gzipSync(buildTar(), { level: 9, mtime: 0 });
  const index = Buffer.from(`${JSON.stringify(buildSkillsIndex(revision, created), null, 2)}\n`);
  const config = EMPTY_JSON;

  const archivePath = path.join(outDir, "skills.tar.gz");
  const indexPath = path.join(outDir, "skills-index.json");
  const configPath = path.join(outDir, "config.json");
  const manifestPath = path.join(outDir, "manifest.json");
  const packageResultPath = path.join(outDir, "package-result.json");

  fs.writeFileSync(archivePath, archive);
  fs.writeFileSync(indexPath, index);
  fs.writeFileSync(configPath, config);

  const manifest = {
    schemaVersion: 2,
    mediaType: IMAGE_MEDIA_TYPE,
    artifactType: ARTIFACT_TYPE,
    config: descriptor(config, EMPTY_MEDIA_TYPE),
    layers: [
      descriptor(archive, ARCHIVE_MEDIA_TYPE, {
        "org.opencontainers.image.title": "skills.tar.gz",
      }),
      descriptor(index, INDEX_MEDIA_TYPE, {
        "org.opencontainers.image.title": "skills-index.json",
      }),
    ],
    annotations: {
      "org.opencontainers.image.title": "smyrick skills collection",
      "org.opencontainers.image.description": "Reusable AI agent skills from smyrick/skills.",
      "org.opencontainers.image.source": "https://github.com/smyrick/skills",
      "org.opencontainers.image.revision": revision,
      "org.opencontainers.image.created": created,
      "org.opencontainers.image.licenses": "MIT",
    },
  };

  const manifestBuffer = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(manifestPath, manifestBuffer);

  const packageResult = {
    name: "smyrick/skills",
    revision,
    shortRevision,
    created,
    artifactType: ARTIFACT_TYPE,
    manifest: {
      path: path.relative(repoRoot, manifestPath).split(path.sep).join("/"),
      mediaType: IMAGE_MEDIA_TYPE,
      digest: sha256(manifestBuffer),
      size: manifestBuffer.length,
    },
    config: {
      path: path.relative(repoRoot, configPath).split(path.sep).join("/"),
      ...manifest.config,
    },
    layers: {
      archive: {
        path: path.relative(repoRoot, archivePath).split(path.sep).join("/"),
        ...manifest.layers[0],
      },
      index: {
        path: path.relative(repoRoot, indexPath).split(path.sep).join("/"),
        ...manifest.layers[1],
      },
    },
  };
  writeJson(packageResultPath, packageResult);

  console.log(`Wrote ${path.relative(repoRoot, archivePath)}`);
  console.log(`Wrote ${path.relative(repoRoot, indexPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, manifestPath)}`);
  console.log(`Manifest digest: ${packageResult.manifest.digest}`);
}

main();
