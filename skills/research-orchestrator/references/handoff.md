# Research Handoff

Use this file for synthesis and downstream consumption.

## Synthesis Gate

After research, synthesize findings before drafting a plan or asking the user questions.

Capture:

- Key options, files, APIs, sources, or patterns.
- Constraints and gotchas.
- Tradeoffs discovered.
- Gaps only the user can answer.
- What was ruled out and why.

For Tier 1+, read the findings docs as the durable source of truth.

Synthesis is complete when every remaining question is user-owned rather than discoverable through more research.

## Final Research Handoff

Return a compact handoff. This shape is the completion target for every Tier 1+ research run:

```markdown
## Research Handoff

Research folder: `.agents/research/<slug>/`

### Summary
[Dense synthesis.]

### Key Findings
- [Finding]
- [Finding]

### Files / Sources
- [Path or source] - [why it matters]

### Open Questions
- [Only user-owned or blocked questions]

### Recommended Next Step
[Planning skill, decision point, implementation area, or further research.]
```

## Downstream Skill Use

When another skill consumes the research:

- Link the research folder in its final artifact.
- Treat `CONTEXT.md` and `findings/` as source material, not as the final plan.
- Preserve unresolved user-owned questions instead of inventing decisions.
- Keep the reusable research protocol in `research-orchestrator`; downstream skills should link to the research folder and add only their domain-specific planning or decision layer.
