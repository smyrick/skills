#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPlugins } from "./lib/plugin-packages.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
buildPlugins(root);
console.log("Generated both smyrick-skills plugins and marketplace catalogs.");
