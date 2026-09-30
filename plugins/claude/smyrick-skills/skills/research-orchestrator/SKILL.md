---
name: "research-orchestrator"
description: "Coordinate authorization-gated durable research for another skill or user request. Use when planning or decision work needs multiple focused passes, persistent findings, recovery, or a reusable evidence handoff."
disable-model-invocation: false
user-invocable: true
---

# Research Orchestrator

Coordinate bounded, durable research and return a reusable evidence handoff. This skill owns research setup, delegation, recovery, evidence synthesis, and provenance. It does not own the downstream implementation plan or final personal or product decision.

When a planner or other parent routes through this skill, act as one worker. Exclusively own the research assignments, shared metadata, retries and reassignments, persisted findings, and research synthesis. The caller retains user communication, approvals, downstream decisions, and final output; it must not separately manage this workflow's children.

Read the references as each stage requires:

- [`references/research-protocol.md`](references/research-protocol.md): tiers, budgets, safe storage, run identity, and evidence format.
- [`references/agent-lifecycle.md`](references/agent-lifecycle.md): parent-owned coordination, delegation, status, and failure recovery.
- [`references/handoff.md`](references/handoff.md): source verification, synthesis, and the research-only handoff.

## Workflow

### 1. Scope and Bound the Run

Read the research protocol. Confirm that the request benefits from multiple passes or persistent findings; return Tier 0 work to the calling workflow instead of creating artifacts.

Routing to or invoking this skill does not authorize persistent writes. Without explicit authorization, do not create a research folder or temporary run; return findings in the current context and stop before the durable workflow.

For authorized durable work, define the goal, scope, sanitized constraints, research questions, stable slug, storage choice, and explicit limits on agents, nesting, waves, time or tokens where observable, and marginal research value. Define one total pass budget: every initial assignment, independent review, retry, and reassignment consumes a pass, including failed or partial attempts.

Completion gate: persistence is authorized, storage is safe, and the run has a concrete budget and stop rule.

### 2. Initialize Shared Context

Follow the protocol to choose an existing ignored artifact location or a temporary location outside the repository. Never place unignored files in a repository without explicit consent, and never persist secrets or sensitive personal information.

The parent creates and owns `RUN.md`, `CONTEXT.md`, and `INDEX.md`. Inspect any existing slug before choosing whether to resume or create a versioned run; never overwrite or mix unrelated evidence.

Completion gate: run metadata records identity, status, freshness, budget, storage decision, and resume or version history.

### 3. Launch Focused Research

Read the agent lifecycle reference. Sequence dependent questions and parallelize only independent work. Give each assignment a clear objective, firm limits, and suggested starting boundaries that leave room for relevant exploration. The parent allocates each child a unique ID and findings path, updates status, and preserves exclusive ownership of shared metadata.

Require exact file-and-line evidence for codebase claims and URLs plus relevant publication and access dates for web claims. Findings are working notes; cited files and sources remain authoritative.

Completion gate: every launched pass has an owner, bounded question, unique output, evidence requirements, and tracked status.

### 4. Recover and Synthesize

The parent collects results, marks completion or failure, and handles material gaps through a bounded retry, reassignment, or sequential research pass. Every retry or reassignment consumes another pass from the original budget. Preserve unresolved failures instead of silently dropping them.

Before synthesis, reopen material cited sources, resolve or expose contradictions, and calibrate confidence. Stop when added research is unlikely to change a downstream decision or when a recorded budget limit is reached.

Completion gate: every material question is completed, explicitly partial, blocked, or out of scope.

### 5. Deliver a Research-Only Handoff

Read the handoff reference and return its compact shape. Include the run location, status, research date, evidence, confidence, contradictions, unresolved questions, and recommended downstream workflow.

Do not turn the handoff into an implementation plan or make the final decision. Keep facts, inferences, and possible implications distinct so the calling skill or user can decide.
