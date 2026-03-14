---
phase: 10-content-core-skills-s5-7
plan: "01"
subsystem: content
tags: [data-engineering, pandas, groupby, pivot, merge, window-functions, apply]
dependency_graph:
  requires: [02-pandas-fundamentals]
  provides: [05-data-transformation section content]
  affects: [06-etl-pipelines navigation links]
tech_stack:
  added: []
  patterns: [PracticeBlock MDX, in-memory DataFrame examples, Pyodide-compatible code]
key_files:
  created:
    - courses/data-engineering/05-data-transformation/README.md
    - courses/data-engineering/05-data-transformation/lesson-01-groupby-basics.md
    - courses/data-engineering/05-data-transformation/lesson-02-groupby-advanced.md
    - courses/data-engineering/05-data-transformation/lesson-03-pivot-tables.md
    - courses/data-engineering/05-data-transformation/lesson-04-melt-reshape.md
    - courses/data-engineering/05-data-transformation/lesson-05-merge-join-basics.md
    - courses/data-engineering/05-data-transformation/lesson-06-merge-join-advanced.md
    - courses/data-engineering/05-data-transformation/lesson-07-concat-append.md
    - courses/data-engineering/05-data-transformation/lesson-08-window-functions.md
    - courses/data-engineering/05-data-transformation/lesson-09-apply-map-transform.md
    - courses/data-engineering/05-data-transformation/lesson-10-transformation-project.md
  modified: []
decisions:
  - "All code examples use in-memory hardcoded DataFrames (no file I/O) for Pyodide compatibility"
  - "Each lesson has 1-3 PracticeBlocks with initialCode, hint, and solution"
  - "Lesson 10 repeats full dataset definition in each code block so every block is independently runnable"
  - "GroupBy .apply() includes include_groups=False to suppress pandas 2.2 deprecation warning"
metrics:
  duration_minutes: 35
  tasks_completed: 3
  files_created: 11
  files_modified: 0
  completed_date: "2026-03-14"
---

# Phase 10 Plan 01: Section 5 — Data Transformation Summary

**One-liner:** 10 pandas data transformation lessons covering groupby, pivot/melt, merge/join, window functions, and apply/map — each with runnable PracticeBlocks using in-memory data.

---

## What Was Built

11 markdown files in `courses/data-engineering/05-data-transformation/`:

| File | Topic | PracticeBlocks |
|------|-------|---------------|
| README.md | Section overview, lesson index table, learning path | 0 |
| lesson-01-groupby-basics.md | split-apply-combine, .agg(), named aggregations | 2 |
| lesson-02-groupby-advanced.md | .transform(), .filter(), .apply(), time groupby | 3 |
| lesson-03-pivot-tables.md | pivot_table(), crosstab(), normalize, pd.pivot() | 1 |
| lesson-04-melt-reshape.md | pd.melt(), stack(), unstack(), wide vs long | 2 |
| lesson-05-merge-join-basics.md | inner/left/right/outer joins, indicator, suffixes | 2 |
| lesson-06-merge-join-advanced.md | chained merges, concat, merge_asof | 1 |
| lesson-07-concat-append.md | concat patterns, drop_duplicates, combine_first | 2 |
| lesson-08-window-functions.md | rolling, expanding, ewm, shift, diff, rank | 2 |
| lesson-09-apply-map-transform.md | Series.map, DataFrame.apply, np.where, np.select | 2 |
| lesson-10-transformation-project.md | Full pipeline: enrich → aggregate → reshape → window | 0 (full exercises) |

---

## Verification Results

- `ls courses/data-engineering/05-data-transformation/` — 11 files confirmed
- `grep -l "Learning Objectives" lesson-*.md | wc -l` — 10 (all 10 lessons)
- `grep -l "Key Takeaways" lesson-*.md | wc -l` — 10 (all 10 lessons)
- `grep "06-etl-pipelines" lesson-10-transformation-project.md` — cross-section navigation present
- `grep -c "groupby\|pivot\|merge\|melt" lesson-10-transformation-project.md` — 49 matches (full integration)

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Decisions Made

1. **Pyodide-safe code**: Every code block uses hardcoded `pd.DataFrame({...})` construction — no `pd.read_csv()`, no file paths. All examples run in-browser.

2. **Independent runnable blocks**: In lesson-10, each Part's code block includes the full dataset definition so students can run any block standalone without needing to run prior blocks first.

3. **GroupBy .apply() warning suppression**: Used `include_groups=False` parameter introduced in pandas 2.2 to avoid deprecation warnings in the Advanced GroupBy lesson.

4. **PracticeBlock count per lesson**: 1-3 PracticeBlocks per lesson as specified. Lesson-10 uses full exercise blocks instead of PracticeBlocks (it is a project lesson with multiple inter-dependent steps).

---

## Self-Check

**Files exist:**
- courses/data-engineering/05-data-transformation/README.md — FOUND
- courses/data-engineering/05-data-transformation/lesson-01-groupby-basics.md — FOUND
- courses/data-engineering/05-data-transformation/lesson-10-transformation-project.md — FOUND

**Commit exists:**
- b7a44e5 — feat(v2.0): add Section 5 — Data Transformation (10 lessons) — FOUND

## Self-Check: PASSED
