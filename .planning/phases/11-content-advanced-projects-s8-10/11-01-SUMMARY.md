---
phase: 11-content-advanced-projects-s8-10
plan: "01"
subsystem: content
tags: [data-engineering, data-quality, testing, pandas, pyodide]
dependency_graph:
  requires: []
  provides:
    - courses/data-engineering/08-data-quality-testing/
  affects:
    - DE course sidebar navigation
    - Section 8 prev/next links
tech_stack:
  added: []
  patterns:
    - DataFrameSchema + Column + Check (manual pandera-compatible pattern)
    - DataContract dataclass with enforce() method
    - ContractViolationError with structured violation list
    - profile_dataframe() per-column stats function
    - run_quality_check() with PASS/WARN/FAIL thresholds
key_files:
  created:
    - courses/data-engineering/08-data-quality-testing/lesson-01-why-data-quality-matters.md
    - courses/data-engineering/08-data-quality-testing/lesson-02-schema-validation-with-pandera.md
    - courses/data-engineering/08-data-quality-testing/lesson-03-data-profiling-with-pandas.md
    - courses/data-engineering/08-data-quality-testing/lesson-04-detecting-anomalies-and-outliers.md
    - courses/data-engineering/08-data-quality-testing/lesson-05-data-contracts-introduction.md
    - courses/data-engineering/08-data-quality-testing/lesson-06-implementing-data-contracts.md
    - courses/data-engineering/08-data-quality-testing/lesson-07-testing-pipelines-with-pytest.md
    - courses/data-engineering/08-data-quality-testing/lesson-08-data-quality-dashboard.md
    - courses/data-engineering/08-data-quality-testing/README.md
  modified: []
decisions:
  - "Implemented pandera-compatible schema validation manually (DataFrameSchema, Column, Check) — pandera package cannot be installed in Pyodide without micropip; manual implementation mirrors the pandera API exactly so students can transfer knowledge"
  - "Used in-memory DataFrames throughout — no pd.read_csv() calls since the data/ directory bundling for Section 8 is not yet implemented"
  - "Added PracticeBlock to lessons 1, 2, 3, 4, 6, 8 (6 lessons) instead of the plan-specified 5 — lesson 1 warranted a practice block to reinforce the quality_report() function"
metrics:
  duration: "~70 minutes"
  completed_date: "2026-03-15"
  tasks_completed: 2
  tasks_total: 2
  files_created: 9
  files_modified: 0
---

# Phase 11 Plan 01: Section 8 — Data Quality & Testing Summary

**One-liner:** 8-lesson Data Engineering section teaching schema validation (pandera-compatible manual implementation), data profiling, IQR/z-score outlier detection, data contracts as dataclass code, pytest pipeline testing patterns, and a weighted quality dashboard — all in-memory pandas, Pyodide-compatible.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Lessons 1-4: quality dimensions, schema validation, profiling, anomaly detection | fce61cf |
| 2 | Lessons 5-8: data contracts intro, contract implementation, pytest testing, quality dashboard + README | fce61cf |

## Deliverables

### Lesson Files Created

| File | Key Contribution | Practice? |
|------|-----------------|-----------|
| lesson-01-why-data-quality-matters.md | `quality_report()` scoring 6 dimensions (completeness, accuracy, consistency, timeliness, validity, uniqueness) | Yes |
| lesson-02-schema-validation-with-pandera.md | `DataFrameSchema` + `Column` + `Check` + `SchemaError` + lazy validation | Yes |
| lesson-03-data-profiling-with-pandas.md | `profile_dataframe()` returning per-column dtype/null_rate/cardinality/top_value DataFrame | Yes |
| lesson-04-detecting-anomalies-and-outliers.md | IQR fences, manual z-score, `check_domain_rules()`, winsorization with `.clip()` | Yes |
| lesson-05-data-contracts-introduction.md | Producer/consumer model, 3 contract layers (schema/semantics/SLA), ASCII pipeline boundary diagrams | No |
| lesson-06-implementing-data-contracts.md | `@dataclass OrdersContract` with `enforce()`, `ContractViolationError`, ETL wiring at extract + load boundaries | Yes |
| lesson-07-testing-pipelines-with-pytest.md | Fixtures (`sample_orders`, `dirty_orders`, fixture composition), `parametrize`, `assert_frame_equal`, `pytest.raises` | No |
| lesson-08-data-quality-dashboard.md | `run_quality_check()` returning `{overall, status, dimensions, blocking}`, `format_quality_report()` with box-drawing table | Yes |
| README.md | Section index with lesson table, learning path diagram, key code pattern list | N/A |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Intentional Deviations

**1. [Rule 2 - Missing functionality] Added PracticeBlock to lesson-01**
- **Found during:** Task 1
- **Issue:** Plan specified PracticeBlocks in lessons 2, 3, 4, 6, 8. Lesson 1 introduces `quality_report()` as a full function that students need to practice to retain.
- **Fix:** Added a PracticeBlock in lesson-01 Part 4 using the messy transactions DataFrame from the plan description.
- **Impact:** Lesson 1 now has 1 PracticeBlock. Verification still passes (lessons 2, 3, 4, 6, 8 all have PracticeBlocks as specified).

**2. [Rule 1 - Adaptation] In-memory DataFrames instead of `pd.read_csv('data/transactions.csv')`**
- **Found during:** Task 1
- **Issue:** Plan context says to use `pd.read_csv('data/transactions.csv')` but the `data/` directory bundling for the DE course is not yet implemented in the platform.
- **Fix:** All code examples use inline `pd.DataFrame({...})` construction. Comments note where real pipelines would load from CSV/DB.
- **Impact:** All code runs in Pyodide without any file I/O. No data directory dependency.

**3. [Rule 1 - Adaptation] Manual pandera implementation instead of `import pandera as pa`**
- **Found during:** Task 1 (lesson-02)
- **Issue:** `pandera` package requires micropip installation in Pyodide. The plan says to implement schema validation without pandera/great_expectations and implement validation manually.
- **Fix:** Implemented `DataFrameSchema`, `Column`, `Check`, `SchemaError` classes that mirror the pandera API exactly (same method names, same `lazy=True` parameter, same `SchemaError.failure_cases` attribute). Lesson text explicitly notes the Pyodide rationale.
- **Impact:** All code runs in browser. Students learn the pandera API pattern and can transfer to real pandera when working outside Pyodide.

## Key Code Patterns Introduced

```python
# Schema validation (Lesson 2)
schema = DataFrameSchema({
    'amount': Column(dtype='float64', nullable=False, checks=[Check.greater_than(0)]),
})
schema.validate(df, lazy=True)  # collects all violations

# Data profiling (Lesson 3)
profile = profile_dataframe(df)  # returns per-column stats DataFrame

# Outlier detection (Lesson 4)
Q1, Q3 = df['amount'].quantile([0.25, 0.75])
IQR = Q3 - Q1
outliers = df[(df['amount'] < Q1 - 1.5*IQR) | (df['amount'] > Q3 + 1.5*IQR)]
z_scores = (df['amount'] - df['amount'].mean()) / df['amount'].std()

# Data contract (Lesson 6)
@dataclass
class OrdersContract:
    version: str = "1.0"
    min_row_count: int = 100
    max_null_rate: float = 0.05
    def enforce(self, df): ...  # raises ContractViolationError

# Quality dashboard (Lesson 8)
result = run_quality_check(df, THRESHOLDS, id_col=..., amount_col=..., ...)
# result = {'overall': 0.92, 'status': 'WARN', 'blocking': False, 'dimensions': {...}}
```

## Self-Check

### Files created
- [x] lesson-01-why-data-quality-matters.md — FOUND
- [x] lesson-02-schema-validation-with-pandera.md — FOUND
- [x] lesson-03-data-profiling-with-pandas.md — FOUND
- [x] lesson-04-detecting-anomalies-and-outliers.md — FOUND
- [x] lesson-05-data-contracts-introduction.md — FOUND
- [x] lesson-06-implementing-data-contracts.md — FOUND
- [x] lesson-07-testing-pipelines-with-pytest.md — FOUND
- [x] lesson-08-data-quality-dashboard.md — FOUND
- [x] README.md — FOUND

### Commits
- [x] fce61cf — feat(v2.0): add Section 8 — Data Quality & Testing (8 lessons)

### Required content
- [x] All 8 lessons have `## Learning Objectives`, `## Lesson Outline`, `## Key Takeaways`, `## Common Mistakes to Avoid`
- [x] Lessons 1, 2, 3, 4, 6, 8 have `<PracticeBlock` components
- [x] No `import scipy`, `import matplotlib`, `import pandera`, `import great_expectations` in code blocks
- [x] lesson-01 links back to Section 7 as Previous
- [x] lesson-08 links forward to Section 9 as Next
- [x] All lessons have prev/next nav footer

## Self-Check: PASSED
