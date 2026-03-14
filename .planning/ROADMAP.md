# Roadmap: JustLearn

## Milestones

- v1.0 MVP — Phases 1-3 (shipped 2026-03-14)
- v1.1 JustLearn UX Overhaul — Phases 4-6 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-3) — SHIPPED 2026-03-14</summary>

### Phase 1: Content + Reading Shell
**Goal**: Students can read any of the 120+ lessons with syntax-highlighted code, navigate the full course structure, and toggle dark/light mode — all served statically with no backend
**Depends on**: Nothing (first phase)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, LAYO-01, LAYO-02, LAYO-03, LAYO-04, LAYO-05, LAYO-06
**Success Criteria** (what must be TRUE):
  1. Student can browse the course catalog and see all 12 courses with lesson counts and descriptions
  2. Student can open any lesson and read Python code blocks with syntax highlighting and copy them to clipboard
  3. Student can navigate between lessons using the course sidebar and previous/next controls, with breadcrumb showing their location
  4. Student can switch between dark and light mode with no white flash (FOUC-free) on any device
  5. Layout is readable and correct at 375px viewport width with no horizontal overflow
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Next.js 15 project setup with App Router, shadcn/ui, Tailwind, and MDX content pipeline
- [x] 01-02-PLAN.md — Course catalog, course pages, and lesson pages with static route generation
- [x] 01-03-PLAN.md — Reading layout shell — typography, sidebar nav, prev/next, breadcrumbs, dark mode, mobile responsiveness

### Phase 2: Progress + Code Runner
**Goal**: Students can track their learning progress across sessions and execute Python code directly in the browser without any local setup
**Depends on**: Phase 1
**Requirements**: PROG-01, PROG-02, PROG-03, CODE-01, CODE-02, CODE-03, CODE-04, CODE-05, CODE-06
**Success Criteria** (what must be TRUE):
  1. Student can mark a lesson complete and the completion state survives a browser refresh or new session
  2. Course catalog and course pages show accurate completion percentage based on lessons the student has completed
  3. Sidebar lesson list shows distinct visual indicators for completed, in-progress, and not-started lessons
  4. Student can write Python in the in-lesson code editor and click Run to see stdout/stderr output in an adjacent panel
  5. Pyodide loads lazily on first Run click with a clear loading indicator; lesson content stays fully readable during the 2-3 second cold start
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Zustand progress store with localStorage persistence and sidebar completion indicators
- [x] 02-02-PLAN.md — Pyodide code runner — Web Worker execution, CodeMirror 6 editor, lazy load on first Run click

### Phase 3: Differentiators + Polish
**Goal**: Students experience the platform's unique features — visual concept maps, instant lesson search, AI-powered Q&A, and a polished animated interface — completing the full v1 product
**Depends on**: Phase 2
**Requirements**: MIND-01, MIND-02, MIND-03, MIND-04, SRCH-01, SRCH-02, SRCH-03, NBLM-01, NBLM-02, NBLM-03, ANIM-01, ANIM-02, ANIM-03
**Success Criteria** (what must be TRUE):
  1. Each lesson displays an animated concept mindmap students can zoom and pan to explore key concepts
  2. Student can type a query in the global search bar and see matching lessons with highlighted excerpts — no page reload required
  3. Each course page surfaces a clearly explained link to a pre-seeded NotebookLM notebook for AI-powered Q&A grounded in that course's content
  4. Page transitions between lessons and courses are smooth, and interactive elements have micro-animations that signal responsiveness
  5. Dynamic content areas display skeleton loading states rather than layout shifts during client hydration
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Animated mindmaps with ReactFlow, dagre layout, Motion entrance animations, and auto-generated per-lesson JSON
- [x] 03-02-PLAN.md — Client-side fuzzy search with build-time Fuse.js index, highlighted results, and SearchDialog in global header
- [x] 03-03-PLAN.md — NotebookLM link-out cards on course pages, Motion page transitions, and micro-animations

</details>

### v1.1 JustLearn UX Overhaul (In Progress)

**Milestone Goal:** Rebrand to JustLearn, consolidate 12 courses into a unified Python Course, overhaul lesson reading experience with in-page ToC and enhanced syntax highlighting, and add embedded practice blocks.

**UX Design Spec:** specs/v1.1-design-spec.md

- [ ] **Phase 4: Course Data Foundation** - Zustand progress migration + virtual course consolidation data model (lib/section-map.ts, updated lib/content.ts, permanent redirects)
- [ ] **Phase 5: Homepage + Navigation UI** - JustLearn homepage, section-grouped sidebar, unified course overview page, updated breadcrumbs
- [ ] **Phase 6: Lesson Reading, ToC, Highlighting, and Practice** - Reading typography overhaul, per-lesson ToC with scroll spy, enhanced syntax highlighting, embedded practice blocks

## Phase Details

### Phase 4: Course Data Foundation
**Goal**: The unified Python Course exists as a coherent data model and existing student progress is silently migrated to the new key scheme with no data loss
**Depends on**: Phase 3 (v1.0 complete)
**Requirements**: STRUCT-01, STRUCT-04
**Success Criteria** (what must be TRUE):
  1. A student who completed lessons before this phase still sees their progress intact after the migration — no lessons reset to incomplete
  2. `getUnifiedCourse()` returns all 120 lessons grouped under 12 sections without any physical file moves in the `courses/` directory
  3. All 12 legacy `/courses/{courseSlug}/` URL prefixes return 301 redirects pointing to the new unified course entry point
  4. The build completes without errors and all previously generated static pages remain accessible
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Zustand persist migration (version 0->1, merge 12 course keys into python key)
- [ ] 04-02-PLAN.md — lib/section-map.ts + lib/content.ts Section/UnifiedCourse types + getUnifiedCourse() + next.config.mjs 301 redirects

### Phase 5: Homepage + Navigation UI
**Goal**: Students land on a real JustLearn homepage and navigate the unified Python Course through a section-grouped sidebar, a course overview page with accordion sections, and updated breadcrumbs
**Depends on**: Phase 4
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, STRUCT-02, STRUCT-03, STRUCT-05
**Success Criteria** (what must be TRUE):
  1. A student visiting the root URL sees the JustLearn homepage with hero section, tagline, and a single CTA that takes them to the Python Course
  2. The site header displays the JustLearn wordmark on every page and the header gains a visible backdrop blur and border when the student scrolls down
  3. The Python Course overview page shows all 12 sections as an accordion with per-section lesson count and progress percentage
  4. The lesson sidebar groups lessons under their section headers with expand/collapse controls — the student can collapse sections they have completed
  5. Breadcrumb navigation reads "Python Course > Section Name > Lesson Title" on every lesson page
**Plans**: 2 plans

Plans:
- [ ] 05-01: app/page.tsx homepage (hero, value prop, CTA) + components/site-header.tsx JustLearn wordmark + scroll-triggered header border
- [ ] 05-02: Course overview page with accordion sections (STRUCT-02) + section-grouped collapsible sidebar (STRUCT-03) + breadcrumb update (STRUCT-05) + HOME-02 section overview cards

### Phase 6: Lesson Reading, ToC, Highlighting, and Practice
**Goal**: Students read lessons in a comfortable Medium-quality experience with warm typography, an in-page table of contents that tracks their scroll position, enhanced code blocks with diff and line highlighting, and embedded practice blocks within lesson content
**Depends on**: Phase 5
**Requirements**: READ-01, READ-02, READ-03, READ-04, READ-05, CHUNK-01, CHUNK-02, CHUNK-03, CHUNK-04, CODE-07, CODE-08, CODE-09, CODE-10, PRACT-01, PRACT-02
**Success Criteria** (what must be TRUE):
  1. Lesson body text renders at 18px with 1.75 line-height, warm-neutral background, JetBrains Mono for all code, and blockquotes styled as green-bordered callouts — matching the v1.1 design spec
  2. A sticky table of contents panel appears on desktop and a collapsible bar on mobile; the active heading is highlighted as the student scrolls through the lesson
  3. A thin progress bar at the top of the viewport fills as the student scrolls from top to bottom of the lesson
  4. Code blocks display a language badge, have a copy button always visible on mobile, and support `[!code highlight]`, `[!code focus]`, `[!code ++]`, and `[!code --]` notation rendering correctly
  5. Inline "Try it yourself" practice blocks appear within lesson content with an embedded code runner, expandable hints, and a reveal-solution control
**Plans**: 4 plans

Plans:
- [ ] 06-01-PLAN.md — Reading typography: warm-neutral palette, 18px/1.75 body, JetBrains Mono, blockquote callouts, Callout MDX components (READ-01..05)
- [ ] 06-02-PLAN.md — Lesson ToC: extractHeadings + LessonToc with scroll spy, scroll progress bar, patch dividers (CHUNK-01..04)
- [ ] 06-03-PLAN.md — Syntax highlighting: @shikijs/transformers, language badge, mobile copy button, diff/highlight CSS (CODE-07..10)
- [ ] 06-04-PLAN.md — Embedded practice blocks: PracticeBlock MDX component with code runner, expandable hint/solution (PRACT-01..02)

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Content + Reading Shell | v1.0 | 3/3 | Complete | 2026-03-14 |
| 2. Progress + Code Runner | v1.0 | 2/2 | Complete | 2026-03-14 |
| 3. Differentiators + Polish | v1.0 | 3/3 | Complete | 2026-03-14 |
| 4. Course Data Foundation | v1.1 | 0/2 | Not started | - |
| 5. Homepage + Navigation UI | v1.1 | 0/2 | Not started | - |
| 6. Lesson Reading, ToC, Highlighting, and Practice | v1.1 | 0/4 | Not started | - |
