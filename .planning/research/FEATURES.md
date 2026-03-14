# Feature Research

**Domain:** JustLearn v1.1 — lesson chunking, course consolidation, homepage redesign, enhanced syntax highlighting on an existing Next.js 15 + MDX learning platform
**Researched:** 2026-03-14
**Confidence:** HIGH (existing codebase directly inspected; patterns verified against live platforms)

---

## Existing v1.0 Baseline (Do Not Re-Implement)

These are BUILT. New features extend or compose with them — never replace.

| Existing Feature | File/Component | v1.1 Role |
|-----------------|---------------|-----------|
| Course catalog grid | `app/courses/page.tsx` | Superseded by unified course entry point |
| Course sidebar with completion icons | `components/course-sidebar.tsx` | Extend with section grouping |
| MDX rendering + `rehype-slug` | `next.config.mjs` | Heading IDs already exist — ToC extracts from these |
| Syntax highlighting via `rehype-pretty-code` v0.14.3 + Shiki v4 | `next.config.mjs` | Enhance with `@shikijs/transformers` |
| Progress tracking (Zustand + localStorage) | `lib/store/progress` | Extend schema for patch-level tracking |
| Prev/next navigation | `components/lesson-nav.tsx` | Keep as-is; still course-scoped |
| Full-text search (Fuse.js) | `components/search/` | No changes needed |
| Homepage | `app/page.tsx` | Currently a redirect — replace with real page |
| Pyodide code runner | `components/code-runner/` | Embed within lesson patches |
| Animated mindmaps | `components/mindmap/` | No changes needed |
| NotebookLM integration | `components/notebook-lm/` | No changes needed |

---

## Feature Landscape

### Table Stakes (Users Expect These for v1.1)

Features that must exist for the v1.1 milestone to feel complete. Missing any of these = the overhaul feels unfinished.

| Feature | Why Expected | Complexity | Dependencies on Existing |
|---------|--------------|------------|--------------------------|
| Real homepage with JustLearn branding | Any named platform has a landing page; a redirect to `/courses` signals an unfinished product | LOW | Replace `app/page.tsx` redirect; reuse `site-header.tsx` and existing shadcn/ui components |
| Single unified Python Course entry point | Beginners expect one "Python Course" to click, not 12 separate courses to evaluate | MEDIUM | New `getUnifiedCourse()` in `lib/content.ts`; new route `/course/python` or restructured `/courses` page |
| Section grouping in the lesson sidebar | 120 flat lessons in one sidebar list is unusable; sections provide orientation | MEDIUM | Extend `CourseSidebar` component; requires `Section[]` type added to course data model |
| Per-lesson table of contents | 2-hour, 4-part lessons have no in-page navigation; users lose their place | MEDIUM | `rehype-slug` already adds heading IDs; needs heading extraction utility + new sticky ToC component |
| Active section highlighting in ToC | Without active-state tracking, a ToC is just a jump list — not a progress aid | MEDIUM | Requires Intersection Observer client hook; composes with ToC component |
| Enhanced code syntax highlighting | Existing `github-light`/`github-dark-dimmed` themes work but lack line-level features (diff, focus, highlight) that competing platforms offer | LOW | Add `@shikijs/transformers` to `next.config.mjs`; no MDX file changes required unless notation comments are added to existing lessons |
| Improved reading typography and layout | "Medium-quality reading experience" is the explicit milestone goal; current prose spacing is functional but not polished | LOW | `@tailwindcss/typography` is already installed; tune `prose` max-width, line-height, heading spacing in global CSS |

### Differentiators (Competitive Advantage)

Features that go beyond what users expect and reinforce JustLearn's core value proposition.

| Feature | Value Proposition | Complexity | Dependencies on Existing |
|---------|-------------------|------------|--------------------------|
| In-page lesson patches (chunked lesson sections) | Replaces 2-hour monolith lessons with focused 20-30 minute reading chunks; reduces cognitive overload for absolute beginners | HIGH | Requires MDX `<Patch>` custom component in `mdx-components.tsx` OR convention-based H3 boundary chunks; `rehype-slug` composes naturally |
| Embedded practice within lesson patches | Learning-while-reading at the point of instruction, not at the end — reduces context switch cost | MEDIUM | Pyodide code-runner already built; needs placement convention inside patches and patch-aware MDX layout |
| Patch-level reading progress | Granular progress within a long lesson (e.g., "3 of 4 parts done") gives beginners a sense of momentum on large lessons | MEDIUM | Extends Zustand progress store with a new key schema; additive — does not break existing lesson-level progress keys |
| Shiki line-level code annotations | Highlight specific lines, show diffs, focus on changed code — makes code explanations dramatically clearer for beginners | LOW | `@shikijs/transformers` package; configured in `next.config.mjs`; notation uses comment syntax inside code fences |
| Section-aware prev/next navigation | Currently prev/next is lesson-scoped within a course; unified course needs section-aware prev/next that crosses former course boundaries | MEDIUM | Extends `components/lesson-nav.tsx`; depends on unified course data model |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like obvious improvements but create significant downstream problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Split each lesson into separate URL pages per chunk | "Clean chunking" — one URL per patch feels right | Breaks existing progress keys (`courseSlug + lessonSlug`), multiplies static pages 4x (120 → 480+), requires URL redesign, invalidates all stored user progress with no migration path | In-page chunking with `<Patch>` MDX component and anchor IDs — same URL, no progress migration needed |
| Full routing rebuild for course consolidation | 12 courses becoming 1 seems to require new URLs | Breaking `/courses/[courseSlug]/[lessonSlug]` pattern destroys stored progress in localStorage (key format `courseSlug + lessonSlug`); all 300 students lose their progress | Keep lesson URLs stable; add new `/course/python` unified entry point as a new route without removing old course routes |
| Replace rehype-pretty-code with custom highlighter | Current setup has limitations | `rehype-pretty-code` v0.14.3 with Shiki v4 already supports every needed feature via `@shikijs/transformers`; replacement adds weeks of work and breaks existing raw-code extraction visitors (`extractRawCode`, `forwardRawCode`) in `next.config.mjs` | Add `@shikijs/transformers` to existing config — config-only change |
| Infinite scroll on lesson list | Feels modern | Hides section structure that beginners need for orientation; 120 items with section headers is fully navigable | Collapsible section groups in sidebar with expand/collapse state (shadcn/ui `Collapsible` component) |
| Generate ToC from a separate MDX frontmatter field | Explicit control over ToC entries | Manual maintenance burden across 120 lesson files; frontmatter diverges from actual heading structure over time | Extract from actual heading AST via remark plugin — always in sync with content |

---

## Feature Dependencies

```
[Homepage Redesign]
    └── standalone — no deps on other new features; can ship first

[Unified Python Course data model]
    └──requires──> [New Section type in lib/content.ts]
    └──requires──> [New getUnifiedCourse() function]
    └──enables──> [Section-aware Sidebar]
    └──enables──> [Section-aware prev/next navigation]

[Section-aware Sidebar]
    └──requires──> [Unified Python Course data model]
    └──extends──> [Existing CourseSidebar component]

[Per-lesson Table of Contents]
    └──requires──> [rehype-slug — already present]
    └──requires──> [Heading extraction utility (remark plugin or regex over MD source)]
    └──enables──> [Active section highlighting in ToC]
    └──composes-with──> [Lesson Chunking] (patch H3 headings become ToC entries naturally)

[Active Section Highlighting in ToC]
    └──requires──> [Per-lesson Table of Contents]
    └──requires──> [Intersection Observer client hook (new)]

[Enhanced Syntax Highlighting]
    └──requires──> [@shikijs/transformers package]
    └──extends──> [Existing rehype-pretty-code config in next.config.mjs]
    └── standalone — no deps on other new features

[Reading Typography / Layout Overhaul]
    └──requires──> [@tailwindcss/typography already installed]
    └── standalone — CSS/Tailwind config changes only

[Lesson Chunking — in-page patches]
    └──requires──> [MDX <Patch> custom component in mdx-components.tsx]
    └──requires──> [Lesson content authors add patch boundaries to MD files]
    └──composes-with──> [Per-lesson ToC] (patch section headings map to ToC entries)
    └──enables──> [Embedded practice within patches]
    └──enables──> [Patch-level progress tracking]

[Embedded Practice within Patches]
    └──requires──> [Lesson Chunking]
    └──extends──> [Existing Pyodide code-runner component]

[Patch-level Progress Tracking]
    └──requires──> [Lesson Chunking]
    └──requires──> [Zustand store schema extension]
    └──additive-to──> [Existing lesson-level progress keys] (does NOT conflict if implemented as separate key namespace)
```

### Critical Dependency Notes

- **Course consolidation must NOT break lesson URLs.** The existing URL pattern `/courses/[courseSlug]/[lessonSlug]` is the key for all localStorage progress entries. Add a new unified entry point; do not remove the existing route structure.
- **Lesson chunking is the highest-risk feature.** It requires content edits to 120 MD files (adding patch boundary markers) AND a new MDX component. This is HIGH effort and should be scoped carefully — start with 10 lessons as a pilot.
- **ToC heading extraction must stay in sync with content.** Using remark to extract headings from the AST (not from frontmatter) guarantees accuracy. The `rehype-slug` IDs are the anchor targets.
- **`@shikijs/transformers` adds notation via comment syntax in code blocks.** Existing lesson code blocks work unchanged; notation comments are additive and only needed when you want line-level effects.

---

## MVP Definition for v1.1

### Launch With (these define the milestone — all P1)

- [ ] **Homepage with JustLearn branding** — Platform identity; high impact, low effort; currently just a one-line redirect
- [ ] **Unified Python Course entry point with section grouping** — Eliminates 12-course confusion for beginners; requires new data model in `lib/content.ts`
- [ ] **Section-aware sidebar** — Without section headers, 120 lessons in one sidebar list is unusable
- [ ] **Per-lesson ToC with active section highlighting** — Core remedy for 2-hour lesson navigation problem
- [ ] **Enhanced syntax highlighting** — `@shikijs/transformers` for line highlights and diff notation; config-level change
- [ ] **Reading typography overhaul** — Prose max-width, line-height, heading spacing via Tailwind typography config

### Add After Validation (v1.1.x — when patch model is confirmed)

- [ ] **Lesson chunking as in-page patches** — Trigger: user session data shows students not finishing full lessons; pilot with 10 lessons
- [ ] **Embedded practice within patches** — Trigger: patches are shipped; code-runner placement confirmed as useful at chunk boundary
- [ ] **Patch-level progress tracking** — Trigger: patches are shipped; granular progress adds visible value

### Future Consideration (v2+)

- [ ] **Reading time estimates per patch** — Nice UX signal but not blocking
- [ ] **Automated patch boundary generation** — AI-assisted chunking of existing MD files to avoid manual editing of 120 files
- [ ] **Patch-level completion badges** — Deferred until patch model is validated with real usage

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Homepage redesign | HIGH | LOW | P1 |
| Unified Python Course + section grouping | HIGH | MEDIUM | P1 |
| Section-aware sidebar | HIGH | MEDIUM | P1 |
| Per-lesson ToC with active highlighting | HIGH | MEDIUM | P1 |
| Enhanced syntax highlighting | MEDIUM | LOW | P1 |
| Reading typography / layout overhaul | HIGH | LOW | P1 |
| Lesson chunking (in-page patches) | HIGH | HIGH | P2 |
| Embedded practice within patches | MEDIUM | MEDIUM | P2 |
| Patch-level progress tracking | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v1.1 launch
- P2: Should have — add after P1 validation
- P3: Nice to have — future consideration

---

## Competitor Feature Analysis

Reference platforms for UX patterns relevant to this milestone:

| Feature | Nextra (docs) | Josh W. Comeau blog | Codecademy | Our Approach |
|---------|---------------|---------------------|------------|--------------|
| Table of contents | Sticky right sidebar, Intersection Observer active highlighting | Floating ToC, auto-highlights on scroll | Collapsible section nav in left sidebar | Sticky right panel with Intersection Observer; headings extracted from `rehype-slug` IDs at build time |
| Syntax highlighting | Shiki built-in, line focus, diff notation | rehype-pretty-code, line highlights | Custom theme, line numbers | Add `@shikijs/transformers` to existing `rehype-pretty-code` config |
| Course consolidation | Not applicable (docs tool) | Not applicable (blog) | Single course with modules → lessons hierarchy | One unified `/course/python` route with `sections[]` grouping; lesson URLs unchanged |
| Lesson chunking | N/A | Long articles with clear H2 structure | Lessons are already short (5-10 min) | In-page `<Patch>` MDX components with H3 boundaries and anchor IDs |
| Reading experience | Max-width prose, generous spacing | Optimized typography (65ch line length, 1.75 line-height) | Functional but dense | Tailwind `prose` class already installed; tune `max-w-prose`, `leading-relaxed` |
| Homepage | Project-specific landing | Personal blog home | Onboarding funnel with value prop + CTA | Branded hero, single CTA to start Python Course, no redirect |

---

## Implementation Notes by Feature

### Homepage Redesign
`app/page.tsx` is currently a one-line `redirect('/courses')`. Replace with a React Server Component containing: hero section (JustLearn brand name + tagline), brief value proposition (3 bullets), single CTA linking to the unified Python Course. Reuse `site-header.tsx`. No backend or data changes needed.

### Course Consolidation
Add `Section` type to `lib/content.ts`. Each `Section` maps to one of the 12 existing course directories. Add `getUnifiedCourse()` that returns a single unified course object with `sections: Section[]`. Create new route `/course/python/page.tsx`. Keep all existing `/courses/[courseSlug]/[lessonSlug]` routes functional — do not remove. `CourseSidebar` gets a `sections` prop; renders collapsible section groups using shadcn/ui `Collapsible`.

### Table of Contents
At the lesson page server component level, extract H2/H3 headings from the raw MD source using either `remark` with a custom extractor or regex. Pass extracted `{ id, text, level }[]` as a prop to the lesson layout. Render as a sticky right-column panel (`position: sticky; top: 5rem; max-height: calc(100vh - 5rem); overflow-y: auto`). Hide on screens below `lg` breakpoint. Active highlighting uses `IntersectionObserver` in a `'use client'` component that watches heading elements and updates the highlighted ToC entry.

### Enhanced Syntax Highlighting
Install `@shikijs/transformers`. Add to `next.config.mjs` `rehypePrettyCodeOptions.transformers` array. Supported notations (via comment syntax in code blocks): `// [!code highlight]`, `// [!code diff]`, `// [!code focus]`, `// [!code warning]`. No changes to existing lesson MD files required for the config upgrade; notation comments are added opportunistically to new or updated lessons.

### Lesson Chunking
Recommended approach: define `<Patch>` as an MDX custom component in `mdx-components.tsx`. Each `<Patch>` wraps a logical lesson section with an anchor ID and optional title. Existing `### Part N:` H3 headings become patch boundaries by convention. Do NOT create separate URL pages per patch — lesson URL remains `/courses/[courseSlug]/[lessonSlug]`. Pilot with 10 lessons (one per original H3 section) before committing to all 120 files.

---

## Sources

- Existing codebase: `lib/content.ts`, `next.config.mjs`, `components/course-sidebar.tsx`, `app/page.tsx`, `package.json` — HIGH confidence (direct inspection)
- [rehype-pretty-code official docs](https://rehype-pretty.pages.dev/) — Shiki transformer support confirmed — HIGH confidence
- [Next.js MDX guide](https://nextjs.org/docs/app/guides/mdx) — `@next/mdx` configuration — HIGH confidence
- [Shiki transformers — code-highlighting guide](https://velite.js.org/guide/code-highlighting) — transformer notation syntax — MEDIUM confidence
- [Adding ToC to MDX in Next.js — rehype-toc pattern](https://codevup.com/posts/how-to-add-toc-to-mdx-in-nextjs-with-reype/) — MEDIUM confidence
- [Intersection Observer for active ToC section](https://www.emgoto.com/react-table-of-contents/) — React ToC pattern — MEDIUM confidence
- [Content chunking for e-learning — eLearning Coach](https://theelearningcoach.com/elearning_design/chunking-information/) — ideal chunk = 3-7 units of information — MEDIUM confidence
- [Confusing course navigation — LMS Portals](https://www.lmsportals.com/post/confusing-course-navigation-is-undermining-your-content) — navigation UX impact on completion rates — MEDIUM confidence

---

*Feature research for: JustLearn v1.1 UX Overhaul milestone*
*Researched: 2026-03-14*
