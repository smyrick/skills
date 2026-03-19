# Shane's Skills Library

> A personal library of reusable AI agent skills for **Shane Hegde, Solutions Director at Apollo GraphQL**.
> Skills encode repeatable workflows — each one tells an AI agent exactly how to handle a specific task, using the right tools, in the right order, with the right context.

---

## What Is a Skill?

A skill is a Markdown file (`SKILL.md`) that lives in a named folder under `skills/`. When loaded by an AI agent (e.g., Claude in Cowork), it provides:

- **A trigger description** — when should the agent use this skill?
- **Step-by-step workflow** — exactly what to do, in what order
- **Tool references** — which MCPs, APIs, or integrations are required
- **Apollo-specific context** — team conventions, cloud IDs, project keys, personas

Skills are agent-readable instructions, not code. They make common work reproducible without starting from scratch every time.

---

## Skill Index

| Skill | Description | Key Tools |
|-------|-------------|-----------|
| [apollo-epic-refiner](./skills/apollo-epic-refiner/SKILL.md) | Take a rough Jira epic in the Apollo Solutions (AS) project and turn it into a sharply-defined, manager-ready epic | Atlassian MCP, Anthropic API |

---

## How to Use a Skill

### In Cowork (Claude Desktop)

Skills in this repo are installed at `~/.skills/skills/` on your machine. Once installed, Claude will automatically load the right skill based on your request — no manual steps needed.

If you want to point Claude to a skill by name:
> "Use the apollo-epic-refiner skill to clean up AS-421"

### As a Reference

Any agent with access to this repo can read a `SKILL.md` directly and follow its instructions. The files are written to be self-contained — a capable agent should be able to execute the full workflow after reading one.

---

## Repo Structure

```
README.md                        ← You are here
CONTRIBUTING.md                  ← How to add or improve skills
skills/
  <skill-name>/
    SKILL.md                     ← The skill itself (agent-readable instructions)
  _template/
    SKILL.md                     ← Starter template for new skills
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

## Conventions & Apollo Context

These constants appear across multiple skills and are recorded here for reference:

| Constant | Value |
|----------|-------|
| Atlassian Cloud ID | `b8116c26-1732-446c-9a3b-e138b1e55296` |
| Jira Project — Apollo Solutions | `AS` |
| Preferred Claude model | `claude-sonnet-4-20250514` |
| Atlassian MCP URL | `https://mcp.atlassian.com/v1/mcp` |

---

## License

MIT — see [LICENSE](./LICENSE).
