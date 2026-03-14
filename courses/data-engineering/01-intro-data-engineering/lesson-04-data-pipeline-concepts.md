# Lesson 4: Data Pipeline Concepts

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Define a data pipeline and describe its component parts
- Distinguish between ETL and ELT and explain when each is appropriate
- Explain idempotency and why it matters for pipeline reliability
- Describe incremental loading and contrast it with full refresh
- Identify the most common pipeline failure modes

---

## Prerequisites

- Lesson 1: What is Data Engineering?
- Lesson 2: The Modern Data Stack
- Lesson 3: Python for Data Engineering

---

## Part 1: What is a Pipeline?

The water pipeline analogy is one of the most useful mental models in data engineering, and it is worth being precise about it.

A water pipeline has a source (a reservoir, a river), a treatment facility (filtration, purification), and a distribution network (the pipes that deliver clean water to homes and businesses). The water that comes out of your tap is not the same as the water that entered the system at the reservoir — it has been transformed into something safe and usable. The pipeline is the infrastructure that makes that transformation happen automatically, reliably, and at scale.

A data pipeline is structurally identical:

- **Source**: where raw data originates (a production database, an API, a file drop)
- **Treatment / transformation**: business logic applied to the raw data (cleaning, joining, aggregating, enriching)
- **Distribution / destination**: where the processed data lands so it can be used (a data warehouse, another database, a file for downstream consumption)

The pipeline is the automated system that makes this journey happen on a schedule without manual intervention.

When someone says "we need a pipeline for Salesforce data", they mean: build an automated system that periodically extracts data from Salesforce, applies whatever transformations are needed, and loads it into the warehouse where analysts can query it.

---

## Part 2: The Anatomy of a Pipeline

Every data pipeline, regardless of how simple or complex, has the same five components. Understanding them individually makes it much easier to design, debug, and maintain pipelines.

### Sources

Sources are the origin systems that a pipeline reads from. They can be:

- **Relational databases**: PostgreSQL, MySQL, SQL Server — the pipeline reads new or changed rows using SQL queries
- **REST APIs**: external services (Stripe, Salesforce, GitHub) that expose data via HTTP endpoints
- **Files**: CSV files dropped to an SFTP server by a data vendor, JSON logs written by an application, Parquet files produced by another pipeline
- **Message queues**: Kafka topics, AWS SQS queues — the pipeline consumes events as they arrive
- **Webhooks**: events pushed to your endpoint by an external system in real time

A single pipeline typically has one source. Complex workflows may involve joining data from multiple sources, but that join is usually handled in the transformation step, not by having a single connector read from two different systems simultaneously.

### Extractors

The extractor is the code or tool that reads from the source. For a database source, the extractor runs a SQL query. For an API source, the extractor makes HTTP requests, handles authentication, and manages pagination. For a file source, the extractor reads and parses the file format.

The extractor's job is narrow: get the data out of the source and into memory (or a temporary buffer) without losing any records and without putting undue load on the source system.

Good extractors handle the hard edge cases: the source is temporarily unavailable, the API rate limit is reached, a record has unexpected null values, the schema has changed.

### Transformers

The transformer applies business logic to the raw extracted data. This is where the interesting work happens.

Transformations include:
- **Type coercion**: converting a string like `"2024-01-15"` to an actual date type
- **Deduplication**: removing duplicate records that were ingested twice due to an overlap in extraction windows
- **Joining**: enriching a table of orders with customer information from a separate table
- **Aggregation**: calculating daily revenue from individual transaction records
- **Cleaning**: standardizing inconsistent values (`"USA"`, `"US"`, `"United States"` → `"US"`)
- **Validation**: asserting that required fields are non-null, that values fall within expected ranges

Transformations can be written in Python (using pandas), in SQL (inside the data warehouse), or using a dedicated tool like dbt.

### Loaders

The loader writes the transformed data to the destination. This sounds simple but has important design considerations: how does the loader handle duplicate runs? What does it do if the destination table already has data for this time period? Should it replace, append, or merge?

These questions are answered by the loading strategy, which must be designed upfront based on the pipeline's requirements.

### Destinations

The destination is where the processed data ends up. Common destinations include:

- **Data warehouses** (Snowflake, BigQuery, Redshift): the standard destination for analytical data
- **Operational databases** (PostgreSQL, MySQL): when the pipeline produces data that an application needs to serve to users
- **Object storage** (S3, GCS): when the output is files rather than queryable tables
- **Downstream pipelines**: the output of one pipeline is the input of another

---

## Part 3: ETL vs ELT

ETL and ELT describe the order in which the Transform step happens relative to the Load step. This is one of the most important architectural decisions in data engineering.

### ETL: Extract, Transform, Load

In the traditional ETL pattern, data is extracted from the source, transformed in a separate processing environment, and then loaded into the destination already clean and structured.

```
Source → [Extract] → Raw data in memory/staging → [Transform] → [Load] → Destination
```

ETL was dominant when:
- Storage was expensive — you could not afford to store raw data in your warehouse
- Warehouses had limited compute — transformations inside the warehouse were slow and costly
- The destination was a strictly typed relational database that could not handle raw, messy data

The transformation logic ran on a dedicated ETL server or ETL tool (Informatica, SSIS, Talend). The warehouse received pre-processed, clean data.

**ETL is still appropriate when:**
- The destination system is a relational database that cannot tolerate schema-on-write flexibility
- Data must be cleaned before storage for compliance reasons (removing PII before it lands in the warehouse)
- The volume of data is small enough that in-memory Python transformation is not a bottleneck

### ELT: Extract, Load, Transform

In the modern ELT pattern, data is extracted from the source and loaded into the destination in its raw form first. Transformations happen inside the destination warehouse.

```
Source → [Extract] → [Load] → Raw data in warehouse → [Transform in warehouse] → Clean tables
```

ELT became possible and preferred because:
- Cloud data warehouses (Snowflake, BigQuery) are cheap to store data in and have enormous compute capacity
- SQL-based transformation inside the warehouse is fast and scalable
- Keeping raw data in the warehouse means you can re-transform it later if requirements change — with ETL, raw data is often discarded after transformation

**ELT is appropriate when:**
- You are using a modern cloud data warehouse
- You want to keep the raw data layer for auditability and re-processing
- Transformation logic is primarily SQL (which runs efficiently inside the warehouse)

Most modern data teams use ELT. The raw data lands in the warehouse in a `raw` or `bronze` schema, and dbt transformations produce the clean tables in a `marts` or `gold` schema.

---

## Part 4: Pipeline Reliability

A pipeline that runs once and produces correct output is not yet a production pipeline. A production pipeline runs thousands of times over its lifetime, in the presence of network errors, schema changes, infrastructure failures, and unexpected data. Designing for reliability requires understanding three concepts: idempotency, incremental loading, and failure recovery.

### Idempotency

A pipeline run is idempotent if running it multiple times produces the same result as running it once.

Idempotency is the single most important property of a reliable pipeline. Pipelines fail and need to be re-run. Infrastructure glitches cause duplicate executions. Operators manually trigger reruns to backfill missing data. If your pipeline is not idempotent, these re-runs produce duplicate data, incorrect aggregates, or corrupted state.

**A non-idempotent pattern (dangerous):**
```
INSERT INTO orders SELECT * FROM raw_orders WHERE created_at > last_run_timestamp
```
If this runs twice (due to a retry), it inserts duplicate rows.

**An idempotent pattern (safe):**
```
DELETE FROM orders WHERE date_partition = '2024-01-15';
INSERT INTO orders SELECT * FROM raw_orders WHERE DATE(created_at) = '2024-01-15';
```
Running this twice always produces the same result — the second run deletes and re-inserts the same rows.

<Warning>Non-idempotent pipelines are the number one source of duplicate data bugs. Always design for "safe to re-run." If re-running a pipeline a second time would produce different data than running it once, the pipeline is not production-ready.</Warning>

### Incremental Loading vs Full Refresh

**Full refresh** loads the entire source data set every run. The destination table is truncated and rebuilt from scratch. Full refresh is simple, idempotent by nature, and works well for small tables (under a few million rows). The cost is proportional to the total size of the source — not the amount of new data.

**Incremental loading** loads only new or changed records since the last run. The pipeline tracks a watermark (typically a timestamp column like `updated_at` or an auto-incrementing ID) and only extracts records that have changed since that watermark.

Incremental loading is necessary for large tables where a full refresh would be prohibitively slow or expensive. A table with 500 million rows cannot be reloaded from scratch every hour. But incremental loading introduces complexity: how do you handle deleted records? What if `updated_at` is not reliably set? What if the watermark tracking breaks?

The right choice depends on table size, the cost of re-extracting full data, and whether the source supports efficient incremental extraction.

### Failure Modes and Recovery

Pipelines fail in predictable ways. Understanding common failure modes helps you build pipelines that fail gracefully and recover cleanly.

**Source unavailability**: the database is under maintenance, the API is down, the file has not arrived yet. The pipeline should detect this early, log clearly, and retry with backoff rather than marking the run as successful with empty data.

**Schema changes**: an upstream application team added a column, removed a column, or changed a data type. Rigid pipelines fail hard on schema changes. Resilient pipelines detect unexpected schema changes, alert the data engineering team, and continue processing the fields they understand.

**Data volume anomalies**: a pipeline that normally processes 100,000 rows suddenly processes 0 rows or 10,000,000 rows. Both are potential indicators of an upstream problem. Monitoring expected row counts is an effective early warning system.

**Partial failures**: a pipeline extracts data from five API endpoints and successfully processes four of them before failing on the fifth. Should it commit the successful four? Or roll back everything? The answer depends on whether the five are independent or whether downstream consumers require all five to be consistent.

---

## Key Takeaways

- A data pipeline has five components: Source, Extractor, Transformer, Loader, Destination
- ETL transforms data before loading (appropriate for relational databases, compliance requirements); ELT loads raw data first and transforms inside the warehouse (appropriate for modern cloud warehouses)
- Idempotency is the most important reliability property: running a pipeline twice must produce the same result as running it once
- Incremental loading processes only new/changed records using a watermark; full refresh reloads everything — choose based on table size and refresh cost
- Design pipelines to fail loudly and recover cleanly, not to fail silently with empty or duplicate data

---

## Common Mistakes to Avoid

**Ignoring idempotency until it causes an incident.** The first time a duplicate-data incident hits a production dashboard, the pressure to fix it quickly is immense and the scope of damage (wrong business decisions, incorrect reports) can be significant. Design for idempotency from the start, not as an afterthought.

**Skipping incremental design for "small" tables.** Tables that are small today become large over time. A table with 100,000 rows this month may have 50 million rows in two years. Building incremental loading into the design from day one is almost always worth the extra complexity.

**Over-relying on schedules for correctness.** A pipeline scheduled to run at midnight does not know whether the source data is ready at midnight. If the source is delayed, the pipeline succeeds with incomplete data. Build data arrival checks into your pipeline before processing begins.

---

## Next Lesson Preview

In **Lesson 5: Batch Processing vs Streaming**, you will explore the two fundamental processing paradigms in data engineering: batch (process data in chunks on a schedule) and streaming (process events as they arrive). You will learn when each is appropriate, the tools used for each, and why batch processing is the right starting point for most data engineering work.

---

[Back to Course Overview](./README.md) | [Next Lesson: Batch Processing vs Streaming →](./lesson-05-batch-vs-streaming.md)
