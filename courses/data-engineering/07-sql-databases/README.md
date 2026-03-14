# Section 7: SQL & Databases

**Course:** Data Engineering | **Lessons:** 10 | **Level:** Intermediate

This section teaches SQL fundamentals and how to integrate SQLite databases into Python data pipelines using pandas and SQLAlchemy.

---

## Lessons

| # | Title | Key Topics |
|---|-------|------------|
| 01 | [SQL & Databases Overview](./lesson-01-sql-and-databases-overview.md) | databases vs files, SQL for DE, pandas ↔ SQL mapping |
| 02 | [SQLite Basics](./lesson-02-sqlite-basics.md) | sqlite3, :memory:, CREATE TABLE, INSERT, cursor |
| 03 | [SQL Queries](./lesson-03-sql-queries.md) | SELECT, WHERE, ORDER BY, LIMIT, LIKE, CASE WHEN |
| 04 | [SQL Aggregations](./lesson-04-sql-aggregations.md) | COUNT/SUM/AVG, GROUP BY, HAVING, subqueries |
| 05 | [SQL JOINs](./lesson-05-sql-joins.md) | INNER JOIN, LEFT JOIN, anti-join, self-join |
| 06 | [pandas read_sql](./lesson-06-pandas-read-sql.md) | pd.read_sql(), parameterized queries, chunksize |
| 07 | [pandas to_sql](./lesson-07-pandas-to-sql.md) | df.to_sql(), if_exists, schema control, chunked writes |
| 08 | [SQLAlchemy Basics](./lesson-08-sqlalchemy-basics.md) | create_engine, text(), engine.begin(), pandas integration |
| 09 | [Database Patterns](./lesson-09-database-patterns.md) | idempotent schema, upsert, staging tables |
| 10 | [Mini-Project: Sales Analytics](./lesson-10-sql-project.md) | end-to-end SQL + pandas analytics pipeline |

---

## Learning Path

```
Lesson 01: Why Databases?
    └── Lesson 02: SQLite + sqlite3
            └── Lesson 03: SELECT queries
                    └── Lesson 04: GROUP BY / HAVING
                            └── Lesson 05: JOINs
                                    └── Lesson 06: pd.read_sql()
                                            └── Lesson 07: df.to_sql()
                                                    └── Lesson 08: SQLAlchemy
                                                            └── Lesson 09: Patterns
                                                                    └── Lesson 10: Project
```

---

## Prerequisites

- **Section 2:** Pandas Fundamentals (required — DataFrames, groupby, merge)
- **Section 6:** ETL Pipelines (recommended — pipeline patterns)
- Python standard library: `sqlite3` module (no installation needed)

---

## Tools and Libraries

| Tool | Purpose | Installation |
|---|---|---|
| `sqlite3` | Built-in Python SQLite driver | Standard library — no install |
| `pandas` | DataFrame ↔ SQL bridge (`read_sql`, `to_sql`) | Pre-installed |
| `sqlalchemy` | Database-agnostic connection layer | `micropip.install("sqlalchemy")` in Pyodide |

---

## Key Skills Gained

After completing this section, you will be able to:

- Write SQL queries for extraction, filtering, aggregation, and joining
- Create and manage SQLite databases from Python with `sqlite3`
- Read SQL query results directly into pandas DataFrames with `pd.read_sql()`
- Write DataFrames to database tables with `df.to_sql()` (full load and incremental)
- Use SQLAlchemy as a database-agnostic connection layer
- Apply production-grade patterns: idempotent schema, upserts, staging tables

---

[← Section 6](../06-etl-pipelines/README.md) | [Section 8 →](../08-data-quality/README.md)
