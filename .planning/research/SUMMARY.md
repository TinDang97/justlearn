# Project Research Summary

**Project:** JustLearn v1.1 — Python Beginner Learning Platform UX Overhaul
**Domain:** Next.js 15 App Router MDX content platform with interactive code execution
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

JustLearn v1.1 is a targeted UX overhaul of an existing, functioning Next.js 15 + MDX platform with 120 Python lessons across 12 course directories, 300 students, and a complete v1.0 feature set (Pyodide REPL, ReactFlow mindmaps, Fuse.js search, Zustand progress, NotebookLM integration). The overhaul addresses four specific gaps: the absence of a branded homepage, fragmented presentation of what is logically one Python course (currently 12 separate courses), no in-page navigation for long 2-4 hour lessons, and code highlighting that lacks line-level features. All four gaps are solvable within the existing stack — only three small packages need adding (`@stefanprobst/rehype-extract-toc`, `@shikijs/transformers`, and possibly `gray-matter`). The recommended approach is additive and conservative: extend the data model, add components, and enhance configuration rather than restructuring content files or redesigning routes.

The highest-leverage decision in this overhaul is how course consolidation is implemented. Research strongly recommends virtual consolidation via a new `lib/section-map.ts` config file that maps the 12 existing course directories to sections of one logical course, keeping all 120 lesson files at their current paths. This avoids cascading breakage across the dynamic MDX import system, exercise JSON paths, mindmap JSON paths, and `generateStaticParams`. The second critical decision is that lesson chunking (in-page patches) must not create new URLs or file splits — it is strictly a rendering concern implemented with a `<Patch>` MDX component and anchor-based navigation on the existing lesson URL.

The principal risk is the localStorage progress migration: all 300 students have progress keyed under 12 old course slugs. If the Zustand persist store version is not incremented with a migrate function before consolidation routes go live, every student silently loses their progress with no recovery path. This migration must be the first commit in the course consolidation phase. Secondary risks include the ToC heading ID extraction needing to use `github-slugger` (matching `rehype-slug`'s algorithm exactly) to avoid anchor mismatches on duplicate headings, and the incompatibility of `rehype-pretty-code` with Turbopack (the project must stay on Webpack).

## Key Findings

### Recommended Stack

The v1.0 stack (Next.js 15, shadcn/ui, Tailwind v4, rehype-pretty-code 0.14.3 + Shiki 4.0.2, Pyodide, ReactFlow, Fuse.js, Zustand, Motion) is validated and unchanged. V1.1 adds exactly three packages: `@stefanprobst/rehype-extract-toc@^3.0.0` for build-time heading extraction into a named MDX export, `@shikijs/transformers@^4.0.2` for diff/focus/error notation in code blocks, and `gray-matter@^4.0.3` if not already installed (verify with `pnpm list gray-matter`).

**Core technologies added for v1.1:**
- `@stefanprobst/rehype-extract-toc`: Attaches heading tree to `vfile.data.toc` as a named MDX export — the only approach compatible with App Router RSC where the lesson page is a Server Component. Must run after `rehype-slug` in the plugin pipeline.
- `@shikijs/transformers`: Composable transformers for `[!code ++/--]`, `[!code focus]`, `[!code error/warning]` notation — added to the `transformers: []` array in the existing `rehypePrettyCodeOptions`; no pipeline restructuring required.
- `gray-matter`: Standard YAML frontmatter parser for section metadata in README files; replaces the current regex-based extraction in `lib/content.ts`.
- Native `IntersectionObserver` with `rootMargin: "-10% 0px -80% 0px"`: Used in a `useActiveHeading` client hook for ToC scroll spy — runs off-main-thread; no library needed for a 5-10 heading sidebar.

**Critical version constraint:** `@shikijs/transformers` must match the installed `shiki` major (4.x). Do not upgrade Shiki beyond 4.x — `rehype-pretty-code` 0.14.x has a peer dep on Shiki 4.x. The `matchAlgorithm` option defaults to `v1`; leave at default (`v3` is experimental as of March 2026).

### Expected Features

**Must have (P1 — table stakes for v1.1 launch):**
- Real homepage with JustLearn branding — currently a one-line `redirect('/courses')`; any named platform requires a landing page.
- Unified Python Course entry point with section grouping — beginners need one course to click, not 12 to evaluate.
- Section-aware sidebar — 120 flat lessons in one list is unusable; sections provide orientation.
- Per-lesson Table of Contents with active section highlighting — essential for 2-4 hour lessons with 4+ logical parts.
- Enhanced syntax highlighting (`@shikijs/transformers`) — line highlights, diff, focus notation; config-only change.
- Reading typography overhaul — prose max-width, line-height, heading spacing via Tailwind typography config.

**Should have (P2 — add after P1 validated with real usage data):**
- Lesson chunking as in-page patches (`<Patch>` MDX component) — HIGH user value, HIGH implementation cost; pilot with 10 lessons before committing to all 120 files. Gate on: session data showing students not finishing full lessons.
- Embedded practice within patches — Pyodide code runner already built; needs placement convention inside patches.
- Patch-level progress tracking — extends Zustand store with separate key namespace; additive, does not conflict with lesson-level keys.

**Defer (v2+):**
- Reading time estimates per patch.
- Automated patch boundary generation (AI-assisted chunking of MD files to avoid manual editing of 120 files).
- Patch-level completion badges.

**Anti-features to explicitly reject:**
- Separate URL pages per lesson chunk — breaks all stored progress keys, multiplies static pages 4x, invalidates all stored user progress with no migration path.
- Full routing rebuild for consolidation — `/courses/[courseSlug]/[lessonSlug]` must remain the lesson URL; add new unified entry point without removing existing routes.
- Replace `rehype-pretty-code` with custom highlighter — `@shikijs/transformers` achieves everything needed as a config addition; replacement breaks the existing `extractRawCode`/`forwardRawCode` visitors.
- Infinite scroll on lesson list — hides section structure that beginners need for orientation.

### Architecture Approach

All v1.1 changes follow the Virtual Course Consolidation pattern: the 12 physical `courses/` directories stay unchanged; a new `lib/section-map.ts` config maps each directory slug to `{ title, order }`; and `getUnifiedCourse()` in `lib/content.ts` assembles the unified logical course at SSG time by calling the existing `getAllCourses()` unchanged. The lesson page layout changes to 3 columns (sidebar 288px | article 65ch | ToC 240px on xl+). Heading extraction for the ToC is done server-side via `extractHeadings()` using `github-slugger` — the same algorithm as `rehype-slug` — ensuring anchor IDs in the ToC component match the rendered document exactly.

**Major components changed/added for v1.1:**

1. `lib/section-map.ts` (NEW) — 12-entry config decoupling section metadata from FS layout; single source of truth for section titles and order.
2. `lib/content.ts` (MODIFY) — adds `Section`, `UnifiedCourse`, `Heading` types; `getUnifiedCourse()`, `extractHeadings()`; adds `sourceCourseSlug` and `sectionSlug` to `LessonMeta` (the only breaking type change).
3. `lib/store/progress.ts` (MODIFY) — Zustand persist `version` increment + `migrate` function merging 12 old course keys into single `python` key.
4. `components/lesson-toc.tsx` (NEW) — Client component; sticky in-page ToC with `IntersectionObserver` active heading tracking.
5. `app/page.tsx` (REWRITE) — Real homepage replacing redirect stub; hero + value prop + single CTA to unified Python Course.
6. `components/course-sidebar.tsx` (MODIFY) — Section header groups with collapsible section UI using shadcn/ui `Collapsible`.
7. `next.config.mjs` (MODIFY) — Add `@shikijs/transformers` to `transformers` array; add `rehypeExtractToc` + `withTocExport` after `rehypeSlug` in plugin order.
8. `app/globals.css` (MODIFY) — CSS for line number counters, diff notation coloring (`oklch`-based), language badge.

**Unchanged (must not be touched):** `courses/` directory, `lib/exercises.ts`, `lib/mindmap-data.ts`, `components/code-runner/`, `components/mindmap/`, `components/search/`, `components/notebook-lm/`, `lib/search.ts`.

### Critical Pitfalls

1. **Progress data silently wiped on consolidation** — Zustand persist `version` must be incremented with a `migrate` function mapping 12 old courseSlug keys to single `python` key *before* any consolidation routes go live. This is the only pitfall with no easy automated recovery — students lose all progress. Write and test the migration first in isolation.

2. **Dynamic MDX import path breakage** — The import template `` `@/courses/${courseSlug}/${lessonSlug}.md` `` requires files at exact paths. Never restructure the `courses/` directory. Use `sourceCourseSlug` on `LessonMeta` for all FS operations. Changes to content location, `generateStaticParams`, and the import template must be a single atomic commit.

3. **ToC anchor IDs diverging from `rehype-slug` output** — Any custom `slugify()` implementation diverges from `github-slugger` on duplicate headings, special characters, and accented letters. Use `@stefanprobst/rehype-extract-toc` (reads IDs after `rehype-slug` runs) or `extractHeadings()` with `GithubSlugger`. Never a custom slug function.

4. **Old course route 404s without redirects** — All 12 old `/courses/{courseSlug}/` URL prefixes need permanent redirects in `next.config.mjs` before old routes are removed. Generate from `SECTION_MAP` keys programmatically — do not write 12 manually.

5. **Turbopack breaks `rehype-pretty-code`** — Never add `--turbo` to any pnpm script. The custom `extractRawCode`/`forwardRawCode` rehype visitors and `rehype-pretty-code` are incompatible with Turbopack as of March 2026. All code blocks lose syntax highlighting and the copy button raw prop becomes `undefined` with no build-time error.

## Implications for Roadmap

The dependency graph and risk profile across all four research files converge on a 4-phase structure for v1.1, with lesson chunking deferred to a validated follow-on phase.

### Phase 1: Foundation — Data Model and Progress Migration

**Rationale:** Everything downstream depends on the unified course data model. Progress migration is the highest-risk step and has no easy recovery — it must be done first, in isolation, so it can be tested and rolled back independently before any UI changes consume the new data shape.

**Delivers:** `lib/section-map.ts`, updated `lib/content.ts` with Section/UnifiedCourse/Heading types and `getUnifiedCourse()`, Zustand `migrate` function in `lib/store/progress.ts`, and `next.config.mjs` permanent redirects for all 12 old course slugs.

**Addresses:** Course consolidation data model (FEATURES.md P1 prerequisite), section grouping prerequisite.

**Avoids:** Pitfall 5 (progress wipe), Pitfall 6 (dynamic import path mismatch), Pitfall 8 (old route 404s).

**Research flag:** Standard patterns — Zustand persist migration (official docs + community), Next.js redirects (official docs), TypeScript data modeling. No additional research needed.

### Phase 2: Homepage and Course Navigation UI

**Rationale:** With the data model stable, UI components that consume it can be built. Homepage has zero dependencies on other new features. Section-aware sidebar requires the `Section[]` type from Phase 1.

**Delivers:** Real `app/page.tsx` homepage with JustLearn branding (hero, value prop, CTA); section-grouped `components/course-sidebar.tsx` with collapsible sections using shadcn/ui `Collapsible`; updated `app/courses/[courseSlug]/layout.tsx` and course overview page; updated `components/lesson-breadcrumb.tsx` (Section > Lesson); `components/site-header.tsx` logo linking to `/`.

**Addresses:** Homepage redesign (FEATURES.md P1), section-aware sidebar (FEATURES.md P1), unified Python Course entry point (FEATURES.md P1).

**Avoids:** Pitfall 15 (homepage layout bleeding into course layout — use Next.js App Router route groups to isolate marketing layout from app layout).

**Research flag:** Standard patterns — shadcn/ui component composition, App Router Server Components, Tailwind utility layout. No additional research needed.

### Phase 3: Lesson Reading Experience (ToC + Typography + Syntax Highlighting)

**Rationale:** These three features share the lesson page layout and MDX pipeline. They are naturally grouped: the 3-column layout introduces the ToC column, typography changes tune the prose column, and syntax highlighting enhances the code blocks already in the article. All three are independent of Phase 2 UI changes.

**Delivers:** `components/lesson-toc.tsx` with `IntersectionObserver` active heading tracking; `app/courses/[courseSlug]/[lessonSlug]/page.tsx` updated to 3-column layout with server-side `extractHeadings()`; `@shikijs/transformers` in `next.config.mjs`; line number CSS and diff notation CSS in `globals.css`; Tailwind typography tuning (prose max-width 65ch, line-height, heading spacing).

**Addresses:** Per-lesson ToC with active highlighting (FEATURES.md P1), enhanced syntax highlighting (FEATURES.md P1), reading typography overhaul (FEATURES.md P1).

**Avoids:** Pitfall 9 (duplicate heading anchor IDs — use `github-slugger`), Pitfall 10 (Turbopack — stay on Webpack), Pitfall 16 (dark mode theme sync — verify `next-themes` uses `attribute="class"` to match `.dark` CSS selector rehype-pretty-code generates).

**Research flag:** `@stefanprobst/rehype-extract-toc` integration with `@next/mdx` is MEDIUM confidence (one practical walkthrough source). If the named MDX export via `/mdx` sub-path fails with the current `@next/mdx` setup, the fallback path (`extractHeadings()` regex + `github-slugger` in the Server Component) is fully specified in ARCHITECTURE.md at HIGH confidence — no blocking gap.

### Phase 4: Lesson Chunking (Pilot — 10 Lessons)

**Rationale:** Lesson chunking is HIGH effort (content edits to MD files) and HIGH implementation risk (data model decisions on progress tracking, pilot scope discipline). Research strongly recommends a 10-lesson pilot before committing to all 120 files. This phase is P2 and explicitly gated on user session data showing students not finishing full lessons.

**Delivers:** `<Patch>` MDX component in `mdx-components.tsx`; patch boundary markers added to 10 pilot lessons; patch-level progress tracking schema extension in Zustand store (separate key namespace from lesson-level keys); embedded Pyodide code runner placement convention within patches.

**Addresses:** Lesson chunking in-page patches (FEATURES.md P2), embedded practice within patches (FEATURES.md P2), patch-level progress tracking (FEATURES.md P3).

**Avoids:** Pitfall 7 (progress tracking ambiguity — commit to Option A: each patch tracked as independent lesson slug, `lessonSlug` becomes `lesson-03-patch-1`; update `getCourseProgress` denominator to reflect actual patch count), Pitfall on URL splitting (in-page anchor navigation only — no new routes), lesson count inflation in progress bar.

**Research flag:** Lesson chunking UX patterns (patch navigation display labeling, per-section completion checkpoints) benefit from `/gsd:research-phase` before implementation. The data model decision (Option A vs B for progress granularity) must be locked before any content editing begins — downstream implications for the progress bar denominator are significant.

### Phase Ordering Rationale

- Phase 1 precedes all others: the data model and migration are the dependency root; building UI before the migration is tested creates rework if the migration changes types.
- Phase 2 and Phase 3 can be partially parallelized (homepage has no dependency on lesson page layout), but the 3-column lesson page layout in Phase 3 should be stable before Phase 4 adds `<Patch>` components inside it.
- Phase 4 is explicitly gated: ship v1.1 P1 features, collect usage data, then validate the chunking hypothesis before editing 120 MD files. Skipping the pilot scope is the most common failure mode for this type of feature.
- The 10-step build order in ARCHITECTURE.md (section-map → content.ts → progress.ts → layout/sidebar → course page → lesson-toc → lesson page → homepage → syntax highlighting → validation) maps directly to Phases 1-3 with step 8 (homepage) running in parallel with steps 4-7.

### Research Flags

Phases needing `/gsd:research-phase` during planning:
- **Phase 4 (Lesson Chunking):** UX patterns for sub-lesson progress display, patch navigation labeling ("Lesson 3, Part 2 of 3" vs raw patch count), and per-section completion checkpoints are not well-documented for this specific pattern. The data model choice (Option A: patch-as-lesson vs Option B: patch-within-lesson) has significant downstream implications for progress bar denominator and sidebar completion indicators.
- **Phase 3 (ToC — `@stefanprobst/rehype-extract-toc` integration):** MEDIUM confidence. If the named MDX export via `/mdx` sub-path fails, validate the fallback path early.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Data Model + Migration):** Zustand persist migration, TypeScript data modeling, and Next.js redirects are all HIGH confidence with official documentation.
- **Phase 2 (Homepage + Sidebar):** shadcn/ui `Collapsible`, App Router Server Components, and Tailwind layout composition are well-documented. No novel integration.
- **Phase 3 (Syntax Highlighting + Typography):** `@shikijs/transformers` is HIGH confidence (official Shiki docs, package version verified). Typography is CSS-only tuning.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against installed versions in `package.json`; version constraints confirmed against official docs and npm; alternatives systematically evaluated |
| Features | HIGH | Direct codebase inspection; all existing components and their props catalogued; feature dependency graph explicitly traced |
| Architecture | HIGH | All source files read directly; data flow and component boundaries derived from actual code, not inference; build order is dependency-respecting and verified |
| Pitfalls | HIGH | All critical pitfalls cross-referenced with official docs, GitHub issues, or community sources; Zustand migration, dynamic import issues, and Turbopack incompatibility have documented resolution paths |

**Overall confidence:** HIGH

### Gaps to Address

- **`gray-matter` installation status:** STACK.md notes it may not be installed despite being listed as recommended in v1.0 (current `lib/content.ts` uses regex). Verify with `pnpm list gray-matter` at the start of Phase 1 before writing code that depends on it.
- **`lib/notebook-urls.ts` resolution strategy post-consolidation:** Two valid options exist — single `python` key vs. keep 12 keys resolved by `sourceCourseSlug`. The 12-key approach requires less re-setup and is recommended, but this decision should be explicit and documented at the start of Phase 1 to avoid inconsistency.
- **`@stefanprobst/rehype-extract-toc` MDX sub-path export compatibility:** MEDIUM confidence that the `/mdx` sub-path export works with the specific `@next/mdx` version installed (Next.js issue #73757 edge case). Validate with a one-file spike early in Phase 3. The fallback (`extractHeadings()` in Server Component) is fully specified and ready.
- **Lesson chunking trigger validation:** Phase 4 is gated on user session data showing students not finishing full lessons. If analytics are not currently collected, define a proxy metric (e.g., lesson completion rate from Zustand progress data, which is already persisted) before Phase 4 is prioritized.

## Sources

### Primary (HIGH confidence)
- Installed `package.json` and `node_modules` inspection (March 2026) — all installed versions confirmed
- Direct codebase inspection: `lib/content.ts`, `lib/exercises.ts`, `lib/store/progress.ts`, `next.config.mjs`, `mdx-components.tsx`, `components/course-sidebar.tsx`, `app/courses/[courseSlug]/[lessonSlug]/page.tsx`
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — `@next/mdx` App Router configuration
- [rehype-pretty-code official docs](https://rehype-pretty.pages.dev/) — line numbers, transformer options verified
- [Shiki transformers docs](https://shiki.style/packages/transformers) — `@shikijs/transformers` 4.0.2 version confirmed
- [Next.js redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) — redirect configuration
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — static path generation
- [CSS-Tricks: IntersectionObserver for ToC](https://css-tricks.com/table-of-contents-with-intersectionobserver/) — canonical scroll spy pattern
- [Next.js issue #73757](https://github.com/vercel/next.js/issues/73757) — ESM sub-path plugin resolution failure documented

### Secondary (MEDIUM confidence)
- [@stefanprobst/rehype-extract-toc npm](https://www.npmjs.com/package/@stefanprobst/rehype-extract-toc) — v3.0.0 MDX named export via `/mdx` sub-path confirmed
- [MDX table of contents in Next.js](https://www.nikolailehbr.ink/blog/mdx-table-of-contents/) — App Router implementation walkthrough
- [Intersection Observer for active ToC section](https://www.emgoto.com/react-table-of-contents/) — React ToC pattern
- [Zustand persist migration](https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp) — migration function pattern
- [rehype-pretty-code Turbopack incompatibility](https://www.sather.ws/writing/shiki-code-blocks-turbopack) — incompatibility documented
- [Content chunking for e-learning](https://theelearningcoach.com/elearning_design/chunking-information/) — ideal chunk = 3-7 units of information

### Tertiary (LOW confidence)
- None — no findings rely solely on low-confidence sources.

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
