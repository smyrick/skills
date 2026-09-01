/** Run the upstream reference validator from its committed, locked tool environment. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const project = path.join(repoRoot, "tools", "skills-ref");
const documentCache = new Map();

function validateRequests(requests) {
  const env = { ...process.env, PYTHONIOENCODING: "utf-8" };
  delete env.VIRTUAL_ENV;
  const result = spawnSync(
    "uv",
    [
      "run",
      "--locked",
      "--offline",
      "--no-python-downloads",
      "--project",
      project,
      "python",
      path.join(project, "validate.py"),
    ],
    { input: JSON.stringify(requests), encoding: "utf8", env, timeout: 60000, maxBuffer: 4 * 1024 * 1024 },
  );
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || result.stderr.trim() || `exit ${result.status}`;
    throw new Error(
      `skills-ref unavailable or failed: ${detail}\nInstall uv, then run npm run setup:spec. No local-validator fallback was used.`,
    );
  }
  let results;
  try {
    results = JSON.parse(result.stdout);
  } catch {
    throw new Error("skills-ref returned invalid JSON; core validation did not complete");
  }
  if (
    !Array.isArray(results) ||
    results.length !== requests.length ||
    results.some((errors) => !Array.isArray(errors) || errors.some((error) => typeof error !== "string"))
  ) {
    throw new Error("skills-ref returned an invalid result shape; core validation did not complete");
  }
  return results;
}

export function validateSkillDirectories(directories) {
  return validateRequests(directories.map((directory) => ({ directory })));
}

export function validateSkillDocument({ content, folderName }) {
  const key = JSON.stringify({ content, folderName });
  if (!documentCache.has(key)) documentCache.set(key, validateRequests([{ content, folderName }])[0]);
  return [...documentCache.get(key)];
}
