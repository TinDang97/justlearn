# Roadmap: JustLearn

## Milestones

- v1.0 MVP — Phases 1-3 (shipped 2026-03-14)
- v1.1 JustLearn UX Overhaul — Phases 4-6 (shipped 2026-03-14)
- v2.0 Data Engineering Course — Phases 7-12 (shipped 2026-03-14)
- v2.1 AI Learning Assistant — Phases 13-15 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-3) — SHIPPED 2026-03-14</summary>

- [x] Phase 1: Content + Reading Shell (3/3 plans) — completed 2026-03-14
- [x] Phase 2: Progress + Code Runner (2/2 plans) — completed 2026-03-14
- [x] Phase 3: Differentiators + Polish (3/3 plans) — completed 2026-03-14

See: `.planning/milestones/v1.0-ROADMAP.md` (if archived)

</details>

<details>
<summary>v1.1 JustLearn UX Overhaul (Phases 4-6) — SHIPPED 2026-03-14</summary>

- [x] Phase 4: Course Data Foundation (2/2 plans) — completed 2026-03-14
- [x] Phase 5: Homepage + Navigation UI (2/2 plans) — completed 2026-03-14
- [x] Phase 6: Lesson Reading, ToC, Highlighting, and Practice (4/4 plans) — completed 2026-03-14

See: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>v2.0 Data Engineering Course (Phases 7-12) — SHIPPED 2026-03-14</summary>

- [x] Phase 7: Multi-Course Infrastructure (3/3 plans) — completed 2026-03-14
- [x] Phase 8: Data Platform Features (2/2 plans) — completed 2026-03-14
- [x] Phase 9: Content — Foundations S1-4 (4/4 plans) — completed 2026-03-14
- [x] Phase 10: Content — Core Skills S5-7 (3/3 plans) — completed 2026-03-14
- [x] Phase 11: Content — Advanced & Projects S8-10 (3/3 plans) — completed 2026-03-14
- [x] Phase 12: Polish & Integration (2/2 plans) — completed 2026-03-14

</details>

### v2.1 AI Learning Assistant (In Progress)

**Milestone Goal:** Add an in-browser AI learning assistant powered by WebGPU that provides context-aware Q&A, practice hints, and per-course teaching personas — all running locally with no API costs.

- [ ] **Phase 13: WebLLM Foundation + Infrastructure** - Working WebGPU engine with singleton, COEP/COOP headers, graceful fallback, and Pyodide mutual exclusion
- [ ] **Phase 14: RAG Pipeline + Persona System** - Build-time embeddings, in-browser vector search, and per-course AI teacher configuration
- [ ] **Phase 15: AI Chat Panel + Practice Hints** - Inline chat panel with streaming responses, session history, and AI-powered hints in PracticeBlock

## Phase Details

### Phase 7: Multi-Course Infrastructure
**Goal**: The platform supports multiple independent courses with isolated routing, registry configuration, and per-course progress tracking
**Depends on**: Phase 6 (v1.1 complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. Navigating to `/courses/python/...` and `/courses/data-engineering/...` both work without 404s or broken layouts
  2. A new course can be added by registering it in the course registry without touching routing or component code
  3. Completing a lesson in the Data Engineering course does not affect Python course progress, and both are tracked independently in localStorage
  4. The homepage displays a course catalog listing all registered courses with per-course completion percentage
  5. Sidebar, breadcrumbs, and prev/next navigation render correctly for both courses using the same components
**Plans**: 3 plans
Plans:
- [x] 07-01-PLAN.md — Course registry (CourseRegistryEntry, COURSE_REGISTRY, getCourseData) + content layer generalization — completed 2026-03-15
- [x] 07-02-PLAN.md — Remove python routing guards, progress store v2 (justlearn-progress key), lesson page multi-course — completed 2026-03-15
- [x] 07-03-PLAN.md — Homepage multi-course catalog (CourseCatalog, CourseCatalogCard), hero update, /courses redirect — completed 2026-03-15

### Phase 8: Data Platform Features
**Goal**: The code runner fully supports pandas workflows — loading pandas, rendering DataFrames, and accessing bundled datasets
**Depends on**: Phase 7
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. A PracticeBlock with `import pandas as pd` shows a loading indicator while micropip installs pandas, then executes successfully
  2. A code block that produces a DataFrame displays it as a styled HTML table (not raw repr text)
  3. A practice exercise can load a bundled CSV file (e.g., `pd.read_csv('data/students.csv')`) and produce output
  4. Series, Index, and scalar outputs from pandas operations each render in a readable format in the output panel
**Plans**: 2 plans
Plans:
- [x] 08-01-PLAN.md — Pandas micropip install + 'installing' RunStatus + loading indicator UX
- [x] 08-02-PLAN.md — DataFrame HTML renderer + OutputPanel html type + bundled CSV dataset

### Phase 9: Content — Foundations S1-4
**Goal**: Students can access and complete the first four sections of the Data Engineering course covering environment setup through data cleaning
**Depends on**: Phase 7, Phase 8
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. All 42 lessons across Sections 1-4 are accessible via the DE course sidebar and prev/next navigation
  2. Section 1 lessons explain the data engineering landscape and Python ecosystem with no interactive code (introductory prose)
  3. Section 2 lessons include working PracticeBlocks for Series, DataFrame, indexing, and basic statistics that run in-browser
  4. Section 3 lessons demonstrate loading CSV, JSON, Excel, and Parquet formats with runnable examples
  5. Section 4 lessons cover missing values, duplicates, type conversion, string cleaning, and date parsing with interactive exercises
**Plans**: 4 plans
Plans:
- [x] 09-01-PLAN.md — Section 1: Introduction to Data Engineering (8 prose-only lessons)
- [x] 09-02-PLAN.md — Section 2: Pandas Fundamentals (12 lessons with PracticeBlocks)
- [x] 09-03-PLAN.md — Section 3: Data Loading & File Formats (10 lessons + bundled datasets)
- [x] 09-04-PLAN.md — Section 4: Data Cleaning (12 lessons + sales_dirty.csv dataset)

### Phase 10: Content — Core Skills S5-7
**Goal**: Students can access and complete Sections 5-7 covering data transformation, ETL pipeline patterns, and SQL basics
**Depends on**: Phase 9
**Requirements**: CONT-05, CONT-06, CONT-07
**Success Criteria** (what must be TRUE):
  1. All 30 lessons across Sections 5-7 are accessible via sidebar and prev/next navigation
  2. Section 5 lessons have interactive examples demonstrating GroupBy aggregations, pivot/melt reshaping, and merge/join operations
  3. Section 6 lessons walk through complete Extract-Transform-Load patterns with error handling and logging examples
  4. Section 7 lessons demonstrate SQLite queries, pandas read_sql, and basic SQLAlchemy connection patterns with runnable code
**Plans**: 3 plans
Plans:
- [x] 10-01-PLAN.md — Section 5: Data Transformation (10 lessons — GroupBy, pivot/melt, merge/join, window functions)
- [x] 10-02-PLAN.md — Section 6: ETL Pipelines (10 lessons — extract/transform/load patterns, error handling, logging)
- [x] 10-03-PLAN.md — Section 7: SQL & Databases (10 lessons — SQLite, pd.read_sql, pd.to_sql, SQLAlchemy)

### Phase 11: Content — Advanced & Projects S8-10
**Goal**: Students can access and complete Sections 8-10 covering data quality, performance optimization, and end-to-end capstone projects
**Depends on**: Phase 10
**Requirements**: CONT-08, CONT-09, CONT-10
**Success Criteria** (what must be TRUE):
  1. All 26 lessons across Sections 8-10 are accessible via sidebar and prev/next navigation
  2. Section 8 lessons cover schema validation, data profiling, and data contract patterns with working examples
  3. Section 9 lessons demonstrate vectorization, chunked processing, and NumPy integration with before/after performance comparisons
  4. Section 10 projects are self-contained end-to-end exercises that integrate skills from all prior sections and produce a visible output (e.g., a cleaned dataset or a pipeline summary)
**Plans**: 3 plans
Plans:
- [x] 11-01-PLAN.md — Section 8: Data Quality & Testing (8 lessons)
- [x] 11-02-PLAN.md — Section 9: Performance & Optimization (8 lessons)
- [x] 11-03-PLAN.md — Section 10: Real-World Projects (10 lessons)

### Phase 12: Polish & Integration
**Goal**: The two-course platform feels cohesive — students can discover both courses, see prerequisites, search across all content, and encounter no accessibility barriers
**Depends on**: Phase 11
**Requirements**: POLISH-01, POLISH-02, POLISH-03, POLISH-04
**Success Criteria** (what must be TRUE):
  1. A student finishing a Python course lesson sees a recommendation or link to explore the Data Engineering course
  2. The Data Engineering course overview page displays a prerequisite notice recommending Python course completion
  3. Searching for a data engineering term (e.g., "DataFrame", "ETL") returns relevant DE course lessons alongside any Python course matches
  4. All pages introduced in v2.0 pass an automated WCAG 2.1 AA audit with zero critical violations
**Plans**: 2 plans
Plans:
- [x] 12-01-PLAN.md — Cross-course recommendation banner (Python → DE) + DE prerequisite notice
- [x] 12-02-PLAN.md — Unified multi-course search index (description field) + WCAG 2.1 AA audit script

### Phase 13: WebLLM Foundation + Infrastructure
**Goal**: A working in-browser AI engine is correctly initialized with production-safe infrastructure — WebGPU detection, singleton lifecycle, COEP/COOP headers, and Pyodide memory safety — so all subsequent AI features build on a stable foundation
**Depends on**: Phase 12 (v2.0 complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. On a browser without WebGPU support, the AI entry point displays a graceful fallback linking to NotebookLM instead of a blank or error state
  2. On a browser with WebGPU support, triggering AI for the first time shows a progress bar with labeled phase indicators (Downloading → Caching → Compiling → Ready) and the model loads successfully
  3. Navigating between lesson pages does not re-initialize the WebLLM engine — the engine state persists across route changes for the entire browser session
  4. Opening the Pyodide code runner and then triggering AI (or vice versa) does not crash the tab on a device with 4-8GB RAM; only one engine loads at a time
  5. The deployed preview URL responds with `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` headers, and existing NotebookLM deeplinks continue to function
**Plans**: TBD

### Phase 14: RAG Pipeline + Persona System
**Goal**: All lesson content is pre-indexed for semantic search and each course has a configured AI teacher persona, so the chat system can assemble context-aware, persona-driven prompts before any UI is rendered
**Depends on**: Phase 13
**Requirements**: RAG-01, RAG-02, RAG-03, CHAT-05
**Success Criteria** (what must be TRUE):
  1. Running `pnpm build` generates `public/data/rag-chunks.json` containing all 218 lessons chunked by heading boundary, each chunk carrying course and lesson metadata
  2. Each course entry in the course registry has a named AI teacher persona with a system prompt, tone, and teaching style that differs visibly between courses
  3. Given a sample student question, the in-browser RAG retrieves the top-K most semantically relevant lesson chunks from the correct course corpus and returns their source citations
  4. The system prompt assembled for a chat request contains persona instructions, the current lesson title, and retrieved RAG chunks — all within the 800-token budget
**Plans**: TBD

### Phase 15: AI Chat Panel + Practice Hints
**Goal**: Students can ask questions in an inline chat panel and receive streaming, source-cited, lesson-aware answers; students can request AI hints in PracticeBlock exercises without receiving direct answers
**Depends on**: Phase 14
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-06, PRAC-01, PRAC-02, PRAC-03
**Success Criteria** (what must be TRUE):
  1. A student on any lesson page can open a sliding chat panel, type a question about the current lesson, and receive a streaming response that renders Markdown incrementally as tokens arrive
  2. The AI response cites the source lesson section it drew context from, visible in the chat panel alongside the answer
  3. A student can ask a follow-up question in the same session and the AI responds with awareness of the prior exchange (multi-turn history preserved within the session)
  4. A student who clicks "Get Hint" in a PracticeBlock receives Socratic guidance (a guiding question or partial clue) without a direct code answer
  5. When a PracticeBlock code execution fails, the AI automatically explains the Python or pandas error in plain language without requiring the student to ask
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Content + Reading Shell | v1.0 | 3/3 | Complete | 2026-03-14 |
| 2. Progress + Code Runner | v1.0 | 2/2 | Complete | 2026-03-14 |
| 3. Differentiators + Polish | v1.0 | 3/3 | Complete | 2026-03-14 |
| 4. Course Data Foundation | v1.1 | 2/2 | Complete | 2026-03-14 |
| 5. Homepage + Navigation UI | v1.1 | 2/2 | Complete | 2026-03-14 |
| 6. Lesson Reading, ToC, Highlighting, Practice | v1.1 | 4/4 | Complete | 2026-03-14 |
| 7. Multi-Course Infrastructure | v2.0 | 3/3 | Complete | 2026-03-14 |
| 8. Data Platform Features | v2.0 | 2/2 | Complete | 2026-03-14 |
| 9. Content — Foundations S1-4 | v2.0 | 4/4 | Complete | 2026-03-14 |
| 10. Content — Core Skills S5-7 | v2.0 | 3/3 | Complete | 2026-03-14 |
| 11. Content — Advanced & Projects S8-10 | v2.0 | 3/3 | Complete | 2026-03-14 |
| 12. Polish & Integration | v2.0 | 2/2 | Complete | 2026-03-14 |
| 13. WebLLM Foundation + Infrastructure | v2.1 | 0/? | Not started | - |
| 14. RAG Pipeline + Persona System | v2.1 | 0/? | Not started | - |
| 15. AI Chat Panel + Practice Hints | v2.1 | 0/? | Not started | - |
