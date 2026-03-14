---
phase: 01-content-reading-shell
plan: "01"
subsystem: ui
tags: [nextjs, mdx, shiki, tailwindcss, shadcn, next-themes, vitest, typescript]

# Dependency graph
requires: []
provides:
  - "Next.js 15 App Router project with TypeScript, Tailwind v4, ESLint"
  - "MDX pipeline: @next/mdx + rehype-pretty-code + Shiki dual-theme (github-light/github-dark-dimmed)"
  - "lib/content.ts with Course and LessonMeta types, getAllCourses/getCourse/getLesson exports"
  - "Dark mode: next-themes ThemeProvider + FOUC-prevention blocking script"
  - "Copy-to-clipboard: CopyButton client component + mdx-components.tsx pre override"
  - "shadcn/ui components: button, badge, card, breadcrumb, sheet, separator"
  - "Vitest test framework + 20 unit tests for content parsing"
affects:
  - 02-course-pages
  - 03-lesson-pages
  - 04-navigation
  - all subsequent plans in phase 01

# Tech tracking
tech-stack:
  added:
    - "next@15 — App Router, SSG via generateStaticParams"
    - "@next/mdx + @mdx-js/loader + @mdx-js/react — build-time MDX compilation"
    - "rehype-pretty-code + shiki — zero-JS syntax highlighting at build time"
    - "remark-gfm + rehype-slug + unist-util-visit — MDX pipeline plugins"
    - "tailwindcss v4 + @tailwindcss/typography + @tailwindcss/postcss — CSS-first config"
    - "shadcn/ui v4 — Radix UI-based component library with Tailwind v4"
    - "next-themes — FOUC-free dark mode with suppressHydrationWarning"
    - "@fontsource/inter — self-hosted Inter typeface"
    - "lucide-react — icons (Copy, Check, Sun, Moon)"
    - "vitest + @vitejs/plugin-react + jsdom — test framework"
    - "class-variance-authority + clsx + tailwind-merge — shadcn utils"
  patterns:
    - "Inline bold metadata parsing: regex-based (not gray-matter) for lesson title/duration/level"
    - "Dual-pass rehype visitor: extractRawCode before Shiki, forwardRawCode after, for CopyButton prop"
    - "FOUC prevention: blocking inline script in <head> reads localStorage before React hydrates"
    - "TDD: RED (failing tests committed) -> GREEN (implementation passing all tests)"
    - "Tailwind v4 CSS-first config: @plugin directive for typography, no tailwind.config.js"

key-files:
  created:
    - "lib/content.ts — Course+LessonMeta types, getAllCourses/getCourse/getLesson, inline metadata regex"
    - "next.config.mjs — createMDX with extension /.(md|mdx)$/, dual-theme Shiki rehype pipeline"
    - "mdx-components.tsx — Global MDX pre/code overrides with CopyButton integration"
    - "components/copy-button.tsx — use client, navigator.clipboard, Copy/Check icons, 2s timeout"
    - "components/theme-provider.tsx — next-themes ThemeProvider wrapper"
    - "components/theme-toggle.tsx — Sun/Moon icon toggle with useTheme()"
    - "app/layout.tsx — suppressHydrationWarning, FOUC blocking script, ThemeProvider"
    - "app/globals.css — Shiki CSS variables, Tailwind v4 theme, prose overrides"
    - "vitest.config.ts — Vitest with jsdom environment and @ alias"
    - "__tests__/lib/content.test.ts — 20 unit tests against real courses/ directory"
    - "components/ui/ — button, badge, card, breadcrumb, sheet, separator"
  modified:
    - "package.json — all dependencies and test/build scripts"

key-decisions:
  - "Do not use gray-matter: lesson files have NO YAML frontmatter; use regex-based parseLessonMeta"
  - "Course title regex: two-pass (narrow ' - ' separator first, broad fallback) to handle README format variation"
  - "Course description: match '## Course Description' OR '## Course Overview' (courses 07-12 use Overview)"
  - "Disable Turbopack: extractRawCode/forwardRawCode rehype visitors are non-serializable functions"
  - "pnpm create next-app blocked by existing files; manually initialized package.json and all config files"
  - "Tailwind v4 typography: @plugin directive in CSS, not @import (different resolution path)"

patterns-established:
  - "Content parsing is server-only (fs.readFileSync) — never call getAllCourses from client components"
  - "MDX extension: /.(md|mdx)$/ required to process .md files (not just .mdx)"
  - "@ alias maps to project root (./) — use @/lib/content, @/components, etc."

requirements-completed:
  - CONT-01
  - CONT-04

# Metrics
duration: 9min
completed: "2026-03-14"
---

# Phase 1 Plan 01: Foundation Summary

**Next.js 15 + @next/mdx + Shiki dual-theme pipeline with regex-based inline metadata parsing of 122 lesson files across 12 courses, Vitest test suite green**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-14T02:26:28Z
- **Completed:** 2026-03-14T02:35:17Z
- **Tasks:** 2 (Task 1: project init; Task 2: TDD content library)
- **Files modified:** 22 created, 2 modified

## Accomplishments
- Next.js 15 App Router project with full MDX pipeline, Shiki dual-theme syntax highlighting, and dark mode infrastructure (FOUC-free)
- lib/content.ts parses all 12 courses and their lessons using custom inline bold text regex (not YAML frontmatter), providing typed Course and LessonMeta data for all subsequent plans
- All 20 unit tests pass against real courses/ directory: 12 courses, 122 lessons, correct prev/next links, course 05 with 12 lessons handled

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js 15 project, install all dependencies, configure MDX pipeline** - `b2786a8` (feat)
2. **Task 2 RED: Failing tests for lib/content.ts** - `f202947` (test)
3. **Task 2 GREEN: Implement lib/content.ts** - `4a52e5b` (feat)

**Plan metadata:** (see final commit after SUMMARY)

_Note: TDD Task 2 has two commits (test RED → feat GREEN)_

## Files Created/Modified
- `lib/content.ts` — Course+LessonMeta types, getAllCourses/getCourse/getLesson with inline metadata regex
- `next.config.mjs` — createMDX with dual-theme Shiki rehype pipeline (extractRawCode + forwardRawCode visitors)
- `mdx-components.tsx` — Global MDX pre/code overrides injecting CopyButton with raw code string
- `components/copy-button.tsx` — Client component with clipboard API and 2s visual feedback
- `components/theme-provider.tsx` — next-themes wrapper
- `components/theme-toggle.tsx` — Sun/Moon theme toggle
- `app/layout.tsx` — suppressHydrationWarning + FOUC-prevention blocking script + ThemeProvider
- `app/globals.css` — Shiki dual-theme CSS variables, Tailwind v4 theme tokens, prose overrides
- `vitest.config.ts` — Vitest + jsdom + @ path alias
- `__tests__/lib/content.test.ts` — 20 tests covering all parsing behaviors and edge cases
- `components/ui/` — button, badge, card, breadcrumb, sheet, separator from shadcn/ui

## Decisions Made
- **No gray-matter**: Lesson files have zero YAML frontmatter; inline bold text requires custom regex parsing
- **Two-pass title regex**: Course 01 README has " - subtitle" format; other READMEs do not; narrow regex tried first
- **Course description regex**: Courses 07-12 use "## Course Overview" instead of "## Course Description"; matched both
- **No Turbopack**: rehype visitors (non-serializable functions) break Turbopack; `next dev` used
- **Manual init**: `pnpm create next-app` refused to run in directory with existing files (.claude/, .planning/, courses/)
- **Tailwind v4 typography**: `@plugin "@tailwindcss/typography"` in CSS (not `@import`) for correct resolution

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] pnpm create next-app blocked by existing files**
- **Found during:** Task 1
- **Issue:** `.claude/`, `.planning/`, `courses/`, `tmp/` directories prevent `create-next-app` from running
- **Fix:** Manually created package.json, tsconfig.json, next.config.mjs, postcss.config.mjs, and all app/ files
- **Verification:** `pnpm build` succeeds with 3 static pages
- **Committed in:** b2786a8 (Task 1 commit)

**2. [Rule 1 - Bug] Tailwind v4 @import for typography fails**
- **Found during:** Task 1 verification (pnpm build)
- **Issue:** `@import "@tailwindcss/typography"` in Tailwind v4 resolves as a node module import path, not a plugin
- **Fix:** Changed to `@plugin "@tailwindcss/typography"` — the correct Tailwind v4 CSS-first plugin syntax
- **Files modified:** app/globals.css
- **Verification:** Build succeeds without CSS resolution error
- **Committed in:** b2786a8 (Task 1 commit)

**3. [Rule 1 - Bug] Test assertion `not.toContain('-')` too strict for course titles**
- **Found during:** Task 2 GREEN phase
- **Issue:** "Object-Oriented Programming" (course 06) contains a hyphen in the actual name
- **Fix:** Changed assertion to `not.toMatch(/^\d{2}-/)` — verifies title isn't the raw slug (which starts with digit-prefix)
- **Files modified:** `__tests__/lib/content.test.ts`
- **Verification:** All 20 tests pass
- **Committed in:** 4a52e5b (Task 2 feat commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bug)
**Impact on plan:** All fixes necessary for plan completion. No scope creep.

## Issues Encountered
- class-variance-authority missing from initial install (shadcn/ui components depend on it); added as unblocking step
- `pnpm test --run` in package.json script causes double `--run` error when called as `pnpm test --run`; plan verification command adjusted to `pnpm test`

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- lib/content.ts exports are the typed foundation all subsequent plans depend on (Course, LessonMeta, getAllCourses, getCourse, getLesson)
- MDX pipeline processes .md files with Shiki syntax highlighting — ready for lesson page routes
- shadcn/ui components installed and ready for layout/navigation use
- Dark mode infrastructure in place — ThemeProvider wraps the app
- All 20 unit tests green against real course data

---
*Phase: 01-content-reading-shell*
*Completed: 2026-03-14*
