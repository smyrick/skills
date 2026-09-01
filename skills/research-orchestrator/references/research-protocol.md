# Research Protocol

Use this as the authoritative protocol for sizing, safe persistence, run identity, budgets, and evidence.

## Contents

- Research modes and budgets
- Safe storage and run identity
- Shared files and parent ownership
- Evidence and findings format
- Stop conditions

## Research Modes and Budgets

Choose the smallest mode that can answer the caller's material questions:

- **Tier 0 — current context**: one bounded pass, no research folder, and no `research-orchestrator`-managed delegation. Return control to the calling workflow; it may still use its own ephemeral leaf scouts.
- **Tier 1 — light durable research**: a small set of focused questions. Default to at most three research passes, one wave, and nesting depth one.
- **Tier 2 — research project**: broad, unfamiliar, expensive, or consequential work. Default to at most six total passes, two waves, and nesting depth two.

One research pass is one launched agent attempt. Every initial assignment, independent review, retry, and reassignment consumes a pass, including failed or partial attempts. Do not reset or evade the budget by renaming a question or replacing its owner.

Pass count and concurrent capacity are separate limits. Sequence work that consumes earlier findings; a dependent follow-up or review needs a later wave within the recorded budget. Allocate review and recovery room when their expected value warrants it, but do not require either for every run. Budget ceilings are firm; suggested starting sources and methods may change as evidence develops within those ceilings.

Respect any lower host or user limit. Before Tier 1 or Tier 2 work, record:

- Maximum agents or research passes, nesting depth, and waves.
- A concrete timebox or deadline.
- A token ceiling when usage is observable. Otherwise mark it `unavailable` and enforce a fixed question, wave, and source-check cap instead.
- The materiality test: what new evidence could still change the downstream plan or decision.

Do not expand a budget merely because more discoverable questions exist. Ask before materially exceeding a user-approved budget.

## Safe Storage and Consent

Routing to or invoking this skill does not authorize persistent research. Without explicit authorization, return findings in the current context and create no repository folder, temporary run, or other persistent artifact.

After persistence is authorized, use this path order:

1. A location the user explicitly supplied or approved.
2. An existing agent-artifact directory that is verified as ignored by version control.
3. A temporary directory outside the repository, with its retention limits disclosed in the handoff.

Never create an unignored repository folder without explicit consent. If ignore status cannot be verified, use a temporary location or return findings in chat. Do not persist credentials, secrets, private keys, sensitive personal information, or unnecessary identifying details. Sanitize the shared brief before delegation.

## Stable Slugs, Collisions, and Resume

Derive a short lowercase ASCII base slug from the goal. Before writing, inspect any matching run:

- Resume only when the goal and scope match, the prior run is incomplete or explicitly selected, and its evidence is still usable.
- Record the resume time, prior status, and changed scope in `RUN.md`.
- Otherwise create a versioned run such as `{slug}-YYYYMMDD-2`.
- Never silently overwrite a completed run or mix evidence from different goals.

`RUN.md` records run ID, base slug, goal digest or summary, tier, created and updated times, research-as-of date, status, storage decision, budget, stop rule, and resume or version history.

## Shared Files and Parent Ownership

For Tier 1 and Tier 2, use:

```text
{research-root}/{run-slug}/
  RUN.md
  CONTEXT.md
  INDEX.md
  findings/
    01-area.md
```

The parent alone writes `RUN.md`, `CONTEXT.md`, and `INDEX.md`. `CONTEXT.md` contains the sanitized goal, scope, constraints, assumptions, caller priorities, starting sources, research questions, evidence standard, and budget. `INDEX.md` maps each allocated attempt ID and consumed pass to its question, owner, unique findings path, and status: `pending`, `running`, `complete`, `partial`, `failed`, or `recovered`.

Keep `CONTEXT.md` compact and distinguish firm limits from suggested starting points. Link relevant evidence rather than copying conversation history or raw source dumps into every assignment.

Children write only their assigned findings file. If a child cannot write it, the child returns exact markdown and the parent persists it.

## Evidence and Findings Format

Cited sources are authoritative; findings files are working notes. Every material finding must include:

- **Claim**: concise fact or inference, labeled correctly.
- **Evidence**: exact `path:line` and symbol plus revision or working-tree state for code; title, publisher, URL, publication or update date when available, and access date for web sources.
- **Context**: relevant locale, market, currency, version, or time range.
- **Confidence**: high, medium, or low with a short reason.
- **Contradictions / gaps**: conflicting evidence, staleness, missing coverage, or `None found`.

Use this findings shape:

```markdown
# Findings: [Area]

## Goal and Method
[Bounded question, sources inspected, and limitations.]

## Findings
### [Finding]
- **Claim**: [...]
- **Evidence**: [...]
- **Context**: [...]
- **Confidence**: [...]
- **Contradictions / gaps**: [...]

## How This Advances the Goal
[What this supports, rules out, or leaves for the caller to decide.]

## Open Questions / Handoffs
[Only material unresolved items.]
```

Summarize evidence; do not paste raw dumps or sensitive source content.

## Stop Conditions

Stop when the material questions have sufficient evidence, further research is unlikely to change the downstream choice, a recorded budget is exhausted, or safety or access blocks progress. Mark residual uncertainty and failed coverage explicitly. Do not require every discoverable question to be resolved.
