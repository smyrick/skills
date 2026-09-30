import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import {
  buildPlugins, checkGeneratedPlugins, readPluginInputs, pluginFiles,
  validatePluginFiles, marketplace, CATALOG_PATHS, PLUGIN_TARGETS, jsonBytes,
} from "../scripts/lib/plugin-packages.js";
import { validatePortableManifest, findPluginManifests } from "../scripts/lib/plugin-contract.js";
import {
  pluginArchive, verifyPluginArchive, packagePlugins, verifyPluginArchives, archiveName,
} from "../scripts/lib/plugin-archives.js";
import { buildTar, parseTar } from "../scripts/lib/archive.js";
import { collectPackageFiles } from "../scripts/lib/package-integrity.js";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-package-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const name of ["plugin.json", "LICENSE"])
    fs.copyFileSync(path.join(repo, name), path.join(root, name));
  for (const name of ["example", "research-orchestrator"]) {
    const directory = path.join(root, "skills", name);
    fs.mkdirSync(path.join(directory, "agents"), { recursive: true });
    fs.writeFileSync(path.join(directory, "SKILL.md"),
      "---\nname: " + name + "\ndescription: A repeatable workflow.\n---\n\nRead [guide](guide.md).\n");
    fs.writeFileSync(path.join(directory, "guide.md"), "Use this guide.\n");
    fs.writeFileSync(path.join(directory, "agents/openai.yaml"),
      "policy:\n  allow_implicit_invocation: " + (name === "research-orchestrator") + "\n");
    fs.writeFileSync(path.join(directory, "run.sh"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  }
  return root;
}

test("portable schema is pinned, closed, and distinct from repository policy", () => {
  const minimal = {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: "example",
  };
  assert.deepEqual(validatePortableManifest(minimal), []);
  assert.deepEqual(validatePortableManifest({ ...minimal, version: "not-semver" }), []);
  for (const changes of [
    { $schema: "https://example.com/unknown" }, { name: "Bad--Name" },
    { skills: "./skills/" }, { author: { unexpected: true } }, { version: 1 },
  ]) assert.ok(validatePortableManifest({ ...minimal, ...changes }).length);
  assert.ok(validatePortableManifest({ ...minimal, extensions: { "com.example.client": {} } })
    .some((error) => error.includes("coverage unavailable")));
});

test("generator preserves source, materializes resources, and produces only two native manifests", (t) => {
  const root = fixture(t);
  const before = collectPackageFiles(path.join(root, "skills"));
  fs.symlinkSync("guide.md", path.join(root, "skills/example/linked-guide.md"));
  buildPlugins(root);
  assert.deepEqual(checkGeneratedPlugins(root), []);
  const inputs = readPluginInputs(root);
  for (const target of ["openai", "claude"]) {
    const native = path.join(root, "plugins", target, "smyrick-skills");
    assert.equal(fs.statSync(path.join(native, "skills/example/run.sh")).mode & 0o777, 0o755);
    assert.equal(fs.lstatSync(path.join(native, "skills/example/linked-guide.md")).isSymbolicLink(), false);
    const catalog = JSON.parse(fs.readFileSync(path.join(root, CATALOG_PATHS[target])));
    assert.deepEqual(catalog, marketplace(inputs, target));
    assert.equal(catalog.plugins[0].name, "smyrick-skills");
  }
  assert.equal(findPluginManifests(root).length, 2);
  fs.unlinkSync(path.join(root, "skills/example/linked-guide.md"));
  assert.deepEqual(collectPackageFiles(path.join(root, "skills")), before);
});

test("checks reject stale output and catalog paths without fixing them", (t) => {
  const root = fixture(t);
  buildPlugins(root);
  const skill = path.join(root, "skills/example/SKILL.md");
  fs.appendFileSync(skill, "An additional instruction.\n");
  const generated = path.join(root, "plugins/openai/smyrick-skills/skills/example/SKILL.md");
  const before = fs.readFileSync(generated);
  assert.ok(checkGeneratedPlugins(root).some((error) => error.includes("Stale")));
  assert.deepEqual(fs.readFileSync(generated), before);
  assert.throws(() => packagePlugins(root), /Regenerate plugins/);
  buildPlugins(root);
  const catalogFile = path.join(root, CATALOG_PATHS.openai);
  const catalog = JSON.parse(fs.readFileSync(catalogFile));
  catalog.plugins[0].source.path = "./plugins/claude/smyrick-skills";
  fs.writeFileSync(catalogFile, jsonBytes(catalog));
  assert.ok(checkGeneratedPlugins(root).some((error) => error.includes("incorrect plugin source")));
  assert.equal(JSON.parse(fs.readFileSync(catalogFile)).plugins[0].source.path,
    "./plugins/claude/smyrick-skills");
});

test("package validation catches missing and extra skills, resource loss, policy and metadata drift", (t) => {
  const inputs = readPluginInputs(fixture(t));
  const expected = pluginFiles(inputs, "claude");
  const broken = new Map(expected.files);
  broken.delete("skills/example/guide.md");
  broken.delete("skills/research-orchestrator/SKILL.md");
  broken.set("skills/extra/SKILL.md", expected.files.get("skills/example/SKILL.md"));
  broken.set("skills/example/SKILL.md", Buffer.from(
    broken.get("skills/example/SKILL.md").toString().replace(
      "disable-model-invocation: true", "disable-model-invocation: false")));
  const manifest = JSON.parse(broken.get(expected.manifestPath));
  manifest.version = "9.9.9";
  broken.set(expected.manifestPath, jsonBytes(manifest));
  const errors = validatePluginFiles(inputs, "claude", broken);
  for (const message of ["Missing packaged file", "Unexpected packaged file", "Missing packaged reference",
    "invocation policy drift", "Stale or changed packaged file"])
    assert.ok(errors.some((error) => error.includes(message)), message);
});

test("regeneration removes obsolete files and rejects unsafe sources or destinations before writing", (t) => {
  const root = fixture(t);
  buildPlugins(root);
  const stale = path.join(root, "plugins/claude/smyrick-skills/obsolete");
  fs.writeFileSync(stale, "obsolete");
  buildPlugins(root);
  assert.equal(fs.existsSync(stale), false);
  fs.symlinkSync("../../LICENSE", path.join(root, "skills/example/escape"));
  assert.throws(() => buildPlugins(root), /escapes root/);
  fs.unlinkSync(path.join(root, "skills/example/escape"));
  const catalog = path.join(root, CATALOG_PATHS.openai);
  const before = fs.readFileSync(catalog);
  const claudeCatalog = path.join(root, CATALOG_PATHS.claude);
  fs.unlinkSync(claudeCatalog);
  fs.symlinkSync(path.join(root, "LICENSE"), claudeCatalog);
  assert.throws(() => buildPlugins(root), /symlinked generated destination/);
  assert.deepEqual(fs.readFileSync(catalog), before);
});

test("plugin archives are deterministic, self-contained, and preserve executable modes", (t) => {
  const root = fixture(t);
  buildPlugins(root);
  const inputs = readPluginInputs(root);
  const directory = packagePlugins(root);
  const before = collectPackageFiles(directory);
  packagePlugins(root);
  assert.deepEqual(collectPackageFiles(directory), before);
  verifyPluginArchives(root);
  for (const target of PLUGIN_TARGETS) {
    const bytes = fs.readFileSync(path.join(directory, archiveName(inputs, target)));
    const files = verifyPluginArchive(inputs, target, bytes);
    assert.ok(files.has("skills/example/run.sh"));
    const entry = parseTar(zlib.gunzipSync(bytes)).find((item) => item.name.endsWith("/example/run.sh"));
    assert.equal(entry.mode, 0o755);
    // Decode independently using the system tar implementation.
    const listed = spawnSync("tar", ["-tzf", "-"], { input: bytes });
    assert.equal(listed.status, 0, listed.stderr.toString());
    assert.ok(listed.stdout.toString().includes("smyrick-skills/skills/example/SKILL.md"));
  }
});

test("archive verification rejects changed policy or mode even in a structurally valid archive", (t) => {
  const inputs = readPluginInputs(fixture(t));
  const bytes = pluginArchive(inputs, "claude");
  const entries = parseTar(zlib.gunzipSync(bytes)).filter((entry) => entry.type === "0");
  const skill = entries.find((entry) => entry.name.endsWith("/example/SKILL.md"));
  skill.content = Buffer.from(skill.content.toString().replace(
    "disable-model-invocation: true", "disable-model-invocation: false"));
  const tampered = zlib.gzipSync(buildTar(entries));
  assert.throws(() => verifyPluginArchive(inputs, "claude", tampered), /invocation policy drift/);
  const original = parseTar(zlib.gunzipSync(bytes)).filter((entry) => entry.type === "0");
  original.find((entry) => entry.name.endsWith("/example/run.sh")).mode = 0o644;
  assert.throws(() => verifyPluginArchive(inputs, "claude", zlib.gzipSync(buildTar(original))), /mode differs/);
});

test("checksum and archive inventory checks reject corrupt, missing, and extra downloads", (t) => {
  const root = fixture(t);
  buildPlugins(root);
  const directory = packagePlugins(root);
  fs.writeFileSync(path.join(directory, "SHA256SUMS"), "incorrect");
  assert.throws(() => verifyPluginArchives(root), /checksums differ/);
  packagePlugins(root);
  fs.writeFileSync(path.join(directory, "old.tar.gz"), "old");
  assert.throws(() => verifyPluginArchives(root), /inventory differs/);
  fs.unlinkSync(path.join(directory, "old.tar.gz"));
  fs.unlinkSync(path.join(directory, archiveName(readPluginInputs(root), "openai")));
  assert.throws(() => verifyPluginArchives(root), /inventory differs/);
});

test("ustar supports long names and rejects malformed headers and escaping paths", () => {
  const name = "smyrick-skills/skills/" + "a".repeat(65) + "/references/" + "b".repeat(70) + ".md";
  const tar = buildTar([{ name, content: Buffer.from("content"), mode: 0o644 }]);
  assert.equal(parseTar(tar).find((entry) => entry.type === "0").name, name);
  const listed = spawnSync("tar", ["-tf", "-"], { input: tar });
  assert.equal(listed.status, 0, listed.stderr.toString());
  assert.ok(listed.stdout.toString().includes(name));
  const damaged = Buffer.from(tar);
  damaged[0] ^= 1;
  assert.throws(() => parseTar(damaged), /checksum mismatch/);
  for (const unsafe of ["../escape", "/absolute", "C:/drive", "a/../b", "a\\b"])
    assert.throws(() => buildTar([{ name: unsafe, content: Buffer.alloc(0), mode: 0o644 }]), /Unsafe/);
});

test("release workflow uploads all plugin downloads for new and existing releases", (t) => {
  const root = fixture(t);
  const directory = path.join(root, ".dist/plugins");
  fs.mkdirSync(directory, { recursive: true });
  for (const target of PLUGIN_TARGETS)
    fs.writeFileSync(path.join(directory, "smyrick-skills-" + target + "-1.0.0.tar.gz"), "archive");
  fs.writeFileSync(path.join(directory, "SHA256SUMS"), "checksums");
  const workflow = YAML.parse(fs.readFileSync(path.join(repo, ".github/workflows/release-oci.yml"), "utf8"));
  const script = workflow.jobs.publish.steps.find((step) => step.run?.includes("gh release upload")).run;
  const stub = 'gh() { printf "%s\\n" "$*" >> "$RELEASE_TEST_LOG"; if [ "$2" = view ]; then return "$RELEASE_TEST_VIEW_STATUS"; fi; }\n';
  for (const existing of [true, false]) {
    const log = path.join(root, "release-" + existing + ".log");
    const result = spawnSync("bash", ["-e", "-c", stub + script], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_REF_NAME: "v2026.09.02",
        RELEASE_TEST_LOG: log,
        RELEASE_TEST_VIEW_STATUS: existing ? "0" : "1",
      },
    });
    assert.equal(result.status, 0, result.stderr);
    const calls = fs.readFileSync(log, "utf8");
    assert.equal(calls.includes("release create"), !existing);
    assert.ok(calls.includes("release upload v2026.09.02"));
    for (const target of PLUGIN_TARGETS) assert.ok(calls.includes("smyrick-skills-" + target + "-1.0.0.tar.gz"));
    assert.ok(calls.includes(".dist/plugins/SHA256SUMS"));
  }
});
