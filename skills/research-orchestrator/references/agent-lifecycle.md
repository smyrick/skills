# Agent Lifecycle

Use this protocol for bounded parent and child coordination.

## Parent Responsibilities

The parent owns the run budget and all shared state:

1. Allocate a unique ID, bounded question, owner, and findings path.
2. Add the assignment to `INDEX.md` as `pending`, then mark it `running` when launched.
3. Give the child the sanitized context, evidence standard, and applicable budget.
4. Collect the result, inspect the assigned file or returned markdown, and update status.
5. Reopen material cited sources before using a finding in synthesis.

Launch work in parallel only when the questions and output paths are independent. Default to parent-only delegation. Permit nested delegation only when the parent explicitly allocates child IDs, namespaces, paths, and budget so the global cap remains enforceable.

## Delegation Prompt Shape

```text
Read {run-dir}/CONTEXT.md first.

Assignment ID: [ID]
Question: [one bounded research question]
Write only: {run-dir}/findings/NN-area.md
Budget: [sources, passes, time or token bound, and stop condition]

For each material finding include:
- claim labeled as fact or inference
- exact path:line and symbol, or publisher/title/URL
- version or publication/update date and access date when relevant
- context such as locale, market, currency, or time range
- confidence with reason
- contradictions, staleness, and gaps

Do not edit RUN.md, CONTEXT.md, INDEX.md, application code, or unrelated files.
If writing is unavailable, return the exact findings markdown.
Return a compact completion summary after the findings are ready.
```

## Child Responsibilities

The child reads the shared context, stays within the assigned question and budget, and writes only its unique findings file. It treats original files and external sources as authoritative and its own summary as working notes. It does not launch descendants unless the parent explicitly granted a namespace and budget.

The child stops when the question has sufficient material evidence, the budget trips, or access blocks progress. It records partial coverage and contradictions rather than overstating certainty.

## Failure and Recovery

When a child fails, times out, returns unsupported claims, or cannot write:

1. Mark the assignment `failed` or `partial` with the reason; do not leave it `running`.
2. If the question is material and the failure appears transient, allow at most one bounded retry.
3. Otherwise reassign it, complete it sequentially in the parent, or mark the gap unresolved.
4. Mark recovered work `recovered` and preserve the failure history.
5. Never claim complete coverage when a material assignment remains unresolved.

At shutdown, the parent confirms that every allocated ID has a terminal status and updates `RUN.md` to `complete`, `partial`, or `blocked` before synthesis.
