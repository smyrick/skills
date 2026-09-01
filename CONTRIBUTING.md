# Contributing a Skill

This repository treats a skill's instructions, invocation behavior, adapter metadata, and tests as one contract. Follow [AGENTS.md](./AGENTS.md) when changing that contract.

## When a Skill Is Worth Adding

Add a skill when the workflow is repeatable, has meaningful decisions or tool use, and becomes materially more reliable with written guidance. Keep one-off tasks, simple preferences, and facts that belong in normal project documentation out of the portfolio.

Before adding a skill, decide whether an existing skill should absorb the behavior. Prefer a small coherent portfolio over overlapping trigger descriptions.

## Invocation Mode

Choose invocation mode before writing the description. Record it in `agents/openai.yaml`, add it to the README Skill Index, and justify the choice in the change description.

### Default: user invocation

Use explicit user invocation when the workflow:

- starts a deliberate mode, session, transformation, or expensive investigation;
- writes or publishes an artifact;
- changes how an otherwise ordinary request should be answered; or
- would be surprising or harmful if selected from ambient conversation.

User-invoked descriptions should be clear human-facing summaries of the capability. They do not need a long list of trigger phrases because the user names the skill. Set:

```yaml
policy:
  allow_implicit_invocation: false
```

### Exception: model invocation

Allow implicit model invocation only when autonomous discovery materially matters or another skill must be able to reach the capability. Its description is routing metadata: state positive triggers, important boundaries, and near misses precisely enough for a model to choose it without guessing.

Set:

```yaml
policy:
  allow_implicit_invocation: true
```

Also add the skill to `MODEL_INVOKED_SKILLS` in `scripts/lib/repository-policy.js`; validation treats that set as the portfolio's reviewed invocation record.

Consider the context cost of exposing model-invoked descriptions against the burden of asking users to remember names. If several narrow skills compete for the same ambient prompts, prefer one focused router over many broadly triggered descriptions. A router should route only; downstream skills retain their own workflows and safety rules.

Skill-to-skill reach does not make every dependency model-invoked. Enable it only for a reusable capability that a parent cannot reliably request through an explicit supported handoff. Document precedence when two skills overlap and provide a graceful fallback when the dependency is unavailable.

Do not add client-specific fields such as `disable-model-invocation` to portable `SKILL.md` frontmatter. Map the reviewed decision in each client adapter:

- OpenAI: `policy.allow_implicit_invocation` in `agents/openai.yaml`
- Claude Code: generated `disable-model-invocation` in target `SKILL.md` files; explicit user invocation stays enabled
- Other clients: add an explicit mapping and validation profile before claiming compatibility

The builder emits generated targets under `.dist/targets/`. Never edit them as source. Static parity checks compare each target with the portable source and the reviewed invocation policy. They do not establish live routing behavior.

This policy follows the user-invocation default described in Matt Pocock's [writing-great-skills guidance](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-great-skills/SKILL.md).

## Package Shape

Create this minimum structure:

```text
skills/<skill-name>/
  SKILL.md
  agents/
    openai.yaml
```

Names use lowercase kebab-case, contain at most 64 characters, and match the folder exactly.

### Portable `SKILL.md`

Frontmatter requires `name` and `description`:

```yaml
---
name: "your-skill-name"
description: "A precise capability summary, with routing boundaries when model-invoked."
---
```

The description must be non-empty and no longer than 1,024 characters. The shared specification also permits `license`, `compatibility` (up to 500 characters), string-to-string `metadata`, and experimental `allowed-tools`. Our repository policy currently excludes tool approval declarations from the portable core because their semantics vary across hosts. Put authorship/version information under `metadata` when useful; keep runtime-specific invocation flags in adapters or generated output.

Write instructions in imperative language and give the agent the reason behind important constraints. Match the degree of freedom to the risk:

- use flexible principles when multiple approaches are safe;
- use a preferred pattern with parameters when consistency matters; and
- use exact steps when sequencing, mutation, or evidence integrity is fragile.

Keep `SKILL.md` focused and normally below about 500 lines. Put detailed schemas, examples, or domain references in `references/` and link them directly from the skill. Put reusable output material in `assets/`; put deterministic automation in `scripts/`. Avoid duplicate guidance and deep reference chains.

### OpenAI adapter

Repository policy requires every skill to have `agents/openai.yaml` with these fields; this is stricter than the upstream schema, where the adapter and fields are optional:

```yaml
interface:
  display_name: "Your Skill Name"
  short_description: "A concise interface summary between 25 and 64 chars"
  default_prompt: "Use $your-skill-name to perform the intended workflow."
policy:
  allow_implicit_invocation: false
```

The default prompt must contain the exact `$skill-name`. Keep it representative of the portable description and chosen invocation mode. Additional supported interface fields and `dependencies.tools` are preserved and validated. Adding MCP dependencies requires a Claude mapping before dual-target packaging can succeed; the builder fails rather than discarding them. The formatter changes presentation without removing metadata.

## Workflow Design

A strong skill normally explains:

1. entry conditions and exclusions;
2. the smallest useful workflow and its stopping condition;
3. which facts require evidence and how to preserve provenance;
4. mutation, publication, or user-confirmation boundaries;
5. recovery behavior when tools, files, or dependent skills are unavailable; and
6. the expected response or artifact contract.

Ask only for information that can change the result. When safe, proceed with explicit assumptions instead of creating an unbounded interview. Default to chat output unless the user requested a durable file or the named skill explicitly exists to create one.

Keep capability instructions portable. Describe what access is needed, then use the host's available tools. Put runtime-specific invocation and interface metadata in adapters.

## Invocation Tests

Test routing separately from output quality. Run each case three times in fresh contexts because routing is nondeterministic.

For every user-invoked skill, verify:

1. an explicit request using the target client's syntax loads it;
2. an ambient domain match does not load it; and
3. a neighboring or ambiguous request does not load it.

For every model-invoked skill, verify:

1. realistic positive prompts trigger it reliably;
2. a dependent skill can reach it; and
3. near-miss prompts do not trigger it.

Record the exact client version, configuration, tested artifact revision, prompts, and results. These live tests are separate from the deterministic `check:parity` gate; do not report them as passing when they were not run. Trace the selected skill when the host exposes routing traces. Otherwise use an observable behavior unique to the skill and state that the result is an inference.

## Behavioral Tests

Forward-test consequential workflows in fresh contexts. Give the test agent the revised skill and a realistic prompt, but do not disclose the bug or expected fix. Compare against both the previous skill and a no-skill baseline using observable assertions, filesystem diffs, evidence traces, and blind review where practical.

Cover success, partial input, near-miss, unavailable dependency, unsafe mutation, and stale or conflicting evidence cases. Follow the [Agent Skills evaluation guidance](https://agentskills.io/skill-creation/evaluating-skills) for larger evaluations.

## README and Links

Add or update the README Skill Index whenever a skill is added, renamed, removed, materially re-described, or changes invocation mode. Use `User` or `Model` exactly in the Invocation column.

All relative Markdown links inside a skill package must resolve. Prefer links one level deep from `SKILL.md` so agents can load supporting context progressively.

## Validate

Run from the repository root:

Install Python 3.11+ and uv, then run:

```bash
npm ci
npm run setup:spec
npm run format
npm run check
npm run oci:smoke
```

The formatter preserves YAML values and comments, including unsupported fields. Validation reports unsupported fields instead of deleting them. Formatting preflights the entire batch before writing. `npm run check` uses the pinned upstream `skills-ref` API for shared-core validation and separately reports OpenAI, Claude Code, repository policy, package integrity, static parity, and conditional native plugin checks. Our ASCII naming convention, nonempty bodies, and stricter YAML metadata types are repository checks, not replacements for the reference validator. To upgrade the reference, deliberately update its Git commit pin and lockfile, inspect upstream changes, and run the full checks. The OCI smoke test checks both generated target collections inside the actual archive. See [validation coverage](docs/validation.md) for limitations and schema sources.

## Review Checklist

- [ ] The folder and `name` match and use lowercase kebab-case.
- [ ] Portable frontmatter follows the shared specification and repository policy.
- [ ] The invocation mode is justified in the change description.
- [ ] `agents/openai.yaml` contains the repository-required interface and explicit policy fields without losing optional metadata.
- [ ] The default prompt contains the exact `$skill-name`.
- [ ] The README description and Invocation column are synchronized.
- [ ] The workflow has clear boundaries, evidence rules, stopping conditions, and fallbacks.
- [ ] Mutation and publication require the authority implied by the user's request.
- [ ] Detailed material uses progressive disclosure without broken links.
- [ ] Invocation tests cover positive, ambient, and near-miss cases three times.
- [ ] Forward tests compare the revision with the previous skill or a no-skill baseline.
- [ ] `npm run format`, `npm run check`, and `npm run oci:smoke` pass.
