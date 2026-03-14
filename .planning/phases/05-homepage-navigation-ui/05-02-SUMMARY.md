---
phase: 05-homepage-navigation-ui
plan: 02
subsystem: ui
tags: [accordion, collapsible, radix-ui, sidebar, breadcrumb, course-overview, section-grouped]

# Dependency graph
requires:
  - phase: 04-course-data-foundation
    provides: getUnifiedCourse(), Section type, sectionSlug on LessonMeta
provides:
  - CourseOverviewAccordion client component with section list and per-section progress
  - Section-grouped CourseSidebar with Collapsible expand/collapse per section
  - Section-grouped MobileSidebarTrigger (Sheet) with identical layout
  - Updated LessonBreadcrumb with sectionSlug/sectionTitle props (Python Course > Section > Lesson)
  - Updated layout.tsx passing sections: Section[] to both sidebar components
  - Updated lesson page resolving parent section and passing to LessonBreadcrumb
affects:
  - 06-lesson-reading-experience
  - any phase touching course navigation or breadcrumbs

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Accordion.Root (radix-ui) for course overview with defaultValue auto-selecting first incomplete section
    - Collapsible.Root (radix-ui) per section in sidebar, open state initialized by active lesson
    - Server Component fetches data → passes to 'use client' accordion/sidebar child
    - Section.slug used as stable key and anchor target (#sectionSlug in breadcrumb href)

key-files:
  created:
    - components/course-overview-accordion.tsx
    - __tests__/components/course-overview-accordion.test.tsx
  modified:
    - app/courses/[courseSlug]/page.tsx
    - app/courses/[courseSlug]/layout.tsx
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - components/course-sidebar.tsx
    - components/mobile-sidebar-trigger.tsx
    - components/lesson-breadcrumb.tsx
    - __tests__/components/course-sidebar.test.tsx
    - __tests__/components/lesson-breadcrumb.test.tsx

key-decisions:
  - "CourseOverviewAccordion extracted as separate client component file (not inlined in page.tsx) for testability"
  - "Sidebar section open/closed state initialized from active lesson at mount via useState initializer; onChange toggles individual sections"
  - "LessonBreadcrumb now renders Python Course > Section > Lesson (dropped top-level Courses link since /courses no longer exists as a catalog)"
  - "layout.tsx restricts to courseSlug=python via notFound() guard — only unified course is supported"

patterns-established:
  - "Section-grouped navigation: each Section gets a Collapsible.Root with open state determined by active pathname"
  - "Active section detection: sections.find(s => s.lessons.some(l => pathname === /courses/{courseSlug}/{l.slug}))"

requirements-completed: [STRUCT-02, STRUCT-03, STRUCT-05]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 5 Plan 02: Course Overview Accordion, Section-Grouped Sidebar, and Updated Breadcrumbs Summary

**Accordion course overview at /courses/python with 12 collapsible sections, section-grouped Collapsible sidebar (desktop + mobile), and 3-level breadcrumbs (Python Course > Section > Lesson) using Radix UI**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T10:55:00Z
- **Completed:** 2026-03-14T10:59:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Course overview at /courses/python now renders an Accordion with all 12 sections, per-section lesson count, progress text (X/Y), and first incomplete section auto-expanded by default
- Sidebar and mobile sheet rewritten with Collapsible per section; active lesson's section opens automatically, others collapse
- Breadcrumb updated from Courses > Course > Lesson to Python Course > Section > Lesson with anchor link to section
- All 161 tests pass; build compiles 128 static pages with no TypeScript errors

## Task Commits

Each TDD task committed atomically (RED → GREEN):

1. **Task 1 RED: Course overview accordion tests** - `44c6d9a` (test)
2. **Task 1 GREEN: CourseOverviewAccordion component + page rewrite** - `a58c7c0` (feat)
3. **Task 2 RED: Sidebar + breadcrumb updated tests** - `66489ae` (test)
4. **Task 2 GREEN: Section-grouped sidebar, breadcrumb, layout, lesson page** - `46eb467` (feat)

## Files Created/Modified

- `components/course-overview-accordion.tsx` - Client component with Accordion.Root, per-section Accordion.Item showing title, lesson count, progress, auto-expands first incomplete section
- `app/courses/[courseSlug]/page.tsx` - Rewritten to use getUnifiedCourse() and CourseOverviewAccordion; generateStaticParams returns only python
- `app/courses/[courseSlug]/layout.tsx` - Updated to use getUnifiedCourse(), pass sections to both sidebar components, guard non-python slugs with notFound()
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` - Resolves parent section via getUnifiedCourse().sections.find(), passes sectionSlug/sectionTitle to LessonBreadcrumb
- `components/course-sidebar.tsx` - Rewritten with Collapsible per section; active section auto-expands; props changed to sections: Section[]
- `components/mobile-sidebar-trigger.tsx` - Rewritten with identical section-grouped layout; props changed to sections: Section[]
- `components/lesson-breadcrumb.tsx` - Added sectionSlug + sectionTitle props; renders Python Course > Section > Lesson with anchor links
- `__tests__/components/course-overview-accordion.test.tsx` - New tests covering section rendering, lesson counts, hrefs, progress text
- `__tests__/components/course-sidebar.test.tsx` - Updated to test sections: Section[] prop, active section expansion, collapsed sections
- `__tests__/components/lesson-breadcrumb.test.tsx` - Updated to test 3-level breadcrumb with sectionSlug/sectionTitle

## Decisions Made

- Extracted CourseOverviewAccordion to its own file (`components/course-overview-accordion.tsx`) instead of inlining in page.tsx — enables isolated unit testing
- Sidebar section state initialized with `useState(() => {...})` initializer that reads the active pathname — ensures correct open/closed state on first render without useEffect
- LessonBreadcrumb dropped the top-level "Courses" link (no /courses catalog page in unified course design) and uses section anchor link (`/courses/python#sectionSlug`)
- layout.tsx uses `notFound()` guard for non-python courseSlug — the layout only serves the unified course

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Course navigation (overview, sidebar, mobile, breadcrumb) fully migrated to unified section-based structure
- Phase 6 (lesson reading experience) can build on the stable lesson page layout established here
- LessonBreadcrumb now provides section context which Phase 6 ToC may also leverage

---
*Phase: 05-homepage-navigation-ui*
*Completed: 2026-03-14*
