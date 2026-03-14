---
phase: 10-content-core-skills-s5-7
plan: "03"
subsystem: content
tags: [sql, databases, sqlite3, sqlalchemy, pandas, data-engineering]
dependency_graph:
  requires: [02-pandas-fundamentals, 06-etl-pipelines]
  provides: [07-sql-databases section, SQL+pandas integration patterns]
  affects: [08-data-quality, DE course content progress]
tech_stack:
  added: []
  patterns: [sqlite3 in-memory DB, pd.read_sql parameterized queries, df.to_sql if_exists patterns, SQLAlchemy engine+text(), staging table pattern, INSERT OR REPLACE upsert]
key_files:
  created:
    - courses/data-engineering/07-sql-databases/README.md
    - courses/data-engineering/07-sql-databases/lesson-01-sql-and-databases-overview.md
    - courses/data-engineering/07-sql-databases/lesson-02-sqlite-basics.md
    - courses/data-engineering/07-sql-databases/lesson-03-sql-queries.md
    - courses/data-engineering/07-sql-databases/lesson-04-sql-aggregations.md
    - courses/data-engineering/07-sql-databases/lesson-05-sql-joins.md
    - courses/data-engineering/07-sql-databases/lesson-06-pandas-read-sql.md
    - courses/data-engineering/07-sql-databases/lesson-07-pandas-to-sql.md
    - courses/data-engineering/07-sql-databases/lesson-08-sqlalchemy-basics.md
    - courses/data-engineering/07-sql-databases/lesson-09-database-patterns.md
    - courses/data-engineering/07-sql-databases/lesson-10-sql-project.md
  modified: []
decisions:
  - "All SQLite examples use sqlite3.connect(':memory:') — no file system access, works in Pyodide"
  - "SQLAlchemy examples use create_engine('sqlite:///:memory:') — consistent with micropip availability in browser"
  - "Lesson 10 capstone uses hardcoded DataFrames loaded via to_sql() to avoid file I/O constraints"
  - "Added PracticeBlock components to lessons 02, 03, 04, 05, 06, 07, 08, 09, 10 for in-browser practice"
  - "Anti-join pattern (LEFT JOIN + IS NULL) covered in Lesson 05 as a standalone pattern"
metrics:
  duration_minutes: 45
  completed_date: "2026-03-14"
  tasks_completed: 3
  tasks_total: 3
  files_created: 11
  files_modified: 0
---

# Phase 10 Plan 03: Section 7 — SQL & Databases (10 lessons) Summary

**One-liner:** Ten structured lessons teaching SQLite with sqlite3, SQL query fundamentals (SELECT/GROUP BY/JOINs), pandas read_sql/to_sql bridge, SQLAlchemy create_engine, database patterns (upsert, staging), and a capstone sales analytics mini-project — all using in-memory SQLite for in-browser compatibility.

---

## Tasks Completed

| Task | Name | Commit | Files |
|---|---|---|---|
| 1 | SQL overview and SQLite basics (01-03) | ab39d8a | lesson-01, lesson-02, lesson-03 |
| 2 | SQL aggregations, joins, pandas read/write (04-07) | ab39d8a | lesson-04, lesson-05, lesson-06, lesson-07 |
| 3 | SQLAlchemy, patterns, capstone + README (08-10 + README) | ab39d8a | lesson-08, lesson-09, lesson-10, README.md |

---

## What Was Built

### Lesson 01: SQL and Databases Overview
- When to use databases vs files (concurrent writes, large data, referential integrity)
- Database types: RDBMS vs column-store vs NoSQL context for DE
- Side-by-side SQL ↔ pandas comparison table (SELECT/WHERE/GROUP BY/JOIN)
- Exercises: translate SQL to pandas and pandas to SQL

### Lesson 02: SQLite Basics
- `sqlite3.connect(":memory:")` setup and `:memory:` vs file path explanation
- `CREATE TABLE` with SQLite data types (INTEGER, TEXT, REAL)
- Parameterized inserts with `?` placeholders (security rationale)
- `executemany()` for bulk inserts, `cursor.fetchall()`, `cursor.description`
- PracticeBlock: create books table, insert 5 rows, query by year

### Lesson 03: SQL Queries
- SELECT projection, WHERE with comparison operators
- `ORDER BY ASC/DESC`, `LIMIT/OFFSET` for pagination
- `IN`, `BETWEEN`, `LIKE`, `IS NULL`/`IS NOT NULL`
- Column aliases, arithmetic expressions, string functions (`UPPER`, `LENGTH`, `SUBSTR`)
- `strftime()` for date extraction, `CASE WHEN ... THEN ... END` for conditional columns
- PracticeBlock: compute bonus column with WHERE filter

### Lesson 04: SQL Aggregations
- `COUNT(*)`, `COUNT(col)`, `COUNT(DISTINCT col)`, `SUM`, `AVG`, `MIN`, `MAX`
- `GROUP BY` single and multiple columns, NULL group handling
- `HAVING` vs `WHERE` — pre/post-aggregation distinction
- Subquery in HAVING to compare groups against overall average
- PracticeBlock: region deal stats with HAVING filter

### Lesson 05: SQL JOINs
- `INNER JOIN` with table aliases, three-table join pattern
- `LEFT JOIN` for "include zeros" and the anti-join pattern (`LEFT JOIN + WHERE right.id IS NULL`)
- Non-equi join with `BETWEEN` (salary bands)
- Self-join for employee → manager hierarchy
- PracticeBlock: LEFT JOIN all products + total revenue including zero-order products

### Lesson 06: pandas read_sql
- `pd.read_sql(sql, conn)` → DataFrame with column names from SELECT aliases
- `pd.read_sql_query()` vs `pd.read_sql_table()`
- Safe parameterization: `params=[value]` with `?` placeholders (vs dangerous f-strings)
- `parse_dates=["col"]`, `index_col="col"`, `chunksize=N` generator
- PracticeBlock: dept summary with `HAVING MIN(salary) >= ?` parameterized query

### Lesson 07: pandas to_sql
- `df.to_sql(name, conn, if_exists="replace", index=False)`
- `if_exists` options: "fail", "replace", "append" — when to use each
- `index=False` rationale (avoid unwanted RangeIndex column)
- Type inference (int64 → INTEGER, float64 → REAL, object → TEXT)
- Pre-create table with constraints + `if_exists="append"` pattern
- `dtype` parameter with SQLAlchemy for explicit type control
- `chunksize` + `method="multi"` for large DataFrames
- PracticeBlock: update product price and verify round-trip

### Lesson 08: SQLAlchemy Basics
- Why SQLAlchemy: unified interface, connection string swap = database swap
- `create_engine("sqlite:///:memory:", echo=False)`
- `text()` wrapper required for all SQL strings
- `:param_name` named parameters with dict (vs `?` in raw sqlite3)
- `engine.begin()` vs `engine.connect()` — auto-commit vs explicit
- `pd.read_sql()` and `df.to_sql()` with SQLAlchemy engine
- `pd.read_sql_table()` requires SQLAlchemy
- PracticeBlock: full pipeline using engine.begin() + text() + pd.read_sql()

### Lesson 09: Database Patterns
- `CREATE TABLE IF NOT EXISTS` for idempotent schema creation
- `DROP TABLE IF EXISTS` for development resets
- Schema version table pattern for migration tracking
- `INSERT OR REPLACE INTO` (SQLite upsert — delete + insert on PK conflict)
- `INSERT OR IGNORE INTO` (new rows only, skip existing)
- pandas upsert via `combine_first` for partial column updates
- Staging table pattern: stg_ → transform → production → truncate staging
- Batch ID column for load tracking and audit trail
- PracticeBlock: staging load + promotion pipeline

### Lesson 10: Mini-Project — Sales Analytics
- Schema setup: customers, products, orders seeded from hardcoded DataFrames via `to_sql()`
- Query 1: revenue by segment with `JOIN customers + JOIN products + GROUP BY segment`
- Query 2: product revenue ranking with `LEFT JOIN` (includes zero-order products)
- Query 3: monthly revenue trend with `strftime('%Y-%m', order_date)`
- pandas post-processing: revenue share %, cumulative totals, pivot by segment, MoM pct_change()
- Customer lifetime value with `.rank()`
- Upsert 5 new April orders via `INSERT OR REPLACE` through SQLAlchemy
- Challenge: multi-category customers — SQL approach (HAVING) vs pandas approach (nunique + query)
- Reflection block: SQL strengths vs pandas strengths
- PracticeBlock: most popular product per city with JOIN + GROUP BY

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Self-Check: PASSED

- All 11 files (10 lessons + README.md) found at `courses/data-engineering/07-sql-databases/`
- Commit ab39d8a confirmed in git log
- All 10 lessons contain "Learning Objectives" header
- Lesson 02 uses `sqlite3.connect(":memory:")` throughout
- Lesson 06 has 37 occurrences of `read_sql`
- Lesson 08 uses `create_engine`
- Lesson 10 navigation points to `08-data-quality`
