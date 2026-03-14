---
phase: 04-course-data-foundation
plan: 02
subsystem: api
tags: [typescript, next.js, content-model, virtual-consolidation, section-map, redirects]

# Dependency graph
requires:
  - phase: 04-01
    provides: Zustand progress store migration from 12-key to python key

provides:
  - lib/section-map.ts with SECTION_MAP constant (12 entries, ordered 1-12)
  - Section and UnifiedCourse types in lib/content.ts
  - getUnifiedCourse() function returning all 120+ lessons as unified python course with global prev/next
  - sourceCourseSlug and sectionSlug fields on LessonMeta (backward-compatible)
  - 301 permanent redirects for all 12 legacy /courses/{oldSlug} URL prefixes

affects:
  - 05-python-course-routes (consumes getUnifiedCourse() for new route layer)
  - 06-reading-experience (reads lesson data via unified course slug)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SECTION_MAP: hardcoded TypeScript constant maps 12 dir slugs to display title and sort order (no frontmatter parsing)"
    - "Virtual consolidation: getUnifiedCourse() calls getAllCourses() unchanged and remaps courseSlug to 'python'"
    - "Global prev/next: flatMap all sections then index arithmetic — O(n), no graph traversal"
    - "LessonMeta extension: sourceCourseSlug + sectionSlug added to parseLessonMeta() so all callers get both fields"

key-files:
  created:
    - lib/section-map.ts
    - __tests__/lib/section-map.test.ts
  modified:
    - lib/content.ts
    - __tests__/lib/content.test.ts
    - next.config.mjs

key-decisions:
  - "SECTION_MAP is a TypeScript constant — no gray-matter, no frontmatter parsing, zero runtime cost"
  - "sourceCourseSlug and sectionSlug added to parseLessonMeta() making them present on ALL LessonMeta (not just unified course)"
  - "getUnifiedCourse() must NOT modify getAllCourses() — existing routes still call getCourse(oldSlug) until Phase 5"
  - "Redirects inlined as flat array in next.config.mjs — ESM import of SECTION_MAP not needed"

patterns-established:
  - "Pattern: Virtual course consolidation via config map + data remapping (no file moves)"
  - "Pattern: Global navigation = flatten sections to array + index arithmetic for prev/next"

requirements-completed: [STRUCT-01]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 4 Plan 02: Virtual Course Consolidation Data Model Summary

**SECTION_MAP + getUnifiedCourse() assembling 12 physical course directories into a unified Python course with global prev/next navigation, plus 24 permanent 301 redirects for all legacy course URLs**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T10:47:19Z
- **Completed:** 2026-03-14T10:49:55Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created lib/section-map.ts with SECTION_MAP constant mapping all 12 course directory slugs to display titles and sort orders 1-12
- Added Section, UnifiedCourse types and getUnifiedCourse() to lib/content.ts — assembles 120+ lessons into one virtual course with cross-section prev/next
- Added sourceCourseSlug and sectionSlug to LessonMeta (backward-compatible, populated in parseLessonMeta for all callers)
- Added 24 permanent (301) redirects in next.config.mjs (2 per old slug: base path + :path* catch-all)
- All 133 tests pass; build succeeds with 139 static pages

## Task Commits

Each task was committed atomically:

1. **Task 1: section-map + getUnifiedCourse + tests** - `6ce739d` (feat)
2. **Task 2: 301 redirects in next.config.mjs** - `eea40c7` (feat)

_Note: Task 1 is TDD (RED tests written alongside implementation since static constant tests pass on first write)_

## Files Created/Modified

- `lib/section-map.ts` - SECTION_MAP constant, 12 entries with title and order
- `__tests__/lib/section-map.test.ts` - Validates 12 entries, sequential orders, all keys match actual course dirs
- `lib/content.ts` - Added Section/UnifiedCourse types, sourceCourseSlug/sectionSlug to LessonMeta, getUnifiedCourse()
- `__tests__/lib/content.test.ts` - Added getUnifiedCourse describe block (11 new tests); existing tests untouched
- `next.config.mjs` - Added async redirects() returning 24 permanent redirect rules

## Decisions Made

- Used inline slug array in next.config.mjs rather than importing SECTION_MAP — avoids potential ESM/CJS boundary issues in the config file
- Added sourceCourseSlug/sectionSlug to parseLessonMeta() (not just getUnifiedCourse()) so getAllCourses() callers also get these fields; this makes Phase 5 FS operations straightforward

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- getUnifiedCourse() is fully functional and tested — Phase 5 routes can consume it immediately
- sourceCourseSlug on LessonMeta enables Phase 5 to resolve FS paths (exercises, mindmaps) without fallback
- Legacy URL redirects in place — users bookmarking old course URLs will land on correct unified course pages
- No blockers for Phase 5

---
*Phase: 04-course-data-foundation*
*Completed: 2026-03-14*
