# Source Pack

Use this reference when preparing a role-specific mock interview. The live interviewer should read compact artifacts, not raw source dumps.

## Required Inputs

- **Candidate profile:** resume, LinkedIn export, career summary, or bullet notes. This is the only source for personal stories, employers, metrics, and accomplishments.
- **Target role:** job description, role summary, recruiter description, or hiring manager notes.
- **Interview shape:** stage name, duration, modality, and whether the user wants timed evaluation or coaching.

Hard stop: if the candidate profile is empty, placeholder-only, or missing, ask for it before role-specific practice. If the job description is missing, ask for it or state that the session will be a generic drill.

## Optional Inputs

- Interview schedule and stage mapping.
- Recruiter/process notes.
- Public company hiring docs.
- Public company/product docs.
- Public engineering blogs, docs, or talks.
- Prior session notes.
- Question bank.
- Scorecard template.
- Section handoffs.

## Parsed vs Raw Sources

Keep raw materials separate from mock-ready notes.

- **Raw sources:** PDFs, emails, copied job postings, exports, transcripts, web pages, and long docs. Treat as archival.
- **Parsed sources:** concise markdown artifacts built for agents. These should be the default material for live mocks.

During a live mock, read parsed sources only unless the parsed file says the source is stale, incomplete, or missing.

## Recommended Artifact Set

- `candidate-profile.md`: verified candidate facts, relevant background details, story inventory, metrics, known strengths/gaps, and examples worth probing.
- `role-requirements.md`: required signals, seniority bar, technical domains, collaboration needs, and success profile.
- `process-and-logistics.md`: stages, durations, interviewer labels, dates, and constraints.
- `company-context.md`: dated public facts, products, business model, engineering themes, and caveats.
- `question-bank.md`: prompts grouped by interview stage; each prompt should include the signal it tests and varied phrasing for accomplishments, mistakes, missed opportunities, calibration, and impact.
- `scorecard.md`: rubric dimensions and scoring discipline.
- `sections/<stage>/HANDOFF.md`: persona, agenda, source files, question themes, probes, output path, and section-specific scoring emphasis.

Keep prep artifacts narrow. Do not create default candidate-question artifacts unless the user explicitly asks for them. Use background details only to sharpen role-relevant prompts.

## Background-Aware Probing

When parsing the candidate profile, mark only facts that can make the mock more specific:

- Roles, projects, domains, systems, customers, teams, or scope relevant to the target role.
- Claimed wins, metrics, awards, launches, incidents, migrations, leadership moments, or ambiguous impact claims.
- Weak or missing areas worth probing: personal ownership, measurement, tradeoffs, stakeholder handling, technical depth, or recovery from mistakes.
- Calibration handles: expectations, performance ratings, peer comparison, manager/stakeholder feedback, customer outcomes, or observable operating metrics.

Do not turn this into a full biography. The live interviewer should pull one relevant fact at a time and ask for evidence.

## Public Research Policy

- Use official public sources first.
- Use reputable public commentary second.
- Treat forums and social media as anecdotal weak-signal input for failure modes, not truth.
- Record fetched dates for public docs.
- Refresh public company, product, and process research if older than 30 days or if the user says the process changed.
- Do not infer private interview questions from public posts.

## Confidentiality

Do not ask the candidate to disclose proprietary employer details, customer names, private metrics, internal architecture, non-public incidents, or unreleased product information. If a prompt would require that, ask for a sanitized version or a different example.

## Prep-Time Subagents

Use these when available:

- **Source normalizer:** produce compact summaries and mark missing facts.
- **Public researcher:** collect dated public company/process context.
- **Question designer:** write stage-specific prompts grounded in role signals.
- **Rubric designer:** map role requirements to scorecard dimensions.
- **Handoff writer:** create per-section handoffs for live interviewer agents.

Each subagent should return compact findings, not raw excerpts.
