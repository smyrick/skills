# Shane Myrick's Skills Library

A personal library of reusable AI-agent workflows. Each skill has a portable `SKILL.md` core and an OpenAI adapter that defines its display metadata, starter prompt, and invocation policy.

## Install

Install every skill with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add smyrick/skills
```

Use `npx skills add smyrick/skills --list` to inspect the collection first. Agents that do not support the OpenAI adapter can still follow each portable `SKILL.md` directly.

## Skill Index

Invocation is intentional. **User** skills run only when explicitly named, normally as `$skill-name`. **Model** skills may also be selected automatically or reached by another skill.

| Skill | Invocation | Description | Key capabilities |
|-------|------------|-------------|------------------|
| [codebase-summary](./skills/codebase-summary/SKILL.md) | User | Document codebase architecture and key flows, with an optional self-contained HTML artifact | Repository exploration, diagrams, HTML validation |
| [human-review-pr](./skills/human-review-pr/SKILL.md) | User | Help a human review PRs and local diffs with a compact brief and guided discussion | Code and product decisions, light architecture review, evidence-backed findings |
| [humanize-text](./skills/humanize-text/SKILL.md) | User | Rewrite prose while preserving facts, protected text, and the writer's voice | Text transformation, fidelity checks |
| [manage-product-glossary](./skills/manage-product-glossary/SKILL.md) | User | Create or update scoped `PRODUCT_TERMS.md` glossaries linked to product rules and code | Repository search, terminology management |
| [mock-interview](./skills/mock-interview/SKILL.md) | User | Run source-grounded interview practice with stage-specific feedback | Interactive interviewing, evidence-based scoring |
| [personal-research-and-plan](./skills/personal-research-and-plan/SKILL.md) | User | Compare evidence and tradeoffs for a non-code decision, then recommend concrete next steps | Current research, decision analysis |
| [research-and-plan](./skills/research-and-plan/SKILL.md) | User | Research a code change and return a decision-complete implementation plan without modifying code | Codebase research, implementation planning |
| [research-orchestrator](./skills/research-orchestrator/SKILL.md) | Model | Coordinate bounded, durable multi-pass research for another skill or user request | Evidence handoffs, bounded delegation |
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

Portable frontmatter contains only `name` and `description`. Runtime-specific behavior belongs in an adapter, not in `SKILL.md` frontmatter.

## Validate

```bash
npm install
npm run format
npm run check
npm run oci:smoke
```

`npm run check` verifies canonical formatting, portable metadata, OpenAI adapter contracts, invocation policy, local links, README synchronization, and contract tests. `npm run oci:smoke` packages the collection and verifies descriptors, archive safety, index contents, and the presence of every adapter. CI runs both commands.

## OCI Package

Tagged releases publish the collection to GitHub Container Registry:

```text
ghcr.io/smyrick/skills@sha256:<digest>
ghcr.io/smyrick/skills:vYYYY.MM.DD
ghcr.io/smyrick/skills:latest
```

Use digest pins when a consumer needs immutable installs.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for invocation-mode decisions, authoring rules, tests, and the review checklist.

## License

MIT — see [LICENSE](./LICENSE).
