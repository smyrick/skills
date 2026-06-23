# AI-Writing Patterns: Extended Reference

Companion file to [SKILL.md](./SKILL.md). Read this when the inline table in SKILL.md doesn't give enough guidance for an edge case, or when the input is long enough that you want a deeper checklist. Ordered by priority: the cited share from a 600-post audited sample is the cleanest signal, with the keyword-pass share as context.

Each section below has: what the pattern looks like, 2-4 before/after examples, and a "when to leave it alone" note. Part B covers structural tells a regex cannot see (human pass required). Part C covers words cleared by the data that should not be over-chased.

**Weighting rule:** Two tells are absolute (flagged on a single instance anywhere): the em dash and leftover assistant boilerplate. For everything else, weight by how thickly it clusters. A single "comprehensive" or one "delve" is almost always the writer's own prose. Six of them in a 200-word paragraph is slop; six scattered across a 5,000-word essay is just how the person writes.

---

## Em-dashes

**Look for:** `—` (em-dash, U+2014) and `–` (en-dash, U+2013) used mid-sentence to set off a clause. LLMs default to em-dashes almost anywhere a comma, colon, or period would do.

**Rewrites:**

- Before: "The API is slow — we need a cache."
  After: "The API is slow. We need a cache."
- Before: "She waited for the response — which never came — before timing out."
  After: "She waited for the response, which never came, before timing out."
- Before: "Three pillars — speed, safety, simplicity — shape the design."
  After: "Three pillars shape the design: speed, safety, and simplicity." (or use parentheses)

**Leave it alone when:**

- Inside a direct quotation.
- The author's other published writing uses em-dashes consistently (they're a known stylistic choice).
- The dash separates a dialogue interruption in fiction.

---

## Colon-led impact statements

**Look for:** A short noun phrase, a colon, then "the big reveal." Very common in AI-written marketing and blog posts.

**Rewrites:**

- Before: "The result: a 40% drop in latency."
  After: "The result was a 40% drop in latency." or "Latency dropped 40%."
- Before: "Our mission: ship software that works."
  After: "Our mission is to ship software that works."
- Before: "Bottom line: we need to hire."
  After: "We need to hire."

**Leave it alone when:**

- The colon introduces a genuine list or definition ("Three options: A, B, C").
- It's a heading or subheading, not a sentence.

---

## Semicolons

**Look for:** More than one semicolon per ~200 words, or any semicolon joining two short clauses that would read better as two sentences.

**Rewrites:**

- Before: "The build failed; the logs showed a missing env var."
  After: "The build failed. The logs showed a missing env var."
- Before: "She shipped the fix; he reviewed it; they deployed it."
  After: "She shipped the fix. He reviewed it. They deployed it."

**Leave it alone when:**

- Separating items in a list that already contain commas: "Paris, France; Rome, Italy; Tokyo, Japan."
- In technical writing where the semicolon marks a precise logical relationship.

---

## Telltale vocabulary

**The hot list** (SKILL.md):
delve, nuanced, multifaceted, intricate, tapestry, myriad, robust, seamless, leverage (as verb), navigate (metaphoric), testament to, realm of, landscape of, ever-evolving, underscores, underpins, pivotal, paramount, profound, compelling.

**Extended list:**

| AI word | Usually means | Plain replacement |
|---|---|---|
| delve (into) | look at | look at, study, read |
| nuanced | complex in a subtle way | complex, tricky, subtle |
| multifaceted | has many parts | has many parts, complex |
| intricate | detailed | detailed, complex |
| tapestry | collection | mix, collection, range |
| myriad | many | many, lots of |
| robust | strong | strong, reliable, solid |
| seamless | smooth | smooth, easy |
| leverage (verb) | use | use |
| navigate (metaphor) | deal with | deal with, handle |
| testament to | proof of | proof of, shows |
| realm of | area of | area of, field of |
| landscape of | state of | market, field, today's X |
| ever-evolving | changing | changing |
| underscores | shows | shows, proves |
| underpins | supports | supports, is the basis for |
| pivotal | important | important, key |
| paramount | very important | most important |
| profound | deep | deep, big, serious |
| compelling | convincing | convincing, strong, good |
| plethora | lots | lots, many |
| foster | grow, create | grow, build, create |
| holistic | whole | whole, overall |
| synergy | teamwork | (usually just delete) |
| paradigm shift | big change | big change |
| unprecedented | never before | new, first-time |
| cutting-edge | new | new, latest |
| state-of-the-art | latest | latest, best |
| revolutionize | change | change, improve |
| elevate | raise, improve | raise, improve |
| empower | let | let, help |
| curate | pick | pick, select |
| craft (verb) | make | make, write, build |
| unveil | show | show, release |
| embark (on) | start | start |
| harness (metaphor) | use | use |
| bolster | strengthen | strengthen, help |
| glean | learn | learn, find |
| meticulous | careful | careful |
| vibrant | lively | lively, colorful |
| rich (metaphoric) | detailed | detailed, full |
| deep-dive | look at | look at |
| touchpoint | point of contact | contact, interaction |
| resonate | land | land, stick, work |
| streamline | simplify | simplify, clean up |
| optimize | improve | improve, tune |
| facilitate | help, make easier | help, let |
| encompass | include | include, cover |
| endeavor | try | try |
| cultivate | grow | grow, build |
| demystify | explain | explain |
| reimagine | rethink | rethink |
| rethink (as theme word) | rethink | (often just delete) |
| paradigm | way, model | way, model |

**Leave it alone when:**

- It's a legitimate domain term (e.g. "robust" in a statistics or security paper; "leverage" in a finance context; "nuanced" in policy analysis).
- The author uses the word elsewhere in the same document in a non-AI pattern - it's their real vocabulary.

---

## Opening filler

**Look for:** "Certainly!", "Absolutely!", "Of course!", "Great question!", "Sure thing!" at the start of a response or section.

**Rewrite:** Delete. Start with the actual content.

**Leave it alone when:** In dialogue, a quoted chat log, or a deliberate conversational tone that exists throughout the piece.

---

## Hedging filler

**Look for:** Frames that add no meaning:

- "It's worth noting that…"
- "It's important to remember that…"
- "It should be noted that…"
- "One thing to keep in mind is…"
- "As previously mentioned,"
- "Needless to say,"

**Rewrite:** Delete the frame; keep the sentence that follows. If the sentence can't stand on its own after you remove the frame, the frame was doing real work and you can keep a lighter version ("Note: …" or "One catch: …").

---

## Transition cliches

**Look for:** "Furthermore,", "Moreover,", "Additionally,", "In addition,", "In conclusion,", "To summarize,", "Ultimately," at the start of a sentence or paragraph.

**Rewrites:**

- Before: "Furthermore, the cache also reduces cost."
  After: "The cache also reduces cost." or "It also reduces cost."
- Before: "In conclusion, the migration succeeded."
  After: "The migration succeeded." (as a closing sentence, or use a "What shipped" / "Outcome" heading)

**Leave it alone when:** In a formal academic paper where "furthermore" is expected.

---

## Rule-of-three padding

**Look for:** "X, Y, and Z" where Z is obviously filler to get to three items. Common AI output pattern: "fast, reliable, and effective" or "simple, powerful, and elegant."

**Rewrite:** Keep the two real items, drop the filler. Or replace with one precise word.

- Before: "The tool is fast, reliable, and effective."
  After: "The tool is fast and reliable." or "The tool is fast."

**Leave it alone when:** The triplet is a known set phrase or each item adds real meaning.

---

## "Not only X but also Y"

**Look for:** The full "not only … but also …" construction. Almost always can be flattened.

**Rewrites:**

- Before: "The refactor not only improved performance but also simplified the code."
  After: "The refactor improved performance and simplified the code." Or: "The refactor improved performance. It also simplified the code."

---

## Metaphor bingo

**Look for:** "dive into", "delve into", "unpack", "unlock", "navigate the complexities of", "at the heart of", "in today's fast-paced world", "in the realm of", "a world of", "the journey of", "on the other side of the coin".

**Rewrites:** Replace with the literal verb or drop the metaphor entirely.

- Before: "Let's dive into the config file."
  After: "Let's look at the config file."
- Before: "At the heart of the system is the scheduler."
  After: "The scheduler is the core of the system."
- Before: "In today's fast-paced digital landscape,"
  After: "Today,"

---

## Empty superlatives

**Look for:** "game-changer", "revolutionary", "cutting-edge", "groundbreaking", "world-class", "best-in-class", "next-generation", "state-of-the-art".

**Rewrite:** Cut the adjective. If the sentence loses meaning, replace the superlative with a concrete claim ("the first tool to support X", "10x faster than the previous version").

---

## Balanced parallelism

**Look for:** Every sentence roughly the same length. Every paragraph three sentences. Every list exactly three or five items.

**Rewrite:** Break the rhythm. Use a short sentence. Merge two sentences into one longer one. Let one paragraph be two sentences and the next be six.

---

## Smart punctuation

**Look for:** Curly quotes `" " ' '`, curly apostrophes, ellipsis character `…`, non-breaking spaces.

**Rewrite:** Replace with straight quotes `" '`, three periods `...`, regular spaces. Unless the source document clearly uses curly quotes throughout (e.g. a typeset book) - in that case, leave them.

---

## Forced bulletization

**Look for:** Prose that has been chopped into a five-bullet list where each bullet is one clause, no sub-bullets, no structure benefit.

**Rewrite:** Convert back to prose. Bullets earn their keep when: the items are genuinely parallel, the reader will scan rather than read, or there are 3+ items that would be awkward as a comma list.

---

## Excessive hedging

**Look for:** Multiple hedges stacked in one sentence: "may possibly", "could potentially", "might sometimes", "in some cases, it may be that…".

**Rewrite:** Pick one hedge or commit to the claim.

- Before: "This might possibly cause issues in some cases."
  After: "This can cause issues." or "This sometimes causes issues."

---

## Emoji sprinkle

**Look for:** ✅ 🚀 ✨ 🎯 📌 💡 🔥 used as decoration in body text or at the start of bullet points.

**Rewrite:** Remove. Unless the author's other writing in the same venue uses emoji - then keep them where the author would have.

---

## When the whole thing is AI and no single pattern is the problem

Sometimes text is clearly AI-generated but no single category jumps out. Look for the combination:

- Every paragraph opens with a topic sentence and closes with a summary sentence.
- Every adjective is one of the "telltale vocabulary" words, one per sentence.
- Every transition is explicit ("Furthermore,", "However,", "Thus,").
- The conclusion restates the intro.
- No specific numbers, no proper nouns, no dated references.

In that case, rewrite paragraph by paragraph with a stronger hand: cut the topic/summary bookends, let transitions be implicit, and ask the author for specifics (numbers, names, dates) that can ground the text in reality. If you can't add specifics without inventing them, don't - flag it in findings as "text lacks concrete details; consider adding examples."

---

## Part B: Structural tells (human pass required)

These are cited as often as the top mechanical tells but no pattern can catch them. The scanner will not flag them. Read the piece aloud and check them by ear. The audited pass put several of these above most of Part A.

### Uniform / robotic sentence rhythm

**Cited share:** 4.0% (the second-most-cited tell overall, and entirely keyword-invisible).

**What it sounds like:** Every sentence roughly the same length and shape, evenly paced, with no variation. The evenness is the tell. A human ear catches it before any single word.

**Quote from data:** "ChatGPT has a very recognizable cadence. And as soon as you catch it, it is impossible to focus on what's being written, because it's not even someone's actual thoughts."

**Fix:** Vary sentence length on purpose. Let one run long and the next be three words. Read it aloud; if it lulls, break the meter.

### Sycophancy and the yes-man register

**Cited share:** 2.5% (the fourth-most-cited tell).

**What it sounds like:** Opens with flattery ("Great question!"), agrees reflexively, refuses to take a side. The relentless positivity reads as a customer-service bot, not a person with a view.

**Fix:** Drop the flattery and the reflexive agreement. Disagree when you disagree. Stay neutral when you are neutral. A real writer is willing to say no.

### Saying nothing at length

**Cited share:** 0.7% (flagged by multiple auditors as under-counted; folds in "soulless," "word salad," "no opinion").

**What it sounds like:** Fluent, grammatical prose that makes no actual claim. It restates the prompt, hedges, and moves on. Fluency with nothing behind it is the deepest tell.

**Fix:** Make a real claim and cut the filler. If a paragraph could be deleted with nothing lost, delete it. Say each thing once.

### No contractions / over-formal register

**Cited share:** 0.7%.

**What it sounds like:** "do not," "cannot," "it is" everywhere, in a casual context. Reads as stiff in the specific way the default register is stiff.

**Fix:** Use contractions and write the way the speaker actually talks, unless the register genuinely calls for formality (a brief, a paper, a spec).

### Hedging instead of committing

**Cited share:** 0.3%.

**What it sounds like:** A balanced menu instead of an answer. The model gives "on one hand... on the other" because it is trained to avoid being wrong. The reader wanted a position.

**Fix:** Take a position. List the trade-off if it matters, but say what you would do.

### The rule of three (structural)

**Cited share:** 1.2%.

**What it sounds like:** Every list exactly three items. Every example a triad. Parallel triplets constantly. One is fine; reaching for three every time is the tell.

**Fix:** Vary the count. Two items, or four, or a single clean sentence. Do not let everything arrive in threes.

### The over-corrected "anti-AI" register (the 2026 tell)

This is the mirror of the whole catalog above: prose visibly straining not to read as AI. It is its own tell, named in the data and clocked just as fast.

**What it looks like:**
- Staccato three-word fragments on every beat (uniform short rhythm)
- Forced lowercase and dropped capitals in otherwise standard context
- A "here's the thing," "look," or "real talk" cold open bolted onto formal content
- Profanity or "lol" dropped in to seem off-the-cuff
- Deliberately-inserted fake typos to beat detectors
- Conspicuous em-dash avoidance: replacing every natural dash with an ellipsis or a colon

**Why it reads as AI:** It is still a default, just a newer one. All-short sentences are as mechanical as all-medium ones. Bolted-on slang is a costume rather than a voice, and the contortion to dodge a dash is as legible as the dash would have been.

**Fix:** Do not over-apply the rules. The fix for a dash is a comma or a period in a sentence you would actually write, not an ellipsis and not a contortion. The fix for the smooth voice is a real voice (pick a register), not the absence of voice dressed up as casual. Vary sentence length for real, long ones included.

---

## Part C: Cleared by the data (do not over-chase)

The audited sample showed the keyword pass badly over-counts a set of ordinary words. They match a lot of posts but are almost never what a reader actually cites, because they are the poster's own normal prose, not a giveaway. Over-flagging trains writers to ignore the tool, so weight these low.

| Word/Phrase | Keyword match share | Cited share | Guidance |
|---|---|---|---|
| "however," "thus," "hence" | 6.3% | ~0% | Do not flag a lone "however." Only a tell when stacked as repeated sentence openers. |
| "when it comes to" | 1.9% | ~0% | Ordinary phrasing. Leave alone. |
| "comprehensive" | ~1.5% | ~0% | Real word people use. Only flag when clustering thickly. |
| "robust" | ~1.5% | ~0% | Legitimate in security/engineering contexts. Flag only in dense clusters. |
| "crucial," "navigate," "utilize," "nuanced" | 1-2% each | ~0% | "utilize" is worth swapping for "use" but is not a smoking gun on its own. |
| "moreover / furthermore / additionally" | 1.7% | ~0% | As a stacked sentence-opener it reads as machine-smoothed, but one of them is just a connective. |

**The rule:** Flag what the data supports, at the weight it supports. A single occurrence of any Part C word is never on its own a tell. The signal is density and concentration, the same tic clustering in a short span.
