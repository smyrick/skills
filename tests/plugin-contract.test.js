import assert from "node:assert/strict";
import test from "node:test";
import { validatePluginManifest } from "../scripts/lib/plugin-contract.js";

const files = new Map([
  [
    "skills/example/SKILL.md",
    Buffer.from("---\nname: example\ndescription: Example workflow.\n---\n\nFollow the workflow.\n"),
  ],
]);

test("skill-only plugin manifests have distinct OpenAI and Claude schemas", () => {
  const manifest = { name: "example", skills: "./skills/", interface: { displayName: "Example" } };
  assert.deepEqual(validatePluginManifest({ manifest, target: "openai", files }), []);
  assert.ok(
    validatePluginManifest({ manifest, target: "claude", files }).some((error) =>
      error.includes("interface"),
    ),
  );
  assert.deepEqual(
    validatePluginManifest({ manifest: { name: "example", skills: ["./skills/"] }, target: "claude", files }),
    [],
  );
});

test("plugin checks detect missing paths and uncovered runtime components", () => {
  for (const skills of ["../outside", "./missing/"]) {
    assert.ok(
      validatePluginManifest({ manifest: { name: "example", skills }, target: "openai", files }).length,
    );
  }
  assert.ok(
    validatePluginManifest({ manifest: { name: "example", hooks: {} }, target: "openai", files }).some(
      (error) => error.includes("coverage unavailable"),
    ),
  );
  const withHooks = new Map([...files, ["hooks/hooks.json", Buffer.from("{}")]]);
  assert.ok(
    validatePluginManifest({ manifest: { name: "example" }, target: "claude", files: withHooks }).some(
      (error) => error.includes("not implemented"),
    ),
  );
});

test("Claude plugin checks validate root skills with implicit and explicit discovery", () => {
  const malformedRoot = new Map([["SKILL.md", Buffer.from("not frontmatter\n")]]);
  assert.ok(
    validatePluginManifest({ manifest: { name: "example" }, target: "claude", files: malformedRoot }).some(
      (error) => error.startsWith("SKILL.md:"),
    ),
  );

  const validRoot = new Map([
    [
      "SKILL.md",
      Buffer.from("---\nname: stable-name\ndescription: Example workflow.\n---\n\nFollow the workflow.\n"),
    ],
  ]);
  assert.deepEqual(validatePluginManifest({ manifest: { name: "example" }, target: "claude", files: validRoot }), []);
  assert.deepEqual(
    validatePluginManifest({ manifest: { name: "example", skills: ["./"] }, target: "claude", files: validRoot }),
    [],
  );
});
