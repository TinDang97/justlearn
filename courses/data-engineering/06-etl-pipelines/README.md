# Section 6: ETL Pipelines

**Course:** Data Engineering | **Lessons:** 10 | **Level:** Intermediate

This section teaches how to structure data movement code as maintainable, fault-tolerant pipelines using the Extract-Transform-Load pattern. You will learn to separate concerns, handle errors gracefully, log pipeline activity, make pipelines idempotent, and manage configuration cleanly.

---

## Lessons

| # | Title | Key Topics |
|---|-------|------------|
| 01 | [ETL Overview](./lesson-01-etl-overview.md) | E-T-L stages, pipeline anatomy, batch vs incremental |
| 02 | [Extract Patterns](./lesson-02-extract-patterns.md) | CSV/JSON/API extraction, schema validation, multi-source |
| 03 | [Transform Patterns](./lesson-03-transform-patterns.md) | Composable functions, validation, step registry |
| 04 | [Load Patterns](./lesson-04-load-patterns.md) | to_csv/to_sql, append vs overwrite, load metadata |
| 05 | [Error Handling](./lesson-05-error-handling.md) | try/except, custom exceptions, dead-letter pattern |
| 06 | [Logging](./lesson-06-logging.md) | basicConfig, log levels, PipelineStage context manager |
| 07 | [Pipeline Orchestration](./lesson-07-pipeline-orchestration.md) | PipelineRunner, stage dependencies, retry logic |
| 08 | [Idempotency](./lesson-08-idempotency-reruns.md) | Watermarks, incremental loads, upsert patterns |
| 09 | [Config and Environment](./lesson-09-config-and-env.md) | PipelineConfig dataclass, env vars, dry_run flag |
| 10 | [Mini-Project](./lesson-10-etl-project.md) | End-to-end ETL pipeline integrating all skills |

---

## What You Will Build

By the end of this section you will have built a complete daily sales ETL pipeline that:

- Extracts raw transactions from a simulated CSV source
- Validates the schema at the extraction boundary
- Transforms data: filters invalid rows, enriches with categories, aggregates by region
- Collects invalid rows into a dead-letter output with error reasons
- Loads the summary into an in-memory SQLite database
- Logs every stage with timing and row counts
- Is safe to re-run (idempotent) and supports a `dry_run` mode

---

## Prerequisites

- Section 2: Pandas Fundamentals
- Section 3: Data Loading and File Formats
- Section 4: Data Cleaning
- Section 5: Data Transformation (recommended)
- Python Course: Functions and Modules, File Handling and Exceptions

---

## Key Patterns Covered

| Pattern | Lesson |
|---|---|
| ETL function separation | 01 |
| Column validation at extract boundary | 02 |
| Single-responsibility transform functions | 03 |
| Transform step registry | 03 |
| Load metadata dict | 04 |
| Custom exception hierarchy | 05 |
| Dead-letter pattern | 05 |
| PipelineStage context manager | 06 |
| PipelineRunner with short-circuit | 07 |
| Watermark-based incremental extract | 08 |
| Upsert with SQLite | 08 |
| PipelineConfig dataclass | 09 |
| dry_run flag | 09 |

---

[← Section 5](../05-data-transformation/README.md) | [Section 7 →](../07-sql-databases/README.md)
