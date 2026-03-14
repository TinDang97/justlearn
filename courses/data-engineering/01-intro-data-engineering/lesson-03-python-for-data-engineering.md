# Lesson 3: Python for Data Engineering

**Course:** Data Engineering | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain why Python is the dominant language in data engineering
- Name the core Python libraries used in data engineering and describe what each does
- Identify when Python is sufficient and when JVM languages (Scala/Java) are needed
- Map your existing Python knowledge to the data engineering skills you will build in this course

---

## Prerequisites

- Lesson 1: What is Data Engineering?
- Lesson 2: The Modern Data Stack
- Python fundamentals: variables, functions, loops, file I/O, basic OOP

---

## Part 1: Why Python Dominates Data Engineering

Python was not inevitable in data engineering. When the field was emerging in the early 2010s, Java and Scala were dominant — Hadoop was Java, Spark was Scala. Python was considered a scripting language, acceptable for small tasks but not for serious data infrastructure.

That view changed decisively over the following decade, for reasons that compound on each other.

**Readability and maintainability.** Data pipeline code is read many more times than it is written. When a pipeline fails at 3 AM six months after it was written, the on-call engineer needs to understand what it does quickly. Python's syntax is closer to readable English than any other mainstream language. This is not a minor convenience — it is a significant operational advantage.

**Ecosystem breadth.** Python has mature, well-maintained libraries for every data engineering task: pandas for in-memory data manipulation, SQLAlchemy for database connections, requests for HTTP APIs, boto3 for AWS services, pyarrow for reading and writing columnar file formats. No other language has a comparable set of data-focused libraries that work this well together.

**Community and knowledge density.** The data engineering community has converged on Python. Stack Overflow answers, tutorials, blog posts, conference talks, job postings — they are overwhelming in Python. When you encounter an unfamiliar problem, there is a high probability that someone has solved it in Python and documented the solution.

**Framework adoption.** The most widely used orchestration framework (Apache Airflow) requires you to write pipelines as Python code. The most widely used transformation tool (dbt) has a Python interface. Great Expectations, the leading data quality framework, is Python. The tools data engineers actually use are built for Python.

**Hiring and career.** Employers hiring data engineers list Python as the primary language requirement. Teams that choose Scala or Java for their pipelines must recruit from a smaller talent pool. Python is the path of least resistance from both a learning and a hiring perspective.

<Tip>You already know Python syntax from the Python Fundamentals course. This course teaches you to apply it to data problems — you will not need to learn a new language. Your existing knowledge of functions, loops, file I/O, and error handling is directly applicable to everything in this course.</Tip>

---

## Part 2: The Core Data Engineering Libraries

Every library listed here will appear in this course. This section gives you a preview of what each does so you have context before you encounter them in practice.

**pandas** is the foundational library for in-memory data manipulation in Python. It provides the DataFrame — a two-dimensional, column-oriented data structure — and a rich API for loading, filtering, joining, grouping, and transforming tabular data. In data engineering, pandas is used for transformation logic, data validation, schema inspection, and writing data to files and databases. Section 2 is dedicated entirely to pandas fundamentals.

**SQLAlchemy** is the standard Python library for database connections. It provides a unified interface for connecting to any SQL database — PostgreSQL, MySQL, SQLite, Snowflake, BigQuery — and executing queries from Python. In data engineering, SQLAlchemy is used to extract data from operational databases and to load transformed data into warehouses. Section 4 covers SQL and SQLAlchemy together.

**requests** is the standard library for making HTTP API calls in Python. When a data source exposes a REST API, you use requests to authenticate, call endpoints, handle pagination, and parse the returned JSON. In data engineering, nearly every external data source integration involves requests at some level. Section 3 covers API ingestion in depth.

**boto3** is the official AWS SDK for Python. When your data infrastructure runs on AWS — S3 for object storage, Glue for ETL, Lambda for serverless tasks — boto3 is how Python code interacts with those services. Even if your company uses GCP or Azure, understanding boto3 patterns teaches you how cloud SDK interaction works universally.

**pyarrow** provides Python bindings for the Apache Arrow in-memory format and supports reading and writing Parquet files. Parquet is the dominant file format for analytics workloads, and pyarrow is how you read and write it from Python. Understanding pyarrow also gives you insight into how columnar storage works at the file level.

**great_expectations** is the leading Python framework for data quality. It lets you write assertions about your data (every row in column X must be non-null; values in column Y must be between 0 and 1; this table must have at least 10,000 rows) and generates validation reports. Section 8 covers data quality and testing using this framework.

**Apache Airflow** uses Python to define pipeline workflows as DAGs (Directed Acyclic Graphs). Each node in a DAG is a task; the edges define dependencies between tasks. Airflow's scheduler runs the DAG on a schedule, monitors task status, and retries failed tasks automatically. While this course does not run an Airflow cluster, understanding Airflow's concepts is essential because nearly every data team uses it. Section 9 introduces orchestration patterns.

---

## Part 3: Python vs Scala and Java

The honest answer is: Python is sufficient for 90% of data engineering work. But understanding when it is not sufficient is important.

**When Python is enough (the vast majority of cases):**

Most data pipelines process data that fits within the memory of a single machine, or data volumes that can be processed incrementally in batches. A pipeline that extracts 5 million rows from a database, applies transformations, and loads them into a warehouse is well within what pandas and Python can handle efficiently on a modern machine.

Python is also sufficient when your transformations happen inside a data warehouse (via SQL or dbt). In that case, Python orchestrates the work, but the warehouse's compute engine does the heavy lifting. Python script → SQL query → warehouse → result. The Python process itself does almost nothing.

**When JVM languages start to matter:**

Apache Spark is a distributed computing framework designed for processing data sets that are too large for a single machine — typically at terabyte or petabyte scale. While PySpark (Spark's Python API) lets you write Spark jobs in Python, the execution happens on the JVM. Teams running very large Spark workloads sometimes prefer Scala because it compiles to the same JVM bytecode that Spark itself runs on, avoiding the Python-to-JVM serialization overhead and giving access to Spark internals that PySpark does not expose.

Real-time streaming at high throughput is another area where Java/Scala has an edge. Apache Flink and Kafka Streams are Java-native frameworks. The Python APIs exist but have historically lagged behind in functionality and performance.

**The practical reality:**

If you are joining a data team today, the overwhelming probability is that Python is the primary language. Even teams that use Spark for heavy processing use Python (PySpark) to write most of their job logic. Even teams at companies with enormous data volumes write Python for ingestion, quality checks, and orchestration.

Learning Python deeply and applying it to data problems is the highest-leverage investment you can make as an aspiring data engineer.

---

## Part 4: What You Will Build in This Course

This section maps each course section to the Python skills and libraries it develops. Having this mental map before you start lets you understand why each section exists and how the pieces connect.

**Section 2: Pandas Fundamentals** — Core pandas: loading data from files and databases, inspecting DataFrames, filtering rows, selecting columns, handling missing values, applying functions. Primary library: pandas.

**Section 3: Data Ingestion Patterns** — Extracting data from REST APIs, paginating through large result sets, handling authentication (API keys, OAuth), reading from cloud storage. Primary libraries: requests, boto3, pyarrow.

**Section 4: SQL and Databases with Python** — Connecting to SQL databases, executing queries, using SQLAlchemy ORM, loading query results into DataFrames, writing DataFrames back to databases. Primary library: SQLAlchemy.

**Section 5: Data Transformation Patterns** — Joins, aggregations, reshaping, window functions, handling messy real-world data. Primary library: pandas.

**Section 6: File Formats and Serialization** — Reading and writing CSV, JSON, Parquet, and Avro files; understanding when to use each format; working with compressed files. Primary libraries: pandas, pyarrow.

**Section 7: Building Complete Pipelines** — Assembling extract, transform, and load steps into a complete pipeline; adding logging, error handling, and retry logic; structuring pipeline code for maintainability. All libraries combined.

**Section 8: Data Quality and Testing** — Writing data quality assertions, using great_expectations, writing unit tests for transformation logic, debugging data quality failures. Primary library: great_expectations.

**Section 9: Orchestration Concepts** — DAG patterns, task dependencies, scheduling, idempotency in production pipelines, monitoring. Conceptual (Airflow patterns without a live cluster).

**Section 10: Capstone Project** — Build a complete, production-quality pipeline end-to-end: ingest data from an API, store it in a local warehouse, transform it with pandas, validate quality, and serve a summary report.

---

## Key Takeaways

- Python dominates data engineering because of readability, library ecosystem breadth, community, framework adoption, and hiring patterns
- Core DE libraries: pandas (data manipulation), SQLAlchemy (database connections), requests (API ingestion), boto3 (AWS services), pyarrow (Parquet/columnar formats), great_expectations (data quality), Airflow (orchestration)
- Python is sufficient for ~90% of data engineering work; JVM languages (Scala/Java) matter mainly for high-scale Spark jobs and low-latency streaming
- Your existing Python knowledge maps directly to data engineering — functions, loops, error handling, and file I/O are all immediately applicable
- This course covers the full DE skill stack across 10 sections, each focused on a specific layer of the problem

---

## Common Mistakes to Avoid

**Trying to learn every library before starting.** You will learn each library when you need it, in the section dedicated to it. Reading the pandas documentation from start to finish before Section 2 is not productive. Start with the fundamentals and let the problems teach you the details.

**Dismissing Python because "real" data engineers use Spark.** Spark expertise matters at specific companies and specific scales. For your first DE role, Python + pandas + SQL fluency is far more valuable and far more commonly required.

**Skipping the conceptual sections.** This section (Section 1) has no code. Students who skip it and go straight to Section 2 consistently struggle to understand why they are writing the code they are writing. The mental model matters.

---

## Next Lesson Preview

In **Lesson 4: Data Pipeline Concepts**, you will learn what a data pipeline actually is at the structural level — sources, extractors, transformers, loaders, destinations — and the critical design principles (ETL vs ELT, idempotency, incremental loading) that distinguish pipelines that work reliably from pipelines that cause data quality incidents.

---

[Back to Course Overview](./README.md) | [Next Lesson: Data Pipeline Concepts →](./lesson-04-data-pipeline-concepts.md)
