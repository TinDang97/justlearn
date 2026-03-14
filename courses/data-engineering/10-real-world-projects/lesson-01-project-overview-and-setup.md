# Lesson 1: Project Overview and Setup

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Read a project lesson and identify the deliverable, architecture, and starter code
- Set up a consistent project directory structure for all 7 capstone projects
- Locate each bundled dataset and understand the data it contains
- Map each project to the sections of the course it exercises

---

## Prerequisites

- Sections 1–9 of the Data Engineering course (complete all sections before starting projects)
- Familiarity with pandas, pandera, ETL patterns, data quality checks, and performance optimization

---

## Lesson Outline

### Part 1: How to Read a Project Lesson

Each project lesson in this section follows a consistent structure. Before writing a single line of code, read the lesson in order — skipping ahead to the starter code without understanding the architecture is the most common way students get stuck.

#### The Project Lesson Anatomy

Every project lesson has seven sections:

| Section | Purpose |
|---------|---------|
| **Project Overview** | 2–3 sentences describing the real-world problem |
| **Skills Integrated** | Table mapping skills to source sections |
| **Architecture** | Data flow diagram: input → steps → output |
| **Dataset** | Description of the data available |
| **Starter Code** | Complete scaffold with `TODO` comments |
| **Step-by-Step Walkthrough** | Explanation and code for each step |
| **Expected Output** | Exact text output the project should print |
| **Practice Exercises** | Core transformation as an interactive block |
| **Extension Challenges** | Three optional challenges — no solutions provided |

#### The Key Question: What Is the Deliverable?

Before starting any project, write down the answer to this question:

> "What exactly does this project produce when it runs correctly?"

A good deliverable is specific and verifiable:
- **Not good:** "a data pipeline"
- **Good:** "a printed cleaning summary showing rows in → rows out, duplicates removed, nulls filled, and 0 validation errors"

The Expected Output section gives you this answer. Start there — read it before the starter code. Your goal during implementation is to produce output that matches it exactly.

#### Working Backwards from Output

Experienced data engineers design pipelines starting from the output contract. Given the expected output, ask:

1. What data structure produces this output?
2. What transformations produce that data structure?
3. What input do those transformations need?

This backwards design approach is why the Architecture section appears before the Starter Code.

---

### Part 2: Project Directory Structure

For in-browser practice exercises, you do not need a file system. However, developing good habits now will serve you well in production environments. When working on a real project, use this structure:

```
sales_data_cleaner/        ← project root
├── pipeline.py            ← main logic (functions + main())
├── validate.py            ← pandera schemas and contract enforcement
├── test_pipeline.py       ← pytest tests for core functions
└── README.md              ← your notes: what the project does, how to run it
```

#### Why This Structure

**`pipeline.py`** contains the orchestration logic. Each major step is a function. The `main()` function calls them in sequence. This makes testing easy — you test individual functions, not the whole pipeline.

**`validate.py`** separates data contracts from processing logic. When a schema changes, you update one file. This is the separation of concerns pattern from Section 8.

**`test_pipeline.py`** uses pytest fixtures to supply sample DataFrames instead of reading from disk. Tests should not depend on the presence of specific files.

**`README.md`** is your documentation for future-you. Write it before you start: what problem does this solve, what is the input, what is the output, how do you run it?

<Info>
For the in-browser practice blocks in this section, all code runs in a single cell. Translate the multi-file structure into a single file by putting functions in logical order: helpers first, then the main pipeline steps, then `main()` at the bottom.
</Info>

---

### Part 3: Bundled Datasets

All 7 projects use datasets from the `data/` directory. In the browser, these are loaded using `io.StringIO` with hardcoded CSV strings to simulate file I/O. In a local environment, they are actual CSV files at the paths shown.

#### Dataset Inventory

| Dataset | Path | Rows | Columns | Used In |
|---------|------|------|---------|---------|
| Transactions | `data/transactions.csv` | 1,000 | 6 | Projects 1, 3, 4, 7 |
| Employees | `data/employees.csv` | 200 | 6 | Projects 6, 7 |
| Logs | `data/logs.csv` | 5,000 | 4 | Project 2 |

#### Transactions Dataset

```
order_id, customer_id, amount, status, order_date, region
1001, C001, 149.99, completed, 2024-01-15, North
1002, C002, 84.50, pending, 2024-01-16, South
...
```

Key characteristics:
- `order_id`: integer, should be unique (contains ~18 duplicates)
- `customer_id`: string format `C###`
- `amount`: float, mostly positive (contains ~5 negative/null values)
- `status`: categorical — `completed`, `pending`, `cancelled`, `refunded`
- `order_date`: mixed date formats (some rows use `MM/DD/YYYY` instead of `YYYY-MM-DD`)
- `region`: string — `North`, `South`, `East`, `West` (contains ~12 nulls)

#### Employees Dataset

```
employee_id, name, department, salary, hire_date, active
EMP-001, Alice Johnson, Engineering, 95000, 2021-03-15, True
EMP-002, Bob Chen, Marketing, 72000, 2022-07-01, True
...
```

Key characteristics:
- `employee_id`: string format `EMP-###` — must be parsed to match integer keys
- `department`: categorical — `Engineering`, `Marketing`, `Sales`, `Finance`, `Operations`
- `salary`: integer, range 45,000–150,000
- `hire_date`: ISO format dates
- `active`: boolean

#### Logs Dataset

```
timestamp, level, service, message
2024-01-15 08:00:01, INFO, auth-service, User login successful
2024-01-15 08:00:03, ERROR, payment-service, Connection timeout
...
```

Key characteristics:
- `timestamp`: datetime strings (ISO format)
- `level`: `INFO`, `WARNING`, `ERROR`, `DEBUG` (some rows have lowercase variants)
- `service`: categorical — 5 microservices (`auth-service`, `payment-service`, `inventory-service`, `notification-service`, `api-gateway`)
- `message`: free text — ERROR messages often repeat (connection timeouts, validation failures)

---

### Part 4: Skills Matrix — Projects Overview

Each project is designed to exercise multiple sections simultaneously. This matrix shows what you are practicing in each project:

| Project | Title | S3 | S4 | S5 | S6 | S7 | S8 | S9 | Duration |
|---------|-------|----|----|----|----|----|----|-----|---------|
| 1 | Sales Data Cleaner | ✓ | ✓ | | | | ✓ | | 3–4 h |
| 2 | Log File Analyzer | ✓ | ✓ | ✓ | | | | ✓ | 3–4 h |
| 3 | ETL Pipeline with Validation | | | | ✓ | ✓ | ✓ | | 3–4 h |
| 4 | Customer Segmentation | | ✓ | ✓ | | | ✓ | ✓ | 3–4 h |
| 5 | Performance Benchmark Suite | ✓ | | ✓ | | | | ✓ | 3–4 h |
| 6 | Data Quality Monitor | | | | ✓ | | ✓ | ✓ | 3–4 h |
| 7 | Multi-Source Pipeline | | ✓ | ✓ | ✓ | | ✓ | | 3–4 h |

**Section key:** S3=File I/O, S4=Data Cleaning, S5=Transformation, S6=ETL, S7=SQL, S8=Data Quality, S9=Performance

#### Recommended Order

Complete the projects in lesson order (1 → 7). Each project's complexity builds on the previous:

- **Projects 1–2**: Core pandas skills — cleaning and aggregation
- **Projects 3–4**: Pipeline structure and business logic — ETL and segmentation
- **Projects 5–6**: Advanced concerns — performance and quality monitoring
- **Project 7**: Integration — everything together in a multi-source merge

<Warning>
Do not skip to Project 7 first. The multi-source pipeline assumes you can implement data cleaning (Project 1), error rate computation (Project 2), and validation contracts (Project 3) without referring back to solutions.
</Warning>

---

## Key Takeaways

- Read the Expected Output before the Starter Code — your implementation goal is to produce that exact output
- A deliverable must be specific and runnable: "print a cleaning summary showing rows in → rows out" not "a pipeline"
- Each project is self-contained — no shared state between projects, no imports between lesson files
- The 3-file project structure (`pipeline.py`, `validate.py`, `test_pipeline.py`) separates concerns and makes testing tractable
- Three datasets are available across all projects: transactions (1,000 rows), employees (200 rows), logs (5,000 rows)
- Projects are ordered by complexity — complete them in order

---

## Common Mistakes to Avoid

- **Skipping the starter code and writing from scratch**: the starter code sets the architecture — the function names, parameter signatures, and return types are deliberate. Writing your own structure makes it impossible to verify against the expected output.
- **Not verifying against expected output**: your pipeline may produce output that looks right but differs from the expected result (different row counts, different column names, different formatting). Always compare character-by-character with the expected output.
- **Doing projects out of order**: Project 4 (customer segmentation) requires confident use of `groupby` and `np.select` — skills drilled in Projects 1–3. Project 6 (quality monitor) reuses patterns from Project 3 (ETL structure). Later projects build on earlier ones.
- **Treating TODOs as optional**: every `TODO` comment in the starter code represents a required piece of functionality. If you skip a TODO, the expected output will not match.

---

## Next Lesson Preview

**Lesson 2: Project 1 — Sales Data Cleaner**

You will build an end-to-end cleaning pipeline: load the transactions dataset, profile it for quality issues, clean it (drop duplicates, fill nulls, parse dates, remove invalid amounts), validate the result against a pandera schema, and print a cleaning summary report.

---

[← Section 9: Performance & Optimization](../09-performance-optimization/README.md) | [Next Lesson: Project 1 — Sales Data Cleaner →](./lesson-02-project-1-sales-data-cleaner.md)
