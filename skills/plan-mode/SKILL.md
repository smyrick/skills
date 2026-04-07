---
name: plan-mode
description: >
  Produce a structured implementation plan before coding. Use when the user asks to
  plan, design, architect, or break down work; wants a handoff doc for another agent;
  or is in plan mode. Output is self-contained so a less capable agent can execute it.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: "AskQuestion tool (Cursor) or user prompting (Claude Code). No external tools required."
---

# Plan Mode: Structured Implementation Planning

Create implementation plans detailed enough for a less capable or faster agent to
execute without making design decisions. Every plan ends with a concrete handoff artifact.

## When to use this skill

- User asks to "plan", "design", "architect", or "break down" a task before coding
- User wants a handoff document for another agent or team member
- User is in plan mode and wants to think through an approach
- The task is complex enough that jumping straight to code would risk rework
- User says "let's think about this first" or "what's the best approach"

---

## Workflow

### Step 1 — Gather Context with Questions

Before drafting anything, deeply understand the task. Use the `AskQuestion` tool
(or ask conversationally if unavailable) to fill every gap in your understanding.

**Required context to gather:**

| Context | Why it matters |
|---------|---------------|
| Goal | What is the user trying to accomplish and why? |
| Scope | What's in scope vs explicitly out of scope? |
| Constraints | Performance, compatibility, style, timeline, or tech constraints? |
| Existing patterns | Are there similar patterns in the codebase to follow? |
| Success criteria | How will the user know this is done correctly? |
| Dependencies | External systems, APIs, teams, or blocking work? |

**Use AskQuestion aggressively.** Ask about anything ambiguous. A 2-minute clarification
saves 20 minutes of rework. Group related questions into a single AskQuestion call.

Good AskQuestion topics:
- "Which of these approaches do you prefer?" with concrete options
- "Should this handle [edge case X]?" when the requirement is unclear
- "Are there existing patterns I should follow?" when you see multiple conventions
- "What's the priority: speed of delivery vs comprehensive coverage?"

After gathering answers, **explore the codebase** to validate assumptions, find existing
patterns, and identify the specific files and functions the plan will reference.

### Step 2 — Draft the Plan

Write a structured plan following the **Handoff Artifact Template** below. Focus on:

- **Specificity** — Name exact files, functions, types, config keys. The executing agent
  can't infer what you mean by "update the auth module."
- **Order** — Number steps in execution order. Mark dependencies explicitly.
- **Acceptance criteria** — Every step has testable criteria so the executing agent knows
  when it's done.
- **Edge cases** — Call out non-obvious gotchas the executing agent might miss.
- **Small steps** — Each step should be completable in a single focused session. If a step
  feels large, break it down further.
- **Context scoping** — Each step should carry its own 1–2 sentence context so a fast model
  can execute it without re-reading the full plan.
- **Failure guidance** — Every step needs an "If this fails" action. Fast models will
  hallucinate fixes without explicit recovery instructions.

#### Prescriptive vs Descriptive

- Bad: "Update the auth module to handle the new flow"
- Good: "In `src/auth/handler.ts`, add a new method `validateOAuthToken(token: string): Result<User, AuthError>` that calls the `/oauth/validate` endpoint. Follow the pattern used by `validateJwtToken` on line 45."

#### Sizing Guidelines

- Each step should touch 1–3 files max
- If a step has more than 5 acceptance criteria, split it
- A step should be independently verifiable
- For risky changes, note how to verify nothing regressed

### Step 3 — Review the Plan with the User

After drafting, use `AskQuestion` again to validate the plan. This is critical — never
skip the review.

**Question 1 — Coverage check:**

Present a summary of what IS and IS NOT covered, then ask:
> "Does this plan cover everything you need, or are there missing pieces?"

Offer options like:
- "Looks complete — move on"
- "Missing something — let me explain"
- "Too much scope — let's trim"

**Question 2 — Priority and order check:**

> "Does the step ordering make sense? Would you reorder anything?"

**Question 3 — Risk and edge case check:**

> "I identified these risks: [list]. Are there others I'm missing?"

**Question 4 — Scope check:**

> "I scoped this to [X]. Should it also include [Y] or is that separate work?"

Revise the plan based on feedback. If changes are substantial, do another review round.

### Step 4 — Deliver the Handoff Artifact

Output the final plan as a single self-contained markdown artifact using the template
below. This is the deliverable — it must be actionable without any conversation context.

**Preferred delivery: save to a file.** Write the artifact to a file (e.g., `PLAN.md`
in the repo root) so the executing agent can be pointed to it. This avoids context
window waste from pasting long plans into chat.

To kick off the executing agent, suggest a prompt like:
> "Read `PLAN.md` and execute the steps in order. Check each step's acceptance criteria
> before moving to the next."

For small plans (1–3 steps), pasting directly into chat is fine.

Tell the user:
> "Here's the finalized plan, saved to `PLAN.md`. You can hand this directly to an
> agent in implementation mode. Want to start executing it now, or save it for later?"

---

## Handoff Artifact Template

Adapt sections as needed but keep the core structure.

```markdown
# Implementation Plan: [Title]

> **Instructions for executing agent**: Execute the steps below in order.
> Do not skip steps. After each step, verify all acceptance criteria pass before
> moving on. Each step includes its own context — you can focus on one step at
> a time without reading the full plan upfront.

## Objective
[1–2 sentences: what we're building and why]

## Background
[Context the executing agent needs. Reference specific files, patterns, and conventions
discovered during codebase exploration. Include anything that isn't obvious from the
code alone.]

## Steps

### Step 1: [Short title]
**Files**: `path/to/file.ts`, `path/to/other.ts`
**Context**: [1–2 sentences giving the executing agent just enough background to
understand THIS step without reading the full plan. Reference specific code patterns
or existing behavior.]
**Description**: [Specific enough that the agent doesn't need to make design decisions]
**Acceptance criteria**:
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
**Notes**: [Gotchas, edge cases, or "do NOT do X" warnings]
**If this fails**: [Concrete recovery action: revert file X, check error Y, fall back
to approach Z. Never just "ask the user."]

### Step 2: [Short title]
**Depends on**: Step 1
**Files**: `path/to/file.ts`
**Context**: [...]
**Description**: [...]
**Acceptance criteria**:
- [ ] [...]
**If this fails**: [...]

[...continue for all steps...]

## Edge Cases & Gotchas
- [Non-obvious thing 1 the executing agent should watch for]
- [Non-obvious thing 2]

## Testing Checklist
- [ ] [How to verify the overall change works]
- [ ] [Specific test scenarios to run]
- [ ] [Regression checks — things that should NOT break]

## Out of Scope
- [Thing that might seem related but is NOT part of this plan]
- [Future work to be done separately]
```

---

## Adapting to Task Size

**Small tasks** (1–3 steps): Skip Background section, keep Edge Cases brief. Still
include acceptance criteria — that's non-negotiable.

**Medium tasks** (4–8 steps): Full template. Group related steps under subheadings
if helpful.

**Large tasks** (9+ steps): Split into multiple sequential plans. Each plan should be
independently valuable. Add a "Plan Overview" at the top showing how the plans relate
and which order to execute them.

---

## Common Pitfalls

- **Skipping the question phase** — Agents tend to jump to drafting. Force yourself to
  ask at least 2–3 clarifying questions before writing a single plan step.
- **Being too abstract** — "Update the config" is useless to a less capable agent. Name
  the file, the key, and the value.
- **Forgetting the "don't" list** — Explicitly state what the executing agent should NOT
  do. Less capable agents will try helpful-but-wrong things without guardrails.
- **Skipping the review** — The plan review catches 80% of gaps. Never deliver a plan
  without at least one round of user validation via AskQuestion.
- **Giant steps** — If a step would take more than ~15 minutes to implement, it's too big.
  Break it down.

---

## Example

**User request:** "Plan out adding dark mode to the settings page"

**Step 1 output (questions):**

> Using AskQuestion: "A few things to clarify before I plan this out:"
> 1. "Should dark mode be system-preference-aware, or manual toggle only?"
>    - System preference with manual override
>    - Manual toggle only
> 2. "Where should the preference be stored?"
>    - localStorage
>    - User profile / API
>    - Both (local with sync)
> 3. "Are there existing theme variables, or do we need to create the token system?"

**Step 4 output (artifact excerpt):**

```markdown
# Implementation Plan: Dark Mode for Settings Page

## Objective
Add a dark mode toggle to the settings page that respects system preference
with manual override, persisted to localStorage.

## Steps

### Step 1: Add CSS custom properties for theme tokens
**Files**: `src/styles/tokens.css`
**Context**: The app currently hardcodes colors in `src/utils/colors.ts`
(12 semantic color constants). No CSS custom properties exist yet.
**Description**: Define color tokens as CSS custom properties on `:root`
and `[data-theme="dark"]`. Use the existing color values from `colors.ts`
as the light defaults.
**Acceptance criteria**:
- [ ] Light tokens match current hardcoded colors exactly (no visual change)
- [ ] Dark tokens defined for all 12 semantic colors
- [ ] `[data-theme="dark"]` selector overrides all tokens
**Notes**: Do NOT use `prefers-color-scheme` media query here — that's
handled in Step 3 via JS. Keep CSS purely token-based.
**If this fails**: Verify `colors.ts` exports haven't changed. If token
names conflict with an existing CSS framework, prefix with `--app-`.

### Step 2: Create useTheme hook
**Depends on**: Step 1
**Files**: `src/hooks/useTheme.ts` (new file)
...
```
