# Research Protocol

Use this file as the authoritative source for effort sizing and durable research artifact structure.

## Research Tiers

Pick a tier before launching research.

- **Tier 0 - Single context**: small or familiar task. Research and synthesize in the current context without `research-orchestrator`-managed delegation or a research folder. A calling planner may still use its own ephemeral leaf scouts before routing here.
- **Tier 1 - Light**: several focused research areas whose persistence is authorized. Create `.agents/research/<slug>/` with `CONTEXT.md` and `findings/`. Use a shallow guard such as nesting depth <= 2 and a small total pass budget.
- **Tier 2 - Research project**: many areas, unfamiliar domain/codebase, expensive decision, or high-stakes change whose persistence is authorized. Add `INDEX.md`; use a larger but explicit max depth and total pass budget.

When unsure, recommend the smaller tier. Escalate only when research reveals missing surface area.

Tiering is complete when the research run names the tier, why it fits, whether artifact writes are authorized, and the guard on total passes and depth.

## Artifact Authorization

Selecting or invoking this skill does not authorize persistent writes. Before starting Tier 1+ research, confirm that the user, request, or governing workflow explicitly authorizes research artifacts in the target repository.

Without that authorization, do not create or edit `.agents/research/`. Keep the work read-only, return findings in the current context, and do not claim a durable handoff exists.

## Pass Budget

One pass is one launched research-agent attempt. The initial assignment, every retry, and every reassignment each consume one pass, including failed or partial attempts.

Do not reset or evade the budget by renaming a question or replacing its owner. When the budget is exhausted, stop launching agents and hand unresolved questions back to the caller.

## Research Folder

For an authorized Tier 1+ run, store research in an IDE-agnostic folder. Prefer an existing ignored agent-artifact folder if the repo clearly has one; otherwise use:

```text
.agents/research/<slug>/
  CONTEXT.md
  findings/
  INDEX.md            # Tier 2 only
```

`CONTEXT.md` is the shared brief every agent reads first:

- Goal.
- Scope and out-of-scope boundaries.
- Constraints and known assumptions.
- User priorities or product intent.
- Relevant files, sources, or starting points.
- Tier guard, including max nesting depth, total pass budget, and passes consumed.

Each findings file uses this shape:

```markdown
# Findings: [Area]

## Goal
[Specific research question]

## What I Did
[Files/sources explored and approach]

## Findings
[Dense factual summary; no raw dumps]

## How This Advances the Goal
[What this unlocks, recommends, or rules out]

## Open Questions / Handoffs
[Only unresolved items]
```

`INDEX.md` lists each agent attempt, its goal, findings file, status, and consumed pass.

## Slugs and Paths

Use a short lowercase ASCII slug from the research goal. Prefer stable paths over clever names.

Examples:

- `.agents/research/auth-session-timeout/`
- `.agents/research/camera-purchase-portrait-work/`
- `.agents/research/skills-research-orchestration/`

Store research artifacts under `.agents/research/<slug>/`; reserve `.cursor/` for plan files or IDE-specific state.
