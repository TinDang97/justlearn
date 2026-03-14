# Requirements: Python Beginner Learning Platform

**Defined:** 2026-03-14
**Core Value:** Students can learn Python step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Content Pipeline

- [ ] **CONT-01**: Lesson pages render existing Markdown files with syntax-highlighted Python code blocks (Shiki, compile-time)
- [ ] **CONT-02**: Course catalog page displays all 12 courses with lesson count and description
- [ ] **CONT-03**: Each course page lists all its lessons with titles and brief descriptions
- [ ] **CONT-04**: Code blocks have copy-to-clipboard button

### Layout & Navigation

- [ ] **LAYO-01**: Medium-inspired reading layout with optimal typography (65-75 char line width, 1.75 line-height)
- [ ] **LAYO-02**: Course sidebar navigation showing all lessons in current course
- [ ] **LAYO-03**: Previous/next lesson navigation at bottom of each lesson page
- [ ] **LAYO-04**: Breadcrumb navigation (Home > Course > Lesson)
- [ ] **LAYO-05**: Mobile-responsive layout tested at 375px breakpoint
- [ ] **LAYO-06**: Dark/light mode toggle with no FOUC (blocking script in head)

### Progress Tracking

- [ ] **PROG-01**: Lesson completion state persisted in localStorage
- [ ] **PROG-02**: Course progress percentage displayed on course catalog and course pages
- [ ] **PROG-03**: Visual completion indicators on lesson sidebar (completed/in-progress/not-started)

### Interactive Code Runner

- [ ] **CODE-01**: In-browser Python execution via Pyodide WASM (no server required)
- [ ] **CODE-02**: Pyodide runs in Web Worker to prevent UI blocking
- [ ] **CODE-03**: Pyodide lazy-loaded on first "Run" click (not on page load)
- [ ] **CODE-04**: Code editor with Python syntax support (CodeMirror 6)
- [ ] **CODE-05**: Output panel showing stdout/stderr from executed code
- [ ] **CODE-06**: Loading state UX during Pyodide cold start (~2-3 seconds)

### Animated Mindmaps

- [ ] **MIND-01**: Animated concept mindmap displayed per lesson using ReactFlow
- [ ] **MIND-02**: Mindmap data defined in JSON alongside lesson content
- [ ] **MIND-03**: Zoom/pan interaction on mindmap nodes
- [ ] **MIND-04**: Smooth entrance animations on mindmap nodes (Framer Motion)

### Search

- [ ] **SRCH-01**: Client-side fuzzy search across all lesson titles and content (Fuse.js)
- [ ] **SRCH-02**: Search results page with highlighted matches and links to lessons
- [ ] **SRCH-03**: Search accessible from global header/navigation

### NotebookLM Integration

- [ ] **NBLM-01**: NotebookLM link per course page directing students to AI-powered Q&A grounded in course materials
- [ ] **NBLM-02**: Clear UX explaining what NotebookLM is and how to use it for learning
- [ ] **NBLM-03**: Pre-seeded NotebookLM notebooks created from course MD files (12 notebooks)

### Animations & Polish

- [ ] **ANIM-01**: Smooth page transitions between lessons and courses (Framer Motion)
- [ ] **ANIM-02**: Micro-animations on interactive elements (buttons, toggles, cards)
- [ ] **ANIM-03**: Skeleton loading states for dynamic content

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
| CONT-01 | TBD | Pending |
| CONT-02 | TBD | Pending |
| CONT-03 | TBD | Pending |
| CONT-04 | TBD | Pending |
| LAYO-01 | TBD | Pending |
| LAYO-02 | TBD | Pending |
| LAYO-03 | TBD | Pending |
| LAYO-04 | TBD | Pending |
| LAYO-05 | TBD | Pending |
| LAYO-06 | TBD | Pending |
| PROG-01 | TBD | Pending |
| PROG-02 | TBD | Pending |
| PROG-03 | TBD | Pending |
| CODE-01 | TBD | Pending |
| CODE-02 | TBD | Pending |
| CODE-03 | TBD | Pending |
| CODE-04 | TBD | Pending |
| CODE-05 | TBD | Pending |
| CODE-06 | TBD | Pending |
| MIND-01 | TBD | Pending |
| MIND-02 | TBD | Pending |
| MIND-03 | TBD | Pending |
| MIND-04 | TBD | Pending |
| SRCH-01 | TBD | Pending |
| SRCH-02 | TBD | Pending |
| SRCH-03 | TBD | Pending |
| NBLM-01 | TBD | Pending |
| NBLM-02 | TBD | Pending |
| NBLM-03 | TBD | Pending |
| ANIM-01 | TBD | Pending |
| ANIM-02 | TBD | Pending |
| ANIM-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 0
- Unmapped: 32 (pending roadmap creation)

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after initial definition*
