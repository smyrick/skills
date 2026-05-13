---
name: humanize-text
description: Rewrite text to remove common AI-output patterns (em-dashes, colon-led impact
  statements, excess semicolons, telltale adjectives like "delve", "nuanced", "tapestry"),
  preserving all information and meaning. Use when the user pastes AI-generated prose, asks to
  "humanize", "de-AI", "make this sound less like ChatGPT", clean up LLM output, or review writing
  for robotic tells before shipping.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: Read (for file input); Write/Edit (to update files in place). No MCPs required - pure
  text transformation.
---

# Humanize Text

Take a piece of text, flag the patterns that make it read as AI-generated, and rewrite it so it sounds like a person wrote it - without losing any information, facts, or argument structure.

## When to use this skill

- User pastes AI-generated or AI-assisted prose and asks to clean it up
- User says "humanize this", "de-AI this", "make this sound less like ChatGPT", "remove the AI tells"
- User wants a pre-publish sanity pass on their own writing (blog post, email, doc)
- User pastes a block of LLM output and asks for "the human version"

## Non-goals

This skill does one thing: strip AI-writing fingerprints. It does **not**:

- Fact-check, add citations, or verify claims
- Shorten for brevity (unless a specific pattern requires a local rewrite)
- Restructure arguments or reorder paragraphs
- Change tone (formal ↔ casual) beyond what removing AI tells requires
- Impose a house style, brand voice, or grammar rulebook
- Score text with a "probability it's AI" verdict

## Workflow

### 1. Capture the input

Determine what text to process:

- **Pasted in chat** - work with it directly
- **File path given** - use `Read` to load it; remember the path for the optional write-back step
- **"The text above" / ambiguous** - ask the user to confirm which block before proceeding

For inputs over ~2000 words, mention that the rewrite may take a long response and confirm before proceeding.

### 2. Scan for patterns

Walk through the input once and tag every instance of the categories in the table below. Keep a count per category - the user sees those counts in the Findings block.

Treat code blocks, quoted material, section headings, URLs, numbers, and proper nouns as **out of bounds** - never rewrite inside them.

### 3. Produce the Findings block

Before rewriting, list what you found. This builds trust and lets the user veto a category before you commit to changes.

Format:

```markdown
## Findings

- **Em-dashes:** 7 instances
- **Telltale vocabulary:** 4 ("delve" ×2, "robust", "tapestry")
- **Colon-led impact statements:** 2
- **Transition cliches:** 3 ("Furthermore", "Moreover", "In conclusion")
- **Hedging filler:** 1 ("It's worth noting that")
- (categories with 0 hits are omitted)
```

### 4. Rewrite

Output the full revised text. Apply the rules below. Do not summarize, do not shorten for the sake of it, do not add examples or commentary that weren't in the original.

**Hard constraints:**

- Preserve every factual claim, number, name, date, and URL verbatim.
- Preserve headings, code blocks, block quotes, and lists as-is (structure-wise).
- Don't change meaning to make a sentence shorter.
- Don't inject new content, examples, caveats, or opinions.
- Match the author's existing voice - if they write terse, stay terse; if they write long, don't chop it.

### 5. Offer next actions

After the rewrite, ask:

- "Want me to revert any category? (e.g. keep the em-dashes)"
- If a file path was given: "Want me to write this back to `<path>`?" - use `Edit` or `Write` only after the user confirms.

## Patterns to detect and fix

Summary table. For deeper examples and a longer vocabulary list, see [PATTERNS.md](./PATTERNS.md).

| Category | What to look for | Replacement strategy |
|---|---|---|
| Em-dashes | `—` (U+2014), and en-dashes `–` used mid-sentence | Split into two sentences, use commas, or parentheses. Never just swap in a hyphen. |
| Colon-led impact statements | "The result: X.", "The takeaway: Y.", "Bottom line: Z." | Fold into a normal sentence: "The result was X." |
| Semicolon overuse | More than ~1 semicolon per 200 words, or any semicolon joining two short clauses | Split into two sentences, or use "and"/"but". |
| Telltale vocabulary | delve, nuanced, multifaceted, intricate, tapestry, myriad, robust, seamless, leverage (verb), navigate (metaphoric), testament to, realm of, landscape of, ever-evolving, underscores, underpins, pivotal, paramount, profound, compelling | Plain synonyms: look at, complex, many, strong, smooth, use, proof of, area of, changing, shows, key, important, deep. See [PATTERNS.md](./PATTERNS.md) for the full list. |
| Opening filler | "Certainly!", "Absolutely!", "Of course!", "Great question!" | Delete. |
| Hedging filler | "It's worth noting that", "It's important to remember", "It should be noted that" | Delete the frame, keep what followed. |
| Transition cliches | "Furthermore,", "Moreover,", "Additionally,", "In conclusion," | Drop, or replace with "Also,", "And,", "So,". |
| Rule-of-three padding | Forced triplets where the third item is filler | Keep the two real items. |
| "Not only X but also Y" | The full construction | "X and Y", or two sentences. |
| Metaphor bingo | "dive into", "delve into", "unpack", "unlock", "navigate the complexities of", "at the heart of", "in today's fast-paced world" | Literal verbs: "look at", "explain". "Today" instead of "in today's market". |
| Empty superlatives | "game-changer", "revolutionary", "cutting-edge", "groundbreaking", "world-class" | Cut the adjective or replace with a concrete claim. |
| Balanced parallelism | Every sentence the same shape, every paragraph the same length | Vary sentence length. Short sentences are fine. |
| Smart punctuation | Curly quotes, curly apostrophes, ellipsis character `…` | Replace with straight quotes and `...` unless the source clearly uses curly quotes throughout. |
| Forced bulletization | Prose chopped into a 5-bullet list with no reason | Convert back to prose when bullets don't aid scanning. |
| Excessive hedging | "may", "might", "could potentially", "in some cases" stacked in one sentence | Pick one hedge or commit to the claim. |
| Emoji sprinkle | ✅ 🚀 ✨ scattered in body text | Remove unless the author's voice uses them. |

## Output format

Return two blocks in this order:

```markdown
## Findings
[bulleted list of categories with counts; skip categories with 0 hits]

## Rewritten text
[full revised text, ready to copy back]
```

If the input was short (under ~100 words) you can add a brief `## Notable rewrites` block with 2-3 before/after lines. For longer input, skip it - the diff would be too noisy.

## Example

**Input:**

> In today's fast-paced world, it's worth noting that modern APIs are multifaceted — they underpin everything from mobile apps to IoT devices. The takeaway: we must delve into their intricate design patterns to build robust systems.

**Findings:**

- **Metaphor bingo:** 1 ("In today's fast-paced world")
- **Hedging filler:** 1 ("it's worth noting that")
- **Telltale vocabulary:** 4 ("multifaceted", "underpin", "intricate", "robust")
- **Em-dashes:** 1
- **Colon-led impact statements:** 1 ("The takeaway:")
- **Metaphor bingo (delve):** 1

**Rewritten text:**

> Modern APIs do a lot. They power mobile apps, web clients, and IoT devices. So we need to understand their design patterns to build systems that hold up under load.

Same information, same argument, no AI fingerprint.

## Common pitfalls

- **Over-correcting.** Some em-dashes are intentional - an author who uses them elsewhere is not being AI; they just like em-dashes. Flag but don't force-remove if the surrounding text makes it clear it's the author's style.
- **Context-appropriate vocabulary.** "Robust" in a security doc, "nuanced" in a policy piece, and "leverage" in finance are legitimate domain terms. Flag them once in findings, then judge in context before rewriting.
- **Don't flatten real rhetoric.** Parallelism and triplets are sometimes the right tool. The pattern to fix is the *forced* or *padded* version, not every instance.
- **Preserve voice for first-person.** If the author writes "I think" or "I've found", keep their first-person tone; don't convert to a neutral explainer voice.
- **Code and quotes are untouchable.** Never rewrite inside a code block, block quote, or direct quotation, even if it contains em-dashes.
- **Don't shorten for the sake of shortening.** The goal is human-sounding, not terse. If the author wrote a long sentence that reads naturally after the rewrite, leave the length alone.
