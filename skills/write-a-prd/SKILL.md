---
name: "write-a-prd"
description: "Create a product requirements document through bounded discovery, codebase context when available, and explicit product decisions."
---

# Write a PRD

Turn a product problem into an outcome-focused, decision-ready product requirements document. Default to drafting in chat. Do not publish, create an issue, or write a file unless the user explicitly requests that action.

## Establish the working mode

Confirm only information that changes the PRD:

- audience and decision owner;
- product or feature scope;
- desired output: chat draft, local file, or later publication;
- source material the user wants treated as authoritative;
- deadline or launch constraint when relevant.

If these are already clear, proceed without asking. Keep discovery bounded: ask at most three focused questions at a time, explain why unresolved choices matter, and stop interviewing once remaining uncertainty can be recorded under Open Questions.

## Gather evidence

Start with the user’s problem statement, research, customer evidence, existing requirements, and explicit constraints. Distinguish evidence from assumptions.

Inspect a repository only when it is available and the PRD depends on an existing product, workflow, technical constraint, or integration. Repository inspection should clarify current user-visible behavior, existing capabilities, dependencies, and constraints—not predetermine the product solution.

When inspecting code:

- read repository guidance and current product or architecture documentation first;
- trace representative user flows and public interfaces;
- cite repo-relative paths and symbols for material current-state claims;
- label architectural inference and stale-document risk;
- avoid turning the PRD into an implementation plan.

If implementation research is substantial or uncertain, record the dependency and defer detailed planning to [`research-and-plan`](../research-and-plan/SKILL.md) after the PRD is accepted.

## Resolve product decisions

Work from outcomes toward requirements:

1. Define the affected user, their current problem, and evidence that the problem matters.
2. State the measurable outcome and why it matters now.
3. Define the smallest coherent in-scope experience and explicit non-goals.
4. Walk through primary, alternate, empty, error, permission, and recovery flows that materially affect requirements.
5. Turn decisions into testable requirements and acceptance criteria.
6. Record unresolved decisions with an owner or validation method instead of guessing.

Prefer durable product decisions over module names, file paths, or speculative architecture. Include technical constraints only when they bound product behavior, feasibility, privacy, security, accessibility, or rollout.

## Draft the PRD

Use this structure and omit sections only when genuinely inapplicable.

### Title and document status

- Working title
- Status: Draft, In review, or Approved
- Owner and decision-makers when known
- Last updated date

### Executive summary

Summarize the user problem, proposed product change, expected outcome, and major constraint in a short paragraph.

### Problem and evidence

Describe the problem from the affected user’s perspective. Include observed evidence, frequency or severity when known, current workarounds, and assumptions that still need validation.

### Users and use cases

Identify primary and secondary users, jobs to be done, relevant permissions or contexts, and representative use cases. Avoid fictional precision unsupported by research.

### Goals and success measures

State product outcomes, leading and lagging measures, guardrail metrics, measurement windows, and the baseline or instrumentation gap when known.

### Non-goals

List adjacent problems and capabilities intentionally excluded from this version.

### Proposed experience

Describe the end-to-end user experience and important states. Include entry, happy path, alternate paths, empty states, errors, recovery, accessibility, permissions, and communication behavior as applicable.

### Requirements

Give every requirement a stable ID, priority, product rationale, and observable acceptance criteria.

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| R1 | Must | Outcome-focused behavior | Observable condition that demonstrates completion |

Use Must/Should/Could or the user’s preferred prioritization system. Do not pad the document with exhaustive low-value user stories. Add user stories only when they clarify audience, motivation, or an interaction.

### Data, trust, and policy

Cover data inputs and outputs, retention, privacy, security, abuse cases, compliance, accessibility, and audit needs when relevant. Mark specialist review requirements rather than inventing policy.

### Dependencies and constraints

List product, organizational, vendor, platform, migration, compatibility, and technical constraints. Cite current-state sources where available.

### Rollout and operations

Define release stages, eligibility, migration or backfill, support readiness, observability, rollback or disablement, and owner handoffs when relevant.

### Risks and mitigations

Connect each meaningful product, adoption, operational, or delivery risk to a mitigation or validation step.

### Open questions and decisions

Separate resolved decisions from open questions. Give each open question an owner or decision method and identify whether it blocks approval, implementation, or launch.

## Review the draft

Before presenting:

1. Check that requirements trace to the stated problem and goals.
2. Check that acceptance criteria are externally observable and solution-neutral where possible.
3. Check that scope, non-goals, permissions, failure states, success measures, rollout, and unresolved decisions are explicit.
4. Verify source-backed claims and label assumptions.
5. Remove implementation detail that does not constrain product behavior.
6. Identify decisions that still require user confirmation.

Present the complete draft in chat unless the user requested a file. If a file path was requested, preview the final content and confirm the target before writing or replacing it.

## Optional publication

Treat publication as a separate, consequential action. Never infer permission to publish from “write a PRD.”

When the user asks to create a GitHub issue or publish elsewhere:

1. Resolve the exact destination, repository or project, issue title, labels, assignees, and formatting.
2. Show the exact title, body, metadata, and destination that will be submitted.
3. Ask for explicit confirmation of that exact preview.
4. Publish once using an available authenticated integration.
5. Return the resulting link and report any metadata the destination changed.

If publication is unavailable, provide a copy-ready draft without claiming it was submitted.

## Implementation-planning handoff

After the PRD is approved, offer an explicit handoff to `$research-and-plan` for a decision-complete implementation plan. Pass the approved PRD, its cited current-state evidence, constraints, resolved decisions, open technical questions, and non-goals. Do not collapse product requirements and implementation planning into one artifact unless the user explicitly asks.
