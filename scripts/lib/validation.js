/** Small schema helpers. Repository policy must not live in these helpers. */
export function isMapping(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function fields(value, allowed, label, errors, required = []) {
  if (!isMapping(value)) {
    errors.push(`${label} must be a mapping`);
    return false;
  }
  for (const key of required) if (!(key in value)) errors.push(`${label} is missing \`${key}\``);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key))
      errors.push(`${label}: unsupported field \`${key}\` in this validation profile`);
  }
  return true;
}

export function string(value, label, errors, { max, required = false } = {}) {
  if (value === undefined && !required) return;
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} must be a non-empty string`);
  } else if (max && value.length > max) {
    errors.push(`${label} must be at most ${max} characters`);
  }
}

export function boolean(value, label, errors) {
  if (value !== undefined && typeof value !== "boolean") errors.push(`${label} must be a boolean`);
}

export function stringList(value, label, errors) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    errors.push(`${label} must be an array of non-empty strings`);
  }
}
