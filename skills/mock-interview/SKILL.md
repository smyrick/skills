---
name: mock-interview
description: |
  Run source-grounded mock interviews for technical roles at any technology company. Use when a user asks for interview prep, a hiring-manager screen, behavioral interview, technical screen, coding interview, system design mock, case interview, role-specific practice, voice or text mock interviews, evidence-based scoring, or session notes from a practice interview.
author: smyrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: No external MCPs required. Works in voice or text. Uses file read/search when
  available, optional web research during prep only, and optional subagents for source preparation,
  interviewer personas, and review passes.
---

# Mock Interview

Run realistic, source-grounded mock interviews for arbitrary technical roles. The skill separates prep-time research from live interviewing so voice sessions stay focused and context-light.

## At a Glance

- **Source first:** Ground personalization in the candidate profile, target job description, and user-provided or public company/process material.
- **Hard stop when missing:** If no candidate profile or resume is available, ask for one before role-specific practice. If no job description is available, ask for one or run only a generic drill.
- **Prep before mock:** Normalize source material into compact artifacts before the live interview. Do not browse during the mock unless the user explicitly requests it.
- **One question at a time:** Ask, listen, then probe once when the answer is vague.
- **Control the flow:** Explain the timebox up front, ask permission to nudge for time, and keep the interview moving.
- **Score from evidence:** Score only what the candidate actually said. High scores require direct evidence.
- **Separate interviewer from reviewer:** The live interviewer gathers signal; post-mock reviewer passes score, revise, and audit.

## When to Use

- User wants a mock interview for a technical role.
- User wants role-specific practice from a resume, job description, recruiter notes, schedule, or company research.
- User asks for behavioral, hiring manager, coding, system design, technical screen, product/technical judgment, customer-facing, leadership, or case-style practice.
- User wants blunt feedback, scoring, revised answers, drills, or session notes.

## Required Inputs

Before a role-specific mock, collect or locate:

- Candidate profile: resume, LinkedIn export, career summary, or bullet notes.
- Target job description or role summary.
- Interview stage: hiring manager, behavioral, coding, system design, technical screen, case, presentation, team fit, or unknown.
- Time box and modality: voice/text, target duration, and whether to coach live.

Optional but useful:

- Recruiter/process notes, interview schedule, public company docs, public product docs, prior session notes, question bank, scorecard template, and section handoffs.

If a required input is missing, do not invent it. Ask for the smallest missing artifact needed to continue.

## Workflow

### 1. Build the Source Pack

Read `references/source-pack.md` when preparing a new role, company, or interview loop.

Create compact, mock-ready artifacts from the raw material:

- Candidate profile summary: verified background facts, relevant experiences, scope, metrics, strengths, gaps, and examples worth probing.
- Role requirements summary: must-have signals, seniority expectations, domain needs, and likely interview dimensions.
- Process summary: stages, timing, interviewer labels, and known constraints.
- Company/product summary: public, dated, non-confidential facts only.
- Section handoffs: one page per interview type with persona, agenda, probes, scoring emphasis, and output path.

Use subagents when available:

- **Source normalizer:** compacts resume, job description, and recruiter notes.
- **Public researcher:** gathers dated public company/process/product context during prep only.
- **Persona designer:** creates section-specific interviewer personas and question themes.
- **Rubric designer:** maps role requirements to scoring dimensions.

### 2. Configure the Mock

Pick one mode:

- **Timed mock:** interviewer evaluates fit; no live coaching except one clarifying probe when the answer is unusably vague.
- **Coach drill:** interviewer may interrupt to tighten structure, specificity, or delivery.
- **Case simulation:** interviewer gives a fictional setup and lets the candidate drive clarification, options, tradeoffs, and recommendation.
- **Coding/system design:** interviewer evaluates problem solving, communication, correctness, tradeoffs, and testing/validation.

Default tone: skeptical peer. Be neutral, specific, and evidence-seeking. Do not praise before naming a gap.

Open with a short preflight:

- State the format, timebox, and interview mode.
- Say you will ask one question at a time and may nudge or interrupt to keep the session useful.
- Confirm whether live coaching is allowed or feedback should wait until the end.
- Do not reserve time for candidate questions unless the user explicitly asked to practice them.

### 3. Run the Live Interview

Rules:

- Ask one question at a time.
- Let the candidate finish before responding.
- Probe vague claims once, then move on.
- Use candidate-profile details to ask sharper questions; do not require the candidate to confirm their full background before starting.
- Vary phrasing so the mock feels human, not like a checklist.
- Keep rapport, but avoid praise-padding before gaps or feedback.
- Move on once enough signal is captured for the target dimension.
- Do not ask for confidential or proprietary details. Ask for a sanitized version or a different example.
- Do not claim prompts are real company questions unless the user provided them.
- Keep browsing and long research out of the live mock.

Common probes:

- "What was expected of you in that role or project?"
- "How was success measured?"
- "What was your direct role?"
- "What did you personally do?"
- "What changed because of your work?"
- "How do you know the outcome mattered?"
- "What was your biggest win there?"
- "What was a mistake, missed opportunity, or decision you would handle differently?"
- "What tradeoff did you reject?"
- "Who disagreed, and how did you handle it?"
- "How would a peer, manager, customer, or stakeholder calibrate that impact?"
- "What assumption are you making?"
- "What would you validate first?"
- "What would you cut with half the time?"

Candidate-question practice:

- Do not answer company-specific candidate questions by default.
- If the user explicitly asks to practice candidate questions, critique the questions after the fact for quality, relevance, specificity, and risk.
- Do not pretend to know private company answers. Suggest safer phrasing or research targets instead.

### 4. Score and Review

After the mock, run reviewer passes. Use subagents when available, or do the passes sequentially:

- **Scorekeeper:** fills the rubric with evidence from the candidate's answers.
- **Revision coach:** rewrites weak answers into tighter versions without inventing facts.
- **Audit reviewer:** checks for unsupported high scores, invented details, confidential material, and prompt leakage.

Scoring rules:

- Score only what the candidate said.
- Use 1 for missing/off-topic, 2 for underdeveloped, 3 for acceptable but generic, 4 for strong, 5 for interview-ready.
- No 4 or 5 without a quote or tight evidence paraphrase.
- Strengths must cite evidence.
- Gaps must be specific cuts: missing role, missing metric, weak tradeoff, unclear user impact, rambling setup, or unsupported claim.

### 5. Save the Session Note

Use `assets/session-note-template.md` unless the workspace provides a local template. If file writes are unavailable, output the full markdown and state the intended path.

Session notes should include:

- Session meta and sources used.
- Question IDs or themes used.
- Brief Q&A summary.
- Background-based probes used and evidence captured.
- Calibration, mistake, or missed-opportunity evidence when relevant.
- Evidence-based scorecard.
- Top strengths with evidence.
- Top gaps as fixable cuts.
- Revised answer guidance.
- Homework and next drills.
- Candidate-question feedback only if the user requested that drill.

## Bundled Resources

- `references/source-pack.md`: source requirements, parsed-vs-raw guidance, and freshness policy.
- `references/personas-and-rubrics.md`: generic personas, interviewer modes, and scorecard dimensions.
- `assets/session-note-template.md`: reusable note template.
- `assets/section-handoff-template.md`: reusable per-section handoff template.

## Common Pitfalls

- Running a role-specific mock without a candidate profile or job description.
- Letting question banks turn into memorization; adapt prompts to the candidate profile.
- Browsing during voice mode and losing the interview flow.
- Treating background-aware questioning like a full career-history interview.
- Answering candidate questions as if private company facts are known.
- Inflating scores because the story sounds plausible.
- Inventing company internals, private interview prompts, metrics, or personal stories.
- Coaching during a timed mock when the user asked for interviewer realism.
