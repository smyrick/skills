---
name: "mock-interview"
description: "Run a source-grounded mock interview with stage-specific practice, evidence-based feedback, and optional session notes."
disable-model-invocation: true
user-invocable: true
---

# Mock Interview

Run realistic interview practice without inventing candidate, role, company, or hiring-process facts. Adapt the session to the sources and time available.

## Start with Available Inputs

Use any combination of:

- candidate profile, resume, or story notes;
- job description or role summary;
- interview stage and duration;
- recruiter or process notes;
- public company or product material;
- prior practice notes or a scorecard.

Partial inputs are valid. State the resulting scope briefly and proceed:

- Without candidate material, run role- and stage-specific practice but do not personalize questions or infer experience.
- Without role material, practice the requested stage using the candidate's actual background and a generic rubric.
- Without a stage, ask once if the choice materially changes the session; otherwise choose the most useful likely stage and label the assumption.
- Without company material, avoid company-specific claims and questions presented as authentic.

Ask only for a missing input that is essential to the user's requested form of practice. Read [references/source-pack.md](./references/source-pack.md) when preparing a source pack or doing public research.

## Track Provenance

Maintain a compact private source ledger with the source name, source type, date or retrieval date when known, and facts used. Distinguish:

- user-provided candidate facts;
- role or process requirements;
- dated public company facts;
- assumptions and fictional case premises.

Do not present public anecdotes as confirmed interview questions. Do not ask for confidential information; request a sanitized example instead.

## Configure the Session

Choose the requested mode, or default to timed evaluation:

- **Timed evaluation:** realistic interview with feedback after the session.
- **Coach drill:** pause to improve an answer, then retry it.
- **Rapid practice:** short questions with compact feedback.
- **Case simulation:** provide a clearly fictional premise and let the candidate drive.
- **Coding or system design:** evaluate reasoning, correctness, tradeoffs, testing, and communication.

Select a stage-specific persona and rubric from [references/personas-and-rubrics.md](./references/personas-and-rubrics.md). Open with the format, approximate timebox, feedback timing, and whether time nudges are allowed.

## Run the Interview

- Ask one question at a time.
- Let the candidate answer before evaluating.
- Probe vague evidence once; continue probing only when the practice mode calls for it.
- Ground personalized questions in candidate sources and role-specific questions in role sources.
- Keep research out of the live interview unless the user explicitly pauses for it.
- Do not praise-pad, leak the rubric, or claim that a prompt is used by the target company.
- In a timed evaluation, preserve realism and defer coaching until the end.

## Score by Stage and Evidence

Score only dimensions observable in the selected stage. Examples:

- behavioral or hiring manager: ownership, impact, judgment, collaboration, reflection, and role fit;
- coding: problem framing, correctness, complexity, testing, and communication;
- system design: requirements, architecture, scale, reliability, tradeoffs, and validation;
- case or product judgment: clarification, structure, assumptions, prioritization, evidence, and recommendation;
- presentation: structure, audience fit, evidence, delivery, and question handling.

Use the 1-5 scale in the rubric reference only when enough answer evidence exists. Use `N/A` when a dimension was not tested or the evidence is insufficient; never fabricate a numeric score. Every 4 or 5 requires a quote or tight evidence paraphrase. Separate source-backed observations from coaching suggestions, and never invent a stronger candidate story in a revised answer.

Return:

1. an overall stage assessment;
2. dimension scores with evidence or `N/A`;
3. the strongest demonstrated signals;
4. specific gaps;
5. concrete retry guidance or next drills;
6. source provenance and material assumptions.

## Session Notes Are Opt-In

Keep feedback in chat by default. Create or update a session file only when the user explicitly asks to save notes. When requested, use [assets/session-note-template.md](./assets/session-note-template.md), or the workspace's existing template, and confirm the intended path before writing if none was supplied. Use [assets/section-handoff-template.md](./assets/section-handoff-template.md) only for a requested multi-section interview loop.
