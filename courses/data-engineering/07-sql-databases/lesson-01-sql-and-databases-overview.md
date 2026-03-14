# Lesson 1: SQL and Databases — Why Data Engineers Use Them

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand when to use a database vs a CSV file
- Identify the role of SQL in data engineering pipelines
- Recognize SQLite as an embedded database for pipelines and prototyping
- Map database concepts to pandas concepts (table → DataFrame, row → row, column → column)

---

## Prerequisites

- Section 2: Pandas Fundamentals
- Section 6: ETL Pipelines (recommended)

---

## Lesson Outline

### Part 1: Databases vs Files (30 minutes)

#### When Files Are Enough

For many data engineering tasks, flat files (CSV, Parquet, JSON) work perfectly well:

- **Small to medium data**: files that fit in memory (< 10GB) process efficiently with pandas
- **Batch reads**: you read the entire dataset once, transform it, write it out
- **Simple pipelines**: one writer, no concurrent access, no complex relationships

```python
import pandas as pd

# This works fine for files that fit in memory
df = pd.read_csv("sales_2024.csv")
filtered = df[df["region"] == "North"]
print(f"North region rows: {len(filtered)}")
```

#### When You Need a Database

Files break down in four scenarios:

**1. Concurrent writes**: if multiple processes write to the same CSV simultaneously, data gets corrupted. Databases handle concurrent writes with locking and transactions.

**2. Complex queries on large data**: reading a 1M row CSV to filter 10 rows loads all 1M rows into memory first. A database executes the filter server-side and only returns the 10 matching rows.

```python
# Without a database: load everything, then filter
# This reads ALL 1M rows into memory just to get 10
df = pd.read_csv("transactions.csv")  # 1M rows, 500MB
result = df[df["transaction_id"] == 12345]  # 10 rows

# With a database: filter happens in the DB, only 10 rows sent over the wire
# result = pd.read_sql("SELECT * FROM transactions WHERE transaction_id = 12345", conn)
```

**3. Referential integrity**: databases enforce relationships — you cannot add an order for a customer that does not exist. Files have no enforcement mechanism.

**4. Data that does not fit in memory**: a 500GB dataset can live in a database and be queried efficiently; it cannot be loaded into a pandas DataFrame.

#### Types of Databases

Data engineers work with all three categories:

| Category | Examples | Use Case |
|---|---|---|
| **Relational (RDBMS)** | SQLite, PostgreSQL, MySQL | Transactional data, normalized schemas, ACID guarantees |
| **Column-store (OLAP)** | BigQuery, Snowflake, Redshift | Analytical queries on billions of rows, aggregations |
| **NoSQL** | MongoDB, Redis, Cassandra | Flexible schemas, key-value lookups, document storage |

This section focuses on **relational databases** using SQLite — the most portable option, with no server required.

---

### Part 2: SQL for Data Engineers (30 minutes)

#### What SQL Is

SQL (Structured Query Language) is the standard language for working with relational databases. It runs inside the database engine — not in Python — which is what makes it powerful for large datasets.

Core SQL statement types:

| Statement | Type | Data Engineering Use |
|---|---|---|
| `SELECT` | DQL (Query) | Extract data from tables |
| `INSERT` | DML (Manipulation) | Load records into tables |
| `UPDATE` | DML | Change existing records |
| `DELETE` | DML | Remove records |
| `CREATE TABLE` | DDL (Definition) | Create the schema |
| `DROP TABLE` | DDL | Remove a table |

In practice, most pipeline work uses `SELECT` (extraction), `INSERT`/`UPDATE` (loading), and `CREATE TABLE` (schema management).

#### Entity Relationships

Relational databases store data in **normalized tables** connected by foreign keys. This eliminates duplication:

```
customers table         orders table              products table
-----------             -----------               -----------
customer_id (PK)  ←──  customer_id (FK)          product_id (PK)
name                    order_id (PK)         ←── product_id (FK)  in orders
email                   product_id (FK) ─────/    name
city                    quantity                   category
                        order_date                 unit_price
                        amount
```

A customer's name is stored once in `customers`. Orders reference that customer by `customer_id`. This is a **one-to-many** relationship: one customer can have many orders.

---

### Part 3: Pandas ↔ SQL Mental Model (30 minutes)

#### Side-by-Side Comparison

The same operations exist in both SQL and pandas. Understanding the mapping makes you fluent in both:

| Operation | SQL | pandas |
|---|---|---|
| Select columns | `SELECT name, salary FROM employees` | `df[["name", "salary"]]` |
| Filter rows | `SELECT * FROM sales WHERE region = 'North'` | `df[df["region"] == "North"]` |
| Sort | `ORDER BY salary DESC` | `df.sort_values("salary", ascending=False)` |
| Aggregate | `SELECT region, SUM(revenue) FROM sales GROUP BY region` | `df.groupby("region")["revenue"].sum()` |
| Join | `SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id` | `pd.merge(orders, customers, on="customer_id")` |
| Count rows | `SELECT COUNT(*) FROM orders` | `len(df)` |

```python
import pandas as pd

# Create sample data to demonstrate the mapping
sales = pd.DataFrame({
    "region": ["North", "South", "North", "East", "South"],
    "product": ["A", "B", "A", "C", "A"],
    "revenue": [1200, 800, 1500, 600, 900],
})

# pandas groupby — same as: SELECT region, SUM(revenue) FROM sales GROUP BY region
result_pandas = sales.groupby("region")["revenue"].sum().reset_index()
result_pandas.columns = ["region", "total_revenue"]
print("pandas result:")
print(result_pandas)
```

#### When to Use SQL vs pandas

**Use SQL when:**
- Data lives in a database and is too large to load entirely into memory
- You need server-side aggregation (let the database do the heavy lifting)
- Multiple concurrent pipelines read/write the same dataset

**Use pandas when:**
- Data is already in memory or in files
- You need complex Python logic (custom functions, ML features, string processing)
- You need reshaping operations like pivot, melt, or stack

**In practice, use both**: SQL extracts and aggregates, pandas transforms and enriches.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: SQL to pandas Translation

Translate these SQL statements to pandas code (using the `sales` DataFrame above):

```python
import pandas as pd

sales = pd.DataFrame({
    "region": ["North", "South", "North", "East", "South", "East"],
    "product": ["A", "B", "A", "C", "A", "B"],
    "revenue": [1200, 800, 1500, 600, 900, 1100],
    "quantity": [10, 5, 12, 4, 7, 9],
})

# SQL: SELECT * FROM sales WHERE revenue > 1000
# Your pandas code here:

# SQL: SELECT region, COUNT(*) as row_count FROM sales GROUP BY region
# Your pandas code here:

# SQL: SELECT * FROM sales ORDER BY revenue DESC LIMIT 3
# Your pandas code here:
```

#### Exercise 2: pandas to SQL Translation

Translate these pandas operations to SQL:

```python
# Given this pandas code, write the equivalent SQL:

# 1. df[df["product"] == "A"]["revenue"].mean()
# SQL equivalent: SELECT ??? FROM sales WHERE ???

# 2. df.groupby("region")["quantity"].sum().sort_values(ascending=False)
# SQL equivalent: SELECT ??? FROM sales GROUP BY ??? ORDER BY ???

# 3. df[df["revenue"] > df["revenue"].mean()]
# SQL equivalent: SELECT ??? FROM sales WHERE revenue > (SELECT ???)
```

---

## Key Takeaways

- Use a **database** when data is too large for memory, has concurrent writers, or requires referential integrity; use **files** for batch workloads that fit in memory
- **SQL** is the query language for relational databases — it runs server-side, filtering and aggregating before results reach Python
- **SQLite** is an embedded relational database (no server) — perfect for learning, testing, and lightweight pipelines
- pandas and SQL concepts map directly: table = DataFrame, row = row, column = column; `GROUP BY` = `groupby()`, `JOIN` = `pd.merge()`
- In real pipelines, **use both**: SQL extracts and aggregates at the database level, pandas handles Python-side transformation

---

## Common Mistakes to Avoid

- **Loading entire tables into pandas when you only need a subset**: always filter in SQL first with `WHERE`, then use pandas for downstream logic
- **Treating SQL and pandas as alternatives**: they are complementary — SQL at the database layer, pandas in Python
- **Forgetting that SQL runs in the database**: `pd.read_sql("SELECT ...")` sends the query to the DB engine; the DB does the work

---

[← Section 6](../06-etl-pipelines/lesson-10-etl-project.md) | [Back to Course](./README.md) | [Next →](./lesson-02-sqlite-basics.md)
