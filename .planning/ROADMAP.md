# Roadmap: Python Beginner Learning Platform

## Overview

Three phases build the platform from the ground up. Phase 1 establishes every content route and the complete reading shell — without this, nothing else exists. Phase 2 layers on client-side state (progress tracking and in-browser Python execution) as isolated Client Components. Phase 3 delivers the differentiating features — animated mindmaps, full-text search, AI integration, and finishing polish — all independent of each other and executable in parallel.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Content + Reading Shell** - Statically generated lesson routes with Medium-quality reading experience, navigation, and dark mode
- [ ] **Phase 2: Progress + Code Runner** - Persistent lesson completion tracking and in-browser Python execution via Pyodide
- [ ] **Phase 3: Differentiators + Polish** - Animated mindmaps, full-text search, NotebookLM integration, and motion polish

## Phase Details

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
- [ ] 01-01: Next.js 15 project setup with App Router, shadcn/ui, Tailwind, and MDX content pipeline
- [ ] 01-02: Course catalog, course pages, and lesson pages with static route generation
- [ ] 01-03: Reading layout shell — typography, sidebar nav, prev/next, breadcrumbs, dark mode, mobile responsiveness

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
- [ ] 02-01: Zustand progress store with localStorage persistence and sidebar completion indicators
- [ ] 02-02: Pyodide code runner — Web Worker execution, CodeMirror 6 editor, lazy load on first Run click

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
- [ ] 03-01: Animated mindmaps — ReactFlow + Framer Motion with per-lesson JSON data
- [ ] 03-02: Client-side fuzzy search — build-time index, Fuse.js, search results UI in global header
- [ ] 03-03: NotebookLM integration — per-course link-out with UX explanation, plus page transitions and micro-animations

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Content + Reading Shell | 0/3 | Not started | - |
| 2. Progress + Code Runner | 0/2 | Not started | - |
| 3. Differentiators + Polish | 0/3 | Not started | - |
