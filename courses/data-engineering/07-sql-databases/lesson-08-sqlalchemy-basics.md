# Lesson 8: SQLAlchemy — Database-Agnostic Connections

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand why SQLAlchemy is used in data engineering
- Create a database engine with `create_engine()`
- Execute raw SQL using `text()` and the connection context manager
- Use a SQLAlchemy engine as the connection for `pd.read_sql()` and `df.to_sql()`

---

## Prerequisites

- Lesson 7: Writing DataFrames to SQL Tables
- Lesson 6: Reading SQL Query Results into DataFrames

---

## Lesson Outline

### Part 1: Why SQLAlchemy? (30 minutes)

#### The Problem with Driver-Specific Code

The `sqlite3` module is SQLite-only. When your pipeline graduates from SQLite to PostgreSQL, you would need to rewrite every database interaction: the connection API, parameter syntax (`?` vs `%s` vs `:name`), and type handling all differ by driver.

SQLAlchemy solves this by providing a **unified interface** across all major databases:

| Database | Connection String |
|---|---|
| SQLite (in-memory) | `"sqlite:///:memory:"` |
| SQLite (file) | `"sqlite:///data.db"` |
| PostgreSQL | `"postgresql://user:pass@host:5432/dbname"` |
| MySQL | `"mysql+pymysql://user:pass@host/dbname"` |
| SQL Server | `"mssql+pyodbc://user:pass@server/dbname"` |
| BigQuery | `"bigquery://project/dataset"` |

Changing database requires changing **only the connection string**. All Python code stays the same.

#### Creating an Engine

```python
from sqlalchemy import create_engine

# SQLite in-memory — works in-browser (Pyodide)
engine = create_engine("sqlite:///:memory:", echo=False)

print(type(engine))  # <class 'sqlalchemy.engine.base.Engine'>
print(engine.dialect.name)  # sqlite

# echo=True logs every SQL statement SQLAlchemy generates — useful for debugging
# engine_debug = create_engine("sqlite:///:memory:", echo=True)
```

The engine manages a **connection pool** — it reuses connections instead of creating a new one per query. For SQLite `:memory:` the pool holds a single connection.

#### Verifying the Connection

```python
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///:memory:", echo=False)

# Connect and run a simple test query
with engine.connect() as conn:
    result = conn.execute(text("SELECT 1 AS alive"))
    row = result.fetchone()
    print(f"Connection alive: {row[0] == 1}")
    print(f"Dialect: {engine.dialect.name}")
```

---

### Part 2: Executing Raw SQL with SQLAlchemy (30 minutes)

#### text() for All SQL Statements

SQLAlchemy requires wrapping SQL strings in `text()` for type-safe execution. The `text()` function enables named parameter binding (`:param_name` syntax, consistent across all databases):

```python
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///:memory:", echo=False)

# Create table
with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE employees (
            id         INTEGER PRIMARY KEY,
            name       TEXT NOT NULL,
            department TEXT,
            salary     REAL,
            hire_date  TEXT
        )
    """))
print("Table created")
```

```python
# INSERT with named parameters — :param_name syntax works on ALL database dialects
with engine.begin() as conn:
    conn.execute(text("""
        INSERT INTO employees (id, name, department, salary, hire_date)
        VALUES (:id, :name, :dept, :salary, :date)
    """), {
        "id": 1, "name": "Alice", "dept": "Engineering",
        "salary": 90000, "date": "2022-01-15"
    })
    print("One row inserted")
```

```python
# Insert multiple rows using a list of dicts
employee_data = [
    {"id": 2,  "name": "Bob",   "dept": "Marketing",   "salary": 65000, "date": "2023-03-01"},
    {"id": 3,  "name": "Carol", "dept": "Engineering", "salary": 85000, "date": "2021-06-01"},
    {"id": 4,  "name": "Dave",  "dept": "HR",          "salary": 55000, "date": "2020-11-15"},
    {"id": 5,  "name": "Eve",   "dept": "Engineering", "salary": 95000, "date": "2019-08-20"},
    {"id": 6,  "name": "Frank", "dept": "Marketing",   "salary": 70000, "date": "2022-07-10"},
    {"id": 7,  "name": "Grace", "dept": "Data",        "salary": 88000, "date": "2021-03-05"},
    {"id": 8,  "name": "Hank",  "dept": "HR",          "salary": 52000, "date": "2023-01-20"},
    {"id": 9,  "name": "Ivy",   "dept": "Data",        "salary": 92000, "date": "2020-09-30"},
    {"id": 10, "name": "Jack",  "dept": "Engineering", "salary": 78000, "date": "2022-12-01"},
]

with engine.begin() as conn:
    conn.execute(
        text("INSERT INTO employees (id, name, department, salary, hire_date) VALUES (:id, :name, :dept, :salary, :date)"),
        employee_data  # pass list of dicts for bulk insert
    )
    print(f"Inserted {len(employee_data)} rows")
```

#### engine.begin() vs engine.connect()

```python
# engine.begin() — auto-commits on exit, auto-rollbacks on exception
# Use for write operations (INSERT, UPDATE, DELETE, CREATE)
with engine.begin() as conn:
    conn.execute(text("UPDATE employees SET salary = salary * 1.05 WHERE department = 'Engineering'"))
    # commits automatically when the with block exits normally
    # rolls back automatically if an exception is raised
print("Engineering salaries updated by 5%")

# engine.connect() — does NOT auto-commit; requires explicit conn.commit()
# Use when you need fine-grained transaction control or for read-only queries
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM employees"))
    print(f"Total employees: {result.scalar()}")
    # No commit needed for SELECT
```

#### Querying with Named Parameters

```python
# SELECT with named parameter — safe for user-provided values
with engine.connect() as conn:
    result = conn.execute(
        text("SELECT name, salary FROM employees WHERE department = :dept ORDER BY salary DESC"),
        {"dept": "Engineering"}
    )
    rows = result.fetchall()
    print("Engineering employees:")
    for name, salary in rows:
        print(f"  {name}: ${salary:,.0f}")
```

---

### Part 3: SQLAlchemy + pandas Integration (30 minutes)

#### pd.read_sql() with SQLAlchemy Engine

`pd.read_sql()` accepts either a raw `sqlite3` connection or a SQLAlchemy engine/connection. SQLAlchemy is preferred for:
- The `dtype` parameter in `to_sql()`
- `pd.read_sql_table()` (requires SQLAlchemy)
- Consistent behavior across all database backends

```python
import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///:memory:", echo=False)

# Setup: create and populate table
with engine.begin() as conn:
    conn.execute(text("CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary REAL, hire_date TEXT)"))
    conn.execute(text("INSERT INTO employees VALUES (:id, :name, :dept, :salary, :date)"), [
        {"id": 1, "name": "Alice",  "dept": "Engineering", "salary": 90000, "date": "2022-01-15"},
        {"id": 2, "name": "Bob",    "dept": "Marketing",   "salary": 65000, "date": "2023-03-01"},
        {"id": 3, "name": "Carol",  "dept": "Engineering", "salary": 85000, "date": "2021-06-01"},
        {"id": 4, "name": "Dave",   "dept": "HR",          "salary": 55000, "date": "2020-11-15"},
        {"id": 5, "name": "Eve",    "dept": "Engineering", "salary": 95000, "date": "2019-08-20"},
    ])

# pd.read_sql() with engine (SQL string form)
df = pd.read_sql("SELECT * FROM employees ORDER BY salary DESC", engine)
print("read_sql with engine:")
print(df)
```

```python
# pd.read_sql() with text() + named params via engine.connect()
with engine.connect() as conn:
    df_eng = pd.read_sql(
        text("SELECT name, salary FROM employees WHERE department = :dept"),
        conn,
        params={"dept": "Engineering"}
    )
print("\nEngineering employees via text():")
print(df_eng)
```

#### df.to_sql() with SQLAlchemy Engine

```python
import pandas as pd
from sqlalchemy import create_engine, Integer, Text, Float

engine = create_engine("sqlite:///:memory:", echo=False)

products = pd.DataFrame({
    "product_id": [101, 102, 103, 104, 105],
    "name":       ["Widget A", "Gadget Pro", "Tool Kit", "Smart Device", "Basic Pack"],
    "category":   ["Hardware", "Electronics", "Hardware", "Electronics", "Accessories"],
    "unit_price":  [29.99, 149.99, 49.99, 299.99, 9.99],
})

# to_sql() with SQLAlchemy engine — supports dtype parameter
products.to_sql(
    "products",
    engine,
    if_exists="replace",
    index=False,
    dtype={
        "product_id": Integer(),
        "name":       Text(),
        "category":   Text(),
        "unit_price":  Float(),
    }
)
print(f"Wrote {len(products)} products")

# Read back with a JOIN query using engine
orders = pd.DataFrame({
    "order_id":   [1, 2, 3, 4, 5],
    "product_id": [101, 102, 101, 103, 104],
    "quantity":   [2, 1, 3, 2, 1],
})
orders.to_sql("orders", engine, if_exists="replace", index=False)

# Full round-trip: to_sql then read_sql with JOIN
df_result = pd.read_sql("""
    SELECT
        o.order_id,
        p.name,
        p.category,
        o.quantity,
        ROUND(o.quantity * p.unit_price, 2) AS line_total
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    ORDER BY line_total DESC
""", engine)
print("\nOrder details:")
print(df_result)
```

#### pd.read_sql_table()

`pd.read_sql_table()` reads an entire table without writing a SELECT — it requires a SQLAlchemy engine:

```python
# Read entire products table without writing SQL
df_products = pd.read_sql_table("products", engine)
print("\nAll products via read_sql_table:")
print(df_products)
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Refactor sqlite3 to SQLAlchemy

```python
import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine("sqlite:///:memory:", echo=False)

# Create schema and insert seed data using SQLAlchemy
with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE products (
            id        INTEGER PRIMARY KEY,
            name      TEXT NOT NULL,
            category  TEXT,
            price     REAL,
            stock_qty INTEGER
        )
    """))
    conn.execute(text("INSERT INTO products VALUES (:id, :name, :cat, :price, :stock)"), [
        {"id": 1, "name": "Widget A",    "cat": "Hardware",     "price": 29.99, "stock": 150},
        {"id": 2, "name": "Gadget Pro",  "cat": "Electronics", "price": 149.99, "stock": 45},
        {"id": 3, "name": "Tool Kit",    "cat": "Hardware",     "price": 49.99, "stock": 30},
        {"id": 4, "name": "Smart Device","cat": "Electronics", "price": 299.99, "stock": 12},
        {"id": 5, "name": "Basic Pack",  "cat": "Accessories",  "price": 9.99, "stock": 200},
    ])

# Query using named parameter
category = "Electronics"
df = pd.read_sql(
    text("SELECT name, price, stock_qty FROM products WHERE category = :cat ORDER BY price DESC"),
    engine.connect(),
    params={"cat": category}
)
print(f"Electronics products:")
print(df)
```

#### Exercise 2: database_summary() Function

```python
import pandas as pd
from sqlalchemy import create_engine, text

def database_summary(engine) -> pd.DataFrame:
    """
    Returns a DataFrame with one row per table:
    table_name, row_count, column_count.
    Works on any SQLAlchemy engine.
    """
    # Get list of user tables
    with engine.connect() as conn:
        tables_result = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        )
        table_names = [row[0] for row in tables_result.fetchall()]

    # For each table, get row count and column count
    rows = []
    for table_name in table_names:
        with engine.connect() as conn:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
            # PRAGMA table_info returns one row per column
            col_info = conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
            col_count = len(col_info)
        rows.append({"table_name": table_name, "row_count": count, "column_count": col_count})

    return pd.DataFrame(rows)


# Test with a multi-table database
engine = create_engine("sqlite:///:memory:", echo=False)

customers = pd.DataFrame({"id": [1, 2, 3], "name": ["Alice", "Bob", "Carol"]})
products  = pd.DataFrame({"id": [1, 2],    "name": ["Widget", "Gadget"], "price": [29.99, 149.99]})
orders    = pd.DataFrame({"id": [1, 2, 3, 4, 5], "customer_id": [1, 1, 2, 3, 1], "product_id": [1, 2, 1, 2, 1]})

customers.to_sql("customers", engine, if_exists="replace", index=False)
products.to_sql("products",   engine, if_exists="replace", index=False)
orders.to_sql("orders",       engine, if_exists="replace", index=False)

summary = database_summary(engine)
print("Database summary:")
print(summary)
```

---

<PracticeBlock
  prompt="Create a SQLAlchemy engine for an in-memory SQLite database. Use engine.begin() and text() to create a 'sales' table (id, rep, region, amount, closed_date). Insert 5 rows. Then use pd.read_sql() with the engine to read the table into a DataFrame and compute total revenue per region."
  initialCode={`from sqlalchemy import create_engine, text\nimport pandas as pd\n\nengine = create_engine("sqlite:///:memory:", echo=False)\n\n# Step 1: Create table and insert 5 rows using engine.begin() + text()\n\n# Step 2: Read with pd.read_sql()\n\n# Step 3: Compute total revenue per region using pandas\n`}
  hint="Use engine.begin() as conn: conn.execute(text('CREATE TABLE ...')). Then conn.execute(text('INSERT...'), list_of_dicts). Finally pd.read_sql('SELECT ...', engine).groupby('region')['amount'].sum()."
  solution={`from sqlalchemy import create_engine, text\nimport pandas as pd\n\nengine = create_engine("sqlite:///:memory:", echo=False)\n\n# Step 1: Create table and insert 5 rows\nwith engine.begin() as conn:\n    conn.execute(text("""\n        CREATE TABLE sales (\n            id          INTEGER PRIMARY KEY,\n            rep         TEXT,\n            region      TEXT,\n            amount      REAL,\n            closed_date TEXT\n        )\n    """))\n    conn.execute(text("INSERT INTO sales VALUES (:id, :rep, :region, :amount, :date)"), [\n        {"id": 1, "rep": "Alice",  "region": "West",  "amount": 15000, "date": "2024-01-10"},\n        {"id": 2, "rep": "Bob",    "region": "East",  "amount": 22000, "date": "2024-01-15"},\n        {"id": 3, "rep": "Carol",  "region": "West",  "amount": 18000, "date": "2024-02-01"},\n        {"id": 4, "rep": "Dave",   "region": "North", "amount":  8000, "date": "2024-02-10"},\n        {"id": 5, "rep": "Eve",    "region": "East",  "amount": 31000, "date": "2024-02-20"},\n    ])\n    print("Table created and 5 rows inserted")\n\n# Step 2: Read with pd.read_sql()\ndf = pd.read_sql("SELECT * FROM sales ORDER BY amount DESC", engine)\nprint("\\nAll sales:")\nprint(df)\n\n# Step 3: Total revenue per region\nregion_totals = df.groupby("region")["amount"].sum().sort_values(ascending=False)\nprint("\\nRevenue by region:")\nprint(region_totals)`}
/>

---

## Key Takeaways

- `create_engine("sqlite:///:memory:")` creates a connection-pooled engine — changing the connection string is all that's needed to switch databases
- Always wrap SQL strings in `text()` when using SQLAlchemy: `conn.execute(text("SELECT ..."))`
- Use `:param_name` placeholders with a `dict` for named parameters — works consistently across all database dialects
- `engine.begin()` auto-commits on success and auto-rollbacks on exception — use for all write operations
- Use a SQLAlchemy engine (not raw sqlite3 connection) with pandas for full feature support: `dtype` in `to_sql()`, `pd.read_sql_table()`, and cross-database portability

---

## Common Mistakes to Avoid

- **Forgetting `text()`**: calling `conn.execute("SELECT ...")` without `text()` raises a deprecation warning in SQLAlchemy 2.x and will fail in future versions
- **Mixing sqlite3 and SQLAlchemy connections**: pass either a raw `sqlite3.Connection` or a SQLAlchemy engine/connection to pandas — not one in place of the other
- **Using `engine.connect()` for writes without explicit commit**: `engine.connect()` does not auto-commit; use `engine.begin()` for INSERT/UPDATE/DELETE

---

[← Previous](./lesson-07-pandas-to-sql.md) | [Back to Course](./README.md) | [Next →](./lesson-09-database-patterns.md)
