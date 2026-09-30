# Agent Instructions

This repository stores reusable AI agent skills. Treat skill formatting as part of every change.

Keep skill workflows agent- and model-neutral. Describe required capabilities and outcomes, not vendor tool names, model identifiers, reasoning-setting names, or a particular client's invocation syntax. Treat optional runtime features as capabilities to check, with a direct-work or handoff fallback when unavailable. Brief, source-backed notes about public client differences are welcome when relevant; do not assume that hooks, permissions, or other features behave identically across clients.

JavaScript in this repo uses ES modules with standard `.js` files. Keep `"type": "module"` in `package.json`; do not add `.mjs` scripts or convert repo scripts to CommonJS.

After changing any `skills/**/SKILL.md` or `skills/**/agents/openai.yaml` file:

1. Run `npm run format`.
2. Run `npm run build:plugins` to refresh committed plugin packages and catalogs.
3. Run `npm run check`.
4. Update the `README.md` Skill Index when a skill is added, renamed, removed, materially re-described, or changes invocation mode.

After changing skill-contract, validation, CI, or packaging code, also run `npm run plugin:package`, `npm run plugin:verify`, and `npm run oci:smoke`.

Author skills only under `skills/`. Files under `plugins/` and both marketplace catalogs are generated; never hand-edit them. The root `plugin.json` owns identity and version. Bump its stable semantic version for distributed content changes, regenerate, and include the generated changes in the same commit. Keep schema pins offline and distinguish static checks from live client behavior.

Do not hand-repair YAML delimiter structure when the formatter can normalize it. The formatter owns skill frontmatter shape; skill bodies should remain focused, concise, and agent-readable.
