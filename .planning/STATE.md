# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification
**Current focus:** Phase 1 - Content + Reading Shell

## Current Position

Phase: 1 of 3 (Content + Reading Shell)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-03-14 — Roadmap created; 32 v1 requirements mapped across 3 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-roadmap]: Course content (120+ lesson MD files) already exists in `courses/` — Phase 1 builds the reading shell on top of existing content, not from scratch
- [Pre-roadmap]: NotebookLM integration must be link-out only; iframe embedding blocked by Google CSP
- [Pre-roadmap]: Pyodide must lazy-load in a Web Worker on first "Run" click — never eager-load on page load

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Pyodide + Next.js 15 webpack config for Web Worker loading is under-documented; Phase 2 plan should start with a spike
- [Phase 3]: 120 mindmap JSON files are a significant content task; evaluate auto-generation from lesson headings before manual authoring
- [Phase 3]: NotebookLM public sharing policies change frequently; verify student access (especially under-18 COPPA restrictions) at implementation time

## Session Continuity

Last session: 2026-03-14
Stopped at: Roadmap created — ready to begin Phase 1 planning
Resume file: None
