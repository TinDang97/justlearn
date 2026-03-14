# Lesson 3: SQL Queries — SELECT, Filter, Sort, Limit

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Write SELECT queries with column projection, WHERE filters, ORDER BY, and LIMIT
- Use comparison and logical operators in WHERE clauses
- Use LIKE, IN, BETWEEN, and IS NULL for pattern and range matching
- Use column aliases and computed columns in SELECT

---

## Prerequisites

- Lesson 2: SQLite Basics (sqlite3, CREATE TABLE, INSERT)

---

## Lesson Outline

### Part 1: SELECT Fundamentals (30 minutes)

#### Column Projection and Filtering

We will use a consistent employees database throughout this lesson. Run this setup block first:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE employees (
        id         INTEGER PRIMARY KEY,
        name       TEXT,
        department TEXT,
        salary     REAL,
        hire_date  TEXT,
        manager_id INTEGER
    )
""")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?)", [
    (1,  "Alice",   "Engineering", 90000, "2022-01-15", None),
    (2,  "Bob",     "Marketing",   65000, "2023-03-01", 6),
    (3,  "Carol",   "Engineering", 85000, "2021-06-01", 1),
    (4,  "Dave",    "HR",          55000, "2020-11-15", None),
    (5,  "Eve",     "Engineering", 95000, "2019-08-20", 1),
    (6,  "Frank",   "Marketing",   70000, "2022-07-10", None),
    (7,  "Grace",   "Data",        88000, "2021-03-05", None),
    (8,  "Hank",    "HR",          52000, "2023-01-20", 4),
    (9,  "Ivy",     "Data",        92000, "2020-09-30", 7),
    (10, "Jack",    "Engineering", 78000, "2022-12-01", 1),
    (11, "Amy",     "Product",     82000, "2021-09-15", None),
    (12, "Brian",   "Product",     75000, "2022-04-01", 11),
])
conn.commit()
print("Employee database ready with 12 rows")
```

#### SELECT * vs Column Projection

```python
# SELECT * returns all columns — use for exploration only
cursor = conn.execute("SELECT * FROM employees LIMIT 3")
print("All columns:", [col[0] for col in cursor.description])
print(cursor.fetchall())

# Column projection: specify exactly which columns you need
cursor = conn.execute("SELECT name, department, salary FROM employees LIMIT 3")
for row in cursor.fetchall():
    print(row)
```

**Best practice**: always project only the columns you need. `SELECT *` is expensive on wide tables.

#### ORDER BY and LIMIT

```python
# Top 5 highest-paid employees in Engineering
cursor = conn.execute("""
    SELECT name, salary
    FROM employees
    WHERE department = 'Engineering'
    ORDER BY salary DESC
    LIMIT 5
""")
print("Top 5 Engineering salaries:")
for name, salary in cursor.fetchall():
    print(f"  {name}: ${salary:,.0f}")
```

```python
# OFFSET for pagination: skip first 3, take next 3
cursor = conn.execute("""
    SELECT name, salary
    FROM employees
    ORDER BY salary DESC
    LIMIT 3 OFFSET 3
""")
print("Employees ranked 4-6 by salary:")
for name, salary in cursor.fetchall():
    print(f"  {name}: ${salary:,.0f}")
```

```python
# Multi-column sort: by department (alphabetical), then salary (high to low)
cursor = conn.execute("""
    SELECT department, name, salary
    FROM employees
    ORDER BY department ASC, salary DESC
""")
for row in cursor.fetchall():
    print(row)
```

---

### Part 2: WHERE Clause Operators (30 minutes)

#### Logical Operators: AND, OR, NOT

```python
# AND: employees in Engineering with salary > 85000
cursor = conn.execute("""
    SELECT name, department, salary
    FROM employees
    WHERE department = 'Engineering' AND salary > 85000
""")
print("Senior Engineering salaries:")
for row in cursor.fetchall():
    print(row)
```

```python
# OR: employees in Engineering OR Data
cursor = conn.execute("""
    SELECT name, department, salary
    FROM employees
    WHERE department = 'Engineering' OR department = 'Data'
    ORDER BY salary DESC
""")
for row in cursor.fetchall():
    print(row)
```

#### IN, BETWEEN, LIKE

```python
# IN: cleaner than multiple ORs
cursor = conn.execute("""
    SELECT name, department
    FROM employees
    WHERE department IN ('Engineering', 'Data', 'Product')
    ORDER BY department, name
""")
print("Technical departments:")
for row in cursor.fetchall():
    print(row)
```

```python
# BETWEEN: salary range (inclusive)
cursor = conn.execute("""
    SELECT name, salary
    FROM employees
    WHERE salary BETWEEN 70000 AND 90000
    ORDER BY salary
""")
print("Mid-range salaries ($70k-$90k):")
for row in cursor.fetchall():
    print(row)
```

```python
# LIKE: pattern matching — % is wildcard for any characters
# Names starting with 'A'
cursor = conn.execute("SELECT name FROM employees WHERE name LIKE 'A%'")
print("Names starting with A:", [r[0] for r in cursor.fetchall()])

# Names ending with 'e'
cursor = conn.execute("SELECT name FROM employees WHERE name LIKE '%e'")
print("Names ending with e:", [r[0] for r in cursor.fetchall()])
```

#### IS NULL / IS NOT NULL

```python
# IS NULL: find employees with no manager (top-level)
cursor = conn.execute("""
    SELECT name, department
    FROM employees
    WHERE manager_id IS NULL
    ORDER BY department
""")
print("Top-level employees (no manager):")
for row in cursor.fetchall():
    print(f"  {row[0]} - {row[1]}")
```

```python
# Filter: hired after 2022 in Engineering or Product
cursor = conn.execute("""
    SELECT name, department, hire_date
    FROM employees
    WHERE hire_date > '2022-01-01'
      AND department IN ('Engineering', 'Product')
    ORDER BY hire_date
""")
print("Recent Engineering/Product hires:")
for row in cursor.fetchall():
    print(row)
```

---

### Part 3: Computed Columns and Aliases (30 minutes)

#### Column Aliases and Arithmetic

```python
# Column aliases with AS
cursor = conn.execute("""
    SELECT
        name AS employee_name,
        salary,
        salary * 1.1 AS salary_with_raise,
        salary * 12  AS annual_salary
    FROM employees
    ORDER BY salary DESC
    LIMIT 5
""")
print("Salary projections:")
col_names = [col[0] for col in cursor.description]
print(col_names)
for row in cursor.fetchall():
    print(row)
```

#### String Functions

```python
# UPPER, LENGTH, SUBSTR
cursor = conn.execute("""
    SELECT
        name,
        UPPER(name)       AS name_upper,
        LENGTH(name)      AS name_length,
        SUBSTR(name, 1, 1) AS first_letter
    FROM employees
    LIMIT 5
""")
for row in cursor.fetchall():
    print(row)
```

#### Date Functions

```python
# strftime extracts date parts from ISO date strings
cursor = conn.execute("""
    SELECT
        name,
        hire_date,
        strftime('%Y', hire_date) AS hire_year,
        strftime('%m', hire_date) AS hire_month
    FROM employees
    ORDER BY hire_date
""")
for row in cursor.fetchall():
    print(row)
```

#### CASE WHEN — Conditional Columns

```python
# Classify employees into salary tiers
cursor = conn.execute("""
    SELECT
        name,
        department,
        salary,
        CASE
            WHEN salary >= 90000 THEN 'Senior'
            WHEN salary >= 75000 THEN 'Mid'
            ELSE 'Junior'
        END AS level
    FROM employees
    ORDER BY salary DESC
""")

print(f"{'Name':<10} {'Department':<15} {'Salary':>10} {'Level':<8}")
print("-" * 50)
for name, dept, salary, level in cursor.fetchall():
    print(f"{name:<10} {dept:<15} ${salary:>9,.0f} {level:<8}")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Products Database Queries

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE products (
        id       INTEGER PRIMARY KEY,
        name     TEXT,
        category TEXT,
        price    REAL,
        stock    INTEGER
    )
""")
conn.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?)", [
    (1,  "Widget A",       "Hardware",     25.99, 100),
    (2,  "Gadget Pro",     "Electronics", 149.99,  45),
    (3,  "Tool Kit",       "Hardware",     49.99,  30),
    (4,  "Smart Device",   "Electronics", 299.99,  12),
    (5,  "Basic Pack",     "Accessories",   9.99, 200),
    (6,  "Cable Set",      "Accessories",  14.99,  75),
    (7,  "Pro Stand",      "Hardware",     39.99,   0),
    (8,  "Mini Hub",       "Electronics",  79.99,  22),
    (9,  "ProMax Shield",  "Accessories",  19.99,  55),
    (10, "WidgetPlus",     None,           34.99,  18),
])
conn.commit()

# Query 1: all products under $30
print("--- Products under $30 ---")
cursor = conn.execute("SELECT name, price FROM products WHERE price < 30 ORDER BY price")
for row in cursor.fetchall():
    print(row)

# Query 2: Electronics sorted by price descending
print("\n--- Electronics by price (high to low) ---")
cursor = conn.execute("SELECT name, price FROM products WHERE category = 'Electronics' ORDER BY price DESC")
for row in cursor.fetchall():
    print(row)

# Query 3: top 3 most expensive items
print("\n--- Top 3 most expensive ---")
cursor = conn.execute("SELECT name, price FROM products ORDER BY price DESC LIMIT 3")
for row in cursor.fetchall():
    print(row)

# Query 4: products with name starting with 'Pro'
print("\n--- Products starting with 'Pro' ---")
cursor = conn.execute("SELECT name, category FROM products WHERE name LIKE 'Pro%'")
for row in cursor.fetchall():
    print(row)

# Query 5: products with NULL category
print("\n--- Products with no category ---")
cursor = conn.execute("SELECT name, price FROM products WHERE category IS NULL")
for row in cursor.fetchall():
    print(row)
```

#### Exercise 2: Annual Salary Computation

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL)")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)", [
    (1, "Alice", "Engineering", 90000),
    (2, "Bob",   "Marketing",   65000),
    (3, "Carol", "Engineering", 85000),
    (4, "Dave",  "HR",          55000),
    (5, "Eve",   "Engineering", 95000),
    (6, "Frank", "Marketing",   70000),
    (7, "Grace", "Data",        88000),
    (8, "Hank",  "HR",          52000),
])
conn.commit()

# Compute annual_salary, filter > 100k, sort by annual_salary descending
cursor = conn.execute("""
    SELECT
        name,
        department,
        salary * 12 AS annual_salary
    FROM employees
    WHERE salary * 12 > 100000
    ORDER BY annual_salary DESC
""")

print(f"{'Name':<10} {'Department':<15} {'Annual Salary':>15}")
print("-" * 45)
for name, dept, annual in cursor.fetchall():
    print(f"{name:<10} {dept:<15} ${annual:>14,.0f}")
```

---

<PracticeBlock
  prompt="Using the employees database from this lesson, write a query that shows each employee's name, department, salary, and a computed 'bonus' column equal to 10% of their salary. Filter to employees with salary > 80000. Sort by bonus descending."
  initialCode={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL)")\nconn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)", [\n    (1, "Alice", "Engineering", 90000),\n    (2, "Bob",   "Marketing",   65000),\n    (3, "Carol", "Engineering", 85000),\n    (4, "Dave",  "HR",          55000),\n    (5, "Eve",   "Engineering", 95000),\n    (6, "Grace", "Data",        88000),\n    (7, "Ivy",   "Data",        92000),\n])\nconn.commit()\n\n# Write your SELECT query here\n`}
  hint="Use salary * 0.1 AS bonus in the SELECT clause. Add WHERE salary > 80000 and ORDER BY bonus DESC."
  solution={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL)")\nconn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)", [\n    (1, "Alice", "Engineering", 90000),\n    (2, "Bob",   "Marketing",   65000),\n    (3, "Carol", "Engineering", 85000),\n    (4, "Dave",  "HR",          55000),\n    (5, "Eve",   "Engineering", 95000),\n    (6, "Grace", "Data",        88000),\n    (7, "Ivy",   "Data",        92000),\n])\nconn.commit()\n\ncursor = conn.execute("""\n    SELECT\n        name,\n        department,\n        salary,\n        salary * 0.1 AS bonus\n    FROM employees\n    WHERE salary > 80000\n    ORDER BY bonus DESC\n""")\n\nprint(f"{'Name':<10} {'Department':<15} {'Salary':>10} {'Bonus':>10}")\nprint("-" * 50)\nfor name, dept, salary, bonus in cursor.fetchall():\n    print(f"{name:<10} {dept:<15} ${salary:>9,.0f} ${bonus:>9,.0f}")`}
/>

---

## Key Takeaways

- `SELECT col1, col2 FROM table WHERE cond ORDER BY col LIMIT n` is the core SELECT structure
- `IN (v1, v2)` is cleaner than multiple `OR` conditions; `BETWEEN low AND high` for ranges (inclusive)
- `LIKE 'A%'` matches any string starting with A; `'%com'` matches any string ending with com
- `IS NULL` / `IS NOT NULL` are the correct tests for missing values — `= NULL` does not work in SQL
- `CASE WHEN ... THEN ... ELSE ... END` creates conditional columns directly in SQL
- Column aliases (`AS name`) rename columns in the result; arithmetic (`salary * 12`) creates computed columns

---

## Common Mistakes to Avoid

- **Using `= NULL` instead of `IS NULL`**: in SQL, `NULL = NULL` is false. Always use `IS NULL`.
- **LIKE with = operator**: use `LIKE` with `%` wildcards, not `=`. `WHERE name = 'A%'` finds nothing.
- **Forgetting that BETWEEN is inclusive**: `BETWEEN 70000 AND 90000` includes both endpoints.

---

[← Previous](./lesson-02-sqlite-basics.md) | [Back to Course](./README.md) | [Next →](./lesson-04-sql-aggregations.md)
