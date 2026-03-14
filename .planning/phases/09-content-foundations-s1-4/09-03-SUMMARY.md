---
phase: 09-content-foundations-s1-4
plan: "03"
subsystem: content
tags: [pandas, csv, json, excel, parquet, data-loading, file-formats, content]
dependency_graph:
  requires: []
  provides:
    - "courses/data-engineering/03-data-loading-file-formats/ (10 lessons + README)"
    - "courses/data-engineering/data/orders.csv"
    - "courses/data-engineering/data/products.json"
  affects:
    - "courses/data-engineering/ (section 3 now complete)"
tech_stack:
  added: []
  patterns:
    - "PracticeBlock MDX components with initialCode/hint/solution"
    - "Bundled dataset references via relative path (data/orders.csv)"
    - "Callout components: Warning, Tip, Info"
key_files:
  created:
    - courses/data-engineering/03-data-loading-file-formats/README.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-01-reading-csv-files.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-02-csv-options-and-edge-cases.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-03-reading-json-files.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-04-normalizing-json.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-05-reading-excel-files.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-06-writing-files.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-07-parquet-format.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-08-chunked-reading.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-09-inspecting-new-datasets.md
    - courses/data-engineering/03-data-loading-file-formats/lesson-10-section-review-loading.md
    - courses/data-engineering/data/orders.csv
    - courses/data-engineering/data/products.json
  modified: []
decisions:
  - "PracticeBlock exercises reference bundled data via relative path 'data/orders.csv' — resolved by Phase 8 Pyodide filesystem mounting"
  - "Parquet lesson uses orders.csv as the base dataset and writes orders.parquet in-exercise — no external file needed"
  - "Excel lesson uses io.BytesIO round-trip pattern — no actual .xlsx file needed for in-browser execution"
  - "Chunked reading lesson uses chunksize=3-4 on the small orders.csv to demonstrate the concept without needing large files"
metrics:
  duration: "35 minutes"
  completed_date: "2026-03-14"
  tasks_completed: 2
  files_created: 13
---

# Phase 9 Plan 03: Section 3 — Data Loading & File Formats Summary

**One-liner:** 10 lessons covering CSV/JSON/Excel/Parquet loading with `pd.read_csv`, `pd.read_json`, `pd.json_normalize`, `pd.read_excel`, `pd.read_parquet`, chunked reading, and the 7-step inspection workflow — plus bundled datasets `orders.csv` and `products.json`.

---

## What Was Built

### Task 1: Bundled Datasets + Lessons 1-5 (CSV and JSON loading)

**Bundled datasets:**
- `courses/data-engineering/data/orders.csv` — 10 sales orders (header + 10 data rows) with order_id, customer, product, category, quantity, unit_price, order_date, region
- `courses/data-engineering/data/products.json` — 6 products with nested `specs` object (weight_kg, warranty_years)

**Lessons created:**
- **lesson-01**: `pd.read_csv()` core parameters — sep, header, index_col, usecols, nrows, dtype. Two PracticeBlocks loading orders.csv.
- **lesson-02**: CSV edge cases — na_values, parse_dates, encoding, on_bad_lines, skiprows/skipfooter. Two PracticeBlocks (parse_dates + io.StringIO na_values demo).
- **lesson-03**: `pd.read_json()` — flat arrays, orient parameter (records/index/columns/values/split), lines=True. Two PracticeBlocks (products.json load + in-memory records string).
- **lesson-04**: `pd.json_normalize()` — flattening nested dicts, sep parameter, record_path + meta for one-to-many structures. Two PracticeBlocks (flatten specs, change separator).
- **lesson-05**: `pd.read_excel()` — sheet_name, multi-sheet workbooks, openpyxl dependency. One PracticeBlock using io.BytesIO round-trip (no .xlsx file needed).

### Task 2: Lessons 6-10 (writing, Parquet, chunking, inspection, review)

- **lesson-06**: Writing files — `to_csv(index=False)` (the index trap), `to_json(orient='records', lines=True)` JSON Lines, `to_excel()` with ExcelWriter multi-sheet, pathlib.Path best practices. Two PracticeBlocks.
- **lesson-07**: Parquet format — columnar storage explanation, `to_parquet`/`read_parquet`, column pruning, Parquet vs CSV comparison table, production context (S3, BigQuery, Spark). Two PracticeBlocks.
- **lesson-08**: Chunked reading — chunksize iterator, accumulation pattern (list-of-Series and dict variants), chunking vs Dask vs Spark decision guide. Two PracticeBlocks.
- **lesson-09**: Inspection workflow — 7-step checklist (shape, head/tail, dtypes/info, describe, value_counts, isnull, duplicated), red flags table, documentation pattern. One PracticeBlock (full 7-step scaffold).
- **lesson-10**: Section review — format quick reference table, decision tree, 3 integrated PracticeBlocks (CSV→Parquet, JSON normalize→filter→CSV, chunked revenue accumulation), Section 4 preview.

---

## Deviations from Plan

None — plan executed exactly as written. All 10 lessons + README + 2 bundled datasets created per specification.

---

## Self-Check

**Files verified:**

- [x] `courses/data-engineering/03-data-loading-file-formats/` — 11 files (README + 10 lessons)
- [x] `courses/data-engineering/data/orders.csv` — header + 10 data rows
- [x] `courses/data-engineering/data/products.json` — 6 products with nested specs
- [x] Lesson 10 has 3 PracticeBlocks (verified via grep count = 3)
- [x] Commit hash: `fcdc00a`

## Self-Check: PASSED
