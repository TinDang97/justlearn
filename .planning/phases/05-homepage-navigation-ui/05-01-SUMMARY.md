---
phase: 05-homepage-navigation-ui
plan: 01
subsystem: ui
tags: [next.js, react, tailwind, zustand, vitest, react-testing-library]

# Dependency graph
requires:
  - phase: 04-course-data-foundation
    provides: getUnifiedCourse(), Section type, LessonMeta with sectionSlug, useProgressStore with python key

provides:
  - useScrolled hook (lib/hooks/use-scrolled.ts) — scroll threshold detection with cleanup
  - HeaderClient component — conditional Start Learning CTA, scroll-triggered data-scrolled attribute
  - SiteHeader refactored — server shell with JustLearn wordmark linking to /
  - HeroSection component — branded hero with overline badge, h1, subheading, dual CTAs
  - SectionCardsGrid component — 3-col grid with progress bars per section
  - Homepage at / — replaces redirect, renders hero + section cards from getUnifiedCourse()
  - LessonBreadcrumb updated — added sectionSlug/sectionTitle props for Course > Section > Lesson hierarchy

affects:
  - 05-02-PLAN (sidebar, breadcrumb call sites consume sectionSlug)
  - 06-lesson-reading-experience (header scroll behavior baseline established)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component shell + 'use client' sub-component for mixed SSR/client needs
    - useScrolled hook with passive listener and threshold detection
    - data-scrolled attribute on header element for CSS-based scroll blur (no JS class toggling in render)
    - Conditional UI based on usePathname for pathname-dependent rendering
    - Server component data fetch (getUnifiedCourse at SSG time) + client component for progress (useProgressStore)

key-files:
  created:
    - lib/hooks/use-scrolled.ts
    - components/header-client.tsx
    - components/homepage/hero-section.tsx
    - components/homepage/section-cards-grid.tsx
    - __tests__/lib/use-scrolled.test.ts
    - __tests__/components/site-header.test.tsx
    - __tests__/components/hero-section.test.tsx
    - __tests__/components/section-cards-grid.test.tsx
  modified:
    - components/site-header.tsx
    - components/lesson-breadcrumb.tsx
    - app/page.tsx

key-decisions:
  - "useScrolled hook sets data-scrolled attribute on nearest <header> ancestor via useEffect — keeps header server-rendered while enabling CSS-based backdrop-blur/border-b via Tailwind [&[data-scrolled]] selector"
  - "HeaderClient uses usePathname for conditional Start Learning CTA — only shows on pathname === '/'"
  - "SectionCardsGrid is 'use client' because it reads useProgressStore for per-section progress bars"
  - "LessonBreadcrumb updated with sectionSlug/sectionTitle early (pre-planned test already existed) — auto-fixed Rule 2"

patterns-established:
  - "Pattern: Server header shell + client sub-component — SiteHeader (server) + HeaderClient ('use client') separates SSR-safe static content from scroll/pathname-dependent interactivity"
  - "Pattern: SSG data fetch on homepage — getUnifiedCourse() called directly in page.tsx server component, data passed as props to client SectionCardsGrid"

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04]

# Metrics
duration: 12min
completed: 2026-03-14
---

# Phase 5 Plan 01: Homepage + Navigation UI Summary

**JustLearn homepage at / with hero section, 12-section card grid, and scroll-activated header blur — replacing the redirect with a full branded landing experience**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-14T10:54:00Z
- **Completed:** 2026-03-14T11:00:00Z
- **Tasks:** 2
- **Files modified:** 12 (3 modified, 9 created)

## Accomplishments

- Homepage at / renders hero with "Learn Python from Zero to Confident" h1, overline badge, and dual CTAs to /courses/python
- Section cards grid shows all 12 sections with zero-padded numbers, lesson counts, and progress bars when lessons are completed
- SiteHeader refactored: JustLearn wordmark links to /, conditional "Start Learning" pill button appears only on homepage, scroll past 10px triggers backdrop-blur + border-b via data-scrolled attribute
- 28 new tests (161 total, all passing); build succeeds with 128 static pages

## Task Commits

1. **Task 1: useScrolled hook + SiteHeader refactor** - `dab9425` (feat)
2. **Task 2: Homepage with hero section and section cards grid** - `46eb467` (feat, included in 05-02 commit)

## Files Created/Modified

- `lib/hooks/use-scrolled.ts` - passive scroll listener hook, returns boolean when scrollY > threshold
- `components/header-client.tsx` - 'use client', usePathname for CTA, useScrolled for data-scrolled on header
- `components/site-header.tsx` - server shell with JustLearn → / wordmark, renders HeaderClient
- `components/homepage/hero-section.tsx` - overline badge, h1, subheading, dual CTA buttons
- `components/homepage/section-cards-grid.tsx` - 'use client', 3-col grid with progress bars from useProgressStore
- `app/page.tsx` - server component, calls getUnifiedCourse(), renders HeroSection + SectionCardsGrid + metadata
- `components/lesson-breadcrumb.tsx` - updated to accept sectionSlug/sectionTitle, renders Course > Section > Lesson
- `__tests__/lib/use-scrolled.test.ts` - 6 test cases for hook
- `__tests__/components/site-header.test.tsx` - 6 test cases for SiteHeader + HeaderClient
- `__tests__/components/hero-section.test.tsx` - 5 test cases for HeroSection
- `__tests__/components/section-cards-grid.test.tsx` - 7 test cases for SectionCardsGrid

## Decisions Made

- `data-scrolled` attribute set via `useEffect` on the `<header>` element — allows CSS-only styling via Tailwind `[&[data-scrolled]]` selectors without making the `<header>` a client component
- Both hero CTAs ("Start the Course" and "Browse Lessons") link to `/courses/python` as recommended by research open question
- `SectionCardsGrid` is `'use client'` because progress is Zustand-powered (localStorage, client-only)
- `HeroSection` is a server component (no interactivity needed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated LessonBreadcrumb with sectionSlug/sectionTitle props**
- **Found during:** Task 2 (section cards grid implementation)
- **Issue:** lesson-breadcrumb.test.tsx (written in a prior Phase 5 planning session) already tested for sectionSlug/sectionTitle props that the component didn't have — causing 3 test failures
- **Fix:** Updated LessonBreadcrumb to accept sectionSlug and sectionTitle props and render the 3-level Course > Section > Lesson breadcrumb hierarchy
- **Files modified:** components/lesson-breadcrumb.tsx
- **Verification:** All 6 lesson-breadcrumb tests pass, build succeeds
- **Committed in:** 46eb467

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical implementation for pre-planned test)
**Impact on plan:** Auto-fix was necessary — pre-planned test was already committed; not fixing would have left the test suite in a broken state. No scope creep.

## Issues Encountered

None — plan executed cleanly. The lesson-breadcrumb deviation was pre-planned work that needed implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Homepage fully functional at /
- SiteHeader with conditional CTA and scroll behavior ready across all pages
- LessonBreadcrumb upgraded to 3-level hierarchy (Course > Section > Lesson) — ready for Phase 5 plan 02
- All 161 tests pass, build produces 128 static pages

## Self-Check: PASSED

All created files confirmed present. Task commits dab9425 and 46eb467 verified in git history. 161 tests pass. Build succeeds with 128 static pages.

---
*Phase: 05-homepage-navigation-ui*
*Completed: 2026-03-14*
