---
phase: 06-lesson-reading-toc-highlighting-practice
plan: 04
subsystem: ui
tags: [react, mdx, practice-block, code-runner, lucide-react, shadcn, tdd, vitest]

# Dependency graph
requires:
  - phase: 06-01-lesson-reading-toc-highlighting-practice
    provides: CSS custom properties (--color-border, --color-background-subtle, --color-background-muted, --color-primary, --color-foreground-muted)
  - phase: 06-01-lesson-reading-toc-highlighting-practice
    provides: Callout components and MDX component registration pattern

provides:
  - PracticeBlock Client Component with prompt, embedded CodeRunner, expandable hint/solution
  - PracticeBlock registered as MDX component in mdx-components.tsx
  - 11 unit tests covering all PracticeBlock behaviors

affects: [lesson authoring, MDX content, 06-lesson-reading-toc-highlighting-practice]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PracticeBlock uses direct import of CodeRunner (no extra dynamic wrapper — CodeRunner already handles SSR internally)"
    - "Hint and solution sections are independently toggleable via separate useState hooks"
    - "Conditional rendering on prop presence (hint !== undefined, solution !== undefined)"

key-files:
  created:
    - components/practice-block.tsx
    - __tests__/components/practice-block.test.tsx
  modified:
    - mdx-components.tsx

key-decisions:
  - "Import CodeRunner directly with no extra dynamic() wrapper — CodeRunner/index.tsx already uses dynamic import with ssr:false internally"
  - "Condition hint/solution sections on prop !== undefined (not truthiness) to support empty string edge case"

patterns-established:
  - "Client Component with useState for expand/collapse: hintOpen and solutionOpen independently managed"
  - "Test mocks @/components/code-runner to return simple div with data-testid and data-initial-code attributes"

requirements-completed: [PRACT-01, PRACT-02]

# Metrics
duration: 12min
completed: 2026-03-14
---

# Phase 6 Plan 04: Practice Block Summary

**PracticeBlock Client Component with embedded CodeRunner, expandable hint/solution sections, registered as MDX component with 11 passing TDD tests**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-14T18:11:00Z
- **Completed:** 2026-03-14T18:14:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `components/practice-block.tsx` as a 'use client' component with full spec-compliant layout (Code2 icon header, prompt, CodeRunner, expandable hint, expandable solution)
- Wrote 11 TDD tests covering all 8+ behaviors: header text, prompt, CodeRunner initialCode, no button when prop absent, hint toggle, solution toggle, simultaneous open
- Registered PracticeBlock in `mdx-components.tsx` — lesson authors can now use `<PracticeBlock prompt="..." hint="..." solution="..." />` in MDX files
- Build succeeds with all MDX component registrations

## Task Commits

Each task was committed atomically:

1. **Task 1: PracticeBlock component with hint/solution expand + tests** - `97da505` (feat)
2. **Task 2: Register PracticeBlock in MDX components + verify build** - `c1a98a9` (feat)

**Plan metadata:** (docs commit follows)

_Note: Task 1 used TDD approach — tests written first (RED), then implementation to make them pass (GREEN)_

## Files Created/Modified

- `components/practice-block.tsx` - PracticeBlock Client Component; props: prompt, initialCode, hint, solution; two independent useState booleans for toggle; Code2 icon from lucide-react; direct CodeRunner import
- `__tests__/components/practice-block.test.tsx` - 11 test cases with CodeRunner mocked as simple div; covers all expand/collapse behaviors
- `mdx-components.tsx` - PracticeBlock import added; registered in useMDXComponents return object

## Decisions Made

- Import CodeRunner directly (no extra `dynamic()` wrapper): CodeRunner's own `index.tsx` already uses `dynamic()` with `ssr: false`, so wrapping again is unnecessary and would break the SSR boundary.
- Condition hint/solution rendering on `prop !== undefined` rather than truthiness — keeps the prop interface explicit and handles empty strings correctly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing test failures in `lesson-toc.test.tsx` and `extractHeadings.test.ts` are from prior plans (06-02, 06-03) and are out of scope for this plan. The practice-block specific tests all pass independently.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 6 plan 04 is the final plan in Phase 6
- PracticeBlock is ready for use in lesson MDX files
- All 4 Phase 6 plans are complete: reading typography (06-01), ToC (06-02), syntax highlighting (06-03), practice blocks (06-04)

---
*Phase: 06-lesson-reading-toc-highlighting-practice*
*Completed: 2026-03-14*
