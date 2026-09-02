/** One authored collection; deterministic, self-contained plugin projections. */
import fs from "node:fs";
import path from "node:path";
import { collectPackageFiles, validatePackageReferences } from "./package-integrity.js";
import { buildTargetFiles, validateTargetFiles, TARGETS } from "./target-packages.js";
import { validatePluginManifest, validatePortableManifest } from "./plugin-contract.js";

export const PLUGIN_TARGETS = ["portable", ...TARGETS];
export const CATALOG_PATHS = {
  openai: ".agents/plugins/marketplace.json",
  claude: ".claude-plugin/marketplace.json",
};
const NATIVE_MANIFESTS = {
  openai: ".codex-plugin/plugin.json",
  claude: ".claude-plugin/plugin.json",
};
export const jsonBytes = (value) => Buffer.from(JSON.stringify(value, null, 2) + "\n");
export const fileMode = (file) => (fs.statSync(file).mode & 0o111 ? 0o755 : 0o644);
export const pluginDirectory = (target, name) => "plugins/" + target + "/" + name;

export function readPluginInputs(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "plugin.json"), "utf8"));
  const errors = validatePortableManifest(manifest);
  if (manifest?.name !== "smyrick-skills") errors.push("Repository plugin name must remain smyrick-skills");
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(manifest?.version ?? ""))
    errors.push("Repository plugin version must be a stable major.minor.patch version");
  if (!manifest?.author?.name) errors.push("Repository plugin requires author.name");
  if (errors.length) throw new Error(errors.join("\n"));
  const source = collectPackageFiles(path.join(root, "skills"));
  const skillNames = [...source.keys()].filter((name) => /^[^/]+\/SKILL\.md$/.test(name));
  if (!skillNames.length) throw new Error("No skill packages found");
  // Validate the reviewed policy even when the portable projection is requested.
  const sourceErrors = validateTargetFiles(source, source, "openai");
  if (sourceErrors.length) throw new Error(sourceErrors.join("\n"));
  const modes = new Map(
    [...source.keys()].map((name) => [name, fileMode(path.join(root, "skills", name))]),
  );
  return { manifest, source, modes, license: fs.readFileSync(path.join(root, "LICENSE")) };
}

export function pluginFiles(inputs, target) {
  if (!PLUGIN_TARGETS.includes(target)) throw new Error("Unknown plugin target: " + target);
  const { manifest, source, modes, license } = inputs;
  const skillFiles = target === "portable" ? source : buildTargetFiles(source, target);
  const files = new Map([["LICENSE", license]]);
  const fileModes = new Map([["LICENSE", 0o644]]);
  for (const [name, bytes] of skillFiles) {
    files.set("skills/" + name, bytes);
    fileModes.set("skills/" + name, modes.get(name));
  }
  let metadata = manifest;
  const manifestPath = target === "portable" ? "plugin.json" : NATIVE_MANIFESTS[target];
  if (target !== "portable") {
    const { $schema, extensions, ...common } = manifest;
    metadata = { ...common, skills: "./skills/" };
    if (target === "openai")
      metadata.interface = {
        displayName: "Smyrick Skills",
        shortDescription: "Research, planning, code review, and writing",
        developerName: manifest.author.name,
        category: "Productivity",
      };
  }
  files.set(manifestPath, jsonBytes(metadata));
  fileModes.set(manifestPath, 0o644);
  return { files, modes: fileModes, manifestPath };
}

export function marketplace(inputs, target) {
  const { manifest } = inputs;
  const source = "./" + pluginDirectory(target, manifest.name);
  if (target === "openai")
    return {
      name: "smyrick",
      interface: { displayName: "Shane Myrick's Skills" },
      plugins: [{
        name: manifest.name,
        source: { source: "local", path: source },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Productivity",
      }],
    };
  if (target === "claude")
    return {
      name: "smyrick",
      owner: { name: manifest.author.name },
      plugins: [{ name: manifest.name, source, description: manifest.description }],
    };
  throw new Error("Unknown marketplace target: " + target);
}

export function compareFiles(expected, actual, expectedModes, actualModes) {
  const errors = [];
  for (const [name, bytes] of expected) {
    if (!actual.has(name)) errors.push("Missing packaged file: " + name);
    else if (!bytes.equals(actual.get(name))) errors.push("Stale or changed packaged file: " + name);
    if (actual.has(name) && actualModes && actualModes.get(name) !== expectedModes.get(name))
      errors.push("Packaged file mode differs: " + name);
  }
  for (const name of actual.keys())
    if (!expected.has(name)) errors.push("Unexpected packaged file: " + name);
  return errors;
}

export function validatePluginFiles(inputs, target, files, modes) {
  const expected = pluginFiles(inputs, target);
  const errors = compareFiles(expected.files, files, expected.modes, modes);
  try {
    const manifest = JSON.parse(files.get(expected.manifestPath)?.toString("utf8") ?? "null");
    errors.push(...(target === "portable"
      ? validatePortableManifest(manifest)
      : validatePluginManifest({ manifest, target, files })));
  } catch (error) {
    errors.push(expected.manifestPath + ": " + error.message);
  }
  const skills = new Map(
    [...files].filter(([name]) => name.startsWith("skills/"))
      .map(([name, bytes]) => [name.slice(7), bytes]),
  );
  errors.push(...validateTargetFiles(inputs.source, skills, target === "portable" ? "openai" : target));
  errors.push(...validatePackageReferences(files));
  return errors;
}

/** Reject symlinked destinations before removing or overwriting generated files. */
export function assertPlainDestination(root, relative) {
  let current = root;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink())
        throw new Error("Refusing a symlinked generated destination: " + relative);
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
  }
}

export function checkGeneratedPlugins(root, inputs = readPluginInputs(root)) {
  const errors = [];
  for (const target of TARGETS) {
    const directory = pluginDirectory(target, inputs.manifest.name);
    try {
      assertPlainDestination(root, directory);
      const files = collectPackageFiles(path.join(root, directory));
      const modes = new Map([...files.keys()].map((name) => [
        name, fileMode(path.join(root, directory, name)),
      ]));
      errors.push(...validatePluginFiles(inputs, target, files, modes)
        .map((error) => directory + ": " + error));
    } catch (error) {
      errors.push(directory + ": " + error.message);
    }
    try {
      const catalogPath = CATALOG_PATHS[target];
      assertPlainDestination(root, catalogPath);
      const actual = fs.readFileSync(path.join(root, catalogPath));
      // Exact projection checks cover required fields, identity, and the target path.
      if (!actual.equals(jsonBytes(marketplace(inputs, target))))
        errors.push(catalogPath + ": stale marketplace metadata or incorrect plugin source");
    } catch (error) {
      errors.push(CATALOG_PATHS[target] + ": " + error.message);
    }
  }
  return errors;
}

export function buildPlugins(root) {
  const inputs = readPluginInputs(root);
  const packages = new Map();
  // Prepare and validate all projections before touching committed output.
  for (const target of TARGETS) {
    const output = pluginFiles(inputs, target);
    const errors = validatePluginFiles(inputs, target, output.files, output.modes);
    if (errors.length) throw new Error(errors.join("\n"));
    packages.set(target, output);
    assertPlainDestination(root, pluginDirectory(target, inputs.manifest.name));
    assertPlainDestination(root, CATALOG_PATHS[target]);
  }
  for (const [target, output] of packages) {
    const directory = path.join(root, pluginDirectory(target, inputs.manifest.name));
    fs.rmSync(directory, { recursive: true, force: true });
    for (const [name, bytes] of output.files) {
      const destination = path.join(directory, name);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, bytes);
      fs.chmodSync(destination, output.modes.get(name));
    }
    const catalog = path.join(root, CATALOG_PATHS[target]);
    fs.mkdirSync(path.dirname(catalog), { recursive: true });
    fs.writeFileSync(catalog, jsonBytes(marketplace(inputs, target)));
    fs.chmodSync(catalog, 0o644);
  }
}
