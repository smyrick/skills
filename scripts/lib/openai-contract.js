/** OpenAI skill adapter schema profile, independent of this portfolio's policy. */
import { parseYamlMapping, formatYamlMapping } from "./skill-contract.js";
import { fields, string, boolean } from "./validation.js";

export const parseOpenAIContent = (content) => parseYamlMapping(content, "agents/openai.yaml");
export const formatOpenAIContent = formatYamlMapping;

export function validateOpenAIDocument({ content }) {
  let doc;
  try {
    doc = parseOpenAIContent(content);
  } catch (error) {
    return [error.message];
  }
  const errors = [];
  fields(doc, ["interface", "policy", "dependencies"], "OpenAI adapter", errors);
  const interfaceFields = [
    "display_name",
    "short_description",
    "default_prompt",
    "icon_small",
    "icon_large",
    "brand_color",
  ];
  if (doc.interface !== undefined && fields(doc.interface, interfaceFields, "interface", errors)) {
    for (const key of interfaceFields) string(doc.interface[key], `interface.${key}`, errors);
    if (typeof doc.interface.brand_color === "string" && !/^#[0-9a-f]{6}$/i.test(doc.interface.brand_color)) {
      errors.push("interface.brand_color must be a six-digit hex color");
    }
  }
  if (doc.policy !== undefined && fields(doc.policy, ["allow_implicit_invocation"], "policy", errors)) {
    boolean(doc.policy.allow_implicit_invocation, "policy.allow_implicit_invocation", errors);
  }
  if (doc.dependencies !== undefined && fields(doc.dependencies, ["tools"], "dependencies", errors)) {
    if (!Array.isArray(doc.dependencies.tools)) errors.push("dependencies.tools must be an array");
    else
      for (const [i, tool] of doc.dependencies.tools.entries()) {
        const label = `dependencies.tools[${i}]`;
        if (
          !fields(tool, ["type", "value", "description", "transport", "url"], label, errors, [
            "type",
            "value",
          ])
        )
          continue;
        for (const key of ["type", "value", "description", "transport", "url"]) {
          string(tool[key], `${label}.${key}`, errors, { required: ["type", "value"].includes(key) });
        }
        if (tool.type !== "mcp") errors.push(`${label}.type is unsupported by this profile (expected mcp)`);
      }
  }
  return errors;
}
