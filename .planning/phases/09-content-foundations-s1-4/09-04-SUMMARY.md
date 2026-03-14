---
phase: 09-content-foundations-s1-4
plan: "04"
subsystem: content
tags: [data-engineering, data-cleaning, pandas, content]
dependency_graph:
  requires:
    - courses/data-engineering/03-data-loading-file-formats/
    - courses/data-engineering/02-pandas-fundamentals/
  provides:
    - courses/data-engineering/04-data-cleaning/
    - courses/data-engineering/data/sales_dirty.csv
  affects:
    - courses/data-engineering/05-data-transformation/
tech_stack:
  added: []
  patterns:
    - "PracticeBlock MDX component with initialCode, hint, solution props"
    - "Callout components: Info, Warning, Tip"
    - "Cleaning pipeline pattern: pure functions + .pipe() composition"
key_files:
  created:
    - courses/data-engineering/04-data-cleaning/README.md
    - courses/data-engineering/04-data-cleaning/lesson-01-detecting-missing-values.md
    - courses/data-engineering/04-data-cleaning/lesson-02-handling-missing-values.md
    - courses/data-engineering/04-data-cleaning/lesson-03-detecting-duplicates.md
    - courses/data-engineering/04-data-cleaning/lesson-04-removing-duplicates.md
    - courses/data-engineering/04-data-cleaning/lesson-05-type-conversion-basics.md
    - courses/data-engineering/04-data-cleaning/lesson-06-parsing-dates.md
    - courses/data-engineering/04-data-cleaning/lesson-07-string-cleaning.md
    - courses/data-engineering/04-data-cleaning/lesson-08-string-methods-in-depth.md
    - courses/data-engineering/04-data-cleaning/lesson-09-outlier-detection.md
    - courses/data-engineering/04-data-cleaning/lesson-10-schema-validation-basics.md
    - courses/data-engineering/04-data-cleaning/lesson-11-building-a-cleaning-pipeline.md
    - courses/data-engineering/04-data-cleaning/lesson-12-section-review-data-cleaning.md
    - courses/data-engineering/data/sales_dirty.csv
  modified: []
decisions:
  - "sales_dirty.csv placed in shared data/ directory (not inside 04-data-cleaning/) to allow reuse across sections"
  - "Nullable Int64 dtype used in pipeline over int64 — preserves NaN semantics through pipeline steps"
  - "ffill()/bfill() used directly (not fillna(method=)) to comply with pandas 2.x deprecation"
metrics:
  duration_minutes: 35
  tasks_completed: 2
  files_created: 14
  files_modified: 0
  completed_date: "2026-03-14"
---

# Phase 9 Plan 04: Section 4 — Data Cleaning Summary

**One-liner:** Complete 12-lesson data cleaning curriculum with isnull/dropna/fillna, deduplication, type coercion, date parsing, string normalization, IQR outlier detection, schema validation, and composable .pipe() cleaning pipeline — all exercised on a 13-row sales_dirty.csv with 9 intentional quality issues.

---

## What Was Built

13 markdown files (12 lessons + README) and 1 bundled dataset covering the complete data cleaning toolkit for the Data Engineering course Section 4.

### Dataset

**`courses/data-engineering/data/sales_dirty.csv`** — 13 rows, 8 columns, 9 embedded quality issues:
1. Duplicate row (S002 appears twice)
2. Whitespace in customer (`'  Bob Wilson  '`)
3. Inconsistent region casing (`'North'`/`'NORTH'`/`'north'`)
4. Missing revenue (row S003)
5. Missing units (row S008)
6. Negative revenue (row S007: -89.00)
7. Inconsistent date format (row S008: `'01/22/2024'` vs `'YYYY-MM-DD'`)
8. Customer name casing inconsistency (`'Alice Johnson'` vs `'alice johnson'`)
9. Units stored as float instead of int

### Lessons Created

| # | Title | Duration | PracticeBlocks |
|---|-------|----------|----------------|
| 01 | Detecting Missing Values | 35 min | 2 |
| 02 | Handling Missing Values | 45 min | 3 |
| 03 | Detecting Duplicate Rows | 30 min | 2 |
| 04 | Removing Duplicate Rows | 30 min | 2 |
| 05 | Type Conversion Basics | 40 min | 3 |
| 06 | Parsing and Working with Dates | 50 min | 3 |
| 07 | String Cleaning Fundamentals | 40 min | 3 |
| 08 | String Methods: Extract, Split, Pad | 40 min | 2 |
| 09 | Detecting Outliers | 40 min | 2 |
| 10 | Schema Validation Basics | 35 min | 2 |
| 11 | Building a Cleaning Pipeline | 55 min | 2 |
| 12 | Section Review: Data Cleaning | 60 min | 3 |

Total: ~500 minutes of content, 29 PracticeBlocks

---

## Decisions Made

1. **sales_dirty.csv in shared `data/` directory** — placed at `courses/data-engineering/data/` rather than inside `04-data-cleaning/` so later sections (Section 5 transformation) can reference the same file without duplication. All `initialCode` in PracticeBlocks uses `pd.read_csv('data/sales_dirty.csv')`.

2. **Nullable `Int64` over `int64`** — Lesson 5 and the pipeline in Lesson 11 use `astype('Int64')` (pandas nullable integer) rather than `astype(int)`. This correctly handles the NaN in the `units` column without requiring a fill-first step, and preserves type intent through the pipeline.

3. **`.ffill()` and `.bfill()` directly** — Lesson 2 documents the `fillna(method='ffill')` deprecation in pandas 2.x and uses `.ffill()` directly throughout. This keeps all code compatible with the platform's pandas version.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Self-Check

### Files exist:

- [x] `courses/data-engineering/04-data-cleaning/README.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-01-detecting-missing-values.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-02-handling-missing-values.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-03-detecting-duplicates.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-04-removing-duplicates.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-05-type-conversion-basics.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-06-parsing-dates.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-07-string-cleaning.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-08-string-methods-in-depth.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-09-outlier-detection.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-10-schema-validation-basics.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-11-building-a-cleaning-pipeline.md`
- [x] `courses/data-engineering/04-data-cleaning/lesson-12-section-review-data-cleaning.md`
- [x] `courses/data-engineering/data/sales_dirty.csv` (14 lines: header + 13 rows)

### Commit exists: 5494063

## Self-Check: PASSED
