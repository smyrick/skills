# Pinned Agent Plugins schema

The plugin.schema.json file is an unchanged copy of the Agent Plugins 1.0.0 manifest
schema from [agentplugins/agent-plugins-spec](https://github.com/agentplugins/agent-plugins-spec/blob/ff8ab5e392cc87bd88d87c060815a87490e51003/schemas/1.0.0/plugin.schema.json).

- Upstream commit: ff8ab5e392cc87bd88d87c060815a87490e51003
- Retrieved: 2026-09-02
- SHA-256: 0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883
- License: Apache-2.0; the upstream license is included in LICENSE.

The Node validator uses Ajv's JSON Schema 2020-12 implementation offline.
Update this pin deliberately, compare the upstream schema/specification, and
run the contract and artifact checks. Repository restrictions (stable versions,
fixed identity, skill-only packages) are separate from upstream schema validity.
This tooling is not included in plugin downloads.
