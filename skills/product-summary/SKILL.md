---
name: product-summary
description: |
  Builds and maintains nestable PRODUCT_TERMS.md glossaries with YAML term entries (definitions, aliases, code refs, relationships). Use when defining product/domain language, DDD vocabulary, shared glossary, or when the user asks what a term means in the product sense. When PRODUCT_TERMS.md exists, challenges glossary conflicts, sharpens overloaded words, stress-tests domain rules with concrete scenarios, and cross-checks claims against code (code is truth; update glossary after user confirms).
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: File system access (Read, Glob, Grep). Optional AskQuestion for disambiguation. No
  external MCPs required.
---

# Product Summary: Domain glossary and language discipline

Complements [`codebase-summary`](../codebase-summary/SKILL.md) (structure and `ARCHITECTURE.md`). This skill owns **product/domain vocabulary** in `PRODUCT_TERMS.md`: canonical terms, boundaries, and how they map to code. It **creates/updates** those files and **enforces** them in conversation when loaded.

## When to use this skill

- User wants a **glossary**, **domain model**, **shared language**, or **PRODUCT_TERMS**
- User is confused about terminology that is **not** the same as folder/module names
- User asks "what does X mean here?" in a **product** sense
- User is doing **DDD**, naming debates, or aligning docs with behavior
- A `PRODUCT_TERMS.md` exists (or should exist) and the conversation uses domain language

---

## Artifact: `PRODUCT_TERMS.md`

**Locations**

- **Root:** repository root `PRODUCT_TERMS.md` — default scope for the whole product.
- **Nested:** any subdirectory may add `PRODUCT_TERMS.md` (e.g. `src/billing/PRODUCT_TERMS.md`) for a bounded context.

**Nesting rules**

- **Additive:** child files introduce terms that apply under that path (and below) in addition to ancestors.
- **Override:** if the same `term` key appears in a child file, the **child wins** for that term when the discussion is scoped to that subtree (implementation detail: prefer the **nearest** `PRODUCT_TERMS.md` walking up from the file or area under discussion). Root terms apply everywhere they are not overridden.
- Before adding or overriding a term, **Glob** `**/PRODUCT_TERMS.md`, **Read** each, and check for **duplicate `term` keys** or conflicting definitions across the stack.

**File shape**

- One YAML **document** in the frontmatter block for file-level metadata only if you use it; **terms live in the body** as a YAML list under a `## Terms` section (see template below). Agents must keep the list **valid YAML** (quote strings with colons; use `\|` for multiline if needed).

**Term entry template** (each list item under `## Terms`):

```markdown
## Terms

- term: Order
  definition: "A confirmed purchase containing one or more line items, tied to a single Customer."
  aliases: ["purchase", "transaction"]
  code_refs: ["src/models/order.ts", "src/services/OrderService.ts"]
  relationships:
    - "belongs_to: Customer"
    - "contains: LineItem"
  notes: "Partial cancellation is NOT supported — cancelling cancels the entire Order."
```

Optional top-of-file metadata (after opening `---`, before terms in body you can use a second small block or prose — keep machine-friendly lists in `## Terms`):

```yaml
---
domain: "E-commerce Platform"
last_updated: "2026-05-14"
---

## Terms

- term: Customer
  definition: "An organization that holds a billing account. Distinct from User (an individual person)."
  aliases: ["account", "org"]
  code_refs: ["src/models/customer.ts"]
  relationships:
    - "has_many: User"
    - "has_many: Order"
```

**Cross-link:** If `ARCHITECTURE.md` exists, skim its glossary section; do not duplicate technical module inventory — link or reference architecture there, domain here.

---

## Workflow A — Create or refresh glossary

### Step 1 — Discover existing glossaries

`Glob` pattern: `**/PRODUCT_TERMS.md`

- If any exist: **Read** all; ask whether to **extend**, **reconcile conflicts**, or **replace** a given file (do not overwrite without confirmation).
- If none: plan root `PRODUCT_TERMS.md` unless the user names a bounded context path.

### Step 2 — Gather domain intent

Ask minimally (one branch at a time when choices block the next):

- Product/bounded context name and **who** uses the system (not full PRD unless asked).
- Terms the team **already** agrees on vs. open debates.

### Step 3 — Mine candidates from code (optional but default-on)

Use **Glob** + **Grep** + **Read** to propose candidates (types, enums, DB tables, public API names). **Do not** treat code names as definitions — they seed `term` and `code_refs`; definitions still need user/product validation.

### Step 4 — Draft `## Terms` list

- Prefer **one canonical `term`** per concept; put colloquialisms in `aliases`.
- Add `relationships` as short typed edges (`belongs_to`, `contains`, `has_many`, etc.) when they disambiguate.
- Add `notes` for **non-goals**, **edge cases**, or **disallowed** meanings.

### Step 5 — Review and write

Show the user the draft; on approval **Write** the file at the chosen path. If nested, state explicitly which root terms are **overridden** under that subtree.

---

## Workflow B — Enforcement (when `PRODUCT_TERMS.md` applies)

Load the relevant glossaries (root + nearest ancestor chain for the topic path). Then apply **all** of the following when the user's message uses domain language:

### B1 — Challenge against the glossary

When the user's usage **conflicts** with a defined term (including via `aliases` pointing elsewhere), **stop and ask** before continuing. Use this shape (adapt wording to facts):

> Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?

### B2 — Sharpen fuzzy or overloaded language

When the user uses a vague word that maps to **multiple** canonical terms (or none), propose the split:

> You're saying 'account' — do you mean the Customer or the User? Those are different things.

Map to the glossary's `term` / `aliases` once resolved.

### B3 — Stress-test with concrete scenarios

When discussing **relationships** or **rules**, invent **short** edge-case scenarios (one or two sentences) that probe boundaries:

> If a Customer has two Users and one User places an Order, does the other User see it?

Do not treat invented scenarios as truth — use them to elicit precision, then record outcomes in `notes` or `definition` after user confirms.

### B4 — Cross-reference with code

When the user states **how the system behaves**, spot-check with **Read** / **Grep** on `code_refs` and related paths.

- **Code is source of truth** for behavior: if code contradicts the glossary or the user's statement, surface it:

> Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?

- **Do not** silently edit the glossary to match code. **Ask** which is intended; if the user says code is correct, **then** update `PRODUCT_TERMS.md` (and `last_updated` if present).

---

## Merge and conflict hygiene

- **Across files:** same `term` in root and child with different `definition` = intentional **override** only in the child's subtree; call that out in chat when it could confuse readers.
- **Across conversation:** if the user redefines a term mid-thread, confirm before persisting.
- **With codebase-summary:** architecture describes *where* code lives; product-summary describes *what words mean* and *what is allowed*. Keep both docs aligned when one changes.

---

## Tips

- Keep definitions **testable** ("partial cancellation: not supported") not slogans.
- `code_refs` should be **stable paths**; refresh when files move.
- If the repo has no product docs, glossary quality depends on user interview — say so explicitly.

---

## Pitfalls

- **Do not** equate marketing names with `term` keys without explicit mapping in `aliases` or `notes`.
- **Do not** let nested overrides proliferate synonyms for the same concept across teams without a `notes` cross-reference to the canonical term.
- **Do not** skip B4 when the user says "always", "never", or "supports" — those are verifiable.

---

## Quick reference: resolution order

1. Nearest `PRODUCT_TERMS.md` **override** for `term`
2. Next ancestor file
3. Root `PRODUCT_TERMS.md`
4. User clarification in-thread (then persist to the right file)
