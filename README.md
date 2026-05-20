# Shane Myrick's Skills Library

> A personal library of reusable AI agent skills for **Shane Myrick**.
> Skills encode repeatable workflows — each one tells an AI agent exactly how to handle a specific task, using the right tools, in the right order, with the right context.

---

## What Is a Skill?

A skill is a Markdown file (`SKILL.md`) that lives in a named folder under `skills/`. When loaded by an AI agent (e.g., Claude in Cowork), it provides:

- **A trigger description** — when should the agent use this skill?
- **Step-by-step workflow** — exactly what to do, in what order
- **Tool references** — which MCPs, APIs, or integrations are required
- **Optional org- or project-specific context** — when a workflow needs them: conventions, cloud IDs, project keys, personas

Skills are agent-readable instructions, not code. They make common work reproducible without starting from scratch every time.

---

## Install (CLI)

Install every skill from this repo into your coding agents (Cursor, Claude Code, Codex, OpenCode, and [others supported by the skills CLI](https://github.com/vercel-labs/skills)):

```bash
npx skills add smyrick/skills
```

Or with the full URL:

```bash
npx skills add https://github.com/smyrick/skills
```

List skills without installing: `npx skills add smyrick/skills --list`. The deprecated `npx add-skill` forwards to `npx skills add`.

---

## Validate

From the repository root, format and check every `skills/*/SKILL.md`:

```bash
npm install
npm run format
npm run check
```

To check without writing changes:

```bash
npm run format:check
```

CI runs `npm run check` on every push and pull request.

---

## Skill Index

| Skill | Description | Key Tools |
|-------|-------------|-----------|
| [codebase-summary](./skills/codebase-summary/SKILL.md) | Document codebase architecture with ARCHITECTURE.md, entry points, APIs, modules, Mermaid | Read, Glob, Grep |
| [humanize-text](./skills/humanize-text/SKILL.md) | Strip AI-output tells while preserving meaning ("humanize", de-AI prose) | Read, Write, Edit |
| [personal-research-and-plan](./skills/personal-research-and-plan/SKILL.md) | Research and plan non-code decisions (purchases, trips, evaluations) with subagent research | AskQuestion, Task subagents |
| [product-summary](./skills/product-summary/SKILL.md) | Nestable PRODUCT_TERMS.md glossaries (YAML terms); challenges fuzzy language, scenarios, code drift | Read, Glob, Grep; AskQuestion |
| [research-and-plan](./skills/research-and-plan/SKILL.md) | Research-driven implementation plans, design tree, parallel subagent handoff | AskQuestion, CreatePlan, Task subagents |
| [shorten-response](./skills/shorten-response/SKILL.md) | Dense co-worker mode: high signal, low filler, no glazing | Conversational guidance |
| [write-a-prd](./skills/write-a-prd/SKILL.md) | PRD via interview and exploration, then submit as a GitHub issue | Read, Glob, Grep; GitHub |

---

## How to Use a Skill

### In Cowork (Claude Desktop)

Skills in this repo are installed at `~/.skills/skills/` on your machine. Once installed, Claude will automatically load the right skill based on your request — no manual steps needed.

If you want to point Claude to a skill by name:

> "Use the research-and-plan skill to plan this feature before we implement it"

### As a Reference

Any agent with access to this repo can read a `SKILL.md` directly and follow its instructions. The files are written to be self-contained — a capable agent should be able to execute the full workflow after reading one.

---

## Repo Structure

```
README.md                        ← You are here
CONTRIBUTING.md                  ← How to add or improve skills
package.json                     ← npm run add-skill → scaffolds under skills/
scripts/format-skills.mjs        ← npm run format / format:check
scripts/validate-skills.mjs      ← npm run validate
skills/
  <skill-name>/
    SKILL.md                     ← The skill itself (agent-readable instructions)
  codebase-summary/
    SKILL.md                     ← Example: architecture documentation skill
```

Skills are organized as one folder per skill. The folder name is the skill's ID — use lowercase, hyphenated names (e.g., `customer-qbr-prep`, `slack-deal-summary`).

---

## Planned Skills

Skills I intend to build next (roughly in priority order):

- **customer-qbr-prep** — Pull deal context from Salesforce + Jira + Slack, generate a QBR briefing doc
- **account-health-digest** — Weekly digest of at-risk accounts with Slack + Jira signals
- **sa-handoff-writer** — Turn a Slack thread into a structured SA handoff note in Confluence
- **meeting-brief-generator** — Pre-meeting brief from calendar invite + Salesforce + recent Slack
- **solutions-weekly-standup** — Aggregate team Jira updates into a manager-ready standup summary

Want to contribute one? See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Optional shared tooling

Generic pointers sometimes referenced from skills (no tenant or employer-specific IDs):

| Constant | Value |
|----------|-------|
| Preferred Claude model | `claude-sonnet-4-20250514` |
| Atlassian MCP URL | `https://mcp.atlassian.com/v1/mcp` |

---

## License

MIT — see [LICENSE](./LICENSE).
