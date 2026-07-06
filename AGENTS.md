# Agent Instructions

This repository stores reusable AI agent skills. Treat skill formatting as part of every change.

JavaScript in this repo uses ES modules with standard `.js` files. Keep `"type": "module"` in `package.json`; do not add `.mjs` scripts or convert repo scripts to CommonJS.

After changing any `skills/**/SKILL.md` file:

1. Run `npm run format`.
2. Run `npm run check`.
3. Update the `README.md` Skill Index when a skill is added, renamed, removed, or materially re-described.

Do not hand-repair YAML delimiter structure when the formatter can normalize it. The formatter owns skill frontmatter shape; skill bodies should remain focused, concise, and agent-readable.
