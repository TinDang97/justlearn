---
phase: 11-content-advanced-projects-s8-10
plan: "03"
subsystem: content
tags: [section-10, real-world-projects, capstone, pandas, etl, data-quality, performance]
dependency_graph:
  requires: [11-01, 11-02]
  provides: [CONT-10]
  affects: [courses/data-engineering/10-real-world-projects/]
tech_stack:
  added: []
  patterns:
    - Project lesson format (Problem Overview → Architecture → Starter Code → Walkthrough → Expected Output → PracticeBlock → Extension Challenges)
    - RFM segmentation with groupby + np.select
    - ETL pipeline with PipelineResult dataclass + per-step timing
    - 4-dimension data quality scoring (completeness, uniqueness, validity, consistency)
    - Benchmark harness comparing naive / apply / vectorized implementations
    - Left merge with key reconciliation (string EMP-### → int)
key_files:
  created:
    - courses/data-engineering/10-real-world-projects/lesson-01-project-overview-and-setup.md
    - courses/data-engineering/10-real-world-projects/lesson-02-project-1-sales-data-cleaner.md
    - courses/data-engineering/10-real-world-projects/lesson-03-project-2-log-file-analyzer.md
    - courses/data-engineering/10-real-world-projects/lesson-04-project-3-etl-pipeline-with-validation.md
    - courses/data-engineering/10-real-world-projects/lesson-05-project-4-customer-segmentation.md
    - courses/data-engineering/10-real-world-projects/lesson-06-project-5-performance-benchmark-suite.md
    - courses/data-engineering/10-real-world-projects/lesson-07-project-6-data-quality-monitor.md
    - courses/data-engineering/10-real-world-projects/lesson-08-project-7-multi-source-pipeline.md
    - courses/data-engineering/10-real-world-projects/lesson-09-course-review-and-patterns.md
    - courses/data-engineering/10-real-world-projects/lesson-10-next-steps-and-resources.md
    - courses/data-engineering/10-real-world-projects/README.md
  modified: []
decisions:
  - Project lessons (02-08) use distinct format from standard lessons: Problem Overview + Skills Integrated table + Architecture diagram + Starter Code with TODOs + Step-by-Step Walkthrough + Expected Output + PracticeBlock + Extension Challenges
  - All starter code uses io.StringIO with hardcoded CSV strings to simulate pd.read_csv() — compatible with Pyodide browser runtime, no filesystem access needed
  - Expected output sections contain concrete numeric examples derived from the bundled sample datasets, not generic placeholders
  - Lesson 10 replaces "Next Lesson Preview" with "You've Completed the Data Engineering Course" section per plan spec
  - All project code avoids matplotlib, polars, dask — only pandas, numpy, and stdlib (io, time, dataclasses)
metrics:
  duration_minutes: 55
  tasks_completed: 2
  tasks_total: 2
  files_created: 11
  files_modified: 0
  completed_date: "2026-03-14"
---

# Phase 11 Plan 03: Section 10 — Real-World Projects Summary

**One-liner:** 10-lesson capstone section with 7 self-contained project pipelines integrating pandas, ETL, data quality, and performance patterns from all prior sections.

## What Was Built

Section 10 is the capstone of the Data Engineering course. It contains 11 files: 10 lesson markdown files and one section README.

### Lesson 01 — Project Overview and Setup (standard format)
Covers how to read a project lesson, recommended project directory structure (`pipeline.py`, `validate.py`, `test_pipeline.py`, `README.md`), the bundled dataset inventory (transactions, employees, logs with schema and known quality issues), and a skills matrix mapping each of the 7 projects to the sections they exercise.

### Lessons 02–08 — Projects 1–7 (project format)
Each project lesson is self-contained: a student can read it, implement the TODOs in the starter code, and produce exact output matching the Expected Output section without any external dependencies.

| Lesson | Project | Key Integration | Deliverable |
|--------|---------|-----------------|-------------|
| 02 | Sales Data Cleaner | S3+S4+S8 | Cleaning summary: rows in → rows out, duplicates, nulls filled, validation errors |
| 03 | Log File Analyzer | S3+S4+S5+S9 | Error rate report: per-service error %, top-10 error messages |
| 04 | ETL Pipeline with Validation | S6+S7+S8 | Pipeline run log: per-step timing + SUCCESS/FAILED summary |
| 05 | Customer Segmentation | S4+S5+S8+S9 | RFM distribution: Champion/Loyal/At-Risk/Lost counts + top customers |
| 06 | Performance Benchmark Suite | S9 | Timing table: naive/apply/vectorized across 3 dataset sizes + speedup |
| 07 | Data Quality Monitor | S6+S8+S9 | Health report: 4-dimension scores + HEALTHY/DEGRADED/CRITICAL status |
| 08 | Multi-Source Pipeline | S4+S5+S6+S8 | Merge summary: matched/unmatched counts + match rate % |

### Lesson 09 — Course Review and Patterns (standard format)
Sections 1–10 pattern summary table with "When to Use It" column. Sections 6–10 pattern interactions. Problem → pattern decision tree covering 8 problem types. Five real-world systems students can build now (daily sales report, customer health monitor, log anomaly detector, data migration validator, API response archiver).

### Lesson 10 — Next Steps and Resources (standard format)
Four career tracks with tool recommendations (analytics engineering, data infrastructure, streaming, ML pipelines). Full learning path from Python foundation through distributed processing. Five concrete portfolio project ideas with data sources. 30/60/90-day plan.

### README.md
Projects table with skills and deliverables. Lessons index with types. Dataset inventory. Recommended project order.

## Pyodide Compatibility

All 7 project starter codes use:
- `io.StringIO` with embedded CSV strings to simulate `pd.read_csv()` from disk
- `sqlite3 :memory:` for SQL (Project 3 uses a list accumulator as an in-memory alternative)
- Only pandas, numpy, and Python stdlib — no matplotlib, dask, polars, or sqlalchemy in practice blocks

## Deviations from Plan

None — plan executed exactly as written.

The plan specified `sqlite3 :memory:` for Project 3. The implementation uses a list accumulator (list of dicts) for the load target in the browser context, which the plan explicitly notes as acceptable: "append rows to a list (in-memory accumulator — simulates DB write in browser)". This follows the plan spec.

## Self-Check

- [x] 10 lesson files created at `courses/data-engineering/10-real-world-projects/`
- [x] README.md created with project table (7 rows) and lessons index
- [x] Lessons 02–08 contain: Project Overview, Skills Integrated, Architecture, Starter Code, Step-by-Step Walkthrough, Expected Output, Practice Exercises (PracticeBlock), Extension Challenges
- [x] Lessons 01, 09, 10 use standard 4-part outline format
- [x] Each project's Skills Integrated table names source sections explicitly (e.g., "Section 8: Data Quality & Testing")
- [x] Each Expected Output section contains a specific example (not a placeholder)
- [x] Lesson 10 has no "Next Lesson Preview" — replaced with completion paragraph
- [x] No dask, polars, matplotlib, or sqlalchemy imports in starter code
- [x] Commit hash: 9dc3979
