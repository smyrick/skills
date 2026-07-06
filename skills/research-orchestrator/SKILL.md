---
name: research-orchestrator
description: |
  Orchestrate durable research before planning or decisions. Use for research handoffs, subagent research coordination, planning-skill research dependencies, or when the user asks for deep research that should persist context and findings under .agents/research/<slug>/.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: Task subagents (explore, generalPurpose), readonly file/search tools, web research
  tools when current external facts are needed, and markdown files under .agents/research/<slug>/
  for durable handoff.
---

# Research Orchestrator

Produce durable research context that another agent, planning skill, or future session can consume. This skill owns research setup, subagent handoff, findings files, synthesis, and the final research handoff.

References:

- [`references/research-protocol.md`](references/research-protocol.md): sizing, folder layout, `CONTEXT.md`, `findings/`, and `INDEX.md`.
- [`references/agent-lifecycle.md`](references/agent-lifecycle.md): parent/child agent loop, recursive guard, spin-up, and spin-down.
- [`references/handoff.md`](references/handoff.md): synthesis gate, research summary, and downstream consumption.

## Workflow

### 1. Size the Research

Read [`references/research-protocol.md`](references/research-protocol.md), then pick the smallest tier that can answer the goal.

Completion gate: tier is named, the reason is explicit, and Tier 1+ research has a fixed slug, folder path, max depth, and max agent count.

### 2. Create Shared Context

For Tier 1+, follow [`references/research-protocol.md`](references/research-protocol.md) to create the research folder and `CONTEXT.md` before launching agents.

Completion gate: `CONTEXT.md` exists and includes goal, scope, constraints, assumptions, starting points, and tier guard. Tier 2 also has `INDEX.md`.

### 3. Launch Focused Research

Read [`references/agent-lifecycle.md`](references/agent-lifecycle.md), then split research by independent questions. Use codebase search/read tools for repo facts. Use web research only when current external facts matter.

Completion gate: every research question has one owner, one unique findings path, and a clear expected output. Every launched agent has either written its findings file or returned exact findings markdown for the parent to persist.

### 4. Collect and Synthesize

Read [`references/handoff.md`](references/handoff.md), then read findings files as the durable source of truth. Synthesize what was learned, what was ruled out, what remains unknown, and what downstream agent or user decision this unlocks.

Completion gate: synthesis covers every findings file, calls out blocked or user-owned questions, and distinguishes facts from recommendations.

### 5. Deliver the Research Handoff

Use the final handoff shape from [`references/handoff.md`](references/handoff.md).

Completion gate: final handoff includes research folder path, summary, key findings, files or sources, open questions, and recommended next step. If this research feeds a planning skill, tell it to reference `.agents/research/<slug>/CONTEXT.md` plus the relevant `findings/` files.
