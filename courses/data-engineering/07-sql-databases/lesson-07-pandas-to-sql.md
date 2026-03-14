# Lesson 7: Writing DataFrames to SQL Tables

**Course:** SQL & Databases | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Use `df.to_sql()` to write a DataFrame to a database table
- Control schema creation with `if_exists` and `dtype` parameters
- Write large DataFrames in chunks using `chunksize`
- Verify writes with a read-back query

---

## Prerequisites

- Lesson 6: Reading SQL Query Results into DataFrames
- Section 2: Pandas Fundamentals (DataFrame creation and manipulation)

---

## Lesson Outline

### Part 1: df.to_sql() Basics (30 minutes)

#### Writing a DataFrame to SQLite

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")

# Create a DataFrame of employee data
employees = pd.DataFrame({
    "name":       ["Alice", "Bob", "Carol", "Dave", "Eve",
                   "Frank", "Grace", "Hank", "Ivy", "Jack"],
    "department": ["Engineering", "Marketing", "Engineering", "HR", "Engineering",
                   "Marketing", "Data", "HR", "Data", "Engineering"],
    "salary":     [90000, 65000, 85000, 55000, 95000,
                   70000, 88000, 52000, 92000, 78000],
    "hire_date":  ["2022-01-15", "2023-03-01", "2021-06-01", "2020-11-15", "2019-08-20",
                   "2022-07-10", "2021-03-05", "2023-01-20", "2020-09-30", "2022-12-01"],
})

# Write DataFrame to SQL table
employees.to_sql(
    "employees",    # table name
    conn,           # connection
    if_exists="replace",  # what to do if table exists
    index=False     # don't write the pandas RangeIndex as a column
)
print(f"Wrote {len(employees)} rows to 'employees' table")

# Verify with a read-back query
count_df = pd.read_sql("SELECT COUNT(*) AS n FROM employees", conn)
print(f"Rows in DB: {count_df['n'].iloc[0]}")
```

#### The if_exists Parameter

| Value | Behavior |
|---|---|
| `"fail"` | Raise `ValueError` if the table already exists (default) |
| `"replace"` | Drop the existing table and create a new one with current data |
| `"append"` | Add rows to the existing table (schema must match) |

```python
# Demonstrate if_exists options
df_batch1 = pd.DataFrame({"id": [1, 2, 3], "value": [10, 20, 30]})
df_batch2 = pd.DataFrame({"id": [4, 5],    "value": [40, 50]})

# First write — creates the table
df_batch1.to_sql("test_table", conn, if_exists="replace", index=False)
count = pd.read_sql("SELECT COUNT(*) AS n FROM test_table", conn).iloc[0, 0]
print(f"After replace: {count} rows")  # 3

# Append more rows
df_batch2.to_sql("test_table", conn, if_exists="append", index=False)
count = pd.read_sql("SELECT COUNT(*) AS n FROM test_table", conn).iloc[0, 0]
print(f"After append: {count} rows")   # 5

# Replace (full reload)
df_batch1.to_sql("test_table", conn, if_exists="replace", index=False)
count = pd.read_sql("SELECT COUNT(*) AS n FROM test_table", conn).iloc[0, 0]
print(f"After second replace: {count} rows")  # 3 again
```

#### Why index=False

```python
# With index=True (default): pandas RangeIndex becomes a column named "index"
employees.to_sql("emp_with_idx", conn, if_exists="replace", index=True)
cols_with_idx = pd.read_sql("SELECT * FROM emp_with_idx LIMIT 1", conn).columns.tolist()
print("Columns with index=True:", cols_with_idx)
# ['index', 'name', 'department', 'salary', 'hire_date']

# With index=False: no extra column
employees.to_sql("emp_no_idx", conn, if_exists="replace", index=False)
cols_no_idx = pd.read_sql("SELECT * FROM emp_no_idx LIMIT 1", conn).columns.tolist()
print("Columns with index=False:", cols_no_idx)
# ['name', 'department', 'salary', 'hire_date']
```

---

### Part 2: Schema Control (30 minutes)

#### How to_sql() Infers Types

pandas maps its dtypes to SQL types automatically:

| pandas dtype | SQLite type | SQLAlchemy type |
|---|---|---|
| `int64` | INTEGER | Integer() |
| `float64` | REAL | Float() |
| `object` (str) | TEXT | Text() |
| `bool` | INTEGER (0/1) | Boolean() |
| `datetime64` | TEXT (ISO string) | DateTime() |

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")

df = pd.DataFrame({
    "id":         [1, 2, 3],
    "name":       ["Alice", "Bob", "Carol"],
    "salary":     [90000.0, 65000.0, 85000.0],
    "is_active":  [True, True, False],
})

df.to_sql("typed_table", conn, if_exists="replace", index=False)

# Inspect inferred types via sqlite_master
cursor = conn.execute("SELECT sql FROM sqlite_master WHERE name = 'typed_table'")
print("Inferred CREATE TABLE statement:")
print(cursor.fetchone()[0])
```

#### Pre-Create Table with Constraints

For production use, define the schema explicitly before writing data. Use `if_exists="append"` to add data to a pre-created table:

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")

# Pre-create with constraints — pandas cannot add constraints via to_sql()
conn.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        department TEXT NOT NULL,
        salary     REAL CHECK(salary > 0),
        hire_date  TEXT
    )
""")
conn.commit()

# Write with if_exists="append" — respects existing schema and constraints
employees = pd.DataFrame({
    "name":       ["Alice", "Bob", "Carol"],
    "department": ["Engineering", "Marketing", "Engineering"],
    "salary":     [90000.0, 65000.0, 85000.0],
    "hire_date":  ["2022-01-15", "2023-03-01", "2021-06-01"],
})

employees.to_sql("employees", conn, if_exists="append", index=False)
count = pd.read_sql("SELECT COUNT(*) AS n FROM employees", conn).iloc[0, 0]
print(f"Rows loaded: {count}")
```

#### Using dtype Parameter with SQLAlchemy

The `dtype` parameter for explicit type control requires a SQLAlchemy connection:

```python
import pandas as pd
from sqlalchemy import create_engine, Integer, Text, Float

engine = create_engine("sqlite:///:memory:", echo=False)

df = pd.DataFrame({
    "id":     [1, 2, 3],
    "name":   ["Alice", "Bob", "Carol"],
    "salary": [90000.0, 65000.0, 85000.0],
})

# Explicit type mapping via dtype parameter
df.to_sql(
    "employees",
    engine,
    if_exists="replace",
    index=False,
    dtype={
        "id":     Integer(),
        "name":   Text(),
        "salary": Float(),
    }
)

# Verify types
with engine.connect() as conn:
    import pandas as pd
    result = pd.read_sql("SELECT sql FROM sqlite_master WHERE name = 'employees'", conn)
    print(result.iloc[0, 0])
```

---

### Part 3: Writing Large DataFrames (30 minutes)

#### chunksize for Large Writes

```python
import sqlite3
import pandas as pd
import numpy as np

conn = sqlite3.connect(":memory:")

# Simulate a 1000-row DataFrame
large_df = pd.DataFrame({
    "id":      range(1, 1001),
    "name":    [f"Employee_{i}" for i in range(1, 1001)],
    "salary":  np.random.uniform(50000, 120000, 1000).round(2),
    "dept":    np.random.choice(["Engineering", "Marketing", "HR", "Data"], 1000),
})

# Write in chunks of 333 rows
large_df.to_sql(
    "large_employees",
    conn,
    if_exists="replace",
    index=False,
    chunksize=333,   # write 333 rows per INSERT batch
    method="multi",  # use multi-row INSERT statements (faster)
)

# Verify total count
count = pd.read_sql("SELECT COUNT(*) AS n FROM large_employees", conn).iloc[0, 0]
print(f"Total rows in DB: {count}")  # 1000
print(f"Expected: {len(large_df)}")
```

**When to use `chunksize`:**
- DataFrames with > 10,000 rows — avoids building one massive INSERT statement
- When writing to remote databases where large single transactions may time out

#### Wrapping Writes in a Transaction

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE log (id INTEGER PRIMARY KEY, event TEXT, ts TEXT)")
conn.commit()

df_log = pd.DataFrame({
    "event": ["login", "view", "purchase", "logout"],
    "ts":    ["2024-01-01 10:00", "2024-01-01 10:05", "2024-01-01 10:10", "2024-01-01 10:15"],
})

# Use connection as a context manager — auto-commits on success, rolls back on error
try:
    with conn:  # starts a transaction
        df_log.to_sql("log", conn, if_exists="append", index=False)
    print("Transaction committed")
except Exception as e:
    print(f"Transaction rolled back: {e}")

count = pd.read_sql("SELECT COUNT(*) AS n FROM log", conn).iloc[0, 0]
print(f"Rows in log: {count}")
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: ETL Pipeline — CSV String to SQLite

```python
import sqlite3
import pandas as pd
from io import StringIO

# Simulate a CSV source (raw string)
csv_data = """id,name,department,salary,hire_date
1,Alice Chen,Engineering,90000,2022-01-15
2,Bob Smith,Marketing,65000,2023-03-01
3,Carol Park,Engineering,85000,2021-06-01
4,Dave Lee,HR,55000,2020-11-15
5,Eve Wang,Data,92000,2020-09-30
6,Frank Ng,Marketing,70000,2022-07-10
"""

# EXTRACT: read from CSV string
df_raw = pd.read_csv(StringIO(csv_data))
print(f"Extracted: {len(df_raw)} rows")
print(df_raw.dtypes)

# TRANSFORM: clean + enrich
df_clean = df_raw.copy()
df_clean["hire_date"] = pd.to_datetime(df_clean["hire_date"])
df_clean["annual_bonus"] = (df_clean["salary"] * 0.10).round(2)
df_clean["tenure_days"] = (pd.Timestamp("2024-01-01") - df_clean["hire_date"]).dt.days

# LOAD: write to SQLite
conn = sqlite3.connect(":memory:")
df_clean.to_sql("employees", conn, if_exists="replace", index=False)

print(f"\nLoaded {len(df_clean)} rows to 'employees' table")

# VERIFY: read back and check
df_verify = pd.read_sql("SELECT name, department, annual_bonus, tenure_days FROM employees ORDER BY tenure_days DESC", conn)
print("\nVerification — top 3 by tenure:")
print(df_verify.head(3))

# Row count match
loaded_count = pd.read_sql("SELECT COUNT(*) AS n FROM employees", conn).iloc[0, 0]
assert loaded_count == len(df_raw), f"Count mismatch: expected {len(df_raw)}, got {loaded_count}"
print(f"\nAssertion passed: {loaded_count} rows in DB == {len(df_raw)} rows extracted")
```

#### Exercise 2: Incremental Load with Deduplication

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")

# Batch 1: initial load
batch1 = pd.DataFrame({
    "id":   [1, 2, 3, 4, 5],
    "name": ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "score": [85, 72, 91, 68, 88],
})
batch1.to_sql("scores", conn, if_exists="replace", index=False)
print(f"Batch 1 loaded: {len(batch1)} rows")

# Batch 2: update existing records (1, 3) + add new records (6, 7)
batch2 = pd.DataFrame({
    "id":   [1, 3, 6, 7],
    "name": ["Alice", "Carol", "Frank", "Grace"],
    "score": [90, 95, 77, 82],  # Alice and Carol have new scores
})

# Append batch 2 — creates duplicates for id 1 and 3
batch2.to_sql("scores", conn, if_exists="append", index=False)
total_before_dedup = pd.read_sql("SELECT COUNT(*) AS n FROM scores", conn).iloc[0, 0]
print(f"After append (with duplicates): {total_before_dedup} rows")

# Deduplicate: keep the latest row per id (batch 2 was appended last, so higher rowid)
# Strategy: load all, deduplicate in pandas, write back with replace
df_all = pd.read_sql("SELECT * FROM scores", conn)
df_deduped = df_all.sort_values("id").drop_duplicates(subset="id", keep="last")
df_deduped.to_sql("scores", conn, if_exists="replace", index=False)

total_after_dedup = pd.read_sql("SELECT COUNT(*) AS n FROM scores", conn).iloc[0, 0]
print(f"After deduplication: {total_after_dedup} rows")
print("\nFinal scores:")
print(pd.read_sql("SELECT * FROM scores ORDER BY id", conn))

# Verify no duplicate ids
ids = pd.read_sql("SELECT id FROM scores", conn)["id"].tolist()
assert len(ids) == len(set(ids)), "Duplicate IDs found!"
print("\nAssertion passed: no duplicate IDs")
```

---

<PracticeBlock
  prompt="Create a DataFrame with 5 products (id, name, category, price, stock). Write it to SQLite using to_sql() with if_exists='replace'. Then update one product price in the DataFrame and use if_exists='replace' again. Read back and verify the updated price is reflected."
  initialCode={`import sqlite3\nimport pandas as pd\n\nconn = sqlite3.connect(":memory:")\n\n# Step 1: Create initial products DataFrame and write to SQL\nproducts = pd.DataFrame({\n    "id":       [1, 2, 3, 4, 5],\n    "name":     ["Widget A", "Gadget Pro", "Tool Kit", "Smart Device", "Basic Pack"],\n    "category": ["Hardware", "Electronics", "Hardware", "Electronics", "Accessories"],\n    "price":    [29.99, 149.99, 49.99, 299.99, 9.99],\n    "stock":    [100, 45, 30, 12, 200],\n})\n\n# Write to SQL\n\n# Step 2: Update Gadget Pro price to 179.99\n\n# Step 3: Write updated DataFrame to SQL (replace)\n\n# Step 4: Read back and verify Gadget Pro price is 179.99\n`}
  hint="Use df.loc[df['name'] == 'Gadget Pro', 'price'] = 179.99 to update. Then to_sql with if_exists='replace'. Use pd.read_sql to verify."
  solution={`import sqlite3\nimport pandas as pd\n\nconn = sqlite3.connect(":memory:")\n\n# Step 1: Create initial products DataFrame and write to SQL\nproducts = pd.DataFrame({\n    "id":       [1, 2, 3, 4, 5],\n    "name":     ["Widget A", "Gadget Pro", "Tool Kit", "Smart Device", "Basic Pack"],\n    "category": ["Hardware", "Electronics", "Hardware", "Electronics", "Accessories"],\n    "price":    [29.99, 149.99, 49.99, 299.99, 9.99],\n    "stock":    [100, 45, 30, 12, 200],\n})\n\nproducts.to_sql("products", conn, if_exists="replace", index=False)\nprint(f"Initial load: {len(products)} rows")\n\n# Step 2: Update Gadget Pro price to 179.99\nproducts.loc[products["name"] == "Gadget Pro", "price"] = 179.99\nprint(f"Updated Gadget Pro price to: {products.loc[products['name'] == 'Gadget Pro', 'price'].iloc[0]}")\n\n# Step 3: Write updated DataFrame to SQL (replace)\nproducts.to_sql("products", conn, if_exists="replace", index=False)\nprint("Wrote updated products to DB")\n\n# Step 4: Read back and verify\ndf_verify = pd.read_sql("SELECT name, price FROM products WHERE name = 'Gadget Pro'", conn)\ngadget_price = df_verify["price"].iloc[0]\nprint(f"\\nGadget Pro price in DB: {gadget_price}")\nassert gadget_price == 179.99, f"Expected 179.99, got {gadget_price}"\nprint("Assertion passed: price updated correctly")\nprint("\\nAll products:")\nprint(pd.read_sql("SELECT * FROM products ORDER BY id", conn))`}
/>

---

## Key Takeaways

- `df.to_sql(table, conn, if_exists="replace", index=False)` writes a DataFrame to a SQL table
- `if_exists="replace"` drops and recreates the table — use for full loads; `"append"` adds rows — use for incremental loads
- Always use `index=False` unless your DataFrame index has meaningful data you want stored
- `chunksize=N` splits large DataFrames into batches; `method="multi"` uses faster multi-row INSERT syntax
- Always verify writes with a `pd.read_sql("SELECT COUNT(*) FROM ...")` or row comparison after writing

---

## Common Mistakes to Avoid

- **Forgetting `index=False`**: the default adds a pandas RangeIndex column named `"index"` to the table, which is usually unwanted
- **Using `if_exists="append"` with a schema mismatch**: pandas will raise an error or silently insert incorrect data if the DataFrame columns don't match the table columns
- **Not verifying after write**: always read back at least a count to confirm the rows were written as expected

---

[← Previous](./lesson-06-pandas-read-sql.md) | [Back to Course](./README.md) | [Next →](./lesson-08-sqlalchemy-basics.md)
