#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTargets } from "./lib/target-packages.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log(`Built OpenAI and Claude Code skill collections: ${path.relative(root, buildTargets(root))}`);
