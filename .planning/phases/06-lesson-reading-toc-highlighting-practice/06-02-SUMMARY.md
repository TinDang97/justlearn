---
phase: 06-lesson-reading-toc-highlighting-practice
plan: 02
subsystem: ui
tags: [toc, scroll-spy, scroll-progress, mdx, github-slugger, intersection-observer, raf]

requires:
  - phase: 06-01-lesson-reading-typography
    provides: CSS custom properties (--color-foreground, --color-foreground-muted, --color-primary, --color-border, etc.)

provides:
  - extractHeadings() function with Heading type in lib/content.ts
  - LessonToc component: sticky desktop sidebar + mobile collapsible details/summary bar
  - useActiveHeading hook using IntersectionObserver scroll spy
  - ScrollProgress bar: fixed position, RAF-driven, cleans up on unmount
  - hr MDX override: centered thin divider with not-prose spacing
  - 2-column lesson page layout (65ch content + 240px ToC sidebar at xl+)

affects:
  - 06-03-syntax-highlighting
  - 06-04-practice-blocks

tech-stack:
  added: [github-slugger@2.0.0]
  patterns:
    - useRef + RAF loop for performant scroll animations (no setState, no CSS transition)
    - IntersectionObserver with rootMargin for scroll spy without scroll event listeners
    - details/summary for mobile collapsible UI without JS state
    - Server Component reads raw MD with fs.readFileSync, passes Heading[] to client component as prop

key-files:
  created:
    - lib/content.ts (Heading type + extractHeadings function added)
    - components/lesson-toc.tsx
    - components/scroll-progress.tsx
    - __tests__/lib/extractHeadings.test.ts
    - __tests__/components/lesson-toc.test.tsx
    - __tests__/components/scroll-progress.test.tsx
    - __tests__/components/mdx-hr-override.test.tsx
  modified:
    - app/courses/[courseSlug]/[lessonSlug]/page.tsx
    - mdx-components.tsx

key-decisions:
  - "Use github-slugger (not custom slugify) so extractHeadings IDs match rehype-slug output exactly"
  - "useRef + direct style mutation for RAF loop — avoids React re-renders on every animation frame"
  - "Desktop ToC via parent aside (hidden xl:block) + mobile via details/summary — no JS-driven visibility toggle"
  - "ScrollProgress placed on lesson page only, not root layout — progress only meaningful within a lesson"

patterns-established:
  - "ToC scroll spy: IntersectionObserver rootMargin: '-10% 0px -80% 0px' for comfortable active detection"
  - "RAF cleanup: always cancelAnimationFrame in useEffect return to prevent leak on route navigation"

requirements-completed: [CHUNK-01, CHUNK-02, CHUNK-03, CHUNK-04]

duration: 18min
completed: 2026-03-14
---

# Phase 06 Plan 02: Table of Contents, Scroll Progress, HR Divider Summary

**Sticky ToC sidebar with IntersectionObserver scroll spy, RAF-driven scroll progress bar, and centered hr divider override — all wired into the 2-column lesson layout**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-14T18:12:00Z
- **Completed:** 2026-03-14T18:17:45Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- extractHeadings() using github-slugger produces IDs that exactly match rehype-slug output (critical for anchor links)
- LessonToc renders sticky desktop sidebar (xl+) and collapsible mobile bar (details/summary) with IntersectionObserver scroll spy
- ScrollProgress renders a 3px fixed bar below site header, width updated via RAF loop with unmount cleanup
- Lesson page switched from single max-w-[65ch] to xl:grid 2-column layout with ToC aside
- hr MDX override: centered thin divider replacing default browser hr

## Task Commits

Each task was committed atomically:

1. **Task 1: extractHeadings + LessonToc + lesson page layout** - `fee002e` (feat)
2. **Task 2: ScrollProgress + hr MDX override** - `355adf9` (feat)

## Files Created/Modified
- `lib/content.ts` - Added Heading type and extractHeadings() using github-slugger
- `components/lesson-toc.tsx` - Client component: scroll spy hook + desktop/mobile layouts
- `components/scroll-progress.tsx` - Client component: fixed bar, RAF loop, cleanup on unmount
- `app/courses/[courseSlug]/[lessonSlug]/page.tsx` - 2-column grid layout, ToC sidebar, ScrollProgress
- `mdx-components.tsx` - Added hr override: centered thin divider
- `__tests__/lib/extractHeadings.test.ts` - 9 tests: basic extraction, special chars, h1/h4 ignore, dedup slugs
- `__tests__/components/lesson-toc.test.tsx` - 4 tests: nav aria-label, href links, mobile bar, empty headings
- `__tests__/components/scroll-progress.test.tsx` - 5 tests: aria-hidden, z-50, fixed, RAF called, cleanup
- `__tests__/components/mdx-hr-override.test.tsx` - 3 tests: not-prose, items-center, h-px line

## Decisions Made
- Used github-slugger rather than a custom slugify to guarantee IDs match rehype-slug output
- RAF loop writes directly to `barRef.current.style.width` — no React state update on each frame
- details/summary pattern for mobile ToC avoids needing client-side open/close state
- ScrollProgress mounted only in lesson page, not root layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed IntersectionObserver mock to use class constructor**
- **Found during:** Task 1 (LessonToc tests)
- **Issue:** `vi.fn().mockImplementation(...)` doesn't produce a proper constructor — React threw "is not a constructor"
- **Fix:** Replaced with `class MockIntersectionObserver` with proper constructor signature
- **Files modified:** `__tests__/components/lesson-toc.test.tsx`
- **Verification:** All lesson-toc tests pass
- **Committed in:** fee002e (Task 1 commit)

**2. [Rule 1 - Bug] Fixed RAF spy assertion to use named spy variable**
- **Found during:** Task 2 (ScrollProgress tests)
- **Issue:** `expect(requestAnimationFrame).toHaveBeenCalled()` fails because vi.stubGlobal replaces the global but `expect()` doesn't see the spy directly
- **Fix:** Defined `rafSpy = vi.fn(...)` before beforeEach and referenced it in assertion
- **Files modified:** `__tests__/components/scroll-progress.test.tsx`
- **Verification:** All scroll-progress tests pass
- **Committed in:** 355adf9 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - test mock bugs)
**Impact on plan:** Both fixes were in test setup, not implementation. No scope creep.

## Issues Encountered
None in implementation. Test mock patterns for IntersectionObserver and requestAnimationFrame required minor adjustments.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- extractHeadings, LessonToc, ScrollProgress all production-ready
- 06-03 can proceed: syntax highlighting is independent of ToC
- 06-04 can proceed: practice blocks go in the article column (no ToC conflict)

---
*Phase: 06-lesson-reading-toc-highlighting-practice*
*Completed: 2026-03-14*
