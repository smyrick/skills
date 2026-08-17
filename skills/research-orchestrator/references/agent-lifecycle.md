# Agent Lifecycle

Use this file for parent/child research coordination.

## Lifecycle

Every agent follows the same lifecycle, including nested agents:

1. Read `CONTEXT.md` plus the parent goal.
2. Write its specific goal at the top of its findings file.
3. Research using the appropriate tools.
4. Assess whether the goal is fully answered.
5. If sub-questions remain and both the depth and total pass guards allow it, consume one pass and spawn a child agent with `CONTEXT.md` plus the sub-goal.
6. Fold child findings into the parent findings.
7. Spin down by finishing "How This Advances the Goal" and "Open Questions / Handoffs".

Stop when the goal is answered or the guard trips. If the guard trips, record unresolved questions and hand them up.

## Ownership and Recovery

The research orchestrator is the sole owner of its assignments and child lifecycle. A calling planner or other parent treats the orchestrator as one worker and must not launch duplicate agents for the same research questions or intervene in its children.

On failure or insufficient findings, retry or reassign only when the total pass budget has room. Every new attempt consumes one pass. Record the prior attempt, its outcome, and why another pass is warranted; never give concurrent attempts the same findings path. When the budget is exhausted, stop and hand the gap back to the caller.

## Delegation Prompt Shape

Give each subagent a compact prompt:

```text
Read .agents/research/<slug>/CONTEXT.md first.

Goal: [specific research question]
Write findings to: .agents/research/<slug>/findings/NN-area.md

Use this findings shape:
- Goal
- What I Did
- Findings
- How This Advances the Goal
- Open Questions / Handoffs

Return only a compact completion summary after writing the file.
```

## Guardrails

- Keep each agent's goal narrow enough for one focused pass.
- Assign one owner per findings file in each research wave.
- Count initial assignments, retries, and reassignments against the same total pass budget.
- Summarize evidence in findings; link or name raw files, articles, and logs instead of pasting dumps.
- Persist Tier 1+ findings to files as the durable output.
- If an agent cannot write files in the current environment, have it return the exact findings markdown for the parent to persist.
