# Implementation Handoff Template

Use this for `research-and-plan` final artifacts.

```markdown
# Implementation Plan: [Title]

> Execute phases in order. Within each phase, steps are independent and may run as parallel subagents. Wait for all steps in a phase to complete and pass acceptance criteria before starting the next phase.
>
> If running in Cursor 3.2+, use `/multitask` for async parallel subagents.

## Objective
[What is being built and why.]

## Background
[Research summary: relevant files, patterns, contracts, constraints, and research folder path if one exists.]

## Public Interfaces / Contracts
[APIs, schemas, commands, config keys, env vars, user-facing behavior, or "None".]

## Phase 1: [Title]
[State that steps in this phase are independent.]

### Step 1.1: [Short title]
**Files**: `[exact paths]`
**Context**: [Self-contained research and existing patterns needed for this step.]
**Description**: [Specific implementation instructions; no design decisions left.]
**Acceptance criteria**:
- [ ] [Observable criterion]
- [ ] [Observable criterion]
**Notes**: [Gotchas and hard guardrails.]
**If this fails**: [Concrete recovery or fallback.]

## Phase 2: [Title]
**Depends on**: Phase 1

### Step 2.1: [Short title]
**Files**: `[exact paths]`
**Context**: [What previous phase produced and what this step needs.]
**Description**: [...]
**Acceptance criteria**:
- [ ] [...]
**If this fails**: [...]

## Verification
**Depends on**: All implementation phases

### Step N.1: Run checks
**Commands**: `[exact commands]`
**Acceptance criteria**:
- [ ] Existing tests pass.
- [ ] New tests pass.
- [ ] Specific regression checks pass.

## Edge Cases & Gotchas
- [Non-obvious risk.]

## Assumptions
- [Accepted default or unresolved-but-explicit assumption.]

## Out of Scope
- [Related work intentionally excluded.]
```

Keep small tasks compact. The template is a ceiling, not a minimum, but every plan still needs objective, key changes, acceptance criteria, verification, assumptions, and out-of-scope boundaries.
