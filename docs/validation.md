# Validation coverage

Shared-core validation uses the upstream `skills-ref` reference library. Harness-specific validators remain maintained profiles grounded in the sources below, reviewed on 2026-09-01. They do not claim complete validation of every feature a client accepts. An unknown field produces an unsupported-profile diagnostic; adding support requires updating the relevant validator and fixtures. Formatting never removes the field to make that check pass.

## Layers and ownership

| Layer | Implementation | Guarantee |
| --- | --- | --- |
| Agent Skills reference | `scripts/lib/skills-ref.js` → `tools/skills-ref/validate.py` | Calls the pinned upstream `skills_ref.validate` API on raw skill files |
| OpenAI skill profile | `scripts/lib/openai-contract.js` | Optional interface, invocation policy, and MCP dependency metadata |
| Claude Code skill profile | `scripts/lib/claude-contract.js` | Shared-conformant skills plus documented invocation, arguments, tools, and execution-setting fields |
| Repository policy | `scripts/lib/repository-policy.js` | ASCII names, nonempty bodies, strict optional YAML metadata types, invocation choices, required OpenAI interface metadata, README agreement, and narrow portability lint |
| Package integrity | `scripts/lib/package-integrity.js` | Inline Markdown links and adapter icons resolve within delivered contents; symlinks cannot escape or cycle |
| Static target parity | `scripts/lib/target-packages.js` | Preserved instructions, shared metadata, supporting resources, and explicit/implicit invocation mapping |
| Native plugin profiles | `scripts/lib/plugin-contract.js` | Pinned Agent Plugins schema, separate OpenAI/Claude skill-only profiles, and component paths |
| Generated plugins | `scripts/lib/plugin-packages.js` | Committed packages/catalogs match the source, resources, metadata, invocation policy, and executable bits |
| Plugin downloads | `scripts/lib/plugin-archives.js` | Deterministic archives, contained paths, actual file parity, executable modes, and checksums |
| OCI verification | `scripts/verify-oci.js` | Descriptors and actual archived source/target contents match the package contract |

The core reference check does not require OpenAI adapters or our display-text length convention. Those are repository policies. Claude Code can accept skills outside the shared specification; the current profile intentionally validates generated shared-conformant skills, not arbitrary Claude imports. In particular it requires YAML booleans, not version-specific boolean aliases.

## Upstream reference dependency

`tools/skills-ref/pyproject.toml` pins the official repository to commit `69ef37e9424c0a7ea9dd2293b559e43ec8176379`, using its `skills-ref` subdirectory. `uv.lock` records dependency versions and hashes. Run `npm run setup:spec` to prepare the isolated tool environment; it is not added to an agent's runtime or shipped in skill packages.

The JavaScript adapter batches source-directory checks through the public Python `validate` API. For generated or archived content, it materializes the unchanged content in a temporary skill directory and uses the same API. The Python bridge only transports inputs/results; it contains no copied spec rules. Validation uses `uv run --locked --offline --no-python-downloads`, and unavailable tooling or malformed responses fail explicitly without falling back to a local validator.

Upstream describes this library as a demonstration/reference implementation. At the pinned revision it allows Unicode names, normalizes some values, accepts a lowercase `skill.md`, and does not check body emptiness or all optional-field types. Repository checks separately retain ASCII folder names, an uppercase `SKILL.md`, nonempty bodies, and strict YAML metadata types. This prevents our preferences from masquerading as upstream requirements. The reference parser's own syntax restrictions remain visible; we do not reserialize source YAML before validating it.

Upgrade the source pin and lockfile deliberately, inspect upstream changes, and run the integration tests plus `npm run check` and `npm run oci:smoke`. No runtime client version is certified by passing the reference checker.

## Target collections

`npm run build:targets` builds `.dist/targets/openai/skills/` and `.dist/targets/claude/skills/`. OpenAI output retains the portable skill and adapter. Claude Code output preserves shared metadata and instructions, omits the OpenAI interface adapter, and adds `disable-model-invocation` plus `user-invocable: true`. The shared invocation policy remains authoritative. The source is never rewritten by target generation. Install the Claude Code collection with the skills CLI's `--copy` option into a distinct directory; a shared canonical symlink directory cannot hold two different variants of the same skill.

Adding required MCP dependency metadata currently blocks Claude target generation until a real dependency mapping exists. This avoids silently losing a dependency when omitting the OpenAI adapter. Tool approval declarations, hooks, agent activation, model routing, and permission enforcement are not inferred from plain-language instructions.

The OCI archive keeps its existing `skills/` tree and both collections under `targets/`, and adds the portable plugin manifest, native plugin trees, and catalogs. Existing index fields remain available, with an additional `targets` object for each skill. Verification reads the embedded files rather than only checking the repository or file names. Internal symlinks are materialized during packaging; escaping or cyclic links fail preflight. File execute permissions are preserved.

## Plugin checks

The root `plugin.json` targets Agent Plugins 1.0.0 and is checked offline using an unchanged, pinned upstream JSON Schema through Ajv. Native manifests use separate client profiles. Source scans find existing `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json` files outside cache directories; marketplace-only directories are ignored. Required committed packages and both catalogs must exist and match the generator, so missing output fails rather than skips.

The initial profiles cover skill-only plugins: basic metadata, supported OpenAI presentation fields, declared skill directories, contained skills, and referenced files. Runtime components such as MCP configuration, hooks, custom agents, and other advanced fields fail with an explicit coverage-unavailable diagnostic. They require their own component validators and runtime tests before this repository can ship them. This is a validation limitation, not a claim that the client lacks those features. The generator produces both native packages and catalogs from the source collection. Portable downloads retain source skills; native downloads preserve the matching client policy. See [plugin distribution](plugins.md) for commands, versions, and live test coverage.

## Runtime coverage

Every static validation run reports live behavior as `NOT RUN`. Neither valid YAML nor matching invocation flags proves that a particular client version discovers or executes a skill correctly.

For a live run, record the client/version, relevant configuration, artifact revision, and the prompts/results for explicit invocation, ambient matching, and near misses. Test missing dependencies and fallbacks when relevant. Use fresh contexts and repeat routing cases as described in `CONTRIBUTING.md`. Keep this separate from default CI; there is no live harness runner in this repository yet.

## Source baselines

- [Agent Skills specification](https://agentskills.io/specification): shared fields and structure.
- [Pinned skills-ref source](https://github.com/agentskills/agentskills/tree/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref): the actual core validator used by local checks and CI.
- [OpenAI skill metadata](https://developers.openai.com/codex/skills/#optional-metadata): interface, invocation, and dependencies.
- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins): manifests, component paths, and supported surfaces.
- [Claude Code skills](https://code.claude.com/docs/en/skills): extensions and invocation controls. This target is distinct from claude.ai skill uploads.
- [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference): separate plugin manifest and component contract.

The documented source baseline is dated; no runtime version is certified by the static profiles. Recheck authoritative docs and record affected client versions when extending a profile. Do not silently update CI validation semantics by fetching a mutable schema at test time.

- [Skills CLI installation modes](https://github.com/vercel-labs/skills): target selection and copying versus shared symlink installs.
