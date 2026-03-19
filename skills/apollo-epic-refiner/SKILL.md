---
name: apollo-solutions-epic-refiner
description: >
  Use this skill whenever a manager or team lead wants to take a rough or incomplete
  Jira epic in the Apollo Solutions (AS) project and turn it into a sharply defined,
  manager-ready epic. Triggers include: "refine this epic", "help me define an epic for
  my SA", "clean up this Jira epic", "write a better epic", "make this epic clearer for
  my staff", or any request where someone shares an AS-* Jira URL and wants it improved.
  Also use when a manager says they want to assign an epic to a staff member (SA, CSM,
  SE, etc.) and needs it well-defined first. This skill uses a Claude agent to do the
  heavy lifting of gap analysis and rewriting.
compatibility: "Requires Atlassian MCP (getJiraIssue, editJiraIssue) and Anthropic API access"
---

# Apollo Epic Refiner

A reusable skill for Apollo Solutions managers to take a rough Jira epic and produce a
sharply-defined version ready to assign to a staff SA, CSM, or SE.

## When to use this skill

Use whenever someone shares a Jira epic (AS-* key or URL) and wants it improved,
clarified, or made ready to hand to a specific team member.

---

## Workflow

### Step 1 — Read the Epic

Use `Atlassian:getJiraIssue` with:
- `cloudId`: `b8116c26-1732-446c-9a3b-e138b1e55296` (Apollo GraphQL Atlassian cloud)
- `issueIdOrKey`: the AS-* key extracted from the URL
- `responseContentFormat`: `markdown`

Extract these fields from the response:
- `summary` — the epic title
- `description` — the body content
- `assignee` — current assignee (if any)
- `status` — current status

### Step 2 — Gap Analysis

After reading, analyze the epic for these common gaps. Note which are present:

| Gap | What to look for |
|-----|-----------------|
| No timeline or milestones | Missing sprint targets, dates, or phases |
| Vague stories | Story list exists but lacks acceptance criteria or definition of done |
| Unclear deliverables | "Create a guide" without format/length/audience specified |
| Missing priority order | Features listed but no indication of sequence |
| No dependencies called out | Other teams, tools, or epics that must move first |
| Anecdotal success criteria | "SAs report fewer questions" with no measurement plan |
| Unassigned or unclear ownership | Epic owner named but story-level owners missing |

Present the gap analysis to the user briefly before asking questions.

### Step 3 — Ask the Manager 4–6 Targeted Questions

Ask only what's needed to fill the identified gaps. Common questions:

1. **Timeline**: What's the target completion date or sprint? Are there any hard deadlines?
2. **Assignee framing**: Who is leading this (name + role)? What's their bandwidth (e.g., 50% of sprint, full-time)?
3. **Priority feature**: Of the features listed, which is #1 priority to deliver first?
4. **Definition of done**: What does "complete" look like for the epic overall — a Confluence page? A demo? Customer usage?
5. **Dependencies**: Is anything blocked on another team, tool, or epic right now?
6. **Measurement**: How will you know it worked? Is there a way to measure impact (ticket volume, customer survey, time-to-config)?

Tailor questions to only the gaps you found — don't ask all 6 if the epic already covers some.

### Step 4 — Run the Refinement Agent

Once you have the original epic content + manager answers, call the Anthropic API with
the prompt below. This is the core agent that does the rewriting.

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `You are an expert engineering manager writing Jira epics for a Solutions
Architecture team at Apollo GraphQL. Your job is to take a rough epic and manager
context, then produce a sharply-defined, well-structured epic description in Markdown.

The refined epic MUST include all of these sections:
1. **Summary** (2–3 sentence executive summary)
2. **Background** (why this matters, customer pain point)
3. **Goals** (numbered, specific, measurable where possible)
4. **Scope — In v1** (bullet list of concrete deliverables with format/audience specified)
5. **Scope — Out of v1** (explicit exclusions)
6. **Milestones** (phase/sprint breakdown with rough dates or sprint numbers)
7. **Story Breakdown** (each story with: title, owner, acceptance criteria, estimated effort S/M/L)
8. **Dependencies** (other epics, teams, tools)
9. **Success Criteria** (measurable outcomes, not just anecdotal)
10. **Risks & Open Questions**

Write in a direct, professional tone. Be specific — avoid vague language like
"create a guide" without specifying format, length, and audience.
Return ONLY the Markdown content. No preamble, no explanation.`,
    messages: [{
      role: "user",
      content: `ORIGINAL EPIC:\n${epicContent}\n\nMANAGER CONTEXT:\n${managerAnswers}`
    }]
  })
});
```

### Step 5 — Present and Offer to Write Back

1. Show the refined epic to the manager in the chat for review.
2. Highlight what changed (e.g., "Added milestones, added acceptance criteria to each story, clarified success metrics").
3. Ask: **"Should I update AS-XXX in Jira with this refined description, or would you like to edit it first?"**
4. If confirmed, use `Atlassian:editJiraIssue` to write it back:

```
cloudId: b8116c26-1732-446c-9a3b-e138b1e55296
issueIdOrKey: AS-XXX
fields:
  description: <refined content in ADF or markdown>
contentFormat: markdown
```

---

## Building as an Interactive Artifact

If the manager wants a reusable UI (not just a one-off), build a React artifact that:

1. Has an input field for the AS-* epic key or URL
2. Shows a loading state while reading the epic via the Atlassian MCP
3. Displays the gap analysis
4. Presents the 4–6 manager questions as a form
5. Calls the Anthropic API with the refinement prompt on submit
6. Shows a diff-style view (original vs refined) or side-by-side
7. Has a "Write to Jira" button that calls `editJiraIssue`

Use the Atlassian MCP server URL: `https://mcp.atlassian.com/v1/mcp`

### Key Anthropic API pattern for the artifact

```javascript
// In the artifact, call Claude to refine the epic
const refineEpic = async (epicContent, managerAnswers) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      mcp_servers: [{
        type: "url",
        url: "https://mcp.atlassian.com/v1/mcp",
        name: "atlassian-mcp"
      }],
      system: REFINEMENT_SYSTEM_PROMPT, // see Step 4 above
      messages: [{ role: "user", content: `ORIGINAL EPIC:\n${epicContent}\n\nMANAGER CONTEXT:\n${managerAnswers}` }]
    })
  });
  const data = await response.json();
  return data.content.find(b => b.type === "text")?.text || "";
};
```

---

## Common Apollo Solutions Epic Patterns

When refining AS epics, keep these team-specific conventions in mind:

- **Persona framing**: Apollo Solutions epics often serve multiple personas (platform owner, app team, observability owner). Call out which persona each story targets.
- **Apollo Labs integration**: If the epic produces artifacts (playbooks, demos, guides), they should be linked from Apollo Labs and internal enablement spaces.
- **SA reusability**: Deliverables should be designed for SAs/CSMs to reuse in customer engagements — not just one-off artifacts.
- **Feature coverage**: Solutions epics often cover specific Apollo features (Router, Schema Governance, Connectors, Subscriptions, Federation). Make sure each story maps to a specific feature.
- **Pilot loop**: Successful epics usually include a pilot/feedback story (3–5 live uses, capture feedback, propose v2).

---

## Example Gap → Fix

**Before (vague):**
> Author Playbook – Feature A (Router + Telemetry)
> - Draft and iterate with 1–2 pilot customers

**After (specific):**
> **Story: Author Onboarding Playbook – Router + OTel (Feature A)**
> - **Owner:** Sam
> - **Acceptance Criteria:**
>   - Playbook covers happy path, prereqs, 3 most common failure modes
>   - Format: Confluence page + downloadable PDF, max 8 pages
>   - Persona notes for: platform owner, app team, observability owner
>   - Reviewed by Patrick (feature adoption) and 1 pilot customer
>   - Linked from Apollo Labs Router entry
> - **Effort:** M (3–5 days)
> - **Target Sprint:** Sprint 42

---

## Quick Reference: cloudId

Apollo GraphQL Atlassian cloud ID: `b8116c26-1732-446c-9a3b-e138b1e55296`
Project key: `AS` (Apollo Solutions)
