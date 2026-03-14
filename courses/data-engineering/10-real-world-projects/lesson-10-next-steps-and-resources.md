# Lesson 10: Next Steps and Resources

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Identify 3 tools to learn next based on your career direction
- Understand where this course fits in the full data engineering learning path
- Describe what a portfolio project looks like for a junior DE role
- Plan your next 3 months of learning with a concrete 30/60/90-day schedule

---

## Prerequisites

- Sections 1–10 of the Data Engineering course (all sections complete)

---

## Lesson Outline

### Part 1: Tools to Learn Next

This course gave you the Python + pandas foundation. The tools below build on that foundation for different career tracks.

#### Analytics Engineering Track

| Tool | What It Does | Prerequisite From This Course | Learn At |
|------|-------------|-------------------------------|----------|
| **dbt** | SQL-based transformation layer with testing, documentation, and dependency management | S7: SQL & Databases (you understand SQL; dbt runs SQL models) | getdbt.com/learn |
| **BigQuery** | Google's serverless data warehouse — SQL on petabytes with columnar storage | S7: pd.read_sql and SQL fundamentals | cloud.google.com/bigquery/docs |
| **Looker / Looker Studio** | BI layer for visualization and dashboards connected to BigQuery/dbt models | No specific prerequisite — builds on analytics outputs you produce | lookerstudio.google.com |

Analytics engineering is the fastest-growing DE sub-discipline. The core loop is: raw data → dbt transform → BigQuery table → Looker dashboard. Your pandas skills transfer directly — dbt models are SQL but the design patterns (staging → intermediate → mart layers) mirror the ETL patterns from S6.

#### Data Infrastructure Track

| Tool | What It Does | Prerequisite From This Course | Learn At |
|------|-------------|-------------------------------|----------|
| **Apache Airflow** | Workflow orchestration — schedule and monitor DAGs (directed acyclic graphs) of pipeline tasks | S6: ETL Pipelines (your `run_pipeline()` becomes a DAG operator) | airflow.apache.org/docs |
| **Prefect** | Modern Python-native orchestration — simpler than Airflow for Python-heavy teams | S6: ETL Pipelines | docs.prefect.io |
| **Dagster** | Asset-based orchestration — pipelines produce "assets" with lineage tracking | S6 + S8: ETL + data quality (Dagster has built-in asset quality checks) | docs.dagster.io |

Your `PipelineResult` dataclass pattern from S6 maps directly to Airflow task return values. Learning Airflow after this course requires mainly: understanding DAG syntax, XCom for passing data between tasks, and connection objects for databases.

#### Streaming Data Track

| Tool | What It Does | Prerequisite From This Course | Learn At |
|------|-------------|-------------------------------|----------|
| **Apache Kafka** | Distributed event streaming — publish/subscribe for real-time data | S3: understanding data formats (Kafka messages are often JSON or Avro) | kafka.apache.org/quickstart |
| **Spark Structured Streaming** | Real-time version of PySpark — process infinite streams as micro-batches | S5: groupby and aggregation (same concepts, different API) | spark.apache.org/docs/latest/structured-streaming-programming-guide.html |

Streaming adds the time dimension to data — instead of processing a batch file, you process an infinite stream. The transformation patterns (filter, aggregate, join) are identical to what you learned in S5; only the execution model changes.

#### Machine Learning Pipelines Track

| Tool | What It Does | Prerequisite From This Course | Learn At |
|------|-------------|-------------------------------|----------|
| **MLflow** | Experiment tracking — log parameters, metrics, and model artifacts per run | S6: pipeline logging patterns (MLflow is structured logging for ML runs) | mlflow.org/docs |
| **Feature Store concepts** | A data store for pre-computed ML features shared across models | S5 + S9: transformation and performance (feature pipelines need both correctness and speed) | docs.hopsworks.ai (Hopsworks is open source) |

#### Which Track Is Right for You?

| If you want to... | Start with |
|-------------------|-----------|
| Build dashboards and reports for business users | dbt → BigQuery → Looker |
| Build and operate data infrastructure | Airflow → cloud platform (AWS or GCP) |
| Work with real-time data products | Kafka → Spark Streaming |
| Work on ML teams as a data specialist | MLflow → cloud ML platform |

---

### Part 2: Learning Path Context

This course is one step in a longer journey. Here is where it fits:

```
Stage 1: Python Foundation
  Python Course (Sections 1–12)
  └─ Functions, classes, file I/O, error handling, testing with pytest
          |
          v
Stage 2: Data Engineering Fundamentals  ← YOU ARE HERE
  This Course (Sections 1–10)
  └─ pandas, ETL, SQL, data quality, performance optimization
          |
          v
Stage 3: Cloud Platforms
  AWS Data Engineering or Google Cloud Professional DE
  └─ S3/GCS for storage, Redshift/BigQuery for warehousing, Lambda/Cloud Functions for compute
          |
          v
Stage 4: Orchestration
  Apache Airflow or Prefect
  └─ Schedule pipelines, manage dependencies, handle failures automatically
          |
          v
Stage 5: Distributed Processing
  Apache Spark (PySpark)
  └─ Process datasets too large for a single machine (100GB+ files)
          |
          v
Stage 6: Specialization
  Streaming (Kafka + Flink) OR Analytics Engineering (dbt + Looker)
  OR ML Pipelines (MLflow + Feature Store)
```

You do not need to complete all stages before being employable. A junior DE role typically requires: Stages 1–3 (Python + pandas + one cloud platform). A mid-level role requires: Stages 1–4 (adding Airflow). Senior roles require Stages 1–5+.

---

### Part 3: Portfolio Project Ideas

A GitHub portfolio with 3 working pipelines is more valuable than any certification. Each project should have: a clear README explaining the problem, a working pipeline with tests, and a sample output file showing what it produces.

#### Project 1: Daily Weather ETL

**What you build:** Fetch daily weather data from the NOAA public API, clean the JSON response into a pandas DataFrame, validate it against a schema, append to a SQLite database, and generate a daily summary report.

**Data source:** NOAA Climate Data API (api.weather.gov) — free, no API key required for many endpoints

**What to show in README:** "Fetches 30 days of weather data for 5 cities, cleans 3 common data quality issues, stores in SQLite, and generates a trend summary. Run time: 8 seconds."

**Skills demonstrated:** S3 (JSON loading), S4 (cleaning), S6 (ETL structure), S7 (SQLite), S8 (validation)

#### Project 2: Stock Price Analyzer

**What you build:** Download historical stock prices from Yahoo Finance (yfinance library), compute moving averages, detect golden/death cross signals, validate data continuity (no missing trading days), and produce a formatted analysis report.

**Data source:** `yfinance` Python library — free, no API key

**What to show in README:** "Analyzes 1 year of price data for 10 stocks. Detects 3 signal types. Validates for data gaps. Output: text report + cleaned CSV."

**Skills demonstrated:** S5 (rolling window aggregation via `.rolling().mean()`), S8 (data continuity validation), S9 (vectorized signal detection)

#### Project 3: E-Commerce Log Pipeline

**What you build:** Download a public e-commerce event log dataset (Kaggle has several), parse event types, compute conversion funnel metrics (view → cart → purchase rates), detect high-traffic sessions, and generate a business summary.

**Data source:** Kaggle eCommerce Events History dataset (free download, ~100MB CSV)

**What to show in README:** "Processes 1M+ events. Computes conversion funnel for 5 event types. Outputs session-level stats and product performance ranking."

**Skills demonstrated:** S3 (large file loading with chunksize), S5 (groupby aggregation), S9 (chunked processing for memory efficiency)

#### Project 4: GitHub Activity Dashboard

**What you build:** Fetch repository statistics from the GitHub API (stars, forks, issues, commit frequency over time), store in SQLite, and produce a weekly trend report comparing 10 open-source projects.

**Data source:** GitHub REST API — free for public repos, 60 requests/hour unauthenticated, 5000 with token

**What to show in README:** "Tracks 10 repos over 52 weeks. Detects growth trends. Stores history locally. Generates weekly comparison report."

**Skills demonstrated:** S6 (ETL with error recovery for rate limits), S7 (SQLite for historical storage), S5 (time-based groupby)

#### Project 5: CSV Data Quality Auditor

**What you build:** A CLI tool that accepts any CSV file, runs the 4-dimension quality check from Project 6 of this course, and outputs a structured quality report. Add a `--threshold` flag for configurable PASS/WARN/FAIL levels.

**Data source:** User-supplied (the tool works on any CSV)

**What to show in README:** "Pass any CSV, get a quality report. Checks completeness, uniqueness, validity, and consistency. Configurable thresholds. Used on 3 public datasets in the examples/ directory."

**Skills demonstrated:** S8 (all quality dimension patterns), S6 (CLI pipeline structure), S3 (reading arbitrary CSVs with dtype inference)

<Info>
For portfolio projects, prioritize working code over perfect code. A pipeline that runs end-to-end and produces real output — even if it has rough edges — is worth more than a half-finished "elegant" system.
</Info>

---

### Part 4: 30/60/90-Day Learning Plan

Use this plan immediately after completing the course. The goal: consolidate what you learned, ship one portfolio project, and start the next learning stage.

#### Month 1 (Days 1–30): Consolidate

**Week 1–2: Recall practice**
- Redo all 7 projects from memory without looking at solutions
- For each project: write the pipeline from a blank file, then compare to your solution
- Document each function you had to look up — those are your weak spots

**Week 3–4: Extend one project**
- Pick the project that produced the output most relevant to a job you want
- Add the Extension Challenges you skipped
- Add a full pytest test suite (3+ tests per function)
- Write a proper README

**Goal by Day 30:** 1 portfolio project fully tested and documented on GitHub.

#### Month 2 (Days 31–60): Build and Ship

**Week 5–6: Choose and plan a new project**
- Pick one of the 5 portfolio project ideas above (or your own)
- Write the README before writing any code (define the deliverable first)
- Design the architecture (ASCII diagram showing input → steps → output)

**Week 7–8: Build and iterate**
- Implement the pipeline with tests
- Handle real data quality issues (they will be different from the course datasets)
- Document every design decision in the README

**Goal by Day 60:** A second portfolio project on GitHub with real data, working pipeline, and pytest suite.

#### Month 3 (Days 61–90): Next Stage

**Week 9–10: Cloud platform basics**
- Create a free tier account on AWS or GCP
- Complete one official quickstart: AWS S3 + Lambda, or GCP Cloud Storage + Cloud Functions
- Migrate one of your portfolio pipelines to run on the cloud (trigger on file upload)

**Week 11–12: Orchestration introduction**
- Install Airflow locally (Docker Desktop + official quickstart)
- Convert your daily weather or stock pipeline into an Airflow DAG
- Schedule it to run daily and verify it runs automatically

**Goal by Day 90:** One pipeline running on a cloud platform, scheduled automatically. You are now in Stage 3–4 of the learning path.

---

## You've Completed the Data Engineering Course

You have worked through 10 sections covering the complete fundamentals of data engineering with Python and pandas: from loading raw files and cleaning messy data, through building ETL pipelines and SQL-backed storage, to enforcing data contracts and optimizing for performance. The 7 capstone projects gave you end-to-end implementations that demonstrate every major pattern.

The skills you now have — pandas, ETL design, data quality, SQL, and performance optimization — are the minimum viable toolkit for a data engineering role. They are also the foundation that every advanced tool (Airflow, Spark, dbt, Kafka) is built on top of.

Ship something. The gap between "I learned data engineering" and "I work in data engineering" is a GitHub repository with 3 working pipelines.

---

## Key Takeaways

- **Skills compound**: pandas + SQL + testing is the minimum viable DE toolkit; everything else (Airflow, Spark, dbt) is built on top of it
- **Public datasets are your practice material**: NOAA, data.gov, Kaggle, SEC EDGAR, GitHub API — all free, all real, all have messy data quality issues
- **A GitHub portfolio with 3 working pipelines is more valuable than certifications**: hiring managers run your code; they don't read certificate PDFs
- **Learn the next tool when you have a project that needs it**: don't learn Airflow in the abstract — migrate a pipeline you care about
- **Teach what you build**: write about your projects (GitHub README, blog post, LinkedIn post) — explaining forces clarity and creates networking opportunities

---

## Common Mistakes to Avoid

- **Learning without building**: reading pandas documentation and watching tutorials creates familiarity but not skill. Skill comes from debugging real data problems. Every hour spent on a real dataset is worth 3 hours of tutorial time.

- **Picking too complex a first portfolio project**: the goal is to ship something. A CSV → cleaned CSV → SQLite pipeline with a quality report is a legitimate portfolio project. It demonstrates profiling, cleaning, validation, and SQL — exactly what a DE hiring manager wants to see. You do not need Spark or Kafka for your first project.

- **Skipping testing**: untested pipelines fail silently in production. A pipeline that produces wrong output without raising an error is harder to debug than one that raises immediately. Three tests per function is the minimum — test the happy path, one edge case (empty DataFrame, single row), and one error case (missing column, null in required field).

- **Optimizing before shipping**: don't reach for chunked processing or vectorization until the pipeline produces correct output. Correct and slow is debuggable. Fast and wrong is a production incident.

---

## You've Completed the Data Engineering Course

Ten sections. Seven projects. One complete curriculum.

You now have the foundation to work with real data, build reliable pipelines, and continue learning on your own. The next step is yours to take — pick a project, write the README, and ship it.

---

[← Lesson 9: Course Review and Patterns](./lesson-09-course-review-and-patterns.md) | [← Back to Section 10 Overview](./README.md)
