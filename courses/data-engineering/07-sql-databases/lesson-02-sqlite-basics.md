# Lesson 2: SQLite — An Embedded Database for Python

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Connect to an in-memory SQLite database using `sqlite3`
- Create tables with `CREATE TABLE` and appropriate data types
- Insert rows with `INSERT INTO` using parameterized queries
- Query data with `SELECT` and retrieve results using a cursor

---

## Prerequisites

- Lesson 1: SQL and Databases Overview
- Python fundamentals: lists, tuples, loops

---

## Lesson Outline

### Part 1: Connecting and Creating Tables (30 minutes)

#### The sqlite3 Module

Python's standard library includes `sqlite3` — no installation required. SQLite is a self-contained database engine that stores everything in a single file (or entirely in memory).

```python
import sqlite3

# Connect to an in-memory database
# :memory: means the database exists only in RAM — no file is created
conn = sqlite3.connect(":memory:")
print("Connected to in-memory SQLite database")
print(type(conn))  # <class 'sqlite3.Connection'>
```

**`:memory:` vs file path:**
- `:memory:` — database lives in RAM, destroyed when the connection closes. Perfect for learning, testing, and ephemeral pipeline stages.
- `"data.db"` — database written to disk, persists between runs. Used in production pipelines.

In this section, all examples use `:memory:` to work in-browser without file system access.

#### Creating Tables with CREATE TABLE

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# Create an employees table
conn.execute("""
    CREATE TABLE employees (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL,
        department  TEXT,
        salary      REAL,
        hire_date   TEXT
    )
""")

# Always commit after DDL (schema changes)
conn.commit()
print("Table created successfully")
```

**SQLite data types** (SQLite uses "type affinity" — it is loosely typed):

| SQLite Type | Use For | Python Equivalent |
|---|---|---|
| `INTEGER` | Whole numbers, IDs, counts | `int` |
| `TEXT` | Strings, dates (as ISO strings), categories | `str` |
| `REAL` | Decimal numbers, prices, percentages | `float` |
| `BLOB` | Binary data (images, files) | `bytes` |
| `NULL` | Missing / unknown value | `None` |

#### Creating Related Tables

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# Create departments first (referenced by employees)
conn.execute("""
    CREATE TABLE departments (
        dept_id   INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL,
        location  TEXT
    )
""")

# Create employees with a foreign key reference
conn.execute("""
    CREATE TABLE employees (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL,
        dept_id     INTEGER REFERENCES departments(dept_id),
        salary      REAL,
        hire_date   TEXT
    )
""")

conn.commit()
print("Both tables created")
```

<Info>
SQLite does not enforce foreign key constraints by default. To enable enforcement, run `conn.execute("PRAGMA foreign_keys = ON")` after connecting. For learning purposes, the relationships still work for JOINs even without enforcement.
</Info>

---

### Part 2: Inserting Data (30 minutes)

#### Single Row Insert — Always Use Parameters

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT)
""")

# BAD: string formatting — vulnerable to SQL injection
# conn.execute(f"INSERT INTO employees VALUES (1, '{name}', ...)")  # NEVER DO THIS

# GOOD: parameterized insert — use ? placeholders
conn.execute(
    "INSERT INTO employees VALUES (?, ?, ?, ?, ?)",
    (1, "Alice", "Engineering", 90000, "2022-01-15")
)
conn.commit()
print("One row inserted")
```

The `?` placeholders are replaced by the values in the tuple. SQLite handles escaping — no SQL injection possible.

#### Bulk Insert with executemany

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT)
""")

# Seed data as a list of tuples
employee_data = [
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
]

# executemany inserts all rows in one call
conn.executemany(
    "INSERT INTO employees VALUES (?, ?, ?, ?, ?)",
    employee_data
)
conn.commit()
print(f"Inserted {len(employee_data)} employees")
```

**When to use each:**
- `execute()` — single row, dynamic data
- `executemany()` — multiple rows from a list/iterator (more efficient than a loop of `execute()` calls)

---

### Part 3: Querying with cursor (30 minutes)

#### Basic SELECT with cursor

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT)")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?, ?)", [
    (1, "Alice", "Engineering", 90000, "2022-01-15"),
    (2, "Bob",   "Marketing",   65000, "2023-03-01"),
    (3, "Carol", "Engineering", 85000, "2021-06-01"),
    (4, "Dave",  "HR",          55000, "2020-11-15"),
    (5, "Eve",   "Engineering", 95000, "2019-08-20"),
])
conn.commit()

# Execute a SELECT query — returns a cursor object
cursor = conn.execute("SELECT * FROM employees WHERE salary > 70000")

# Iterate directly over the cursor (memory-efficient for large results)
print("Employees earning more than $70,000:")
for row in cursor:
    print(row)  # Each row is a tuple: (id, name, department, salary, hire_date)
```

#### fetchall() and Column Names

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT)")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?, ?)", [
    (1, "Alice", "Engineering", 90000, "2022-01-15"),
    (2, "Bob",   "Marketing",   65000, "2023-03-01"),
    (3, "Carol", "Engineering", 85000, "2021-06-01"),
])
conn.commit()

cursor = conn.execute("SELECT name, department, salary FROM employees ORDER BY salary DESC")

# fetchall() returns a list of tuples — loads all results into memory
rows = cursor.fetchall()
print(f"Fetched {len(rows)} rows")
print("First row:", rows[0])

# cursor.description gives column metadata — extract column names
col_names = [col[0] for col in cursor.description]
print("Column names:", col_names)

# Build a list of dicts for readable output
result = [dict(zip(col_names, row)) for row in rows]
for record in result:
    print(record)
```

#### Querying Engineering Employees

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT)")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?, ?)", [
    (1, "Alice", "Engineering", 90000, "2022-01-15"),
    (2, "Bob",   "Marketing",   65000, "2023-03-01"),
    (3, "Carol", "Engineering", 85000, "2021-06-01"),
    (4, "Dave",  "HR",          55000, "2020-11-15"),
    (5, "Eve",   "Engineering", 95000, "2019-08-20"),
])
conn.commit()

# Query Engineering employees
cursor = conn.execute("""
    SELECT name, salary
    FROM employees
    WHERE department = 'Engineering'
    ORDER BY salary DESC
""")

print("Engineering employees by salary:")
for name, salary in cursor.fetchall():
    print(f"  {name}: ${salary:,.0f}")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Products Database

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# Step 1: Create a products table
# Columns: id (INTEGER PK), name (TEXT), category (TEXT), price (REAL), stock_qty (INTEGER)
conn.execute("""
    CREATE TABLE products (
        id        INTEGER PRIMARY KEY,
        name      TEXT NOT NULL,
        category  TEXT,
        price     REAL,
        stock_qty INTEGER
    )
""")

# Step 2: Insert 8 products using executemany
products = [
    (1, "Widget A",    "Hardware",     29.99, 150),
    (2, "Gadget Pro",  "Electronics", 149.99,  45),
    (3, "Tool Kit",    "Hardware",     49.99,  30),
    (4, "Smart Device","Electronics", 299.99,  12),
    (5, "Basic Pack",  "Accessories",   9.99, 200),
    (6, "Cable Set",   "Accessories",  14.99,  75),
    (7, "Pro Stand",   "Hardware",     39.99,   0),  # out of stock
    (8, "Mini Hub",    "Electronics",  79.99,  22),
]
conn.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?)", products)
conn.commit()

# Step 3: Query products where price > 20 AND stock_qty > 0
cursor = conn.execute("""
    SELECT name, category, price, stock_qty
    FROM products
    WHERE price > 20 AND stock_qty > 0
    ORDER BY price DESC
""")

print("Available products over $20:")
for row in cursor.fetchall():
    print(f"  {row[0]} ({row[1]}): ${row[2]:.2f}, stock: {row[3]}")
```

#### Exercise 2: Orders and Customers

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# Create tables
conn.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT)")
conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, order_date TEXT)")

# Insert 5 customers and 10 orders
conn.executemany("INSERT INTO customers VALUES (?, ?, ?)", [
    (1, "Alice", "alice@example.com"),
    (2, "Bob",   "bob@example.com"),
    (3, "Carol", "carol@example.com"),
    (4, "Dave",  "dave@example.com"),
    (5, "Eve",   "eve@example.com"),
])
conn.executemany("INSERT INTO orders VALUES (?, ?, ?, ?)", [
    (1,  1, 150.00, "2024-01-10"),
    (2,  2, 220.50, "2024-01-12"),
    (3,  1, 89.99,  "2024-01-15"),
    (4,  3, 310.00, "2024-01-18"),
    (5,  2, 75.00,  "2024-01-20"),
    (6,  1, 199.00, "2024-01-22"),
    (7,  4, 45.50,  "2024-01-25"),
    (8,  3, 180.00, "2024-01-28"),
    (9,  5, 95.00,  "2024-02-01"),
    (10, 2, 125.00, "2024-02-03"),
])
conn.commit()

# Query: how many orders does each customer have?
cursor = conn.execute("""
    SELECT c.name, COUNT(o.id) AS order_count
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id, c.name
    ORDER BY order_count DESC
""")

print("Order count per customer:")
for name, count in cursor.fetchall():
    print(f"  {name}: {count} orders")
```

---

<PracticeBlock
  prompt="Create an in-memory SQLite database with a `books` table (id INTEGER PK, title TEXT, author TEXT, year INTEGER, price REAL). Insert 5 books using executemany. Then query and print all books published after 2010 sorted by year."
  initialCode={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\n\n# Create the books table\n\n# Insert 5 books using executemany\nbooks = [\n    # (id, title, author, year, price)\n]\n\n# Query books published after 2010\n`}
  hint="Use conn.execute() for CREATE TABLE, then conn.executemany() with a list of tuples. For the query, use WHERE year > 2010 ORDER BY year ASC."
  solution={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\n\n# Create the books table\nconn.execute("""\n    CREATE TABLE books (\n        id     INTEGER PRIMARY KEY,\n        title  TEXT NOT NULL,\n        author TEXT,\n        year   INTEGER,\n        price  REAL\n    )\n""")\n\n# Insert 5 books using executemany\nbooks = [\n    (1, "Clean Code",         "Robert Martin", 2008, 35.99),\n    (2, "The Pragmatic Programmer", "Hunt & Thomas", 1999, 42.00),\n    (3, "Python Crash Course", "Eric Matthes", 2019, 29.99),\n    (4, "Fluent Python",       "Luciano Ramalho", 2015, 49.99),\n    (5, "Data Engineering",    "Joe Reis",    2022, 54.00),\n]\nconn.executemany("INSERT INTO books VALUES (?, ?, ?, ?, ?)", books)\nconn.commit()\n\n# Query books published after 2010\ncursor = conn.execute("SELECT title, author, year FROM books WHERE year > 2010 ORDER BY year ASC")\nfor title, author, year in cursor.fetchall():\n    print(f"{year}: {title} by {author}")`}
/>

---

## Key Takeaways

- `sqlite3.connect(":memory:")` creates an in-memory database — no file system access needed
- Always use `?` parameter placeholders in SQL queries — never use f-strings or string formatting for user data
- `conn.executemany()` inserts multiple rows efficiently from a list of tuples
- `cursor.fetchall()` returns results as a list of tuples; `cursor.description` gives column metadata
- `conn.commit()` must be called after `INSERT`, `UPDATE`, `DELETE`, and `CREATE TABLE` to persist changes

---

## Common Mistakes to Avoid

- **Forgetting `conn.commit()`**: without committing, writes are not saved (though with `:memory:` they live until the connection closes)
- **Using f-strings for SQL parameters**: always use `?` placeholders — this prevents SQL injection and handles special characters automatically
- **Confusing `execute()` and `executemany()`**: `execute()` runs one statement; `executemany()` runs one statement repeatedly with different parameters

---

[← Previous](./lesson-01-sql-and-databases-overview.md) | [Back to Course](./README.md) | [Next →](./lesson-03-sql-queries.md)
