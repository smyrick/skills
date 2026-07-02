#!/usr/bin/env node
/**
 * Publishes the packaged skills collection to an OCI registry.
 */
const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, ".dist", "oci");
const packageResultPath = path.join(outDir, "package-result.json");
const manifestPath = path.join(outDir, "manifest.json");
const publishResultPath = path.join(outDir, "publish-result.json");

const IMAGE_MEDIA_TYPE = "application/vnd.oci.image.manifest.v1+json";
const dryRun = process.argv.includes("--dry-run");

function runGit(args, fallback = "") {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) return fallback;
  return result.stdout.trim() || fallback;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(buffer) {
  return `sha256:${crypto.createHash("sha256").update(buffer).digest("hex")}`;
}

function normalizeRegistry(value) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function calendarTagFromDate(date) {
  return `v${date.toISOString().slice(0, 10).replaceAll("-", ".")}`;
}

function assertCalendarTag(tag) {
  const match = /^v(\d{4})\.(\d{2})\.(\d{2})(?:\.(\d+))?$/.exec(tag);
  if (!match) {
    throw new Error(`Release tag must match vYYYY.MM.DD or vYYYY.MM.DD.N: ${tag}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Release tag contains an invalid calendar date: ${tag}`);
  }
}

function releaseTag() {
  if (process.env.OCI_RELEASE_TAG) return process.env.OCI_RELEASE_TAG;
  if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }
  if (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith("refs/tags/")) {
    return process.env.GITHUB_REF.slice("refs/tags/".length);
  }
  if (dryRun) return calendarTagFromDate(new Date());
  throw new Error("Refusing to publish without a Git tag context");
}

function resolveTags(shortRevision) {
  if (process.env.OCI_TAGS) {
    const tags = process.env.OCI_TAGS.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (tags.length === 0) throw new Error("OCI_TAGS was provided but no tags were found");
    for (const tag of tags) {
      if (tag.startsWith("v")) assertCalendarTag(tag);
    }
    return tags;
  }

  const tag = releaseTag();
  assertCalendarTag(tag);
  return [tag, "latest", `git-${shortRevision}`];
}

function request(method, url, headers = {}, body = undefined) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      parsed,
      {
        method,
        headers: {
          "user-agent": "smyrick-skills-oci-publisher",
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function appendDigest(location, digest) {
  const separator = location.includes("?") ? "&" : "?";
  return `${location}${separator}digest=${encodeURIComponent(digest)}`;
}

function absoluteRegistryUrl(registry, location) {
  if (/^https?:\/\//.test(location)) return location;
  return `https://${registry}${location.startsWith("/") ? "" : "/"}${location}`;
}

async function getBearerToken(registry, repository, username, password) {
  const tokenUrl = new URL(`https://${registry}/token`);
  tokenUrl.searchParams.set("service", registry);
  tokenUrl.searchParams.set("scope", `repository:${repository}:push,pull`);

  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const res = await request("GET", tokenUrl.toString(), {
    authorization: `Basic ${auth}`,
  });
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Registry token request failed with ${res.statusCode}: ${res.body.toString("utf8")}`);
  }

  const parsed = JSON.parse(res.body.toString("utf8"));
  const token = parsed.token || parsed.access_token;
  if (!token) throw new Error("Registry token response did not include a token");
  return token;
}

async function uploadBlob(registry, repository, token, descriptor, filePath) {
  const blobUrl = `https://${registry}/v2/${repository}/blobs/${descriptor.digest}`;
  const authHeaders = { authorization: `Bearer ${token}` };
  const head = await request("HEAD", blobUrl, authHeaders);
  if (head.statusCode === 200) {
    console.log(`Blob exists: ${descriptor.digest}`);
    return;
  }
  if (head.statusCode !== 404) {
    throw new Error(`Blob check failed for ${descriptor.digest} with ${head.statusCode}`);
  }

  const start = await request("POST", `https://${registry}/v2/${repository}/blobs/uploads/`, {
    ...authHeaders,
    "content-length": "0",
  });
  if (start.statusCode !== 202 || !start.headers.location) {
    throw new Error(`Blob upload start failed for ${descriptor.digest} with ${start.statusCode}`);
  }

  const body = fs.readFileSync(filePath);
  const uploadUrl = appendDigest(absoluteRegistryUrl(registry, start.headers.location), descriptor.digest);
  const finish = await request(
    "PUT",
    uploadUrl,
    {
      ...authHeaders,
      "content-type": "application/octet-stream",
      "content-length": String(body.length),
    },
    body,
  );
  if (finish.statusCode !== 201) {
    throw new Error(`Blob upload failed for ${descriptor.digest} with ${finish.statusCode}: ${finish.body.toString("utf8")}`);
  }
  console.log(`Uploaded blob: ${descriptor.digest}`);
}

async function putManifest(registry, repository, token, tag, manifestBuffer) {
  const res = await request(
    "PUT",
    `https://${registry}/v2/${repository}/manifests/${tag}`,
    {
      authorization: `Bearer ${token}`,
      "content-type": IMAGE_MEDIA_TYPE,
      "content-length": String(manifestBuffer.length),
    },
    manifestBuffer,
  );
  if (res.statusCode !== 201) {
    throw new Error(`Manifest push failed for ${tag} with ${res.statusCode}: ${res.body.toString("utf8")}`);
  }
  console.log(`Pushed manifest tag: ${tag}`);
}

async function fetchManifest(registry, repository, token, reference) {
  const res = await request("GET", `https://${registry}/v2/${repository}/manifests/${reference}`, {
    authorization: `Bearer ${token}`,
    accept: IMAGE_MEDIA_TYPE,
  });
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`Manifest fetch failed for ${reference} with ${res.statusCode}: ${res.body.toString("utf8")}`);
  }
  return JSON.parse(res.body.toString("utf8"));
}

function resultFor(image, digest, tags, packageResult) {
  return {
    image,
    digest,
    ref: `${image}@${digest}`,
    tags,
    layers: {
      archive: {
        digest: packageResult.layers.archive.digest,
        mediaType: packageResult.layers.archive.mediaType,
      },
      index: {
        digest: packageResult.layers.index.digest,
        mediaType: packageResult.layers.index.mediaType,
      },
    },
  };
}

async function main() {
  if (!fs.existsSync(packageResultPath) || !fs.existsSync(manifestPath)) {
    throw new Error("Missing .dist/oci package output. Run npm run oci:package first.");
  }

  const registry = normalizeRegistry(process.env.OCI_REGISTRY || "ghcr.io");
  const repository = process.env.OCI_REPOSITORY || "smyrick/skills";
  const image = `${registry}/${repository}`;
  const packageResult = readJson(packageResultPath);
  const manifest = readJson(manifestPath);
  const manifestBuffer = fs.readFileSync(manifestPath);
  const manifestDigest = sha256(manifestBuffer);
  const shortRevision =
    packageResult.shortRevision ||
    (process.env.GITHUB_SHA || runGit(["rev-parse", "HEAD"], "unknown")).slice(0, 12);
  const tags = resolveTags(shortRevision);

  if (!Array.isArray(manifest.layers) || manifest.layers.length === 0) {
    throw new Error("Packaged manifest must contain a non-empty layers array");
  }
  if (packageResult.manifest.digest !== manifestDigest) {
    throw new Error(
      `Manifest digest mismatch: package-result has ${packageResult.manifest.digest}, file has ${manifestDigest}`,
    );
  }

  if (dryRun) {
    const result = resultFor(image, packageResult.manifest.digest, tags, packageResult);
    result.dryRun = true;
    writeJson(publishResultPath, result);
    console.log(`Dry run OK: ${result.ref}`);
    console.log(`Tags: ${tags.join(", ")}`);
    return;
  }

  const username = process.env.OCI_USERNAME || process.env.GITHUB_ACTOR;
  const password = process.env.OCI_TOKEN || process.env.GITHUB_TOKEN;
  if (!username || !password) {
    throw new Error("Publishing requires OCI_USERNAME/OCI_TOKEN or GITHUB_ACTOR/GITHUB_TOKEN");
  }

  const token = await getBearerToken(registry, repository, username, password);
  await uploadBlob(registry, repository, token, packageResult.config, path.join(repoRoot, packageResult.config.path));
  await uploadBlob(
    registry,
    repository,
    token,
    packageResult.layers.archive,
    path.join(repoRoot, packageResult.layers.archive.path),
  );
  await uploadBlob(
    registry,
    repository,
    token,
    packageResult.layers.index,
    path.join(repoRoot, packageResult.layers.index.path),
  );

  for (const tag of tags) {
    await putManifest(registry, repository, token, tag, manifestBuffer);
  }

  const inspected = await fetchManifest(registry, repository, token, tags[0]);
  if (!Array.isArray(inspected.layers) || inspected.layers.length === 0) {
    throw new Error("Pushed manifest inspection failed: manifest does not contain layers");
  }

  const result = resultFor(image, packageResult.manifest.digest, tags, packageResult);
  writeJson(publishResultPath, result);
  console.log(`Published ${result.ref}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
