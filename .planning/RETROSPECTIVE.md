# Retrospective

## Milestone: v1.1 — JustLearn UX Overhaul

**Shipped:** 2026-03-14
**Phases:** 3 | **Plans:** 8

### What Was Built
- Zustand progress migration (12 course keys → unified `python` key)
- Virtual course consolidation via section-map config (no file moves)
- JustLearn homepage with hero, section overview cards, progress tracking
- Course overview with accordion sections and collapsible sidebar
- Lesson pages with sticky ToC, scroll spy, scroll progress bar
- Warm-neutral palette, 18px body text, JetBrains Mono for code
- Callout MDX components (Tip, Warning, Info, Error)
- Enhanced code blocks with language badges, @shikijs/transformers diff/highlight/focus
- PracticeBlock MDX component with embedded code runner, hint/solution

### What Worked
- Virtual consolidation pattern (section-map.ts) avoided all file-move risk
- TDD approach caught migration edge cases (empty state, duplicate lessons)
- Parallel execution of Wave 2 plans in Phase 6 (3 plans simultaneously)
- UX design spec upfront gave concrete targets for every component
- Research phase identified the Zustand migration must-land-first constraint early

### What Was Inefficient
- Integration gaps between phases (generateStaticParams, rawMdPath, LessonNav) were only caught at audit time — would have been caught earlier with an integration test
- SUMMARY.md files lacked `one_liner` and `requirements_completed` frontmatter consistently — manual extraction needed at milestone completion
- Stale `/courses` catalog page survived through 3 phases unnoticed

### Patterns Established
- `sourceCourseSlug` on LessonMeta for filesystem operations when courseSlug differs from directory name
- `mockPersistStorage` adapter for testing Zustand persist with ESM module hoisting
- `data-scrolled` attribute pattern for CSS-only scroll-triggered header styling
- `github-slugger` for ToC heading IDs matching rehype-slug output

### Key Lessons
- Always audit cross-phase integration before marking milestone complete — individual phase verification misses wiring gaps
- Virtual consolidation (config map) is safer than file reorganization for content-heavy projects
- Font loading via `next/font/google` with CSS variable injection is cleaner than `@fontsource` packages

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 |
|--------|------|------|
| Phases | 3 | 3 |
| Plans | 8 | 8 |
| Tests | 118 | 228 |
| LOC | ~3,000 | 7,035 |
| Integration issues found at audit | N/A | 4 (all fixed) |
