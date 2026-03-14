---
phase: 12-polish-integration
plan: "01"
subsystem: cross-course-navigation
tags: [components, recommendation, prerequisite, ux]
dependency_graph:
  requires: []
  provides: [CourseRecommendationBanner, PrerequisiteNotice, cross-course-links]
  affects: [lesson-page, course-overview-page]
tech_stack:
  added: []
  patterns: [client-component-dismiss, server-component-callout, conditional-page-wiring]
key_files:
  created:
    - components/course-recommendation-banner.tsx
    - components/prerequisite-notice.tsx
    - __tests__/components/course-recommendation-banner.test.tsx
    - __tests__/components/prerequisite-notice.test.tsx
  modified:
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - app/courses/[courseSlug]/page.tsx
decisions:
  - "CourseRecommendationBanner uses useState dismiss (session-only, no localStorage) per spec"
  - "PrerequisiteNotice is a server component — no client interactivity needed"
  - "notFound() guard preserved in course overview page — Phase 7 removes it"
  - "Banner only shown on last Python lesson (courseSlug=python AND globalLesson.next===null)"
metrics:
  duration: ~8 minutes
  completed: 2026-03-14T18:38:00Z
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  tests_added: 8
---

# Phase 12 Plan 01: Cross-Course Recommendation Banner + Prerequisite Notice Summary

**One-liner:** Dismissable green banner on last Python lesson linking to DE course, plus amber prerequisite callout on DE course overview linking back to Python.

## What Was Built

### Components Created

**`components/course-recommendation-banner.tsx`**
- `'use client'` component with `useState(false)` for session-dismiss
- Green-tinted styling: `bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800`
- GraduationCap icon (lucide-react), heading, body text, Button asChild → Link to `/courses/data-engineering`
- Dismiss button with X icon sets dismissed state → renders `null`
- Export: `CourseRecommendationBanner()`

**`components/prerequisite-notice.tsx`**
- Server component (no `'use client'`)
- Amber-tinted `<aside>`: `bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800`
- BookOpen icon (lucide-react), "Prerequisite: Python Course" heading, body text, Link to `/courses/python`
- Export: `PrerequisiteNotice()`

### Pages Modified

**`app/courses/[courseSlug]/[lessonSlug]/page.tsx`**
- Import: `CourseRecommendationBanner`
- Conditional render after `LessonNav`:
  ```tsx
  {courseSlug === 'python' && globalLesson.next === null && (
    <div className="mt-6">
      <CourseRecommendationBanner />
    </div>
  )}
  ```

**`app/courses/[courseSlug]/page.tsx`**
- Import: `PrerequisiteNotice`
- Conditional render after description `<p>` and before `CourseProgressBar`:
  ```tsx
  {courseSlug === 'data-engineering' && <PrerequisiteNotice />}
  ```
- `notFound()` guard for non-python slugs preserved intact (Phase 7 removes it)

## Test Coverage Added

| File | Tests | Coverage |
|------|-------|----------|
| `__tests__/components/course-recommendation-banner.test.tsx` | 5 | heading render, link href, body text, dismiss hides banner, post-dismiss null |
| `__tests__/components/prerequisite-notice.test.tsx` | 3 | heading render, body text, link href |

**Total new tests: 8**
**Suite result: 286 passed (32 files), 1 pre-existing failure in course-registry.test.ts (unrelated)**

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `components/course-recommendation-banner.tsx` — created
- [x] `components/prerequisite-notice.tsx` — created
- [x] `__tests__/components/course-recommendation-banner.test.tsx` — created
- [x] `__tests__/components/prerequisite-notice.test.tsx` — created
- [x] `app/courses/[courseSlug]/[lessonSlug]/page.tsx` — modified with banner conditional
- [x] `app/courses/[courseSlug]/page.tsx` — modified with prerequisite notice conditional
- [x] Task 1 commit: `5c5d8f9` — feat(12-01): CourseRecommendationBanner component
- [x] Task 2 commit: `ad445e8` — feat(12-01): PrerequisiteNotice component + wire cross-course navigation into pages
- [x] 286 tests pass, 0 new failures introduced
