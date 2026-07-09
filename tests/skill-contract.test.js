import assert from "node:assert/strict";
import test from "node:test";

import {
  formatOpenAIContent,
  formatSkillContent,
  validateOpenAIDocument,
  validateSkillDocument,
} from "../scripts/lib/skill-contract.js";

const body = "# Example\n\nFollow the workflow.\n";

function skill(frontmatter) {
  return `---\n${frontmatter}\n---\n\n${body}`;
}

function openai({ name = "example-skill", short = "A concise description for this example", implicit = false } = {}) {
  return `interface:\n  display_name: "Example Skill"\n  short_description: "${short}"\n  default_prompt: "Use $${name} to handle this request."\npolicy:\n  allow_implicit_invocation: ${implicit}\n`;
}

test("accepts the minimal portable skill contract", () => {
  const errors = validateSkillDocument({
    content: skill('name: "example-skill"\ndescription: "Handle a repeatable example workflow."'),
    folderName: "example-skill",
  });
  assert.deepEqual(errors, []);
});

test("rejects extra frontmatter fields and name mismatches", () => {
  const errors = validateSkillDocument({
    content: skill(
      'name: "wrong-name"\ndescription: "Handle a repeatable example workflow."\nauthor: "Someone"',
    ),
    folderName: "example-skill",
  });
  assert.ok(errors.some((error) => error.includes("unsupported field `author`")));
  assert.ok(errors.some((error) => error.includes('must match folder "example-skill"')));
});

test("rejects malformed frontmatter instead of repairing it heuristically", () => {
  const errors = validateSkillDocument({ content: "name: example-skill\n# Missing delimiters\n", folderName: "example-skill" });
  assert.match(errors[0], /must start with YAML frontmatter/);
});

test("accepts explicit user and recorded model invocation policies", () => {
  assert.deepEqual(validateOpenAIDocument({ content: openai(), skillName: "example-skill" }), []);
  assert.deepEqual(
    validateOpenAIDocument({
      content: openai({ name: "research-orchestrator", implicit: true }),
      skillName: "research-orchestrator",
    }),
    [],
  );
});

test("enforces short-description boundaries", () => {
  const short24 = "x".repeat(24);
  const short25 = "x".repeat(25);
  const short64 = "x".repeat(64);
  const short65 = "x".repeat(65);
  assert.ok(validateOpenAIDocument({ content: openai({ short: short24 }), skillName: "example-skill" }).length);
  assert.deepEqual(validateOpenAIDocument({ content: openai({ short: short25 }), skillName: "example-skill" }), []);
  assert.deepEqual(validateOpenAIDocument({ content: openai({ short: short64 }), skillName: "example-skill" }), []);
  assert.ok(validateOpenAIDocument({ content: openai({ short: short65 }), skillName: "example-skill" }).length);
});

test("requires the matching explicit skill token in the default prompt", () => {
  const errors = validateOpenAIDocument({ content: openai({ name: "other-skill" }), skillName: "example-skill" });
  assert.ok(errors.some((error) => error.includes("must include `$example-skill`")));
});

test("requires a boolean policy matching the recorded invocation mode", () => {
  const missing = openai().replace("  allow_implicit_invocation: false\n", "");
  const stringValue = openai().replace("allow_implicit_invocation: false", 'allow_implicit_invocation: "false"');
  const wrongUser = openai({ implicit: true });
  const wrongModel = openai({ name: "research-orchestrator", implicit: false });
  assert.ok(validateOpenAIDocument({ content: missing, skillName: "example-skill" }).length);
  assert.ok(validateOpenAIDocument({ content: stringValue, skillName: "example-skill" }).length);
  assert.ok(validateOpenAIDocument({ content: wrongUser, skillName: "example-skill" }).length);
  assert.ok(validateOpenAIDocument({ content: wrongModel, skillName: "research-orchestrator" }).length);
});

test("formatters are idempotent and preserve the Markdown body", () => {
  const input = skill(
    'description: "Handle a repeatable example workflow."\nauthor: "Removed"\nname: "example-skill"',
  );
  const formattedSkill = formatSkillContent(input);
  assert.equal(formatSkillContent(formattedSkill), formattedSkill);
  assert.match(formattedSkill, /# Example\n\nFollow the workflow\./);
  assert.doesNotMatch(formattedSkill, /author:/);

  const formattedOpenAI = formatOpenAIContent(openai());
  assert.equal(formatOpenAIContent(formattedOpenAI), formattedOpenAI);
});
