# AI-Writing Patterns: Extended Reference

Companion file to [SKILL.md](./SKILL.md). Read this when the inline table in SKILL.md doesn't give enough guidance for an edge case, or when the input is long enough that you want a deeper checklist.

Each section below has: what the pattern looks like, 2-4 before/after examples, and a "when to leave it alone" note.

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
