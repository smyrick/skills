---
name: your-skill-name
description: >
  Use this skill when [specific trigger phrase or user intent]. Triggers include:
  "[example phrase]", "[example phrase]", or any request where [condition].
  Also use when [secondary trigger].
  Replace this entire block with a clear, specific description of when to load this skill.
compatibility: "List required tools, e.g. Atlassian MCP (getJiraIssue), Slack MCP, Anthropic API"
---

# Skill Title

One sentence describing what this skill does and who it's for.

## When to use this skill

- User mentions [specific term or request type]
- User provides [specific artifact, URL, or input type]
- User says they want to [specific action]
- [Add 1–2 more specific triggers]

---

## Workflow

### Step 1 — [Action Name]

What you're doing in this step and why.

Use `[ToolName:methodName]` with:
- `param1`: value or description of where to get it
- `param2`: value or description

Extract these fields from the response:
- `fieldName` — what it represents

### Step 2 — [Action Name]

What you're doing in this step.

[If you need to ask the user something at this step, write it explicitly:]

Ask the user:
1. **[Question topic]**: [Full question text]
2. **[Question topic]**: [Full question text]

Only ask questions that aren't already answered by the input they provided.

### Step 3 — [Action Name]

What you're doing in this step.

[If calling an API, show the full call structure:]

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `Your system prompt here`,
    messages: [{ role: "user", content: `...` }]
  })
});
```

### Step 4 — Present and Confirm

1. Show the output to the user for review.
2. Summarize what was produced (e.g., "Added timeline, clarified acceptance criteria").
3. Ask: **"Should I [write this back / send it / save it], or would you like to edit it first?"**
4. If confirmed, use `[ToolName:writeMethod]` with:
   - `param1`: value
   - `param2`: value

---

## Apollo Context

[Delete this section if not relevant to this skill.]

Team-specific conventions, framing, or constants this skill needs:

- **Persona A**: What they care about / how to frame output for them
- **Persona B**: What they care about / how to frame output for them
- Any team naming conventions, project-specific norms, etc.

---

## Example

[Optional but highly recommended. Show a before/after or sample interaction.]

**Input:** [What the user provided]

**Output:** [What the skill produced]

---

## Quick Reference

[Delete this section if not needed. Good for skills that reference fixed values mid-workflow.]

| Constant | Value |
|----------|-------|
| Atlassian Cloud ID | `b8116c26-1732-446c-9a3b-e138b1e55296` |
| [Other constant] | `[value]` |
