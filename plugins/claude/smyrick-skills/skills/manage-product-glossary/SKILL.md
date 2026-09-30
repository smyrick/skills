---
name: "manage-product-glossary"
description: "Create and maintain scoped PRODUCT_TERMS.md glossaries that connect product language, domain rules, and code references."
disable-model-invocation: true
user-invocable: true
---

# Manage Product Glossary

Create or update a deliberate, source-aware glossary for product and domain language. Run this workflow only when explicitly invoked. Do not silently enforce terminology during unrelated work.

`PRODUCT_TERMS.md` owns what product words mean and which rules stakeholders intend. `ARCHITECTURE.html`, commonly produced by [`codebase-summary`](../codebase-summary/SKILL.md), owns where code lives and how it executes. Link the artifacts when helpful; do not duplicate their inventories.

## Choose scope and output

Default to drafting proposed glossary changes in chat. Write only after the user approves the exact target path and draft.

- Use repository-root `PRODUCT_TERMS.md` for product-wide language.
- Use `<bounded-context>/PRODUCT_TERMS.md` for language that applies only under that directory.
- Set `scope` to the file’s repo-relative parent directory: `"."` at the root or, for example, `"src/billing"`.
- Resolve an effective glossary from root to the nearest ancestor of the topic path. A valid child override wins only inside its scope.

If the user asks what a term means but does not ask to persist it, answer in chat from the applicable glossary and cited code evidence. Do not edit files.

## Canonical file schema

Use exactly one fenced YAML document beneath the `# Product Terms` heading. Do not maintain a second prose copy of the term data.

````markdown
# Product Terms

```yaml
schema_version: 1
domain: "E-commerce Platform"
scope: "."
last_updated: "2026-07-08"
terms:
  - term: "Order"
    definition: |-
      A confirmed purchase containing one or more line items and belonging to one Customer.
    aliases: ["purchase"]
    code_refs:
      - "src/models/order.ts"
    relationships:
      - type: "belongs_to"
        target: "Customer"
      - type: "contains"
        target: "Line Item"
    intended_rules:
      - "Cancellation applies to the complete Order."
    observed_behavior:
      - claim: "The current cancellation path rejects partial line-item cancellation."
        sources:
          - "src/services/order-service.ts — cancelOrder()"
    open_questions: []
    notes: |-
      Marketing may call an Order a transaction, but transaction is not a canonical product term.
```
````

The outer `markdown` fence above is explanatory only. A real file contains the heading and the inner `yaml` fence.

All fields shown at file level are required. Within a term, require `term`, `definition`, `aliases`, `code_refs`, `relationships`, `intended_rules`, `observed_behavior`, `open_questions`, and `notes`; use empty lists or an empty string when no values are known. Use YAML block scalars such as `|-` for multiline text; do not prefix the scalar indicator with a backslash.

For an intentional child override, add this optional field to the child term:

```yaml
    overrides:
      scope: "."
      term: "Order"
```

`definition` and `intended_rules` express user- or product-approved meaning. `observed_behavior` records what the current implementation demonstrably does and must cite repository evidence. A discrepancy belongs in `open_questions`; code does not silently redefine product intent.

## Workflow

1. Discover every `PRODUCT_TERMS.md` and determine the ancestor chain for the requested scope.
2. Read relevant `ARCHITECTURE.html` files for structural context. Treat their claims as secondary evidence and follow their source citations when behavior matters.
3. Preserve existing agreed language. Ask only about product meaning, scope, or conflicts that cannot be resolved from supplied product material.
4. Inspect types, enums, APIs, schemas, tests, and public UI text when code evidence is useful. Use them to propose terms and populate `code_refs` or `observed_behavior`, not to invent definitions.
5. Draft the complete affected YAML document in chat. Clearly separate proposed intended meaning, current observed behavior, and open questions.
6. Run collision, schema, reference, and evidence checks.
7. Show the exact final draft and target path. Write only after approval, then report the changed terms and unresolved discrepancies.

## Collision and resolution checks

Normalize every `term` and alias by trimming whitespace, applying Unicode normalization, and case-folding before comparison.

- **Same file:** reject duplicate canonical terms, duplicate aliases, or an alias that matches a different canonical term.
- **Ancestor chain:** allow the same canonical term in a child only when `overrides` names the exact ancestor scope and term. Do not use aliases as implicit overrides.
- **Effective scope:** reject any alias that resolves to two different canonical terms in the same effective glossary.
- **Sibling scopes:** allow different meanings because their contexts do not overlap, but flag the divergence and recommend an explicit note when readers may cross boundaries.
- **Relationships:** require every `target` to resolve to one canonical term in the effective glossary; flag missing or ambiguous targets.
- **Code references:** verify referenced paths exist. Move unverifiable behavioral claims to `open_questions` rather than presenting them as observed.

Never resolve a collision by silently renaming or deleting a term. Present the competing entries and ask the user which product meaning should prevail.

## Quality rules

- Prefer one canonical noun phrase per concept and place colloquialisms in `aliases`.
- Make definitions testable and distinguish neighboring concepts explicitly.
- Keep relationships typed and directional.
- Record edge cases, non-goals, and prohibited meanings in `intended_rules` or `notes`.
- Cite implementation claims with a repo-relative path plus a symbol, key, test, or line when practical.
- Do not expose secrets or sensitive data found while inspecting the repository.
- Do not modify `ARCHITECTURE.html`; suggest an explicitly requested `codebase-summary` update when structural documentation is stale.
