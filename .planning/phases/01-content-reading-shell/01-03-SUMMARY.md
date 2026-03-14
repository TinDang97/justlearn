---
phase: 01-content-reading-shell
plan: "03"
subsystem: ui
tags: [nextjs, react, tailwindcss, shadcn, typescript, app-router, vitest, testing-library]

# Dependency graph
requires:
  - phase: 01-content-reading-shell/01-02
    provides: "Course catalog, course overview, and lesson pages with MDX rendering and Shiki syntax highlighting"
provides:
  - "Sticky site header with logo link and dark/light ThemeToggle on all pages"
  - "Desktop course sidebar (w-72, sticky top-16) with active lesson highlight via usePathname"
  - "Mobile Sheet drawer with lesson list, closes on link click"
  - "3-level LessonBreadcrumb: Courses > Course Title > Lesson Title using shadcn Breadcrumb"
  - "Prev/next LessonNav with lesson titles and ChevronLeft/ChevronRight icons"
  - "Course layout (layout.tsx) with sidebar + flex-1 min-w-0 main content area"
  - "Medium-quality prose: max-w-[65ch], 1.75 line-height, code blocks with overflow-x auto"
  - "@testing-library/jest-dom configured with vitest setupFiles"
affects:
  - 02-interactive-python
  - all subsequent phases

# Tech tracking
tech-stack:
  added:
    - "@testing-library/jest-dom 6.9.1 — DOM matchers for vitest"
  patterns:
    - "Client Component sidebar reads usePathname() to determine active lesson without server-side prop drilling"
    - "Course layout is a Server Component that fetches course data and passes to Client Component children"
    - "SiteHeader in root layout (app/layout.tsx) ensures header on all pages; course layout adds sidebar below it"
    - "vitest.setup.ts with expect.extend(matchers) pattern for jest-dom DOM assertions"

key-files:
  created:
    - "components/site-header.tsx — sticky header with logo link and ThemeToggle, used in root layout"
    - "components/course-sidebar.tsx — 'use client' desktop sidebar with usePathname active highlight"
    - "components/mobile-sidebar-trigger.tsx — 'use client' Sheet drawer for mobile, closes on navigation"
    - "components/lesson-breadcrumb.tsx — 3-level shadcn Breadcrumb component"
    - "components/lesson-nav.tsx — prev/next navigation with lesson titles using shadcn Button"
    - "app/courses/[courseSlug]/layout.tsx — Server Component wrapping CourseSidebar + MobileSidebarTrigger + main"
    - "__tests__/components/course-sidebar.test.tsx — 6 tests for lesson links and active highlight"
    - "__tests__/components/lesson-breadcrumb.test.tsx — 6 tests for 3-level breadcrumb structure"
    - "vitest.setup.ts — jest-dom matchers setup"
  modified:
    - "app/layout.tsx — added SiteHeader above ThemeProvider children"
    - "app/courses/[courseSlug]/[lessonSlug]/page.tsx — replaced inline nav with LessonBreadcrumb + LessonNav"
    - "vitest.config.ts — added setupFiles pointing to vitest.setup.ts"
    - "package.json — added @testing-library/jest-dom devDependency"

key-decisions:
  - "SiteHeader placed in root layout.tsx (not course layout) so it appears on catalog and course overview pages too; course layout only adds sidebar layer"
  - "CourseSidebar is a Client Component using usePathname() for active highlight — avoids server-side currentSlug prop threading through layout"
  - "Lesson page prose uses max-w-none on article (not max-w-[65ch]) because the parent container already constrains width at 65ch"
  - "@testing-library/jest-dom installed and wired via vitest.setup.ts using expect.extend(matchers) — not the bare import which fails without global expect"

patterns-established:
  - "Client Components for interactive navigation (sidebar, mobile drawer) — Server Components for data fetching (layout)"
  - "Flex layout pattern: sidebar (w-72 shrink-0) + flex-1 min-w-0 main — critical for preventing code block horizontal overflow"
  - "Sheet drawer closes on link click via onClick={() => setOpen(false)} on each Link"

requirements-completed:
  - LAYO-01
  - LAYO-02
  - LAYO-03
  - LAYO-04
  - LAYO-05
  - LAYO-06

# Metrics
duration: 15min
completed: "2026-03-14"
---

# Phase 1 Plan 03: Reading Layout Shell Summary

**Sticky site header, desktop sidebar with active lesson highlight, mobile Sheet drawer, 3-level breadcrumb, prev/next lesson nav, and 32 passing tests with jest-dom matchers configured**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T02:43:20Z
- **Completed:** 2026-03-14T02:58:00Z
- **Tasks:** 1 (Task 2 was checkpoint:human-verify, auto-approved)
- **Files modified:** 4 modified, 9 created

## Accomplishments
- Complete reading shell: site header with ThemeToggle visible on all pages via root layout
- Desktop sidebar (w-72, sticky) shows all lessons with active lesson highlighted via usePathname(); mobile Sheet drawer with same list, closes on link click
- LessonBreadcrumb renders 3-level path (Courses > Course > Lesson) using shadcn Breadcrumb components
- LessonNav shows prev/next lessons with titles and Chevron icons, null-safe for first/last lessons
- Course layout uses `flex-1 min-w-0` pattern to prevent horizontal overflow at 375px
- @testing-library/jest-dom configured with vitest; 32 tests pass (6 sidebar, 6 breadcrumb, 20 content)
- pnpm build generates 139 static pages successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Build site header, course layout with sidebar, and all navigation components** - `954548d` (feat)

**Plan metadata:** (see final commit after SUMMARY)

## Files Created/Modified
- `components/site-header.tsx` — Sticky h-16 header with logo link (/courses) and ThemeToggle
- `components/course-sidebar.tsx` — 'use client', hidden lg:block, usePathname for active state
- `components/mobile-sidebar-trigger.tsx` — 'use client', Sheet with side="left", closes on link click
- `components/lesson-breadcrumb.tsx` — shadcn Breadcrumb with 3 levels, Link via asChild
- `components/lesson-nav.tsx` — prev/next with Button + ChevronLeft/ChevronRight, null-safe
- `app/courses/[courseSlug]/layout.tsx` — Server Component: getCourse() + CourseSidebar + MobileSidebarTrigger
- `app/layout.tsx` — Added SiteHeader import and render above ThemeProvider children
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` — Replaced inline nav with LessonBreadcrumb + LessonNav
- `__tests__/components/course-sidebar.test.tsx` — 6 tests: link count, titles, active class, hrefs
- `__tests__/components/lesson-breadcrumb.test.tsx` — 6 tests: 3 levels, link hrefs, aria-current
- `vitest.setup.ts` — expect.extend(matchers) from @testing-library/jest-dom/matchers
- `vitest.config.ts` — Added setupFiles: ['./vitest.setup.ts']

## Decisions Made
- **SiteHeader in root layout**: Ensures the header appears on /courses catalog and /courses/[courseSlug] overview pages, not just on lesson pages. Course layout only adds the sidebar layer below the existing header.
- **CourseSidebar as Client Component**: Using usePathname() is simpler than threading currentSlug as prop through the course layout down to the sidebar. The Research Pattern 7 recommendation validated this approach.
- **jest-dom via expect.extend(matchers)**: Bare `import '@testing-library/jest-dom'` fails because the module tries to access the global `expect`. Using `import * as matchers from '@testing-library/jest-dom/matchers'; expect.extend(matchers)` works correctly in vitest context.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added @testing-library/jest-dom and vitest setup**
- **Found during:** Task 1 (running tests)
- **Issue:** Tests using `toBeInTheDocument`, `toHaveClass`, `toHaveAttribute` failed — these are jest-dom matchers not available by default in vitest
- **Fix:** Installed `@testing-library/jest-dom`, created `vitest.setup.ts` with `expect.extend(matchers)`, added `setupFiles` to vitest.config.ts
- **Files modified:** vitest.setup.ts (created), vitest.config.ts, package.json, pnpm-lock.yaml
- **Verification:** All 32 tests pass after fix
- **Committed in:** 954548d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical test infrastructure)
**Impact on plan:** Required for tests to pass. No scope creep.

## Issues Encountered
- Initial `import '@testing-library/jest-dom'` failed with `expect is not defined` — resolved by using explicit `expect.extend(matchers)` pattern

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete reading shell with all navigation components, responsive layout, and dark mode
- All 139 static routes build and generate correctly
- 32 tests pass including 12 new component tests
- Ready for Phase 2: Interactive Python (Pyodide Web Worker integration)

---
*Phase: 01-content-reading-shell*
*Completed: 2026-03-14*

## Self-Check: PASSED

- FOUND: components/site-header.tsx
- FOUND: components/course-sidebar.tsx
- FOUND: components/mobile-sidebar-trigger.tsx
- FOUND: components/lesson-breadcrumb.tsx
- FOUND: components/lesson-nav.tsx
- FOUND: app/courses/[courseSlug]/layout.tsx
- FOUND: __tests__/components/course-sidebar.test.tsx
- FOUND: __tests__/components/lesson-breadcrumb.test.tsx
- FOUND: vitest.setup.ts
- FOUND: .planning/phases/01-content-reading-shell/01-03-SUMMARY.md
- FOUND commit 954548d (Task 1)
