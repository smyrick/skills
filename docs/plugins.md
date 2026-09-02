# Plugin distribution

The `smyrick-skills` plugin bundles all 11 workflows. Author skills only in `skills/` and plugin metadata in the root `plugin.json`. The native packages and catalogs are generated and committed, so consumers need no repository build step or development dependencies to install from Git.

## Install and invoke

For Codex CLI versions with `plugin add`:

```bash
codex plugin marketplace add smyrick/skills
codex plugin add smyrick-skills@shane-personal-plugins
```

The repository catalog is also usable from the desktop plugin directory. If your CLI has marketplace commands but no `plugin add`, add the marketplace with the CLI and install from the desktop directory.

For Claude Code:

```bash
claude plugin marketplace add smyrick/skills
claude plugin install smyrick-skills@shane-personal-plugins
```

In Claude Code, invoke a bundled skill as `/smyrick-skills:humanize-text`. Codex discovers the same `smyrick-skills:skill-name` namespace; select the bundled skill from its skill picker, or explicitly identify the plugin and skill in your request. Existing standalone skill commands remain available when installed separately. Prefer one installation method per client to avoid duplicate skill entries.

Both catalogs use the marketplace ID `shane-personal-plugins`; each lists only the `smyrick-skills` plugin. Codex displays the catalog as **Shane's Personal Plugins**. The marketplace ID names the catalog, not its author or an individual plugin. Codex uses `.agents/plugins/marketplace.json` and the OpenAI projection. Claude uses `.claude-plugin/marketplace.json` and its own projection. Catalog paths are relative to the repository root. Add the repository, not a raw marketplace JSON URL.

### Pin an installation

The default Git source follows `main`. To select a release that includes plugin support, substitute its existing calendar tag for `vYYYY.MM.DD`:

```bash
codex plugin marketplace add smyrick/skills@vYYYY.MM.DD
claude plugin marketplace add smyrick/skills@vYYYY.MM.DD
```

Calendar tags identify repository snapshots. The plugin's shared semantic version identifies its distributed contents and cache freshness. Updating a marketplace pinned to a tag keeps that tag selected. To advance to another release, add the source with the desired tag and update/reinstall the plugin using that client's controls.

### Portable downloads

Each tagged release attaches:

- `smyrick-skills-portable-<version>.tar.gz`
- `smyrick-skills-openai-<version>.tar.gz`
- `smyrick-skills-claude-<version>.tar.gz`
- `SHA256SUMS`

Download all three archives and the checksum file into one directory, then verify with `shasum -a 256 -c SHA256SUMS` on macOS or `sha256sum -c SHA256SUMS` on Linux. Extract a chosen archive into its own directory; every archive has a `smyrick-skills/` root. The portable archive contains the standard `plugin.json`, source skills and resources, and license. Native archives contain their own manifest and matching skill projection. Native catalogs are provided by the repository, not bundled into individual plugin archives.

The portable format defines packaging and discovery, not invocation policy or a universal install command. Follow the receiving client's installation instructions. Codex and Claude preserve this repository's ten explicit-only skills and one implicitly invocable `research-orchestrator`; invocation behavior in other clients is unverified.

## Build and publish

```bash
npm ci
npm run setup:spec
npm run format
npm run build:plugins
npm run check
npm run plugin:package
npm run plugin:verify
npm run oci:smoke
```

The plugin build reuses the target converter and writes self-contained native directories under `plugins/{openai,claude}/smyrick-skills`. It copies supporting files, materializes contained symlinks, and normalizes file permissions to Git's executable/non-executable distinction (755/644). It rejects escaping or cyclic source links and symlinked output roots. Generated files are marked in `.gitattributes`.

`check:plugins` validates the pinned upstream portable schema, the repository's skill-only profiles, native manifests, complete file inventories, invocation policy, catalog metadata, and generated parity. It does not rewrite files. Archive creation fails on stale committed output and writes only `.dist/plugins/`. Archive verification checks actual extracted bytes, modes, paths, and checksums against the source contract; it does not trust checksums alone. Timestamps, ownership, and entry ordering are deterministic.

Change the single version in `plugin.json` for every distributed content change, then regenerate and commit the output with the source. Use stable `major.minor.patch` versions; start with `1.0.0`. Do not reuse a version for changed contents. The existing `vYYYY.MM.DD` / `vYYYY.MM.DD.N` release tags remain unchanged.

When an authorized tag is pushed, the existing release workflow verifies and publishes OCI, creates the GitHub Release when missing, and uploads the three archives plus checksums. Reruns replace those deterministic assets even when the release already exists. OCI retains its original skill and target paths, index fields, and media types, and additionally carries the portable manifest, both native packages, and catalogs. No npm publication or public-directory submission is performed.

## Validation coverage

Static validation and live client behavior are separate. The regression suite covers missing/extra files, stale packages, invalid manifests, incorrect catalog sources, invocation drift, missing resources, archive tampering, path containment, deterministic output, and executable modes. The system tar implementation also reads the generated archives independently of the JavaScript reader.

Local verification on 2026-09-02 used temporary profiles without importing personal credentials. These installation results cover version 1.0.0 with the earlier `smyrick` marketplace ID, before the catalog rename in 1.0.1:

| Client | Result |
| --- | --- |
| Codex CLI 0.151.0-alpha.7.2 | Local marketplace registration, plugin installation, enabled listing, and app-server skill discovery passed; installed version 1.0.0 contains all 11 skills with exact OpenAI package bytes |
| Claude Code 2.1.246 | Native manifest validation, local marketplace registration, plugin installation, and enabled listing passed; installed version 1.0.0 contains all 11 skills with exact Claude package bytes |
| Skills CLI 1.5.23 | List and project-scoped copy installation found exactly 11 skills; installed bytes match the canonical source, not the generated Claude variant |

These tests exercise local repository sources; remote GitHub installation and release uploads remain untested until publication. Both isolated profiles report not signed in. Authenticated explicit invocation, ambient non-invocation, and orchestrator reachability were not run in either client. Run those cases in fresh authenticated contexts as described in the contribution guide before claiming runtime routing compatibility. Static flags and successful installation do not prove model selection behavior.

## Sources

- [Agent Plugins 1.0.0 specification](https://agent-plugins.org/specification)
- [Pinned manifest schema](https://github.com/agentplugins/agent-plugins-spec/blob/ff8ab5e392cc87bd88d87c060815a87490e51003/schemas/1.0.0/plugin.schema.json)
- [Codex packaging and marketplaces](https://developers.openai.com/plugins/build/plugins)
- [Claude marketplaces and Git ref selection](https://code.claude.com/docs/en/plugin-marketplaces)
- [Claude plugin reference](https://code.claude.com/docs/en/plugins-reference)
