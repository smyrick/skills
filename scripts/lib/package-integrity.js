/** Checks references against package contents, not unrelated files on the host. */
import fs from "node:fs";
import path from "node:path";
import { parseOpenAIContent } from "./openai-contract.js";

export function collectPackageFiles(root) {
  const result = new Map();
  const realRoot = fs.realpathSync(root);
  function visit(absolute, relative, ancestors) {
    const real = fs.realpathSync(absolute);
    const within = path.relative(realRoot, real);
    if (within === ".." || within.startsWith(`..${path.sep}`) || path.isAbsolute(within)) {
      throw new Error(`Package symlink escapes root: ${relative}`);
    }
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      if (ancestors.has(real)) throw new Error(`Cyclic package directory: ${relative}`);
      const next = new Set([...ancestors, real]);
      for (const name of fs.readdirSync(absolute).sort()) {
        if ([".git", "node_modules", ".dist", ".venv", "__pycache__", ".DS_Store"].includes(name)) continue;
        visit(path.join(absolute, name), relative ? `${relative}/${name}` : name, next);
      }
    } else if (stat.isFile()) result.set(relative, fs.readFileSync(absolute));
    else throw new Error(`Unsupported package entry: ${relative}`);
  }
  visit(root, "", new Set());
  return result;
}

export function validateLocalReference(files, from, target) {
  let decoded;
  try {
    decoded = decodeURIComponent(target.split(/[?#]/, 1)[0]);
  } catch {
    return `Invalid encoded reference in ${from}: ${target}`;
  }
  if (!decoded) return null;
  if (decoded.includes("\\") || path.posix.isAbsolute(decoded) || /^[a-z]:/i.test(decoded)) {
    return `Nonportable absolute path in ${from}: ${target}`;
  }
  const resolved = path.posix
    .normalize(path.posix.join(path.posix.dirname(from), decoded))
    .replace(/\/$/, "");
  if (resolved === ".." || resolved.startsWith("../"))
    return `Reference escapes package in ${from}: ${target}`;
  if (!files.has(resolved) && ![...files.keys()].some((name) => name.startsWith(`${resolved}/`))) {
    return `Missing packaged reference in ${from}: ${target}`;
  }
  return null;
}

export function validatePackageReferences(files) {
  const errors = [];
  for (const [name, bytes] of files) {
    if (name.endsWith(".md")) {
      for (const match of bytes
        .toString("utf8")
        .matchAll(/\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+['"][^'"]*['"])?\)/g)) {
        const target = match[1].replace(/^<|>$/g, "");
        if (/^(?:https?:|mailto:|data:|#)/i.test(target)) continue;
        const error = validateLocalReference(files, name, target);
        if (error) errors.push(error);
      }
    }
    if (name.endsWith("/agents/openai.yaml")) {
      let adapter;
      try {
        adapter = parseOpenAIContent(bytes.toString("utf8"));
      } catch (error) {
        errors.push(`${name}: ${error.message}`);
        continue;
      }
      const skillFile = name.replace(/agents\/openai.yaml$/, "SKILL.md");
      for (const field of ["icon_small", "icon_large"]) {
        const target = adapter.interface?.[field];
        if (typeof target !== "string") continue;
        const error = validateLocalReference(files, skillFile, target);
        if (error) errors.push(error);
      }
    }
  }
  return errors;
}
