---
phase: 01-content-reading-shell
plan: "02"
subsystem: ui
tags: [nextjs, mdx, shiki, tailwindcss, shadcn, typescript, ssg, app-router]

# Dependency graph
requires:
  - phase: 01-content-reading-shell/01-01
    provides: "lib/content.ts with getAllCourses/getCourse/getLesson exports and MDX pipeline with Shiki"
provides:
  - "Course catalog page at /courses rendering all 12 courses as shadcn Cards"
  - "Course overview page at /courses/[courseSlug] listing all lessons with lesson number, title, duration, level"
  - "Lesson page at /courses/[courseSlug]/[lessonSlug] rendering full MDX content with Shiki syntax highlighting"
  - "All 122 lesson routes + 12 course routes + catalog statically generated at build time"
  - "Breadcrumb nav and prev/next lesson navigation on lesson pages"
affects:
  - 01-03-navigation
  - all subsequent plans in phase 01

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js 15 async params: await params in Server Components (not destructuring directly)"
    - "Dynamic MDX import via @/courses/${courseSlug}/${lessonSlug}.md using @ alias to project root"
    - "generateStaticParams + dynamicParams=false for fully static SSG routes"
    - "flatMap to generate all [courseSlug]/[lessonSlug] param combinations from getAllCourses()"

key-files:
  created:
    - "app/courses/page.tsx — Course catalog with responsive 3-col grid of shadcn Cards, lesson count and level badges, SEO metadata"
    - "app/courses/[courseSlug]/page.tsx — Course overview listing all lessons; generateStaticParams for 12 course routes; prev/next navigation"
    - "app/courses/[courseSlug]/[lessonSlug]/page.tsx — Lesson page with dynamic MDX import, prose article, breadcrumb, prev/next nav, generateMetadata"
  modified:
    - "app/courses/page.tsx — replaced stub with real implementation"

key-decisions:
  - "Dynamic MDX import path: @/courses/${courseSlug}/${lessonSlug}.md — @ alias maps to project root so this resolves correctly"
  - "Next.js 15 async params: must await params before destructuring (breaking change from Next.js 14)"
  - "Lesson page uses max-w-[65ch] prose for readable line length matching research spec"

patterns-established:
  - "All route pages are Server Components — no 'use client' directive"
  - "generateStaticParams returns array of param objects; dynamicParams=false rejects any non-pregenerated slug"
  - "Course/lesson metadata fetched inline via getCourse/getLesson (no separate API layer needed for SSG)"

requirements-completed:
  - CONT-02
  - CONT-03

# Metrics
duration: 5min
completed: "2026-03-14"
---

# Phase 1 Plan 02: Route Pages Summary

**Three statically generated route pages serving 139 total pages: /courses catalog, /courses/[courseSlug] overview, and /courses/[courseSlug]/[lessonSlug] MDX lesson with Shiki syntax highlighting**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-14T02:38:34Z
- **Completed:** 2026-03-14T02:43:00Z
- **Tasks:** 2
- **Files modified:** 3 created, 1 modified

## Accomplishments
- Course catalog at /courses renders all 12 courses as shadcn Card components in a responsive 3-column grid with level badges, lesson counts, and SEO metadata
- Course overview pages at /courses/[courseSlug] list all lessons with lesson number, title, duration, and level badge; 12 routes statically generated
- Lesson pages at /courses/[courseSlug]/[lessonSlug] dynamically import .md files via @/courses/ alias and render them as prose articles with Shiki-highlighted code; all 122 lesson routes statically generated
- pnpm build generates 139 total static pages with zero errors or warnings

## Task Commits

Each task was committed atomically:

1. **Task 1: Course catalog and course overview pages** - `14d793a` (feat)
2. **Task 2: Lesson page with MDX rendering and static generation** - `50c80d0` (feat)

**Plan metadata:** (see final commit after SUMMARY)

## Files Created/Modified
- `app/courses/page.tsx` — Course catalog: getAllCourses(), responsive grid of shadcn Cards with level/lesson-count badges
- `app/courses/[courseSlug]/page.tsx` — Course overview: lesson list with numbers, durations, level badges; generateStaticParams for 12 routes
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` — Lesson page: dynamic MDX import, prose article, breadcrumb nav, prev/next navigation, generateMetadata

## Decisions Made
- **@ alias import path for MDX**: tsconfig `@/*` maps to `./` (project root), so `@/courses/${courseSlug}/${lessonSlug}.md` resolves to the `courses/` directory at root — no symlinks or relative paths needed
- **Next.js 15 async params**: Must `await params` before destructuring `courseSlug`/`lessonSlug` — this is a breaking change from Next.js 14 handled correctly
- **prose max-w-[65ch]**: Applied on both the outer container and the article for consistent readable line width

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - first build attempt succeeded for both task verifications.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 139 routes statically generated and verified via pnpm build
- MDX pipeline with Shiki dual-theme syntax highlighting active on lesson pages
- CopyButton from Plan 01 mdx-components.tsx already wired — appears automatically on code blocks
- Ready for Plan 03: navigation shell (header, sidebar, theme toggle layout)

---
*Phase: 01-content-reading-shell*
*Completed: 2026-03-14*

## Self-Check: PASSED

- FOUND: app/courses/page.tsx
- FOUND: app/courses/[courseSlug]/page.tsx
- FOUND: app/courses/[courseSlug]/[lessonSlug]/page.tsx
- FOUND commit 14d793a (Task 1)
- FOUND commit 50c80d0 (Task 2)
