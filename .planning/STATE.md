---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Data Engineering Course
status: planning
stopped_at: Completed 11-02-PLAN.md
last_updated: "2026-03-14T18:07:48.450Z"
last_activity: 2026-03-14 — Roadmap created for v2.0 (Phases 7-12, 25 requirements)
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 17
  completed_plans: 13
  percent: 22
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Students can learn programming and data skills step-by-step through beautifully designed lessons with interactive practice, visual mindmaps, and AI-powered clarification
**Current focus:** Phase 7 — Multi-Course Infrastructure (ready to plan)

## Current Position

Phase: 7 of 12 (Multi-Course Infrastructure)
Plan: 0 of ? in current phase
Status: Ready to plan
Last activity: 2026-03-14 — Roadmap created for v2.0 (Phases 7-12, 25 requirements)

Progress: [██░░░░░░░░] 22% (v2.0)

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v2.0)
- Average duration: — min
- Total execution time: — hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 7. Multi-Course Infrastructure | TBD | — | — |
| 8. Data Platform Features | TBD | — | — |
| 9-11. Content phases | TBD | — | — |
| 12. Polish & Integration | TBD | — | — |

*Updated after each plan completion*
| Phase 07-multi-course-infrastructure P01 | 12 | 2 tasks | 5 files |
| Phase 07-multi-course-infrastructure P02 | 8 | 2 tasks | 6 files |
| Phase 07-multi-course-infrastructure P03 | 10 | 2 tasks | 7 files |
| Phase 08-data-platform-features P01 | 15 | 2 tasks | 6 files |
| Phase 08-data-platform-features P02 | 10 | 2 tasks | 5 files |
| Phase 09-content-foundations-s1-4 P03 | 35 | 2 tasks | 13 files |
| Phase 09-content-foundations-s1-4 P01 | 45 | 2 tasks | 9 files |
| Phase 09-content-foundations-s1-4 P02 | 45 | 2 tasks | 13 files |
| Phase 09-content-foundations-s1-4 P04 | 35 | 2 tasks | 14 files |
| Phase 10-content-core-skills-s5-7 P01 | 35 | 3 tasks | 11 files |
| Phase 10-content-core-skills-s5-7 P02 | 35 | 3 tasks | 11 files |
| Phase 10-content-core-skills-s5-7 P03 | 45 | 3 tasks | 11 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0-design]: Multi-course architecture — generalize from single python course to N courses via course registry
- [v2.0-design]: Pandas via micropip.install('pandas') in Pyodide — ~15MB, lazy-load on first pandas lesson
- [v2.0-design]: DataFrame renderer using pandas .to_html() → styled table component
- [v2.0-design]: 10-section DE curriculum (~100 lessons), assumes Python course completion
- [v2.0-design]: Course content in courses/data-engineering/ with bundled small CSV/JSON datasets
- [Phase 07-01]: COURSE_REGISTRY pattern: slug maps to CourseConfig with buildCourse factory; getAllRegisteredCourses strips buildCourse for public API
- [Phase 07-01]: getAllCourses() restricted to NN- dir pattern — prevents non-python course dirs contaminating section-based API
- [Phase 07-02]: try/catch notFound() over explicit python guard — getCourseData throws on unknown slug
- [Phase 07-02]: v1->v2 progress migration is pass-through; key rename means v1 data lost — acceptable (no real users)
- [Phase 07-03]: CourseCatalog is server component (data at build time); CourseCatalogCard is client component (Zustand store)
- [Phase 07-03]: /courses redirects to / — homepage IS the catalog, no duplication needed
- [Phase 07-03]: Hero courseSlug prop removed — enforces platform-scope at type level
- [Phase 08-data-platform-features]: pandas micropip install via runPythonAsync (not JS API) to avoid Pyodide event loop deadlock; pandasReady singleton prevents double-install
- [Phase 08-data-platform-features]: Worker status message { id, status: 'installing' } discriminated by 'status' key presence; hook does not resolve Promise on status-only messages
- [Phase 08-02]: pyodide.globals.set('_user_src', code) before harness — eliminates all string escaping edge cases for arbitrary user code
- [Phase 08-02]: dangerouslySetInnerHTML for DataFrame HTML is safe — HTML comes exclusively from pandas.to_html() inside Pyodide WASM sandbox
- [Phase 08-02]: pandasReady guard before DataFrame/Series type checks — non-pandas code never incurs pandas import overhead
- [Phase 09]: Prose-only lessons for Section 1 — conceptual foundation before hands-on pandas sections
- [Phase 09-content-foundations-s1-4]: All PracticeBlock code is self-contained with imports so each block runs independently in Pyodide
- [Phase 09]: sales_dirty.csv placed in shared data/ directory for cross-section reuse
- [Phase 09]: Nullable Int64 dtype used in pipeline — preserves NaN semantics through steps
- [Phase 09]: PracticeBlock exercises reference bundled data via relative path 'data/orders.csv' resolved by Phase 8 Pyodide filesystem mounting
- [Phase 09]: Excel lesson uses io.BytesIO round-trip — no actual .xlsx file needed for in-browser execution
- [Phase 10-content-core-skills-s5-7]: All code examples use in-memory hardcoded DataFrames for Pyodide compatibility (no file I/O)
- [Phase 10-content-core-skills-s5-7]: All ETL lesson data I/O uses io.StringIO and sqlite3 :memory: for Pyodide compatibility
- [Phase 10-content-core-skills-s5-7]: Lesson-10 mini-project assembles all 9 preceding patterns into one runnable self-contained script
- [Phase 10-content-core-skills-s5-7]: All SQLite examples use :memory: for in-browser Pyodide compatibility
- [Phase 10-content-core-skills-s5-7]: Lesson 10 capstone uses hardcoded DataFrames loaded via to_sql to avoid file I/O constraints
- [Phase 11-02]: All Pyodide compatibility constraints enforced: io.StringIO for chunked reading, generate_*() helpers for large data, no dask/polars/numba
- [Phase 11-02]: np.vectorize explicitly documented as API-only tool (no performance gain) — benchmark provided in lesson 07

### Pending Todos

None.

### Blockers/Concerns

- Pyodide pandas install is ~15MB — need loading UX and caching strategy (Phase 8)
- Multi-course routing must not break existing Python course URLs (Phase 7)
- DataFrame output in code runner needs HTML rendering support (Phase 8)

## Session Continuity

Last session: 2026-03-14T18:07:43.395Z
Stopped at: Completed 11-02-PLAN.md
Resume file: None
