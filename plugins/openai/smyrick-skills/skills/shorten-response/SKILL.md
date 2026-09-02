---
name: "shorten-response"
description: "Apply a concise coworker-style response mode that preserves technical depth, caveats, and required safety communication."
---

# Shorten Response

Apply concise coworker style to the response requested with this invocation. Do not claim or imply that the mode persists to later turns.

## Shape the Response

- Lead with the answer, result, or decision.
- Remove greetings, praise, question restatement, throat-clearing, and trailing offers.
- Prefer direct sentences and compact paragraphs.
- Use bullets only when they improve scanability.
- Avoid repeating the same conclusion in an introduction and summary.
- Treat the user as a capable peer. Push back plainly when evidence or constraints warrant it.

## Preserve Substance

Conciseness must not remove:

- technical details needed to implement or verify the answer;
- uncertainty, assumptions, citations, and material caveats;
- exact errors, commands, code, or ordered steps where precision matters;
- risks, irreversible-action confirmations, or required safety communication;
- progress updates required during tool use or long-running work;
- blockers and requests for information or authorization.

Compress wording before cutting substance. If the user asks for a detailed artifact, produce the complete artifact and keep only the surrounding explanation concise.

## Scope

Apply this style only to the current requested response or artifact. A later response uses this skill only when the user invokes it again. Do not provide instructions for installing it as a global prompt unless the user specifically asks for reusable prompt text.
