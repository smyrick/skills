/** Deliberate portfolio choices; these are not upstream schema requirements. */
import { isMapping } from "./validation.js";
import { parseSkillContent } from "./skill-contract.js";
import { parseOpenAIContent } from "./openai-contract.js";

export const MODEL_INVOKED_SKILLS = new Set(["research-orchestrator"]);
export const invocationForSkill = (name) => (MODEL_INVOKED_SKILLS.has(name) ? "model" : "user");

// These additional checks are deliberately separate from skills-ref's results.
export function validateRepositoryCore({ content, skillName }) {
  let parsed;
  try {
    parsed = parseSkillContent(content);
  } catch (error) {
    return [error.message];
  }
  const { metadata, body } = parsed;
  const errors = [];
  if (
    typeof metadata.name !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) ||
    metadata.name !== skillName
  ) {
    errors.push("Repository policy: name must match its folder exactly and use ASCII lowercase kebab-case");
  }
  if (typeof metadata.description !== "string")
    errors.push("Repository policy: description must be a YAML string");
  for (const key of ["license", "compatibility", "allowed-tools"]) {
    if (metadata[key] !== undefined && typeof metadata[key] !== "string")
      errors.push(`Repository policy: ${key} must be a YAML string`);
  }
  if (
    metadata.metadata !== undefined &&
    (!isMapping(metadata.metadata) ||
      Object.values(metadata.metadata).some((value) => typeof value !== "string"))
  ) {
    errors.push("Repository policy: metadata must map strings to YAML strings");
  }
  if (!body.trim()) errors.push("Repository policy: skill body must not be empty");
  return errors;
}

export function validateRepositorySkill({ content, adapterContent, skillName }) {
  const errors = validateRepositoryCore({ content, skillName });
  let metadata, body, adapter;
  try {
    ({ metadata, body } = parseSkillContent(content));
    adapter = parseOpenAIContent(adapterContent);
  } catch (error) {
    return [error.message];
  }
  if (metadata["allowed-tools"] !== undefined)
    errors.push("Repository policy: tool approval declarations belong in a target-specific configuration");
  for (const field of ["display_name", "short_description", "default_prompt"]) {
    if (typeof adapter.interface?.[field] !== "string" || !adapter.interface[field].trim()) {
      errors.push(`Repository policy requires interface.${field}`);
    }
  }
  const short = adapter.interface?.short_description;
  if (typeof short === "string" && (short.length < 25 || short.length > 64)) {
    errors.push("Repository policy: short_description must be 25–64 characters");
  }
  if (
    typeof adapter.interface?.default_prompt === "string" &&
    !adapter.interface.default_prompt.includes(`$${skillName}`)
  ) {
    errors.push(`Repository policy: default_prompt must include $${skillName}`);
  }
  const expected = invocationForSkill(skillName) === "model";
  if (adapter.policy?.allow_implicit_invocation !== expected) {
    errors.push(`Repository policy: allow_implicit_invocation must be ${expected} for ${skillName}`);
  }
  if (
    /\b(?:AskUserQuestion|request_user_input|ToolSearch|tool_search|spawn_agent|subagent_type)\b|mcp__\w+|\$\{(?:CLAUDE|CODEX)_|~\/\.(?:claude|codex)\//.test(
      body,
    )
  ) {
    errors.push(
      "Repository policy: skill body contains a harness-specific tool or install path; describe the capability instead",
    );
  }
  if (/\$[a-z]+(?:-[a-z]+)+/.test(body))
    errors.push(
      "Repository policy: use a plain skill name in portable instructions, not a client invocation token",
    );
  return errors;
}

export function validateReadme(readme, names) {
  const errors = [];
  const rows = new Map();
  for (const match of readme.matchAll(
    /^\| \[([^\]]+)\]\(\.\/skills\/([^/)]+)\/SKILL\.md\) \| ([^|]+) \|/gm,
  )) {
    if (rows.has(match[2])) errors.push(`Duplicate README entry for ${match[2]}`);
    rows.set(match[2], { label: match[1], invocation: match[3].trim() });
  }
  for (const name of names) {
    const row = rows.get(name);
    if (!row) errors.push(`README Skill Index is missing ${name}`);
    else {
      if (row.label !== name) errors.push(`README label must match ${name}`);
      const expected = invocationForSkill(name) === "model" ? "Model" : "User";
      if (row.invocation !== expected) errors.push(`README invocation for ${name} must be ${expected}`);
    }
  }
  for (const name of rows.keys())
    if (!names.includes(name)) errors.push(`README references missing skill ${name}`);
  for (const name of MODEL_INVOKED_SKILLS)
    if (!names.includes(name)) errors.push(`Invocation policy references missing skill ${name}`);
  return errors;
}
