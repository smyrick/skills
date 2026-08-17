---
name: research-orchestrator
description: |
  Orchestrate durable research before planning or decisions. Use as a standalone or internal subworkflow for research handoffs, coordinated multi-pass research, or work needing persisted context, provenance, recovery, or reuse under .agents/research/<slug>/. Persistent artifact writes require explicit authorization.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: Task subagents (explore, generalPurpose), readonly file/search tools, web research
  tools when current external facts are needed, and markdown files under .agents/research/<slug>/
  for durable handoff.
---

# Research Orchestrator

Produce durable research context that another agent, planning skill, or future session can consume. This skill owns research setup, subagent handoff, findings files, synthesis, and the final research handoff.

When a planner or other parent routes through this skill, act as one worker. Exclusively own the research assignments, metadata, retries and reassignments, persisted findings, and research synthesis. The parent retains user communication, approvals, downstream decisions, and final output; it must not separately manage this workflow's children.

Invocation alone does not authorize persistent writes. If the request does not explicitly authorize research artifacts, do not create or edit `.agents/research/`; return findings in the current context instead of starting a durable Tier 1+ run.

References:

- [`references/research-protocol.md`](references/research-protocol.md): sizing, folder layout, `CONTEXT.md`, `findings/`, and `INDEX.md`.
- [`references/agent-lifecycle.md`](references/agent-lifecycle.md): parent/child agent loop, recursive guard, spin-up, and spin-down.
- [`references/handoff.md`](references/handoff.md): synthesis gate, research summary, and downstream consumption.

## Workflow

### 1. Size the Research

Read [`references/research-protocol.md`](references/research-protocol.md), then pick the smallest tier that can answer the goal.

Completion gate: tier and reason are explicit, artifact authorization is known, and authorized Tier 1+ research has a fixed slug, folder path, max depth, and total pass budget.

If artifact writes are not authorized, remain in Tier 0: research directly in the current context, return the findings there, and stop. Do not continue into the durable workflow.

### 2. Create Shared Context

For an authorized Tier 1+ run, follow [`references/research-protocol.md`](references/research-protocol.md) to create the research folder and `CONTEXT.md` before launching agents.

Completion gate: `CONTEXT.md` includes goal, scope, constraints, assumptions, starting points, and tier guard. Tier 2 also has `INDEX.md`.

### 3. Launch Focused Research

Read [`references/agent-lifecycle.md`](references/agent-lifecycle.md), then split research by independent questions. Use codebase search/read tools for repo facts. Use web research only when current external facts matter.

Completion gate: every research question has one owner and a clear expected output. In an authorized run, it also has one unique findings path, and every launched agent has either written its findings file or returned exact findings markdown for this orchestrator to persist.

### 4. Collect and Synthesize

Read [`references/handoff.md`](references/handoff.md), then read findings files as the durable source of truth. Synthesize what was learned, what was ruled out, what remains unknown, and what downstream agent or user decision this unlocks.

Completion gate: synthesis covers every findings file, calls out blocked or user-owned questions, and distinguishes facts from recommendations.

### 5. Deliver the Research Handoff

Use the final handoff shape from [`references/handoff.md`](references/handoff.md).

Completion gate: final handoff includes research folder path, summary, key findings, files or sources, open questions, and recommended next step. If this research feeds a planning skill, tell it to reference `.agents/research/<slug>/CONTEXT.md` plus the relevant `findings/` files.
