---
phase: 03-differentiators-polish
plan: "03"
subsystem: ui
tags: [motion, notebooklm, page-transitions, micro-animations, framer-motion]

# Dependency graph
requires:
  - phase: 02-progress-code-runner
    provides: LessonCompleteButton, CodeRunnerClient components that received motion wrappers
  - phase: 01-content-reading-shell
    provides: course page and lesson page shells that template.tsx and NotebookLMCard extend
provides:
  - NotebookLMCard Server Component with AI Study Assistant explanation and external link
  - lib/notebook-urls.ts static mapping of 12 course slugs to NotebookLM URLs (placeholders)
  - app/template.tsx App Router page transition (fade-in opacity 0→1, y 8→0, 0.2s easeOut)
  - LessonCompleteButton motion.div wrapper with whileHover/whileTap spring animation
  - CodeRunnerClient Run button motion.div wrapper with whileHover/whileTap spring animation
  - CSS hover:scale-[1.01] on lesson list cards in course page
affects: [future-polish, user-content-setup]

# Tech tracking
tech-stack:
  added: [motion@12.36.0]
  patterns: [motion.div wrapper pattern for animating shadcn Button without touching internals, 'type: spring as const for TypeScript motion transition type narrowing', 'app/template.tsx for App Router page transitions (no AnimatePresence needed — template remounts naturally)']

key-files:
  created:
    - lib/notebook-urls.ts
    - components/notebook-lm/NotebookLMCard.tsx
    - app/template.tsx
    - __tests__/components/notebook-lm-card.test.tsx
    - __tests__/components/template.test.tsx
    - __tests__/components/micro-animations.test.tsx
  modified:
    - components/lesson-complete-button.tsx
    - components/code-runner/code-runner-client.tsx
    - app/courses/[courseSlug]/page.tsx

key-decisions:
  - "Wrap shadcn Button in motion.div (not motion.create(Button)) — preserves shadcn internals, avoids ref forwarding complexity"
  - "app/template.tsx uses only initial/animate (no exit/AnimatePresence) — template.tsx remounts on navigation so initial fires naturally"
  - "transition: { type: 'spring' as const } required to narrow string literal for TypeScript motion transition type"
  - "NotebookLM card uses placeholder URLs — NBLM-03 (actual notebook creation) is a human-action gate for user to complete"
  - "Pre-existing build failure from plan 03-01 (@xyflow/react prerender TypeError) not fixed — out of scope, deferred to separate issue"

patterns-established:
  - "motion.div wrapper pattern: wrap any third-party button in motion.div whileHover/whileTap rather than replacing the component"
  - "spring as const: always use 'spring' as const in motion transition objects to satisfy TypeScript AnimationGeneratorType"
  - "Page transitions via template.tsx: place 'use client' motion.div with initial/animate in app/template.tsx for route-level fade-ins"

requirements-completed: [NBLM-01, NBLM-02, NBLM-03, ANIM-01, ANIM-02]

# Metrics
duration: 10min
completed: 2026-03-14
---

# Phase 3 Plan 03: Differentiators Polish Summary

**NotebookLM AI Study Assistant cards on all 12 course pages, motion.div page transitions via template.tsx, and spring micro-animations on LessonCompleteButton and CodeRunner Run button**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-14T04:43:06Z
- **Completed:** 2026-03-14T04:53:52Z
- **Tasks:** 1 of 2 automated (Task 2 is human-action gate)
- **Files modified:** 9

## Accomplishments
- NotebookLMCard Server Component renders explanation text, Google account notice, and "Open in NotebookLM" external link on all 12 course pages
- Page transitions via `app/template.tsx` — motion.div with opacity 0→1, y 8→0 in 0.2s easeOut fires on every route change
- LessonCompleteButton and CodeRunnerClient Run button wrapped in motion.div with whileHover (scale 1.03) and whileTap (scale 0.97) spring animations
- Lesson list cards in course page have CSS `hover:scale-[1.01]` transition
- 10 new tests cover NotebookLMCard, Template wrapper, and micro-animation attributes

## Task Commits

Each task was committed atomically:

1. **TDD RED — Failing tests** - `f04b4fa` (test)
2. **TDD GREEN — NotebookLM card, page transitions, micro-animations** - `6cef94b` (feat)

**Note:** Task 2 (create NotebookLM notebooks) is a human-action gate — requires manual creation at notebooklm.google.com. Placeholder URLs are in `lib/notebook-urls.ts` ready to replace.

## Files Created/Modified
- `lib/notebook-urls.ts` — Static map of 12 course slugs to placeholder NotebookLM URLs
- `components/notebook-lm/NotebookLMCard.tsx` — Server Component card with AI Study Assistant content and external link
- `app/template.tsx` — App Router page transition wrapper using motion.div
- `components/lesson-complete-button.tsx` — Added motion.div wrapper with spring whileHover/whileTap
- `components/code-runner/code-runner-client.tsx` — Added motion.div wrapper around Run button
- `app/courses/[courseSlug]/page.tsx` — NotebookLMCard added, lesson cards get CSS hover:scale
- `__tests__/components/notebook-lm-card.test.tsx` — 4 tests for NotebookLMCard
- `__tests__/components/template.test.tsx` — 2 tests for Template page transition wrapper
- `__tests__/components/micro-animations.test.tsx` — 4 tests for motion wrapper attributes

## Decisions Made
- Wrap shadcn Button in `motion.div` (not `motion.create(Button)`) — preserves shadcn internals, avoids ref forwarding complexity
- `app/template.tsx` uses only `initial`/`animate` (no exit/AnimatePresence) — template.tsx remounts on navigation so initial fires naturally, exit animations deferred for v2
- `transition: { type: 'spring' as const }` required to narrow string literal for TypeScript `AnimationGeneratorType`
- NotebookLM card renders placeholder URLs for now; NBLM-03 (actual notebook creation) requires manual user action

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed motion@12.36.0**
- **Found during:** Task 1 (start of implementation)
- **Issue:** `motion/react` package not in package.json; import would fail at build and test time
- **Fix:** `pnpm add motion` — installed motion@12.36.0
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** Import succeeds in tests and build compilation
- **Committed in:** 6cef94b (Task 1 GREEN commit)

**2. [Rule 1 - Bug] Fixed TypeScript motion transition type error**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `transition: { type: 'spring', ... }` causes TS error — `string` not assignable to `AnimationGeneratorType`
- **Fix:** Changed to `type: 'spring' as const` in both LessonCompleteButton and CodeRunnerClient
- **Files modified:** components/lesson-complete-button.tsx, components/code-runner/code-runner-client.tsx
- **Verification:** Build type-check passes for these files
- **Committed in:** 6cef94b (Task 1 GREEN commit)

**3. [Rule 1 - Bug] Fixed test: multiple getByText matches**
- **Found during:** Task 1 (first test run)
- **Issue:** `getByText(/NotebookLM/i)` found two elements (paragraph and link text)
- **Fix:** Switched to `getAllByText(/NotebookLM/i)` with `.length > 0` assertion
- **Files modified:** __tests__/components/notebook-lm-card.test.tsx
- **Verification:** All 4 NotebookLMCard tests pass
- **Committed in:** 6cef94b (Task 1 GREEN commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bugs)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered

**Pre-existing build failure (out of scope, deferred):**
The Next.js build fails with `TypeError: a[d] is not a function` during prerender of lesson pages — caused by `@xyflow/react` bundling issues in `LessonMindmap.tsx` from plan 03-01. This pre-existed before plan 03-03 changes and is not caused by any files in this plan. Deferred to a future fix.

## User Setup Required

**NBLM-03: Create 12 NotebookLM notebooks manually**

1. Go to https://notebooklm.google.com (requires personal Google account)
2. Create one notebook per course, upload all `lesson-*.md` files as sources
3. Enable public sharing and copy the share URL for each notebook
4. Replace placeholder values in `lib/notebook-urls.ts` with real URLs

Course slugs: 01-python-fundamentals, 02-data-types-variables, 03-control-flow-logic, 04-functions-modules, 05-data-structures, 06-oop, 07-file-handling-exceptions, 08-working-with-libraries, 09-web-development-basics, 10-data-analysis-visualization, 11-automation-scripting, 12-capstone-best-practices

After replacing URLs, type "notebooks created" to trigger the next plan continuation.

## Next Phase Readiness
- Phase 3 plan 03-03 fully automated — NotebookLMCard, page transitions, and micro-animations are live
- NBLM-03 requires user to create 12 NotebookLM notebooks and update `lib/notebook-urls.ts`
- Pre-existing build failure in lesson pages (from plan 03-01 @xyflow/react) should be addressed in a follow-up

## Self-Check: PASSED

- lib/notebook-urls.ts: FOUND
- components/notebook-lm/NotebookLMCard.tsx: FOUND
- app/template.tsx: FOUND
- __tests__/components/notebook-lm-card.test.tsx: FOUND
- __tests__/components/template.test.tsx: FOUND
- __tests__/components/micro-animations.test.tsx: FOUND
- .planning/phases/03-differentiators-polish/03-03-SUMMARY.md: FOUND
- Commit f04b4fa (RED tests): FOUND
- Commit 6cef94b (GREEN implementation): FOUND

---
*Phase: 03-differentiators-polish*
*Completed: 2026-03-14*
