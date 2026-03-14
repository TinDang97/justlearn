# Lesson 8: Idempotency — Safe to Re-Run

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand idempotency and why it matters for pipeline reliability
- Implement watermark-based incremental loading to avoid reprocessing
- Use upsert patterns to prevent duplicate records
- Design pipelines that safely recover from mid-run failures

---

## Prerequisites

- Lesson 7: Pipeline Orchestration
- pandas `merge()` and `concat()` (Section 5)
- sqlite3 `INSERT OR REPLACE` syntax

---

## Lesson Outline

### Part 1: What Is Idempotency? (30 minutes)

#### Running Twice Should Equal Running Once

A pipeline is **idempotent** if running it multiple times on the same input produces the same result as running it once — no duplicates, no data loss, no unexpected changes.

Why does this matter in practice?
- Cron jobs misfire and trigger twice
- A transient error causes a re-run from the beginning
- You need to backfill historical data

```python
import pandas as pd
import io

# ---------------------------------------------------------------
# Non-idempotent pipeline: append-only load doubles data on re-run
# ---------------------------------------------------------------

def non_idempotent_store() -> dict:
    """Simulates an append-only destination."""
    return {"rows": []}

def load_append(df: pd.DataFrame, store: dict) -> int:
    """Appends rows every time — NOT idempotent."""
    new_rows = df.to_dict("records")
    store["rows"].extend(new_rows)
    return len(store["rows"])


SOURCE = pd.DataFrame({"id": [1, 2, 3], "amount": [100, 200, 300]})

store = non_idempotent_store()
run1 = load_append(SOURCE, store)
print(f"After run 1: {run1} rows")  # 3

run2 = load_append(SOURCE, store)
print(f"After run 2: {run2} rows")  # 6 — DUPLICATED!


# ---------------------------------------------------------------
# Idempotent pipeline: overwrite replaces destination each run
# ---------------------------------------------------------------

class OverwriteStore:
    """Destination that replaces content on each write."""
    def __init__(self):
        self.df = pd.DataFrame()

    def write(self, df: pd.DataFrame) -> None:
        self.df = df.copy()

    def read(self) -> pd.DataFrame:
        return self.df


def load_overwrite(df: pd.DataFrame, store: OverwriteStore) -> int:
    """Overwrites destination — idempotent."""
    store.write(df)
    return len(store.df)


overwrite_store = OverwriteStore()
run1 = load_overwrite(SOURCE, overwrite_store)
print(f"\nOverwrite run 1: {run1} rows")  # 3

run2 = load_overwrite(SOURCE, overwrite_store)
print(f"Overwrite run 2: {run2} rows")   # 3 — same result, no duplicates!
```

---

### Part 2: Watermark-Based Incremental Processing (30 minutes)

#### Tracking the Last Processed Position

Full overwrites work for small tables, but for large tables (millions of rows) you need to process only new data each run. A **watermark** records the last processed record's timestamp or ID.

```python
import pandas as pd
import io

# Simulated source with timestamps
SOURCE_DATA = """id,amount,product,created_at
1,100,apple,2024-01-01
2,200,orange,2024-01-02
3,300,grape,2024-01-03
4,400,melon,2024-01-04
5,500,cherry,2024-01-05
6,600,plum,2024-01-06
7,700,mango,2024-01-07
"""


def extract_incremental(raw_data: str, watermark: str) -> pd.DataFrame:
    """
    Extract only records with created_at > watermark.
    watermark: ISO date string (e.g. '2024-01-03')
    """
    df = pd.read_csv(io.StringIO(raw_data))
    df["created_at"] = pd.to_datetime(df["created_at"])
    cutoff = pd.to_datetime(watermark)
    return df[df["created_at"] > cutoff].reset_index(drop=True)


def run_incremental_pipeline(raw_data: str, state: dict) -> dict:
    """
    Run incremental extract. Updates state with new watermark.
    state: {"last_processed_at": "2024-01-01"}
    """
    watermark = state.get("last_processed_at", "1900-01-01")
    print(f"\nRun starting. Watermark: {watermark}")

    batch = extract_incremental(raw_data, watermark)

    if len(batch) == 0:
        print("  No new records found.")
        return state

    # Simulate load
    print(f"  Processing {len(batch)} new records: {list(batch['product'])}")

    # Update watermark to the max created_at in this batch
    new_watermark = batch["created_at"].max().strftime("%Y-%m-%d")
    state["last_processed_at"] = new_watermark
    print(f"  New watermark: {new_watermark}")

    return state


# Simulate three pipeline runs
pipeline_state = {"last_processed_at": "2024-01-02"}

pipeline_state = run_incremental_pipeline(SOURCE_DATA, pipeline_state)
# Processes records 3, 4, 5, 6, 7

pipeline_state = run_incremental_pipeline(SOURCE_DATA, pipeline_state)
# Processes 0 records — watermark is now 2024-01-07, no newer data

# Simulate new records arriving
NEW_RECORDS = SOURCE_DATA + "8,800,kiwi,2024-01-08\n"
pipeline_state = run_incremental_pipeline(NEW_RECORDS, pipeline_state)
# Processes only record 8
```

In production, the `state` dict is persisted to a file or database row between runs. The watermark is the most important piece of state in an incremental pipeline.

---

### Part 3: Upsert Patterns (30 minutes)

#### Insert New + Update Existing

An **upsert** (update + insert) inserts records that don't exist yet and updates records that do, based on a primary key. This is the safest idempotent load strategy for mutable data.

```python
import pandas as pd
import sqlite3

# In-memory database
conn = sqlite3.connect(":memory:")

# Initial data in the database
initial_products = pd.DataFrame({
    "id":    [1, 2, 3],
    "name":  ["Apple",  "Orange", "Grape"],
    "price": [1.00,     1.50,     2.00],
})
initial_products.to_sql("products", conn, if_exists="replace", index=False)

print("Initial state:")
print(pd.read_sql("SELECT * FROM products", conn))

# New batch: updates product 2 (price change), adds product 4 (new)
new_batch = pd.DataFrame({
    "id":    [2, 4],
    "name":  ["Orange", "Mango"],
    "price": [1.75,     3.00],   # id=2 price changed
})


# ---------------------------------------------------------------
# Upsert using pandas merge + combine_first
# ---------------------------------------------------------------

def upsert_pandas(new_df: pd.DataFrame, conn: sqlite3.Connection,
                  table: str, key_col: str) -> int:
    """
    Upsert new_df into existing table using pandas merge.
    New rows are inserted, existing rows are updated.
    """
    existing = pd.read_sql(f"SELECT * FROM {table}", conn)

    # Set key as index for combine_first
    merged = (
        new_df.set_index(key_col)
        .combine_first(existing.set_index(key_col))
        .reset_index()
    )

    # Overwrite the table with merged result
    merged.to_sql(table, conn, if_exists="replace", index=False)
    return len(merged)


total = upsert_pandas(new_batch, conn, "products", key_col="id")
print("\nAfter upsert:")
print(pd.read_sql("SELECT * FROM products ORDER BY id", conn))
print(f"Total rows: {total}")


# ---------------------------------------------------------------
# Upsert using SQLite INSERT OR REPLACE
# ---------------------------------------------------------------

conn2 = sqlite3.connect(":memory:")
conn2.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL
    )
""")
conn2.execute("INSERT INTO products VALUES (1, 'Apple', 1.00)")
conn2.execute("INSERT INTO products VALUES (2, 'Orange', 1.50)")
conn2.execute("INSERT INTO products VALUES (3, 'Grape', 2.00)")
conn2.commit()

# INSERT OR REPLACE treats primary key conflict as a replace operation
upsert_rows = [(2, "Orange", 1.75), (4, "Mango", 3.00)]
conn2.executemany(
    "INSERT OR REPLACE INTO products (id, name, price) VALUES (?, ?, ?)",
    upsert_rows
)
conn2.commit()

print("\nAfter INSERT OR REPLACE:")
result = conn2.execute("SELECT * FROM products ORDER BY id").fetchall()
for row in result:
    print(f"  id={row[0]}, name={row[1]}, price={row[2]}")

conn.close()
conn2.close()
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Idempotent Dedup Load

<PracticeBlock
  prompt="Write load_with_dedup(df, existing_df, key_col) that merges new data onto existing data using key_col. Rows with the same key should be updated; new keys should be inserted. Run the function twice with the same new data and verify the row count stays the same."
  initialCode={`import pandas as pd

EXISTING = pd.DataFrame({
    "id": [1, 2, 3],
    "product": ["apple", "orange", "grape"],
    "amount": [100, 200, 300],
})

NEW_DATA = pd.DataFrame({
    "id": [2, 4],           # id=2 updates, id=4 is new
    "product": ["orange_v2", "melon"],
    "amount": [250, 400],
})

# TODO: write load_with_dedup(df, existing_df, key_col) -> pd.DataFrame
# Verify: running it twice with NEW_DATA produces the same result
`}
  hint="Use df.set_index(key_col).combine_first(existing_df.set_index(key_col)).reset_index(). Then sort by key_col and reset index for clean output."
  solution={`import pandas as pd

EXISTING = pd.DataFrame({
    "id": [1, 2, 3],
    "product": ["apple", "orange", "grape"],
    "amount": [100, 200, 300],
})

NEW_DATA = pd.DataFrame({
    "id": [2, 4],
    "product": ["orange_v2", "melon"],
    "amount": [250, 400],
})

def load_with_dedup(df: pd.DataFrame, existing_df: pd.DataFrame,
                    key_col: str) -> pd.DataFrame:
    merged = (
        df.set_index(key_col)
        .combine_first(existing_df.set_index(key_col))
        .reset_index()
        .sort_values(key_col)
        .reset_index(drop=True)
    )
    return merged

# Run 1
result1 = load_with_dedup(NEW_DATA, EXISTING, "id")
print("After run 1:")
print(result1)

# Run 2: same new data, same existing (use result1 as existing now)
result2 = load_with_dedup(NEW_DATA, result1, "id")
print("\\nAfter run 2 (should be same):")
print(result2)
print("\\nIdempotent:", result1.to_csv() == result2.to_csv())`}
/>

#### Exercise 2: Stateful Incremental Pipeline

<PracticeBlock
  prompt="Implement a stateful incremental pipeline using a dict as watermark store. Run it 3 times with progressively newer data. Verify each run only processes records newer than the previous watermark. Use 'run_date' as the watermark column."
  initialCode={`import pandas as pd
import io

ALL_DATA = """id,product,amount,run_date
1,apple,100,2024-01-01
2,orange,200,2024-01-02
3,grape,300,2024-01-03
4,melon,400,2024-01-04
5,cherry,500,2024-01-05
"""

# Watermark state (persisted between runs in a real system)
state = {"last_run_date": "1900-01-01"}

# TODO: write run_once(raw_data, state) -> state
# It should:
# 1. Extract records where run_date > state["last_run_date"]
# 2. Print how many records were processed and which products
# 3. Update state["last_run_date"] to the max run_date in the batch
# 4. Return the updated state

# Call run_once 3 times:
# Run 1: watermark = "1900-01-01" -> should process records 1-5
# Run 2: watermark = "2024-01-05" -> should process 0 records
# (simulate adding new data before run 3)
# Run 3: with extra data added, processes only new record
`}
  hint="After extract, check if batch is empty and return early. Set state['last_run_date'] = batch['run_date'].max(). Use pd.to_datetime for comparison."
  solution={`import pandas as pd
import io

ALL_DATA = """id,product,amount,run_date
1,apple,100,2024-01-01
2,orange,200,2024-01-02
3,grape,300,2024-01-03
4,melon,400,2024-01-04
5,cherry,500,2024-01-05
"""

state = {"last_run_date": "1900-01-01"}

def run_once(raw_data: str, state: dict) -> dict:
    df = pd.read_csv(io.StringIO(raw_data))
    df["run_date"] = pd.to_datetime(df["run_date"])
    cutoff = pd.to_datetime(state["last_run_date"])
    batch = df[df["run_date"] > cutoff]

    if len(batch) == 0:
        print(f"  No new records (watermark: {state['last_run_date']})")
        return state

    print(f"  Processing {len(batch)} records: {list(batch['product'])}")
    state["last_run_date"] = batch["run_date"].max().strftime("%Y-%m-%d")
    print(f"  New watermark: {state['last_run_date']}")
    return state

print("Run 1:")
state = run_once(ALL_DATA, state)

print("\\nRun 2 (same data — no new records expected):")
state = run_once(ALL_DATA, state)

print("\\nRun 3 (new record added):")
NEW_DATA = ALL_DATA + "6,kiwi,600,2024-01-06\\n"
state = run_once(NEW_DATA, state)`}
/>

---

## Key Takeaways

- **Idempotent = safe to re-run** — the same input always produces the same output, no duplicates
- **Overwrite > append for idempotency** — append accumulates duplicates if a pipeline re-runs
- **Watermark tracks last processed position** — stores the max timestamp/ID after each successful run
- **Upsert = insert new + update existing** — the correct pattern for mutable reference data
- **State between runs** must be persisted (file, database row) — not stored in memory

---

## Common Mistakes to Avoid

- Append-only loads for fact data without dedup logic — classic duplicate data bug on re-runs
- Updating the watermark before the load completes — if load fails, you skip data on the next run
- Using mutable Python state (module-level dict) as watermark storage in production — it resets on restart
- Forgetting that `combine_first` fills missing values from the existing DataFrame — verify the merge direction

---

[← Previous](./lesson-07-pipeline-orchestration.md) | [Back to Course](./README.md) | [Next →](./lesson-09-config-and-env.md)
