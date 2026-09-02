---
name: "research-and-plan"
description: "Research a code change and produce a decision-complete implementation plan. Select direct inspection, focused read-only leaf scouts, or an internal durable research subworkflow without modifying code."
disable-model-invocation: true
user-invocable: true
---

# Research and Plan

Research a code change with read-only inspection, resolve the decisions that evidence cannot answer, and deliver an implementation plan. Do not implement the change while using this skill.

Treat this skill as the user's only planning entrypoint. It owns user communication, approvals, material-source verification, design decisions, and the final plan; the user does not need to invoke another skill.

Use [`references/implementation-handoff-template.md`](references/implementation-handoff-template.md) as a flexible output shape.

## Workflow

### 1. Frame and Size the Change

Extract the objective, scope, constraints, success criteria, and known risks from the request. Ask only for missing information that would materially change the research direction.

Choose the lightest useful research mode:

- **Direct**: for a small or familiar change, inspect the codebase in the current context without subagents or a research folder.
- **Ephemeral delegation**: use focused, fresh-context, read-only leaf scouts when specialist coverage, independent critique, context isolation, or parallel work materially helps. Keep findings in the current context.
- **Durable**: when findings need persistence, provenance, recovery, or reuse, use the `research-orchestrator` skill as one subworkflow. Consume its research-only handoff before planning resumes.

Keep work local when specifying and integrating an assignment would cost more than doing it directly. Before delegating, identify dependencies, integration ownership, and available capacity. Set a total pass and time budget that includes reviews and retries. Sequence dependent questions and parallelize only independent work; reserve capacity for review or recovery when needed. Do not select a fixed agent roster by habit.

Give each ephemeral scout one question and its purpose, the smallest sufficient inputs and named references, expected result, evidence and acceptance criteria, and a concrete budget and stop condition. Distinguish:

- **Firm limits**: the assigned objective, explicit exclusions, read-only access, privacy and approval boundaries, and budget. Scouts do not launch children or write durable artifacts; delegation grants no additional authority.
- **Suggested boundaries**: promising starting files, sources, hypotheses, and methods. These guide attention rather than exhaust the search space. Scouts may follow unexpected leads, challenge assumptions, or try another method without asking when it serves the same question within firm limits. Report useful out-of-scope leads and their relevance for the parent to consider; do not silently expand the assignment.

Use only delegation capabilities that are available and authorized; do not assume the host exposes model selection or reasoning controls. If delegation is unavailable, inspect directly. If the `research-orchestrator` skill is unavailable or persistence is not authorized, keep the work in direct or ephemeral mode and create no research folder.

For durable research, treat `research-orchestrator` as one worker. It exclusively owns its research assignments, metadata, retries and reassignments, persisted findings, and research synthesis. Do not separately manage its children or duplicate its questions.

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

Use an independent, read-only plan reviewer when a consequential assumption or unresolved tradeoff would benefit from challenge. Name the risks and acceptance criteria to examine and keep the review within the remaining budget. The planner integrates the result and retains design decisions; evidence review within a durable run remains the orchestrator's responsibility.

Return the plan in chat by default. Create or update an artifact only when the user explicitly requests a file, supplies a target file, or has already chosen a durable handoff workflow. Report the path whenever an artifact is written.
