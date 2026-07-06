---
name: humanize-text
description: Strips AI-writing tells from prose and matches the writer's own voice from samples or
  prompt history. Removes common ChatGPT patterns, avoids over-corrected anti-AI habits, and uses
  the user's tone when they ask to humanize text, de-AI prose, de-slop writing, sound less like
  ChatGPT, or sound more like themselves.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: Read (for file input); Write/Edit (to update files in place). No MCPs required - pure
  text transformation.
---

# Humanize Text

Strip the cues that make prose read as AI-generated and force a deliberate, human voice. This skill does not write well for you and has no house style. It removes specific tells and, where text reads as AI because nobody chose a voice, forces a deliberate one. If the user already has a recognizable voice, preserve that instead of flattening them into generic "human" prose.

## The trap to avoid

The failure mode of every anti-AI-writing effort is replacing one default register with another. The 2024 tell was the smooth corporate voice: the em dash, "delve," "it's not just a tool, it's a partner," bullets for everything, a tidy "in conclusion." The 2026 over-correction is its mirror: staccato three-word fragments, forced lowercase, a "here's the thing" cold open, a swear dropped in to seem casual, and fake typos to beat a detector. Readers clock the second one just as fast.

**Treat the over-corrected register as its own tell.** Watch three moves in particular:
- **Conspicuous em-dash avoidance:** the fix for a dash is a comma or a period, not an ellipsis, not a colon, and not a visibly contorted sentence that bends around the gap.
- **Manufactured casualness:** a "honestly," a lowercase "i," a "lol" bolted onto otherwise formal writing reads as costume, not voice.
- **Uniform short rhythm:** all-short sentences are as mechanical as all-medium ones. Evenness is the tell, whichever length it settles on.

## If the user wants "sound like me"

Build a compact voice brief before rewriting. Use the highest-signal evidence available, in this order:

- **Their own writing sample or prior draft** in the same genre
- **Their published long-form corpus** such as blog posts, essays, docs, or a personal site repo
- **Talk or video transcripts/captions** when actual spoken words are available
- **Their prompts and messages in the current thread**
- **Explicit style instructions** ("short talk", "no glazing", "be direct", "sound more like me")
- **Genre constraints** if no personal sample exists

Extract only stable traits, not gimmicks:

- **Density:** terse vs expansive
- **Stance:** agreeable, skeptical, blunt, warm, detached
- **Rhythm:** short punches, mixed cadence, long analytical sentences
- **Formatting habits:** prose-first, bullets-first, labels, fragments
- **Diction:** plain, technical, colloquial, formal

Mirror decisions, not noise. Do **not** imitate typos, one-off jokes, accidental grammar mistakes, or stray quirks just because they appear in chat once.

Prefer artifacts with real sentence-level signal. A blog post is strong evidence. A talk transcript is useful. A video title, one-line abstract, or frontmatter description is weak evidence and should not drive the brief by itself.

## When to use this skill

- User pastes AI-generated or AI-assisted prose and asks to clean it up
- User says "humanize this", "de-AI this", "make this sound less like ChatGPT", "de-slop this", "remove the AI tells"
- User wants a pre-publish sanity pass on their own writing (blog post, email, doc)
- User pastes a block of LLM output and asks for "the human version"
- User says it "sounds like ChatGPT," "reads like AI," or "is too polished"
- User says "make it sound like me", "use my tone", "write like I do", or points to their own prompts/messages as the style reference

## Non-goals

This skill does one thing: strip AI-writing fingerprints. It does **not**:

- Fact-check, add citations, or verify claims
- Shorten for brevity (unless a specific pattern requires a local rewrite)
- Restructure arguments or reorder paragraphs
- Impose a house style, brand voice, or grammar rulebook
- Score text with a "probability it's AI" verdict
- Guess whether a machine wrote something (detectors are unreliable)

## Mode 1: Build (writing new prose)

Most "sounds like AI" outcomes are a specification problem, not a wording problem. An unspecified prompt gets the median of the training data, and everyone's median is the same smooth voice. Before drafting anything for a reader, establish a brief.

### Pin a register

Decide which of four registers the piece is in, because that decides what "plain" looks like:

- **Register A, casual.** Texts, DMs, personal posts. Contractions, fragments, slang, first person.
- **Register B, conversational-professional.** Work email, Slack, team updates, changelogs. Plain and direct, contractions, light warmth, no throat-clearing.
- **Register C, expository.** Essays, articles, READMEs, blog posts. A clear argument, varied rhythm, a point of view, paragraphs over bullets. Where most unslopping happens.
- **Register D, formal.** Papers, briefs, specs, official docs. No contractions, structured, impersonal, sourced. Formality here is correct, not a tell.

The register guards against over-correcting: a fragment is native in A and a tell in D; a contraction is right in A-C and wrong in D; a "lol" is voice in A and costume in C.

### Establish before writing

- **A voice brief.** Keep it to 3-5 traits. Example: "direct, high-density, low-praise, prose over bullets, plain technical diction."
- **A speaker, inside that register.** Who is talking, to whom, and why they care. Not "a helpful assistant." If the user has a sample of their past writing, anchor to it.
- **A claim.** The one thing the piece asserts, in a sentence. AI prose reads as empty because it is fluent with nothing to say.
- **A shape that follows the idea.** Structure from the argument, not a template. No intro/three-body/conclusion skeleton unless it earns its place.
- **Contractions and real rhythm.** Vary sentence length on purpose. Let one run long and the next stop short.

When the user asks for their own tone and you have any usable sample, infer the brief and proceed. Only ask for more samples when the tone matters and you truly do not have enough evidence. When the user gives no brief and wants you to just write, produce a deliberate draft and say what you chose, or offer two genuinely distinct voices. Do not produce one median draft.

## Mode 2: Audit (reviewing existing prose)

When reviewing or cleaning existing prose, or when the user says "does this sound like AI," "de-slop this," "make it sound like me":

### 1. Capture the input

Determine what text to process:

- **Pasted in chat** - work with it directly
- **File path given** - use `Read` to load it; remember the path for the optional write-back step
- **"The text above" / ambiguous** - ask the user to confirm which block before proceeding

For inputs over ~2000 words, mention that the rewrite may take a long response and confirm before proceeding.

### 2. Capture the voice reference

When the user wants "sound like me" or "my tone," build a 1-2 line brief from the strongest evidence available:

- **Primary:** same-genre writing sample, published blog post, or article
- **Secondary:** personal site repo content and actual talk/video transcripts
- **Tertiary:** current-thread prompts and explicit style instructions
- **Fallback:** genre norms plus the register rules above

Weight repeated choices over isolated ones. A pattern across six prompts is voice; a typo in one sentence is noise. If the user's style is notably direct, skeptical, terse, or low-fluff, preserve that. Do not smooth them into assistant warmth.

When a repo is available as a style corpus, sample 2-5 representative pieces before deciding the brief. Prefer published prose over scratch notes, outlines, or AI-assisted research folders unless the user explicitly points to those drafts as the target voice. For a site repo like `smyrick.github.io`, published files under content/blog are stronger evidence than page chrome or metadata.

When using videos, prefer full transcripts or captions. Do not infer voice from the YouTube title, abstract, or conference blurb alone. Spoken filler, stage cadence, and audience acknowledgements are also weaker signals than the recurring sentence habits in writing.

### 3. Scan for patterns

Walk through the input once and tag every instance of the categories in the table below. Keep a count per category.

**Weight by density and concentration, not lone hits.** A single "comprehensive" or one "delve" is almost always the writer's own prose, not a tell. Six of them in a 200-word paragraph is slop; six scattered across a 5,000-word essay is just how the person writes. The two absolute tells (flagged on a single instance anywhere): the em dash, and leftover assistant boilerplate ("as an AI language model").

Treat code blocks, quoted material (lines starting with `>`), text in `backticks`, section headings, URLs, numbers, and proper nouns as **out of bounds** - never rewrite inside them. Exception: the em dash is flagged everywhere.

**Respecting intentional choices.** If a user marks a line with `unslop-ignore`, skip it. A tell is an unchosen default, not a banned word.

### 4. Produce the Findings block

Before rewriting, list what you found. This builds trust and lets the user veto a category before you commit to changes.

Format:

```markdown
## Findings

- **Voice brief:** direct, high-density, low-praise, plain diction
- **Em-dashes:** 7 instances
- **Telltale vocabulary:** 4 ("delve" x2, "robust", "tapestry")
- **Colon-led impact statements:** 2
- **Antithesis cadence:** 1 ("it's not just X, it's Y")
- **Transition cliches:** 3 ("Furthermore", "Moreover", "In conclusion")
- **Hedging filler:** 1 ("It's worth noting that")
- **Structural (human-pass):** uniform sentence rhythm, no contractions in casual context
- (categories with 0 hits are omitted)
```

Omit the `Voice brief` line when there is no meaningful personal style signal and you are just applying register rules.

### 5. Rewrite

Output the full revised text. Apply the rules below. Do not summarize, do not shorten for the sake of it, do not add examples or commentary that weren't in the original.

**Hard constraints:**

- Preserve every factual claim, number, name, date, and URL verbatim.
- Preserve headings, code blocks, block quotes, and lists as-is (structure-wise).
- Don't change meaning to make a sentence shorter.
- Don't inject new content, examples, caveats, or opinions.
- Match the author's existing voice - if they write terse, stay terse; if they write long, don't chop it.
- Preserve the author's stance toward the reader. If they are blunt, skeptical, or low-warmth, do not round that off into friendly assistant speak.
- Do not fix "delve into" by swapping in "dive into" (just a different tell). Use the plain verb you would actually say.
- Do not imitate typos, misspellings, or accidental grammar errors unless the user explicitly asks for that effect.
- Do not add praise, reassurance, or transition glue unless the source voice actually uses it.
- A fix that introduces the over-corrected register (choppy fragments, fake casualness) is not a fix.

### 6. Offer next actions

After the rewrite, ask:

- "Want me to revert any category? (e.g. keep the em-dashes)"
- If a file path was given: "Want me to write this back to `<path>`?" - use `Edit` or `Write` only after the user confirms.

## Patterns to detect and fix (priority order)

Ordered by what real readers actually cite as giveaways, based on data from 89k+ Reddit posts with a 600-post hand-audited sample. For deeper examples and a longer vocabulary list, see [PATTERNS.md](./PATTERNS.md).

### Part A: Mechanical tells (highest priority)

| Category | Cited share | What to look for | Replacement strategy |
|---|---|---|---|
| Em-dashes | 7.1% | `---` (U+2014), en-dashes `--` mid-sentence | Comma, period, or parentheses. Never just swap in a hyphen or colon. |
| "It's not just X, it's Y" | 2.8% | The antithesis/negate-then-assert cadence | State the thing plainly. If Y is the point, just say Y. |
| Formulaic essay shape | 2.5% | Intro/three-body/conclusion; "In conclusion," "In summary" | Break the mold, let structure follow the idea. End on a real last point. |
| "Dive in" / "deep dive" | 2.0% | "dive into", "deep dive", "let's dive" | Cut the metaphor, open with the actual topic. |
| Forced bulletization | 1.7% | Prose shredded into bullets; "5 ways to..." listicle scaffolding | Write prose. Reserve bullets for genuinely list-like content. |
| Diction memes | 1.3% | delve, tapestry, leverage, seamless, game-changer, unleash, testament, embark, meticulous, elevate, harness, captivating, ever-evolving | Plain synonyms. See [PATTERNS.md](./PATTERNS.md) for full list. |
| Assistant boilerplate | 1.2% | "as an AI language model", "I cannot assist", "knowledge cutoff" | Delete every trace before publishing. |
| Bolded lead-in labels | 0.3% | `**Word:** then a sentence` pattern | Write the sentence without the boldface label. |
| Marketing hype | 0.8% | "unlock the potential", "revolutionary", "transform your business" | Say what it literally does, with a specific. |
| Hollow openers | 0.7% | "In today's fast-paced world", "In today's digital age" | Delete, open with something specific. |
| Emoji as structure | 0.8% | Emoji as bullets, headings, or section markers | Use plain text markers. Emoji in a sentence where a person would use one is fine. |
| Trailing assistant offers | 0.4% | "Would you like me to...", "Let me know if...", "I hope this helps!" | Delete the meta-offer, end on the last real sentence. |

### Part A continued: Additional mechanical tells

| Category | What to look for | Replacement strategy |
|---|---|---|
| Colon-led impact statements | "The result: X.", "The takeaway: Y.", "Bottom line: Z." | Fold into a normal sentence: "The result was X." |
| Semicolon overuse | More than ~1 semicolon per 200 words, or any semicolon joining two short clauses | Split into two sentences, or use "and"/"but". |
| Opening filler | "Certainly!", "Absolutely!", "Of course!", "Great question!" | Delete. |
| Hedging filler | "It's worth noting that", "It's important to remember", "It should be noted that" | Delete the frame, keep what followed. |
| Transition cliches | "Furthermore,", "Moreover,", "Additionally,", "In conclusion," | Drop, or replace with "Also,", "And,", "So,". |
| Rule-of-three padding | Forced triplets where the third item is filler | Keep the two real items. |
| "Not only X but also Y" | The full construction | "X and Y", or two sentences. |
| Empty superlatives | "game-changer", "revolutionary", "cutting-edge", "groundbreaking", "world-class" | Cut the adjective or replace with a concrete claim. |
| Smart punctuation | Curly quotes, curly apostrophes, ellipsis character | Replace with straight quotes and `...` unless the source uses curly throughout. |
| Excessive hedging | "may", "might", "could potentially", "in some cases" stacked in one sentence | Pick one hedge or commit to the claim. |
| Emoji sprinkle | Decorative emoji in body text | Remove unless the author's voice uses them. |

### Part B: Structural tells (human pass required, regex-invisible)

These are cited as often as the top mechanical tells but no pattern can catch them. Check by reading aloud.

| Category | Cited share | What it looks like | Fix |
|---|---|---|---|
| Uniform sentence rhythm | 4.0% | Every sentence roughly the same length and shape, evenly paced | Vary sentence length on purpose. Let one run long and the next be three words. |
| Sycophancy / yes-man register | 2.5% | Opens with flattery, agrees reflexively, refuses to take a side | Drop flattery. Disagree when you disagree. A real writer says no. |
| Saying nothing at length | 0.7% | Fluent, grammatical prose that makes no actual claim; restates the prompt | Make a real claim, cut filler. If a paragraph could be deleted with nothing lost, delete it. |
| No contractions / over-formal | 0.7% | "do not," "cannot," "it is" everywhere in a casual context | Use contractions. Write the way the speaker talks, unless the register calls for formality. |
| Hedging instead of committing | 0.3% | Balanced menu instead of an answer; trained to avoid being wrong | Take a position. List trade-offs if they matter, but say what you would do. |
| Rule of three (structural) | 1.2% | Every list exactly three items, every example a triad | Vary the count. Two items, or four, or a single clean sentence. |
| Over-corrected "anti-AI" register | -- | Staccato fragments, forced lowercase, fake typos, "here's the thing" cold open | Do not over-apply rules. A real voice, not the absence of voice dressed as casual. |

### Part C: Cleared by data (do not over-chase)

These words light up keyword scanners but real readers almost never cite them as giveaways. They are mostly the writer's own ordinary prose. Do not over-rotate on them.

- "however," "thus," "hence" - just connectives in normal use
- "when it comes to" - ordinary phrasing
- "comprehensive," "robust," "crucial," "navigate," "utilize," "nuanced" - flag only when clustering thickly, not on a single use
- "moreover / furthermore / additionally" - only a tell when stacked as a sentence-opener pattern

## Output format

Return two blocks in this order:

```markdown
## Findings
[optional 1-line voice brief]
[bulleted list of categories with counts; skip categories with 0 hits]
[include structural tells observed in Part B]

## Rewritten text
[full revised text, ready to copy back]
```

If the input was short (under ~100 words) you can add a brief `## Notable rewrites` block with 2-3 before/after lines. For longer input, skip it - the diff would be too noisy.

## Example

**Input:**

> In today's fast-paced world, it's worth noting that modern APIs are multifaceted --- they underpin everything from mobile apps to IoT devices. The takeaway: we must delve into their intricate design patterns to build robust systems.

**Findings:**

- **Hollow opener:** 1 ("In today's fast-paced world")
- **Hedging filler:** 1 ("it's worth noting that")
- **Em-dashes:** 1
- **Telltale vocabulary:** 3 ("multifaceted", "intricate", "robust")
- **Colon-led impact statements:** 1 ("The takeaway:")
- **Diction meme (delve):** 1
- **Structural:** uniform sentence rhythm (both sentences medium-length, same shape)

**Rewritten text:**

> Modern APIs do a lot. They power mobile apps, web clients, and IoT devices. So we need to understand their design patterns to build systems that hold up under load.

Same information, same argument, no AI fingerprint.

## Common pitfalls

- **Treating prompt history as a better voice sample than the actual artifact genre.** A user's chat style matters, but a Slack DM, a PRD, and a blog post do not sound identical. Match *their* voice inside the correct register.
- **Copying mistakes instead of voice.** Misspellings, dropped words, random lowercase, or accidental punctuation are not the tone. Mimic the decision-making, not the typo.
- **Sanding down a blunt writer.** "Humanize" does not mean "nicer." If the user's natural style is direct and low-fluff, keep that edge without making it rude.
- **Overfitting one stray line.** One joke or one dramatic sentence is not a voice. Use repeated traits.
- **Over-correcting into the anti-AI register.** The fix for smooth AI prose is a real voice, not choppy fragments and forced slang. If your rewrite reads like it is trying not to sound like AI, it is its own tell. The sentence should sound like a specific person who means it.
- **Flagging lone hits of Part C words.** A single "however" or "comprehensive" is not a tell. Weight by density. Only flag when they cluster thickly in a short span.
- **Context-appropriate vocabulary.** "Robust" in a security doc, "nuanced" in a policy piece, and "leverage" in finance are legitimate domain terms. Flag them once in findings, then judge in context before rewriting.
- **Don't flatten real rhetoric.** Parallelism and triplets are sometimes the right tool. The pattern to fix is the *forced* or *padded* version, not every instance.
- **Preserve voice for first-person.** If the author writes "I think" or "I've found", keep their first-person tone; don't convert to a neutral explainer voice.
- **Code and quotes are untouchable.** Never rewrite inside a code block, block quote, or direct quotation, even if it contains em-dashes.
- **Don't shorten for the sake of shortening.** The goal is human-sounding, not terse. If the author wrote a long sentence that reads naturally after the rewrite, leave the length alone.
- **Don't swap one tell for another.** "Delve into" becomes "look at", not "dive into." The fix must be the plain word, not a fancier synonym.
- **Honor `unslop-ignore`.** If the user marks a line, respect the intentional choice. A tell is an unchosen default, not a banned word.
