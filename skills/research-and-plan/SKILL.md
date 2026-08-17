---
name: research-and-plan
description: |
  Plan implementation work before coding. Use when the user asks to plan, design, architect, break down, stress-test, or create a handoff for a code change. Select direct research, focused read-only leaf scouts, or an internal research-orchestrator subworkflow, then resolve design decisions and deliver a phased implementation plan.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: AskQuestion (Cursor) or user prompting (Claude Code). CreatePlan when Cursor Plan
  mode owns the plan; otherwise markdown file handoff. Task subagents for read-only leaf scouting
  and phased execution handoffs. Route durable research through research-orchestrator.
---

# Research and Plan

Create implementation plans through codebase research and user collaboration. The output is a concrete handoff an orchestration agent can execute phase-by-phase with parallel subagents.

Treat this skill as the user's only planning entrypoint. It owns user communication, approvals, research synthesis, design decisions, and the final plan. Choose the smallest research mode that can support that plan; the user does not need to invoke another skill.

For durable research, route internally through `research-orchestrator` as one subworkflow. It owns its research assignments, metadata, retries, persisted findings, and research synthesis. Consume its research-only handoff, verify material sources, then resume this workflow. Do not independently manage its children.

Use [`references/implementation-handoff-template.md`](references/implementation-handoff-template.md) for the final artifact.

Credits: The interview and design-tree pattern is adapted from [grill-me](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md) (Matt Pocock).

## Workflow

### 1. Select the Research Mode

Use the smallest useful mode:

- **Direct**: inspect bounded or familiar work in the current context without subagents or a research folder.
- **Ephemeral parallel**: when several independent questions materially benefit from parallelism, launch focused, fresh-context, read-only leaf scouts and keep their findings in the current context.
- **Durable**: when findings need persistence, recovery, provenance, or reuse, route through `research-orchestrator`. Let it enforce artifact authorization and return a research-only handoff before planning resumes.

Completion criterion: the mode and reason are explicit, and any authorized `.agents/research/<slug>/` path is known.

### 2. Research the Codebase

Research before drafting and before asking questions that the repo can answer.

Implementation research dimensions:

- Similar features and prior art.
- Dependency map: files, modules, services, upstream/downstream contracts.
- Test patterns, fixtures, and verification commands.
- Config, environment variables, feature flags, build settings.
- API surface: exported types, interfaces, endpoints, schemas, events.

Use read-only search and inspection tools. Parallelize only independent questions. Give each ephemeral scout one bounded question, scope, expected result, evidence requirements, and validation criteria. Keep scouts as leaves: they cannot spawn children or write durable artifacts.

For durable research, treat `research-orchestrator` as one worker and do not separately assign its research questions. The planner remains responsible for verifying material findings and deciding what enters the implementation plan.

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
