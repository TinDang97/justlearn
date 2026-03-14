# Lesson 4: Load — Writing to Destinations

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Write DataFrames to CSV, JSON, and Parquet formats
- Understand append vs overwrite load strategies and their trade-offs
- Use SQLite as a load destination with `pandas.to_sql()`
- Return load metadata (rows written, destination, timestamp) from load functions

---

## Prerequisites

- Lesson 3: Transform Patterns
- pandas to_csv, to_json basics (Section 3: Data Loading)
- sqlite3 standard library module

---

## Lesson Outline

### Part 1: File-Based Load (30 minutes)

#### Writing to Different File Formats

The `load()` function writes data to its destination and returns metadata — not the data itself.

```python
import pandas as pd
import io
from datetime import datetime

# Sample transformed DataFrame
def make_sample_df() -> pd.DataFrame:
    return pd.DataFrame({
        "order_id": [1001, 1002, 1003],
        "region":   ["EU", "US", "AP"],
        "product":  ["laptop", "keyboard", "monitor"],
        "revenue":  [1600.0, 225.0, 350.0],
    })


# ---------------------------------------------------------------
# CSV load — returns metadata dict
# ---------------------------------------------------------------

def load_to_csv_string(df: pd.DataFrame) -> dict:
    """
    Write DataFrame to a CSV string (simulates writing to a file).
    In production: df.to_csv("path/to/output.csv", index=False)
    """
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    csv_output = buffer.getvalue()

    return {
        "rows_written": len(df),
        "format": "csv",
        "timestamp": datetime.utcnow().isoformat(),
        "preview_bytes": len(csv_output),
    }


# ---------------------------------------------------------------
# JSON load
# ---------------------------------------------------------------

def load_to_json_string(df: pd.DataFrame) -> dict:
    """
    Write DataFrame to a JSON string (records orientation).
    In production: df.to_json("output.json", orient="records", indent=2)
    """
    buffer = io.StringIO()
    df.to_json(buffer, orient="records", indent=2)
    json_output = buffer.getvalue()

    return {
        "rows_written": len(df),
        "format": "json",
        "timestamp": datetime.utcnow().isoformat(),
        "preview_bytes": len(json_output),
    }


df = make_sample_df()

csv_meta = load_to_csv_string(df)
print("CSV load:", csv_meta)

json_meta = load_to_json_string(df)
print("JSON load:", json_meta)
```

#### Parquet Format

Parquet is a columnar binary format — faster and smaller than CSV for large datasets. The load pattern is the same:

```python
import pandas as pd
import io

# Note: in Pyodide, to_parquet requires pyarrow (available via micropip)
# Pattern shown here — works in standard Python environments

def load_to_parquet(df: pd.DataFrame, path: str) -> dict:
    """
    Write DataFrame to Parquet.
    In production: df.to_parquet(path, index=False)
    Parquet is 5-10x smaller than CSV and reads 10x faster.
    """
    # df.to_parquet(path, index=False)  # production line
    return {
        "rows_written": len(df),
        "format": "parquet",
        "path": path,
    }

# Parquet is preferred for:
# - Large datasets (millions of rows)
# - Column-selective reads (only load the columns you need)
# - Preserving dtypes across pipeline runs
```

---

### Part 2: Append vs Overwrite (30 minutes)

#### Choosing a Load Strategy

The load strategy determines what happens if the destination already contains data:

| Strategy | When to use | Risk |
|---|---|---|
| **Overwrite** | Dimensions, lookup tables, full refreshes | Loses history |
| **Append** | Event logs, audit trails, incremental facts | Duplicates if re-run |
| **Upsert** | Slowly-changing dimensions, idempotent facts | Most complex (covered in Lesson 8) |

```python
import pandas as pd
import io

# Simulate an in-memory CSV "file" as a mutable container
class InMemoryCSV:
    """Simulates a CSV file stored in memory."""
    def __init__(self, initial_csv: str = ""):
        self.content = initial_csv

    def read(self) -> pd.DataFrame:
        if not self.content.strip():
            return pd.DataFrame()
        return pd.read_csv(io.StringIO(self.content))

    def write(self, df: pd.DataFrame) -> None:
        self.content = df.to_csv(index=False)


def load_csv(df: pd.DataFrame, store: InMemoryCSV, mode: str = "overwrite") -> dict:
    """
    Load a DataFrame into a CSV store.
    mode='overwrite': replace all existing data
    mode='append': add rows to existing data
    """
    if mode == "overwrite":
        store.write(df)
        rows_written = len(df)

    elif mode == "append":
        existing = store.read()
        if existing.empty:
            combined = df
        else:
            combined = pd.concat([existing, df], ignore_index=True)
        store.write(combined)
        rows_written = len(df)

    else:
        raise ValueError(f"Unknown mode: '{mode}'. Use 'overwrite' or 'append'.")

    return {"rows_written": rows_written, "mode": mode, "total_rows": len(store.read())}


# Setup
store = InMemoryCSV()

batch_1 = pd.DataFrame({"id": [1, 2], "amount": [100.0, 200.0]})
batch_2 = pd.DataFrame({"id": [3, 4], "amount": [300.0, 400.0]})

# First load: overwrite (destination is empty, so same as append)
meta = load_csv(batch_1, store, mode="overwrite")
print("After overwrite batch_1:", meta)

# Append second batch
meta = load_csv(batch_2, store, mode="append")
print("After append batch_2:", meta)
print(store.read())

# Overwrite with batch_1 again — batch_2 data is gone
meta = load_csv(batch_1, store, mode="overwrite")
print("\nAfter overwrite batch_1 again:", meta)
print(store.read())
```

The rule of thumb: use overwrite when the destination is a snapshot (current state), use append when the destination is a log (historical events).

---

### Part 3: SQLite as Load Destination (30 minutes)

#### Loading into a Database

`pandas.to_sql()` loads a DataFrame directly into a SQLite (or any SQL) database. This is the standard pattern for data warehouse targets.

```python
import pandas as pd
import sqlite3
import io
from datetime import datetime

SALES_DATA = """order_id,region,product,revenue
1001,EU,laptop,1600.0
1002,US,keyboard,225.0
1003,AP,monitor,350.0
1004,EU,mouse,75.0
1005,US,cable,15.0
"""


def load_sqlite(df: pd.DataFrame, table: str, conn: sqlite3.Connection,
                if_exists: str = "replace") -> dict:
    """
    Load DataFrame into SQLite table.
    if_exists='replace': drop and recreate the table
    if_exists='append': add rows to existing table
    Returns load metadata dict.
    """
    df.to_sql(table, conn, if_exists=if_exists, index=False)

    # Verify the load by reading back the count
    result = pd.read_sql(f"SELECT COUNT(*) AS n FROM {table}", conn)
    total_rows = result["n"].iloc[0]

    return {
        "table": table,
        "rows_written": len(df),
        "total_rows_in_table": int(total_rows),
        "if_exists": if_exists,
        "timestamp": datetime.utcnow().isoformat(),
    }


# Create in-memory database
conn = sqlite3.connect(":memory:")

# Extract and load
df = pd.read_csv(io.StringIO(SALES_DATA))

meta = load_sqlite(df, table="sales", conn=conn, if_exists="replace")
print("First load:", meta)

# Append more rows
extra = pd.DataFrame({
    "order_id": [1006, 1007],
    "region": ["US", "EU"],
    "product": ["headset", "charger"],
    "revenue": [120.0, 40.0],
})
meta = load_sqlite(extra, table="sales", conn=conn, if_exists="append")
print("After append:", meta)

# Read back to verify
result_df = pd.read_sql("SELECT region, SUM(revenue) AS total FROM sales GROUP BY region", conn)
print("\nRevenue by region:")
print(result_df)

conn.close()
```

Always verify the load with a read-back query. Do not trust that `to_sql()` succeeded without confirmation — the metadata dict gives callers a signal to assert on.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: CSV Load with Mode Support

<PracticeBlock
  prompt="Write a load_csv_mode(df, store, mode) function using the InMemoryCSV class. Test that mode='append' doubles rows when called twice with the same data, and mode='overwrite' always results in exactly the input DataFrame's rows."
  initialCode={`import pandas as pd
import io

class InMemoryCSV:
    def __init__(self):
        self.content = ""
    def read(self) -> pd.DataFrame:
        if not self.content.strip():
            return pd.DataFrame()
        return pd.read_csv(io.StringIO(self.content))
    def write(self, df: pd.DataFrame) -> None:
        self.content = df.to_csv(index=False)

BATCH = pd.DataFrame({"id": [1, 2, 3], "amount": [100.0, 200.0, 300.0]})

# TODO: write load_csv_mode(df, store, mode) -> dict
# Returns {"rows_written": n, "total_rows": n, "mode": mode}
# Test: append BATCH twice -> total_rows should be 6
# Test: overwrite BATCH twice -> total_rows should be 3
`}
  hint="For append: pd.concat([existing, df], ignore_index=True) if existing is not empty, else just df. Always call store.write() with the final DataFrame."
  solution={`import pandas as pd
import io

class InMemoryCSV:
    def __init__(self):
        self.content = ""
    def read(self) -> pd.DataFrame:
        if not self.content.strip():
            return pd.DataFrame()
        return pd.read_csv(io.StringIO(self.content))
    def write(self, df: pd.DataFrame) -> None:
        self.content = df.to_csv(index=False)

BATCH = pd.DataFrame({"id": [1, 2, 3], "amount": [100.0, 200.0, 300.0]})

def load_csv_mode(df: pd.DataFrame, store: InMemoryCSV, mode: str = "overwrite") -> dict:
    if mode == "overwrite":
        store.write(df)
    elif mode == "append":
        existing = store.read()
        combined = pd.concat([existing, df], ignore_index=True) if not existing.empty else df
        store.write(combined)
    else:
        raise ValueError(f"Unknown mode: {mode}")
    return {"rows_written": len(df), "total_rows": len(store.read()), "mode": mode}

# Test append
store_a = InMemoryCSV()
meta1 = load_csv_mode(BATCH, store_a, mode="append")
meta2 = load_csv_mode(BATCH, store_a, mode="append")
print(f"Append twice: total_rows={meta2['total_rows']} (expected 6)")

# Test overwrite
store_b = InMemoryCSV()
load_csv_mode(BATCH, store_b, mode="overwrite")
meta3 = load_csv_mode(BATCH, store_b, mode="overwrite")
print(f"Overwrite twice: total_rows={meta3['total_rows']} (expected 3)")`}
/>

#### Exercise 2: SQLite Load with Metadata

<PracticeBlock
  prompt="Write a load_sqlite(df, table, conn, mode) function that loads a DataFrame into SQLite using if_exists='replace' for mode='overwrite' and if_exists='append' for mode='append'. Return a dict with rows_written, table, and mode keys."
  initialCode={`import pandas as pd
import sqlite3
import io

ORDERS = pd.DataFrame({
    "order_id": [1, 2, 3],
    "product": ["apple", "orange", "grape"],
    "amount": [100.0, 200.0, 300.0],
})

EXTRA = pd.DataFrame({
    "order_id": [4, 5],
    "product": ["melon", "cherry"],
    "amount": [400.0, 500.0],
})

conn = sqlite3.connect(":memory:")

# TODO: write load_sqlite(df, table, conn, mode="overwrite") -> dict
# Test: overwrite ORDERS -> 3 rows in table
# Test: append EXTRA -> 5 rows in table total
# Verify with pd.read_sql("SELECT COUNT(*) as n FROM orders", conn)
`}
  hint="Use df.to_sql(table, conn, if_exists=if_exists, index=False). Read back the count with pd.read_sql(f'SELECT COUNT(*) as n FROM {table}', conn)."
  solution={`import pandas as pd
import sqlite3
import io

ORDERS = pd.DataFrame({
    "order_id": [1, 2, 3],
    "product": ["apple", "orange", "grape"],
    "amount": [100.0, 200.0, 300.0],
})

EXTRA = pd.DataFrame({
    "order_id": [4, 5],
    "product": ["melon", "cherry"],
    "amount": [400.0, 500.0],
})

conn = sqlite3.connect(":memory:")

def load_sqlite(df: pd.DataFrame, table: str,
                conn: sqlite3.Connection, mode: str = "overwrite") -> dict:
    if_exists = "replace" if mode == "overwrite" else "append"
    df.to_sql(table, conn, if_exists=if_exists, index=False)
    total = pd.read_sql(f"SELECT COUNT(*) as n FROM {table}", conn)["n"].iloc[0]
    return {"rows_written": len(df), "table": table, "mode": mode, "total_rows": int(total)}

meta1 = load_sqlite(ORDERS, "orders", conn, mode="overwrite")
print("After overwrite:", meta1)

meta2 = load_sqlite(EXTRA, "orders", conn, mode="append")
print("After append:", meta2)

print("\\nFull table:")
print(pd.read_sql("SELECT * FROM orders", conn))
conn.close()`}
/>

---

## Key Takeaways

- **`to_csv` / `to_json` / `to_parquet`** for file destinations; **`to_sql`** for databases
- **`if_exists="replace"`** drops and recreates the table (overwrite); **`"append"`** adds rows
- **Always return load metadata** — rows written, destination, timestamp — as a dict
- **Verify the load** with a read-back query (`SELECT COUNT(*) FROM table`) inside the load function
- **Parquet** is preferred for large datasets: columnar, compressed, dtype-preserving

---

## Common Mistakes to Avoid

- Not verifying the load — `to_sql()` can silently succeed with 0 rows if the DataFrame is empty
- Using `if_exists="append"` on a pipeline that re-runs — without dedup logic, data doubles on each run
- Returning `None` from `load()` — always return metadata so callers can log and assert
- Forgetting `index=False` in `to_csv` and `to_sql` — adds an unwanted numeric index column

---

[← Previous](./lesson-03-transform-patterns.md) | [Back to Course](./README.md) | [Next →](./lesson-05-error-handling.md)
