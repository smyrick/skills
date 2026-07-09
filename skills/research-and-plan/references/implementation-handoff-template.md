# Implementation Handoff Template

Use this as a ceiling, not a required minimum. Keep small plans compact while preserving objective, decisions, changes, verification, assumptions, and scope boundaries.

```markdown
# Implementation Plan: [Title]

## Objective
[What will change, why, and the observable outcome.]

## Scope
- **In scope**: [...]
- **Out of scope**: [...]

## Research Basis
- **Codebase evidence**: [Exact paths, symbols, contracts, and relevant research handoff.]
- **Decisions resolved**: [...]
- **Assumptions**: [...]

## Baseline and Constraints
- **Relevant checks**: [Commands or inspection used.]
- **Known existing failures**: [Exact failures, or "None observed / not run".]
- **Compatibility / rollout constraints**: [...]

## Execution Model
[State which phases depend on earlier phases. Identify parallel groups only when their steps are independent, touch no shared files or mutable state, and can be safely coordinated. Otherwise state that execution is sequential.]

## Phase 1: [Outcome]

### Step 1.1: [Short title]
- **Files / symbols**: `[exact paths and names]`
- **Depends on**: [Earlier step, external prerequisite, or "None".]
- **Change**: [Decision-complete implementation instructions and rationale.]
- **Contracts affected**: [APIs, schemas, types, config, events, or "None".]
- **Acceptance criteria**:
  - [ ] [Observable criterion]
- **Verification**: [Specific tests, checks, or inspection.]
- **Failure / recovery**: [What to inspect, retry, revert, or escalate.]

## Phase 2: [Outcome]
**Depends on**: Phase 1

### Step 2.1: [Short title]
[Repeat the step fields above.]

## Final Verification
- [ ] Existing relevant checks are no worse than the recorded baseline.
- [ ] New or changed behavior passes its targeted checks.
- [ ] New regressions are distinguished from known existing failures.
- [ ] Public contracts, rollout behavior, and user-visible outcomes match the plan.

## Risks and Edge Cases
- [Risk, mitigation, and warning sign.]

## Open Questions
- [Only blocked or explicitly deferred questions; use "None" for a decision-complete plan.]
```
