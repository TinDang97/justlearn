---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: JustLearn UX Overhaul
status: planning
stopped_at: Completed 06-lesson-reading-toc-highlighting-practice/06-01-PLAN.md
last_updated: "2026-03-14T11:11:37.173Z"
last_activity: 2026-03-14 — v1.1 roadmap created, Phase 4 is next
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 16
  completed_plans: 13
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification
**Current focus:** Phase 4 — Course Data Foundation

## Current Position

Phase: 4 of 6 (Course Data Foundation)
Plan: 0 of 2 in current phase
Status: Ready to plan
Last activity: 2026-03-14 — v1.1 roadmap created, Phase 4 is next

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v1.1)
- Average duration: — min
- Total execution time: — hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| v1.1 Phase 4 | 0/2 | — | — |
| v1.1 Phase 5 | 0/2 | — | — |
| v1.1 Phase 6 | 0/4 | — | — |

*Updated after each plan completion*
| Phase 04-course-data-foundation P01 | 8 | 1 tasks | 2 files |
| Phase 04-course-data-foundation P02 | 2 | 2 tasks | 5 files |
| Phase 05-homepage-navigation-ui P02 | 15 | 2 tasks | 9 files |
| Phase 05-homepage-navigation-ui P01 | 12 | 2 tasks | 12 files |
| Phase 06-lesson-reading-toc-highlighting-practice P01 | 15 | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1-roadmap]: Virtual consolidation via lib/section-map.ts — no file moves in courses/ directory
- [v1.1-roadmap]: STRUCT-04 Zustand migration MUST land as first commit in Phase 4 — no recovery path if missed
- [v1.1-roadmap]: Lesson chunking (CHUNK-*) and PRACT-* placed in Phase 6 after reading experience baseline
- [v1.1-roadmap]: Stay on Webpack — never add --turbo; rehype-pretty-code is Turbopack-incompatible
- [v1.1-roadmap]: lib/notebook-urls.ts keeps 12-key approach resolved by sourceCourseSlug (verify at Phase 4 start)
- [Phase 04-course-data-foundation]: mockPersistStorage adapter needed in migration tests: ESM hoisting causes store to capture JSDOM localStorage before vi.stubGlobal; setOptions() in beforeEach rebinds to mock
- [Phase 04-course-data-foundation]: Empty v0 state migrates to completedLessons: {} (no python key) — avoids phantom python key for fresh students
- [Phase 04-course-data-foundation]: SECTION_MAP is a TypeScript constant — no gray-matter, no frontmatter parsing
- [Phase 04-course-data-foundation]: sourceCourseSlug and sectionSlug added to parseLessonMeta() so all LessonMeta callers get both fields
- [Phase 04-course-data-foundation]: getUnifiedCourse() must not modify getAllCourses() — existing routes still call getCourse(oldSlug) until Phase 5
- [Phase 05-homepage-navigation-ui]: CourseOverviewAccordion extracted as separate client component file for testability
- [Phase 05-homepage-navigation-ui]: LessonBreadcrumb renders Python Course > Section > Lesson — dropped top-level Courses link since /courses no longer exists as catalog
- [Phase 05-homepage-navigation-ui]: layout.tsx restricts to courseSlug=python via notFound() guard — only unified course supported
- [Phase 05-01]: useScrolled hook sets data-scrolled attribute on <header> via useEffect — CSS-only backdrop-blur/border-b via Tailwind [&[data-scrolled]] selector
- [Phase 05-01]: SectionCardsGrid is 'use client' for Zustand progress store; HeroSection is server component
- [Phase 06-01]: Warm palette uses --color-* custom properties alongside remapped shadcn tokens so all shadcn components pick up warm palette automatically
- [Phase 06-01]: ErrorCallout exported as ErrorCallout (not Error) to avoid shadowing global Error constructor; registered as Error in MDX
- [Phase 06-01]: JetBrains Mono loaded via next/font/google (not @fontsource) to use Next.js font optimization and CSS variable injection

### Pending Todos

None.

### Blockers/Concerns

- [Phase 4]: Verify gray-matter installation with `pnpm list gray-matter` before writing code that depends on it
- [Phase 4]: Confirm lib/notebook-urls.ts strategy (12-key vs single python key) before consolidation work begins
- [Phase 6]: @stefanprobst/rehype-extract-toc MDX sub-path export is MEDIUM confidence — validate early in 06-02, fallback path is fully specified in research/ARCHITECTURE.md

## Session Continuity

Last session: 2026-03-14T11:11:37.171Z
Stopped at: Completed 06-lesson-reading-toc-highlighting-practice/06-01-PLAN.md
Resume file: None
