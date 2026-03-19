# Contributing a Skill

This guide is written for **both humans and AI agents**. If you're an agent reading this to add a new skill on Shane's behalf, follow these steps exactly.

---

## When to Add a Skill

Add a skill when a workflow meets these criteria:

1. **Repeatable** — Shane (or the team) does it more than once a month
2. **Multi-step** — it involves at least 2–3 tool calls or decision points
3. **Lossy without guidance** — a generic agent would forget important Apollo context (cloud IDs, project keys, personas, conventions)
4. **Valuable to encode** — having written instructions makes the output meaningfully better

If a task is truly one-off or trivial, don't add a skill — just do the task.

---

## Step-by-Step: Adding a New Skill

### 1. Choose a name

Use lowercase, hyphenated naming: `customer-qbr-prep`, `sa-handoff-writer`, `deal-risk-digest`.

The name becomes the folder name and the skill's ID. Keep it short and descriptive.

### 2. Create the folder and SKILL.md

```
skills/
  <your-skill-name>/
    SKILL.md
```

Copy `skills/_template/SKILL.md` as your starting point.

### 3. Fill in the frontmatter

Every `SKILL.md` must begin with YAML frontmatter:

```yaml
---
name: your-skill-name
description: >
  One to three sentences that tell an AI agent WHEN to use this skill.
  Be specific about trigger phrases, request types, and the intended user.
  This text is what the agent reads to decide whether to load the skill.
compatibility: "List required MCPs or integrations, e.g. Atlassian MCP, Slack MCP"
---
```

The `description` field is the most important part. It determines when the skill gets triggered. Write it as if you're telling the agent: "Load this skill if the user says X, or wants to do Y, or provides Z."

### 4. Write the workflow

After the frontmatter, write the skill body in Markdown. A good skill includes:

**Required sections:**

- `## When to use this skill` — 2–4 bullet points, more specific than the frontmatter description
- `## Workflow` — numbered steps, with sub-steps where needed. Each step should specify:
  - What action to take
  - Which tool/MCP to call and with what parameters
  - What to do with the result
  - What to ask the user, if anything
- `## Apollo Context` (if relevant) — any team-specific constants, conventions, or framing the agent needs

**Optional but encouraged:**

- `## Example` — a before/after or sample input/output
- `## Common Pitfalls` — things that go wrong and how to avoid them
- `## Quick Reference` — constants, IDs, or lookup tables the agent will need mid-workflow

### 5. Be precise about tool calls

Don't say "look up the Jira issue." Say:

```
Use Atlassian:getJiraIssue with:
- cloudId: b8116c26-1732-446c-9a3b-e138b1e55296
- issueIdOrKey: <the AS-* key from the URL>
- responseContentFormat: markdown
```

The goal is that an agent with no prior context can execute the workflow correctly on the first try.

### 6. Update README.md

Add a row to the **Skill Index** table in `README.md`:

```markdown
| [your-skill-name](./skills/your-skill-name/SKILL.md) | One-sentence description | Key Tools |
```

Also remove it from the **Planned Skills** list if it was listed there.

### 7. Review checklist before committing

- [ ] Frontmatter is valid YAML with `name`, `description`, and `compatibility`
- [ ] `description` clearly states when to use the skill (specific trigger phrases or request types)
- [ ] Workflow steps are numbered and tool calls include full parameters
- [ ] Apollo-specific constants (cloud IDs, project keys) are spelled out — don't rely on context
- [ ] README.md skill index is updated
- [ ] Folder name matches `name` in frontmatter
- [ ] No placeholder text left from the template

---

## Modifying an Existing Skill

If you're improving a skill (fixing a broken step, adding a new section, updating a constant):

1. Edit `skills/<skill-name>/SKILL.md` directly
2. Note what changed in your commit message
3. If the trigger description changed meaningfully, update the frontmatter `description` too

If you're making a breaking change (completely different workflow), consider creating a new skill with a versioned name (e.g., `apollo-epic-refiner-v2`) rather than overwriting the existing one.

---

## Skill Quality Bar

A skill is ready to ship when an AI agent with no prior context about Shane, Apollo, or the task can read the `SKILL.md` and complete the workflow correctly — without asking clarifying questions that the skill should have already answered.

If you find yourself thinking "the agent would need to know X to do this step," write X into the skill.

---

## Apollo Shared Constants

These values appear across multiple skills. Always use the canonical values below:

| Constant | Value |
|----------|-------|
| Atlassian Cloud ID | `b8116c26-1732-446c-9a3b-e138b1e55296` |
| Jira Project — Apollo Solutions | `AS` |
| Atlassian MCP URL | `https://mcp.atlassian.com/v1/mcp` |
| Preferred Claude model | `claude-sonnet-4-20250514` |
| Anthropic API endpoint | `https://api.anthropic.com/v1/messages` |

---

## Questions?

If you're an agent and something in a workflow is ambiguous, ask Shane before proceeding with a guess.
If you're a human contributor, open an issue or just edit the file directly — this is Shane's personal repo.
