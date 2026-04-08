# Contributing a Skill

This guide is written for **both humans and AI agents**. If you're an agent reading this to add a new skill on the repository owner's behalf, follow these steps exactly.

---

## When to Add a Skill

Add a skill when a workflow meets these criteria:

1. **Repeatable** — You or your team does it more than once a month
2. **Multi-step** — it involves at least 2–3 tool calls or decision points
3. **Lossy without guidance** — a generic agent would forget important context (cloud IDs, project keys, personas, conventions)
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

**Scaffold:** from the repository root, run:

```bash
npm run add-skill -- <your-skill-name>
```

That runs `npx skills init` inside `skills/` and creates `skills/<your-skill-name>/SKILL.md`. Replace the generated stub with real content.

**Authoring guide:** follow the agent workflow in [`skills/create-a-skill/SKILL.md`](./skills/create-a-skill/SKILL.md) (requirements, frontmatter, tool precision, README index). It encodes the same rules as this document for agents executing on your behalf.

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
author: Your Name
license: MIT
repository: https://github.com/smyrick/skills
---
```

The `description` field is the most important part. It determines when the skill gets triggered. Write it as if you're telling the agent: "Load this skill if the user says X, or wants to do Y, or provides Z."

Keep `description` between **20 and 500 characters** (after trimming) so `npm run validate` passes.

### 4. Write the workflow

After the frontmatter, write the skill body in Markdown. A good skill includes:

**Required sections:**

- `## When to use this skill` — 2–4 bullet points, more specific than the frontmatter description
- `## Workflow` — numbered steps, with sub-steps where needed. Each step should specify:
  - What action to take
  - Which tool/MCP to call and with what parameters
  - What to do with the result
  - What to ask the user, if anything
- `## Organization-specific context` (if relevant) — tenant-specific constants, conventions, or framing the agent needs (Jira project keys, Atlassian cloud ID, and so on)

**Optional but encouraged:**

- `## Example` — a before/after or sample input/output
- `## Common Pitfalls` — things that go wrong and how to avoid them
- `## Quick Reference` — constants, IDs, or lookup tables the agent will need mid-workflow

**Length (guideline):** Keep the main `SKILL.md` dense—about **~500 lines or fewer** when practical (a **suggestion**, not a limit). Longer is acceptable when the workflow needs it. Prefer tight, high-signal prose and move long reference or examples to linked files (`REFERENCE.md`, `EXAMPLES.md`, `scripts/`) as described in [create-a-skill](./skills/create-a-skill/SKILL.md).

### 5. Be precise about tool calls

Don't say "look up the Jira issue." Say:

```
Use Atlassian:getJiraIssue with:
- cloudId: <your-atlassian-cloud-id>
- issueIdOrKey: <the issue key from the URL, e.g. PROJ-123>
- responseContentFormat: markdown
```

The goal is that an agent with no prior context can execute the workflow correctly on the first try.

### 6. Update README.md

Add a row to the **Skill Index** table in `README.md`:

```markdown
| [your-skill-name](./skills/your-skill-name/SKILL.md) | One-sentence description | Key Tools |
```

Also remove it from the **Planned Skills** list if it was listed there.

### 7. Validate

From the repository root:

```bash
npm install
npm run validate
npm run validate:strict
```

Fix any reported errors before committing. CI runs `validate:strict` on push and pull requests.

### 8. Review checklist before committing

- [ ] Frontmatter is valid YAML with `name`, `description`, and `compatibility`
- [ ] `description` is 20–500 characters and states when to use the skill (specific trigger phrases or request types)
- [ ] Workflow steps are numbered and tool calls include full parameters
- [ ] Tenant- or org-specific constants (cloud IDs, project keys) are spelled out in the skill where needed — don't rely on chat context
- [ ] `author`, `license`, and `repository` are set (required for `validate:strict`)
- [ ] README.md skill index is updated
- [ ] Folder name matches `name` in frontmatter
- [ ] No placeholder text left from the scaffold or draft
- [ ] `npm run validate:strict` passes
- [ ] Main `SKILL.md` aims for brevity (guideline: ~500 lines or less when practical; longer OK if justified); depth is in linked files where appropriate

---

## Modifying an Existing Skill

If you're improving a skill (fixing a broken step, adding a new section, updating a constant):

1. Edit `skills/<skill-name>/SKILL.md` directly
2. Note what changed in your commit message
3. If the trigger description changed meaningfully, update the frontmatter `description` too

If you're making a breaking change (completely different workflow), consider creating a new skill with a versioned name (e.g., `my-skill-v2`) rather than overwriting the existing one.

---

## Skill Quality Bar

A skill is ready to ship when an AI agent with no prior context about you, your employer, or the task can read the `SKILL.md` and complete the workflow correctly — without asking clarifying questions that the skill should have already answered.

If you find yourself thinking "the agent would need to know X to do this step," write X into the skill.

---

## Optional shared tooling

Generic values sometimes referenced from skills are listed in [README.md — Optional shared tooling](./README.md) (for example, Atlassian MCP URL and a suggested Claude model). **Do not** commit real tenant IDs or internal project keys to a public fork; keep those in private skills or in local-only notes.

---

## Questions?

If you're an agent and something in a workflow is ambiguous, ask the repository owner before proceeding with a guess.
If you're a human contributor, open an issue or just edit the file directly — this is a personal repo.
