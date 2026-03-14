---
phase: 07-multi-course-infrastructure
plan: "03"
subsystem: homepage
tags: [homepage, catalog, hero, multi-course, client-component, server-component]

requires:
  - phase: 07-multi-course-infrastructure
    plan: "01"
    provides: "lib/course-registry.ts with getAllRegisteredCourses(), getCourseData(slug), CourseRegistryEntry"
  - phase: 07-multi-course-infrastructure
    plan: "02"
    provides: "lib/store/progress.ts v2, getCourseProgress(courseSlug, totalLessons)"

provides:
  - "components/homepage/course-catalog-card.tsx: client component — per-course card with color accent, lesson count, conditional progress bar"
  - "components/homepage/course-catalog.tsx: server component — fetches all registered courses, renders grid of CourseCatalogCards"
  - "app/page.tsx: homepage with JustLearn hero + CourseCatalog (not python-specific SectionCardsGrid)"
  - "components/homepage/hero-section.tsx: platform-scoped copy — 'Learn Programming and Data Skills', no courseSlug prop"
  - "app/courses/page.tsx: redirect changed from /courses/python to / (homepage is now the catalog)"
  - "components/header-client.tsx: 'Start Learning' CTA href changed from /courses/python to /courses"

affects:
  - "Any new course added to COURSE_REGISTRY automatically appears in homepage catalog (zero component changes needed)"
  - "section-cards-grid.tsx: no longer used by homepage; still used by Python course overview page — not deleted"

tech-stack:
  added: []
  patterns:
    - "Server component (CourseCatalog) computes lesson counts server-side, passes as props to client cards"
    - "Client component (CourseCatalogCard) reads per-course progress from useProgressStore"
    - "Progress bar hidden when getCourseProgress returns 0 — clean view for new students"

key-files:
  created:
    - components/homepage/course-catalog-card.tsx
    - components/homepage/course-catalog.tsx
    - __tests__/components/course-catalog.test.tsx
  modified:
    - app/page.tsx
    - components/homepage/hero-section.tsx
    - app/courses/page.tsx
    - components/header-client.tsx
    - __tests__/components/hero-section.test.tsx

key-decisions:
  - "CourseCatalog is a server component — lesson counts computed at build time, no client-side fetching"
  - "CourseCatalogCard is a client component — reads Zustand progress store, which is client-only (localStorage)"
  - "/courses redirects to / (homepage) not to a dedicated catalog page — avoids duplication; homepage IS the catalog"
  - "Hero section courseSlug prop removed — hero is now platform-scoped, not course-specific"
  - "Progress bar shown only when getCourseProgress > 0 — clean UX for first-time visitors"

requirements-completed:
  - INFRA-04
  - INFRA-06

duration: 10min
completed: "2026-03-15"
---

# Phase 7 Plan 03: Homepage Catalog + Entry-Point Cleanup Summary

**Multi-course catalog homepage with CourseCatalog server component, platform-scoped hero, and updated /courses redirect and header CTA**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-15T00:12:00Z
- **Completed:** 2026-03-15T00:22:00Z
- **Tasks:** 2 (both TDD)
- **Files modified:** 7

## Accomplishments

- Created `components/homepage/course-catalog-card.tsx` (client component): renders color accent stripe, title, description, lesson count, and a conditional progress bar via `getCourseProgress` from `useProgressStore` — bar only shows when progress > 0
- Created `components/homepage/course-catalog.tsx` (server component): `getAllRegisteredCourses()` + `getCourseData()` called server-side to build `courseCardData[]`; renders a 2-column grid of `CourseCatalogCard` components
- Updated `app/page.tsx`: imports `CourseCatalog` instead of `SectionCardsGrid`; removes `getUnifiedCourse()` call; passes no `courseSlug` to `HeroSection`; updates metadata to platform-scoped copy
- Updated `components/homepage/hero-section.tsx`: removed `courseSlug` prop entirely; copy updated to "Learn Programming and Data Skills"; badge updated to "Free · 2 courses · Learn at your own pace"; CTAs are "Browse Courses → /courses" and "Start Python → /courses/python"
- Updated `app/courses/page.tsx`: redirect changed from `/courses/python` to `/` — the homepage is now the catalog, making `/courses` a clean pass-through
- Updated `components/header-client.tsx`: "Start Learning" CTA href changed from `/courses/python` to `/courses`
- Added 10 new tests in `__tests__/components/course-catalog.test.tsx` (CourseCatalogCard + CourseCatalog behaviors)
- Updated `__tests__/components/hero-section.test.tsx`: 6 tests, all updated to match new copy; `courseSlug` prop removed from renders

## Task Commits

1. **Task 1: Create CourseCatalogCard and CourseCatalog components** - `98bcd74` (feat)
2. **Task 2: Update homepage, hero, /courses redirect, and header CTA** - `9701fc4` (feat)

_Both tasks followed TDD: RED (failing tests) → GREEN (implementation) → commit_

## Files Created/Modified

- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/components/homepage/course-catalog-card.tsx` — NEW: client component, color accent, lesson count, conditional progress bar
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/components/homepage/course-catalog.tsx` — NEW: server component, grid of CourseCatalogCards
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/__tests__/components/course-catalog.test.tsx` — NEW: 10 tests for CourseCatalogCard and CourseCatalog
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/app/page.tsx` — CourseCatalog replaces SectionCardsGrid; HeroSection without courseSlug; updated metadata
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/components/homepage/hero-section.tsx` — platform copy, courseSlug prop removed, CTA hrefs updated
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/app/courses/page.tsx` — redirect /courses → /
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/components/header-client.tsx` — Start Learning href → /courses
- `/Users/tindang/workspaces/tind-repo/lessons/python-beginer/__tests__/components/hero-section.test.tsx` — updated tests match new copy, courseSlug removed

## Decisions Made

- **Server/client split for CourseCatalog**: `CourseCatalog` is a server component (data fetching at build time), `CourseCatalogCard` is a client component (Zustand store access). This pattern matches Next.js App Router best practices — no unnecessary client bundles for data that can be computed statically.
- **/courses redirects to / instead of a dedicated catalog page**: Having both a catalog page at `/courses` and the homepage show the same catalog would be duplication. The homepage IS the catalog; `/courses` is a convenience redirect for the header CTA.
- **courseSlug prop removed from HeroSection**: The hero is now platform-scoped, not course-specific. Removing the prop enforces this at the type level — no component can accidentally pass a course-specific slug.
- **Progress bar threshold at getCourseProgress > 0**: Zero progress shows a clean card; progress bar appears only once the student has started. Consistent with the SectionCard pattern in section-cards-grid.tsx.

## Verification Results

- `pnpm vitest run`: 267 tests pass (31 test files) — up 11 from pre-task state (256)
- `pnpm tsc --noEmit`: No new errors from changed production files. Pre-existing `toBeInTheDocument` type errors in `__tests__/components/` are out of scope (documented in 07-01-SUMMARY.md).
- `pnpm build`: Succeeds — `/` is static (○), `/courses` is 121B redirect, `/courses/python` and `/courses/data-engineering` are SSG pages. 113 total routes.

## Deviations from Plan

None — plan executed exactly as written.

---
*Phase: 07-multi-course-infrastructure*
*Completed: 2026-03-15*

## Self-Check: PASSED

- FOUND: components/homepage/course-catalog-card.tsx
- FOUND: components/homepage/course-catalog.tsx
- FOUND: __tests__/components/course-catalog.test.tsx
- FOUND: app/page.tsx (updated)
- FOUND: components/homepage/hero-section.tsx (updated)
- FOUND: app/courses/page.tsx (updated)
- FOUND: components/header-client.tsx (updated)
- FOUND: commit 98bcd74 (Task 1)
- FOUND: commit 9701fc4 (Task 2)
