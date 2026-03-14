# Requirements: JustLearn

**Defined:** 2026-03-14
**Core Value:** Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification

## v1.0 Requirements (Validated)

All v1.0 requirements shipped and validated.

### Content Pipeline

- [x] **CONT-01**: Lesson pages render existing Markdown files with syntax-highlighted Python code blocks (Shiki, compile-time)
- [x] **CONT-02**: Course catalog page displays all 12 courses with lesson count and description
- [x] **CONT-03**: Each course page lists all its lessons with titles and brief descriptions
- [x] **CONT-04**: Code blocks have copy-to-clipboard button

### Layout & Navigation

- [x] **LAYO-01**: Medium-inspired reading layout with optimal typography (65-75 char line width, 1.75 line-height)
- [x] **LAYO-02**: Course sidebar navigation showing all lessons in current course
- [x] **LAYO-03**: Previous/next lesson navigation at bottom of each lesson page
- [x] **LAYO-04**: Breadcrumb navigation (Home > Course > Lesson)
- [x] **LAYO-05**: Mobile-responsive layout tested at 375px breakpoint
- [x] **LAYO-06**: Dark/light mode toggle with no FOUC (blocking script in head)

### Progress Tracking

- [x] **PROG-01**: Lesson completion state persisted in localStorage
- [x] **PROG-02**: Course progress percentage displayed on course catalog and course pages
- [x] **PROG-03**: Visual completion indicators on lesson sidebar (completed/in-progress/not-started)

### Interactive Code Runner

- [x] **CODE-01**: In-browser Python execution via Pyodide WASM (no server required)
- [x] **CODE-02**: Pyodide runs in Web Worker to prevent UI blocking
- [x] **CODE-03**: Pyodide lazy-loaded on first "Run" click (not on page load)
- [x] **CODE-04**: Code editor with Python syntax support (CodeMirror 6)
- [x] **CODE-05**: Output panel showing stdout/stderr from executed code
- [x] **CODE-06**: Loading state UX during Pyodide cold start (~2-3 seconds)

### Animated Mindmaps

- [x] **MIND-01**: Animated concept mindmap displayed per lesson using ReactFlow
- [x] **MIND-02**: Mindmap data defined in JSON alongside lesson content
- [x] **MIND-03**: Zoom/pan interaction on mindmap nodes
- [x] **MIND-04**: Smooth entrance animations on mindmap nodes (Framer Motion)

### Search

- [x] **SRCH-01**: Client-side fuzzy search across all lesson titles and content (Fuse.js)
- [x] **SRCH-02**: Search results page with highlighted matches and links to lessons
- [x] **SRCH-03**: Search accessible from global header/navigation

### NotebookLM Integration

- [x] **NBLM-01**: NotebookLM link per course page directing students to AI-powered Q&A grounded in course materials
- [x] **NBLM-02**: Clear UX explaining what NotebookLM is and how to use it for learning
- [x] **NBLM-03**: Pre-seeded NotebookLM notebooks created from course MD files (12 notebooks)

### Animations & Polish

- [x] **ANIM-01**: Smooth page transitions between lessons and courses (Framer Motion)
- [x] **ANIM-02**: Micro-animations on interactive elements (buttons, toggles, cards)
- [x] **ANIM-03**: Skeleton loading states for dynamic content

## v1.1 Requirements

Requirements for UX overhaul milestone. Each maps to roadmap phases.

### Homepage & Branding

- [ ] **HOME-01**: Homepage displays hero section with JustLearn branding, tagline, and CTA to start the course
- [ ] **HOME-02**: Homepage shows section overview cards (12 sections) with lesson counts and progress
- [ ] **HOME-03**: Site header displays JustLearn wordmark with conditional "Start Learning" CTA
- [ ] **HOME-04**: Header gains backdrop blur and border on scroll

### Course Structure

- [x] **STRUCT-01**: 12 separate courses consolidated into a unified "Python" course with 12 sections (virtual — no file moves)
- [x] **STRUCT-02**: Course overview page shows accordion-style section list with per-section progress
- [x] **STRUCT-03**: Sidebar navigation grouped by sections with expand/collapse
- [x] **STRUCT-04**: Zustand progress store migrated from 12 course keys to unified `python` key with backward-compatible migration
- [x] **STRUCT-05**: Breadcrumbs updated to reflect unified course hierarchy (Course > Section > Lesson)

### Lesson Chunking & ToC

- [ ] **CHUNK-01**: Per-lesson table of contents extracted from headings, displayed as sticky sidebar (desktop) / collapsible bar (mobile)
- [ ] **CHUNK-02**: Active heading highlighted in ToC via Intersection Observer scroll spy
- [ ] **CHUNK-03**: Lesson scroll progress indicator (thin bar at top of viewport)
- [ ] **CHUNK-04**: Patch dividers between lesson sections with "Part X of Y" labels

### Reading Experience

- [ ] **READ-01**: Warm-neutral color palette applied (off-white backgrounds, growth-green primary)
- [ ] **READ-02**: Body text increased to 18px with 1.75 line-height for reading comfort
- [ ] **READ-03**: JetBrains Mono loaded for code blocks (replacing browser default monospace)
- [ ] **READ-04**: Blockquotes styled as key-concept callouts with green left border
- [ ] **READ-05**: Callout MDX components (Tip, Warning, Info) with distinct color treatments

### Code Syntax Highlighting

- [ ] **CODE-07**: Code blocks display language badge in header bar
- [ ] **CODE-08**: Copy button always visible on mobile (not hover-only)
- [ ] **CODE-09**: Line highlighting support via `@shikijs/transformers` (`[!code highlight]`, `[!code focus]`)
- [ ] **CODE-10**: Diff notation support (`[!code ++]`, `[!code --]`) for showing code changes

### Practice

- [ ] **PRACT-01**: Inline "Try it yourself" practice blocks within lessons with embedded code runner
- [ ] **PRACT-02**: Expandable hint and solution sections in practice blocks

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication

- **AUTH-01**: User can create account with email/password
- **AUTH-02**: Server-side progress sync across devices
- **AUTH-03**: Student dashboard with learning analytics

### Gamification

- **GAME-01**: XP points for lesson completion
- **GAME-02**: Achievement badges for course completion
- **GAME-03**: Learning streak tracking

### Community

- **COMM-01**: Comment section on each lesson
- **COMM-02**: Student Q&A forum per course

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Adds weeks of dev time; localStorage sufficient for 300 students |
| Payment/subscription | Free platform; no monetization needed |
| Video content hosting | Text + interactive code covers learning objectives |
| Real-time collaboration | Individual learning is the stated model |
| Native mobile app | Web-first; responsive design sufficient |
| Custom LLM/AI training | NotebookLM is free, grounded in course materials |
| Course authoring CMS | Content exists as MD files; direct editing sufficient |
| NotebookLM iframe embed | CSP blocks it; link-out pattern is viable alternative |
| Lesson pagination (multi-page) | In-page chunking with anchors avoids progress key migration |
| File reorganization (moving MD files) | Virtual consolidation via section-map avoids breaking builds |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 1 (v1.0) | Complete |
| CONT-02 | Phase 1 (v1.0) | Complete |
| CONT-03 | Phase 1 (v1.0) | Complete |
| CONT-04 | Phase 1 (v1.0) | Complete |
| LAYO-01 | Phase 1 (v1.0) | Complete |
| LAYO-02 | Phase 1 (v1.0) | Complete |
| LAYO-03 | Phase 1 (v1.0) | Complete |
| LAYO-04 | Phase 1 (v1.0) | Complete |
| LAYO-05 | Phase 1 (v1.0) | Complete |
| LAYO-06 | Phase 1 (v1.0) | Complete |
| PROG-01 | Phase 2 (v1.0) | Complete |
| PROG-02 | Phase 2 (v1.0) | Complete |
| PROG-03 | Phase 2 (v1.0) | Complete |
| CODE-01 | Phase 2 (v1.0) | Complete |
| CODE-02 | Phase 2 (v1.0) | Complete |
| CODE-03 | Phase 2 (v1.0) | Complete |
| CODE-04 | Phase 2 (v1.0) | Complete |
| CODE-05 | Phase 2 (v1.0) | Complete |
| CODE-06 | Phase 2 (v1.0) | Complete |
| MIND-01 | Phase 3 (v1.0) | Complete |
| MIND-02 | Phase 3 (v1.0) | Complete |
| MIND-03 | Phase 3 (v1.0) | Complete |
| MIND-04 | Phase 3 (v1.0) | Complete |
| SRCH-01 | Phase 3 (v1.0) | Complete |
| SRCH-02 | Phase 3 (v1.0) | Complete |
| SRCH-03 | Phase 3 (v1.0) | Complete |
| NBLM-01 | Phase 3 (v1.0) | Complete |
| NBLM-02 | Phase 3 (v1.0) | Complete |
| NBLM-03 | Phase 3 (v1.0) | Complete |
| ANIM-01 | Phase 3 (v1.0) | Complete |
| ANIM-02 | Phase 3 (v1.0) | Complete |
| ANIM-03 | Phase 3 (v1.0) | Complete |
| STRUCT-01 | Phase 4 (v1.1) | Complete |
| STRUCT-04 | Phase 4 (v1.1) | Complete |
| HOME-01 | Phase 5 (v1.1) | Pending |
| HOME-02 | Phase 5 (v1.1) | Pending |
| HOME-03 | Phase 5 (v1.1) | Pending |
| HOME-04 | Phase 5 (v1.1) | Pending |
| STRUCT-02 | Phase 5 (v1.1) | Complete |
| STRUCT-03 | Phase 5 (v1.1) | Complete |
| STRUCT-05 | Phase 5 (v1.1) | Complete |
| READ-01 | Phase 6 (v1.1) | Pending |
| READ-02 | Phase 6 (v1.1) | Pending |
| READ-03 | Phase 6 (v1.1) | Pending |
| READ-04 | Phase 6 (v1.1) | Pending |
| READ-05 | Phase 6 (v1.1) | Pending |
| CHUNK-01 | Phase 6 (v1.1) | Pending |
| CHUNK-02 | Phase 6 (v1.1) | Pending |
| CHUNK-03 | Phase 6 (v1.1) | Pending |
| CHUNK-04 | Phase 6 (v1.1) | Pending |
| CODE-07 | Phase 6 (v1.1) | Pending |
| CODE-08 | Phase 6 (v1.1) | Pending |
| CODE-09 | Phase 6 (v1.1) | Pending |
| CODE-10 | Phase 6 (v1.1) | Pending |
| PRACT-01 | Phase 6 (v1.1) | Pending |
| PRACT-02 | Phase 6 (v1.1) | Pending |

**Coverage:**
- v1.0 requirements: 32 total (all complete)
- v1.1 requirements: 24 total
- Mapped to phases: 24/24
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 — v1.1 traceability complete (Phases 4-6)*
