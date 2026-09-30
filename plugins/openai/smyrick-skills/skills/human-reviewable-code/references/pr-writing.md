# Write a PR for the first scan

The visible description should explain why the change exists, its substantive behavior, verification, and what needs the reviewer's attention. A large coherent diff does not require a long description. Use the repository's required template first; the example below is a flexible fallback, not mandatory headings or a word budget.

```markdown
## Summary

[Why this change is needed and the main behavior change.]

## Verification

- `[check]` — [actual result and tested boundary]
- [Meaningful gap or failure, including native acceptance gaps when applicable]

## Review notes

[Important risk, compatibility change, or requested focus.
Omit this section when unnecessary.]

<details>
<summary>Implementation rationale</summary>

[Supporting detail useful beyond the first scan.]

</details>
```

Replace every bracketed instruction with actual evidence or remove the optional section. Preserve required fields, issue identifiers, and relationships from the repository template. Do not imply an issue is fully resolved when this PR completes only one chunk.

## Decide what stays visible

- Keep breaking changes, required migration or rollout actions, significant risks, unresolved decisions, failed checks, meaningful missing verification, and requested reviewer decisions outside collapsed sections. Detailed migration mechanics can be expandable, but the required action and consequences must remain visible.
- State what was checked and the result. Distinguish checks run against the current change from earlier or unavailable CI. Do not turn "tests added" into "tests passed," or "not run" into "no issues."
- For refactors, distinguish module behavior, composed workflow, and public-entrypoint coverage. Include targeted comparisons with the prior implementation when performed. For example, fake package-manager tests and a foreign interpreter running locally can verify contracts while native installer acceptance remains unverified; keep that gap visible.
- Explain the change's actual user or system behavior rather than advertising quality, safety, or completeness. Omit repeated summaries, generic assurances, session chronology, and inventories of every changed file.

## Put supporting detail in its place

Use `<details>` with a descriptive `<summary>` only when there is useful secondary material, such as implementation rationale, an extended test matrix, or migration mechanics. Keep blank lines around the Markdown body and close every details block. Avoid nesting or adding `open` to material intended to be collapsed.

Do not hide the whole explanation or paste a transcript, raw log dump, or the complete plan into an expandable section. Prefer an evidence link or a short explanation of the relevant result. If the hosting surface does not support collapsible sections, use concise linked supporting documentation rather than literal HTML clutter.

Keep durable technical rationale and current usage in appropriate code comments or implementation-adjacent docs; link to shared planning context separately when it helps. For behavior spanning several modules, give a short reading path from orchestration to the owning responsibilities rather than a file inventory. Before delivery, check whether the first scan explains the change and exposes every review-critical caveat. When authorized to publish, read back the title/body and check rendering when available; otherwise say that rendering was not verified.
