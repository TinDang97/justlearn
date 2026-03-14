# Roadmap: JustLearn

## Milestones

- v1.0 MVP — Phases 1-3 (shipped 2026-03-14)
- v1.1 JustLearn UX Overhaul — Phases 4-6 (shipped 2026-03-14)
- v2.0 Data Engineering Course — Phases 7-12 (in progress)

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

### v2.0 Data Engineering Course (In Progress)

**Milestone Goal:** Add a Data Engineering course (Python + pandas) and generalize the platform from single-course to multi-course architecture.

- [ ] **Phase 7: Multi-Course Infrastructure** - Generalize platform routing, registry, and progress tracking to support N courses
- [x] **Phase 8: Data Platform Features** - Add pandas support in Pyodide with DataFrame rendering and bundled datasets (completed 2026-03-14)
- [ ] **Phase 9: Content — Foundations S1-4** - Author and wire DE course Sections 1-4 (42 lessons: intro, pandas basics, file formats, data cleaning)
- [ ] **Phase 10: Content — Core Skills S5-7** - Author and wire DE course Sections 5-7 (30 lessons: transformation, ETL, SQL)
- [ ] **Phase 11: Content — Advanced & Projects S8-10** - Author and wire DE course Sections 8-10 (26 lessons: quality, performance, projects)
- [ ] **Phase 12: Polish & Integration** - Cross-course navigation, prerequisites, unified search, and accessibility audit

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
- [ ] 08-01-PLAN.md — Pandas micropip install + 'installing' RunStatus + loading indicator UX
- [ ] 08-02-PLAN.md — DataFrame HTML renderer + OutputPanel html type + bundled CSV dataset

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
- [ ] 09-01-PLAN.md — Section 1: Introduction to Data Engineering (8 prose-only lessons)
- [ ] 09-02-PLAN.md — Section 2: Pandas Fundamentals (12 lessons with PracticeBlocks)
- [ ] 09-03-PLAN.md — Section 3: Data Loading & File Formats (10 lessons + bundled datasets)
- [ ] 09-04-PLAN.md — Section 4: Data Cleaning (12 lessons + sales_dirty.csv dataset)

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
- [ ] 10-01-PLAN.md — Section 5: Data Transformation (10 lessons — GroupBy, pivot/melt, merge/join, window functions)
- [ ] 10-02-PLAN.md — Section 6: ETL Pipelines (10 lessons — extract/transform/load patterns, error handling, logging)
- [ ] 10-03-PLAN.md — Section 7: SQL & Databases (10 lessons — SQLite, pd.read_sql, pd.to_sql, SQLAlchemy)

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
- [ ] 11-01-PLAN.md — Section 8: Data Quality & Testing (8 lessons)
- [ ] 11-02-PLAN.md — Section 9: Performance & Optimization (8 lessons)
- [ ] 11-03-PLAN.md — Section 10: Real-World Projects (10 lessons)

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
- [ ] 12-01-PLAN.md — Cross-course recommendation banner (Python → DE) + DE prerequisite notice
- [ ] 12-02-PLAN.md — Unified multi-course search index (description field) + WCAG 2.1 AA audit script

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Content + Reading Shell | v1.0 | 3/3 | Complete | 2026-03-14 |
| 2. Progress + Code Runner | v1.0 | 2/2 | Complete | 2026-03-14 |
| 3. Differentiators + Polish | v1.0 | 3/3 | Complete | 2026-03-14 |
| 4. Course Data Foundation | v1.1 | 2/2 | Complete | 2026-03-14 |
| 5. Homepage + Navigation UI | v1.1 | 2/2 | Complete | 2026-03-14 |
| 6. Lesson Reading, ToC, Highlighting, Practice | v1.1 | 4/4 | Complete | 2026-03-14 |
| 7. Multi-Course Infrastructure | 2/3 | In Progress|  | - |
| 8. Data Platform Features | 2/2 | Complete   | 2026-03-14 | - |
| 9. Content — Foundations S1-4 | v2.0 | 0/4 | Planned | - |
| 10. Content — Core Skills S5-7 | v2.0 | 0/3 | Planned | - |
| 11. Content — Advanced & Projects S8-10 | v2.0 | 0/3 | Planned | - |
| 12. Polish & Integration | v2.0 | 0/2 | Planned | - |
