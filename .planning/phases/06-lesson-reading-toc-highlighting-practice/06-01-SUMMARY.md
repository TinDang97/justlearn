---
phase: 06-lesson-reading-toc-highlighting-practice
plan: 01
subsystem: ui
tags: [css, tailwind, typography, fonts, mdx, callout, next/font]

# Dependency graph
requires:
  - phase: 05-homepage-navigation-ui
    provides: layout.tsx html element structure that font variable is applied to
provides:
  - Warm-neutral CSS custom property palette for light and dark mode
  - JetBrains Mono font loaded via next/font/google as --font-mono variable
  - Prose override styles (18px/1.75, blockquote, headings, inline code, links)
  - Callout MDX components (Tip, Warning, Info, ErrorCallout) registered in mdx-components.tsx
affects:
  - 06-02-toc
  - 06-03-syntax-highlighting
  - 06-04-practice-blocks
  - All MDX lesson pages consuming prose styles and callout components

# Tech tracking
tech-stack:
  added: [next/font/google JetBrains_Mono, lucide-react (Lightbulb, AlertTriangle, Info, AlertCircle)]
  patterns:
    - Warm palette defined as --color-* custom properties, shadcn tokens remapped to consume them
    - Callout component uses not-prose to escape Tailwind typography defaults
    - MDX components registered in useMDXComponents() with Error: ErrorCallout alias to avoid shadowing global Error

key-files:
  created:
    - components/callout.tsx
    - __tests__/components/callout.test.tsx
  modified:
    - app/globals.css
    - app/layout.tsx
    - mdx-components.tsx

key-decisions:
  - "Warm palette uses --color-* custom properties alongside remapped shadcn tokens so all shadcn components pick up warm palette automatically"
  - "ErrorCallout exported as ErrorCallout (not Error) to avoid shadowing global Error constructor; registered as Error in MDX"
  - "JetBrains Mono loaded via next/font/google (not @fontsource) to use Next.js font optimization and CSS variable injection"

patterns-established:
  - "Callout variant pattern: config object maps variant to icon, border class, bg class, default title"
  - "not-prose class on callout wrapper to escape Tailwind typography plugin defaults"
  - "CSS custom properties for semantic colors: --color-primary, --color-background, etc. consumed by component classes"

requirements-completed: [READ-01, READ-02, READ-03, READ-04, READ-05]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 6 Plan 01: Reading Typography Foundation Summary

**Warm-neutral CSS palette with JetBrains Mono font, prose overrides (18px/1.75/green blockquote), and Tip/Warning/Info/ErrorCallout MDX components with full test coverage**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T18:08:00Z
- **Completed:** 2026-03-14T18:12:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Full warm-neutral color palette defined as CSS custom properties for both light and dark mode, with shadcn/ui tokens remapped to consume them automatically
- JetBrains Mono loaded via `next/font/google` and applied as `--font-mono` variable on the html element
- Prose overrides set 18px body text, 1.75 line-height, green-bordered blockquotes, heading sizing, inline code styling, and smooth scroll behavior
- Four callout MDX components (Tip, Warning, Info, ErrorCallout) created with variant icons, colored borders, and backgrounds; registered in `useMDXComponents()`
- 23 callout test cases cover all variants, default/custom titles, children rendering, and border color assertions

## Task Commits

Each task was committed atomically:

1. **Task 1: Warm palette CSS tokens, prose overrides, JetBrains Mono font** - `df8934d` (feat)
2. **Task 2 RED: Failing callout tests** - `b370225` (test)
3. **Task 2 GREEN: Callout component implementation + mdx-components registration** - `5ff73ab` (feat)

**Plan metadata:** committed with SUMMARY.md

_Note: TDD tasks have multiple commits (test → feat)_

## Files Created/Modified

- `app/globals.css` - Full warm palette CSS custom properties (light + dark), shadcn token remapping, prose overrides with 18px/1.75 body, green blockquote, inline code, link, heading styles
- `app/layout.tsx` - JetBrains_Mono imported from next/font/google, `--font-mono` variable applied to html element
- `components/callout.tsx` - Callout base component + Tip/Warning/Info/ErrorCallout shorthand exports; variant config with lucide-react icons, border/bg classes
- `mdx-components.tsx` - Tip, Warning, Info, Error (ErrorCallout) registered in useMDXComponents()
- `__tests__/components/callout.test.tsx` - 23 test cases covering all 4 variants, titles, children, border classes

## Decisions Made

- Used `next/font/google` for JetBrains Mono instead of `@fontsource` to get Next.js font optimization and automatic CSS variable injection
- `ErrorCallout` exported as `ErrorCallout` (not `Error`) to avoid shadowing the global Error constructor; aliased as `Error` in MDX components map
- Warm palette replaces oklch shadcn defaults entirely (Option A from research) so all shadcn components pick up warm colors without extra class overrides

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 6 color tokens and typography foundation are in place for 06-02 (ToC), 06-03 (syntax highlighting), and 06-04 (practice blocks)
- `--color-primary`, `--color-code-bg`, `--font-mono`, and all prose classes are available globally
- Callout components ready for use in lesson MDX files via `<Tip>`, `<Warning>`, `<Info>`, `<Error>` tags

---
*Phase: 06-lesson-reading-toc-highlighting-practice*
*Completed: 2026-03-14*

## Self-Check: PASSED

- FOUND: app/globals.css
- FOUND: app/layout.tsx
- FOUND: components/callout.tsx
- FOUND: __tests__/components/callout.test.tsx
- FOUND: mdx-components.tsx
- FOUND commit: df8934d (Task 1)
- FOUND commit: b370225 (Task 2 RED)
- FOUND commit: 5ff73ab (Task 2 GREEN)
