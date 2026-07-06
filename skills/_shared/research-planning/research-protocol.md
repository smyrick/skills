# Shared Research Planning Protocol

Use this protocol from both `research-and-plan` and `personal-research-and-plan`. It owns the common mechanics; the invoking skill owns domain-specific questions, research dimensions, and artifact template.

## Research Tiers

Pick a tier before launching research. Confirm the tier with the user unless the active environment already requires a fixed planning flow.

- **Tier 0 — Single context**: small or familiar task. No subagents and no research folder. Research and synthesize in the current context.
- **Tier 1 — Light**: several focused research areas. Create `.agents/research/<slug>/` with `CONTEXT.md` and `findings/`. Use a shallow guard such as nesting depth <= 2 and a small total-agent cap.
- **Tier 2 — Research project**: many areas, unfamiliar domain/codebase, expensive decision, or high-stakes change. Add `INDEX.md`; use a larger but explicit max depth and total-agent cap.

When unsure, recommend the smaller tier. Escalate only when research reveals missing surface area.

Tiering is complete when the plan names the tier, why it fits, whether artifacts will be created, and the guard on agent count/depth.

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

## Agent Lifecycle

Every agent follows the same lifecycle, including nested agents:

1. Read `CONTEXT.md` plus the parent goal.
2. Write its specific goal at the top of its findings file.
3. Research using the tools appropriate to the invoking skill.
4. Assess whether the goal is fully answered.
5. If sub-questions remain and the tier guard allows it, spawn child agents with `CONTEXT.md` plus the sub-goal.
6. Fold child findings into the parent findings.
7. Spin down by finishing "How This Advances the Goal" and "Open Questions / Handoffs".

Stop when the goal is answered or the guard trips. If the guard trips, record unresolved questions and hand them up.

## Synthesis Gate

After research, synthesize findings before drafting or asking user questions.

Capture:

- Key options, files, APIs, sources, or patterns.
- Constraints and gotchas.
- Tradeoffs discovered.
- Gaps only the user can answer.

For Tier 1+, read the findings docs as the durable source of truth.

Synthesis is complete when every remaining question is user-owned rather than discoverable through more local research.

## Design Tree

Resolve choices as a design tree: upstream decisions before downstream decisions.

Question discipline:

- Ask one focused question at a time unless the questions are independent.
- Do not ask the user to confirm facts research already answered.
- Give a recommended option and one-line reason.
- Name the tradeoff each option accepts.
- Record accepted assumptions and defaults in the final artifact.

The design tree is complete when the implementer or decision-maker should not need to invent missing intent.

## Review Gate

Before final delivery, review the draft with the user. Cover:

- What is included and excluded.
- Whether order, priority, or recommendation matches the user's real goal.
- Known risks, edge cases, and counterarguments.
- Assumptions that need approval.
- Any confidence or commitment gap.

Revise if new information changes scope, order, recommendation, or risk. Deliver only when the artifact is self-contained and the remaining assumptions are explicit.
