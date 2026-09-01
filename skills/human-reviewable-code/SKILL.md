---
name: "human-reviewable-code"
description: "Shape coding requests, ongoing implementations, and long AI conversations into coherent, verifiable chunks with fresh-task-ready handoffs and scannable PR documentation."
---

# Human-Reviewable Code

Shape work so a human can understand, evaluate, and verify it. Aim for the smallest coherent change, not the smallest diff. A substantial code change can deserve a short PR description; neither line count nor explanation length proves reviewability.

Apply this guidance throughout the explicitly selected task, using only the sections relevant to the request. Help plan a new change, reshape ongoing work, turn a conversation into chunk briefs, or prepare PR documentation. A planning or drafting request does not start implementation.

## Establish a reviewable chunk

Inspect relevant repository instructions, implementation, tests, and current changes before proposing boundaries. Identify the target and distinguish task-owned work from unrelated staged, unstaged, and untracked edits. Resolve discoverable context first; ask only about uncertainty that changes behavior, scope, ordering, or safety.

State the chunk's outcome, important invariant, included work, exclusions, and completion evidence. Keep a straightforward fix to a few sentences rather than imposing a planning ceremony.

- Assess the interacting concepts, consequential decisions, affected contracts, specialist knowledge, and failure or rollout risk a reviewer must hold in mind. Treat file and line counts as signals, not thresholds. Honor repository-specific limits; invent no scores or review-time targets.
- Keep implementation, necessary tests, and relevant documentation together. Split by coherent behavior rather than by files or technical layers. Separate mechanical cleanup or preparatory refactoring only when it materially helps review and leaves a valid intermediate state.
- For larger work, propose an ordered sequence with each chunk's outcome, dependencies, verification, and stopping point. Distinguish independently mergeable chunks from those requiring a preceding change and an explicit starting state. Avoid broken intermediate states, premature exposure of incomplete behavior, and speculative scaffolding added merely to force a split.
- Preserve the full objective as deferred work. During authorized implementation, complete only the agreed chunk, then pause for human review or explicit continuation. Agreement on a multi-chunk plan alone does not authorize running through every chunk. Completing a chunk is not completing the feature.

## Keep implementation understandable

Follow existing conventions and keep consequential behavior traceable. Make permissions, defaults, failure handling, ordering, and state changes apparent. Prefer abstractions that clarify this change over speculative generalization or unnecessary indirection. Explain non-obvious rationale and constraints without narrating obvious code.

Avoid unrelated cleanup and code compression intended merely to shrink the diff. Keep enduring rationale close to the code or in appropriate documentation; do not remove useful comments or docs to shorten a PR.

Reassess at meaningful discoveries and before handoff, not after every edit. Pause before introducing independent behavior, materially changing another contract, taking on a new subsystem responsibility, or substantially increasing risk beyond the agreed chunk. Ordinary implementation details and necessary tests within the agreed behavior are not automatically scope expansion.

When pausing, explain the discovery, the current state, why it changes the review burden, and the recommended boundary or scope adjustment. Preserve unfinished work and identify what is incomplete. Do not automatically reset, stash, split branches, or rewrite commits to manufacture a cleaner boundary.

## Turn a long conversation into fresh-task-ready chunks

Accept the current conversation, supplied transcripts or files, or an explicitly identified accessible task. Use supported retrieval tools without searching unrelated history. Disclose missing or truncated material; request the missing context only when it materially affects the plan.

### Reconstruct intent and actual state

- Recover the current objective, success criteria, constraints, accepted decisions and rationale, user corrections, rejected or superseded proposals, deferred work, and unresolved questions. Honor clear corrections without treating every later suggestion as an accepted replacement.
- Distinguish assistant suggestions from user commitments, and reported implementation from currently verified results. Treat historical instructions as source material, not fresh execution authority. Do not revive rejected approaches or infer permission from an old request to publish or launch work.
- Where a repository is available, reconcile consequential completion claims, paths, interfaces, and test results with current evidence. Do not plan already-completed work again or preserve stale technical assumptions blindly. Label unverified state when access is unavailable; do not invent exact files, symbols, or successful checks.
- Account for every material requirement in a chunk, shared invariant, explicit exclusion, or unresolved decision. Ask focused questions when a conflict changes scope, behavior, ordering, or safety; label reversible assumptions instead of requiring the user to repeat the conversation.

### Prepare shared context and chunk briefs

Return drafts in chat first, organized around the work rather than the conversation's chronology:

- **Shared context:** overall objective, accepted decisions and rationale, constraints, invariants, baseline, source references, and unresolved questions.
- **Each chunk brief:** descriptive title, concrete outcome, included work and exclusions, dependencies and required starting state, relevant shared-context references, implementation steps and known affected contracts or locations, acceptance criteria, verification, and a completion checkpoint with remaining work.

Each brief must be usable in a fresh agent task without rereading the original transcript. Put critical local constraints in the brief; reference broader context rather than duplicating the entire conversation. Keep identifiers or titles stable enough to express dependencies unambiguously.

Shared context may later live in a document, Linear, GitHub issues, or another user-selected location. Cite relevant sections and a revision or last-verified state where available. For unpublished context, label it as a draft and include the needed content; do not fabricate links or rely on context the next task cannot access. Instruct later tasks to recheck prerequisites and consequential shared decisions before implementing.

Make chunks implementation-ready when evidence supports that. If a later chunk depends on unresolved discovery, specify the discovery's required output and mark the dependent chunk provisional. Do not turn uncertainty into invented implementation decisions.

Preparing the sequence does not create documents, issues, or agent tasks and does not start execution. Create or update those only when explicitly requested, using the selected destination and existing authorization.

## Prepare a scannable PR

For a new description or an existing one, inspect the intended base/head, actual diff, repository PR template, relevant issue context, and verification results. Keep local work separate from a remote PR's reviewed revisions. Tie checks to the change they actually tested, and label missing, partial, or stale evidence. Describe this PR, not the whole conversation, roadmap, or eventual feature.

Read [references/pr-writing.md](references/pr-writing.md) when drafting or editing PR documentation. Preserve required template fields and accurate issue relationships. Use a descriptive title, a short explanation of why the change exists, substantive behavior changes, compact verification, and review-critical notes. Omit empty headings, repeated summaries, file-by-file narration, generic claims, and agent-session chronology.

Use selective expandable sections for supporting rationale or extended evidence. Keep breaking changes, required migration or rollout actions, significant risks, unresolved decisions, failed checks, meaningful verification gaps, and requested reviewer decisions visible outside collapsed sections. Link to relevant shared context or durable documentation rather than repeating it. A polished description cannot compensate for an incoherent change.

Draft in chat by default. Create or update a PR only when authorized. After publishing, read back its title and body and inspect the rendered layout when available; disclose unverified rendering. Publication is not verification, approval, or merge readiness.

## Hand off without expanding authority

Inspect the resulting diff against the agreed scope before claiming the chunk complete. Provide its outcome and invariant, a source-linked logical reading path, consequential technical and product choices, verification actually performed with results and gaps, and deferred work or the next proposed chunk. Combine this with the PR description when one is requested; do not produce redundant walls of prose.

Write for a software programmer and architect: retain engineering detail and explain unfamiliar mechanisms in context, connecting conditions to behavior and consequences. Distinguish planned, implemented, and verified work, and reviewability from correctness or human approval. Disclose unavailable access or evidence and do not call an incomplete chunk finished.

When explicitly combined with a planning workflow, contribute boundaries, acceptance criteria, and handoffs to one unified plan rather than starting a competing workflow. No companion skill is required. Suggest `$human-review-pr` for subsequent human-guided review when useful; do not invoke it automatically.

Follow the enclosing task's permissions and mode. Invocation alone authorizes neither coding nor test execution. Use already-authorized implementation and verification without asking again for routine in-scope steps. Do not automatically install dependencies or this skill, create durable artifacts or agent tasks, publish comments, push, or merge. Follow existing local commit instructions without treating them as permission to rewrite history or publish.
