# Requirements: Python Beginner Learning Platform

**Defined:** 2026-03-14
**Core Value:** Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

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

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 1 | Complete |
| CONT-03 | Phase 1 | Complete |
| CONT-04 | Phase 1 | Complete |
| LAYO-01 | Phase 1 | Complete |
| LAYO-02 | Phase 1 | Complete |
| LAYO-03 | Phase 1 | Complete |
| LAYO-04 | Phase 1 | Complete |
| LAYO-05 | Phase 1 | Complete |
| LAYO-06 | Phase 1 | Complete |
| PROG-01 | Phase 2 | Complete |
| PROG-02 | Phase 2 | Complete |
| PROG-03 | Phase 2 | Complete |
| CODE-01 | Phase 2 | Complete |
| CODE-02 | Phase 2 | Complete |
| CODE-03 | Phase 2 | Complete |
| CODE-04 | Phase 2 | Complete |
| CODE-05 | Phase 2 | Complete |
| CODE-06 | Phase 2 | Complete |
| MIND-01 | Phase 3 | Complete |
| MIND-02 | Phase 3 | Complete |
| MIND-03 | Phase 3 | Complete |
| MIND-04 | Phase 3 | Complete |
| SRCH-01 | Phase 3 | Complete |
| SRCH-02 | Phase 3 | Complete |
| SRCH-03 | Phase 3 | Complete |
| NBLM-01 | Phase 3 | Complete |
| NBLM-02 | Phase 3 | Complete |
| NBLM-03 | Phase 3 | Complete |
| ANIM-01 | Phase 3 | Complete |
| ANIM-02 | Phase 3 | Complete |
| ANIM-03 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation — all 32 requirements mapped*
