# Lesson 4: GROUP BY and Aggregations in SQL

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Use aggregate functions: COUNT, SUM, AVG, MIN, MAX
- Group results with GROUP BY and filter groups with HAVING
- Understand the difference between WHERE (pre-aggregation) and HAVING (post-aggregation)
- Use subqueries for multi-step aggregation

---

## Prerequisites

- Lesson 3: SQL Queries (SELECT, WHERE, ORDER BY)

---

## Lesson Outline

### Part 1: Aggregate Functions (30 minutes)

#### Setup

```python
import sqlite3

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
    (11, "Amy",     "Product",     82000, "2021-09-15"),
    (12, "Brian",   "Product",     75000, "2022-04-01"),
])
conn.commit()
print("Employee database ready (12 rows)")
```

#### The Five Core Aggregate Functions

| Function | Returns | NULL handling |
|---|---|---|
| `COUNT(*)` | Total row count | Counts all rows including NULLs |
| `COUNT(col)` | Non-NULL values in column | Excludes NULL rows |
| `COUNT(DISTINCT col)` | Unique non-NULL values | Excludes NULL and duplicates |
| `SUM(col)` | Sum of all values | Ignores NULLs |
| `AVG(col)` | Mean of all values | Ignores NULLs |
| `MIN(col)` | Smallest value | Ignores NULLs |
| `MAX(col)` | Largest value | Ignores NULLs |

```python
# Aggregates without GROUP BY — compute over the entire table
cursor = conn.execute("""
    SELECT
        COUNT(*)           AS total_employees,
        COUNT(department)  AS dept_filled,
        COUNT(DISTINCT department) AS unique_depts,
        ROUND(AVG(salary), 2) AS avg_salary,
        MIN(salary)        AS min_salary,
        MAX(salary)        AS max_salary,
        SUM(salary)        AS total_payroll
    FROM employees
""")
row = cursor.fetchone()
col_names = [col[0] for col in cursor.description]
for name, value in zip(col_names, row):
    print(f"  {name}: {value}")
```

```python
# Aggregate on a filtered subset using WHERE
# Average salary of Engineering employees only
cursor = conn.execute("""
    SELECT
        COUNT(*) AS eng_headcount,
        ROUND(AVG(salary), 2) AS eng_avg_salary,
        MAX(salary) AS eng_top_salary
    FROM employees
    WHERE department = 'Engineering'
""")
print("Engineering stats:", cursor.fetchone())
```

---

### Part 2: GROUP BY (30 minutes)

#### GROUP BY with Aggregates

```python
# Headcount and average salary per department
cursor = conn.execute("""
    SELECT
        department,
        COUNT(*) AS headcount,
        ROUND(AVG(salary), 0) AS avg_salary,
        MIN(salary) AS min_salary,
        MAX(salary) AS max_salary
    FROM employees
    GROUP BY department
    ORDER BY avg_salary DESC
""")

print(f"{'Department':<15} {'Count':>6} {'Avg Salary':>12} {'Min':>10} {'Max':>10}")
print("-" * 57)
for row in cursor.fetchall():
    print(f"{row[0]:<15} {row[1]:>6} ${row[2]:>11,.0f} ${row[3]:>9,.0f} ${row[4]:>9,.0f}")
```

#### GROUP BY Multiple Columns

```python
# Add a level column to demonstrate multi-column group by
conn.execute("ALTER TABLE employees ADD COLUMN level TEXT")
conn.execute("""
    UPDATE employees
    SET level = CASE
        WHEN salary >= 90000 THEN 'Senior'
        WHEN salary >= 75000 THEN 'Mid'
        ELSE 'Junior'
    END
""")
conn.commit()

# Group by department AND level
cursor = conn.execute("""
    SELECT
        department,
        level,
        COUNT(*) AS count
    FROM employees
    GROUP BY department, level
    ORDER BY department, level
""")
print("Headcount by department and level:")
for row in cursor.fetchall():
    print(f"  {row[0]:<15} {row[1]:<8} {row[2]}")
```

#### NULL in GROUP BY

```python
# NULL forms its own group — employees with no department would appear as a separate group
# Insert a test employee with no department to demonstrate
conn.execute("INSERT INTO employees VALUES (13, 'Temp', NULL, 48000, '2024-01-01', NULL)")
conn.commit()

cursor = conn.execute("""
    SELECT department, COUNT(*) AS count
    FROM employees
    GROUP BY department
    ORDER BY count DESC
""")
print("Headcount by department (NULL is its own group):")
for row in cursor.fetchall():
    print(f"  {str(row[0]):<15} {row[1]}")
```

---

### Part 3: HAVING (30 minutes)

#### HAVING vs WHERE

The critical distinction:

| Clause | Runs | Filters |
|---|---|---|
| `WHERE` | Before GROUP BY | Individual rows |
| `HAVING` | After GROUP BY | Aggregated groups |

You cannot use aggregate functions in `WHERE`. Use `HAVING` for aggregate conditions.

```python
# WHERE filters rows BEFORE aggregation
# HAVING filters groups AFTER aggregation

# Find departments with more than 2 employees
cursor = conn.execute("""
    SELECT department, COUNT(*) AS headcount
    FROM employees
    WHERE department IS NOT NULL      -- filter rows first
    GROUP BY department
    HAVING headcount > 2              -- filter groups after aggregation
    ORDER BY headcount DESC
""")
print("Departments with > 2 employees:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} employees")
```

#### Combining WHERE and HAVING

```python
# WHERE: filter to employees hired after 2021
# HAVING: only show departments with at least 2 recent hires
cursor = conn.execute("""
    SELECT
        department,
        COUNT(*) AS recent_hires,
        ROUND(AVG(salary), 0) AS avg_salary
    FROM employees
    WHERE hire_date > '2021-01-01'
      AND department IS NOT NULL
    GROUP BY department
    HAVING recent_hires >= 2
    ORDER BY recent_hires DESC
""")
print("Departments with 2+ hires since 2021:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} hires, avg ${row[2]:,.0f}")
```

#### Subquery for Complex Filtering

```python
# Find departments where average salary > overall average salary
cursor = conn.execute("""
    SELECT department, ROUND(AVG(salary), 0) AS dept_avg
    FROM employees
    WHERE department IS NOT NULL
    GROUP BY department
    HAVING dept_avg > (SELECT AVG(salary) FROM employees)
    ORDER BY dept_avg DESC
""")

overall_avg = conn.execute("SELECT ROUND(AVG(salary), 0) FROM employees").fetchone()[0]
print(f"Overall average salary: ${overall_avg:,.0f}")
print("Departments above average:")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f}")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Employee Aggregations

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
    (9, "Ivy",   "Data",        92000),
    (10,"Jack",  "Engineering", 78000),
])
conn.commit()

# 1. Average salary by department
print("--- Avg salary by department ---")
cursor = conn.execute("""
    SELECT department, ROUND(AVG(salary), 0) AS avg_salary
    FROM employees GROUP BY department ORDER BY avg_salary DESC
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f}")

# 2. Department with the highest headcount
print("\n--- Dept with most employees ---")
cursor = conn.execute("""
    SELECT department, COUNT(*) AS n
    FROM employees GROUP BY department ORDER BY n DESC LIMIT 1
""")
print(cursor.fetchone())

# 3. Departments where average salary > 75000
print("\n--- Departments with avg salary > $75k ---")
cursor = conn.execute("""
    SELECT department, ROUND(AVG(salary), 0) AS avg_salary
    FROM employees GROUP BY department
    HAVING avg_salary > 75000
    ORDER BY avg_salary DESC
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f}")

# 4. Employees earning above their department average (subquery)
print("\n--- Above-average earners in their department ---")
cursor = conn.execute("""
    SELECT e.name, e.department, e.salary,
           ROUND(dept_avg.avg_sal, 0) AS dept_avg
    FROM employees e
    JOIN (
        SELECT department, AVG(salary) AS avg_sal
        FROM employees GROUP BY department
    ) dept_avg ON e.department = dept_avg.department
    WHERE e.salary > dept_avg.avg_sal
    ORDER BY e.department, e.salary DESC
""")
for row in cursor.fetchall():
    print(f"  {row[0]} ({row[1]}): ${row[2]:,.0f} vs dept avg ${row[3]:,.0f}")
```

#### Exercise 2: Sales Aggregations

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE sales (
        id       INTEGER PRIMARY KEY,
        region   TEXT,
        product  TEXT,
        amount   REAL,
        sale_date TEXT
    )
""")
conn.executemany("INSERT INTO sales VALUES (?, ?, ?, ?, ?)", [
    (1,  "North", "Widget",  1200, "2024-01-10"),
    (2,  "South", "Gadget",   800, "2024-01-15"),
    (3,  "North", "Tool",    1500, "2024-02-01"),
    (4,  "East",  "Widget",   600, "2024-02-10"),
    (5,  "South", "Widget",   900, "2024-02-20"),
    (6,  "North", "Gadget",  2100, "2024-03-01"),
    (7,  "East",  "Tool",    1400, "2024-03-05"),
    (8,  "South", "Tool",    1800, "2024-03-10"),
    (9,  "North", "Widget",   950, "2024-03-15"),
    (10, "East",  "Gadget",  3200, "2024-03-20"),
    (11, "South", "Widget",  1100, "2024-03-25"),
    (12, "North", "Tool",    2200, "2024-03-28"),
])
conn.commit()

# Monthly revenue by region
print("--- Monthly revenue by region ---")
cursor = conn.execute("""
    SELECT
        strftime('%Y-%m', sale_date) AS month,
        region,
        ROUND(SUM(amount), 2) AS monthly_revenue
    FROM sales
    GROUP BY month, region
    ORDER BY month, region
""")
for row in cursor.fetchall():
    print(f"  {row[0]} | {row[1]}: ${row[2]:,.0f}")

# Top 2 products by total sales
print("\n--- Top 2 products by total revenue ---")
cursor = conn.execute("""
    SELECT product, ROUND(SUM(amount), 2) AS total
    FROM sales GROUP BY product ORDER BY total DESC LIMIT 2
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f}")

# Regions with total sales > 5000
print("\n--- Regions with total sales > $5,000 ---")
cursor = conn.execute("""
    SELECT region, ROUND(SUM(amount), 2) AS total
    FROM sales GROUP BY region HAVING total > 5000 ORDER BY total DESC
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f}")
```

---

<PracticeBlock
  prompt="Create a sales table with columns (id, rep_name, region, deal_size, closed_date). Insert 10 rows of sales data. Write a query that shows each region's total deal value, number of deals, and average deal size — but only for regions that closed at least 3 deals."
  initialCode={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\n\n# Create sales table and insert data\n\n# Query: region stats, only regions with 3+ deals\n`}
  hint="Use GROUP BY region with COUNT(*) AS deals and SUM(deal_size) AS total. Add HAVING deals >= 3 to filter groups."
  solution={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE sales (id INTEGER PRIMARY KEY, rep_name TEXT, region TEXT, deal_size REAL, closed_date TEXT)")\nconn.executemany("INSERT INTO sales VALUES (?, ?, ?, ?, ?)", [\n    (1,  "Alice",  "West",  15000, "2024-01-10"),\n    (2,  "Bob",    "East",  22000, "2024-01-15"),\n    (3,  "Carol",  "West",  18000, "2024-02-01"),\n    (4,  "Dave",   "North",  8000, "2024-02-10"),\n    (5,  "Eve",    "East",  31000, "2024-02-20"),\n    (6,  "Frank",  "West",  12000, "2024-03-01"),\n    (7,  "Grace",  "North", 14000, "2024-03-05"),\n    (8,  "Hank",   "East",  19000, "2024-03-10"),\n    (9,  "Ivy",    "North",  9500, "2024-03-15"),\n    (10, "Jack",   "West",  25000, "2024-03-20"),\n])\nconn.commit()\n\ncursor = conn.execute("""\n    SELECT\n        region,\n        COUNT(*) AS deals,\n        ROUND(SUM(deal_size), 0) AS total_value,\n        ROUND(AVG(deal_size), 0) AS avg_deal\n    FROM sales\n    GROUP BY region\n    HAVING deals >= 3\n    ORDER BY total_value DESC\n""")\n\nprint(f"{'Region':<10} {'Deals':>6} {'Total':>12} {'Avg Deal':>10}")\nprint("-" * 42)\nfor region, deals, total, avg in cursor.fetchall():\n    print(f"{region:<10} {deals:>6} ${total:>11,.0f} ${avg:>9,.0f}")`}
/>

---

## Key Takeaways

- `COUNT(*)` counts all rows; `COUNT(col)` excludes NULLs; `COUNT(DISTINCT col)` counts unique values
- `GROUP BY col` splits rows into groups — aggregate functions compute per group
- `WHERE` filters **rows** before grouping; `HAVING` filters **groups** after aggregation
- You cannot use aggregate functions in `WHERE` — use `HAVING` or a subquery instead
- Subqueries in `HAVING` enable comparing groups against computed values like the overall average

---

## Common Mistakes to Avoid

- **Putting aggregate conditions in WHERE**: `WHERE COUNT(*) > 5` is a syntax error — use `HAVING COUNT(*) > 5`
- **Selecting non-aggregated columns without GROUP BY**: every column in SELECT must be either in GROUP BY or wrapped in an aggregate function
- **Confusing COUNT(*) and COUNT(col)**: `COUNT(*)` counts rows; `COUNT(col)` counts non-NULL values in that column

---

[← Previous](./lesson-03-sql-queries.md) | [Back to Course](./README.md) | [Next →](./lesson-05-sql-joins.md)
