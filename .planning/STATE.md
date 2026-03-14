---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 03-differentiators-polish/03-03-PLAN.md
last_updated: "2026-03-14T04:55:26.047Z"
last_activity: "2026-03-14 — Completed 01-01: Next.js 15 init, MDX pipeline, lib/content.ts with 20 passing tests"
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 8
  completed_plans: 8
  percent: 11
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification
**Current focus:** Phase 1 - Content + Reading Shell

## Current Position

Phase: 1 of 3 (Content + Reading Shell)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-03-14 — Completed 01-01: Next.js 15 init, MDX pipeline, lib/content.ts with 20 passing tests

Progress: [█░░░░░░░░░] 11%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 9 min
- Total execution time: 9 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-content-reading-shell | 1/3 | 9 min | 9 min |

**Recent Trend:**
- Last 5 plans: 9 min
- Trend: baseline

*Updated after each plan completion*
| Phase 01-content-reading-shell P02 | 5 | 2 tasks | 3 files |
| Phase 01-content-reading-shell P03 | 15 | 1 tasks | 13 files |
| Phase 02-progress-code-runner P01 | 3 | 2 tasks | 11 files |
| Phase 02-progress-code-runner P02 | 8 | 2 tasks | 8 files |
| Phase 03-differentiators-polish P01 | 7 | 2 tasks | 11 files |
| Phase 03-differentiators-polish P02 | 8 | 2 tasks | 10 files |
| Phase 03-differentiators-polish P03 | 10 | 1 tasks | 9 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-roadmap]: Course content (120+ lesson MD files) already exists in `courses/` — Phase 1 builds the reading shell on top of existing content, not from scratch
- [Pre-roadmap]: NotebookLM integration must be link-out only; iframe embedding blocked by Google CSP
- [Pre-roadmap]: Pyodide must lazy-load in a Web Worker on first "Run" click — never eager-load on page load
- [01-01]: Do not use gray-matter — lesson files have NO YAML frontmatter; use regex-based parseLessonMeta with inline bold text
- [01-01]: Course title requires two-pass regex: narrow ' - ' separator first (course 01), broad fallback for others
- [01-01]: Course description: match '## Course Description' OR '## Course Overview' (courses 07-12 use Overview)
- [01-01]: Disable Turbopack — rehype visitor functions non-serializable; use `next dev` without --turbopack
- [01-01]: Tailwind v4 typography: @plugin directive in CSS (not @import) — correct resolution path
- [Phase 01-02]: Dynamic MDX import via @/courses/courseSlug/lessonSlug.md — @ alias maps to project root
- [Phase 01-02]: Next.js 15 async params: must await params before destructuring courseSlug/lessonSlug
- [Phase 01-03]: SiteHeader in root layout.tsx ensures header on catalog and course overview pages; course layout only adds sidebar layer
- [Phase 01-03]: CourseSidebar as Client Component using usePathname() avoids prop threading courseSlug through layout
- [Phase 01-03]: @testing-library/jest-dom requires expect.extend(matchers) pattern in vitest (bare import fails without global expect)
- [Phase 02-progress-code-runner]: skipHydration:true in Zustand persist config prevents SSR/client HTML mismatch; ProgressHydration in root layout calls rehydrate() on mount
- [Phase 02-progress-code-runner]: useShallow from zustand/shallow used in CourseProgressBar array selector to prevent infinite re-render loops (Zustand v5 removed custom equality from create)
- [Phase 02-progress-code-runner]: CourseProgressBar renders null when 0% completed — clean look for new students, avoids empty progress bar
- [Phase 02-progress-code-runner]: next/dynamic with ssr:false requires 'use client' in the wrapping component — Next.js 15 enforces this at build time
- [Phase 02-progress-code-runner]: Module-level singleton sharedWorker prevents multiple Pyodide WASM downloads when several code runners exist on one page
- [Phase 02-progress-code-runner]: pendingMessages Map keyed by incrementing messageIdCounter allows concurrent run() calls to resolve independently
- [Phase 03-differentiators-polish]: Split layoutMindmapData into lib/mindmap-layout.ts (client-safe, no fs) to prevent webpack bundling Node.js builtins into client chunks
- [Phase 03-differentiators-polish]: motion Variants require spring type as const to satisfy AnimationGeneratorType discriminated union
- [Phase 03-differentiators-polish]: predev/prebuild hooks auto-run generate-mindmap-data.ts + generate-search-index.ts before every dev/build — zero manual step
- [Phase 03-differentiators-polish]: useRef instead of useState for Fuse instance avoids useCallback/useEffect dependency cycles
- [Phase 03-differentiators-polish]: Fuse.js vitest mock must use regular function (not arrow) for new Fuse() constructor compatibility
- [Phase 03-differentiators-polish]: prebuild chains both mindmap and search generators since 03-01 ran first without setting prebuild
- [Phase 03-differentiators-polish]: Search index loaded lazily via fetch() on first dialog open stored in useRef — never at page load
- [Phase 03-differentiators-polish]: Wrap shadcn Button in motion.div wrapper (not motion.create) to preserve shadcn internals and avoid ref complexity
- [Phase 03-differentiators-polish]: app/template.tsx uses only initial/animate — no AnimatePresence; template remounts naturally on route change so exit animations not needed for v1
- [Phase 03-differentiators-polish]: transition: { type: 'spring' as const } required in motion objects for TypeScript AnimationGeneratorType narrowing

### Pending Todos

None.

### Blockers/Concerns

- [Phase 2]: Pyodide + Next.js 15 webpack config for Web Worker loading is under-documented; Phase 2 plan should start with a spike
- [Phase 3]: 120 mindmap JSON files are a significant content task; evaluate auto-generation from lesson headings before manual authoring
- [Phase 3]: NotebookLM public sharing policies change frequently; verify student access (especially under-18 COPPA restrictions) at implementation time

## Session Continuity

Last session: 2026-03-14T04:55:26.044Z
Stopped at: Completed 03-differentiators-polish/03-03-PLAN.md
Resume file: None
