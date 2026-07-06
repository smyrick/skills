# Shared Artifact Routing

Deliver one authoritative artifact. Avoid creating two competing sources of truth.

## Priority Order

1. **IDE plan owns the work**: if Cursor Plan mode or `CreatePlan` owns the plan, deliver and revise there. Create a markdown export only when the user asks.
2. **User named a file**: edit that file in place.
3. **Thread already established a file**: keep updating the same file.
4. **Standalone planning**: save a new markdown file.

## Research Artifacts vs Final Plan

Keep supporting research separate from the final plan:

- Research artifacts live under `.agents/research/<slug>/`.
- Final handoff artifacts live in the IDE plan or a markdown plan file.
- The final artifact may link to the research folder.

## Default File Locations

For standalone implementation plans:

- Prefer an already-ignored plan folder if the repo clearly has one.
- Otherwise use `<workspace-root>/.cursor/plans/`.
- Filename: `<short-slug>_<uuid-or-16-hex>.md`.

For standalone personal decision plans:

- Prefer a user-specified path.
- Otherwise use `<workspace-root>/.cursor/plans/` or `<workspace-root>/plans/` when that folder already exists.
- Filename: `<descriptive-slug>.md`.

Do not edit `.gitignore` unless the user asks.

## Completion Message

When saving a file, report the exact path and state that it is the authoritative handoff. When using an IDE plan, state that the IDE plan is authoritative.
