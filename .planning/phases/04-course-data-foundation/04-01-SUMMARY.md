---
phase: 04-course-data-foundation
plan: 01
subsystem: database
tags: [zustand, persist, localStorage, migration, progress-store]

# Dependency graph
requires: []
provides:
  - Zustand persist store v1 with migrate function (v0 -> v1): 12 course keys -> single 'python' key
  - Migration tests verifying merge, dedup, empty state, and fresh-student paths
  - Forward-compatible localStorage schema before any route changes
affects:
  - 04-02 (STRUCT-01 virtual course consolidation can now safely use 'python' key)
  - phase-05 (lesson routes can read completedLessons['python'] from migrated store)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zustand persist version/migrate pattern for schema evolution
    - mockPersistStorage adapter pattern to rebind store storage in tests (ESM hoisting workaround)

key-files:
  created: []
  modified:
    - lib/store/progress.ts
    - __tests__/lib/progress-store.test.ts

key-decisions:
  - "mockPersistStorage adapter needed: ES module import hoisting causes store to capture JSDOM's localStorage before vi.stubGlobal runs; setOptions() in migration beforeEach rebinds to mock"
  - "Empty v0 state returns completedLessons: {} not python: [] — avoids creating a python key for fresh students"

patterns-established:
  - "Pattern: use useProgressStore.persist.setOptions({ storage: mockPersistStorage }) in test beforeEach when testing persist behavior that touches localStorage"

requirements-completed: [STRUCT-04]

# Metrics
duration: 8min
completed: 2026-03-14
---

# Phase 4 Plan 01: Progress Store Migration Summary

**Zustand persist store migrated from implicit v0 (12 separate course keys) to v1 (single 'python' key) with flatMap + Set deduplication and comprehensive TDD coverage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-14T10:36:36Z
- **Completed:** 2026-03-14T10:44:50Z
- **Tasks:** 1 (TDD: RED + GREEN combined)
- **Files modified:** 2

## Accomplishments
- Added `OLD_COURSE_SLUGS` constant listing all 12 original course directory slugs
- Added `version: 1` and `migrate` function to Zustand persist config — migration runs automatically on `persist.rehydrate()` call in `ProgressHydration`
- Migration merges all lessons from 12 old keys into `completedLessons['python']` using `flatMap` + `new Set` for deduplication
- 5 new migration tests + 1 persist configuration assertion — all 118 tests pass, zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration tests (RED) + implementation (GREEN)** - `c388863` (test + feat combined per TDD)

**Plan metadata:** (docs commit follows)

_Note: TDD RED and GREEN phases combined into single commit as both files changed together_

## Files Created/Modified
- `lib/store/progress.ts` - Added OLD_COURSE_SLUGS, version: 1, migrate function
- `__tests__/lib/progress-store.test.ts` - Added mockPersistStorage adapter, migration describe block (5 tests), version assertion

## Decisions Made
- **mockPersistStorage adapter**: ES module import hoisting means `createJSONStorage(() => localStorage)` in the store captures JSDOM's real localStorage at module init time, before `vi.stubGlobal` runs. The fix: `useProgressStore.persist.setOptions({ storage: mockPersistStorage })` in migration `beforeEach` rebinds the store's active storage to our mock. This is documented in the test file comment.
- **Empty state returns `{}`**: When v0 has no completed lessons, migrate returns `{ completedLessons: {} }` (no 'python' key created). Matches requirement: "fresh student gets clean store with no errors".

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test pattern incompatibility due to ESM module hoisting**
- **Found during:** Task 1 (GREEN phase — tests still failing after implementation)
- **Issue:** The research document's test pattern used `localStorageMock.getItem.mockReturnValueOnce(...)` assuming `vi.stubGlobal` runs before module import. In Vitest with native ESM, imports are hoisted — the store's `createJSONStorage` captures JSDOM's real localStorage before the stub runs, so `localStorageMock.getItem` is never called by `rehydrate()`.
- **Fix:** Added `mockPersistStorage` adapter object and `beforeEach` in migration block that calls `useProgressStore.persist.setOptions({ storage: mockPersistStorage })` to explicitly rebind storage to the mock.
- **Files modified:** `__tests__/lib/progress-store.test.ts`
- **Verification:** All 118 tests pass including all 5 migration tests
- **Committed in:** c388863 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in test setup pattern from research doc)
**Impact on plan:** Necessary fix to make migration tests actually exercise the migrate function. No scope creep. Implementation in `lib/store/progress.ts` is exactly as specified in research.

## Issues Encountered
- ESM module hoisting caused migration tests to silently pass without exercising the migrate function (getItem calls = 0 in mock). Diagnosed via console.log debug output. Resolved with `setOptions` rebinding pattern.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- STRUCT-04 complete: localStorage schema is forward-compatible, safe to land route changes
- `lib/store/progress.ts` preserve all existing API (markComplete, markIncomplete, isComplete, getCourseProgress) unchanged
- 04-02 (virtual course consolidation via lib/section-map.ts) can now safely introduce `getUnifiedCourse()` which relies on `completedLessons['python']`

---
*Phase: 04-course-data-foundation*
*Completed: 2026-03-14*
