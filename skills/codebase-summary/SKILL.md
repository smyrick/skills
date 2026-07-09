---
name: "codebase-summary"
description: "Create source-grounded codebase architecture documentation with optional self-contained HTML diagrams."
---

# Codebase Summary

Explain how a repository works from evidence in the repository. Keep exploration read-only. Default to answering in chat; create or update an artifact only when the user explicitly requests one.

## Choose the output mode

Infer the mode from the request and state it before substantial work:

- **Explore:** answer a question or summarize the architecture in chat. Do not create or edit files.
- **Artifact:** create or update architecture documentation. Use `ARCHITECTURE.html` by default, or Markdown only when explicitly requested.

If the request is ambiguous, use Explore mode. In Artifact mode, honor an explicit path. Otherwise preview the proposed artifact and ask before writing to the repository root. Never replace an existing architecture artifact without approval.

Choose the smallest useful depth:

| Depth | Include |
| --- | --- |
| Small (default) | Overview, project type, entry points, core modules, and one high-level diagram |
| Medium | Small plus interfaces, data flow, dependencies, testing, and a request-flow diagram |
| Large | Medium plus configuration, deployment, module details, patterns, and dependency diagrams |

Do not ask about depth or theme in Explore mode. In Artifact mode, use small and a neutral light/dark-adaptive theme unless the user specifies otherwise.

## Analyze the repository

Read [references/analysis-guide.md](references/analysis-guide.md) when the request needs a repository-wide architecture analysis. Apply this core sequence:

1. Locate existing architecture, design, and README files. Verify their claims against current code.
2. Identify project boundaries, languages, manifests, build systems, and runnable units.
3. Trace primary and secondary entry points to public interfaces and core modules.
4. Follow representative execution paths through business logic, storage, and external systems.
5. Inspect tests, configuration, and deployment files when they materially clarify behavior.
6. Separate observed facts from inference, and call out unresolved ambiguity.

Prefer representative paths over exhaustive inventories. Do not document every file or infer runtime behavior from names alone.

## Keep an evidence ledger

Record evidence while exploring. Every material architectural claim must cite at least one repository source using a repo-relative path plus a symbol, key, heading, or line when practical.

Use this shape internally and in artifacts where useful:

| Claim | Evidence | Confidence |
| --- | --- | --- |
| The HTTP server starts here | `src/server.ts` — `startServer()` | High |
| Requests pass through authorization | `src/http/router.ts` — `router.use(auth)` | High |
| This queue appears to handle retries | `src/jobs/retry.ts` and related tests | Medium; inferred |

For chat answers, place citations directly after the supported claim. For HTML, use visible `<cite><code>path — symbol</code></cite>` text or a Source column; do not hide provenance in comments or tooltips. Mark inference explicitly and never present stale documentation as code-backed fact.

## Explore mode

Answer the user’s question directly, then provide only the structural detail needed to support it. A useful concise answer usually includes:

- project type and runtime shape;
- primary entry points and invocation paths;
- core modules and their responsibilities;
- one representative data or request flow;
- important uncertainty or conflicting documentation;
- source citations for every material claim.

Do not offer to write a file unless a durable artifact would clearly help or the user asks for one.

## Artifact mode

### Existing artifacts

Search for `ARCHITECTURE.html`, `ARCHITECTURE.md`, `DESIGN.md`, and architecture documentation under `docs/`. If an artifact exists, summarize whether it is current and ask whether to update, replace, or use it only as reference.

### HTML artifact

Start from [assets/architecture-template.html](assets/architecture-template.html). Copy only the sections justified by the chosen depth and evidence. Keep the result self-contained: inline CSS, inline SVG, optional small inline JavaScript, and no remote fonts, images, scripts, or stylesheets.

Include:

1. Overview and scope.
2. Project type and how it runs.
3. Entry points and external interfaces.
4. Core-module table with visible source citations.
5. Architecture diagram tailored to the repository.
6. Data, dependencies, testing, configuration, and deployment only when supported and useful.
7. Open questions or confidence notes for uncertain claims.

Use semantic HTML, a logical heading order, keyboard-safe controls, responsive layout, and light/dark contrast that meets WCAG AA.

### Safe interpolation

Treat all repository content as untrusted text, including project names, paths, symbols, package descriptions, and comments.

- Escape `&`, `<`, `>`, `"`, and `'` for HTML text and attributes using a context-appropriate encoder.
- Percent-encode path components used in links. Permit only safe relative links; reject `javascript:`, `data:`, and unexpected schemes.
- Never construct dynamic markup with `innerHTML`. Use static markup or text-node APIs.
- Escape SVG labels as XML text. Do not paste repository-provided SVG or HTML into the artifact.
- Replace every template token deliberately and fail validation if any `{{TOKEN}}` remains.

### SVG diagrams

Use inline SVG with `viewBox`, responsive sizing, `<title>`, and `<desc>`. Limit nodes to the relationships needed for the selected depth.

Every HTML/SVG `id` must be unique across the whole document. Give each diagram a deterministic prefix such as `arch-1`, `request-2`, or `deps-3`, and prefix its title, description, marker, clip-path, and filter IDs. Ensure every `aria-labelledby`, `href`, `url(#...)`, and marker reference resolves to the prefixed ID. Never reuse a generic `arrow` marker across multiple diagrams.

### Markdown artifact

Create Markdown only when explicitly requested. Use the same evidence rules and concise section set. Mermaid is optional only when the target renderer supports it; otherwise use text or tables.

## Validate before presenting

Run the strongest checks available without changing source files:

1. Parse the HTML with an available standards-aware parser or linter.
2. Confirm there are no duplicate IDs, unresolved references, or unreplaced template tokens.
3. Confirm the document contains no external asset URLs and no unsafe link schemes.
4. Inspect every repository-derived value for correct HTML, attribute, URL, or XML escaping.
5. Check that every material claim has a visible source citation and every inferred claim is labeled.
6. Render at desktop and narrow widths, in light and dark modes, when a browser is available; check keyboard navigation and the console.
7. If rendering is unavailable, report that only static validation was completed.

Present the key findings in chat, identify the selected depth and theme, link the saved artifact if one was requested, and disclose validation limitations.

## Boundaries

- Describe observed architecture; do not redesign it unless asked.
- Keep product vocabulary in `PRODUCT_TERMS.md`; architecture may link to those terms but does not redefine them. Suggest an explicit [`$manage-product-glossary`](../manage-product-glossary/SKILL.md) request when glossary changes are needed.
- Do not expose secrets, credentials, personal data, or sensitive configuration values.
- Do not invent commands, modules, interfaces, or behavior.
- Prefer a small accurate artifact over a comprehensive speculative one.
