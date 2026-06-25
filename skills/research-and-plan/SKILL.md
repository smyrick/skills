---
name: research-and-plan
description: |
  Produce a structured implementation plan through deep research and user collaboration. Size the research effort upfront, then use subagents to explore the codebase and persist findings as docs in an IDE-agnostic .agents/research/ folder so every agent shares baseline knowledge and nothing is lost on spin-down. Output a parallel-subagent handoff. Use when the user asks to plan, design, architect, break down work, create a handoff doc, or stress-test a plan before implementation.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: AskQuestion (Cursor) or user prompting (Claude Code). CreatePlan when Cursor Plan
  mode owns the plan; otherwise file handoff. Task tool subagents (explore, generalPurpose) for deep
  research. Readonly codebase search/read for factual answers. /multitask (Cursor 3.2+) for async
  parallel subagents with queue bypass during research and execution phases. IDE-agnostic
  .agents/research/<slug>/ doc handoff (CONTEXT.md + findings/) so agents share context across
  spin-up/spin-down.
---

# Plan Mode: Research-Driven Implementation Planning

Create implementation plans through deep codebase research and iterative user feedback.
Plans are structured so an **orchestration agent** can execute them by delegating steps
to **parallel subagents** — not just a single sequential executor.

Every plan ends with a concrete handoff artifact on the right surface: the **IDE plan**
(e.g. Cursor `CreatePlan`) when Plan mode owns it, or a **markdown file** when it does not.

## At a glance

- **Size the effort upfront** — pick a depth tier (single context / light / research project) and confirm it with the user before launching research, so you spin up the right number of agents.
- **Persist research as docs** — write a shared `CONTEXT.md` brief and per-agent `findings/` docs in an IDE-agnostic `.agents/research/<slug>/` folder so every agent boots with the same baseline knowledge.
- **Uniform agent lifecycle** — every agent (root or nested) reads `CONTEXT.md`, declares its goal, works, may spawn its own children, and on spin-down records how its findings advance the goal, so nothing is lost when a context window dies.
- **Research deeply first** — launch subagents to explore the codebase in parallel, then compact findings into actionable context before asking questions or drafting steps.
- Aim for **shared understanding** with the user before you write steps.
- Treat open decisions as a **design tree**: resolve **upstream** choices before **downstream** ones.
- **Ask one focused question at a time** when the answer unlocks the next branch; give a **recommended answer** (with a one-line why) plus options.
- Structure the handoff for an **orchestration agent** that can run independent steps in parallel via subagents.
- Finish with the **handoff artifact** (template below) — on the **IDE plan** when Cursor Plan mode is active, otherwise in an **existing or new file** as described in Step 4.

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

### Step 0 — Size the research effort

Before launching any research, decide **how deep to go**. This sets how many agents you
spin up and whether you need a research folder at all. Pick a tier, then **confirm it with
the user via one `AskQuestion`** (recommend a tier from the initial signal; let them
override).

- **Tier 0 — Single context**: small or familiar task. No subagents, no research folder —
  everything fits in one context window. Skip straight to the design tree (Step 1c).
- **Tier 1 — Light**: a few parallel subagents. Create `.agents/research/<slug>/` with a
  `CONTEXT.md` brief + a handful of `findings/` docs. Shallow recursion guard (e.g. nesting
  depth <= 2, small agent cap).
- **Tier 2 — Research project**: many areas, unfamiliar codebase, or high stakes. Full
  research folder + `INDEX.md` manifest; the recursive agent loop (below) runs to whatever
  depth the goal needs under a generous guard (higher max depth + agent cap).

The chosen tier defines the **termination guard** for the agent loop in Step 1 (max nesting
depth and/or max total agent count). When unsure between two tiers, recommend the smaller
one — you can always escalate.

### Step 1 — Deep research via subagents

Before drafting anything, **invest heavily in understanding the codebase**. Launch
subagents to explore in parallel, then compact their findings into dense context that
drives better questions and a more grounded plan.

For Tier 1 and Tier 2, research is persisted as **docs** (not just in-context summaries):
a shared brief every agent reads on spin-up, and per-agent findings docs written on
spin-down. This is what lets any number of nested agents share the same baseline knowledge
and lose nothing when a context window ends.

#### 1a. Launch parallel research subagents

**If running in Cursor (3.2+):** Prefix your research delegation with `/multitask`
to enable async subagent execution and queue bypass. This lets all research agents
run in parallel without blocking each other or the parent session — maximizing
throughput on the most time-consuming part of the workflow.

Use the `Task` tool with `subagent_type="explore"` (readonly, fast) to investigate
multiple areas of the codebase simultaneously. Each subagent should have a focused
research question and return **compacted findings** — not raw file dumps.

**Research dimensions to cover (launch as many in parallel as apply):**

- **Similar features / prior art** — "How are similar features implemented? What patterns,
  files, and conventions do they follow?"
- **Dependency map** — "What files, modules, and services would this change touch? What
  are the upstream and downstream dependencies?"
- **Test patterns** — "How are similar features tested? What test framework, patterns,
  and fixtures are used?"
- **Config and environment** — "What config files, env vars, feature flags, or build
  settings are relevant?"
- **API surface** — "What existing APIs, types, interfaces, or contracts would this
  interact with?"

For complex or unfamiliar codebases, also launch a `subagent_type="generalPurpose"`
agent for deeper analysis that requires reasoning across multiple files.

**Instruct each subagent to return compacted output:** a short summary of findings
(key files, patterns, constraints, gotchas) — not full file contents. The goal is
**dense context you can act on**, not a firehose.

#### 1a-2. Persist research as docs (Tier 1+)

For Tier 1 and Tier 2, do not keep research only in your own context window — persist it
so every agent shares the same baseline and nothing is lost on spin-down.

**Research project folder (IDE-agnostic).** Reuse the gitignore-aware preamble from Step 4:
if the repo already ignores a recognized agent/plan artifact folder, prefer it; otherwise
default to `<workspace-root>/.agents/research/<slug>/` (create it if missing). Do **not**
default research artifacts to `.cursor/` — they must be tool-agnostic.

- `CONTEXT.md` — the shared brief **every agent reads first**: goal, scope, constraints,
  conventions, and pointers to relevant code. This is what gives every agent (any nesting
  level) the same baseline knowledge.
- `findings/NN-<area>.md` — **one file per agent**, written on spin-down, with a fixed shape:
  - **Goal**: the specific question/goal this agent was handed.
  - **What I did**: files explored, approach taken.
  - **Findings**: dense, factual, no firehose.
  - **How this advances the goal**: explicit tie-back to the parent goal + what it unblocks
    or recommends.
  - **Open questions / handoffs**: anything left for the parent or a deeper agent.
- `INDEX.md` (Tier 2 only) — a manifest listing each agent, its goal, and its findings file.

**Uniform agent model (one role, fractal).** There is no privileged "orchestrator" class vs
"subagent" class — **everyone is just an agent with a parent**. Every agent, including the
top-level one, has identical capabilities and follows the identical lifecycle below,
including the ability to spawn its own children. The only difference between agents is who
their parent is: the root agent's parent is the human; every other agent's parent is the
agent that spawned it. "Orchestration agent" just means whichever agent is currently
spawning/collecting from its children — a relative position in the parent chain, not a
special kind of agent.

**Agent lifecycle protocol (every agent, every level — same for all):**

1. **Spin-up**: read `CONTEXT.md` (plus any parent goal handed down) for identical baseline
   knowledge.
2. **Declare goal**: write its specific goal at the top of its findings doc before working.
3. **Work**.
4. **Assess against goal**: is the goal fully answered? If unresolved sub-questions remain
   **and the tier budget allows**, spawn child agents (each handed `CONTEXT.md` + the
   specific sub-goal), wait for their findings docs, fold them in, then re-assess. This is a
   loop — repeat spawn -> collect -> re-assess until the goal is met or the guard trips.
5. **Spin-down**: finish the findings doc, ending with "How this advances the goal" (rolling
   up any children) so nothing is lost when the context window dies.

**Recursive loop until the goal is met (N-level).** Nesting is not a fixed one- or two-level
pass — any agent can itself become a parent. A spawning agent hands children `CONTEXT.md` +
its own goal; children run the SAME lifecycle (and may spawn their own children), writing
findings under a sub-namespaced path (e.g. `findings/02-foo/02a-bar.md`); each parent rolls
up its children's "How this advances the goal" into its own findings doc. Apply this
recursively to any depth.

**Termination + guard (prevent runaway loops).** The loop stops when an agent's goal has no
remaining open questions (its findings doc's "Open questions / handoffs" is empty), OR the
tier budget guard trips (max nesting depth and/or max total agent count, set in Step 0). On
hitting the guard, the agent stops spawning, records the still-open questions in its findings
doc, and hands them up rather than looping forever.

#### 1b. Compact and synthesize findings

After agents return, read their `findings/` docs (the durable source of truth, not just any
in-memory output) and synthesize them into a **research summary** for yourself. This becomes
the factual foundation for the design tree. Note:

- Key files and their roles
- Established patterns and conventions the plan must follow
- Constraints and gotchas discovered
- Gaps that only the user can answer

For Tier 0, there are no findings docs — synthesize directly from your own exploration.

#### 1c. Walk the design tree with the user

Now treat unresolved choices as a **design tree**: parent decisions unlock child decisions.
Walk **each branch** and resolve **dependencies in order** (upstream before downstream).

**Do not ask the user to confirm facts your research already answered.** Only ask when
the code cannot decide: product goals, explicit in/out scope, priorities, tradeoffs,
compliance or policy, or stylistic preferences when multiple valid approaches exist.

**Required context** (some via research, some via questions):

| Context           | How you usually get it                                                |
| ----------------- | --------------------------------------------------------------------- |
| Goal              | Ask (what we're accomplishing and why).                               |
| Scope             | Ask; validate against research findings.                              |
| Constraints       | Research first; ask for non-code constraints.                         |
| Existing patterns | **Research subagents**; ask only if conventions conflict.             |
| Success criteria  | Ask; tie to tests or behavior discovered in research.                 |
| Dependencies      | Ask for org, API, or team blockers; research covers in-repo deps.     |

**Question discipline (one branch at a time).** Default to **one focused** `AskQuestion`
(or one conversational question) at a time when the answer unblocks the next decision.
For each question, state your **recommended answer** in one line (why you lean that way),
then give concrete options so the user can agree or correct you.

**Batching:** Use a single `AskQuestion` with multiple prompts **only** when questions are
**independent** (no ordering dependency) **and** you need both answers in one shot.
Otherwise prefer sequential questions so the tree stays clear.

Thorough clarification still matters: a few precise questions beat a vague plan. Prefer
depth over stuffing many unrelated questions into one message.

Good topics **after** research:

- "Which of these approaches do you prefer?" with options **and** your recommendation
- "Should this handle [edge case X]?" when code or product intent is unclear
- Priority when speed of delivery vs comprehensive coverage conflicts

After questions and research, **spot-check the codebase** so the plan names real
files, functions, and patterns — not guesses.

### Step 2 — Draft the Plan

Write a structured plan following the **Handoff Artifact Template** below. The plan
will be executed by an **orchestration agent** that delegates steps to **subagents** —
design for parallelism and self-contained steps.

**Core principles:**

- **Specificity** — Name exact files, functions, types, config keys. The executing
subagent can't infer what you mean by "update the auth module."
- **Parallelization** — Group steps into **phases**. Steps within a phase have no
dependencies on each other and can be run as parallel subagents. Steps across phases
run sequentially. This is the key structural difference from a flat sequential plan.
- **Self-contained steps** — Each step carries enough context that a subagent can execute
it without reading the full plan or other steps. Include the research findings relevant
to that step.
- **Acceptance criteria** — Every step has testable criteria so the subagent knows when
it's done.
- **Edge cases** — Call out non-obvious gotchas a subagent might miss.
- **Small steps** — Each step should be completable by a single subagent in one focused
session. If a step feels large, break it down further.
- **Failure guidance** — Every step needs an "If this fails" action. Subagents will
hallucinate fixes without explicit recovery instructions.

#### Prescriptive vs Descriptive

- Bad: "Update the auth module to handle the new flow"
- Good: "In `src/auth/handler.ts`, add a new method `validateOAuthToken(token: string): Result<User, AuthError>` that calls the `/oauth/validate` endpoint. Follow the pattern used by `validateJwtToken` on line 45."

#### Sizing Guidelines

- Each step should touch 1–3 files max
- If a step has more than 5 acceptance criteria, split it
- A step should be independently verifiable
- Steps within the same phase must not have file-level conflicts (avoid two subagents editing the same file simultaneously)
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

**Kicking off the orchestration agent**

- If you **saved a file**, suggest a prompt like:
  > "Read `<exact relative path you saved>` and execute the plan. For each phase, launch
  > subagents for each step in parallel. Wait for all subagents in a phase to complete
  > and verify acceptance criteria before starting the next phase."
  >
  > **In Cursor (3.2+):** Prefix with `/multitask` so phases execute via async subagents
  > with queue bypass:
  > `/multitask Read <path> and execute the plan phase by phase, running each phase's steps as parallel subagents.`
- If you delivered via `**CreatePlan`** only, tell the user to use the **confirmed Cursor
plan** as the handoff (no second invented path).

For small plans (1–3 steps), pasting directly into chat is fine.

**Tell the user** (match the surface you used):

- **File:** "Here's the finalized plan, saved to `<exact relative path you saved>`. You can hand this to an orchestration agent that will delegate phases to parallel subagents. Want to start executing it now, or save it for later?"
- **IDE plan (`CreatePlan`):** "Here's the finalized plan in the Cursor plan (confirmed via CreatePlan). You can hand this to an agent that will execute phases with parallel subagents. Want to start executing it now, or refine it first?"

---

## Handoff Artifact Template

Adapt sections as needed but keep the core structure. The plan is designed for an
**orchestration agent** that reads phases sequentially and launches **subagents** for
each step within a phase in parallel.

```markdown
# Implementation Plan: [Title]

> **Instructions for orchestration agent**: Execute phases in order. Within each phase,
> launch a subagent for each step — steps in the same phase are independent and can run
> in parallel. Wait for all subagents in a phase to complete before starting the next
> phase. Verify all acceptance criteria pass before moving on.
>
> Each step is self-contained: the subagent only needs to read its own step, not the
> full plan.
>
> **If running in Cursor (3.2+):** Use `/multitask` to run steps within a phase as async
> subagents with queue bypass for maximum parallelism.

## Objective
[1–2 sentences: what we're building and why]

## Background
[Context discovered during deep research. Reference specific files, patterns, and
conventions. Include anything that isn't obvious from the code alone. This section
is for the orchestration agent's understanding — individual steps carry their own
context for subagents. If a research folder was used, point here:
"Full research lives in `.agents/research/<slug>/` (read `CONTEXT.md` + `findings/`)."]

## Phase 1: [Phase title — e.g. "Foundation / Setup"]
Steps in this phase have no dependencies on each other and can run as parallel subagents.

### Step 1.1: [Short title]
**Files**: `path/to/file.ts`, `path/to/other.ts`
**Context**: [Self-contained context for the subagent executing THIS step. Include
relevant research findings, specific code patterns, and existing behavior. The subagent
should not need to read other steps.]
**Description**: [Specific enough that the subagent doesn't need to make design decisions]
**Acceptance criteria**:
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
**Notes**: [Gotchas, edge cases, or "do NOT do X" warnings]
**If this fails**: [Concrete recovery action: revert file X, check error Y, fall back
to approach Z. Never just "ask the user."]

### Step 1.2: [Short title]
**Files**: `path/to/other-file.ts`
**Context**: [...]
**Description**: [...]
**Acceptance criteria**:
- [ ] [...]
**If this fails**: [...]

## Phase 2: [Phase title — e.g. "Integration"]
**Depends on**: Phase 1 (all steps complete)

### Step 2.1: [Short title]
**Files**: `path/to/file.ts`
**Context**: [Include what Phase 1 produced that this step builds on]
**Description**: [...]
**Acceptance criteria**:
- [ ] [...]
**If this fails**: [...]

[...continue phases and steps...]

## Phase N: Verification
**Depends on**: All previous phases

### Step N.1: Run full test suite
**Description**: [Run tests, verify integration, check for regressions]
**Acceptance criteria**:
- [ ] All existing tests pass
- [ ] New tests pass
- [ ] [Specific regression checks]

## Edge Cases & Gotchas
- [Non-obvious thing 1 subagents should watch for]
- [Non-obvious thing 2]

## Out of Scope
- [Thing that might seem related but is NOT part of this plan]
- [Future work to be done separately]
```

---

## Adapting to Task Size

**Small tasks** (1–2 phases, 1–3 steps total): Single phase is fine — parallelism
isn't needed for everything. Skip Background section, keep Edge Cases brief. Still
include acceptance criteria — that's non-negotiable.

**Medium tasks** (2–4 phases, 4–8 steps total): Full template. The phase structure
shows the orchestration agent where it can parallelize.

**Large tasks** (5+ phases or 9+ steps): Split into multiple sequential plans. Each
plan should be independently valuable. Add a "Plan Overview" at the top showing how
the plans relate and which order to execute them. The orchestration agent runs one
plan at a time but parallelizes within each plan's phases.

---

## Common Pitfalls

- **Skipping the upfront sizing** — Jumping into research without picking a depth tier (Step
0) means you either over-spawn agents on a trivial task or under-research a hard one. Size
first, confirm with the user, then launch.
- **Losing research on spin-down** — For Tier 1+, an agent that finishes without writing its
`findings/` doc (Goal, Findings, How this advances the goal, Open questions) destroys context
the moment its window closes. The findings doc is the deliverable, not the in-chat summary.
- **Defaulting research artifacts to `.cursor/`** — The research folder must be IDE-agnostic
(`.agents/research/<slug>/` or an already-ignored agent-artifact folder). Do not bury research
under a tool-specific path.
- **Skipping deep research** — Launching zero subagents and relying on a few grep calls
produces shallow plans. Invest in parallel exploration upfront — it pays off in specificity.
- **Returning raw research** — Subagent findings should be compacted into dense summaries,
not pasted verbatim. The user doesn't need to see 500 lines of grep output.
- **Skipping user-facing branches** — Jumping to a plan before resolving decisions only the
user can own invites rework. Interview thoroughly: sequential questions, recommendations,
until judgment calls are settled.
- **Being too abstract** — "Update the config" is useless to a subagent. Name the file,
the key, and the value.
- **Forgetting the "don't" list** — Explicitly state what the executing subagent should NOT
do. Subagents will try helpful-but-wrong things without guardrails.
- **Skipping the review** — The plan review catches 80% of gaps. Never deliver a plan
without at least one round of user validation via AskQuestion.
- **Duplicating the plan** — Saving a **new** `.cursor/plans/*.md` while **Cursor Plan mode**
already owns the doc via `**CreatePlan`** splits the source of truth. Use one surface per
thread unless the user asks for an export.
- **File conflicts in a phase** — Two subagents editing the same file in the same phase
will create merge conflicts. If two steps touch the same file, they must be in different
phases.
- **Giant steps** — If a step would take more than ~15 minutes to implement, it's too big.
Break it down so a single subagent can handle it.

---

## Example

**User request:** "Plan out adding dark mode to the settings page"

**Step 1a — Launch parallel research subagents:**

> Launch 3 explore subagents in parallel:
> 1. "How are colors and theming handled in this codebase? Look at styles, CSS, color
>    utilities, and any existing theme infrastructure."
> 2. "How is the settings page structured? What components does it use, how is state
>    managed, what patterns does it follow?"
> 3. "How are similar cross-cutting features (e.g. i18n, accessibility) integrated?
>    What's the test pattern for settings changes?"

**Step 1b — Compact findings:**

> Research summary: Colors are hardcoded constants in `src/utils/colors.ts` (12 semantic
> colors). No CSS custom properties or theme system exists. Settings page uses
> `src/pages/Settings.tsx` with `SettingsSection` components and `useLocalStorage` hook
> for persistence. Tests use React Testing Library with `renderWithProviders` helper.

**Step 1c — Walk the design tree (one question at a time):**

> AskQuestion with recommendation:
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
or 16 hex chars), then point the user and the orchestration agent at that exact path.

**Artifact excerpt:**

```markdown
# Implementation Plan: Dark Mode for Settings Page

> **Instructions for orchestration agent**: Execute phases in order. Within each phase,
> launch a subagent for each step — steps in the same phase are independent and can run
> in parallel. Wait for all subagents in a phase to complete before starting the next phase.

## Objective
Add a dark mode toggle to the settings page that respects system preference
with manual override, persisted to localStorage.

## Phase 1: Foundation (parallel)

### Step 1.1: Add CSS custom properties for theme tokens
**Files**: `src/styles/tokens.css` (new file)
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
handled in Step 2.1 via JS. Keep CSS purely token-based.
**If this fails**: Verify `colors.ts` exports haven't changed. If token
names conflict with an existing CSS framework, prefix with `--app-`.

### Step 1.2: Create useTheme hook
**Files**: `src/hooks/useTheme.ts` (new file)
**Context**: The app uses `useLocalStorage` hook in `src/hooks/useLocalStorage.ts`
for persistence. Follow the same export pattern. No theme hook exists yet.
**Description**: Create a `useTheme` hook that reads system preference via
`matchMedia('(prefers-color-scheme: dark)')`, supports manual override stored
via `useLocalStorage('theme')`, and sets `data-theme` attribute on `document.documentElement`.
**Acceptance criteria**:
- [ ] Hook returns `{ theme, setTheme, systemTheme }`
- [ ] Defaults to system preference on first visit
- [ ] Manual override persists across page reloads
**If this fails**: Check that `useLocalStorage` handles SSR (no `window`). If not,
add a guard.

## Phase 2: Integration
**Depends on**: Phase 1

### Step 2.1: Add dark mode toggle to settings page
**Files**: `src/pages/Settings.tsx`
**Context**: Settings page uses `SettingsSection` components with toggle controls.
`useTheme` hook (created in Phase 1) provides `{ theme, setTheme }`. Follow the
pattern used by the notification toggle in the same file.
**Description**: Add a new `SettingsSection` with a three-way selector (System / Light
/ Dark) that calls `setTheme`. Place it as the first section on the page.
...
```
