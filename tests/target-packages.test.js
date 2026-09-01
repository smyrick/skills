import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import crypto from "node:crypto";
import zlib from "node:zlib";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseSkillContent, serializeSkill } from "../scripts/lib/skill-contract.js";
import { buildTargetFiles, buildTargets, validateTargetFiles } from "../scripts/lib/target-packages.js";
import { collectPackageFiles, validatePackageReferences } from "../scripts/lib/package-integrity.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function sourceFiles() {
  const files = new Map();
  for (const name of ["example-skill", "research-orchestrator"]) {
    files.set(
      `${name}/SKILL.md`,
      Buffer.from(
        serializeSkill(
          { name, description: "Handle a repeatable workflow.", metadata: { owner: "team" } },
          "\nRead [guide](references/guide.md).\n",
        ),
      ),
    );
    files.set(`${name}/references/guide.md`, Buffer.from("# Guide\nKeep this resource unchanged.\n"));
    files.set(
      `${name}/agents/openai.yaml`,
      Buffer.from(`policy:\n  allow_implicit_invocation: ${name === "research-orchestrator"}\n`),
    );
  }
  return files;
}

test("both target collections preserve resources and map user/model invocation correctly", () => {
  const source = sourceFiles();
  const original = new Map([...source].map(([key, value]) => [key, Buffer.from(value)]));
  for (const target of ["openai", "claude"]) {
    const result = buildTargetFiles(source, target);
    assert.deepEqual(validateTargetFiles(source, result, target), []);
    for (const name of ["example-skill", "research-orchestrator"]) {
      const parsed = parseSkillContent(result.get(`${name}/SKILL.md`).toString());
      if (target === "claude") {
        assert.equal(parsed.metadata["disable-model-invocation"], name !== "research-orchestrator");
        assert.equal(parsed.metadata["user-invocable"], true);
        assert.equal(result.has(`${name}/agents/openai.yaml`), false);
      }
    }
  }
  assert.deepEqual(source, original);
});

test("artifact parity catches missing resources, instruction changes, and lost invocation controls", () => {
  const source = sourceFiles();
  const target = buildTargetFiles(source, "claude");
  target.delete("example-skill/references/guide.md");
  assert.ok(
    validateTargetFiles(source, target, "claude").some((error) =>
      error.includes("Missing packaged reference"),
    ),
  );
  const { metadata, body } = parseSkillContent(target.get("example-skill/SKILL.md").toString());
  delete metadata["disable-model-invocation"];
  metadata["user-invocable"] = false;
  target.set(
    "example-skill/SKILL.md",
    Buffer.from(serializeSkill(metadata, body + "Changed instructions.\n")),
  );
  const errors = validateTargetFiles(source, target, "claude");
  assert.ok(errors.some((error) => error.includes("invocation policy drift")));
  assert.ok(errors.some((error) => error.includes("explicit invocation")));
  assert.ok(errors.some((error) => error.includes("instruction body changed")));
});

test("unsupported dependency conversion fails rather than dropping behavior", () => {
  const source = sourceFiles();
  const key = "example-skill/agents/openai.yaml";
  source.set(
    key,
    Buffer.from(source.get(key).toString() + "dependencies:\n  tools:\n    - type: mcp\n      value: docs\n"),
  );
  assert.throws(() => buildTargetFiles(source, "claude"), /cannot discard required MCP dependencies/);
  assert.deepEqual(validateTargetFiles(source, buildTargetFiles(source, "openai"), "openai"), []);
});

test("package references resolve within the delivered collection, including adapter icons", () => {
  const source = sourceFiles();
  source.set(
    "example-skill/references/guide.md",
    Buffer.from("[peer](../../research-orchestrator/SKILL.md)\n"),
  );
  assert.deepEqual(validatePackageReferences(source), []);
  source.set(
    "example-skill/agents/openai.yaml",
    Buffer.from("interface:\n  icon_small: ./assets/missing.svg\n"),
  );
  assert.ok(validatePackageReferences(source).some((error) => error.includes("missing.svg")));
  source.set("example-skill/references/guide.md", Buffer.from("[outside](../../../package.json)\n"));
  assert.ok(validatePackageReferences(source).some((error) => error.includes("escapes package")));
});

test("builder writes installable files, removes stale output, and retains executable permissions", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-target-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [name, bytes] of sourceFiles()) {
    const file = path.join(root, "skills", name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  const script = path.join(root, "skills/example-skill/run.sh");
  fs.writeFileSync(script, "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  const output = buildTargets(root);
  fs.writeFileSync(path.join(output, "claude/stale.txt"), "obsolete");
  buildTargets(root);
  assert.equal(fs.existsSync(path.join(output, "claude/stale.txt")), false);
  for (const target of ["openai", "claude"]) {
    assert.deepEqual(
      validateTargetFiles(
        collectPackageFiles(path.join(root, "skills")),
        collectPackageFiles(path.join(output, target, "skills")),
        target,
      ),
      [],
    );
    assert.equal(fs.statSync(path.join(output, target, "skills/example-skill/run.sh")).mode & 0o777, 0o755);
  }
});

test("escaping and cyclic symlinks fail package preflight", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-links-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "package"));
  fs.writeFileSync(path.join(root, "outside.txt"), "outside");
  fs.symlinkSync("../outside.txt", path.join(root, "package/escape"));
  assert.throws(() => collectPackageFiles(path.join(root, "package")), /escapes root/);
  fs.unlinkSync(path.join(root, "package/escape"));
  fs.symlinkSync(".", path.join(root, "package/cycle"));
  assert.throws(() => collectPackageFiles(path.join(root, "package")), /Cyclic/);
});

test("formatter rejects a malformed batch without partially writing earlier files", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-format-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(path.join(repoRoot, "scripts"), path.join(root, "scripts"), { recursive: true });
  fs.symlinkSync(path.join(repoRoot, "node_modules"), path.join(root, "node_modules"));
  fs.symlinkSync(path.join(repoRoot, "tools"), path.join(root, "tools"));
  fs.writeFileSync(path.join(root, "package.json"), '{"type":"module"}');
  for (const name of ["a", "b"]) fs.mkdirSync(path.join(root, "skills", name), { recursive: true });
  const original = "---\nname: a\ndescription: plain value\n---\n\nBody\n";
  fs.writeFileSync(path.join(root, "skills/a/SKILL.md"), original);
  fs.writeFileSync(path.join(root, "skills/b/SKILL.md"), "malformed");
  const result = spawnSync(process.execPath, [path.join(root, "scripts/format-skills.js")], {
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(root, "skills/a/SKILL.md"), "utf8"), original);
});

test("OCI verification inspects archived invocation controls even when all digests match", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-oci-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(path.join(repoRoot, "scripts"), path.join(root, "scripts"), { recursive: true });
  fs.symlinkSync(path.join(repoRoot, "node_modules"), path.join(root, "node_modules"));
  fs.symlinkSync(path.join(repoRoot, "tools"), path.join(root, "tools"));
  fs.writeFileSync(path.join(root, "package.json"), '{"type":"module"}');
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs/validation.md"), "Validation coverage.\n");
  fs.writeFileSync(path.join(root, "README.md"), "Read [coverage](docs/validation.md).\n");
  for (const [name, bytes] of sourceFiles()) {
    const file = path.join(root, "skills", name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  const run = (script) =>
    spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8", cwd: root });
  const packaged = run("package-oci.js");
  assert.equal(packaged.status, 0, packaged.stderr);
  const verified = run("verify-oci.js");
  assert.equal(verified.status, 0, verified.stderr);

  const output = path.join(root, ".dist/oci");
  const archiveFile = path.join(output, "skills.tar.gz");
  const tar = zlib.gunzipSync(fs.readFileSync(archiveFile));
  const token = "disable-model-invocation: true";
  const offset = tar.indexOf(token);
  assert.notEqual(offset, -1);
  tar.write("disable-model-invocation: null", offset);
  const archive = zlib.gzipSync(tar);
  fs.writeFileSync(archiveFile, archive);
  const manifestFile = path.join(output, "manifest.json");
  const resultFile = path.join(output, "package-result.json");
  const manifest = JSON.parse(fs.readFileSync(manifestFile));
  const result = JSON.parse(fs.readFileSync(resultFile));
  const sha = (bytes) => `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
  for (const descriptor of [manifest.layers[0], result.layers.archive]) {
    descriptor.digest = sha(archive);
    descriptor.size = archive.length;
  }
  const manifestBytes = Buffer.from(JSON.stringify(manifest));
  fs.writeFileSync(manifestFile, manifestBytes);
  result.manifest.digest = sha(manifestBytes);
  result.manifest.size = manifestBytes.length;
  fs.writeFileSync(resultFile, JSON.stringify(result));
  const rejected = run("verify-oci.js");
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /Claude invocation policy drift/);
  assert.doesNotMatch(rejected.stderr, /digest mismatch/);
});
