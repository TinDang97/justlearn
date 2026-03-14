# Requirements: JustLearn

**Defined:** 2026-03-14
**Core Value:** Students can learn programming and data skills step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification

## v2.0 Requirements

Requirements for v2.0 Data Engineering Course milestone. Each maps to roadmap phases.

### Multi-Course Infrastructure

- [x] **INFRA-01**: Platform supports multiple courses with independent routing (`/courses/[courseSlug]/...`)
- [x] **INFRA-02**: Course registry system defines course metadata, sections, and lesson mappings per course
- [x] **INFRA-03**: Zustand progress store tracks completion per course independently (`{ python: {...}, "data-engineering": {...} }`)
- [x] **INFRA-04**: Homepage displays course catalog with all available courses and per-course progress
- [x] **INFRA-05**: Sidebar, breadcrumbs, and navigation components are course-aware (not python-hardcoded)
- [x] **INFRA-06**: Course overview page works for any registered course with accordion sections and progress

### Data Platform Features

- [x] **DATA-01**: Pyodide loads pandas via micropip with loading indicator on first use
- [x] **DATA-02**: DataFrame output renders as styled HTML table in code runner
- [x] **DATA-03**: Practice exercises can load bundled CSV/JSON dataset files
- [x] **DATA-04**: Code runner handles pandas-specific output types (Series, DataFrame, Index)
- [x] **DATA-05**: Dataset files are bundled in course directory and accessible via Pyodide filesystem

### Content — Introduction & Pandas Fundamentals

- [x] **CONT-01**: Section 1 — Introduction to Data Engineering (8 lessons): DE overview, Python ecosystem, pipeline lifecycle
- [x] **CONT-02**: Section 2 — Pandas Fundamentals (12 lessons): Series, DataFrame, indexing, selection, dtypes, basic stats
- [x] **CONT-03**: Section 3 — Data Loading & File Formats (10 lessons): CSV, JSON, Excel, Parquet, chunked reading
- [x] **CONT-04**: Section 4 — Data Cleaning (12 lessons): Missing values, duplicates, type conversion, strings, dates

### Content — Core Data Skills

- [x] **CONT-05**: Section 5 — Data Transformation (10 lessons): GroupBy, pivot, melt, merge/join, window functions
- [x] **CONT-06**: Section 6 — ETL Pipelines (10 lessons): Extract-Transform-Load patterns, error handling, logging
- [x] **CONT-07**: Section 7 — SQL & Databases (10 lessons): SQLite, pandas read_sql, SQLAlchemy basics

### Content — Advanced & Projects

- [ ] **CONT-08**: Section 8 — Data Quality & Testing (8 lessons): Schema validation, profiling, data contracts
- [ ] **CONT-09**: Section 9 — Performance & Optimization (8 lessons): Vectorization, memory, chunking, NumPy
- [ ] **CONT-10**: Section 10 — Real-World Projects (10 lessons): End-to-end mini projects combining all skills

### Polish & Integration

- [ ] **POLISH-01**: Cross-course navigation allows students to discover and switch between courses
- [ ] **POLISH-02**: Course prerequisites shown (DE course recommends Python course completion)
- [ ] **POLISH-03**: Search indexes both courses for full-text search
- [ ] **POLISH-04**: All new components and pages pass WCAG 2.1 AA accessibility audit

## Future Requirements

### Additional Courses

- **FUTURE-01**: JavaScript/TypeScript course
- **FUTURE-02**: SQL-only course (non-Python)
- **FUTURE-03**: Machine Learning course

### Advanced Platform

- **FUTURE-04**: User accounts and server-side progress sync
- **FUTURE-05**: Course completion certificates
- **FUTURE-06**: Interactive quizzes and assessments

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication/accounts | Focus on content delivery, localStorage sufficient |
| Real database connections in browser | Security risk, SQLite via Pyodide is sufficient |
| Video content | Text and code focused platform |
| Real-time collaboration | Individual learning experience |
| Cloud dataset storage | Bundled small datasets keep it simple and fast |
| Jupyter notebook interface | PracticeBlock + code runner is the interaction model |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 7 | Complete |
| INFRA-02 | Phase 7 | Complete |
| INFRA-03 | Phase 7 | Complete |
| INFRA-04 | Phase 7 | Complete |
| INFRA-05 | Phase 7 | Complete |
| INFRA-06 | Phase 7 | Complete |
| DATA-01 | Phase 8 | Complete |
| DATA-02 | Phase 8 | Complete |
| DATA-03 | Phase 8 | Complete |
| DATA-04 | Phase 8 | Complete |
| DATA-05 | Phase 8 | Complete |
| CONT-01 | Phase 9 | Complete |
| CONT-02 | Phase 9 | Complete |
| CONT-03 | Phase 9 | Complete |
| CONT-04 | Phase 9 | Complete |
| CONT-05 | Phase 10 | Complete |
| CONT-06 | Phase 10 | Complete |
| CONT-07 | Phase 10 | Complete |
| CONT-08 | Phase 11 | Pending |
| CONT-09 | Phase 11 | Pending |
| CONT-10 | Phase 11 | Pending |
| POLISH-01 | Phase 12 | Pending |
| POLISH-02 | Phase 12 | Pending |
| POLISH-03 | Phase 12 | Pending |
| POLISH-04 | Phase 12 | Pending |

**Coverage:**
- v2.0 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after initial definition*
