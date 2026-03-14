# Lesson 5: SQL JOINs — Combining Tables

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Write INNER JOIN, LEFT JOIN, and self-joins
- Join on single and multiple conditions
- Use table aliases for readable multi-table queries
- Apply the LEFT JOIN + IS NULL pattern for anti-joins (finding non-matching rows)

---

## Prerequisites

- Lesson 4: GROUP BY and Aggregations
- Lesson 1: SQL and Databases Overview (entity relationships)

---

## Lesson Outline

### Part 1: INNER JOIN (30 minutes)

#### Setup: Orders, Customers, Products

```python
import sqlite3

conn = sqlite3.connect(":memory:")

conn.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT)")
conn.execute("""
    CREATE TABLE products (
        id         INTEGER PRIMARY KEY,
        name       TEXT,
        category   TEXT,
        unit_price REAL
    )
""")
conn.execute("""
    CREATE TABLE orders (
        id          INTEGER PRIMARY KEY,
        customer_id INTEGER,
        product_id  INTEGER,
        quantity    INTEGER,
        order_date  TEXT
    )
""")

conn.executemany("INSERT INTO customers VALUES (?, ?, ?, ?)", [
    (1, "Alice Chen",  "alice@example.com",  "New York"),
    (2, "Bob Smith",   "bob@example.com",    "Chicago"),
    (3, "Carol Park",  "carol@example.com",  "New York"),
    (4, "Dave Lee",    "dave@example.com",   "Houston"),
    (5, "Eve Wang",    "eve@example.com",    "Seattle"),
])
conn.executemany("INSERT INTO products VALUES (?, ?, ?, ?)", [
    (101, "Widget A",    "Hardware",     29.99),
    (102, "Gadget Pro",  "Electronics", 149.99),
    (103, "Tool Kit",    "Hardware",     49.99),
    (104, "Smart Device","Electronics", 299.99),
    (105, "Basic Pack",  "Accessories",   9.99),
    (106, "Cable Set",   "Accessories",  14.99),  # no orders placed for this product
])
conn.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", [
    (1,  1, 101, 2, "2024-01-10"),
    (2,  2, 102, 1, "2024-01-12"),
    (3,  1, 103, 3, "2024-01-15"),
    (4,  3, 104, 1, "2024-01-18"),
    (5,  2, 105, 5, "2024-01-20"),
    (6,  1, 102, 1, "2024-01-22"),
    (7,  4, 101, 2, "2024-01-25"),
    (8,  3, 103, 2, "2024-01-28"),
    (9,  5, 104, 1, "2024-02-01"),
    (10, 2, 101, 3, "2024-02-03"),
])
# Customer 5 (Eve) has 1 order. No orders for customer... all have orders here.
# Insert a customer with no orders for LEFT JOIN demo
conn.execute("INSERT INTO customers VALUES (6, 'Fred Jones', 'fred@example.com', 'Miami')")
conn.commit()
print("Database ready: 6 customers, 6 products, 10 orders")
```

#### INNER JOIN: Only Matching Rows

`INNER JOIN` returns rows that have a match in **both** tables. Rows with no match in either table are excluded.

```python
# Join orders with customers to get order details with customer name
cursor = conn.execute("""
    SELECT
        o.id        AS order_id,
        c.name      AS customer_name,
        c.city,
        o.quantity,
        o.order_date
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.id
    ORDER BY o.order_date
""")

print(f"{'Order':>5} {'Customer':<15} {'City':<12} {'Qty':>5} {'Date'}")
print("-" * 55)
for row in cursor.fetchall():
    print(f"{row[0]:>5} {row[1]:<15} {row[2]:<12} {row[3]:>5} {row[4]}")
```

Note the table aliases `o` (orders) and `c` (customers). Instead of writing `orders.customer_id`, we write `o.customer_id`. Aliases are essential when joining multiple tables.

#### Three-Table JOIN

```python
# Join orders + customers + products in one query
cursor = conn.execute("""
    SELECT
        o.id                          AS order_id,
        c.name                        AS customer,
        p.name                        AS product,
        p.category,
        o.quantity,
        ROUND(o.quantity * p.unit_price, 2) AS line_total
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.id
    INNER JOIN products  p ON o.product_id  = p.id
    ORDER BY line_total DESC
""")

print(f"{'Order':>5} {'Customer':<15} {'Product':<15} {'Cat':<12} {'Qty':>4} {'Total':>10}")
print("-" * 70)
for row in cursor.fetchall():
    print(f"{row[0]:>5} {row[1]:<15} {row[2]:<15} {row[3]:<12} {row[4]:>4} ${row[5]:>9,.2f}")
```

---

### Part 2: LEFT JOIN (30 minutes)

#### LEFT JOIN: All Rows from the Left Table

`LEFT JOIN` keeps **all** rows from the left table. Where no match exists in the right table, the right-side columns appear as NULL.

```python
# Show ALL products — including those with no orders
cursor = conn.execute("""
    SELECT
        p.name        AS product,
        p.category,
        COUNT(o.id)   AS order_count,
        COALESCE(SUM(o.quantity), 0) AS total_qty_sold
    FROM products p
    LEFT JOIN orders o ON p.id = o.product_id
    GROUP BY p.id, p.name, p.category
    ORDER BY order_count DESC
""")

print(f"{'Product':<15} {'Category':<14} {'Orders':>8} {'Qty Sold':>10}")
print("-" * 55)
for row in cursor.fetchall():
    print(f"{row[0]:<15} {row[1]:<14} {row[2]:>8} {row[3]:>10}")
```

Products with 0 orders appear because `LEFT JOIN` includes all products regardless of whether there are matching orders.

#### Anti-Join Pattern: LEFT JOIN + IS NULL

The anti-join finds rows in the left table that have **no match** in the right table:

```python
# Find products with no orders (anti-join)
cursor = conn.execute("""
    SELECT p.name, p.category, p.unit_price
    FROM products p
    LEFT JOIN orders o ON p.id = o.product_id
    WHERE o.id IS NULL
""")

print("Products with no orders:")
for row in cursor.fetchall():
    print(f"  {row[0]} ({row[1]}): ${row[2]:.2f}")
```

```python
# Find customers who have never placed an order
cursor = conn.execute("""
    SELECT c.name, c.city
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    WHERE o.id IS NULL
""")

print("Customers with no orders:")
for row in cursor.fetchall():
    print(f"  {row[0]} ({row[1]})")
```

---

### Part 3: Multi-Table Joins and Special Patterns (30 minutes)

#### Joining on Multiple Conditions

```python
# Non-equi join: salary range matching
conn.execute("""
    CREATE TABLE salary_bands (
        band_name TEXT,
        low_sal   REAL,
        high_sal  REAL
    )
""")
conn.executemany("INSERT INTO salary_bands VALUES (?, ?, ?)", [
    ("Junior", 0,      74999),
    ("Mid",    75000,  89999),
    ("Senior", 90000, 999999),
])
conn.execute("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary REAL)")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?)", [
    (1, "Alice", 90000), (2, "Bob", 65000), (3, "Carol", 85000),
    (4, "Dave", 55000),  (5, "Eve", 95000),
])
conn.commit()

# Match employee salary to salary band using BETWEEN
cursor = conn.execute("""
    SELECT e.name, e.salary, sb.band_name
    FROM employees e
    JOIN salary_bands sb ON e.salary BETWEEN sb.low_sal AND sb.high_sal
    ORDER BY e.salary DESC
""")
print("Employees with salary band:")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f} → {row[2]}")
```

#### Self-Join: Joining a Table to Itself

```python
# Employees with manager_id — join employees to itself
conn.execute("ALTER TABLE employees ADD COLUMN manager_id INTEGER")
conn.execute("UPDATE employees SET manager_id = CASE id WHEN 1 THEN NULL WHEN 2 THEN 1 WHEN 3 THEN 1 WHEN 4 THEN NULL WHEN 5 THEN 1 END")
conn.commit()

# e = the employee, m = their manager (same table, different alias)
cursor = conn.execute("""
    SELECT
        e.name           AS employee,
        e.salary,
        COALESCE(m.name, 'No Manager') AS manager
    FROM employees e
    LEFT JOIN employees m ON e.manager_id = m.id
    ORDER BY e.name
""")
print("\nEmployee → Manager:")
for row in cursor.fetchall():
    print(f"  {row[0]}: ${row[1]:,.0f} | reports to: {row[2]}")
```

#### JOIN with Aggregation

```python
# Revenue by customer using JOIN + GROUP BY
cursor = conn.execute("""
    SELECT
        c.name                              AS customer,
        c.city,
        COUNT(o.id)                         AS order_count,
        ROUND(SUM(o.quantity * p.unit_price), 2) AS total_spent
    FROM customers c
    INNER JOIN orders   o ON c.id  = o.customer_id
    INNER JOIN products p ON p.id  = o.product_id
    GROUP BY c.id, c.name, c.city
    ORDER BY total_spent DESC
""")

print(f"\n{'Customer':<15} {'City':<12} {'Orders':>7} {'Total Spent':>13}")
print("-" * 52)
for row in cursor.fetchall():
    print(f"{row[0]:<15} {row[1]:<12} {row[2]:>7} ${row[3]:>12,.2f}")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Anti-Joins

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, amount REAL)")
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT)")

conn.executemany("INSERT INTO customers VALUES (?, ?)", [
    (1, "Alice"), (2, "Bob"), (3, "Carol"), (4, "Dave"), (5, "Eve"),
])
conn.executemany("INSERT INTO products VALUES (?, ?)", [
    (1, "Widget"), (2, "Gadget"), (3, "Tool"), (4, "Device"), (5, "Pack"),
])
conn.executemany("INSERT INTO orders VALUES (?, ?, ?, ?)", [
    (1,  1, 1, 150), (2, 2, 2, 220), (3, 1, 3, 90),
    (4,  3, 1, 310), (5, 2, 1, 75),  (6, 1, 2, 199),
    (7,  4, 3, 45),  (8, 3, 2, 180), (9, 2, 1, 95),
    (10, 1, 1, 125),
])
conn.commit()

# Anti-join 1: customers who have never ordered
print("Customers with no orders:")
cursor = conn.execute("""
    SELECT c.name FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    WHERE o.id IS NULL
""")
for row in cursor.fetchall():
    print(f"  {row[0]}")

# Anti-join 2: products that appear in at least 3 different orders
print("\nProducts in 3+ orders:")
cursor = conn.execute("""
    SELECT p.name, COUNT(o.id) AS order_count
    FROM products p
    INNER JOIN orders o ON p.id = o.product_id
    GROUP BY p.id, p.name
    HAVING order_count >= 3
    ORDER BY order_count DESC
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} orders")
```

#### Exercise 2: Self-Join with Manager Hierarchy

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE employees (
        id         INTEGER PRIMARY KEY,
        name       TEXT,
        department TEXT,
        manager_id INTEGER
    )
""")
conn.executemany("INSERT INTO employees VALUES (?, ?, ?, ?)", [
    (1, "Alice",   "Engineering", None),   # top-level
    (2, "Bob",     "Engineering", 1),
    (3, "Carol",   "Engineering", 1),
    (4, "Dave",    "HR",          None),   # top-level
    (5, "Eve",     "HR",          4),
    (6, "Frank",   "Marketing",   None),   # top-level
    (7, "Grace",   "Marketing",   6),
    (8, "Hank",    "Marketing",   6),
])
conn.commit()

# List each employee with their manager name and department
cursor = conn.execute("""
    SELECT
        e.name       AS employee,
        e.department,
        COALESCE(m.name, '— (top level)') AS manager
    FROM employees e
    LEFT JOIN employees m ON e.manager_id = m.id
    ORDER BY e.department, manager, e.name
""")

print(f"{'Employee':<12} {'Department':<15} {'Manager':<15}")
print("-" * 44)
for row in cursor.fetchall():
    print(f"{row[0]:<12} {row[1]:<15} {row[2]:<15}")
```

---

<PracticeBlock
  prompt="Create customers, products, and orders tables (use simple schemas). Insert 4 customers, 4 products, and 8 orders. Write a LEFT JOIN query that shows every product and its total revenue (quantity * price). Include products with zero orders, showing 0 for their revenue."
  initialCode={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\n\n# Create tables\n\n# Insert data\n\n# LEFT JOIN query: all products + total revenue\n`}
  hint="Use products LEFT JOIN orders ON products.id = orders.product_id. Use COALESCE(SUM(...), 0) to convert NULL to 0. GROUP BY product."
  solution={`import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, unit_price REAL)")\nconn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, product_id INTEGER, quantity INTEGER)")\nconn.executemany("INSERT INTO products VALUES (?, ?, ?)", [\n    (1, "Widget", 25.00),\n    (2, "Gadget", 50.00),\n    (3, "Tool",   35.00),\n    (4, "Pack",    9.99),  # no orders\n])\nconn.executemany("INSERT INTO orders VALUES (?, ?, ?)", [\n    (1, 1, 3), (2, 2, 1), (3, 1, 2), (4, 3, 4),\n    (5, 2, 2), (6, 1, 1), (7, 3, 1), (8, 2, 3),\n])\nconn.commit()\n\ncursor = conn.execute("""\n    SELECT\n        p.name,\n        p.unit_price,\n        COUNT(o.id) AS order_count,\n        ROUND(COALESCE(SUM(o.quantity * p.unit_price), 0), 2) AS total_revenue\n    FROM products p\n    LEFT JOIN orders o ON p.id = o.product_id\n    GROUP BY p.id, p.name, p.unit_price\n    ORDER BY total_revenue DESC\n""")\n\nprint(f"{'Product':<10} {'Price':>8} {'Orders':>8} {'Revenue':>12}")\nprint("-" * 42)\nfor name, price, orders, revenue in cursor.fetchall():\n    print(f"{name:<10} ${price:>7.2f} {orders:>8} ${revenue:>11,.2f}")`}
/>

---

## Key Takeaways

- `INNER JOIN` returns only rows with matches in **both** tables — unmatched rows are excluded
- `LEFT JOIN` returns **all** rows from the left table; right-side columns are NULL where no match exists
- Table aliases (`FROM orders o`) shorten query syntax and are required when joining a table to itself (self-join)
- Anti-join pattern: `LEFT JOIN ... WHERE right_table.id IS NULL` finds rows with no match in the right table
- Column name conflicts in multi-table queries are resolved with `table_alias.column_name` notation

---

## Common Mistakes to Avoid

- **Forgetting the ON condition**: `FROM orders JOIN customers` without an `ON` clause produces a cartesian product (every row × every row) — typically catastrophic
- **Using WHERE instead of LEFT JOIN for "include zeros"**: `WHERE o.id = p.id` excludes products with no orders; `LEFT JOIN ... ON p.id = o.product_id` includes them
- **Ambiguous column names without aliases**: when two tables have a column with the same name (e.g., `id`), always use `table.column` or an alias to specify which one

---

[← Previous](./lesson-04-sql-aggregations.md) | [Back to Course](./README.md) | [Next →](./lesson-06-pandas-read-sql.md)
