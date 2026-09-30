# Research Handoff

Use this protocol to verify evidence and return research without taking over the downstream plan or decision.

## Synthesis Gate

Before drafting the handoff, the parent:

- Confirms every indexed assignment has a terminal status.
- Reopens the authoritative sources for material claims instead of trusting working notes alone.
- Separates source facts, inferences, contradictions, and possible implications.
- Checks dates, versions, locale, and other freshness context.
- Calibrates confidence and preserves blocked or failed coverage.
- Stops at the recorded materiality rule or budget rather than chasing completeness.

Research is ready for handoff when the evidence is sufficient for the caller's next decision or the remaining uncertainty is explicit.

## Final Research Handoff

```markdown
## Research Handoff

- **Run location**: `[path, or "Current context only"]`
- **Run status**: [complete, partial, or blocked]
- **Researched as of**: [date and relevant timezone]
- **Scope and budget used**: [questions, passes, limits reached, and temporary-path retention warning]

### Summary
[Dense research-only synthesis. Do not make the downstream plan or final decision.]

### Key Findings
- **Finding**: [fact or labeled inference]
  - **Evidence**: [exact file:line or source URL and date]
  - **Confidence**: [level and reason]
  - **Implication**: [possible relevance for the caller to evaluate]

### Contradictions and Uncertainty
- [Conflict, stale evidence, missing source, or unresolved interpretation]

### Authoritative Sources
- [File and line or publisher/title/URL] — [claim supported; version or dates]

### Open Questions and Failed Coverage
- [User-owned question, blocked research, failed assignment, or "None"]

### Recommended Downstream Workflow
[Planning skill, decision workflow, user choice, or a specifically bounded next research pass.]
```

## Downstream Use

The caller should treat cited files and external sources as authoritative and the research folder as a navigational record. Before relying on unstable evidence, check whether its date, version, market, or locale is still valid.

Link the run and relevant findings from any later artifact, preserve unresolved questions, and make final recommendations only in the workflow that owns the plan or decision.
