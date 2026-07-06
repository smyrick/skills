---
name: research-and-plan
description: |
  Plan implementation work before coding. Use when the user asks to plan, design, architect, break down, stress-test, or create a handoff for a code change. Use research-orchestrator for durable Tier 1+ research, then resolve user-owned design decisions and deliver a phased implementation plan.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: AskQuestion (Cursor) or user prompting (Claude Code). CreatePlan when Cursor Plan
  mode owns the plan; otherwise markdown file handoff. Task subagents for readonly codebase
  exploration and phased execution handoffs. Use research-orchestrator for durable research.
---

# Research and Plan

Create implementation plans through codebase research and user collaboration. The output is a concrete handoff an orchestration agent can execute phase-by-phase with parallel subagents.

For durable research, invoke `research-orchestrator` first and reference its `.agents/research/<slug>/` output from the final plan. This skill owns the implementation planning layer, not the reusable research protocol.

Use [`references/implementation-handoff-template.md`](references/implementation-handoff-template.md) for the final artifact.

Credits: The interview and design-tree pattern is adapted from [grill-me](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md) (Matt Pocock).

## Workflow

### 1. Size the Work

Decide whether the task needs durable research:

- **Small / familiar**: inspect in the current context and continue.
- **Tier 1+ research needed**: use `research-orchestrator` to create the research folder, run subagent research, and synthesize findings before drafting.

Completion criterion: the research depth is explicit, and any `.agents/research/<slug>/` path is known.

### 2. Research the Codebase

Research before drafting and before asking questions that the repo can answer.

Implementation research dimensions:

- Similar features and prior art.
- Dependency map: files, modules, services, upstream/downstream contracts.
- Test patterns, fixtures, and verification commands.
- Config, environment variables, feature flags, build settings.
- API surface: exported types, interfaces, endpoints, schemas, events.

Use readonly search/read tools and focused subagents. For Tier 1+ research, delegate the durable folder and findings protocol to `research-orchestrator`.

Completion criterion: findings identify real files, functions, contracts, tests, constraints, and any user-owned decisions that remain.

### 3. Resolve the Design Tree

Ask only questions the codebase cannot answer: product intent, scope boundaries, tradeoffs, rollout risk, compatibility, policy, or team constraints.

Question discipline:

- Ask upstream decisions before downstream ones.
- Ask one focused question at a time unless questions are independent.
- Give a recommended option and the reason.
- Record accepted assumptions in the final plan.

Completion criterion: goal, scope, constraints, success criteria, dependencies, and meaningful tradeoffs are settled enough that an implementer should not need to make product or architecture decisions.

### 4. Draft the Handoff

Use the implementation handoff template. Structure the plan for an orchestration agent:

- Phases run sequentially.
- Steps within a phase are independent and may run in parallel.
- No two parallel steps edit the same file.
- Each step names exact files, functions, types, config keys, and relevant research findings.
- Each step has acceptance criteria and concrete failure guidance.

Completion criterion: every step is independently executable, verifiable, and small enough for one subagent session.

### 5. Review, Revise, Deliver

Review the draft with the user:

- What is in scope and out of scope.
- Whether phase order and parallel boundaries make sense.
- Known risks and edge cases.
- Assumptions that need approval.

Deliver one authoritative artifact. If Cursor Plan mode owns the work, use the IDE plan. If the user named a file, update that file. Otherwise save a markdown plan file and report the path.
