# Lesson 6: Reading SQL Query Results into DataFrames

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Use `pd.read_sql()` to load query results directly into a DataFrame
- Use `pd.read_sql_query()` and `pd.read_sql_table()` appropriately
- Pass query parameters safely using `params=` to avoid SQL injection
- Read large result sets in chunks using `chunksize`

---

## Prerequisites

- Lesson 5: SQL JOINs (SELECT with JOIN and GROUP BY)
- Section 2: Pandas Fundamentals (DataFrame operations)

---

## Lesson Outline

### Part 1: pd.read_sql() Basics (30 minutes)

#### Setup: Employee Database

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE employees (
        id         INTEGER PRIMARY KEY,
        name       TEXT,
        department TEXT,
        salary     REAL,
        hire_date  TEXT
    )
""")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?, ?)", [
    (1,  "Alice",   "Engineering", 90000, "2022-01-15"),
    (2,  "Bob",     "Marketing",   65000, "2023-03-01"),
    (3,  "Carol",   "Engineering", 85000, "2021-06-01"),
    (4,  "Dave",    "HR",          55000, "2020-11-15"),
    (5,  "Eve",     "Engineering", 95000, "2019-08-20"),
    (6,  "Frank",   "Marketing",   70000, "2022-07-10"),
    (7,  "Grace",   "Data",        88000, "2021-03-05"),
    (8,  "Hank",    "HR",          52000, "2023-01-20"),
    (9,  "Ivy",     "Data",        92000, "2020-09-30"),
    (10, "Jack",    "Engineering", 78000, "2022-12-01"),
])
conn.commit()
print("Database ready")
```

#### pd.read_sql() — SQL Results Directly into a DataFrame

```python
# The simplest form: run a query, get a DataFrame back
df = pd.read_sql("SELECT * FROM employees", conn)
print(type(df))  # <class 'pandas.core.frame.DataFrame'>
print(df.shape)  # (10, 5)
print(df.head())
```

The column names in the DataFrame come from the SELECT aliases in your query:

```python
# Query with aggregation — column names from aliases
dept_summary = pd.read_sql("""
    SELECT
        department,
        COUNT(*)           AS headcount,
        ROUND(AVG(salary), 0) AS avg_salary,
        MAX(salary)        AS max_salary
    FROM employees
    GROUP BY department
    ORDER BY avg_salary DESC
""", conn)

print(dept_summary)
print("\nColumn dtypes:")
print(dept_summary.dtypes)
```

#### Comparing read_sql to Manual Construction

`pd.read_sql()` is a shortcut for the manual process:

```python
# Manual approach — verbose
cursor = conn.execute("SELECT name, department, salary FROM employees WHERE salary > 80000")
col_names = [col[0] for col in cursor.description]
rows = cursor.fetchall()
df_manual = pd.DataFrame(rows, columns=col_names)

# pd.read_sql approach — clean
df_auto = pd.read_sql("SELECT name, department, salary FROM employees WHERE salary > 80000", conn)

# Both produce the same result
print("Manual DataFrame:")
print(df_manual)
print("\nread_sql DataFrame:")
print(df_auto)
print("\nEqual:", df_manual.equals(df_auto))
```

---

### Part 2: pd.read_sql_query() and Parameters (30 minutes)

#### read_sql vs read_sql_query

`pd.read_sql()` is a convenience wrapper that accepts both SQL queries and table names. For clarity, pandas also provides:

- `pd.read_sql_query(sql, conn)` — explicitly for SQL queries (string or SQLAlchemy text)
- `pd.read_sql_table(table_name, conn)` — reads an entire table (requires SQLAlchemy engine)

```python
# pd.read_sql_query — same result as pd.read_sql for query strings
df = pd.read_sql_query("SELECT * FROM employees WHERE salary > 80000", conn)
print(df)
```

#### Safe Parameterization — NEVER Use f-strings

SQL injection is a critical security vulnerability. The rule is simple: never build SQL strings by string formatting.

```python
department = "Engineering"

# DANGEROUS — SQL injection vulnerability
# An attacker could pass: "Engineering'; DROP TABLE employees; --"
# df = pd.read_sql(f"SELECT * FROM employees WHERE department = '{department}'", conn)

# SAFE — parameterized query with sqlite3
df = pd.read_sql(
    "SELECT * FROM employees WHERE department = ?",
    conn,
    params=[department]   # list of values for ? placeholders
)
print(f"Engineering employees ({len(df)} rows):")
print(df[["name", "salary"]])
```

```python
# Multiple parameters
df = pd.read_sql(
    "SELECT * FROM employees WHERE department = ? AND salary > ?",
    conn,
    params=["Engineering", 85000]
)
print("Senior Engineering:")
print(df[["name", "salary"]])
```

#### Parameterized Queries in a Loop

```python
# Read one DataFrame per department using a parameterized query
departments = ["Engineering", "Marketing", "HR", "Data"]

dept_dfs = {}
for dept in departments:
    dept_dfs[dept] = pd.read_sql(
        "SELECT name, salary FROM employees WHERE department = ? ORDER BY salary DESC",
        conn,
        params=[dept]
    )

# Show summary
for dept, df in dept_dfs.items():
    if len(df) > 0:
        print(f"{dept}: {len(df)} employees, avg ${df['salary'].mean():,.0f}")
```

---

### Part 3: Working with the Resulting DataFrame (30 minutes)

#### parse_dates and index_col

```python
# parse_dates converts TEXT date columns to datetime64
df = pd.read_sql(
    "SELECT * FROM employees ORDER BY hire_date",
    conn,
    parse_dates=["hire_date"]
)

print("hire_date dtype:", df["hire_date"].dtype)  # datetime64[ns]
print(df[["name", "hire_date"]].head())
```

```python
# index_col sets the DataFrame index to a specific column
df = pd.read_sql(
    "SELECT id, name, department, salary FROM employees",
    conn,
    index_col="id"
)
print("Index:", df.index.tolist())
print(df.head())
```

#### Post-Query Transformations

```python
# The DataFrame from read_sql is just a normal DataFrame — apply any pandas operations
df = pd.read_sql(
    "SELECT name, department, salary, hire_date FROM employees",
    conn,
    parse_dates=["hire_date"]
)

# Compute tenure in days
import pandas as pd
today = pd.Timestamp("2024-03-15")
df["tenure_days"] = (today - df["hire_date"]).dt.days
df["tenure_years"] = (df["tenure_days"] / 365.25).round(1)

# Filter to recent hires (< 2 years)
recent = df[df["tenure_years"] < 2][["name", "department", "hire_date", "tenure_years"]]
print("Recent hires (< 2 years):")
print(recent.sort_values("hire_date", ascending=False))
```

#### Reading Large Tables in Chunks

```python
# For large result sets, use chunksize to avoid loading everything into memory at once
chunk_count = 0
total_rows = 0

for chunk in pd.read_sql("SELECT * FROM employees", conn, chunksize=3):
    chunk_count += 1
    total_rows += len(chunk)
    print(f"Chunk {chunk_count}: {len(chunk)} rows — {chunk['name'].tolist()}")

print(f"\nTotal: {total_rows} rows in {chunk_count} chunks")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Three read_sql Queries with pandas Post-Processing

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT)")
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, unit_price REAL)")
conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, order_date TEXT)")

conn.executemany("INSERT INTO customers VALUES (?, ?, ?)", [
    (1, "Alice", "New York"), (2, "Bob", "Chicago"),
    (3, "Carol", "New York"), (4, "Dave", "Seattle"),
])
conn.executemany("INSERT INTO products VALUES (?, ?, ?, ?)", [
    (1, "Widget A", "Hardware", 29.99),
    (2, "Gadget",   "Electronics", 149.99),
    (3, "Tool Kit", "Hardware", 49.99),
])
conn.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", [
    (1, 1, 1, 2, "2024-01-10"), (2, 2, 2, 1, "2024-01-12"),
    (3, 1, 3, 3, "2024-02-01"), (4, 3, 1, 1, "2024-02-10"),
    (5, 2, 1, 5, "2024-02-20"), (6, 1, 2, 1, "2024-03-01"),
    (7, 4, 3, 2, "2024-03-05"), (8, 3, 2, 2, "2024-03-10"),
])
conn.commit()

# Query 1: all orders with product name and customer name (JOIN)
print("=== Orders with customer and product details ===")
df_orders = pd.read_sql("""
    SELECT
        o.id     AS order_id,
        c.name   AS customer,
        p.name   AS product,
        o.quantity,
        ROUND(o.quantity * p.unit_price, 2) AS line_total,
        o.order_date
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN products  p ON o.product_id  = p.id
    ORDER BY o.order_date
""", conn)
print(df_orders.to_string(index=False))

# Query 2: monthly revenue (GROUP BY)
print("\n=== Monthly revenue ===")
df_monthly = pd.read_sql("""
    SELECT
        strftime('%Y-%m', o.order_date) AS month,
        ROUND(SUM(o.quantity * p.unit_price), 2) AS revenue
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY month
    ORDER BY month
""", conn)
print(df_monthly)

# Query 3: top 3 customers by total spend
print("\n=== Top customers by spend ===")
df_top = pd.read_sql("""
    SELECT
        c.name,
        c.city,
        COUNT(o.id) AS order_count,
        ROUND(SUM(o.quantity * p.unit_price), 2) AS total_spent
    FROM customers c
    JOIN orders   o ON c.id = o.customer_id
    JOIN products p ON p.id = o.product_id
    GROUP BY c.id, c.name, c.city
    ORDER BY total_spent DESC
    LIMIT 3
""", conn)
print(df_top)
# Apply pandas: add % of total
df_top["pct_of_total"] = (df_top["total_spent"] / df_top["total_spent"].sum() * 100).round(1)
print("\nWith percentage of total:")
print(df_top)
```

#### Exercise 2: Parameterized Query Function

```python
import sqlite3
import pandas as pd

def get_orders_by_city(conn: sqlite3.Connection, city: str) -> pd.DataFrame:
    """
    Return all orders for customers in the given city.
    Uses parameterized query to prevent SQL injection.
    """
    return pd.read_sql("""
        SELECT
            o.id     AS order_id,
            c.name   AS customer,
            c.city,
            p.name   AS product,
            o.quantity,
            ROUND(o.quantity * p.unit_price, 2) AS line_total
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        JOIN products  p ON o.product_id  = p.id
        WHERE c.city = ?
        ORDER BY o.order_date
    """, conn, params=[city])


# Test the function
for city in ["New York", "Chicago", "Seattle"]:
    df = get_orders_by_city(conn, city)
    print(f"\n{city}: {len(df)} orders, total ${df['line_total'].sum():,.2f}")
    if len(df) > 0:
        print(df[["customer", "product", "quantity", "line_total"]].to_string(index=False))
```

---

<PracticeBlock
  prompt="Create a simple employees database (id, name, department, salary). Write a function `get_dept_summary(conn, min_salary)` that returns a DataFrame with department, headcount, and avg_salary for departments where ALL employees earn at least `min_salary`. Use parameterized queries."
  initialCode={`import sqlite3\nimport pandas as pd\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL)")\nconn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)", [\n    (1, "Alice", "Engineering", 90000),\n    (2, "Bob",   "Marketing",   65000),\n    (3, "Carol", "Engineering", 85000),\n    (4, "Dave",  "HR",          55000),\n    (5, "Eve",   "Engineering", 95000),\n    (6, "Frank", "Marketing",   70000),\n])\nconn.commit()\n\ndef get_dept_summary(conn, min_salary):\n    # Write your pd.read_sql() call here with params=[min_salary]\n    pass\n\nprint(get_dept_summary(conn, 70000))\n`}
  hint="Use HAVING MIN(salary) >= ? to filter departments where all employees meet the threshold. Pass params=[min_salary] to pd.read_sql()."
  solution={`import sqlite3\nimport pandas as pd\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL)")\nconn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)", [\n    (1, "Alice", "Engineering", 90000),\n    (2, "Bob",   "Marketing",   65000),\n    (3, "Carol", "Engineering", 85000),\n    (4, "Dave",  "HR",          55000),\n    (5, "Eve",   "Engineering", 95000),\n    (6, "Frank", "Marketing",   70000),\n])\nconn.commit()\n\ndef get_dept_summary(conn, min_salary):\n    return pd.read_sql("""\n        SELECT\n            department,\n            COUNT(*) AS headcount,\n            ROUND(AVG(salary), 0) AS avg_salary\n        FROM employees\n        GROUP BY department\n        HAVING MIN(salary) >= ?\n        ORDER BY avg_salary DESC\n    """, conn, params=[min_salary])\n\nprint("Departments where all earn >= $70k:")\nprint(get_dept_summary(conn, 70000))\nprint("\\nDepartments where all earn >= $80k:")\nprint(get_dept_summary(conn, 80000))`}
/>

---

## Key Takeaways

- `pd.read_sql(sql, conn)` executes a SQL query and returns a DataFrame — column names come from SELECT aliases
- Use `params=[value]` (list for sqlite3, dict for SQLAlchemy) for safe parameterization — **never use f-strings or `.format()` to build SQL**
- `parse_dates=["col_name"]` converts TEXT date columns to `datetime64` in the resulting DataFrame
- `index_col="id"` sets the DataFrame's index to the specified column
- `chunksize=N` returns a generator of DataFrames — use this for large result sets that would otherwise exhaust memory

---

## Common Mistakes to Avoid

- **Building SQL with f-strings**: `f"WHERE dept = '{dept}'"` is a SQL injection vulnerability — always use `params=`
- **Forgetting `parse_dates`**: dates from SQLite come as strings by default; add `parse_dates=["date_col"]` for datetime arithmetic
- **Using `pd.read_sql_table()` with a raw sqlite3 connection**: `read_sql_table()` requires a SQLAlchemy engine, not a raw connection object

---

[← Previous](./lesson-05-sql-joins.md) | [Back to Course](./README.md) | [Next →](./lesson-07-pandas-to-sql.md)
