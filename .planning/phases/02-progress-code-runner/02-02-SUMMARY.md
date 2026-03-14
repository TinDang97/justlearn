---
phase: 02-progress-code-runner
plan: "02"
subsystem: ui
tags: [pyodide, webworker, codemirror, python, wasm, code-runner, nextjs]

# Dependency graph
requires:
  - phase: 02-progress-code-runner
    provides: plan 02-01 — LessonCompleteButton on lesson pages, progress store patterns
  - phase: 01-content-reading-shell
    provides: lesson page routes, LessonNav, lesson layout structure
provides:
  - Pyodide Web Worker at public/workers/pyodide.worker.mjs (lazy WASM load from CDN)
  - usePyodideWorker hook with module-level singleton, lazy instantiation, status transitions
  - OutputPanel component with stdout/stderr distinct styling
  - CodeRunnerClient with CodeMirror 6 editor, Python syntax, dark/light theme
  - CodeRunner dynamic wrapper (next/dynamic ssr:false) on lesson pages
affects:
  - Any phase adding lesson page content (CodeRunner already wired, will display on all lessons)
  - Phase 3 (mindmap/AI) — pattern for lazy-loading heavy client components established

# Tech tracking
tech-stack:
  added:
    - "@uiw/react-codemirror@4.25.8"
    - "@codemirror/lang-python@6.2.1"
    - "@uiw/codemirror-theme-github@4.25.8"
  patterns:
    - Pyodide singleton worker pattern: module-level sharedWorker + pendingMessages Map for concurrent run() calls
    - next/dynamic with ssr:false must have 'use client' directive in the wrapping component (Next.js 15 requirement)
    - TDD with vitest/jsdom: mock @uiw/react-codemirror to textarea, mock next/dynamic to render synchronously via useEffect

key-files:
  created:
    - public/workers/pyodide.worker.mjs
    - hooks/use-pyodide-worker.ts
    - components/code-runner/index.tsx
    - components/code-runner/code-runner-client.tsx
    - components/code-runner/output-panel.tsx
    - __tests__/hooks/use-pyodide-worker.test.ts
    - __tests__/components/code-runner.test.tsx
  modified:
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx

key-decisions:
  - "next/dynamic with ssr:false requires 'use client' in the wrapping component — Next.js 15 enforces this at build time"
  - "Module-level singleton sharedWorker prevents multiple Pyodide WASM downloads when several code runners exist on one page"
  - "pendingMessages Map keyed by incrementing messageIdCounter allows concurrent run() calls to resolve independently"

patterns-established:
  - "Worker lazy-init pattern: sharedWorker created on first run() call, not on hook mount"
  - "Status flow: idle -> loading (worker created) -> running (postMessage sent) -> ready (response received)"
  - "Mock heavy client libs in tests: replace @uiw/react-codemirror with textarea, mock next/dynamic to load synchronously"

requirements-completed: [CODE-01, CODE-02, CODE-03, CODE-04, CODE-05, CODE-06]

# Metrics
duration: 8min
completed: 2026-03-14
---

# Phase 2 Plan 02: Pyodide Code Runner Summary

**In-browser Python execution via Pyodide Web Worker with CodeMirror 6 editor, lazy WASM loading on first Run click, and stdout/stderr output panel wired into every lesson page**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-14T10:44:00Z
- **Completed:** 2026-03-14T10:47:00Z
- **Tasks:** 2 (Task 3 was checkpoint:human-verify, auto-approved)
- **Files modified:** 8

## Accomplishments

- Pyodide Web Worker (pyodide.worker.mjs): lazily loads ~30MB WASM from CDN on first run, caches singleton, captures stdout/stderr via setStdout/setStderr batched callbacks
- usePyodideWorker hook: module-level singleton worker with pending message Map for concurrent runs, status transitions idle->loading->running->ready, lazy instantiation on first run() call
- CodeRunner UI: CodeMirror 6 with Python syntax highlighting, dark/light theme via next-themes, loading indicator during cold start, Run button disabled while executing, OutputPanel with red stderr styling
- 62 unit tests pass; pnpm build generates 139 static pages with no SSR/window errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Pyodide Web Worker, usePyodideWorker hook, CodeRunner components, and test suite** - `93a75ad` (feat)
2. **Task 2: Wire CodeRunner into lesson pages and verify build** - `c6583e3` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified

- `public/workers/pyodide.worker.mjs` - ESM Web Worker: lazy loadPyodide from CDN, batched stdout/stderr, sends {id, output, error} back via postMessage
- `hooks/use-pyodide-worker.ts` - React hook: module-level singleton Worker, lazy init on run(), pending message Map, status state machine
- `components/code-runner/output-panel.tsx` - Displays stdout/stderr output lines; stderr in text-red-500, placeholder when empty
- `components/code-runner/code-runner-client.tsx` - CodeMirror 6 editor with python(), githubLight/githubDark theme, Run button, loading indicator, OutputPanel
- `components/code-runner/index.tsx` - 'use client' + next/dynamic ssr:false wrapper with skeleton loading fallback
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` - Added "Try it yourself" section with CodeRunner between article and LessonCompleteButton
- `__tests__/hooks/use-pyodide-worker.test.ts` - 3 tests: lazy Worker instantiation, status idle, Worker called on run()
- `__tests__/components/code-runner.test.tsx` - 8 tests: OutputPanel stdout/stderr/placeholder, CodeRunnerClient editor/button/loading/disabled

## Decisions Made

- Added `'use client'` to `components/code-runner/index.tsx` because Next.js 15 enforces that `next/dynamic` with `ssr: false` must live inside a Client Component (build error at compile time)
- Used module-level `sharedWorker` singleton in `hooks/use-pyodide-worker.ts` to prevent multiple Pyodide WASM loads when multiple CodeRunner instances exist on the same page
- Used a `pendingMessages` Map keyed by an incrementing counter to handle concurrent `run()` calls correctly without race conditions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added 'use client' to components/code-runner/index.tsx**
- **Found during:** Task 2 (Wire CodeRunner into lesson pages, pnpm build)
- **Issue:** Next.js 15 build error: `ssr: false` is not allowed with `next/dynamic` in Server Components. The index.tsx had no directive, making it a Server Component by default.
- **Fix:** Added `'use client'` directive at the top of `components/code-runner/index.tsx`
- **Files modified:** `components/code-runner/index.tsx`
- **Verification:** `pnpm build` completed successfully — 139 static pages, no errors
- **Committed in:** `c6583e3` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required for build correctness. No scope creep.

## Issues Encountered

- vitest test isolation: `vi.resetModules()` in `beforeEach` caused module mock re-registration to be lost for component tests. Fixed by using a mutable mock object (`mockWorker`) that persists across test runs plus `afterEach(cleanup)` to unmount between tests.

## User Setup Required

None - no external service configuration required. Pyodide loads from CDN (cdn.jsdelivr.net) on first Run click.

## Next Phase Readiness

- Code runner fully operational on all 122 lesson pages; ready for Phase 3 (mindmap/AI chat)
- Pattern established for loading heavy client libs lazily (next/dynamic ssr:false with 'use client' wrapper)
- Pyodide CDN URL pinned to v0.29.3 — update worker file if newer stable release is available

## Self-Check: PASSED

All created files confirmed present. Both commits (93a75ad, c6583e3) verified in git log.

---
*Phase: 02-progress-code-runner*
*Completed: 2026-03-14*
