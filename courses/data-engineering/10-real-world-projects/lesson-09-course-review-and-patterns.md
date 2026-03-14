# Lesson 9: Course Review and Patterns

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Recall the key pattern from each of the 10 sections of this course
- Connect patterns that work together (profiling informs chunking decisions; cleaning enables contract enforcement)
- Apply the problem → pattern decision tree to identify the right tool for a given DE problem
- Describe 5 real-world systems you can build with the skills from this course

---

## Prerequisites

- All Sections 1–10 of the Data Engineering course (this lesson reviews the complete curriculum)

---

## Lesson Outline

### Part 1: Sections 1–5 Pattern Summary

Each section introduced a fundamental pattern. The table below captures the essential idea and tells you when to reach for it.

| Section | Theme | Key Pattern | When to Use It |
|---------|-------|-------------|----------------|
| **S1** | DE Landscape | Pipeline mindset: data flows through stages | Any time you are designing a data process — think in stages, not in scripts |
| **S2** | pandas Fundamentals | DataFrame CRUD: create, select, filter, aggregate | When you need labeled tabular data with type-aware operations |
| **S3** | File I/O | `pd.read_csv()` with options: `dtype=`, `parse_dates=`, `chunksize=` | When reading structured files — always specify dtypes and parse dates explicitly |
| **S4** | Data Cleaning | Null handling → type conversion → deduplication → normalization | When raw data has quality problems — profile first, then clean in a fixed order |
| **S5** | Transformation | `groupby().agg()` + `merge(how='left')` | When aggregating by dimension or combining data from two sources |

#### Pattern Interactions: S1–S5

These patterns build on each other:

- **S2 + S3**: load from file → inspect with `.info()` and `.describe()` → this is the starting point of every pipeline
- **S3 + S4**: reading a CSV reveals quality problems → cleaning fixes them before processing
- **S4 + S5**: you cannot reliably aggregate or join data that has null keys or inconsistent types — clean before transforming

#### The S4 Cleaning Order

Data cleaning has a fixed best-practice order that prevents one cleaning step from interfering with another:

```
1. Deduplicate (drop_duplicates) — remove exact copies first
2. Fill or drop nulls (fillna / dropna) — handle missing data
3. Parse types (pd.to_datetime, astype) — convert strings to proper types
4. Normalize strings (str.lower, str.strip) — standardize text
5. Remove invalid values (boolean filter) — enforce business rules
```

Swapping steps 3 and 4 causes problems: you cannot `.str.lower()` a column you already converted to `int`. The order matters.

---

### Part 2: Sections 6–10 Pattern Summary

| Section | Theme | Key Pattern | When to Use It |
|---------|-------|-------------|----------------|
| **S6** | ETL Pipelines | `PipelineResult` + step timing + structured error handling | When building a multi-step data process that needs observability |
| **S7** | SQL & Databases | `pd.read_sql()` + SQLite with `:memory:` for in-process storage | When data needs to persist, be queried, or be shared with other tools |
| **S8** | Data Quality | pandera contracts + `lazy=True` + dimension scoring | When you need to enforce a data contract at the load boundary |
| **S9** | Performance | Vectorization hierarchy: column arithmetic → `.str` → `np.where`/`np.select` → `apply` | When a pipeline is slow — profile first, then vectorize the hotspot |
| **S10** | Integration | Project workflow: profile → clean → validate → load → report | When shipping a complete pipeline — always verify against expected output |

#### The Vectorization Hierarchy (S9)

When pandas code is slow, apply this decision tree in order:

```
1. Can I express this as column arithmetic?   → YES → df['a'] * df['b']
2. Is this a string operation?                → YES → df['col'].str.method()
3. Is this a conditional assignment?          → YES → np.where() or np.select()
4. Does this need a Python function per row?  → YES → df.apply(fn, axis=1)  [last resort]
```

Never start at step 4. `apply(axis=1)` should only appear in code after you have confirmed that steps 1–3 are not applicable.

#### Pattern Interactions: S6–S10

- **S6 + S8**: ETL structure (extract/transform/load) + contract enforcement at the load boundary = production-grade pipeline
- **S8 + S9**: profiling (S8) tells you which columns have quality issues; if those columns are large, use chunked processing (S9) to avoid loading the full dataset into memory
- **S6 + S10**: the project workflow in S10 IS the ETL pattern from S6 — profile → clean → validate → load → report maps exactly to extract → transform → contract → load → log

---

### Part 3: Problem → Pattern Decision Tree

When a new data problem arrives, use this decision tree to identify the right approach before writing code.

```
What is the problem?
│
├── "I need to load data from a file"
│       → S3: pd.read_csv() with dtype= and parse_dates=
│       → If large: add chunksize= and process in chunks (S9)
│
├── "The data has quality problems"
│       → S8: profile first — null rates, cardinality, dtype conformance
│       → Then S4: clean in order (dedup → fill → parse → normalize → filter)
│       → Then S8: validate with contract after cleaning
│
├── "I need to combine data from two sources"
│       → S5: merge() — identify join keys, check dtypes match
│       → If keys don't match: S4 normalize first, then merge
│       → Use how='left' by default (preserve primary source)
│
├── "I need to aggregate: count, sum, average by group"
│       → S5: groupby().agg() — specify aggregation per column
│       → If computing recency/frequency/monetary: groupby + concat (S10 Project 4)
│
├── "The pipeline is too slow"
│       → S9: benchmark first (don't optimize blindly)
│       → Profile with time.perf_counter() per step
│       → Apply vectorization hierarchy: column arithmetic → np.select → apply
│       → If memory is the limit: add chunksize= (S9)
│
├── "I need to build a reliable, observable pipeline"
│       → S6: ETL class with PipelineResult + per-step StepResult
│       → S8: add contract check after transform
│       → Always log step name, rows_in, rows_out, duration
│
├── "I need to store data and query it later"
│       → S7: SQLite with pd.to_sql() / pd.read_sql()
│       → Use :memory: for in-process (tests, demos)
│       → Use a file path for persistence
│
└── "I need to test my pipeline"
        → S8: pytest + fixtures (build test DataFrames with pd.DataFrame constructor)
        → Parametrize edge cases: empty input, all-null column, single row
        → Test each function independently — not just the full pipeline
```

#### When Multiple Patterns Apply

Most real problems require combining patterns. Use this priority rule:

1. **Profile before anything else** (S8) — you cannot clean what you don't understand
2. **Clean before transforming** (S4 before S5) — aggregations on null data produce wrong results
3. **Validate before loading** (S8 before S6's load step) — loading bad data is worse than not loading
4. **Benchmark before optimizing** (S9) — always measure first; intuition about hotspots is often wrong

---

### Part 4: What You Can Build Now

With the skills from this course, you can build these real-world systems today:

#### 1. Daily Sales Report Pipeline

**What it does:** Reads yesterday's transactions CSV from a shared drive, cleans it, validates it, aggregates by region and product category, and emails a formatted summary report.

**Skills used:** S3 (file I/O), S4 (cleaning), S5 (groupby aggregation), S8 (validation), S6 (ETL structure with logging)

**Why it's valuable:** Replaces manual Excel work that someone does every morning. Once deployed, it runs in seconds instead of 30 minutes.

#### 2. Customer Health Monitor

**What it does:** Runs nightly against a CRM export, computes RFM scores, detects customers who have dropped from "Loyal" to "At-Risk" since last week, and outputs a list for the sales team to follow up with.

**Skills used:** S5 (groupby for RFM), S9 (np.select for segmentation), S4 (date parsing), S8 (data contract to validate the CRM export)

**Why it's valuable:** Proactive customer retention — you catch churn signals before customers leave, not after.

#### 3. Log Anomaly Detector

**What it does:** Reads log files from 5 microservices, computes error rates per hour, detects services above the 5% threshold, and posts alerts to a monitoring channel.

**Skills used:** S3 (reading structured text), S4 (string normalization), S5 (groupby by service and hour), S9 (vectorized string ops)

**Why it's valuable:** Replaces manual log searching. Catches production issues within minutes of occurrence.

#### 4. Data Migration Validator

**What it does:** After migrating data from system A to system B, reads both exports, joins them on the primary key, and reports: row count match, column value match rate, missing records in target.

**Skills used:** S5 (merge), S4 (key normalization — keys are often formatted differently between systems), S8 (validation contract), S6 (structured result reporting)

**Why it's valuable:** Replaces manual spot-checking. Gives a confidence score for the migration before going live.

#### 5. API Response Archiver

**What it does:** Fetches paginated JSON from a REST API, normalizes it using `pd.json_normalize()`, validates the schema, and appends to a SQLite database.

**Skills used:** S3 (json loading with pd.json_normalize), S7 (SQLite with pd.to_sql), S8 (schema validation on API responses — they change without warning), S6 (ETL structure)

**Why it's valuable:** Creates a local historical archive of external data you don't control. Enables analysis of trends over time without depending on API availability.

---

## Key Takeaways

- **Patterns compound**: cleaning + validation + performance + ETL structure = production pipeline. No single section gives you a production-grade system — all of them together do.
- **The decision tree is more valuable than memorizing API surface**: knowing when to use `groupby` matters more than remembering every `groupby` parameter. The `?` help operator, pandas docs, and this decision tree are your tools.
- **Build the simplest pipeline that produces the right output, then optimize**: premature optimization (reaching for chunked processing before the pipeline even works) wastes time. Make it correct first.
- **Profile before you clean; validate after you clean; benchmark before you optimize**: these three sequencing rules prevent the most common mistakes in data engineering work.
- **Every pattern in this course has a test**: the final sign that you understand a pattern is that you can write a pytest test for it using a small synthetic DataFrame constructed with `pd.DataFrame({...})`.

---

## Common Mistakes to Avoid

- **Jumping to advanced techniques before mastering groupby and merge**: `groupby` and `merge` are the two most-used operations in the entire DE workflow. If your groupby results look wrong, the problem is almost always in the `agg` spec or the `reset_index()` call — not in your logic. Master these two before reaching for anything from S6–S9.

- **Treating quality as an afterthought**: data quality checks should run before transformation, not after. A groupby on a column with null values silently drops those rows. A merge on a column with inconsistent types silently produces zero matches. Quality problems are silent bugs — they don't raise exceptions, they produce wrong answers.

- **Building pipelines without tests**: a pipeline that runs without errors is not necessarily a pipeline that produces correct output. Write tests for each transformation function with known inputs and expected outputs. Three tests per function is the minimum.

---

## Next Lesson Preview

**Lesson 10: Next Steps and Resources**

You have completed all 10 sections. The final lesson charts a learning path beyond this course: tools to learn next, where this curriculum fits in the broader DE landscape, portfolio project ideas, and a concrete 30/60/90-day plan.

---

[← Lesson 8: Project 7 — Multi-Source Pipeline](./lesson-08-project-7-multi-source-pipeline.md) | [Next Lesson: Next Steps and Resources →](./lesson-10-next-steps-and-resources.md)
