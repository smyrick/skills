---
name: personal-research-and-plan
description: |
  Produce a structured action plan through deep research and user collaboration. Size the research effort upfront, then use subagents to explore topics and persist findings as docs in an IDE-agnostic .agents/research/ folder so every agent shares baseline knowledge and nothing is lost on spin-down. Perfect for non-code decisions like purchases, trips, or product evaluations. Use when the user asks to research, plan, compare options, or think through a personal decision before acting.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: AskQuestion (Cursor) or user prompting (Claude Code). Task tool subagents
  (generalPurpose) for deep research. Web search and information gathering tools for factual
  research. IDE-agnostic .agents/research/<slug>/ doc handoff (CONTEXT.md + findings/) so agents
  share context across spin-up/spin-down.
---

# Personal Research and Planning

Create action plans through deep research and iterative user feedback. Plans help you make informed decisions by exploring options, comparing alternatives, and thinking through tradeoffs.

Every plan ends with a concrete handoff: a structured markdown document that captures your research findings, decision framework, and next steps.

## At a glance

- **Interview first, research second** — thoroughly question the user BEFORE launching research (Challenge Phase 1)
- **Challenge assumptions** — don't accept vague goals or hand-wavy priorities; push for specifics
- **Size the effort upfront** — after the interview, pick a depth tier (single context / light / research project) and confirm it before launching research, so you spin up the right number of agents
- **Persist research as docs** — write a shared `CONTEXT.md` brief and per-agent `findings/` docs in an IDE-agnostic `.agents/research/<slug>/` folder so every agent boots with the same baseline knowledge
- **Uniform agent lifecycle** — every agent (root or nested) reads `CONTEXT.md`, declares its goal, works, may spawn its own children, and on spin-down records how its findings advance the goal, so nothing is lost when a context window dies
- **Research deeply** — launch subagents to explore topics in parallel, then compact findings into actionable context
- **Stress-test decisions** — armed with research, force hard tradeoffs and probe edge cases (Challenge Phase 2)
- Treat open decisions as a **design tree**: resolve **upstream** choices before **downstream** ones
- **Ask one focused question at a time** when the answer unlocks the next branch; give a **recommended answer** (with a one-line why) plus options
- **Red team the plan** — rigorously review with devil's advocate questions and commitment checks (Challenge Phase 3)
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

### Step 0 — Pre-Research Interview (Challenge Phase 1)

**Before any research begins**, thoroughly interview the user to understand their decision. This is the first grilling phase — challenge assumptions, surface hidden constraints, and ensure the user has thought through what they actually need.

**Do not skip this step.** Starting research without clarity wastes time and produces misaligned recommendations.

#### Questions to ask BEFORE research:

1. **The real goal** — "What are you actually trying to accomplish, and why now?"
   - Challenge vague answers. "I need a camera" → "Why? What will you photograph? What makes your current situation inadequate?"
   - Surface the underlying need, not just the surface request.

2. **Success criteria** — "If this decision goes perfectly, what specific outcomes do you get?"
   - Push for concrete, measurable criteria
   - "I want good photos" is too vague → "Define 'good' — sharpness? Low-light? Skin tones? Print size?"

3. **Constraints** — "What are your hard limits — budget, timeline, compatibility requirements?"
   - Budget: exact number, not a range. If they say "$2,000-3,000", ask "What's forcing the upper bound? What happens at $3,001?"
   - Timeline: when do they need to decide? Why that deadline?
   - Compatibility: existing gear, ecosystem lock-in, platform requirements

4. **Past failures** — "Have you made a similar decision before? What went wrong or right?"
   - Learn from their history
   - If they had a bad experience, what specifically caused it?

5. **Priorities when tradeoffs exist** — "If you can't have everything, what matters most?"
   - Force ranking: "If you had to choose between [A] and [B], which wins?"
   - Surface deal-breakers vs nice-to-haves

6. **Who else is involved** — "Are you the only decision-maker? Who else needs to approve or use this?"
   - Partners, team members, stakeholders
   - Their priorities might differ from the user's

7. **Hidden factors** — "What haven't I asked about that matters to you?"
   - Give the user space to surface concerns you didn't anticipate

**After this interview, synthesize what you learned.** State back to the user:
- "Here's what I understand: [goal], [constraints], [priorities]. Is this accurate?"
- If anything is unclear or contradictory, **challenge it now before research begins**.

**Do not proceed to research until you have clear, specific answers to these questions.**

---

### Step 0.5 — Size the research effort

With the goal and constraints clear, decide **how deep to go**. This sets how many agents you spin up and whether you need a research folder at all. Pick a tier, then **confirm it with the user via one `AskQuestion`** (recommend a tier from what you learned in Step 0; let them override).

- **Tier 0 — Single context**: simple decision, 2-3 obvious options. No subagents, no research folder — research and decide in one context window.
- **Tier 1 — Light**: a few parallel subagents. Create `.agents/research/<slug>/` with a `CONTEXT.md` brief + a handful of `findings/` docs. Shallow recursion guard (e.g. nesting depth <= 2, small agent cap).
- **Tier 2 — Research project**: many options, many factors, or high stakes (expensive or hard to reverse). Full research folder + `INDEX.md` manifest; the recursive agent loop (below) runs to whatever depth the decision needs under a generous guard (higher max depth + agent cap).

The chosen tier defines the **termination guard** for the agent loop in Step 1 (max nesting depth and/or max total agent count). When unsure between two tiers, recommend the smaller one — you can always escalate.

---

### Step 1 — Deep research via subagents

Now that you understand what the user needs, **invest heavily in researching the topic and options**. Launch subagents to research in parallel, then compact their findings into dense context that drives better questions and a more informed plan.

For Tier 1 and Tier 2, research is persisted as **docs** (not just in-context summaries): a shared brief every agent reads on spin-up, and per-agent findings docs written on spin-down. This is what lets any number of nested agents share the same baseline knowledge and lose nothing when a context window ends.

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

#### 1a-2. Persist research as docs (Tier 1+)

For Tier 1 and Tier 2, do not keep research only in your own context window — persist it so every agent shares the same baseline and nothing is lost on spin-down.

**Research project folder (IDE-agnostic).** If the repo or workspace already has a recognized agent/plan artifact folder, prefer it; otherwise default to `<workspace-root>/.agents/research/<slug>/` (create it if missing). Do **not** default research artifacts to `.cursor/` — they must be tool-agnostic.

- `CONTEXT.md` — the shared brief **every agent reads first**: the decision goal, constraints, priorities (from Step 0), and pointers to trusted sources. This gives every agent (any nesting level) the same baseline knowledge.
- `findings/NN-<area>.md` — **one file per agent**, written on spin-down, with a fixed shape:
  - **Goal**: the specific question this agent was handed (e.g. "compare low-light performance of the 3 finalists").
  - **What I did**: sources/reviews consulted, approach taken.
  - **Findings**: dense, factual, no review dumps.
  - **How this advances the goal**: explicit tie-back to the decision + what it unblocks or recommends.
  - **Open questions / handoffs**: anything left for the parent or a deeper agent.
- `INDEX.md` (Tier 2 only) — a manifest listing each agent, its goal, and its findings file.

**Uniform agent model (one role, fractal).** There is no privileged "orchestrator" class vs "subagent" class — **everyone is just an agent with a parent**. Every agent, including the top-level one, has identical capabilities and follows the identical lifecycle below, including the ability to spawn its own children. The only difference between agents is who their parent is: the root agent's parent is the human; every other agent's parent is the agent that spawned it.

**Agent lifecycle protocol (every agent, every level — same for all):**

1. **Spin-up**: read `CONTEXT.md` (plus any parent goal handed down) for identical baseline knowledge.
2. **Declare goal**: write its specific goal at the top of its findings doc before working.
3. **Work**.
4. **Assess against goal**: is the goal fully answered? If unresolved sub-questions remain **and the tier budget allows**, spawn child agents (each handed `CONTEXT.md` + the specific sub-goal), wait for their findings docs, fold them in, then re-assess. This is a loop — repeat spawn -> collect -> re-assess until the goal is met or the guard trips.
5. **Spin-down**: finish the findings doc, ending with "How this advances the goal" (rolling up any children) so nothing is lost when the context window dies.

**Recursive loop until the goal is met (N-level).** Nesting is not a fixed one- or two-level pass — any agent can itself become a parent. A spawning agent hands children `CONTEXT.md` + its own goal; children run the SAME lifecycle (and may spawn their own children), writing findings under a sub-namespaced path (e.g. `findings/02-foo/02a-bar.md`); each parent rolls up its children's "How this advances the goal" into its own findings doc. Apply this recursively to any depth.

**Termination + guard (prevent runaway loops).** The loop stops when an agent's goal has no remaining open questions (its findings doc's "Open questions / handoffs" is empty), OR the tier budget guard trips (max nesting depth and/or max total agent count, set in Step 0.5). On hitting the guard, the agent stops spawning, records the still-open questions in its findings doc, and hands them up rather than looping forever.

#### 1b. Compact and synthesize findings

After agents return, read their `findings/` docs (the durable source of truth, not just any in-memory output) and synthesize them into a **research summary** for yourself. This becomes the factual foundation for the decision tree. Note:

- Key options and their distinguishing features
- Important factors and criteria for this decision
- Constraints and tradeoffs discovered
- Gaps that only the user can answer

For Tier 0, there are no findings docs — synthesize directly from your own research.

#### 1c. Walk the design tree with the user (Challenge Phase 2)

Now treat unresolved choices as a **design tree**: parent decisions unlock child decisions. Walk **each branch** and resolve **dependencies in order** (upstream before downstream).

**This is the second grilling phase.** Armed with research, challenge the user's assumptions and push them to think deeply about tradeoffs. Don't just ask questions — **stress-test their reasoning**.

**Do not ask the user to confirm facts your research already answered.** Only ask when research cannot decide: personal preferences, priorities, budget constraints, specific use cases, or tradeoffs when multiple valid options exist.

**Required context** (some via research, some via challenging questions):

| Context           | How you usually get it                                                |
| ----------------- | --------------------------------------------------------------------- |
| Goal              | Step 0 (pre-research); revalidate if research changes the landscape.  |
| Requirements      | Step 0 + research; challenge if requirements seem unrealistic.        |
| Constraints       | Step 0 + research; probe whether constraints are real or assumed.     |
| Priorities        | Step 0 + research; force hard choices with specific tradeoff examples.|
| Success criteria  | Step 0; validate against what research shows is achievable.           |
| Use case          | Step 0; verify edge cases and unusual scenarios they might encounter. |

**Question discipline (one branch at a time).** Default to **one focused** `AskQuestion` (or one conversational question) at a time when the answer unblocks the next decision. For each question:
1. State your **recommended answer** in one line (why you lean that way)
2. Give concrete options
3. **Challenge the user** — explain what they'd be giving up with each choice
4. **If the user picks the path with bigger tradeoffs, probe why** — make sure they understand what they're accepting

**Batching:** Use a single `AskQuestion` with multiple prompts **only** when questions are **independent** (no ordering dependency) **and** you need both answers in one shot. Otherwise prefer sequential questions so the tree stays clear.

**Challenging questions to ask (based on research findings):**

- **Tradeoff forcing** — "Research shows Option A has [benefit] but costs [tradeoff]. Option B reverses this. Which tradeoff hurts less?"
  - If they waffle, push harder: "You can't have both. Force a choice: A or B?"

- **Budget reality check** — "Your budget is $X, but the options that meet your priorities are $Y. What gives — budget or priorities?"
  - Don't let them dodge: make them commit to stretching budget OR lowering expectations

- **Expertise challenge** — "You said [requirement], but experts say that's not how [domain] works. What am I missing about your situation?"
  - If their requirements contradict expert consensus, understand why before proceeding

- **Hidden costs** — "This option costs $X upfront, but ongoing costs are $Y/year. Over [timeframe], total cost is $Z. Does that change things?"
  - Surface long-term implications they might not have considered

- **Edge case pressure** — "What happens if [rare but important scenario]? Does your choice still work?"
  - Travel photography example: "What if you're shooting in the rain? Dusty environments? Extreme cold?"

- **Regret minimization** — "If you choose [option] and it fails, what would you regret not considering?"
  - Help them think through downside scenarios

- **Alternative framing** — "You're asking about [X], but research suggests [Y] might solve your problem better. Should we explore that?"
  - Challenge the initial request if research reveals a better path

**After each answer, synthesize and reflect back** — "So you're saying [interpretation]. This means you're willing to [tradeoff]. Is that right?"

**Do not move forward until priorities are clear and the user has grappled with real tradeoffs.**

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

### Step 3 — Review and Challenge the Plan (Challenge Phase 3)

After drafting, **rigorously review** the plan with the user. This is the third and final grilling phase. **Never skip this review** — it's where you catch misalignment, surface second thoughts, and ensure the user is truly committed to the decision.

The goal is **shared understanding AND active commitment** — not just "does this look okay?"

#### Required review questions (ask all of these):

**Question 1 — Red team the recommendation:**

> "I recommended [option]. Let me play devil's advocate: here are the strongest arguments AGAINST this choice: [list compelling counter-arguments]. Knowing this, are you still comfortable with this recommendation?"

- Force the user to defend the recommendation against its weaknesses
- If they waver, that's valuable information — maybe the recommendation needs to change

**Question 2 — Regret test:**

> "Imagine it's 6 months from now and you chose [option]. What would make you regret this decision? What warning signs should you watch for?"

- Help them think through failure modes
- If they can't articulate what could go wrong, they haven't thought it through enough

**Question 3 — Coverage check:**

Present a summary of what IS and IS NOT covered, then ask:

> "Does this plan cover everything you need, or are there missing pieces? What's the most important thing I might have overlooked?"

Offer options like:
- "Looks complete — this is what I needed"
- "Missing something — let me explain"
- "Too detailed — simplify it"
- "Wrong focus — we should prioritize [X] instead"

**Question 4 — Priority validation:**

> "I prioritized [factors] based on our discussion. But if I had to guess what you'll ACTUALLY optimize for when you make this purchase, I'd say it's [honest prediction]. Am I right, or will you surprise me?"

- People often SAY they care about one thing but ACT based on another (say quality, buy on price)
- Surface this disconnect now

**Question 5 — Commitment check:**

> "On a scale of 1-10, how confident are you about moving forward with this? If it's below 8, what's holding you back?"

- Low confidence means something is unresolved
- Don't deliver a plan when the user isn't ready to act on it

**Question 6 — Alternative paths:**

> "If this recommendation is wrong, what would make it wrong? What alternative should I have considered more seriously?"

- Give the user space to voice doubts
- If they mention an alternative you dismissed, revisit that decision together

**Question 7 — Timeline pressure:**

> "You said you need to decide by [date]. What happens if you don't? Is this a real deadline or artificial pressure?"

- Sometimes decisions don't need to be made yet
- Better to slow down than make a rushed bad decision

#### After review:

**If substantial concerns surface:** Revise the plan and do another review round. Don't deliver a plan the user isn't confident about.

**If the user is confident:** Acknowledge the thorough process and deliver the final artifact.

**If the user is uncertain but can't articulate why:** Probe deeper. Something is bothering them. Don't move forward until you understand the hesitation.

**Red flags that mean "don't deliver yet":**
- User gives vague or generic answers to review questions
- User defers decisions ("I'll figure that out later")
- User can't explain why they prefer one option over another
- User's confidence is below 7/10
- You have a gut feeling the recommendation doesn't fit

**Trust your instinct.** If something feels off, challenge it. Better to spend more time in review than deliver a plan that leads to regret.

### Step 4 — Deliver the Handoff Artifact

Output the final plan as a single self-contained markdown artifact using the template below. Save it to a file for future reference.

#### Saving to the workspace

Save the plan as a markdown file with a descriptive name.

**Where to write:**

1. **Prefer user-specified location** — If the user mentions a specific file or folder, use that
2. **Default** — `<workspace-root>/.cursor/plans/` or a `plans/` folder in the current directory
3. **Filename:** `<descriptive-slug>.md`

Example: `camera-purchase-research.md` or `trip-planning-italy-2026.md`

Note: the **plan file** and the **research artifacts** are separate. The supporting research (`CONTEXT.md` + `findings/`) lives in the IDE-agnostic `.agents/research/<slug>/` folder from Step 1 — not under `.cursor/`. Reference that folder from the plan so anyone can dig into the full research later.

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

- **Skipping pre-research interview (Step 0)** — The biggest mistake. Launching research without understanding goals, constraints, and priorities wastes time and produces misaligned recommendations. Interview first, always.
- **Accepting vague answers** — "I want a good camera" or "whatever's best" are not answers. Push for specifics. What does "good" mean? Best for what use case?
- **Not challenging assumptions** — If the user says "I need X", ask "Why X specifically? What problem does X solve?" Often they're asking for the wrong thing.
- **Skipping the grilling phases** — The three challenge phases (pre-research, post-research, plan review) are where real clarity emerges. Soft-pedaling questions produces shallow plans.
- **Letting users dodge tradeoffs** — When there are hard choices, don't accept "I want both." Force the decision: "You can't have both. Which one wins?"
- **Skipping the upfront sizing (Step 0.5)** — Diving into research without picking a depth tier means you over-spawn agents on a simple decision or under-research a high-stakes one. Size first, confirm with the user, then launch.
- **Losing research on spin-down** — For Tier 1+, an agent that finishes without writing its `findings/` doc (Goal, Findings, How this advances the goal, Open questions) destroys context the moment its window closes. The findings doc is the deliverable, not the in-chat summary.
- **Skipping deep research** — After thorough questioning, you still need thorough research. Relying on surface-level information produces shallow recommendations. Invest in parallel exploration.
- **Returning raw research** — Subagent findings should be compacted into summaries, not pasted verbatim. The user needs synthesis, not dumps.
- **Being too abstract** — "Get a good camera" is useless. Name specific models, prices, and where to buy.
- **Forgetting tradeoffs** — Every choice has downsides. Be explicit about what you're giving up with each option.
- **Skipping the final review (Step 3)** — The plan review catches misalignment and second thoughts. Never deliver a plan without rigorous review including devil's advocate questions.
- **Delivering when confidence is low** — If the user scores below 7/10 confidence, something is unresolved. Don't deliver the plan yet.
- **Analysis paralysis** — After thorough questioning and research, at some point good enough is good enough. Give a clear recommendation and help the user commit.

---

## Example

**User request:** "Help me research and plan a camera purchase for portrait photography"

**Step 0 — Pre-research interview (Challenge Phase 1):**

> Before I research cameras, I need to understand what you actually need. Let me ask some questions:
>
> 1. **What are you actually trying to accomplish?** "Portrait photography" is broad — are you shooting clients (professional), friends/family (serious hobby), or just learning? What makes your current situation inadequate?
>
> [User: "I'm starting a portrait photography side business. My phone isn't cutting it for clients."]
>
> 2. **Success criteria:** If this goes perfectly, what specific outcomes do you get? Define "professional quality" — skin tones? Low-light? Print size? Client expectations?
>
> [User: "Clients expect sharp images with good skin tones, shallow depth of field for backgrounds. Need to shoot indoors and outdoors. Want to print up to 16x20."]
>
> 3. **Hard constraints:** What's your exact budget? Not a range — an actual number. What happens at $1 over?
>
> [User: "$2,500 absolute max for body only. More than that and I can't afford lenses this year."]
>
> 4. **Timeline:** When do you need to decide, and why that date?
>
> [User: "First client shoot in 3 weeks. Need time to learn the camera."]
>
> 5. **Past experience:** Have you used cameras beyond your phone? What brands or features are you already comfortable with?
>
> [User: "Used Canon DSLRs years ago. Familiar with manual controls."]
>
> 6. **Force ranking:** If you can't have everything, what wins: autofocus speed, resolution, or lens selection?
>
> [User: "Autofocus speed — I can't miss shots with paying clients."]
>
> **Synthesis:** "So you're starting a portrait business, need reliable autofocus above all else, $2,500 exact budget for body only, 3-week timeline, prior Canon experience. Is that right?"

**Step 1a — Launch parallel research subagents:**

> Launch 3 generalPurpose subagents in parallel:
> 1. "Research the top mirrorless cameras for portrait photography in 2026 under $2,500. Focus on autofocus performance, sensor quality, and lens ecosystem. Prioritize autofocus reliability for paid work."
> 2. "What do professional portrait photographers recommend for cameras in the $2,000-3,000 range? Look for expert reviews emphasizing autofocus and skin tone rendering."
> 3. "Compare Sony A7 IV vs Canon R6 II vs Nikon Z6 III for portrait photography with paying clients. What are the key differences in autofocus reliability and tradeoffs?"

**Step 1b — Compact findings:**

> Research summary: Top options are Sony A7 IV ($2,498), Canon R6 II ($2,499), and Nikon Z6 III ($2,297). All have excellent sensors and autofocus. Sony has best autofocus system (759 points, fastest tracking). Canon has best ergonomics and color science, plus you know Canon already. Nikon is most affordable but smaller lens ecosystem. Key factor for you: Sony's autofocus is objectively superior for fast-moving subjects (children, events), which matters for client work.

**Step 1c — Walk the design tree (Challenge Phase 2):**

> **Tradeoff forcing:** Research shows Sony A7 IV has the best autofocus (critical for your paid work), but Canon R6 II has better ergonomics and you're already familiar with Canon. Which matters more: cutting-edge autofocus or comfort/familiarity?
>
> **Recommendation:** Sony A7 IV. Here's why: autofocus was your #1 priority, and Sony's lead is significant. Missing a shot costs you money with clients. Canon's ergonomics advantage isn't worth the risk.
>
> **Challenge:** But you said you know Canon. Learning a new system takes time. You have 3 weeks. Is that enough, or should you stick with Canon for the faster learning curve?
>
> [User: "3 weeks is enough if the autofocus is really that much better."]
>
> **Budget reality check:** Sony A7 IV is $2,498, leaving you $2 for lenses. You need at least one portrait lens. The cheapest decent option is $700. What gives — budget or timeline? Can you delay the shoot, or do you have another $700?
>
> [User: "Can stretch to $3,200 total if the lens is essential."]
>
> **Hidden costs:** Sony lenses are expensive. A 50mm f/1.8 is $248, but the better 85mm f/1.8 is $598. Over time, building a lens kit will cost $2-3k more. Does that change things?
>
> [User: "No, I'll buy lenses as I earn from shoots."]
>
> **Synthesis:** "So you're committing to Sony A7 IV at $2,498 + 85mm f/1.8 at $598 = $3,096 total. You're willing to learn a new system in 3 weeks because autofocus reliability matters more than familiarity for paid work. You accept that lenses are expensive but will buy as needed. Correct?"

**Step 2 — Draft the plan** (using Handoff Artifact Template)

**Step 3 — Review and challenge (Challenge Phase 3):**

> **Red team:** I recommended Sony A7 IV. Let me argue AGAINST this choice: Sony menus are notoriously confusing. You have 3 weeks to learn. If you can't figure out the menu system under pressure, you'll miss shots anyway. Canon R6 II's worse autofocus might still be better than Sony's autofocus + menu confusion. Still comfortable with Sony?
>
> [User: "Good point, but reviews say the autofocus is mostly automatic. I'll practice before the shoot."]
>
> **Regret test:** It's 6 months from now. What would make you regret choosing Sony over Canon?
>
> [User: "If I kept missing shots despite the autofocus, or if the menu system frustrated me so much I didn't use the features."]
>
> **Commitment check:** On a scale of 1-10, how confident are you about moving forward with Sony A7 IV + 85mm f/1.8?
>
> [User: "8/10. Only hesitation is the menu system, but I trust the autofocus advantage."]
>
> **Alternative paths:** If Sony is wrong, what alternative should I have considered more seriously?
>
> [User: "Honestly, maybe I should have considered sticking with Canon for the first year and upgrading to Sony later once I'm making money."]
>
> **Challenge:** That's actually a smart path. Canon R6 II with faster learning curve, then upgrade when you can afford Sony's full ecosystem. Should we revise the plan?
>
> [User: "No, I want to start with the better tool. I'll make the learning curve work."]
>
> **Final confidence:** 8/10 is solid. You've thought through the tradeoffs. Let me deliver the plan.

**Step 4 output:** Save to `camera-purchase-portrait-business.md` with full research summary, specific recommendation (Sony A7 IV + 85mm f/1.8 at $3,096 from B&H Photo), tradeoff analysis, and next steps including 3-week learning plan before the shoot.

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
