---

## name: plan-mode

description: >
  Produce a structured implementation plan before coding. Walk the design tree until
  shared understanding, then output a handoff doc another agent can execute. Use when
  the user asks to plan, design, architect, or break down work; wants a handoff doc for
  another agent; is in plan mode; or wants to stress-test a plan before implementation.
  Output is self-contained so a less capable agent can execute it.
author: Shane Myrick
license: MIT
repository: [https://github.com/smyrick/skills](https://github.com/smyrick/skills)
compatibility: "AskQuestion (Cursor) or user prompting (Claude Code). CreatePlan when Cursor Plan mode owns the plan; otherwise file handoff. Readonly codebase search/read for factual answers."

# Plan Mode: Structured Implementation Planning

Create implementation plans detailed enough for a less capable or faster agent to
execute without making design decisions. Every plan ends with a concrete handoff artifact
on the right surface: the **IDE plan** (e.g. Cursor `CreatePlan`) when Plan mode owns it,
or a **markdown file** when it does not.

## At a glance

- Aim for **shared understanding** with the user before you write steps.
- Treat open decisions as a **design tree**: resolve **upstream** choices before **downstream** ones.
- **Explore the codebase first** for anything factual (patterns, files, config); **ask** for goals, tradeoffs, and scope the code cannot answer.
- Ask **one focused question at a time** when the answer unlocks the next branch; give a **recommended answer** (with a one-line why) plus options.
- Finish with the **handoff artifact** (template below) so a less capable agent can execute without guessing — on the **IDE plan** when Cursor Plan mode is active, otherwise in an **existing or new file** as described in Step 4.

*Credits:* The interview and design-tree pattern is adapted from [grill-me](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md) (Matt Pocock).

## When to use this skill

- User asks to "plan", "design", "architect", or "break down" a task before coding
- User wants a handoff document for another agent or team member
- User is in plan mode and wants to think through an approach
- User wants to stress-test a plan, walk open design decisions, or reach shared understanding before coding
- The task is complex enough that jumping straight to code would risk rework
- User says "let's think about this first" or "what's the best approach"

---

## Workflow

### Step 1 — Map the design tree and gather context

Before drafting anything, reach **shared understanding** with the user. Treat unresolved
choices as a **design tree**: parent decisions unlock child decisions. Walk **each branch**
and resolve **dependencies in order** (upstream before downstream). Optionally keep a
short mental list of open branches and tick them off so nothing is skipped.

**Explore before you ask.** Use readonly search and reads of the codebase, repo docs, and
config for anything **discoverable**: where similar features live, naming and patterns,
env keys, test layout, existing conventions. **Do not** ask the user to confirm facts you
can verify yourself.

**Ask** when the code cannot decide: product goals, explicit in/out scope, priorities,
tradeoffs, compliance or policy, or stylistic preferences when multiple valid approaches
exist.

**Required context** (some via exploration, some via questions):


| Context           | How you usually get it                                                |
| ----------------- | --------------------------------------------------------------------- |
| Goal              | Ask (what we're accomplishing and why).                               |
| Scope             | Ask; validate against repo layout if helpful.                         |
| Constraints       | Ask; cross-check config or docs if they encode limits.                |
| Existing patterns | **Explore first**; ask only if conventions conflict.                  |
| Success criteria  | Ask; tie to tests or behavior you found in code.                      |
| Dependencies      | Ask for org, API, or team blockers; explore for in-repo dependencies. |


**Question discipline (one branch at a time).** Default to **one focused** `AskQuestion`
(or one conversational question) at a time when the answer unblocks the next decision.
For each question, state your **recommended answer** in one line (why you lean that way),
then give concrete options so the user can agree or correct you.

**Batching:** Use a single `AskQuestion` with multiple prompts **only** when questions are
**independent** (no ordering dependency) **and** you need both answers in one shot.
Otherwise prefer sequential questions so the tree stays clear.

Thorough clarification still matters: a few precise questions beat a vague plan. Prefer
depth over stuffing many unrelated questions into one message.

Good topics **after** you've explored what you can:

- "Which of these approaches do you prefer?" with options **and** your recommendation
- "Should this handle [edge case X]?" when code or product intent is unclear
- Priority when speed of delivery vs comprehensive coverage conflicts

After questions and exploration, **spot-check the codebase** so the plan names real
files, functions, and patterns—not guesses.

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
skip the review. The goal is **shared understanding** on scope, step order, and risks—not
only running through a checklist.

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

#### Choose the plan surface (IDE vs file)

Put the handoff in **one** place. Use the first row that applies; **do not** duplicate the
same plan in both the IDE plan UI and a **new** `.cursor/plans/*.md` for the same planning
thread.


| Priority | When                                                                                                                                  | What to do                                                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | **Cursor Plan mode** is active (e.g. system or developer context says plan mode is on, or you are instructed to use `**CreatePlan`**) | Treat the **IDE plan** as authoritative. Deliver and revise the structured plan through `**CreatePlan`** (including after user feedback). **Do not** create a **new** parallel `.cursor/plans/*.md` unless the user explicitly asks for an extra workspace copy or export. |
| 2        | The user **@-mentions** a markdown file, gives an explicit path, or asks to use an existing plan document                             | **Edit that file in place**; iterate there instead of inventing a second filename.                                                                                                                                                                                         |
| 3        | This conversation **already** established a plan file path                                                                            | **Keep updating that same path**; do not generate a new slug + random id file.                                                                                                                                                                                             |
| 4        | Standalone planning **outside** IDE Plan mode, no file bound yet                                                                      | **Save a new file** (see “Saving to the workspace” below).                                                                                                                                                                                                                 |


**Claude Code and other tools** without `CreatePlan`: if the user points at an open plan
file or path, use priority 2 or 3; otherwise use 4.

#### Saving to the workspace (priority 4 or explicit export)

When the IDE does **not** own the plan — or the user asks for a persisted copy — save under
a **plan directory** with a **unique filename** (slug + random id). This avoids
context-window waste from pasting long plans into chat.

**Where to write (in order):**

1. **Prefer an already-ignored plan folder** — Before saving, read `.gitignore` and
  `.cursorignore` (if present). If the repo already ignores a directory you recognize
   as the team’s plan or AI-artifact location, and that path is already in use or clearly
   intended for plans (e.g. `.agent/plans/`, `docs/.plans/`), write there instead of
   inventing a new path.
2. **Default** — `<workspace-root>/.cursor/plans/`. Create the directory if it does not
  exist. This aligns with [Cursor Plan mode](https://cursor.com/help/ai-features/plan-mode)
   “Save to workspace” when plans are stored as files. The path is **workspace-relative**
   in any environment (Cursor, Claude Code, or other tools); `.cursor/plans/` is a conventional folder name.
3. **Do not** introduce a new non-standard folder unless the user or the repo already
  established it.

**Filename:** `<short-slug>_<random-id>.md`

- **Slug** — From the plan title: lowercase, hyphenated, ASCII, trimmed to about 40
characters max.
- **Random id** — Collision-resistant, Cursor-style: a **UUID v4** without braces, or
**16 hexadecimal characters** from a high-entropy source (not a timestamp alone).

Example path: `.cursor/plans/dark-mode-settings-page_7c9e2f1a4b3d4068a0b1c2d3e4f50697.md`

**Gitignore:** If nothing in the repo ignores `.cursor/plans/` and the user wants plans
local-only, they may add `.cursor/plans/` to `.gitignore`. Do **not** edit `.gitignore`
unless the user asks.

**Kicking off the executing agent**

- If you **saved a file**, suggest a prompt like:
  > "Read `<exact relative path you saved>` and execute the steps in order. Check each step's
  > acceptance criteria before moving to the next."
- If you delivered via `**CreatePlan`** only, tell the user to use the **confirmed Cursor
plan** as the handoff (no second invented path).

For small plans (1–3 steps), pasting directly into chat is fine.

**Tell the user** (match the surface you used):

- **File:** "Here's the finalized plan, saved to `<exact relative path you saved>`. You can hand this directly to an agent in implementation mode. Want to start executing it now, or save it for later?"
- **IDE plan (`CreatePlan`):** "Here's the finalized plan in the Cursor plan (confirmed via CreatePlan). You can hand this to an agent in implementation mode after you accept it. Want to start executing it now, or refine it first?"

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

- **Skipping exploration** — Asking "where does X live?" when search or ripgrep answers it
wastes the user's time. Resolve factual branches in the codebase first.
- **Skipping user-facing branches** — Jumping to a plan before resolving decisions only the
user can own invites rework. Interview thoroughly: sequential questions, recommendations,
until judgment calls are settled.
- **Being too abstract** — "Update the config" is useless to a less capable agent. Name
the file, the key, and the value.
- **Forgetting the "don't" list** — Explicitly state what the executing agent should NOT
do. Less capable agents will try helpful-but-wrong things without guardrails.
- **Skipping the review** — The plan review catches 80% of gaps. Never deliver a plan
without at least one round of user validation via AskQuestion.
- **Duplicating the plan** — Saving a **new** `.cursor/plans/*.md` while **Cursor Plan mode**
already owns the doc via `**CreatePlan`** splits the source of truth. Use one surface per
thread unless the user asks for an export.
- **Giant steps** — If a step would take more than ~15 minutes to implement, it's too big.
Break it down.

---

## Example

**User request:** "Plan out adding dark mode to the settings page"

**Step 1 output (explore, then one branch at a time):**

> Read `src/utils/colors.ts` and settings-related components: colors are hardcoded
> constants; no CSS custom properties yet. No `useTheme` hook exists.
>
> AskQuestion (one at a time), with recommendation:
> "Should dark mode follow system preference with a manual override, or manual toggle only?
> **Recommendation:** system preference with manual override — matches common UX and your
> question implied a toggle on settings."
>
> - System preference with manual override
> - Manual toggle only
>
> [After answer] Next question: storage (localStorage vs API vs both), again with a
> recommended default; then theme token approach if still ambiguous.

**Step 4 output:** If **Cursor Plan mode** is active, deliver the full artifact through
`**CreatePlan`** and revise there after review — do not also mint a new `.cursor/plans/`
file for the same thread. Otherwise save the full artifact to something like
`.cursor/plans/dark-mode-settings-page_7c9e2f1a4b3d4068a0b1c2d3e4f50697.md` (slug + UUID
or 16 hex chars), then point the user and the executing agent at that exact path.

**Artifact excerpt:**

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

