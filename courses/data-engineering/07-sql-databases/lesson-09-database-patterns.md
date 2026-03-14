# Lesson 9: Database Patterns for Data Engineers

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Use `CREATE TABLE IF NOT EXISTS` for idempotent schema management
- Implement upsert using `INSERT OR REPLACE` (SQLite) and the pandas combine approach
- Design staging → production table loading patterns
- Use SQL views for reusable query definitions

---

## Prerequisites

- Lesson 8: SQLAlchemy Basics
- Lesson 7: Writing DataFrames to SQL Tables

---

## Lesson Outline

### Part 1: Idempotent Schema Management (30 minutes)

#### The Problem: Re-running Schema Creation

Data pipelines run repeatedly. If your pipeline's setup step uses `CREATE TABLE` without safety checks, it will fail on the second run because the table already exists. **Idempotent** schema management means: running the same setup code multiple times produces the same result — no errors, no data loss.

```python
import sqlite3

conn = sqlite3.connect(":memory:")

# BAD: fails on second run
# conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT)")
# conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT)")  # OperationalError!

# GOOD: CREATE TABLE IF NOT EXISTS — safe to re-run
def create_schema(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id      INTEGER PRIMARY KEY,
            name    TEXT NOT NULL,
            email   TEXT UNIQUE,
            city    TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id         INTEGER PRIMARY KEY,
            name       TEXT NOT NULL,
            category   TEXT,
            unit_price REAL CHECK(unit_price > 0)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id          INTEGER PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(id),
            product_id  INTEGER REFERENCES products(id),
            quantity    INTEGER CHECK(quantity > 0),
            order_date  TEXT
        )
    """)
    conn.commit()
    print("Schema created (or already exists)")

# Safe to call multiple times
create_schema(conn)
create_schema(conn)  # no error
create_schema(conn)  # still no error
print("Called create_schema 3 times — no errors")
```

#### DROP + CREATE for Full Schema Reset

```python
def reset_schema(conn):
    """
    Drops all tables and recreates them.
    Use for development/test environments — NEVER in production without a backup.
    """
    # Drop in reverse dependency order (child tables first)
    conn.execute("DROP TABLE IF EXISTS orders")
    conn.execute("DROP TABLE IF EXISTS products")
    conn.execute("DROP TABLE IF EXISTS customers")
    conn.commit()

    # Recreate
    create_schema(conn)
    print("Schema reset complete")

reset_schema(conn)
```

#### Schema Version Table

For pipelines that evolve over time, track applied migrations with a schema_version table:

```python
import sqlite3

conn = sqlite3.connect(":memory:")

def setup_versioning(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version     INTEGER PRIMARY KEY,
            description TEXT,
            applied_at  TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()

def apply_migration(conn, version: int, description: str, sql: str):
    """Apply a migration if it hasn't been applied yet."""
    existing = conn.execute(
        "SELECT 1 FROM schema_migrations WHERE version = ?", (version,)
    ).fetchone()

    if existing:
        print(f"Migration {version} already applied — skipping")
        return

    conn.execute(sql)
    conn.execute(
        "INSERT INTO schema_migrations (version, description) VALUES (?, ?)",
        (version, description)
    )
    conn.commit()
    print(f"Applied migration {version}: {description}")


setup_versioning(conn)

# Run migrations idempotently
apply_migration(conn, 1, "create employees table",
    "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, salary REAL)")
apply_migration(conn, 2, "add department column",
    "ALTER TABLE employees ADD COLUMN department TEXT")

# Run again — safely skipped
apply_migration(conn, 1, "create employees table",
    "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, salary REAL)")
apply_migration(conn, 2, "add department column",
    "ALTER TABLE employees ADD COLUMN department TEXT")
```

---

### Part 2: Upsert Patterns (30 minutes)

#### What is an Upsert?

An **upsert** (update + insert) inserts a row if it does not exist, or updates it if it does — based on the primary key. This is the foundation of idempotent data loads.

#### INSERT OR REPLACE (SQLite)

SQLite provides `INSERT OR REPLACE INTO` which:
1. Tries to insert the row
2. If a PRIMARY KEY or UNIQUE constraint would be violated, deletes the conflicting row and inserts the new one

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE products (
        id         INTEGER PRIMARY KEY,
        name       TEXT NOT NULL,
        unit_price REAL,
        updated_at TEXT DEFAULT (datetime('now'))
    )
""")

# Initial data
conn.executemany("INSERT OR REPLACE INTO products (id, name, unit_price) VALUES (?, ?, ?)", [
    (1, "Widget A",   29.99),
    (2, "Gadget Pro", 149.99),
    (3, "Tool Kit",   49.99),
])
conn.commit()
print("Initial products:")
for row in conn.execute("SELECT id, name, unit_price FROM products").fetchall():
    print(f"  {row}")

# Upsert: update existing prices + add new products
upsert_data = [
    (1, "Widget A",   34.99),   # id 1: price changed
    (2, "Gadget Pro", 139.99),  # id 2: price changed
    (4, "Smart Pad",  199.99),  # id 4: new product
    (5, "Basic Pack",   9.99),  # id 5: new product
]
conn.executemany("INSERT OR REPLACE INTO products (id, name, unit_price) VALUES (?, ?, ?)", upsert_data)
conn.commit()

print("\nAfter upsert:")
for row in conn.execute("SELECT id, name, unit_price FROM products ORDER BY id").fetchall():
    print(f"  {row}")
```

#### INSERT OR IGNORE (skip duplicates)

```python
# INSERT OR IGNORE: insert new rows, silently skip if key already exists
conn.executemany("INSERT OR IGNORE INTO products (id, name, unit_price) VALUES (?, ?, ?)", [
    (1, "Widget A", 99.99),  # id 1 exists — this row is IGNORED
    (6, "New Item", 19.99),  # id 6 is new — this row is INSERTED
])
conn.commit()

row1 = conn.execute("SELECT unit_price FROM products WHERE id = 1").fetchone()
print(f"Widget A price (should still be 34.99): {row1[0]}")

row6 = conn.execute("SELECT name, unit_price FROM products WHERE id = 6").fetchone()
print(f"New Item (id 6): {row6}")
```

#### pandas Upsert (combine_first)

For complex upsert logic, use pandas to merge and write back:

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER)")
conn.executemany("INSERT INTO products VALUES (?, ?, ?, ?)", [
    (1, "Widget", 25.00, 100),
    (2, "Gadget", 50.00,  45),
    (3, "Tool",   35.00,  30),
])
conn.commit()

# New batch: update prices for 1 and 2, add new product 4
new_data = pd.DataFrame({
    "id":    [1, 2, 4],
    "name":  ["Widget", "Gadget", "Device"],
    "price": [27.00, 55.00, 199.00],
    "stock": [None, None, 15],    # None = don't update existing stock
})

# Read existing, merge, write back
existing = pd.read_sql("SELECT * FROM products", conn)

# Set id as index for combine_first
existing_idx = existing.set_index("id")
new_idx = new_data.set_index("id")

# combine_first: new values take precedence, existing fills gaps
merged = new_idx.combine_first(existing_idx).reset_index()
merged["id"] = merged["id"].astype(int)
merged["stock"] = merged["stock"].fillna(0).astype(int)

merged.to_sql("products", conn, if_exists="replace", index=False)

print("After pandas upsert:")
print(pd.read_sql("SELECT * FROM products ORDER BY id", conn))
```

---

### Part 3: Staging Tables (30 minutes)

#### The Staging Pattern

**Staging tables** hold raw, unvalidated data that has been extracted but not yet transformed. The pipeline:

1. Load raw data → `stg_tablename` (staging)
2. Transform + validate in SQL
3. Promote clean data → `tablename` (production)
4. Truncate staging

Benefits:
- Re-transform without re-extracting (staging retains raw data)
- Clear audit trail of what was ingested
- Transformation failures do not corrupt production table

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")

# Create staging and production tables
conn.execute("""
    CREATE TABLE IF NOT EXISTS stg_transactions (
        raw_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id  INTEGER,
        amount_str   TEXT,    -- raw string from source, may have '$' or commas
        txn_date     TEXT,
        loaded_at    TEXT DEFAULT (datetime('now'))
    )
""")

conn.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id          INTEGER PRIMARY KEY,
        customer_id INTEGER,
        amount      REAL,
        txn_date    TEXT,
        processed_at TEXT DEFAULT (datetime('now'))
    )
""")
conn.commit()

# EXTRACT: simulate raw data from an external source (amounts have $ signs)
raw_data = pd.DataFrame({
    "customer_id": [1, 2, 3, 1, 2],
    "amount_str":  ["$150.00", "$220.50", "$89.99", "$310.00", "$75.00"],
    "txn_date":    ["2024-01-10", "2024-01-12", "2024-01-15", "2024-01-18", "2024-01-20"],
})

# LOAD to staging (raw)
raw_data.to_sql("stg_transactions", conn, if_exists="append", index=False)
stg_count = pd.read_sql("SELECT COUNT(*) AS n FROM stg_transactions", conn).iloc[0, 0]
print(f"Loaded {stg_count} rows to staging")

# TRANSFORM: clean amount_str → amount REAL in Python, then load to production
stg_df = pd.read_sql("SELECT raw_id, customer_id, amount_str, txn_date FROM stg_transactions", conn)
stg_df["amount"] = stg_df["amount_str"].str.replace("$", "", regex=False).astype(float)

prod_df = stg_df[["raw_id", "customer_id", "amount", "txn_date"]].rename(columns={"raw_id": "id"})
prod_df.to_sql("transactions", conn, if_exists="replace", index=False)

# TRUNCATE staging (DELETE = truncate in SQLite)
conn.execute("DELETE FROM stg_transactions")
conn.commit()

print("\nProduction transactions:")
print(pd.read_sql("SELECT * FROM transactions ORDER BY id", conn))

stg_remaining = pd.read_sql("SELECT COUNT(*) AS n FROM stg_transactions", conn).iloc[0, 0]
print(f"\nStaging rows after truncate: {stg_remaining}")  # 0
```

#### Batch ID for Load Tracking

```python
import sqlite3
import pandas as pd
from datetime import datetime

conn = sqlite3.connect(":memory:")

conn.execute("""
    CREATE TABLE IF NOT EXISTS stg_sales (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        rep      TEXT,
        amount   REAL,
        batch_id TEXT,  -- identifies which pipeline run loaded this row
        loaded_at TEXT DEFAULT (datetime('now'))
    )
""")
conn.commit()

def load_batch(conn, data: pd.DataFrame, batch_id: str):
    """Load a batch of sales data to staging with a batch identifier."""
    data = data.copy()
    data["batch_id"] = batch_id
    data.to_sql("stg_sales", conn, if_exists="append", index=False)
    count = pd.read_sql(f"SELECT COUNT(*) AS n FROM stg_sales WHERE batch_id = ?",
                        conn, params=[batch_id]).iloc[0, 0]
    print(f"Batch '{batch_id}': loaded {count} rows")

# Simulate two pipeline runs
batch1 = pd.DataFrame({"rep": ["Alice", "Bob"], "amount": [15000, 22000]})
batch2 = pd.DataFrame({"rep": ["Carol", "Dave", "Eve"], "amount": [18000, 8000, 31000]})

load_batch(conn, batch1, batch_id="2024-01-batch-1")
load_batch(conn, batch2, batch_id="2024-01-batch-2")

print("\nAll staging rows with batch IDs:")
print(pd.read_sql("SELECT batch_id, rep, amount FROM stg_sales ORDER BY id", conn))
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Idempotent setup_schema()

```python
import sqlite3

def setup_schema(conn):
    """
    Create all tables for a sales system.
    Safe to call multiple times — uses IF NOT EXISTS.
    """
    conn.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE,
            city        TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            product_id  INTEGER PRIMARY KEY,
            name        TEXT NOT NULL,
            category    TEXT,
            unit_price  REAL CHECK(unit_price > 0)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id    INTEGER PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(customer_id),
            product_id  INTEGER REFERENCES products(product_id),
            quantity    INTEGER CHECK(quantity > 0),
            order_date  TEXT
        )
    """)
    conn.commit()
    print("Schema ready")


conn = sqlite3.connect(":memory:")

# Call 3 times — must not raise any errors
for i in range(1, 4):
    setup_schema(conn)
    print(f"  Call {i} succeeded")

# Verify tables exist
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
print(f"\nTables created: {[t[0] for t in tables]}")
```

#### Exercise 2: upsert_products()

```python
import sqlite3
import pandas as pd

def upsert_products(conn, new_products_df: pd.DataFrame):
    """
    Upsert products into the products table using INSERT OR REPLACE.
    Expects DataFrame with columns: id, name, category, price.
    """
    rows = list(new_products_df.itertuples(index=False, name=None))
    conn.executemany(
        "INSERT OR REPLACE INTO products (id, name, category, price) VALUES (?, ?, ?, ?)",
        rows
    )
    conn.commit()
    print(f"Upserted {len(rows)} products")


# Setup
conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE products (
        id       INTEGER PRIMARY KEY,
        name     TEXT NOT NULL,
        category TEXT,
        price    REAL
    )
""")
conn.executemany("INSERT INTO products VALUES (?, ?, ?, ?)", [
    (1, "Widget A",  "Hardware",     25.00),
    (2, "Gadget Pro","Electronics", 149.99),
    (3, "Tool Kit",  "Hardware",     45.00),
])
conn.commit()
print("Initial state:")
print(pd.read_sql("SELECT * FROM products ORDER BY id", conn))

# Upsert: update existing (id 1, 2) + add new (id 4, 5)
new_products = pd.DataFrame({
    "id":       [1, 2, 4, 5],
    "name":     ["Widget A",   "Gadget Pro",   "Smart Pad",  "Basic Pack"],
    "category": ["Hardware",   "Electronics",  "Electronics","Accessories"],
    "price":    [29.99,        139.99,          199.00,        9.99],
})

upsert_products(conn, new_products)

print("\nAfter upsert:")
print(pd.read_sql("SELECT * FROM products ORDER BY id", conn))

# Verify: id 3 (not in upsert) still exists unchanged
row3 = pd.read_sql("SELECT * FROM products WHERE id = 3", conn)
print(f"\nProduct id=3 unchanged: {row3['name'].iloc[0]} at ${row3['price'].iloc[0]}")
```

---

<PracticeBlock
  prompt="Implement a `load_to_staging(conn, df, batch_id)` function that loads a DataFrame to a `stg_orders` table with an extra `batch_id` TEXT column. Then implement `promote_staging(conn)` that copies valid rows (amount > 0) from staging to `orders` production table and clears staging. Test with two batches."
  initialCode={`import sqlite3\nimport pandas as pd\n\nconn = sqlite3.connect(":memory:")\n\n# Create staging and production tables\nconn.execute("CREATE TABLE IF NOT EXISTS stg_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, amount REAL, order_date TEXT, batch_id TEXT)")\nconn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, amount REAL, order_date TEXT)")\nconn.commit()\n\ndef load_to_staging(conn, df, batch_id):\n    # Add batch_id column and write to stg_orders\n    pass\n\ndef promote_staging(conn):\n    # Copy valid rows to orders, clear staging\n    pass\n\n# Test data\nbatch1 = pd.DataFrame({"customer_id": [1, 2, 3], "amount": [150.0, 220.5, -10.0], "order_date": ["2024-01-10", "2024-01-11", "2024-01-12"]})\nbatch2 = pd.DataFrame({"customer_id": [4, 5],    "amount": [89.0,  310.0],          "order_date": ["2024-01-15", "2024-01-16"]})\n\nload_to_staging(conn, batch1, "run-001")\nload_to_staging(conn, batch2, "run-002")\npromote_staging(conn)\n\nprint("Orders (valid only):")\nprint(pd.read_sql("SELECT * FROM orders ORDER BY id", conn))\nprint("Staging rows remaining:", pd.read_sql("SELECT COUNT(*) AS n FROM stg_orders", conn).iloc[0, 0])\n`}
  hint="In load_to_staging: df.copy(), df['batch_id'] = batch_id, df.to_sql(stg_orders, append). In promote_staging: conn.execute INSERT INTO orders SELECT ... FROM stg_orders WHERE amount > 0, then DELETE FROM stg_orders."
  solution={`import sqlite3\nimport pandas as pd\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE IF NOT EXISTS stg_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, amount REAL, order_date TEXT, batch_id TEXT)")\nconn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, amount REAL, order_date TEXT)")\nconn.commit()\n\ndef load_to_staging(conn, df, batch_id):\n    staged = df.copy()\n    staged["batch_id"] = batch_id\n    staged.to_sql("stg_orders", conn, if_exists="append", index=False)\n    count = pd.read_sql(f"SELECT COUNT(*) AS n FROM stg_orders WHERE batch_id = ?", conn, params=[batch_id]).iloc[0, 0]\n    print(f"Loaded {count} rows to staging for batch '{batch_id}'")\n\ndef promote_staging(conn):\n    conn.execute("""\n        INSERT INTO orders (customer_id, amount, order_date)\n        SELECT customer_id, amount, order_date\n        FROM stg_orders\n        WHERE amount > 0\n    """)\n    conn.execute("DELETE FROM stg_orders")\n    conn.commit()\n    count = pd.read_sql("SELECT COUNT(*) AS n FROM orders", conn).iloc[0, 0]\n    print(f"Promoted {count} valid orders to production")\n\nbatch1 = pd.DataFrame({"customer_id": [1, 2, 3], "amount": [150.0, 220.5, -10.0], "order_date": ["2024-01-10", "2024-01-11", "2024-01-12"]})\nbatch2 = pd.DataFrame({"customer_id": [4, 5],    "amount": [89.0,  310.0],          "order_date": ["2024-01-15", "2024-01-16"]})\n\nload_to_staging(conn, batch1, "run-001")\nload_to_staging(conn, batch2, "run-002")\npromote_staging(conn)\n\nprint("\\nOrders (valid only):")\nprint(pd.read_sql("SELECT * FROM orders ORDER BY id", conn))\nprint("Staging rows remaining:", pd.read_sql("SELECT COUNT(*) AS n FROM stg_orders", conn).iloc[0, 0])`}
/>

---

## Key Takeaways

- `CREATE TABLE IF NOT EXISTS` makes schema setup idempotent — safe to re-run without errors or data loss
- `INSERT OR REPLACE INTO` (SQLite) upserts a row: inserts if no conflict, replaces (delete + insert) if the primary key already exists
- `INSERT OR IGNORE INTO` (SQLite) inserts new rows only — silently skips rows where the key already exists
- Staging tables (`stg_tablename`) hold raw data before transformation, providing an audit trail and the ability to re-transform without re-extracting
- Adding a `batch_id` column to staging enables tracing exactly which pipeline run loaded each row

---

## Common Mistakes to Avoid

- **Using `INSERT OR REPLACE` when you only want to update specific columns**: `INSERT OR REPLACE` deletes the existing row entirely before inserting — any columns not in the new row revert to defaults. For partial updates, use a manual `UPDATE ... WHERE` instead.
- **Forgetting to truncate staging after promotion**: if you skip the `DELETE FROM stg_*` step, the next pipeline run will duplicate data in the production table
- **Running `DROP TABLE IF EXISTS` in production**: this destroys all data. Reserve schema resets for development environments only.

---

[← Previous](./lesson-08-sqlalchemy-basics.md) | [Back to Course](./README.md) | [Next →](./lesson-10-sql-project.md)
