---
phase: quick-2
plan: 2
subsystem: ui
tags: [notebooklm, guard, url-validation, tdd, vitest]

# Dependency graph
requires:
  - phase: 03-differentiators-polish
    provides: NotebookLMCard component and NOTEBOOK_URLS map
provides:
  - isNotebookUrlValid helper function in lib/notebook-urls.ts
  - PLACEHOLDER URL guard in NotebookLMCard
affects: [any component rendering NotebookLMCard, any code importing from lib/notebook-urls]

# Tech tracking
tech-stack:
  added: []
  patterns: [url-validation helper exported alongside data map, TDD RED-GREEN for guard logic]

key-files:
  created: []
  modified:
    - lib/notebook-urls.ts
    - components/notebook-lm/NotebookLMCard.tsx
    - __tests__/components/notebook-lm-card.test.tsx

key-decisions:
  - "isNotebookUrlValid checks both falsiness and PLACEHOLDER substring — stable because the PLACEHOLDER convention is established in the file's own comments"
  - "Guard changed from bare !url to !isNotebookUrlValid(url) — minimal surface change"

patterns-established:
  - "URL validation helper: export alongside data map rather than inline guard, enables reuse and testing in isolation"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-03-14
---

# Quick Task 2: Fix NotebookLMCard PLACEHOLDER URL Guard Summary

**isNotebookUrlValid helper added to lib/notebook-urls.ts; NotebookLMCard guard updated so 11 courses with PLACEHOLDER URLs render nothing instead of broken links**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-14T06:15:00Z
- **Completed:** 2026-03-14T06:19:27Z
- **Tasks:** 1 (TDD: RED + GREEN commits)
- **Files modified:** 3

## Accomplishments
- Added `isNotebookUrlValid(url: string | undefined): boolean` to `lib/notebook-urls.ts` — returns false for undefined, empty string, or URLs containing "PLACEHOLDER"
- Updated `NotebookLMCard` guard from `!url` to `!isNotebookUrlValid(url)` preventing 11 broken PLACEHOLDER links from rendering
- Added 2 new tests: PLACEHOLDER courseSlug renders null, isNotebookUrlValid rejects all falsy/PLACEHOLDER inputs
- All 6 tests pass (4 existing + 2 new)

## Task Commits

TDD commits:

1. **RED: failing tests** - `94cf63a` (test)
2. **GREEN: implementation** - `5a13138` (feat)

## Files Created/Modified
- `lib/notebook-urls.ts` - Added and exported `isNotebookUrlValid` helper function
- `components/notebook-lm/NotebookLMCard.tsx` - Imported `isNotebookUrlValid`, replaced bare `!url` guard
- `__tests__/components/notebook-lm-card.test.tsx` - Added 2 new tests covering PLACEHOLDER rejection

## Decisions Made
- `isNotebookUrlValid` checks `!url.includes('PLACEHOLDER')` rather than a regex — simpler, sufficient, and the PLACEHOLDER convention is defined in the file header comment making the substring stable
- Helper exported from the same module as `NOTEBOOK_URLS` for cohesion

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing `pnpm lint` failure: `next lint` is deprecated and prompts interactively for ESLint config when no `eslint.config.*` exists. This is a pre-existing infrastructure issue unrelated to this task. Logged to deferred items.
- Pre-existing TypeScript errors in other test files (`toBeInTheDocument`, `toHaveAttribute`, `toHaveClass` not typed) — pre-existing, out of scope, zero new TS errors introduced by this task.

## Next Phase Readiness
- `isNotebookUrlValid` is exported and available for import if other components need URL validation
- When real NotebookLM URLs replace PLACEHOLDERs, no code changes needed — the guard will auto-pass valid URLs

---
*Phase: quick-2*
*Completed: 2026-03-14*

## Self-Check: PASSED

- FOUND: lib/notebook-urls.ts
- FOUND: components/notebook-lm/NotebookLMCard.tsx
- FOUND: __tests__/components/notebook-lm-card.test.tsx
- FOUND: .planning/quick/2-fix-notebooklmcard-placeholder-url-guard/2-SUMMARY.md
- FOUND commit: 94cf63a (RED: failing tests)
- FOUND commit: 5a13138 (GREEN: implementation)
