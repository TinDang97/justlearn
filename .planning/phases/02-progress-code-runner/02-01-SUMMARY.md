---
phase: 02-progress-code-runner
plan: "01"
subsystem: ui
tags: [zustand, localStorage, progress-tracking, react, nextjs]

# Dependency graph
requires:
  - phase: 01-content-reading-shell
    provides: CourseSidebar (Client Component), LessonMeta type, Course type, page routes for courses and lessons
provides:
  - Zustand v5 progress store with localStorage persistence (lib/store/progress.ts)
  - ProgressHydration component for root-level SSR rehydration
  - LessonCompleteButton toggle on lesson pages
  - CourseProgressBar on catalog and course overview pages
  - Sidebar completion indicators (CheckCircle2/Circle icons)
affects:
  - 02-progress-code-runner/02-02 (code runner — may reference sidebar/layout patterns)
  - Any phase using progress state or requiring knowledge of completed lessons

# Tech tracking
tech-stack:
  added: [zustand@5.0.11, zustand/middleware (persist, createJSONStorage)]
  patterns:
    - Zustand persist with skipHydration:true + manual rehydrate() in useEffect root component
    - useShallow from zustand/shallow for array selectors to prevent re-render loops
    - Client Component leaf nodes inside Server Component trees for localStorage-dependent UI

key-files:
  created:
    - lib/store/progress.ts
    - components/progress-hydration.tsx
    - components/lesson-complete-button.tsx
    - components/course-progress-bar.tsx
    - __tests__/lib/progress-store.test.ts
  modified:
    - components/course-sidebar.tsx
    - components/mobile-sidebar-trigger.tsx
    - app/layout.tsx
    - app/courses/page.tsx
    - app/courses/[courseSlug]/page.tsx
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - __tests__/components/course-sidebar.test.tsx

key-decisions:
  - "skipHydration: true in Zustand persist config prevents SSR/client HTML mismatch; ProgressHydration in root layout calls rehydrate() on mount"
  - "useShallow from zustand/shallow used in CourseProgressBar array selector to prevent infinite re-render loops (Zustand v5 removed custom equality from create)"
  - "CourseProgressBar renders null when 0% completed — clean look for new students, avoids empty progress bar"

patterns-established:
  - "Progress store pattern: useProgressStore(s => s.isComplete) — selector returns the function, called inline per lesson"
  - "Completion icons: CheckCircle2 (text-green-500) for complete, Circle (text-muted-foreground) for not-started, size 14, aria-label on icon"

requirements-completed: [PROG-01, PROG-02, PROG-03]

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 2 Plan 01: Zustand Progress Store Summary

**Zustand v5 localStorage progress store with lesson completion toggle, course progress bars on catalog/overview, and sidebar completion icons using skipHydration pattern**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-14T03:37:42Z
- **Completed:** 2026-03-14T03:41:24Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Zustand v5 progress store with persist middleware: markComplete, markIncomplete, isComplete, getCourseProgress with localStorage key 'python-course-progress' and skipHydration:true
- ProgressHydration root component wires rehydrate() on mount; LessonCompleteButton toggles completion state on lesson pages
- CourseProgressBar (hidden at 0%) renders on catalog and course overview pages; sidebar and mobile sheet show CheckCircle2/Circle completion icons
- 51 unit tests pass; `pnpm build` generates 139 static pages with no SSR hydration errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Zustand progress store with localStorage persistence and test suite** - `09a805e` (feat)
2. **Task 2: Wire progress UI into sidebar, catalog, course page, and lesson page** - `b8255f2` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified

- `lib/store/progress.ts` - Zustand v5 persist store: completedLessons state, markComplete/markIncomplete/isComplete/getCourseProgress actions
- `components/progress-hydration.tsx` - Root Client Component calling useProgressStore.persist.rehydrate() on mount
- `components/lesson-complete-button.tsx` - Toggle button reading isComplete, calling markComplete/markIncomplete
- `components/course-progress-bar.tsx` - Progress bar + "N/total completed" text, hidden at 0%, uses useShallow for array selector
- `components/course-sidebar.tsx` - Added CheckCircle2/Circle icons per lesson item from progress store
- `components/mobile-sidebar-trigger.tsx` - Same completion icons as desktop sidebar
- `app/layout.tsx` - Added ProgressHydration inside ThemeProvider before children
- `app/courses/page.tsx` - Added CourseProgressBar to each course card
- `app/courses/[courseSlug]/page.tsx` - Added CourseProgressBar after description paragraph
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` - Added LessonCompleteButton between article and LessonNav
- `__tests__/lib/progress-store.test.ts` - 17 unit tests: markComplete idempotency, markIncomplete no-op, isComplete, getCourseProgress division safety, persist options
- `__tests__/components/course-sidebar.test.tsx` - Extended with 2 completion icon tests using mocked useProgressStore

## Decisions Made

- Used `skipHydration: true` + manual `rehydrate()` in root layout to prevent SSR mismatch (Zustand v5 pattern, documented in research)
- Used `useShallow` from `zustand/shallow` in CourseProgressBar array selector — Zustand v5 removed the custom equality function from `create`, making array selectors prone to infinite re-renders without `useShallow`
- `CourseProgressBar` returns null when `completedCount === 0` — avoids showing an empty/zero progress bar to new students; matches clean UX goal

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Progress tracking fully operational; ready for 02-02 (code runner / Pyodide Web Worker)
- Sidebar icons will automatically reflect completion state as lessons are marked complete
- CourseProgressBar components react to store changes; no additional wiring needed for new lessons
