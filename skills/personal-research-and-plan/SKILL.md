---
name: "personal-research-and-plan"
description: "Research a non-code decision, compare evidence and tradeoffs, and produce a concrete recommendation and action plan."
---

# Personal Research and Plan

Help the user make a non-code decision through bounded clarification, current research, explicit tradeoffs, and a practical next step.

Use [`references/decision-handoff-template.md`](references/decision-handoff-template.md) as a flexible output shape.

## Workflow

### 1. Frame the Decision

Extract the goal, decision deadline, hard constraints, ranked preferences, locale, currency, and who else is affected. Ask one compact batch of questions only when missing answers would materially change the options or recommendation. Use at most one focused follow-up round in ordinary cases.

If the user does not answer, continue with clearly labeled assumptions when doing so is safe and reversible. For an irreversible or high-stakes choice, pause rather than guess an indispensable fact.

Completion criterion: the research question and decision-changing criteria are clear enough to compare options fairly.

### 2. Apply Freshness and Safety Rules

Browse for facts that can change, including prices, availability, schedules, laws, product specifications, travel conditions, and safety guidance. Record the access date and relevant market, locale, and currency. Prefer primary or authoritative sources for consequential claims and distinguish source facts from inference.

For medical, legal, financial, personal-safety, or similarly high-stakes decisions:

- Use current authoritative sources and surface important uncertainty.
- Do not make an irreversible decision on the user's behalf or imply professional authority.
- Recommend qualified professional help when the consequences or uncertainty warrant it.
- Separate generally useful information from advice that depends on the user's private circumstances.

Do not persist secrets, sensitive personal information, or unnecessary identifying details in research artifacts.

### 3. Research the Options

Use the lightest useful mode:

- For a narrow comparison, research and synthesize in the current context.
- For multiple focused research passes or reusable findings, explicitly invoke `$research-orchestrator` with a sanitized brief.
- If `$research-orchestrator` is unavailable or persistence is inappropriate, research the same questions sequentially without creating a durable folder.

Compare credible leading options, the status quo, and meaningful alternatives. Evaluate total cost, availability, fit, expert evidence, recurring complaints, switching or learning costs, opportunity cost, and failure modes. Note stale, missing, sponsored, or conflicting evidence.

Completion criterion: each material claim is traceable and the comparison covers the user's decision criteria rather than generic popularity.

### 4. Weigh the Tradeoffs

Tie every recommendation to the user's ranked criteria. Pressure-test hidden costs, edge cases, regret scenarios, and whether the original framing solves the real problem.

Do not require the user to accept a tradeoff or reach an arbitrary confidence score. When evidence is close or incomplete, give conditional recommendations and state what fact would change the choice.

### 5. Deliver the Decision Plan

Return a clear recommendation, the strongest alternative, material tradeoffs, assumptions, confidence and uncertainty, concrete next actions, and dated sources. Include the research folder or evidence basis when durable research was used.

Answer in chat by default. Create or update a markdown artifact only when the user explicitly requests one or has already chosen a durable handoff workflow, and report the path when written.
