# Research Protocol

Use this file as the authoritative source for effort sizing and durable research artifact structure.

## Research Tiers

Pick a tier before launching research.

- **Tier 0 - Single context**: small or familiar task. Research and synthesize in the current context without subagents or a research folder.
- **Tier 1 - Light**: several focused research areas. Create `.agents/research/<slug>/` with `CONTEXT.md` and `findings/`. Use a shallow guard such as nesting depth <= 2 and a small total-agent cap.
- **Tier 2 - Research project**: many areas, unfamiliar domain/codebase, expensive decision, or high-stakes change. Add `INDEX.md`; use a larger but explicit max depth and total-agent cap.

When unsure, recommend the smaller tier. Escalate only when research reveals missing surface area.

Tiering is complete when the research run names the tier, why it fits, whether artifacts will be created, and the guard on agent count/depth.

## Research Folder

For Tier 1+, store research in an IDE-agnostic folder. Prefer an existing ignored agent-artifact folder if the repo clearly has one; otherwise use:

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
- Tier guard.

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

`INDEX.md` lists each agent, its goal, and its findings file.

## Slugs and Paths

Use a short lowercase ASCII slug from the research goal. Prefer stable paths over clever names.

Examples:

- `.agents/research/auth-session-timeout/`
- `.agents/research/camera-purchase-portrait-work/`
- `.agents/research/skills-research-orchestration/`

Store research artifacts under `.agents/research/<slug>/`; reserve `.cursor/` for plan files or IDE-specific state.
