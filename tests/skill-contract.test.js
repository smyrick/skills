import assert from "node:assert/strict";
import test from "node:test";
import YAML from "yaml";
import { spawnSync } from "node:child_process";
import {
  formatSkillContent,
  parseSkillContent,
  serializeSkill,
  validateSkillDocument,
} from "../scripts/lib/skill-contract.js";
import {
  formatOpenAIContent,
  parseOpenAIContent,
  validateOpenAIDocument,
} from "../scripts/lib/openai-contract.js";
import { validateClaudeDocument } from "../scripts/lib/claude-contract.js";
import {
  validateRepositoryCore,
  validateRepositorySkill,
  validateReadme,
} from "../scripts/lib/repository-policy.js";

const body = "\n# Example\n\nPreserve the body.  \n";
const metadata = { name: "example-skill", description: "Handle a repeatable example workflow." };
const skill = (extra = {}) => serializeSkill({ ...metadata, ...extra }, body);
const adapter = (implicit = false) =>
  YAML.stringify({
    interface: {
      display_name: "Example",
      short_description: "A concise description for this example",
      default_prompt: "Use $example-skill to handle this request.",
    },
    policy: { allow_implicit_invocation: implicit },
  });

test("upstream reference validator accepts its optional metadata without requiring an adapter", () => {
  const content = skill({
    license: "MIT",
    compatibility: "Requires Python",
    metadata: { author: "Someone", version: "1" },
    "allowed-tools": "Read",
  });
  assert.deepEqual(validateSkillDocument({ content, folderName: "example-skill" }), []);
});

test("upstream reference validator rejects malformed fields, sizes, and names", () => {
  for (const extra of [
    { name: "Wrong" },
    { description: " " },
    { description: "x".repeat(1025) },
    { compatibility: "x".repeat(501) },
    { author: "Unknown field" },
  ]) {
    assert.ok(
      validateSkillDocument({ content: skill(extra), folderName: "example-skill" }).length,
      JSON.stringify(extra),
    );
  }
  for (const content of [
    "name: missing-delimiters",
    "---\nname: a\n---",
    "---\nname: a\nname: b\n---\n\nBody",
  ]) {
    assert.ok(validateSkillDocument({ content, folderName: "example-skill" }).length);
  }
});

test("formatting preserves every YAML value and the exact normalized Markdown body", () => {
  const content = skill({
    license: "MIT",
    compatibility: "Requires shell access",
    metadata: { author: "Someone" },
    "disable-model-invocation": true,
    unknown_extension: { nested: [false, 12, "yes"] },
  });
  const formatted = formatSkillContent(content);
  assert.deepEqual(parseSkillContent(formatted), parseSkillContent(content));
  assert.equal(formatSkillContent(formatted), formatted);
  assert.ok(
    validateSkillDocument({ content: formatted, folderName: "example-skill" }).some((error) =>
      error.includes("disable-model-invocation"),
    ),
  );
  assert.equal(parseSkillContent(formatted).body, body);
});

test("OpenAI formatting preserves dependencies, icons, unknown fields, comments, and multiline strings", () => {
  const content =
    adapter() +
    "# Keep deployment context\ndependencies:\n  tools:\n    - type: mcp\n      value: docs\n      transport: streamable_http\n      url: https://example.com/mcp\nfuture_extension:\n  instructions: |\n    first line\n    second line\n";
  const formatted = formatOpenAIContent(content);
  assert.deepEqual(parseOpenAIContent(formatted), parseOpenAIContent(content));
  assert.equal(formatOpenAIContent(formatted), formatted);
  assert.match(formatted, /# Keep deployment context/);
  assert.ok(
    validateOpenAIDocument({ content: formatted }).some((error) => error.includes("future_extension")),
  );
});

test("OpenAI schema validity is independent of the portfolio's display and invocation policy", () => {
  assert.deepEqual(validateOpenAIDocument({ content: "{}\n" }), []);
  assert.deepEqual(validateOpenAIDocument({ content: adapter(true) }), []);
  assert.ok(
    validateRepositorySkill({
      content: skill(),
      adapterContent: adapter(true),
      skillName: "example-skill",
    }).some((error) => error.includes("allow_implicit_invocation")),
  );
  assert.ok(
    validateRepositorySkill({ content: skill(), adapterContent: "{}\n", skillName: "example-skill" }).length,
  );
});

test("OpenAI dependencies validate without being confused with a tool allowlist", () => {
  const value = parseOpenAIContent(adapter());
  value.dependencies = {
    tools: [
      {
        type: "mcp",
        value: "docs",
        description: "Required docs server",
        transport: "streamable_http",
        url: "https://example.com/mcp",
      },
    ],
  };
  value.interface.icon_small = "./assets/icon.svg";
  assert.deepEqual(validateOpenAIDocument({ content: YAML.stringify(value) }), []);
  value.dependencies.tools[0].value = 42;
  assert.ok(validateOpenAIDocument({ content: YAML.stringify(value) }).length);
  value.policy.allow_implicit_invocation = "false";
  assert.ok(
    validateOpenAIDocument({ content: YAML.stringify(value) }).some((error) => error.includes("boolean")),
  );
});

test("Claude Code extension checks are separate from shared specification checks", () => {
  const content = skill({
    "disable-model-invocation": true,
    "user-invocable": true,
    "allowed-tools": ["Read", "Grep"],
    context: "fork",
    model: "inherit",
  });
  assert.deepEqual(validateClaudeDocument({ content, folderName: "example-skill" }), []);
  assert.ok(validateSkillDocument({ content, folderName: "example-skill" }).length);
  assert.ok(
    validateClaudeDocument({
      content: skill({ "disable-model-invocation": "false" }),
      folderName: "example-skill",
    }).length,
  );
  assert.ok(
    validateClaudeDocument({ content: skill({ hooks: {} }), folderName: "example-skill" }).some((error) =>
      error.includes("lifecycle validator"),
    ),
  );
});

test("repository policy retains deliberate naming and invocation choices", () => {
  assert.deepEqual(
    validateRepositorySkill({ content: skill(), adapterContent: adapter(), skillName: "example-skill" }),
    [],
  );
  for (const length of [24, 65]) {
    const value = parseOpenAIContent(adapter());
    value.interface.short_description = "x".repeat(length);
    assert.deepEqual(validateOpenAIDocument({ content: YAML.stringify(value) }), []);
    assert.ok(
      validateRepositorySkill({
        content: skill(),
        adapterContent: YAML.stringify(value),
        skillName: "example-skill",
      }).length,
    );
  }
  const errors = validateReadme(
    "| [research-orchestrator](./skills/research-orchestrator/SKILL.md) | User | wrong |\n",
    ["research-orchestrator"],
  );
  assert.ok(errors.some((error) => error.includes("must be Model")));
  assert.ok(validateReadme("", ["research-orchestrator"]).length);
});

test("core uses upstream Unicode naming rules while ASCII naming remains repository policy", () => {
  const content = serializeSkill({ name: "café", description: "A Unicode skill name." }, body);
  assert.deepEqual(validateSkillDocument({ content, folderName: "café" }), []);
  assert.ok(validateRepositoryCore({ content, skillName: "café" }).some((error) => error.includes("ASCII")));
});

test("reference validation gaps are covered by separately labeled repository checks", () => {
  for (const content of [
    skill({ metadata: { version: 1 } }),
    skill({ "allowed-tools": ["Read"] }),
    serializeSkill(metadata, ""),
  ]) {
    assert.deepEqual(validateSkillDocument({ content, folderName: "example-skill" }), []);
    assert.ok(validateRepositoryCore({ content, skillName: "example-skill" }).length);
  }
});

test("core validation fails explicitly when its runtime is unavailable", () => {
  const moduleUrl = new URL("../scripts/lib/skills-ref.js", import.meta.url).href;
  const code = `import { validateSkillDocument } from ${JSON.stringify(moduleUrl)}; validateSkillDocument({content: ${JSON.stringify(skill())}, folderName: "example-skill"});`;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    encoding: "utf8",
    env: { ...process.env, PATH: "" },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /No local-validator fallback was used/);
});
