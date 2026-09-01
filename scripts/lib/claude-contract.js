/** Claude Code extensions layered over shared fields; not a claude.ai upload validator. */
import { parseSkillContent, serializeSkill, validateSkillDocument, SKILL_FIELDS } from "./skill-contract.js";
import { fields, string, boolean, stringList, isMapping } from "./validation.js";

const EXTENSIONS = [
  "disable-model-invocation",
  "user-invocable",
  "argument-hint",
  "arguments",
  "when_to_use",
  "disallowed-tools",
  "model",
  "effort",
  "context",
  "agent",
  "background",
  "hooks",
  "paths",
  "shell",
];

export function validateClaudeDocument({ content, folderName }) {
  let parsed;
  try {
    parsed = parseSkillContent(content);
  } catch (error) {
    return [error.message];
  }
  const { metadata, body } = parsed;
  const errors = [];
  fields(metadata, [...SKILL_FIELDS, ...EXTENSIONS], "Claude frontmatter", errors);
  const shared = Object.fromEntries(Object.entries(metadata).filter(([key]) => SKILL_FIELDS.includes(key)));
  // Claude supports arrays here; the shared specification uses a string.
  if (Array.isArray(shared["allowed-tools"])) shared["allowed-tools"] = shared["allowed-tools"].join(" ");
  errors.push(...validateSkillDocument({ content: serializeSkill(shared, body), folderName }));
  for (const key of ["disable-model-invocation", "user-invocable", "background"])
    boolean(metadata[key], key, errors);
  for (const key of ["argument-hint", "when_to_use", "model", "agent"]) string(metadata[key], key, errors);
  for (const key of ["arguments", "allowed-tools", "disallowed-tools", "paths"]) {
    if (Array.isArray(metadata[key])) stringList(metadata[key], key, errors);
    else string(metadata[key], key, errors);
  }
  for (const [key, values] of Object.entries({
    context: ["fork"],
    effort: ["low", "medium", "high", "xhigh", "max"],
    shell: ["bash", "powershell"],
  })) {
    if (metadata[key] !== undefined && !values.includes(metadata[key]))
      errors.push(`${key} must be one of: ${values.join(", ")}`);
  }
  if (metadata.hooks !== undefined) {
    if (!isMapping(metadata.hooks)) errors.push("hooks must be a mapping");
    errors.push("Skill hooks require a lifecycle validator; this profile does not validate hook behavior");
  }
  return errors;
}
