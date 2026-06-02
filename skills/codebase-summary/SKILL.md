---
name: codebase-summary
description: |
  Document or explore a codebase's architecture. Use when the user asks to summarize the codebase, create an architecture doc, explain structure, or understand entry points, APIs, and core modules. Produces a self-contained ARCHITECTURE.html with inline SVG diagrams; Markdown only on request.
author: Shane Myrick
license: MIT
repository: https://github.com/smyrick/skills
compatibility: File system access (Read, Glob, Grep tools). No external MCPs required.
---

# Codebase Summary: Architecture Documentation and Visualization

A skill for analyzing a codebase and producing architecture documentation for both
humans and AI agents. The primary deliverable is a **self-contained** `ARCHITECTURE.html`
file: inline CSS, hand-authored inline SVG diagrams, and light inline JavaScript (sticky
TOC, collapsible sections, styled tables). Produce Markdown only when the user explicitly asks.

**Default to a small, focused file.** Detail is controlled by a **small / medium / large**
setting; the default is **small** (concise overview, minimal diagrams). Scale up only when
the user asks. Always offer to confirm the detail level and the color theme before writing
(see [Output preferences](#output-preferences-detail-level-and-theme)).

## When to use this skill

- User asks to "summarize the codebase" or "understand the project structure"
- User wants to create or update architecture documentation (`ARCHITECTURE.html`)
- User says "document the architecture" or "explain how this codebase is organized"
- User asks for an **HTML architecture overview**, **shareable artifact**, or **HTML explainer**
- User is onboarding to a new project and needs a structural overview
- User wants to visualize the codebase with diagrams
- User asks "what are the entry points" or "where does the code start"

---

## Output preferences (detail level and theme)

Before writing the artifact, confirm two preferences with the user. Default to the
smallest useful output and only expand on request.

### Detail level (small / medium / large, default small)

Smaller is better unless the user wants depth. Map the level to scope, sections, and
diagrams so the file stays proportional:


| Level | Scope                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| **small (default)** | Overview, project type, entry points, core-module table, 1 diagram (high-level). Concise prose.      |
| medium | Small + interfaces, data layer, 2 diagrams (high-level + request flow), short per-module notes.                   |
| large  | All sections fully populated, 3+ diagrams (incl. module dependencies), per-module exports/deps, config, testing, common patterns, glossary, build/deploy, collapsible module detail. |


Ask: **"What detail level do you want — small, medium, or large? Default is small (a
focused file); larger means more sections and diagrams."** Honor an explicit level the
user already gave.

### Color theme

Ask: **"Any color theme or branding I should follow (e.g. brand hex colors, a named
palette, or a link to a website to match)? Otherwise I'll use a neutral light/dark-adaptive
theme."** If the user provides colors, map them onto the CSS variables in Step 8
(`--accent`, `--bg`, `--fg`, `--border`, `--code`) and keep contrast legible in both
light and dark. If they decline, keep the default `prefers-color-scheme` palette.

**If the user gives a website URL**, derive the theme from that site:

1. Fetch the page with `WebFetch` (and, if needed, its linked stylesheet URLs via `Shell`
   `curl` for the raw CSS) to read the actual color declarations.
2. Extract the recurring colors: brand/accent (links, buttons, headers), page background,
   primary text, borders/dividers, and code/surface backgrounds. Prefer CSS custom
   properties and frequently-repeated hex/rgb/hsl values over one-off decorative colors.
3. Map them to the artifact variables: brand → `--accent`, page bg → `--bg`, body text →
   `--fg`, dividers → `--border`, surfaces → `--code`, muted text → `--muted`.
4. **Enforce accessibility before using a color**:
   - Body text vs background must meet **WCAG AA**: contrast ratio ≥ **4.5:1** (≥ **3:1**
     for large/heading text). Accent-on-background used for text/links must also meet 4.5:1.
   - If a sourced color fails, adjust its lightness (darken/lighten) until it passes rather
     than shipping low-contrast text. Keep the adjusted color close to the brand hue.
   - Derive a matching dark-mode set (or drop the dark block if the user wants a single
     fixed theme), re-checking the same ratios.
5. Tell the user which colors you pulled from the site and any you adjusted for contrast.

Never ship a palette that fails AA contrast, even if it matches the source site exactly.

---

## Workflow

### Step 1 — Check for Existing Architecture Documentation

Before analyzing from scratch, look for existing documentation that can inform your work.

Use the `Glob` tool to search for architecture documentation:

- Pattern: `**/ARCHITECTURE.html`, `**/architecture.html`
- Also: `**/ARCHITECTURE.md`, `**/architecture.md` (legacy)
- Also check for: `**/README.md`, `**/docs/architecture/*`, `**/DESIGN.md`

If `ARCHITECTURE.html` exists:

- Use `Read` to view its contents
- Assess whether it's current and complete
- Ask the user: **"I found an existing ARCHITECTURE.html. Would you like me to:"**
  - Update it with fresh analysis
  - Use it as reference for creating a summary
  - Replace it entirely
  - Just analyze it and provide insights

If only `ARCHITECTURE.md` exists (no HTML):

- Read it for context, then plan to create or replace with `ARCHITECTURE.html` unless the user wants Markdown preserved

If no architecture file exists:

- Proceed to Step 2 to analyze the codebase
- Plan to create a new `ARCHITECTURE.html` at the repo root

### Step 2 — Discover Codebase Structure and Language

Identify the project type, primary languages, and build system.

Use `Glob` tool to find:

- Configuration files: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`
- Source directories: `src/`, `lib/`, `app/`, `pkg/`, `internal/`
- Test directories: `test/`, `tests/`, `__tests__/`, `spec/`

Read the main configuration file to understand:

- Project name and description
- Primary language and version
- Key dependencies and frameworks
- Build scripts and commands
- Entry point configurations

Ask the user if needed:

1. **"What type of project is this?"** (web app, library, CLI tool, API service, monorepo, etc.)
2. **"Are there any critical architectural patterns I should highlight?"** (microservices, event-driven, MVC, etc.)
3. **Detail level (small / medium / large, default small)** and **color theme** — see
   [Output preferences](#output-preferences-detail-level-and-theme). Confirm both before
   writing; default to the small file and the neutral theme if the user has no preference.

### Step 3 — Identify Entry Points

Entry points are where code execution begins. These are critical for understanding the codebase.

**For different project types, look for:**


| Project Type           | Common Entry Points                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **Node.js/TypeScript** | `index.js`, `server.js`, `app.ts`, `main.ts`, check `package.json` "main" and "bin" fields              |
| **Python**             | `__main__.py`, `main.py`, `app.py`, `cli.py`, check `pyproject.toml` scripts or `setup.py` entry_points |
| **Go**                 | `main.go` files, check `cmd/` directory for multiple entry points                                       |
| **Rust**               | `main.rs`, `lib.rs`, check `Cargo.toml` [[bin]] sections                                                |
| **Java**               | Classes with `public static void main()`, check build config for mainClass                              |
| **Web Apps**           | `index.html`, `App.jsx`, `App.tsx`, `main.jsx`                                                          |


Use `Grep` tool to find:

- Pattern: `func main|def main|public static void main|if __name__ == "__main__"`
- File type filters based on detected language

Document:

- Primary entry point (where the app starts)
- Secondary entry points (CLI commands, background workers, multiple services)
- How users/systems invoke the code (CLI args, HTTP requests, events)

### Step 4 — Map Client Types and External Interfaces

Identify who/what consumes this codebase.

**Look for:**

1. **HTTP/API Servers**: Express, FastAPI, Flask, Gin, Actix, Spring Boot, etc.
  - Use `Grep` to find route definitions: `app.get|app.post|@route|@app.route|router.|Route::`
  - Document REST endpoints, GraphQL schemas, or gRPC services
2. **CLI Interfaces**: Commander, Click, Cobra, Clap, etc.
  - Look for command definitions and argument parsing
  - Document available commands and their purposes
3. **Library/SDK**: Exported functions and classes
  - Check `exports`, `module.exports`, `__all__`, `pub fn`, public APIs
  - Document the public interface
4. **UI Clients**: React, Vue, Angular components
  - Identify component hierarchies and page routes
  - Document user-facing entry points
5. **Event Consumers**: Message queues, webhooks, scheduled jobs
  - Look for event handlers, subscribers, cron jobs

For each interface type, document:

- Interface type (REST API, GraphQL, CLI, SDK, UI)
- Key endpoints/commands/components
- Authentication/authorization approach
- Common usage patterns

### Step 5 — Identify Core Modules and Responsibilities

Map the major functional areas of the codebase.

Use `Glob` to list directories under:

- `src/`, `lib/`, `app/`, `pkg/`, `internal/`, `modules/`, `components/`

For each significant directory, use `Read` to examine:

- Index files (`index.js`, `__init__.py`, `mod.rs`, etc.)
- README files within subdirectories
- Main implementation files

Categorize modules by responsibility:

- **Data/Models**: Database schemas, ORM models, data structures
- **Business Logic**: Core application logic, domain services
- **API/Routes**: HTTP handlers, controllers, resolvers
- **Auth/Security**: Authentication, authorization, validation
- **External Integration**: Third-party API clients, SDKs
- **Utilities**: Helper functions, shared tooling
- **Configuration**: Config loading, environment management
- **Testing**: Test utilities, fixtures, mocks

Create a module inventory (use an HTML `<table>` in the final artifact):


| Module Path | Responsibility      | Key Exports                             |
| ----------- | ------------------- | --------------------------------------- |
| `src/auth/` | User authentication | `authenticateUser()`, `validateToken()` |
| `src/api/`  | REST API endpoints  | Express routes, controllers             |
| ...         | ...                 | ...                                     |


### Step 6 — Map Key Dependencies and Data Flow

Understand how components interact.

**Identify:**

1. **Database/Storage**:
  - Connection libraries (mongoose, sqlalchemy, gorm, diesel)
  - Where schemas/models are defined
  - Migration systems
2. **External Services**:
  - API clients for third-party services
  - Message queues, caches, object storage
3. **Data Flow Patterns**:
  - Request → Controller → Service → Repository → Database
  - Event → Handler → Processor → Queue
  - User Input → Validation → Business Logic → Response

Use `Grep` to trace common patterns:

- Database queries: `SELECT|INSERT|UPDATE|query(|execute(|find|create|save`
- HTTP clients: `fetch(|axios|requests.|http.Get|reqwest::`
- Logging: `logger.|log.|console.|print|println!|fmt.Print`

### Step 7 — Author Inline SVG Diagrams

Create visual representations as **inline SVG** embedded in the HTML artifact. Do not use
Mermaid, CDN diagram libraries, or external image URLs. The file must work fully offline.

**Number of diagrams scales with the chosen detail level** (default small = one diagram):

1. **High-level architecture** — clients, API/gateway, business logic, data, external services (small, medium, large)
2. **Request / execution flow** — from entry point through middleware, handlers, services, data (medium, large)
3. **Module dependencies** — how major directories/packages depend on each other (large)

At the small level ship only the high-level diagram to keep the file small. Customize to
what Steps 2–6 revealed.

**SVG authoring rules:**

- Use `viewBox` and `width="100%"` / `height="auto"` for responsiveness
- Add `<title>` and `<desc>` inside each `<svg>` for accessibility
- Drive colors from CSS variables on the page (e.g. `var(--accent)`, `var(--border)`, `currentColor`) — never hardcode white fills or light-gray text that vanish in dark mode
- Keep diagrams readable: limit nodes, label arrows, group layers with `<g>` and optional `<rect>` backgrounds
- Reuse consistent shapes: `<rect>` for services/modules, rounded rects for processes, `<ellipse>` for databases
- Arrowheads: define once in `<defs><marker id="arrow">…</marker></defs>` and reference with `marker-end="url(#arrow)"`

**Minimal layered-architecture pattern** (expand with real labels from analysis):

```svg
<svg viewBox="0 0 480 280" width="100%" role="img" aria-labelledby="arch-title">
  <title id="arch-title">High-level architecture</title>
  <desc>Clients connect to API layer, business logic, and data or external services</desc>
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
    </marker>
    <style>
      .box { fill: var(--code); stroke: var(--border); stroke-width: 1.5; }
      .label { fill: var(--fg); font: 13px system-ui,sans-serif; text-anchor: middle; }
    </style>
  </defs>
  <rect class="box" x="170" y="20" width="140" height="44" rx="6"/>
  <text class="label" x="240" y="47">Clients</text>
  <rect class="box" x="170" y="90" width="140" height="44" rx="6"/>
  <text class="label" x="240" y="117">API Layer</text>
  <line x1="240" y1="64" x2="240" y2="90" stroke="currentColor" marker-end="url(#arrow)"/>
  <!-- add Business Logic, Data Layer, External Services as needed -->
</svg>
```

If a diagram is too complex to hand-author clearly, simplify the view or ask the user which
relationships matter most. Offer richer diagram UX (tabs, hover annotations) only when the user asks.

### Step 8 — Draft the ARCHITECTURE.html Document

Build a **single self-contained HTML file**: all CSS and JS inline, no external assets
(no CDN, no web fonts, no remote images). Default interactivity is **light** (sticky TOC,
collapsible `<details>` sections, styled tables, smooth scroll). Offer richer options
(tabs, search/filter on modules, theme toggle, SVG hover tooltips) only when the user asks.

**Apply the chosen detail level and theme:**

- **Detail level** decides which `<section>` blocks and how many diagrams to include
  (see the level table in [Output preferences](#output-preferences-detail-level-and-theme)).
  At the small level, drop sections you have nothing substantial to say about rather than
  emitting empty placeholders — keep the file small.
- **Theme**: if the user supplied colors, set the `:root` CSS variables below to their
  palette (and adjust the dark-mode block, or remove it if they want a single fixed theme).
  Otherwise keep the default neutral light/dark-adaptive palette.

Fill in this skeleton with analysis from Steps 2–6 and SVG from Step 7:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Architecture: PROJECT_NAME</title>
  <style>
    /* Theme tokens — override with the user's palette when provided */
    :root {
      --bg: #fff; --fg: #1a1a1a; --muted: #666; --accent: #2563eb;
      --border: #e5e7eb; --code: #f5f5f5;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0d1117; --fg: #e6edf3; --muted: #9aa4b2; --accent: #58a6ff;
        --border: #30363d; --code: #161b22;
      }
    }
    * { box-sizing: border-box; }
    body { margin: 0; font: 16px/1.6 system-ui, sans-serif; color: var(--fg); background: var(--bg); }
    .layout { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; max-width: 1100px; margin: 0 auto; padding: 2rem; }
    nav { position: sticky; top: 1rem; align-self: start; font-size: 0.9rem; }
    nav a { color: var(--accent); text-decoration: none; display: block; padding: 0.2rem 0; }
    nav a:hover { text-decoration: underline; }
    h1 { margin-top: 0; }
    h2 { margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
    .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.95rem; }
    th, td { border: 1px solid var(--border); padding: 0.5rem 0.75rem; text-align: left; }
    th { background: var(--code); }
    code, pre { background: var(--code); border-radius: 4px; font-size: 0.9em; }
    pre { padding: 1rem; overflow-x: auto; }
    svg { max-width: 100%; height: auto; display: block; margin: 1rem 0; }
    details { border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem 1rem; margin: 0.5rem 0; }
    details summary { cursor: pointer; font-weight: 600; }
    .diagram-block { margin: 1.5rem 0; }
    .toolbar { margin: 1rem 0; }
    .toolbar button { font: inherit; padding: 0.35rem 0.75rem; cursor: pointer; border: 1px solid var(--border); border-radius: 6px; background: var(--code); color: var(--fg); }
    @media (max-width: 720px) { .layout { grid-template-columns: 1fr; } nav { position: static; } }
  </style>
</head>
<body>
  <div class="layout">
    <nav id="toc" aria-label="Table of contents"><!-- filled by script --></nav>
    <main>
      <h1>Architecture: PROJECT_NAME</h1>
      <p class="meta">Last updated: DATE — High-level architecture for developers and AI agents.</p>

      <section id="overview"><h2>Overview</h2><!-- 1–2 paragraphs --></section>

      <section id="project-type"><h2>Project Type</h2>
        <table>
          <tr><th>Type</th><td><!-- Web app, CLI, library, etc. --></td></tr>
          <tr><th>Primary language</th><td></td></tr>
          <tr><th>Framework</th><td></td></tr>
          <tr><th>Build system</th><td></td></tr>
        </table>
      </section>

      <section id="entry-points"><h2>Entry Points</h2>
        <h3>Primary</h3><p><code>path/to/main</code> — description</p>
        <h3>Secondary</h3><ul><!-- list --></ul>
        <h3>How to run</h3><pre><!-- dev / prod / test commands --></pre>
      </section>

      <section id="interfaces"><h2>Client Types and Interfaces</h2>
        <!-- subsections per interface type; endpoint tables where useful -->
      </section>

      <section id="modules"><h2>Core Modules</h2>
        <div class="toolbar"><button type="button" id="toggle-details">Expand / collapse all modules</button></div>
        <details open><!-- repeat per major module: responsibility, files, exports, deps --></details>
      </section>

      <section id="diagrams"><h2>Architecture Diagrams</h2>
        <div class="diagram-block"><h3>High-level</h3><!-- inline SVG --></div>
        <div class="diagram-block"><h3>Request flow</h3><!-- inline SVG --></div>
        <div class="diagram-block"><h3>Module dependencies</h3><!-- inline SVG --></div>
      </section>

      <section id="data-layer"><h2>Data Layer</h2><!-- database, cache, storage --></section>
      <section id="dependencies"><h2>External Dependencies</h2></section>
      <section id="configuration"><h2>Configuration</h2></section>
      <section id="testing"><h2>Testing</h2></section>
      <section id="build-deploy"><h2>Build and Deployment</h2></section>
      <section id="patterns"><h2>Common Patterns</h2></section>
      <section id="glossary"><h2>Glossary</h2></section>
      <section id="resources"><h2>Additional Resources</h2></section>
    </main>
  </div>
  <script>
    (function () {
      const main = document.querySelector('main');
      const toc = document.getElementById('toc');
      const headings = main.querySelectorAll('h2, h3');
      const frag = document.createDocumentFragment();
      headings.forEach((h) => {
        if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.tagName === 'H3' ? '  ' + h.textContent : h.textContent;
        a.addEventListener('click', (e) => { e.preventDefault(); h.scrollIntoView({ behavior: 'smooth' }); history.pushState(null, '', '#' + h.id); });
        frag.appendChild(a);
      });
      toc.appendChild(frag);
      const btn = document.getElementById('toggle-details');
      if (btn) btn.addEventListener('click', () => {
        const details = main.querySelectorAll('#modules details');
        const anyOpen = [...details].some((d) => d.open);
        details.forEach((d) => { d.open = !anyOpen; });
      });
    })();
  </script>
</body>
</html>
```

Replace `PROJECT_NAME`, `DATE`, and every placeholder section with real content from analysis.

**Markdown output:** Only if the user explicitly requests `ARCHITECTURE.md` or Markdown.
In that case, use a conventional Markdown structure (optional Mermaid) — but the default
path is always HTML.

### Step 9 — Present and Save

1. Summarize key findings for the user (type, entry points, interfaces, core modules, data layer)
2. State the **detail level** (default small) and **theme** you used, and the approximate size
3. Tell them the artifact is a single file they can open in any browser and share as-is
4. Ask: **"Should I save this as ARCHITECTURE.html at the repository root, or would you like to:"**
   - Save to a different path (e.g. `docs/ARCHITECTURE.html`)
   - Change the detail level (small / medium / large) to make it smaller or more comprehensive
   - Apply a different color theme / brand palette
   - Add richer interactivity (tabs, search, theme toggle)
   - Produce Markdown instead (explicit request only)

4. If confirmed, use `Write`:
   - `file_path`: `/absolute/path/to/repo/ARCHITECTURE.html`
   - `content`: [The full HTML document]

5. Suggest next steps:
   - Re-run or update the HTML as the architecture evolves
   - Open the file locally or attach/share the single file with teammates
   - Point other agents at `ARCHITECTURE.html` for structural context

---

## Tips for Analysis

### Finding Hidden Entry Points

Don't just look for `main()` functions. Check:

- **Scripts in package.json**: `"start"`, `"dev"`, `"worker"`, `"migrate"`
- **Makefile targets**: `make run`, `make server`
- **Docker ENTRYPOINT**: What runs when the container starts
- **Serverless handlers**: Lambda functions, Cloud Functions
- **Test entry points**: Sometimes tests reveal usage patterns

### Understanding Module Boundaries

Look for these clues:

- **Barrel files**: `index.ts` that re-export from a directory
- **Dependency graphs**: Use `Grep` for import statements
- **Package structure**: In monorepos, each package is a module
- **Naming conventions**: `*Service`, `*Controller`, `*Repository` patterns

### Generating Better SVG Diagrams

- **Keep it simple**: Start high-level; add nodes only when they clarify
- **Show relationships**: Label arrows with short verbs (calls, reads, publishes)
- **Group layers**: Use `<g>` and background `<rect>` for presentation / business / data tiers
- **Match the codebase**: Rename generic boxes to real module or service names
- **Test contrast**: Preview in light and dark mode (browser devtools or `prefers-color-scheme`)

---

## Common Pitfalls

- **Over-analyzing**: Don't document every file. Focus on architecture, not implementation details.
- **Outdated assumptions**: If you find existing docs, verify them against the code.
- **Missing the obvious**: Check README.md and package.json first — they often explain the structure.
- **Generic diagrams**: Customize SVG to match the actual architecture; don't ship empty templates.
- **External dependencies in HTML**: No CDN scripts, fonts, or remote images — breaks offline sharing.
- **Skipping validation**: Ask the user to confirm understanding before writing the final file.
- **Too much detail**: Architecture doc, not full API reference. Keep it high-level.
- **Defaulting to Markdown**: HTML is the default deliverable unless the user asks otherwise.

---

## Example

**User request:** "Summarize this codebase and create an architecture overview"

**Step 1 output:**
> I found an existing ARCHITECTURE.html from 2024. It doesn't mention the new GraphQL layer. Would you like me to update it with fresh analysis?

**User response:** "Yes, update it"

**Steps 2–6 (internal):** Agent uses Glob, Grep, and Read to analyze the codebase.

**Steps 7–8 output:**
> I've analyzed the codebase:
>
> - **Type**: Node.js API with GraphQL gateway
> - **Entry points**: `src/server.ts`, `src/worker.ts`
> - **Interfaces**: REST (legacy), GraphQL, Admin CLI
> - **Modules**: auth, users, orders, payments, notifications, jobs
> - **Data**: PostgreSQL, Redis, S3
>
> I built an updated self-contained ARCHITECTURE.html with three inline SVG diagrams (high-level, request flow, module deps), a module table, and collapsible module sections.
>
> Should I save it at the repository root?

**User response:** "Yes, save it"

**Step 9 output:**
> Done — saved `ARCHITECTURE.html`. Open it in a browser to review; share the single file as needed.

---

## Quick Reference

### SVG shapes and elements

| Element | Use for |
| ------- | ------- |
| `<rect rx="6">` | Service, module, layer box |
| `<ellipse>` | Database, queue, external store |
| `<path>` + `<marker>` | Arrows, connectors |
| `<text class="label">` | Node labels (use CSS `fill: var(--fg)`) |
| `<g>` | Group layers or subgraphs |
| `<title>` / `<desc>` | Accessibility inside `<svg>` |

### HTML sections (in order)

Overview → Project Type → Entry Points → Interfaces → Core Modules (details/table) →
Diagrams (inline SVG) → Data Layer → External Dependencies → Configuration → Testing →
Build/Deploy → Common Patterns → Glossary → Resources

### Common project patterns

| Pattern | Indicators |
| ------- | ----------- |
| **Layered** | Separate `controllers/`, `services/`, `repositories/` |
| **Microservices** | Multiple entry points, separate databases per service |
| **Monolith** | Single entry point, shared database |
| **Serverless** | Handler functions, no long-running server |
| **Event-Driven** | Message queues, pub/sub, event handlers |
| **MVC** | `models/`, `views/`, `controllers/` directories |
