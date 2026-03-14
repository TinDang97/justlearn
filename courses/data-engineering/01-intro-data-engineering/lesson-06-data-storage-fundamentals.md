# Lesson 6: Data Storage Fundamentals

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Describe relational databases (OLTP) and explain their strengths and limitations for analytics
- Explain what a data warehouse is and how it differs from a relational database
- Describe what a data lake is and when raw object storage is the right choice
- Explain the Lakehouse pattern and the problem it solves
- Identify the main file formats (CSV, JSON, Parquet) and understand their tradeoffs

---

## Prerequisites

- Lesson 2: The Modern Data Stack
- Lesson 4: Data Pipeline Concepts

---

## Part 1: Relational Databases (OLTP)

Relational databases are the workhorses of application development. PostgreSQL, MySQL, SQL Server, and Oracle power the vast majority of web applications and business systems. Every time a user creates an account, places an order, or submits a form, that data goes into a relational database.

Relational databases are designed for **OLTP: Online Transaction Processing**. The defining characteristics of OLTP workloads are:

- **Many short transactions**: thousands of INSERT, UPDATE, DELETE, and SELECT operations per second
- **High concurrency**: many users reading and writing simultaneously without interfering with each other
- **ACID guarantees**: Atomicity (all or nothing), Consistency (valid state before and after), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes)
- **Low latency per operation**: a user waiting for a page to load needs their query to complete in under 100 milliseconds

These characteristics are achieved through row-oriented storage: each row of a table is stored together on disk. When the application reads a single user's account record, it reads exactly that row and nothing else. This is extremely efficient for point lookups and small-set updates.

**Where relational databases struggle:**

Row-oriented storage is inefficient for analytical queries. When an analyst runs `SELECT AVG(order_value), COUNT(*) FROM orders WHERE created_at >= '2024-01-01'`, the database must read every row of the orders table — even though only two columns (order_value and created_at) are needed. With millions of rows, this is slow.

Relational databases are also not designed for ad-hoc joins across very large tables. Joining a 100-million-row orders table to a 50-million-row customer table to a 10-million-row product table is the kind of query that brings an OLTP database to its knees — and also disrupts the application that depends on that database for fast, consistent transactions.

**The bottom line:** Do not run analytical queries against your production application database. This is a critical operational principle.

---

## Part 2: Data Warehouses (OLAP)

A data warehouse is a database optimized for **OLAP: Online Analytical Processing**. It is designed for exactly the workloads that break relational databases — large, complex analytical queries that scan millions or billions of rows across multiple tables.

Modern cloud data warehouses — Snowflake, Google BigQuery, Amazon Redshift — achieve this through several architectural innovations.

**Columnar storage** is the most important. Instead of storing all columns of a row together, a columnar database stores all values of a single column together. When an analytical query needs only three columns from a 50-column table, it reads only those three columns' storage blocks — skipping the other 47 entirely. For typical analytical queries (which touch a small fraction of all columns), this reduces I/O by 80–95%.

**Separation of storage and compute** allows cloud warehouses to scale storage and query compute independently. Storing a terabyte of data costs pennies per month. When you need to run a query, compute resources are provisioned on demand and released when the query completes. You pay for storage continuously and for compute only when you use it.

**Denormalized schemas** are the standard design pattern for warehouse tables. Unlike OLTP databases that normalize tables to minimize redundancy (and thus minimize update anomalies), warehouses denormalize — they pre-join tables so that analytical queries have fewer joins to perform. The result is wider tables (more columns) that are faster to query.

**Warehouse schemas** follow a few recognized patterns. Star schemas have a central fact table (orders, events, transactions) surrounded by dimension tables (customers, products, dates). Snowflake schemas normalize the dimensions further. Both patterns exist to optimize query performance for analytical workloads.

**When to use a data warehouse:**

- You need to run analytical queries: aggregations, groupings, period-over-period comparisons, funnel analysis
- The data is structured (rows and columns with defined schema)
- Multiple analysts and BI tools need to query the same data concurrently
- Data freshness of hours is acceptable (batch or ELT loading)

**Limitations:**

Data warehouses are not designed for transactional workloads. They are not a replacement for a production database. They also handle unstructured data (images, raw JSON blobs, text documents) poorly — object storage is the right tool for that.

<Tip>Choosing the wrong storage layer is an expensive mistake. The decision framework is straightforward: do I need transactions and low-latency point queries (use a relational database), do I need fast analytical queries on structured data (use a data warehouse), or do I need cheap flexible storage for any format (use a data lake)?</Tip>

---

## Part 3: Data Lakes

A data lake is a large, cheap repository of raw data stored in its native format on object storage — AWS S3, Google Cloud Storage, or Azure Data Lake Storage.

The defining characteristic of a data lake is flexibility: it stores anything. Structured CSV files from a legacy system. Semi-structured JSON logs from an application. Binary Parquet files produced by a pipeline. Images, audio files, PDFs from document management systems. Raw API responses. Machine learning training datasets.

Data lakes use **schema-on-read**: there is no schema enforced at write time. Data lands in the lake in whatever format the source produces. When you want to query it, you apply a schema at query time by telling the query engine how to interpret the raw bytes.

**Why data lakes exist:**

1. **Cost**: Object storage is dramatically cheaper than warehouse storage. Storing 1 TB in S3 costs approximately $23/month. The same volume in Snowflake might cost $200–$400/month depending on configuration.

2. **Flexibility**: You can store any format without knowing in advance how you will query it. This is valuable for data that arrives from sources you do not fully control, or for raw data you want to preserve before transforming.

3. **ML and data science**: Machine learning training pipelines often need raw, unprocessed data. Feature engineering for ML frequently requires going back to raw events rather than pre-aggregated tables. The data lake provides this raw layer.

4. **Audit and reprocessing**: When transformation logic changes, you can re-run the transformation from scratch against the raw data in the lake. If the raw data was discarded after ETL, this is impossible.

**The raw/bronze layer:**

In practice, the data lake serves as the first landing zone in an ELT architecture. Raw ingested data lands in the lake (or in a "raw" schema in the warehouse). Transformation pipelines then read from the raw layer and produce clean tables in the warehouse.

**Limitations:**

Schema-on-read flexibility is also a weakness. Without schema enforcement, data quality problems propagate silently. Querying raw JSON logs is slower and more complex than querying a structured warehouse table. Data lakes without careful organization become "data swamps" — vast repositories of data that nobody can find or trust.

---

## Part 4: The Lakehouse Pattern

The Lakehouse pattern emerged to capture the benefits of both data lakes (cheap, flexible storage) and data warehouses (fast, structured queries with ACID guarantees) in a single architecture.

The fundamental problem the Lakehouse solves: data teams were maintaining two separate systems — a data lake for raw storage and a data warehouse for structured analytics — and constantly moving data between them. This was expensive, complex, and introduced latency.

The Lakehouse approach adds a **transactional metadata layer** on top of object storage to provide warehouse-like features:

- **ACID transactions**: safe concurrent reads and writes to data lake files
- **Schema enforcement and evolution**: enforce schemas at write time, allow controlled schema changes
- **Time travel**: query historical versions of a table (what did this table look like yesterday?)
- **Optimized query performance**: metadata statistics that allow query engines to skip irrelevant files

**Delta Lake** (developed by Databricks), **Apache Iceberg** (developed at Netflix, now widely adopted), and **Apache Hudi** (developed at Uber) are the three major Lakehouse table formats. They all work by adding a transaction log and metadata layer on top of ordinary Parquet files in object storage.

**Databricks** has built a full Lakehouse platform around Delta Lake. **Snowflake** and **BigQuery** have developed their own internal Lakehouse-like capabilities. The Lakehouse pattern is increasingly the default architecture for data teams at companies with significant data volumes.

---

## Part 5: File Formats Matter

In data engineering, the file format you choose for storing and exchanging data has significant performance and cost implications.

**CSV (Comma-Separated Values)** is the most universal format. Every tool, language, and system can read and write CSV. It requires no schema — the column names are in the first row. But it has no data types (everything is text), no compression standard, poor performance for analytical queries (you must read the entire file to get any column's values), and no support for nested structures.

CSV is appropriate for: small files, data exchange with external systems or non-technical users, situations where universality trumps performance.

**JSON (JavaScript Object Notation)** is the native format of APIs and event streams. It is human-readable, supports nested and array structures, and is self-describing (each record includes its field names). But JSON is verbose — the field names are repeated for every record — which means large JSON files are significantly larger than equivalent structured formats. JSON also lacks native support for date types, binary data, and many numeric precision requirements.

JSON is appropriate for: API responses, semi-structured data with variable schema, event logs.

**Parquet** is the standard format for analytical workloads and is the file format you will use most in this course. It stores data in columnar format (like a data warehouse, but in a file), applies highly effective compression per column, embeds schema metadata, and supports predicate pushdown (queries can skip columns and row groups that do not match filter criteria).

The performance difference is significant: a 100-column Parquet file queried for 3 columns requires reading approximately 3% of the data that an equivalent CSV file would require. Parquet files for the same data are typically 80–90% smaller than CSV after compression.

Parquet is appropriate for: analytics workloads, data exchanged between pipeline stages, any situation where query performance or storage efficiency matters.

**Avro** is a row-oriented binary format with schema embedded in the file header. It is commonly used for streaming and event log use cases (Kafka often uses Avro for message serialization). Avro is not discussed extensively in this course but you will encounter it in production environments.

The general rule: use Parquet for analytical data storage, JSON for API integration, and CSV only when interoperability requirements demand it.

---

## Key Takeaways

- Relational databases (OLTP) are optimized for fast transactional writes and point reads; they are not suitable for analytical queries at scale
- Data warehouses (OLAP) use columnar storage and separated compute/storage to power fast analytical queries on structured data; Snowflake, BigQuery, and Redshift are the dominant options
- Data lakes store raw data in any format cheaply on object storage (S3, GCS); they use schema-on-read and are the right choice for raw data archiving, ML training data, and large unstructured datasets
- The Lakehouse pattern (Delta Lake, Apache Iceberg) adds ACID transactions, schema enforcement, and query optimization on top of data lake storage, combining the best of both worlds
- Parquet is the right format for analytical data; JSON is the right format for APIs and event streams; CSV is for interoperability only

---

## Common Mistakes to Avoid

**Running analytical queries on production databases.** This pattern degrades application performance, interferes with transactional integrity, and does not scale. Always move analytical workloads to a warehouse or replica.

**Treating the data lake as a destination rather than a staging area.** Raw JSON files in a data lake are not useful to analysts. The lake is where data lands; the warehouse is where data is used. Build the pipeline to transform raw lake data into clean warehouse tables.

**Ignoring file format choices.** Engineers who default to CSV for all pipeline outputs because it is familiar are leaving significant performance and cost savings on the table. The 20 minutes spent learning to write Parquet with pyarrow pays dividends every time the pipeline runs.

---

## Next Lesson Preview

In **Lesson 7: Introduction to Data Quality**, you will learn what data quality means formally — the six dimensions of quality — and where quality breaks down in real data systems. You will also learn why quality is not a one-time cleanup but an ongoing practice that requires monitoring infrastructure.

---

[Back to Course Overview](./README.md) | [Next Lesson: Introduction to Data Quality →](./lesson-07-data-quality-overview.md)
