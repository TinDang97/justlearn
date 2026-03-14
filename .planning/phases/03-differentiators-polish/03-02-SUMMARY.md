---
phase: 03-differentiators-polish
plan: "02"
subsystem: ui
tags: [fuse.js, search, shadcn, radix-ui, next.js, typescript, tdd, tsx]

# Dependency graph
requires:
  - phase: 01-content-reading-shell
    provides: "lib/content.ts getAllCourses() — used by search index generator to enumerate all lessons"
  - phase: 03-differentiators-polish
    provides: "components/site-header.tsx — modified to include SearchDialog"
provides:
  - "Fuzzy full-text search over 122 lessons via Fuse.js, accessible from global header"
  - "Build-time search index generator (scripts/generate-search-index.ts) producing public/search-data.json + public/search-index.json"
  - "highlight() utility in lib/search.ts for wrapping Fuse.js match ranges in <mark> elements"
  - "SearchHighlight component for rendering highlighted search results"
  - "SearchDialog client component with lazy index loading, Cmd+K shortcut, result links"
  - "Dialog shadcn/ui component wrapping radix-ui primitives"
affects:
  - site-header — SearchDialog is now rendered in every page header
  - lesson pages — navigable from search results

# Tech tracking
tech-stack:
  added:
    - fuse.js@7.1.0 — fuzzy search with pre-built index and includeMatches support
    - tsx@4.21.0 (devDependency) — runs TypeScript scripts at build time
  patterns:
    - Build-time data generation: tsx scripts/*.ts in prebuild/predev, output to public/ (gitignored)
    - Lazy index loading: fetch() on first dialog open, store in ref to avoid re-fetching
    - TDD: RED (failing test) → GREEN (minimal implementation) → commit per task
    - Fuse.js constructor mock using regular function (not arrow) for `new Fuse()` compatibility in vitest

key-files:
  created:
    - scripts/generate-search-index.ts
    - lib/search.ts
    - components/search/SearchHighlight.tsx
    - components/search/SearchDialog.tsx
    - components/ui/dialog.tsx
    - __tests__/lib/search.test.ts
    - __tests__/components/search-dialog.test.tsx
  modified:
    - components/site-header.tsx — added SearchDialog between logo and ThemeToggle
    - package.json — added prebuild, predev (chained with mindmap generator), generate:search
    - .gitignore — excluded public/search-data.json and public/search-index.json
    - pnpm-lock.yaml — fuse.js and tsx lockfile entries

key-decisions:
  - "Store Fuse instance in useRef (not useState) to prevent useCallback/useEffect dependency cycles that caused infinite re-renders"
  - "Remove useDeferredValue — it caused test timing issues in jsdom; direct useEffect([query, loading]) achieves same UX with simpler code"
  - "Fuse mock in vitest must use regular function (not arrow) to support `new Fuse()` constructor syntax"
  - "prebuild/predev chain both mindmap and search generators since 03-01 ran first without setting prebuild"
  - "Search index loaded via fetch() on dialog open, never at page load — matches SRCH-01 lazy-load requirement"
  - "Dialog component added manually as shadcn/ui component file (not via CLI) using radix-ui Dialog primitive"

patterns-established:
  - "Build-time generators in scripts/ use tsx, output to public/, are gitignored and run in prebuild"
  - "Lazy loading: fetch + useRef pattern for one-time client-side resource loading"
  - "SearchHighlight: thin wrapper around highlight() — keeps utility pure and testable"

requirements-completed: [SRCH-01, SRCH-02, SRCH-03]

# Metrics
duration: 8min
completed: 2026-03-14
---

# Phase 3 Plan 02: Fuzzy Lesson Search Summary

**Fuse.js fuzzy search across 122 lessons with pre-built build-time index, lazy dialog loading, highlighted results, and Cmd+K keyboard shortcut in the global header**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-14T04:43:07Z
- **Completed:** 2026-03-14T04:51:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Pre-built search index generator (`scripts/generate-search-index.ts`) produces Fuse.js index for all 122 lessons at build time — zero runtime cost
- SearchDialog lazy-loads the index on first open via fetch(), exposes Cmd+K shortcut, shows fuzzy-matched lessons with `<mark>`-highlighted titles and course labels
- Full TDD cycle: 14 tests (6 highlight utility + 8 SearchDialog/SiteHeader) all pass; build produces 139 static pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create search index generator and highlight utility** - `ecd8fcc` (feat)
2. **Task 2: Create SearchDialog component and wire into SiteHeader** - `f9021f9` (feat)

_Note: TDD tasks had RED → GREEN → commit flow; no separate refactor commits needed_

## Files Created/Modified

- `scripts/generate-search-index.ts` — Build-time script: reads getAllCourses(), emits search-data.json + search-index.json to public/
- `lib/search.ts` — `highlight(value, indices)` utility: wraps Fuse.js match ranges in `<mark className="bg-yellow-200 dark:bg-yellow-800">` elements
- `components/search/SearchHighlight.tsx` — React wrapper around `highlight()`
- `components/search/SearchDialog.tsx` — Client component: Dialog with search input, lazy Fuse.js load, results list with links and highlighted text
- `components/ui/dialog.tsx` — shadcn-style Dialog wrapping radix-ui Dialog primitives
- `components/site-header.tsx` — Added SearchDialog + ThemeToggle flex group
- `__tests__/lib/search.test.ts` — 6 tests for highlight() edge cases
- `__tests__/components/search-dialog.test.tsx` — 8 tests for SearchDialog and SiteHeader
- `package.json` — prebuild, predev (chained mindmap + search), generate:search scripts; fuse.js + tsx added
- `.gitignore` — Excluded public/search-data.json, public/search-index.json

## Decisions Made

- **useRef over useState for Fuse instance:** Using `useState<Fuse|null>` with `useCallback` deps caused infinite re-render cycles (fuseInstance change → loadIndex recreated → effect re-fires). Using `useRef` + `loadingRef` guard solves this cleanly.
- **Removed useDeferredValue:** Caused jsdom test timing issues. Direct `useEffect([query, loading])` achieves equivalent UX with simpler code and testable behavior.
- **Fuse.js vitest mock must use regular function:** Arrow functions cannot be used as constructors; `vi.fn().mockImplementation(() => ...)` fails for `new Fuse()`. Used `function FuseMock() { return {...} }` pattern.
- **prebuild chains both generators:** Plan 03-01 ran first and added `generate:mindmaps` but not prebuild. This plan added both generators chained via `&&` in prebuild and predev.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing shadcn/ui Dialog component**
- **Found during:** Task 2 (SearchDialog creation)
- **Issue:** `components/ui/dialog.tsx` did not exist — shadcn CLI not used; Dialog component not in the UI folder despite being listed as available in plan context
- **Fix:** Created dialog.tsx manually following the same radix-ui pattern used by existing sheet.tsx
- **Files modified:** `components/ui/dialog.tsx`
- **Verification:** Build passes, Dialog renders in tests
- **Committed in:** f9021f9 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Fuse.js constructor mock incompatible with vitest**
- **Found during:** Task 2 (test implementation and debugging)
- **Issue:** `vi.fn().mockImplementation(() => mockFuseInstance)` produced arrow function — not constructable via `new Fuse()`; TypeError thrown
- **Fix:** Changed mock to `function FuseMock() { return { search: mockSearch } }` (regular function)
- **Files modified:** `__tests__/components/search-dialog.test.tsx`
- **Verification:** All 8 SearchDialog tests pass
- **Committed in:** f9021f9 (Task 2 commit)

**3. [Rule 1 - Bug] Removed useDeferredValue causing test timing deadlocks**
- **Found during:** Task 2 (running tests)
- **Issue:** `useDeferredValue` + dependent `useEffect` didn't update reliably in jsdom test environment, causing 3-second timeouts waiting for results to appear
- **Fix:** Replaced with direct `useEffect([query, loading])` — equivalent UX, fully testable
- **Files modified:** `components/search/SearchDialog.tsx`
- **Verification:** Tests complete in <100ms each
- **Committed in:** f9021f9 (Task 2 commit)

**4. [Rule 3 - Blocking] Chained prebuild with plan 03-01's mindmap generator**
- **Found during:** Task 1 (package.json scripts)
- **Issue:** Plan 03-01 ran first, created `generate:mindmaps` script but no prebuild. Plan 03-02 (this plan) is responsible for its own prebuild script, but mindmap data also needs to be regenerated at build time.
- **Fix:** Added `prebuild` and `predev` that chain both generators: `tsx scripts/generate-mindmap-data.ts && tsx scripts/generate-search-index.ts`
- **Files modified:** `package.json`
- **Verification:** `pnpm build` runs both generators (output: "Generated mindmap data for 122 lessons" + "Generated search index for 122 lessons")
- **Committed in:** ecd8fcc (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (1 missing component, 1 mock bug, 1 useEffect pattern, 1 build script coordination)
**Impact on plan:** All auto-fixes necessary for correctness and testability. No scope creep.

## Issues Encountered

- Initial `useCallback` + `useState` for Fuse instance created dependency cycle; resolved with `useRef` pattern
- Test isolation required `vi.resetModules()` was unnecessary — per-test `import()` inside `describe` blocks isolates module state naturally

## User Setup Required

None - no external service configuration required. Search index generated at build time from local course files.

## Next Phase Readiness

- All 3 search requirements (SRCH-01, SRCH-02, SRCH-03) complete
- Search index generator chained in prebuild alongside mindmap generator
- 14 new tests green, build produces 139 static pages
- Ready for Plan 03-03 (if any) or phase completion

## Self-Check: PASSED

All created files verified present on disk. Both task commits (ecd8fcc, f9021f9) verified in git log.

---
*Phase: 03-differentiators-polish*
*Completed: 2026-03-14*
