---
phase: 07-multi-course-infrastructure
plan: "02"
subsystem: routing
tags: [routing, progress-store, multi-course, zustand, next-app-router]

requires:
  - phase: 07-multi-course-infrastructure
    plan: "01"
    provides: "lib/course-registry.ts with getCourseData(slug), getAllRegisteredCourses()"

provides:
  - "app/courses/[courseSlug]/layout.tsx: course-generic, no python guard, getCourseData(courseSlug)"
  - "app/courses/[courseSlug]/page.tsx: generateStaticParams returns all registered courses, getCourseData(courseSlug)"
  - "app/courses/[courseSlug]/[lessonSlug]/page.tsx: generateStaticParams emits params for all courses' lessons, getCourseData(courseSlug)"
  - "lib/store/progress.ts: v2, justlearn-progress storage key, v1->v2 migration, isolated per-course progress"

affects:
  - "07-03-PLAN.md: homepage catalog uses getAllRegisteredCourses (already works)"
  - "Any new course added to COURSE_REGISTRY is automatically routed and included in progress store"

tech-stack:
  added: []
  patterns:
    - "try/catch notFound() pattern for getCourseData calls in App Router pages"
    - "Zustand persist version bump with chained migrate (v0, v1, v2 all handled)"
    - "generateStaticParams over getAllRegisteredCourses() for multi-course static generation"

key-files:
  created: []
  modified:
    - app/courses/[courseSlug]/layout.tsx
    - app/courses/[courseSlug]/page.tsx
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - lib/store/progress.ts
    - components/lesson-breadcrumb.tsx
    - __tests__/lib/progress-store.test.ts

key-decisions:
  - "try/catch notFound() over explicit courseSlug check — getCourseData throws on unknown slug, so the guard is implicit"
  - "COURSE_REGISTRY imported directly in page.tsx to get description field (not on UnifiedCourse)"
  - "v1->v2 progress migration is a pass-through (shape identical); key rename means v1 data is lost — acceptable (no real users)"
  - "LessonBreadcrumb requires no structural changes — already course-agnostic via props"

requirements-completed:
  - INFRA-01
  - INFRA-03
  - INFRA-05
  - INFRA-06

duration: 8min
completed: "2026-03-15"
---

# Phase 7 Plan 02: Routing Generalization + Progress Store v2 Summary

**Zustand progress store bumped to v2 (justlearn-progress key, v0/v1->v2 migration); all three App Router course pages generalized from python-hardcoded guards to getCourseData(courseSlug); build generates /courses/python and /courses/data-engineering as static pages**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-14T17:07:00Z
- **Completed:** 2026-03-14T17:10:15Z
- **Tasks:** 2 (Task 1 TDD, Task 2 implementation)
- **Files modified:** 6

## Accomplishments

- **Task 1: Progress Store v2**
  - Storage key renamed from `python-course-progress` to `justlearn-progress`
  - Version bumped from 1 to 2
  - Added v1→v2 migration path (pass-through — shape is already `{ courseSlug: string[] }`)
  - Added 7 new tests: course isolation (3), v1→v2 migration (2), updated config assertions (2)
  - Python and data-engineering progress keys are fully independent — completing a DE lesson does not appear in the python key

- **Task 2: Remove python guards from routing**
  - `layout.tsx`: Replaced `if (courseSlug !== 'python') notFound()` + `getUnifiedCourse()` with `getCourseData(courseSlug)` in try/catch
  - `page.tsx`: `generateStaticParams` now returns all registered courses; `CourseProgressBar` and `CourseOverviewAccordion` use `courseSlug` variable; description sourced from `COURSE_REGISTRY[courseSlug].description`
  - `[lessonSlug]/page.tsx`: `generateStaticParams` emits params for all courses via `getAllRegisteredCourses()`; `getCourseData(courseSlug)` replaces `getUnifiedCourse()`; `courseSlug !== 'python'` guard removed
  - `lesson-breadcrumb.tsx`: Added comment confirming already course-agnostic; call site passes `course.title` instead of hardcoded `"Python Course"`

## Task Commits

1. **Task 1: Bump progress store to v2** - `4b1006a` (feat)
2. **Task 2: Remove python guards, generalize routing** - `7ce0c3c` (feat)

## Files Created/Modified

- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/lib/store/progress.ts` — v2, justlearn-progress key, v1->v2 migrate path
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/__tests__/lib/progress-store.test.ts` — 7 new tests; updated config assertions for v2
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/app/courses/[courseSlug]/layout.tsx` — python guard removed, getCourseData try/catch
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/app/courses/[courseSlug]/page.tsx` — generateStaticParams all courses, dynamic courseSlug, description from registry
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/app/courses/[courseSlug]/[lessonSlug]/page.tsx` — generateStaticParams all courses, getCourseData, python guard removed, course.title to LessonBreadcrumb
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/components/lesson-breadcrumb.tsx` — course-agnostic comment added

## Decisions Made

- **try/catch notFound() over explicit guard**: `getCourseData()` throws on unknown slug, so no separate `courseSlug !== 'python'` check is needed — the throw is the guard
- **COURSE_REGISTRY in page.tsx for description**: `UnifiedCourse` type does not carry a description field; `CourseRegistryEntry` does. Importing `COURSE_REGISTRY` directly avoids adding description to `UnifiedCourse` (would require all `buildCourse()` factories to return it)
- **v1→v2 progress migration pass-through**: The data structure was already `{ courseSlug: string[] }` in v1 (the plan comments note this); no transformation needed. The key rename means v1 data is lost in practice — documented in code comment; acceptable since no real users
- **LessonBreadcrumb: no structural changes**: The component already accepted `courseTitle` as a prop. The fix was in the call site (passing `course.title` from `getCourseData`) — confirmed via code read

## Deviations from Plan

None — plan executed exactly as written. The line numbers in `<interfaces>` were slightly off from the actual file state but the plan described the correct intent; all changes matched the described behavior.

## Verification Results

- `pnpm vitest run`: 256 tests pass (30 test files) — up 5 from pre-task state (251)
- `pnpm tsc --noEmit`: No new errors from changed files (pre-existing `toBeInTheDocument` type errors in `__tests__/components/` are out of scope per 07-01-SUMMARY.md)
- `pnpm build`: Succeeds — generates `/courses/python` and `/courses/data-engineering` as static pages; 120 total static pages

---
*Phase: 07-multi-course-infrastructure*
*Completed: 2026-03-15*
