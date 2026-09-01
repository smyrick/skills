# Agent Lifecycle

Use this protocol for bounded parent and child coordination.

## Parent Responsibilities

The research orchestrator is the sole owner of its assignments, child lifecycle, run budget, and shared state. A calling planner or other workflow treats it as one worker and does not launch duplicate agents for the same questions or intervene in its children.

Choose delegation for a material benefit in coverage, independent challenge, context isolation, or elapsed time. Keep work local when specification and integration cost outweigh that benefit. Identify dependencies and integration needs before launching; use concurrent scouts or a later focused review only when the questions warrant them, not a fixed roster. Reserve capacity for coordination and likely recovery rather than filling every available slot.

Before every launch, reserve one pass from the run's total budget. The parent then:

1. Allocates a unique attempt ID, bounded question, owner, and findings path.
2. Adds the assignment to `INDEX.md` as `pending`, then marks it `running` when launched.
3. Gives the child a compact sanitized brief, relevant source pointers, evidence standard, and applicable budget. Pass only the context needed; use conversation inheritance only when the assignment depends on it and the runtime supports it.
4. Collects the result, inspects the assigned file or returned markdown, and updates status.
5. Reopens material cited sources before using a finding in synthesis.

Launch work in parallel only when the questions and output paths are independent. Default to parent-only delegation. Permit nested delegation only when the parent explicitly allocates child IDs, namespaces, paths, and budget so the global cap remains enforceable.

For consequential or disputed findings, consider an independent evidence review with named assumptions, risks, and acceptance criteria to challenge. Schedule it after its prerequisite findings, count it against the original pass and wave limits, and retain unresolved disagreements in synthesis. It does not make downstream design decisions or replace the parent's source verification.

Match each assignment to the available, authorized capabilities and its quality, latency, and cost needs. Do not require a particular model, configurable reasoning setting, or agent-management API. If delegation is unavailable, carry out bounded research passes sequentially in the current session, preserving the same evidence, ownership, and budget rules; do not describe those passes as independent-agent validation.

## Assignment Boundaries

Define the question and success criteria clearly without prescribing every step or the expected conclusion. Separate **firm limits** (objective, explicit exclusions, permitted access and writes, privacy, approvals, budget, and stop conditions) from **suggested boundaries** (starting files, sources, hypotheses, and methods).

Suggested boundaries focus effort without becoming an exhaustive allowlist. A child may follow an unexpected dependency, test an alternative explanation, or choose another method when it advances the same question within firm limits. It need not ask permission for each such adjustment; report meaningful departures and what they revealed. If a lead would change the objective, cross an explicit exclusion, require new authority, or exceed the budget, return its relevance and proposed follow-up to the parent instead of pursuing it. The parent retains any user approval requirement. Delegation never expands authority.

## Delegation Prompt Shape

```text
Read {run-dir}/CONTEXT.md first.

Assignment ID: [ID]
Question: [one bounded research question]
Purpose: [which uncertainty or downstream decision this informs]
Inputs: [required artifacts and references; explicitly name any skill to load]
Suggested starting scope: [likely files, sources, hypotheses, or methods; not exhaustive]
Firm limits: [objective boundaries, explicit exclusions, permitted sources/systems,
              inherited approval/privacy/credential/external-write restrictions]
Write only: {run-dir}/findings/NN-area.md
Budget: [sources, passes, time or token bound, and stop condition]
Acceptance: [what sufficient evidence or a useful partial answer must establish]

Choose your approach and follow relevant leads within firm limits.
Report material departures from the starting scope and useful out-of-scope leads.

For each material finding include:
- claim labeled as fact or inference
- exact path:line and symbol, or publisher/title/URL
- version or publication/update date and access date when relevant
- context such as locale, market, currency, or time range
- confidence with reason
- contradictions, staleness, and gaps

Do not edit RUN.md, CONTEXT.md, INDEX.md, application code, or unrelated files.
If writing is unavailable, return the exact findings markdown.
If blocked, report the missing evidence or access and the resulting limitation.
Return a compact completion summary after the findings are ready.
```

## Child Responsibilities

The child reads the shared context, stays within the assigned question and budget, and writes only its unique findings file. It treats original files and external sources as authoritative and its own summary as working notes. It does not launch descendants unless the parent explicitly granted a namespace and budget.

The child stops when the question has sufficient material evidence, the budget trips, or access blocks progress. It records partial coverage and contradictions rather than overstating certainty.

## Failure and Recovery

When a child fails, times out, returns unsupported claims, or cannot write:

1. Mark the assignment `failed` or `partial` with the reason; do not leave it `running`.
2. If the question is material, the failure appears transient, and the pass budget has room, allow at most one bounded retry.
3. Otherwise reassign it, complete it sequentially in the parent, or mark the gap unresolved.
4. Treat every retry, reassignment, or replacement as a new pass with a unique attempt ID and findings path; preserve the earlier attempt and never run duplicate owners concurrently.
5. Mark recovered work `recovered` and preserve the failure history.
6. Never claim complete coverage when a material assignment remains unresolved.

Do not reset or evade the pass budget by renaming a question or replacing its owner. When the budget is exhausted, stop launching agents and hand the unresolved gap to the caller.

At shutdown, the parent confirms that every allocated ID has a terminal status and updates `RUN.md` to `complete`, `partial`, or `blocked` before synthesis.
