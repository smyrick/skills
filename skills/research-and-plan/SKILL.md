---
name: "research-and-plan"
description: "Research a code change and produce a decision-complete implementation plan without modifying the codebase."
---

# Research and Plan

Research a code change with read-only inspection, resolve the decisions that evidence cannot answer, and deliver an implementation plan. Do not implement the change while using this skill.

Use [`references/implementation-handoff-template.md`](references/implementation-handoff-template.md) as a flexible output shape.

## Workflow

### 1. Frame and Size the Change

Extract the objective, scope, constraints, success criteria, and known risks from the request. Ask only for missing information that would materially change the research direction.

Choose the lightest useful research mode:

- For a small or familiar change, inspect the codebase in the current context.
- When the work needs multiple focused passes or reusable findings, explicitly invoke `$research-orchestrator` before planning.
- If `$research-orchestrator` is unavailable or durable storage is not authorized, run the same research questions sequentially and keep a compact evidence ledger in the current context.

Completion criterion: the research mode and boundaries are clear, with no assumption that another skill or subagent capability is installed.

### 2. Research Before Asking Design Questions

Use read-only search and inspection to establish:

- Similar features, conventions, and prior art.
- Files, symbols, modules, services, and upstream or downstream contracts.
- Public interfaces such as types, endpoints, schemas, events, commands, and configuration.
- Test patterns, fixtures, verification commands, rollout controls, and operational constraints.
- The current baseline, including relevant checks that already fail before the proposed change.

Cite exact paths and symbols. If non-mutating diagnostic commands are run, record their results as baseline evidence. Never present a pre-existing failure as a regression the implementation must fix unless the user puts it in scope.

Completion criterion: discoverable questions are answered, evidence is traceable, and remaining questions require user intent or a tradeoff decision.

### 3. Resolve the Design Tree

Ask the user only about product intent, scope boundaries, compatibility, policy, rollout risk, or team constraints that the codebase cannot settle.

- Ask upstream decisions before downstream ones.
- Batch independent questions; ask sequentially only when one answer changes the next question.
- Recommend a default and explain the evidence or tradeoff behind it.
- Proceed with clearly labeled assumptions when the decision is reversible and the user has not specified a preference.

Completion criterion: an implementer should not need to invent product or architecture decisions.

### 4. Draft an Executable Plan

Use the handoff template and make each step independently understandable. Name the exact files, symbols, contracts, intended behavior, acceptance criteria, verification, dependencies, and recovery guidance.

Order steps by real dependencies. Mark steps as parallel only when they are independent, do not write the same files or shared mutable state, the available environment supports parallel work, and parallelism materially helps. Otherwise keep the execution order sequential.

Carry known baseline failures into the verification section so the implementer can distinguish unchanged failures from new regressions.

Completion criterion: each step is bounded, decision-complete, verifiable, and explicit about its prerequisites.

### 5. Deliver Without Surprise Writes

Review the plan for scope, dependency order, edge cases, assumptions, and baseline handling. Resolve material gaps; do not force an additional review round when the request is already decision-complete.

Return the plan in chat by default. Create or update an artifact only when the user explicitly requests a file, supplies a target file, or has already chosen a durable handoff workflow. Report the path whenever an artifact is written.
