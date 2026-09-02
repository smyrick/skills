#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packagePlugins } from "./lib/plugin-archives.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log("Packaged and verified portable, Codex, and Claude plugins in " + packagePlugins(root));
