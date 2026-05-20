---
name: personal-research-and-plan
description: |
  Produce a structured action plan through deep research and user collaboration. Use subagents to explore topics, compact findings, and walk the design tree to shared understanding. Perfect for non-code tasks like researching a camera purchase, planning a trip, evaluating products, or making informed decisions. Use when the user asks to research, plan, compare options, or think through a personal decision before acting.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: AskQuestion (Cursor) or user prompting (Claude Code). Task tool subagents
  (generalPurpose) for deep research. Web search and information gathering tools for factual
  research.
---

# Personal Research and Planning

Create action plans through deep research and iterative user feedback. Plans help you make informed decisions by exploring options, comparing alternatives, and thinking through tradeoffs.

Every plan ends with a concrete handoff: a structured markdown document that captures your research findings, decision framework, and next steps.

## At a glance

- **Research deeply first** — launch subagents to explore topics in parallel, then compact findings into actionable context before making decisions
- Aim for **shared understanding** with the user before finalizing recommendations
- Treat open decisions as a **design tree**: resolve **upstream** choices before **downstream** ones
- **Ask one focused question at a time** when the answer unlocks the next branch; give a **recommended answer** (with a one-line why) plus options
- Finish with a **handoff artifact** (template below) — saved as a markdown file for future reference

*Credits:* The interview and design-tree pattern is adapted from [grill-me](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md) (Matt Pocock).

## When to use this skill

- User asks to research a purchase decision (camera, laptop, car, home appliance)
- User wants to compare options or evaluate alternatives
- User is planning something complex (trip, event, project) and wants to think it through
- User wants help making an informed decision with pros/cons analysis
- User says "help me research", "what should I consider", "compare these options"
- The decision is complex enough that jumping to an answer would risk missing important factors

---

## Workflow

### Step 1 — Deep research via subagents

Before drafting anything, **invest heavily in understanding the topic and options**. Launch subagents to research in parallel, then compact their findings into dense context that drives better questions and a more informed plan.

#### 1a. Launch parallel research subagents

**If running in Cursor (3.2+):** Prefix your research delegation with `/multitask` to enable async subagent execution and queue bypass. This lets all research agents run in parallel without blocking each other or the parent session — maximizing throughput.

Use the `Task` tool with `subagent_type="generalPurpose"` to investigate multiple aspects simultaneously. Each subagent should have a focused research question and return **compacted findings** — not raw information dumps.

**Research dimensions to cover (launch as many in parallel as apply):**

- **Product/option comparison** — "What are the top-rated options in this category? What are their key differences, strengths, and weaknesses?"
- **Expert reviews and recommendations** — "What do experts and trusted sources recommend? What criteria do they use to evaluate?"
- **User reviews and real-world experience** — "What do actual users say? What common complaints or praises appear across reviews?"
- **Price and value analysis** — "What's the price range? Are there budget, mid-range, and premium options? What's the value proposition of each tier?"
- **Alternatives and tradeoffs** — "What alternatives exist? What would you gain or lose by choosing one over another?"
- **Requirements and constraints** — "What factors must be considered? (budget, timeline, compatibility, use case, personal preferences)"

For complex decisions, launch multiple `generalPurpose` subagents to reason through different aspects in parallel.

**Instruct each subagent to return compacted output:** a short summary of findings (key options, patterns, important factors, gotchas) — not full article text or review dumps. The goal is **dense context you can act on**, not a firehose.

#### 1b. Compact and synthesize findings

After subagents return, synthesize their findings into a **research summary** for yourself. This becomes the factual foundation for the decision tree. Note:

- Key options and their distinguishing features
- Important factors and criteria for this decision
- Constraints and tradeoffs discovered
- Gaps that only the user can answer

#### 1c. Walk the design tree with the user

Now treat unresolved choices as a **design tree**: parent decisions unlock child decisions. Walk **each branch** and resolve **dependencies in order** (upstream before downstream).

**Do not ask the user to confirm facts your research already answered.** Only ask when research cannot decide: personal preferences, priorities, budget constraints, specific use cases, or tradeoffs when multiple valid options exist.

**Required context** (some via research, some via questions):

| Context           | How you usually get it                                                |
| ----------------- | --------------------------------------------------------------------- |
| Goal              | Ask (what we're trying to accomplish and why).                        |
| Requirements      | Ask; validate against research findings.                              |
| Constraints       | Research first; ask for personal constraints (budget, timeline).      |
| Priorities        | Ask; what matters most when tradeoffs exist.                          |
| Success criteria  | Ask; what would make this a good decision.                            |
| Use case          | Ask; how will this be used in practice.                               |

**Question discipline (one branch at a time).** Default to **one focused** `AskQuestion` (or one conversational question) at a time when the answer unblocks the next decision. For each question, state your **recommended answer** in one line (why you lean that way), then give concrete options so the user can agree or correct you.

**Batching:** Use a single `AskQuestion` with multiple prompts **only** when questions are **independent** (no ordering dependency) **and** you need both answers in one shot. Otherwise prefer sequential questions so the tree stays clear.

Thorough clarification still matters: a few precise questions beat a vague plan. Prefer depth over stuffing many unrelated questions into one message.

Good topics **after** research:

- "Which of these approaches do you prefer?" with options **and** your recommendation
- "Is [factor X] important to you?" when personal preference matters
- Priority when competing factors conflict (price vs features, convenience vs quality)

After questions and research, **synthesize the findings** so the plan references real options, specific tradeoffs, and concrete criteria — not guesses.

### Step 2 — Draft the Plan

Write a structured plan following the **Handoff Artifact Template** below. The plan should help the user make an informed decision and know what to do next.

**Core principles:**

- **Specificity** — Name exact products, models, options, prices, sources. Don't say "get a good camera" — say "Sony A7 IV ($2,498) vs Canon R6 II ($2,499)."
- **Actionability** — Each recommendation should be concrete enough to act on. Include where to buy, what to ask for, what to check.
- **Tradeoff clarity** — When options exist, clearly explain what you gain and lose with each choice
- **Decision criteria** — Make it clear why you're recommending what you recommend, based on the user's stated priorities
- **Next steps** — What should the user do after reading this plan?

#### Prescriptive vs Descriptive

- Bad: "Look into getting a camera that fits your needs"
- Good: "Based on your portrait photography priority and $2,500 budget, I recommend the Sony A7 IV ($2,498 body only at B&H) for its superior autofocus and lens ecosystem, or the Canon R6 II ($2,499 at Adorama) if you prefer Canon ergonomics and already own EF lenses."

### Step 3 — Review the Plan with the User

After drafting, use `AskQuestion` again to validate the plan. This is critical — never skip the review. The goal is **shared understanding** on recommendations, tradeoffs, and next steps.

**Question 1 — Coverage check:**

Present a summary of what IS and IS NOT covered, then ask:

> "Does this plan cover everything you need, or are there missing pieces?"

Offer options like:

- "Looks complete — this is what I needed"
- "Missing something — let me explain"
- "Too detailed — simplify it"

**Question 2 — Priority check:**

> "Did I prioritize the right factors based on what matters to you?"

**Question 3 — Recommendation check:**

> "Do my recommendations make sense given your situation, or should I reconsider?"

Revise the plan based on feedback. If changes are substantial, do another review round.

### Step 4 — Deliver the Handoff Artifact

Output the final plan as a single self-contained markdown artifact using the template below. Save it to a file for future reference.

#### Saving to the workspace

Save the plan as a markdown file with a descriptive name.

**Where to write:**

1. **Prefer user-specified location** — If the user mentions a specific file or folder, use that
2. **Default** — `<workspace-root>/.cursor/plans/` or a `plans/` folder in the current directory
3. **Filename:** `<descriptive-slug>.md`

Example: `camera-purchase-research.md` or `trip-planning-italy-2026.md`

**Tell the user:**

> "Here's your research summary and decision plan, saved to `<path>`. You can reference this when making your purchase/decision, or share it with others for feedback."

---

## Handoff Artifact Template

Adapt sections as needed but keep the core structure focused on decision-making.

```markdown
# Research & Decision Plan: [Title]

## Goal
[1–2 sentences: what you're trying to decide or accomplish and why]

## Research Summary

### Options Evaluated
[List the main options you researched with key details]

**Option 1: [Name/Model]**
- **Price**: [specific price and where to buy]
- **Key Features**: [what makes this stand out]
- **Pros**: [strengths based on research]
- **Cons**: [weaknesses or tradeoffs]
- **Best For**: [what use case or person this suits]

**Option 2: [Name/Model]**
[same structure]

### Key Decision Factors
[The criteria that matter most for this decision, based on user input and research]

1. **[Factor 1]** — [why this matters and what the research showed]
2. **[Factor 2]** — [why this matters and what the research showed]
3. **[Factor 3]** — [why this matters and what the research showed]

## Recommendations

### Primary Recommendation: [Option Name]
**Why**: [Based on your stated priorities of X and Y, this option provides the best balance because...]

**What to do**:
1. [Specific action: where to buy, what to check, what to ask]
2. [Any preparation or prerequisite steps]
3. [How to verify this is the right choice before committing]

### Alternative: [Option Name]
**When to choose this instead**: [Specific situations where the alternative makes more sense]

## Tradeoffs & Considerations

**What you're gaining**: [Clear benefits of the primary recommendation]
**What you're giving up**: [What you're not getting vs other options]
**Risk factors**: [Things that could go wrong or might not work as expected]

## Out of Scope
[Things you considered but decided are separate decisions or not relevant]

## Next Steps
1. [Immediate action to take]
2. [Follow-up research if needed]
3. [When to revisit this decision]

## Sources & References
[Key sources used in research: expert reviews, comparison sites, user reviews, etc.]
```

---

## Adapting to Decision Complexity

**Simple decisions** (2-3 options, clear criteria): Keep it brief. One page with options, recommendation, and next steps is enough.

**Medium decisions** (4-6 options, multiple factors): Full template. The structure helps compare systematically.

**Complex decisions** (many options, many factors, high stakes): Consider breaking into phases:
1. First plan: narrow down to 2-3 finalists
2. Get user feedback
3. Second plan: deep dive on finalists with detailed comparison

---

## Common Pitfalls

- **Skipping deep research** — Relying on surface-level information produces shallow recommendations. Invest in parallel exploration upfront.
- **Returning raw research** — Subagent findings should be compacted into summaries, not pasted verbatim. The user needs synthesis, not dumps.
- **Skipping user-facing branches** — Jumping to recommendations before understanding priorities invites misalignment. Interview thoroughly with sequential questions and recommendations.
- **Being too abstract** — "Get a good camera" is useless. Name specific models, prices, and where to buy.
- **Forgetting tradeoffs** — Every choice has downsides. Be explicit about what you're giving up.
- **Analysis paralysis** — At some point, good enough is good enough. Don't research forever — give a clear recommendation.
- **Skipping the review** — The plan review catches gaps. Never deliver a plan without at least one round of user validation.

---

## Example

**User request:** "Help me research and plan a camera purchase for portrait photography"

**Step 1a — Launch parallel research subagents:**

> Launch 3 generalPurpose subagents in parallel:
> 1. "Research the top mirrorless cameras for portrait photography in 2026. Focus on autofocus performance, sensor quality, and lens ecosystem."
> 2. "What do professional portrait photographers recommend for cameras in the $2,000-3,000 range? Look for expert reviews and real-world recommendations."
> 3. "Compare Sony A7 IV vs Canon R6 II vs Nikon Z6 III for portrait photography. What are the key differences and tradeoffs?"

**Step 1b — Compact findings:**

> Research summary: Top options are Sony A7 IV ($2,498), Canon R6 II ($2,499), and Nikon Z6 III ($2,297). All have excellent sensors and autofocus. Sony has best autofocus and largest lens selection. Canon has best ergonomics and color science. Nikon is most affordable but smaller lens ecosystem. Key factors: autofocus reliability, lens selection, ergonomics, existing gear compatibility.

**Step 1c — Walk the design tree (one question at a time):**

> AskQuestion with recommendation:
> "What's your budget for body + initial lens setup, and do you own any existing lenses?
> **Recommendation:** Knowing this helps narrow to Sony (if you want best autofocus), Canon (if you have EF lenses), or Nikon (if budget is tight)."
>
> Options:
> - Under $3,000 (body only, will buy lenses separately)
> - $3,000-4,000 (body + one lens)
> - Already own lenses from [brand]
>
> [After answer] Next question: indoor vs outdoor shooting, how important is video, then ergonomics preference if still ambiguous.

**Step 4 output:** Save to `camera-purchase-portrait-photography.md` with full research summary, specific recommendations with prices and purchase links, tradeoff analysis, and next steps.

**Artifact excerpt:**

```markdown
# Research & Decision Plan: Portrait Photography Camera Purchase

## Goal
Select a mirrorless camera for portrait photography with excellent autofocus, image quality, and lens options within a $2,500 budget (body only).

## Research Summary

### Options Evaluated

**Option 1: Sony A7 IV**
- **Price**: $2,498 (body only at B&H Photo)
- **Key Features**: 33MP sensor, 759-point phase-detect AF, excellent eye-tracking
- **Pros**: Best-in-class autofocus, largest lens selection, great low-light performance
- **Cons**: Menu system is complex, smaller grip than Canon
- **Best For**: Photographers who prioritize autofocus reliability and want maximum lens options

**Option 2: Canon R6 II**
- **Price**: $2,499 (body only at Adorama)
- **Key Features**: 24MP sensor, Dual Pixel AF II, excellent color science
- **Pros**: Best ergonomics, Canon color science, EF lens compatibility
- **Cons**: Lower resolution than Sony, smaller native RF lens selection
- **Best For**: Photographers with existing Canon EF lenses or who prefer Canon ergonomics

[...]
```
