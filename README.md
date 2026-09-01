# Shane Myrick's Skills Library

A personal library of reusable AI-agent workflows. Each skill has a portable `SKILL.md` core. OpenAI adapters supply interface metadata; the repository invocation policy also generates a Claude Code collection.

## Install

For Codex CLI, install every skill with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add smyrick/skills --agent codex
```

Use `npx skills add smyrick/skills --list` to inspect the collection first. This installs the source collection, whose invocation controls are OpenAI-specific.

For Claude Code, clone this repository, build the target collection, then install that local collection:

```bash
npm ci
npm run setup:spec
npm run build:targets
npx skills add ./.dist/targets/claude --agent claude-code --copy
```

The generated `SKILL.md` files include Claude Code invocation controls. Use `--copy` to keep this variant in Claude's directory instead of overwriting the shared canonical skills directory used by other agents. Keep OpenAI and Claude target directories physically separate. Do not install the portable source directly into Claude Code if explicit-only invocation matters. These are Claude Code packages, not claude.ai upload packages. Other harnesses can read the portable instructions, but their invocation behavior is unverified.

## Skill Index

Invocation is intentional. **User** skills are configured for explicit invocation in the OpenAI and generated Claude Code collections. **Model** skills may also be selected automatically or reached by another skill. Use the host's invocation syntax (`$skill-name` in Codex CLI, `/skill-name` in Claude Code); live routing tests are separate from static validation.

| Skill | Invocation | Description | Key capabilities |
|-------|------------|-------------|------------------|
| [codebase-summary](./skills/codebase-summary/SKILL.md) | User | Document codebase architecture and key flows, with an optional self-contained HTML artifact | Repository exploration, diagrams, HTML validation |
| [human-review-pr](./skills/human-review-pr/SKILL.md) | User | Help Shane review PRs and local diffs with a compact brief and discussion calibrated to his enterprise architecture background | Code and product decisions, light architecture review, contextual refreshers, evidence-backed findings |
| [human-reviewable-code](./skills/human-reviewable-code/SKILL.md) | User | Shape coding work and long conversations into reviewable chunks with concise PR documentation | Scope boundaries, fresh-task handoffs, code clarity, expandable PR details |
| [humanize-text](./skills/humanize-text/SKILL.md) | User | Rewrite prose while preserving facts, protected text, and the writer's voice | Text transformation, fidelity checks |
| [manage-product-glossary](./skills/manage-product-glossary/SKILL.md) | User | Create or update scoped `PRODUCT_TERMS.md` glossaries linked to product rules and code | Repository search, terminology management |
| [mock-interview](./skills/mock-interview/SKILL.md) | User | Run source-grounded interview practice with stage-specific feedback | Interactive interviewing, evidence-based scoring |
| [personal-research-and-plan](./skills/personal-research-and-plan/SKILL.md) | User | Plan a non-code decision through direct research, read-only leaf scouts, or an internal durable research subworkflow | Current research, decision analysis |
| [research-and-plan](./skills/research-and-plan/SKILL.md) | User | Plan a code change through direct research, focused read-only delegation, or an internal durable research subworkflow, with selective independent review | Codebase research, implementation planning |
| [research-orchestrator](./skills/research-orchestrator/SKILL.md) | Model | Coordinate authorization-gated durable research with clear assignment limits, flexible exploration, bounded passes, recovery, and a research-only handoff | Evidence handoffs, bounded delegation |
| [shorten-response](./skills/shorten-response/SKILL.md) | User | Apply concise coworker-style response mode without losing technical depth or caveats | Response shaping |
| [write-a-prd](./skills/write-a-prd/SKILL.md) | User | Create a bounded, decision-ready product requirements document | Product discovery, optional codebase context |

The portfolio deliberately has no router today: the explicit skills are distinct, few enough to scan here, and their names map cleanly to deliberate workflows. Add a router only if observed invocation tests show that remembering the names is a recurring burden.

## Use

Explicitly invoke a user skill by name:

```text
Use $research-and-plan to research this change and produce an implementation plan.
```

`research-orchestrator` is the only model-invoked skill. Planning skills can reach it when durable, multi-pass research materially improves the result; a simple question should not trigger it.

## Repository Contract

```text
skills/
  <skill-name>/
    SKILL.md                 # Portable capability and workflow
    agents/
      openai.yaml            # OpenAI interface and invocation policy
    references/              # Optional details loaded only when needed
    assets/                  # Optional output templates or static assets
```

Portable frontmatter follows the Agent Skills specification, including its supported optional metadata. Runtime-specific fields belong in an adapter or generated target package. The repository currently excludes experimental tool approval declarations from the portable core.

## Validate

Validation requires Node.js, Python 3.11+, and [uv](https://docs.astral.sh/uv/). Install the pinned upstream reference validator once before running checks:

```bash
npm ci
npm run setup:spec
npm run format
npm run check
npm run oci:smoke
```

`npm run check` runs formatting checks, independently reported validation groups, and regression tests. Each group can also run directly:

| Command | Scope |
| --- | --- |
| `npm run check:skills` | Official `skills-ref` validator at a pinned upstream commit |
| `npm run check:openai` | OpenAI adapter schema profile; adapters are optional at this layer |
| `npm run check:claude` | Claude Code extensions in generated skill output |
| `npm run check:policy` | Our adapter requirements, invocation choices, neutral instructions, and README index |
| `npm run check:package` | Local links and icons resolve inside package contents |
| `npm run check:parity` | Target generation preserves instructions/resources and maps invocation policy |
| `npm run check:plugins` | Conditional skill-only native plugin manifest profiles |

The core check calls the upstream `skills_ref.validate` API; it does not maintain a second implementation of the spec. `tools/skills-ref/pyproject.toml` pins the source commit and `uv.lock` pins its dependencies. Checks run offline after setup and fail explicitly if the reference validator cannot run.

Formatting preserves YAML values and comments, including unknown fields; validation reports unsupported fields without deleting them. A malformed batch is rejected before any formatting writes.

`npm run oci:smoke` builds both target collections and verifies their actual archived contents, descriptors, paths, references, and index entries. Native plugin checks report `SKIP` when no manifests exist. Live client discovery, invocation, and execution report `NOT RUN`; schema and artifact parity checks do not prove runtime behavior. See [validation coverage and source baselines](docs/validation.md).

## OCI Package

Tagged releases publish the collection to GitHub Container Registry:

```text
ghcr.io/smyrick/skills@sha256:<digest>
ghcr.io/smyrick/skills:vYYYY.MM.DD
ghcr.io/smyrick/skills:latest
```

Use digest pins when a consumer needs immutable installs. The archive retains the original `skills/` collection and additionally includes `targets/openai/skills/` and `targets/claude/skills/`. The index retains existing fields and adds per-target paths. These collections do not include native plugin manifests.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for invocation-mode decisions, authoring rules, tests, and the review checklist.

## License

MIT — see [LICENSE](./LICENSE).
