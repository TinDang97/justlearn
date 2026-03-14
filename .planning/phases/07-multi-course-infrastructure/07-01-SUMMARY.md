---
phase: 07-multi-course-infrastructure
plan: "01"
subsystem: infra
tags: [course-registry, multi-course, content-layer, typescript]

requires:
  - phase: 06-lesson-reading-toc-highlighting-practice
    provides: lib/content.ts with getUnifiedCourse(), UnifiedCourse type, Section, LessonMeta

provides:
  - "lib/course-registry.ts with CourseRegistryEntry type, COURSE_REGISTRY map, getCourseData(slug), getAllRegisteredCourses()"
  - "lib/content.ts re-exports getCourseData and getAllRegisteredCourses from course-registry"
  - "UnifiedCourse.slug widened from literal 'python' to string"
  - "courses/data-engineering/README.md stub (no lessons yet)"
  - "getAllCourses() restricted to NN- pattern dirs, excluding data-engineering"

affects:
  - "07-02-PLAN.md: routing, progress store — uses getCourseData, getAllRegisteredCourses"
  - "07-03-PLAN.md: homepage catalog — uses getAllRegisteredCourses"
  - "app/courses/[courseSlug]/page.tsx: must import getCourseData from @/lib/content"

tech-stack:
  added: []
  patterns:
    - "Course registry pattern: COURSE_REGISTRY maps slug to CourseConfig with buildCourse() factory"
    - "getCourseData(slug) as the canonical multi-course content accessor"
    - "getAllRegisteredCourses() strips buildCourse, returns public CourseRegistryEntry[] sorted by slug"
    - "getAllCourses() filtered to NN- pattern dirs to prevent non-python course dirs leaking into old API"

key-files:
  created:
    - lib/course-registry.ts
    - __tests__/lib/course-registry.test.ts
    - courses/data-engineering/README.md
  modified:
    - lib/content.ts
    - __tests__/lib/content.test.ts

key-decisions:
  - "COURSE_REGISTRY uses CourseConfig (CourseRegistryEntry + buildCourse) internally; getAllRegisteredCourses strips buildCourse before returning"
  - "buildPythonCourse delegates to existing getUnifiedCourse() — zero duplication"
  - "getAllCourses() restricted to NN- pattern dirs to prevent data-engineering dir contaminating old section-based API"
  - "data-engineering course stub: README.md only, no lessons — Phase 9 adds content"

patterns-established:
  - "Registry pattern: add new course by inserting into COURSE_REGISTRY — no routing or component changes needed"
  - "getCourseData re-exported from lib/content.ts so consumers have a single import path"

requirements-completed:
  - INFRA-01
  - INFRA-02

duration: 12min
completed: "2026-03-15"
---

# Phase 7 Plan 01: Course Registry + Content Layer Summary

**COURSE_REGISTRY with python and data-engineering entries; getCourseData(slug) as canonical multi-course content accessor; UnifiedCourse.slug widened to string**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-15T00:01:52Z
- **Completed:** 2026-03-15T00:04:10Z
- **Tasks:** 2 (TDD)
- **Files modified:** 5

## Accomplishments
- Created `lib/course-registry.ts` with `CourseRegistryEntry`, `CourseConfig`, `COURSE_REGISTRY`, `getCourseData()`, and `getAllRegisteredCourses()` — the core multi-course contract for all Phase 7 downstream plans
- Widened `UnifiedCourse.slug` from `'python'` literal to `string` enabling any course to satisfy the type
- Re-exported `getCourseData` and `getAllRegisteredCourses` from `lib/content.ts` so all existing call sites have a single import path
- Created `courses/data-engineering/README.md` stub so `getCourseData('data-engineering')` returns a valid empty course without throwing
- Added 18 new tests covering COURSE_REGISTRY shape, getCourseData behavior, error on unknown slug, and getAllRegisteredCourses sort order

## Task Commits

1. **Task 1: Create lib/course-registry.ts** - `549d78c` (feat)
2. **Task 2: Update lib/content.ts, create DE stub** - `5402690` (feat)

_Both tasks followed TDD: RED (failing test) → GREEN (implementation) → commit_

## Files Created/Modified
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/lib/course-registry.ts` - CourseRegistryEntry type, COURSE_REGISTRY, getCourseData, getAllRegisteredCourses
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/lib/content.ts` - UnifiedCourse.slug widened; re-exports getCourseData/getAllRegisteredCourses; getAllCourses filtered to NN- dirs
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/__tests__/lib/course-registry.test.ts` - 18 tests for all course-registry behaviors
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/__tests__/lib/content.test.ts` - 5 additional tests for re-exports and type widening
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/courses/data-engineering/README.md` - DE course stub (no lessons yet)

## Decisions Made
- `COURSE_REGISTRY` holds `CourseConfig` (with `buildCourse`); `getAllRegisteredCourses()` explicitly strips the function before returning public `CourseRegistryEntry[]` objects — keeps the public API clean while allowing the registry to hold builder logic
- `buildPythonCourse()` calls `getUnifiedCourse()` — no duplication of the 12-section assembly logic
- `getAllCourses()` now filters to `/^\d{2}-/` pattern — prevents `data-engineering/` from leaking into the section-based API used by existing tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] getAllCourses() returned 13 items after creating courses/data-engineering/**
- **Found during:** Task 2 (content.ts updates)
- **Issue:** The existing `getAllCourses()` filter only excluded `README.md`; the new `data-engineering/` directory was picked up as a 13th course, breaking 8 tests (expected 12, got 13; lessonCount=0 failed required >0 check)
- **Fix:** Added `SECTION_DIR_PATTERN = /^\d{2}-/` guard — `getAllCourses()` now only reads numbered section directories matching the Python course layout
- **Files modified:** `lib/content.ts`
- **Verification:** All 8 failing tests now pass; full suite 251 tests pass
- **Committed in:** `5402690` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug introduced by creating DE directory)
**Impact on plan:** Fix necessary for correctness. No scope creep — the pattern guard is the correct long-term behavior for getAllCourses() regardless of how many non-python courses are added.

## Issues Encountered
- Pre-existing TypeScript errors in `__tests__/components/*.test.tsx` and a few lib tests (`toBeInTheDocument`, `Buffer` type) — out of scope, these exist before this plan and are not related to any changes made here.

## Next Phase Readiness
- `getCourseData(slug)` and `getAllRegisteredCourses()` are ready for 07-02 (routing, progress store) and 07-03 (homepage catalog)
- `getUnifiedCourse()` preserved as-is — backward compatible for all existing call sites in `app/`
- Data Engineering course directory exists; Phase 9 adds lesson content

---
*Phase: 07-multi-course-infrastructure*
*Completed: 2026-03-15*

## Self-Check: PASSED

- FOUND: lib/course-registry.ts
- FOUND: lib/content.ts
- FOUND: courses/data-engineering/README.md
- FOUND: __tests__/lib/course-registry.test.ts
- FOUND: commit 549d78c (Task 1)
- FOUND: commit 5402690 (Task 2)
