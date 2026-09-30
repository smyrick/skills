import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { buildTar, parseTar } from "./archive.js";
import {
  PLUGIN_TARGETS, readPluginInputs, pluginFiles, validatePluginFiles,
  checkGeneratedPlugins, assertPlainDestination,
} from "./plugin-packages.js";

const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
export const archiveName = (inputs, target) =>
  inputs.manifest.name + "-" + target + "-" + inputs.manifest.version + ".tar.gz";

export function pluginArchive(inputs, target) {
  const { files, modes } = pluginFiles(inputs, target);
  const prefix = inputs.manifest.name + "/";
  return zlib.gzipSync(buildTar([...files].map(([name, content]) => ({
    name: prefix + name, content, mode: modes.get(name),
  }))), { level: 9, mtime: 0 });
}

export function verifyPluginArchive(inputs, target, bytes) {
  const entries = parseTar(zlib.gunzipSync(bytes));
  const prefix = inputs.manifest.name + "/";
  const files = new Map();
  const modes = new Map();
  for (const entry of entries) {
    if (!entry.name.startsWith(prefix)) throw new Error("Entry outside plugin root: " + entry.name);
    if (entry.type === "5") continue;
    const name = entry.name.slice(prefix.length);
    files.set(name, entry.content);
    modes.set(name, entry.mode);
  }
  const errors = validatePluginFiles(inputs, target, files, modes);
  if (errors.length) throw new Error(target + ": " + errors.join("\n"));
  return files;
}

export function packagePlugins(root) {
  const inputs = readPluginInputs(root);
  const errors = checkGeneratedPlugins(root, inputs);
  if (errors.length) throw new Error("Regenerate plugins before packaging:\n" + errors.join("\n"));
  const output = ".dist/plugins";
  assertPlainDestination(root, output);
  // Verify in memory before replacing only this generated artifact directory.
  const archives = PLUGIN_TARGETS.map((target) => {
    const bytes = pluginArchive(inputs, target);
    verifyPluginArchive(inputs, target, bytes);
    return { name: archiveName(inputs, target), bytes };
  });
  const directory = path.join(root, output);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  for (const archive of archives) fs.writeFileSync(path.join(directory, archive.name), archive.bytes);
  fs.writeFileSync(path.join(directory, "SHA256SUMS"),
    archives.map(({ name, bytes }) => sha256(bytes) + "  " + name + "\n").join(""));
  return directory;
}

export function verifyPluginArchives(root) {
  const inputs = readPluginInputs(root);
  const directory = path.join(root, ".dist/plugins");
  const expectedNames = PLUGIN_TARGETS.map((target) => archiveName(inputs, target));
  const actualNames = fs.readdirSync(directory).sort();
  if (JSON.stringify(actualNames) !== JSON.stringify([...expectedNames, "SHA256SUMS"].sort()))
    throw new Error("Plugin archive inventory differs");
  const checksums = [];
  for (const target of PLUGIN_TARGETS) {
    const name = archiveName(inputs, target);
    const bytes = fs.readFileSync(path.join(directory, name));
    verifyPluginArchive(inputs, target, bytes);
    checksums.push(sha256(bytes) + "  " + name + "\n");
  }
  if (fs.readFileSync(path.join(directory, "SHA256SUMS"), "utf8") !== checksums.join(""))
    throw new Error("Plugin archive checksums differ");
}
