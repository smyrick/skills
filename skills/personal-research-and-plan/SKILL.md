---
name: personal-research-and-plan
description: |
  Research and plan non-code decisions before acting. Use for purchases, trips, comparisons, evaluations, or personal decisions needing options, tradeoffs, sources, and an action plan. Select direct research, focused read-only leaf scouts, or an internal research-orchestrator subworkflow, then stress-test tradeoffs and deliver a decision plan.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: AskQuestion (Cursor) or user prompting (Claude Code). Task subagents (generalPurpose)
  and web research tools for factual research. Route durable .agents/research/<slug>/ context and
  findings through research-orchestrator.
---

# Personal Research and Plan

Create action plans for non-code decisions through interview, research, tradeoff analysis, and user review. The output is a markdown decision plan the user can act on or share.

Treat this skill as the user's only planning entrypoint. It owns user communication, approvals, research synthesis, tradeoff decisions, and the final plan. Choose the smallest research mode after the pre-research interview; the user does not need to invoke another skill.

For durable research, route internally through `research-orchestrator` as one subworkflow. It owns its research assignments, metadata, retries, persisted findings, and research synthesis. Consume its research-only handoff, verify material sources, then resume this workflow. Do not independently manage its children.

Use [`references/decision-handoff-template.md`](references/decision-handoff-template.md) for the final artifact.

Credits: The interview and design-tree pattern is adapted from [grill-me](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md) (Matt Pocock).

## Workflow

### 1. Interview Before Research

Do not launch research until the decision is clear enough to research well. Challenge vague answers and surface the real constraints.

Ask for:

- Real goal: what they are trying to accomplish and why now.
- Success criteria: what concrete outcome would make the decision successful.
- Constraints: budget, timeline, compatibility, location, existing commitments.
- Past attempts or failures.
- Priority ranking when tradeoffs are unavoidable.
- Other decision-makers or users.
- Hidden factors they care about.

Synthesize back the goal, constraints, and priorities. Resolve contradictions before research.

Completion criterion: the user's goal, hard limits, priority order, and decision deadline are explicit.

### 2. Select and Run the Research Mode

Use the smallest useful mode:

- **Direct**: research bounded or familiar decisions in the current context without subagents or a research folder.
- **Ephemeral parallel**: when several independent questions materially benefit from parallelism, launch focused, fresh-context, read-only leaf scouts and keep their findings in the current context.
- **Durable**: when findings need persistence, recovery, provenance, or reuse, route through `research-orchestrator`. Let it enforce artifact authorization and return a research-only handoff before decision work resumes.

Parallelize only independent questions. Give each ephemeral scout one bounded question, scope, expected result, evidence requirements, and validation criteria. Keep scouts as leaves: they cannot spawn children or write durable artifacts. For durable research, treat `research-orchestrator` as one worker and do not separately assign its research questions.

Personal research dimensions:

- Product/option comparison: leading options, differences, strengths, weaknesses.
- Expert reviews and trusted recommendations.
- User reviews and real-world complaints.
- Price, availability, total cost, and value by tier.
- Alternatives and opportunity costs.
- Fit against the user's stated constraints and priorities.

Completion criterion: the mode and reason are explicit, and findings identify credible options, key tradeoffs, current prices or availability when relevant, source quality, and any user-owned decision that remains.

### 3. Stress-Test the Tradeoffs

Walk unresolved choices as a design tree. Challenge assumptions with the research in hand.

Useful pressure tests:

- Tradeoff forcing: "You cannot optimize both X and Y; which loss hurts less?"
- Budget reality: "The options that meet your priorities cost X; what gives?"
- Hidden costs: maintenance, subscriptions, accessories, learning curve, switching cost.
- Edge case pressure: rare but important scenarios.
- Regret minimization: what failure would make them wish they chose differently.
- Alternative framing: whether the original request is solving the wrong problem.

Completion criterion: the user has explicitly accepted the tradeoffs behind the recommendation or narrowed the plan to the alternatives still under consideration.

### 4. Draft the Decision Plan

Use the decision handoff template. Name concrete options, prices, sources, reasons, risks, and next actions.

Completion criterion: the plan makes a clear recommendation or comparison framework, explains what the user gains and gives up, and states what to do next.

### 5. Review, Revise, Deliver

Run a final challenge review before delivery:

- Red-team the recommendation with the strongest counterarguments.
- Ask what would cause regret in 6 months.
- Confirm coverage and missing factors.
- Validate whether stated priorities match likely real behavior.
- Check confidence; if confidence is below 7/10, keep resolving the hesitation.
- Revisit credible alternatives the user still suspects were underweighted.

After revisions, save one authoritative markdown artifact and report the path.
