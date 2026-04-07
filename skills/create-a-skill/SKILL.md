---
name: create-a-skill
description: >
  Scaffold and document a new agent skill in smyrick/skills: YAML frontmatter, workflow,
  README index, and org-specific Jira or Confluence constants when needed. Use when the
  user wants to create, add, write, or scaffold a skill or extend this skills library.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: "Read, Write, StrReplace, Glob, Grep; optional Atlassian MCP if the workflow updates Jira from a skill"
---

# Create a skill (this repository)

Use this skill when working **inside [github.com/smyrick/skills](https://github.com/smyrick/skills)** (or a fork) to add a new folder under `skills/<name>/` with a production-ready `SKILL.md`.

## When to use this skill

- User asks to create, add, write, or scaffold a **skill** for agents
- User wants a new repeatable workflow encoded as `SKILL.md` under `skills/`
- User points at CONTRIBUTING or this repo and wants a new library entry

---

## Workflow

### Step 1 — Gather requirements

Ask the user (or infer from context):

1. **Task / domain** — What repeatable workflow does the skill cover?
2. **Triggers** — What should the agent hear from the user to load this skill? (phrases, artifacts, intents)
3. **Tools** — Which MCPs, APIs, or editor tools are required? Any tenant-specific IDs or Jira/Confluence projects?
4. **Scripts** — Is there deterministic automation (validation, formatting), or is prose-only enough?
5. **Extra files** — Will `SKILL.md` exceed ~100 lines or mix unrelated domains? If yes, plan `REFERENCE.md`, `EXAMPLES.md`, or `scripts/` (see below).

### Step 2 — Scaffold the folder

The folder name **must** equal the skill `name` in frontmatter (lowercase, hyphenated).

**Preferred (from repo root, after `package.json` exists):**

```bash
npm run add-skill -- <skill-name>
```

**Or from `skills/`:**

```bash
cd skills && npx skills init <skill-name>
```

Then open `skills/<skill-name>/SKILL.md` and **replace** the generated stub with content that follows this repository’s conventions (do not leave `skills` CLI placeholder text).

If the user cannot run npm, create `skills/<skill-name>/SKILL.md` manually with valid frontmatter and body.

### Step 3 — Draft `SKILL.md`

Follow **[CONTRIBUTING.md](../../CONTRIBUTING.md)** in the repo root. Required shape:

**Frontmatter** (YAML):

```yaml
---
name: skill-name
description: >
  When to load this skill — specific triggers and user intents.
  Use third person; include "Use when …" with concrete phrases.
compatibility: "Tools and MCPs required, e.g. Atlassian MCP, Read/Write"
---
```

**Body — required sections:**

- `## When to use this skill` — 2–4 bullets, **more specific** than the frontmatter
- `## Workflow` — numbered steps; each tool call must include **full parameters** (see Step 4)
- `## Organization-specific context` — include when the workflow needs team Jira/Confluence framing or tenant constants; delete the section if irrelevant

**Optional:**

- `## Example`, `## Common Pitfalls`, `## Quick Reference` (tables for IDs/constants)

**Description field (critical):** The `description` in frontmatter is what agents see when choosing skills. Per ecosystem guidance:

- Prefer **under ~1024 characters**
- First sentence: **what** the skill does
- Second sentence: **"Use when …"** with keywords, contexts, or request types
- Third person; avoid vague lines like "Helps with documents"

**Good:**

> Extracts tables from PDFs and merges pages. Use when the user mentions PDFs, forms, or document extraction.

**Bad:**

> Helps with files.

### Step 4 — Tool precision (non-negotiable for this repo)

Never write "look up the Jira issue." Write the concrete call, for example:

```
Use Atlassian:getJiraIssue with:
- cloudId: <your-atlassian-cloud-id>
- issueIdOrKey: <issue key from URL, e.g. PROJ-123>
- responseContentFormat: markdown
```

Duplicate any **tenant or org constants** (Atlassian cloud ID, Jira project keys, MCP URL, preferred model) from the skill’s Quick Reference or from [README.md — Optional shared tooling](../../README.md) inside the skill where relevant so agents do not rely on chat context.

### Step 5 — Progressive disclosure (optional files)

Add **only when needed:**


| Situation                                               | Add                                                |
| ------------------------------------------------------- | -------------------------------------------------- |
| Long reference material                                 | `REFERENCE.md` linked from `SKILL.md`              |
| Many input/output examples                              | `EXAMPLES.md` linked from `SKILL.md`               |
| Deterministic, repeatable code (validation, transforms) | `scripts/` with clear invocation from the workflow |


Split out files when `SKILL.md` would exceed ~100 lines or mix rarely used advanced material with the main flow.

### Step 6 — Update README Skill Index

Use **Read** then **StrReplace** (or **Write** if appropriate) on **[README.md](../../README.md)**:

Add a row to the **Skill Index** table:

```markdown
| [skill-name](./skills/skill-name/SKILL.md) | One-sentence description | Key Tools |
```

If the skill was listed under **Planned Skills**, remove that bullet.

### Step 7 — Review with the user

Present the draft and confirm:

- Triggers in `description` and "When to use" align with real requests
- No placeholder text remains
- Folder name matches `name` in frontmatter
- README row added

### Step 8 — Review checklist before commit

- Valid YAML: `name`, `description`, `compatibility`
- `description` includes concrete "Use when …" triggers
- Workflow steps numbered; tool calls include parameters
- Org/tenant constants spelled out where applicable
- README Skill Index updated
- `skills/<name>/` matches `name`
- No template placeholders
- From repo root: `npm run validate` passes; `npm run validate:strict` passes before opening a PR

---

## Organization-specific context

When the skill touches Jira, Confluence, or team-specific workflows, pull any shared pointers from **[README.md — Optional shared tooling](../../README.md)** and duplicate the relevant values in the new skill’s **Quick Reference** or inline steps so agents do not depend on chat context.

---

## Example (minimal)

**User:** "Add a skill that reminds agents how to format Jira epic titles."

**Actions:** Run `npm run add-skill -- jira-epic-title-format`, fill frontmatter with triggers ("epic title", "rename epic", "Jira epic"), add a short Workflow with Atlassian calls if issues are updated, add `## Organization-specific context` if tenant IDs apply, add README index row.

---

## Quick Reference


| Resource                          | Location                                      |
| --------------------------------- | --------------------------------------------- |
| Human/agent contributing guide    | [CONTRIBUTING.md](../../CONTRIBUTING.md)      |
| Shared constants table            | [README.md](../../README.md)                  |
| Install all skills from this repo | `npx skills add smyrick/skills` (or repo URL) |


