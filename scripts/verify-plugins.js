#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPluginArchives } from "./lib/plugin-archives.js";

verifyPluginArchives(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
console.log("All three plugin archives and SHA256SUMS verified.");
