# Lesson 5: Error Handling — Fault-Tolerant Pipelines

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Wrap pipeline stages in `try/except` blocks with specific exception types
- Recover from partial failures without stopping the entire pipeline
- Implement a dead-letter pattern for rows that fail transformation
- Raise custom exceptions with context for better debugging

---

## Prerequisites

- Lesson 4: Load Patterns
- Python exception hierarchy (Python Course: File Handling & Exceptions)
- pandas `apply()` method

---

## Lesson Outline

### Part 1: try/except in Pipeline Stages (30 minutes)

#### Catching Specific Exceptions at Stage Boundaries

A pipeline should never use a bare `except:` clause — it catches `KeyboardInterrupt`, `SystemExit`, and programmer errors that should propagate. Always catch specific exception types.

```python
import pandas as pd
import io

VALID_CSV = """order_id,amount,product
1001,250.0,laptop
1002,45.5,keyboard
"""

MALFORMED_CSV = """order_id;amount;product
1001;250.0;laptop
"""  # wrong delimiter — will produce a 1-column DataFrame

MISSING_COL_CSV = """order_id,quantity
1001,5
1002,3
"""  # missing 'amount' column


class PipelineError(Exception):
    """Base class for all pipeline-stage errors."""
    pass


def extract(raw_data: str, required_columns: list) -> pd.DataFrame:
    """Extract with validation. Raises PipelineError on failure."""
    try:
        df = pd.read_csv(io.StringIO(raw_data))
        missing = set(required_columns) - set(df.columns)
        if missing:
            raise ValueError(f"Missing columns: {sorted(missing)}")
        return df
    except ValueError as e:
        # Re-raise with context so caller knows which stage failed
        raise PipelineError(f"Extract stage failed: {e}") from e
    except Exception as e:
        raise PipelineError(f"Extract stage unexpected error: {e}") from e


REQUIRED = ["order_id", "amount", "product"]

# Test 1: valid data
try:
    df = extract(VALID_CSV, REQUIRED)
    print("Valid CSV extracted:", df.shape)
except PipelineError as e:
    print("Error:", e)

# Test 2: missing column
try:
    df = extract(MISSING_COL_CSV, REQUIRED)
    print("Extracted:", df.shape)
except PipelineError as e:
    print("Missing column caught:", e)
```

#### re-raise with context using `from`

```python
# Without context (bad): you lose the original traceback
try:
    result = risky_operation()
except ValueError:
    raise RuntimeError("Stage failed")  # original cause is gone

# With context (good): original exception is chained
try:
    result = risky_operation()
except ValueError as e:
    raise RuntimeError("Stage failed") from e  # both errors visible in traceback
```

The `from e` syntax sets `__cause__` on the new exception, which Python displays as:
```
RuntimeError: Stage failed

The above exception was the direct cause of the following exception:
ValueError: ...
```

#### `finally` for Cleanup

```python
import sqlite3

def load_with_cleanup(df, conn_string: str) -> dict:
    conn = None
    try:
        conn = sqlite3.connect(conn_string)
        df.to_sql("output", conn, if_exists="replace", index=False)
        return {"rows_written": len(df)}
    except Exception as e:
        raise RuntimeError(f"Load failed: {e}") from e
    finally:
        # This ALWAYS runs, whether load succeeded or failed
        if conn:
            conn.close()
```

---

### Part 2: Custom Exception Classes (30 minutes)

#### Why Custom Exceptions?

Custom exception classes let callers catch failures from specific pipeline stages independently:

```python
import pandas as pd
import io

# Custom exception hierarchy
class PipelineError(Exception):
    """Base class for all pipeline errors."""
    pass

class ExtractError(PipelineError):
    """Raised when the extract stage fails."""
    pass

class TransformError(PipelineError):
    """Raised when the transform stage fails."""
    pass

class LoadError(PipelineError):
    """Raised when the load stage fails."""
    pass


# Custom exception with structured context
class SchemaError(TransformError):
    def __init__(self, missing_cols: list, found_cols: list):
        self.missing_cols = missing_cols
        self.found_cols = found_cols
        message = (
            f"Schema validation failed. "
            f"Missing: {sorted(missing_cols)}. "
            f"Found: {sorted(found_cols)}"
        )
        super().__init__(message)


# Pipeline stages that raise typed exceptions
def extract(raw_data: str) -> pd.DataFrame:
    try:
        return pd.read_csv(io.StringIO(raw_data))
    except Exception as e:
        raise ExtractError(f"Failed to parse CSV: {e}") from e


def transform(df: pd.DataFrame) -> pd.DataFrame:
    required = ["order_id", "amount", "product"]
    missing = set(required) - set(df.columns)
    if missing:
        raise SchemaError(missing_cols=list(missing), found_cols=list(df.columns))
    return df[df["amount"] > 0].copy()


def load(df: pd.DataFrame) -> dict:
    try:
        output = df.to_csv(index=False)
        return {"rows_written": len(df)}
    except Exception as e:
        raise LoadError(f"Failed to write output: {e}") from e


def run_pipeline(raw_data: str) -> dict:
    """Run ETL and catch each stage failure separately."""
    try:
        raw_df = extract(raw_data)
        clean_df = transform(raw_df)
        return load(clean_df)
    except ExtractError as e:
        print(f"[EXTRACT FAILED] {e}")
        raise
    except SchemaError as e:
        print(f"[SCHEMA FAILED] Missing: {e.missing_cols}, Found: {e.found_cols}")
        raise
    except TransformError as e:
        print(f"[TRANSFORM FAILED] {e}")
        raise
    except LoadError as e:
        print(f"[LOAD FAILED] {e}")
        raise


# Test with bad schema
BAD_DATA = """order_id,quantity
1001,5
1002,3
"""

try:
    run_pipeline(BAD_DATA)
except PipelineError:
    pass  # already printed by run_pipeline

# Test with valid data
GOOD_DATA = """order_id,amount,product
1001,250.0,laptop
1002,45.5,keyboard
"""

result = run_pipeline(GOOD_DATA)
print("Pipeline succeeded:", result)
```

---

### Part 3: Partial Failure Recovery (30 minutes)

#### Dead-Letter Pattern for Row-Level Failures

Not every failure should stop the pipeline. When processing a batch of records, some rows might have bad data (division by zero, unexpected types). These should be collected into a "dead letter" output rather than crashing the pipeline.

```python
import pandas as pd
import io

ORDERS = """order_id,quantity,unit_price
1001,5,20.0
1002,0,30.0
1003,3,0.0
1004,4,15.0
1005,2,25.0
"""


def safe_compute_revenue(row: pd.Series) -> float:
    """
    Compute revenue for a single row.
    Returns NaN if computation fails (used with apply).
    """
    try:
        if row["unit_price"] <= 0:
            raise ValueError(f"unit_price must be > 0, got {row['unit_price']}")
        if row["quantity"] <= 0:
            raise ValueError(f"quantity must be > 0, got {row['quantity']}")
        return row["quantity"] * row["unit_price"]
    except (ValueError, ZeroDivisionError):
        return float("nan")


def transform_with_dead_letter(df: pd.DataFrame) -> dict:
    """
    Transform DataFrame, collecting failed rows in a dead-letter output.
    Returns {"data": valid_df, "rejected": rejected_df}
    """
    result_df = df.copy()
    result_df["revenue"] = result_df.apply(safe_compute_revenue, axis=1)

    valid = result_df.dropna(subset=["revenue"]).copy()
    rejected = result_df[result_df["revenue"].isna()].copy()
    rejected["reject_reason"] = "revenue computation failed"

    rejection_rate = len(rejected) / len(df) * 100 if len(df) > 0 else 0
    print(f"Valid: {len(valid)}, Rejected: {len(rejected)} ({rejection_rate:.1f}%)")

    return {"data": valid, "rejected": rejected}


df = pd.read_csv(io.StringIO(ORDERS))
result = transform_with_dead_letter(df)

print("\nValid orders:")
print(result["data"][["order_id", "quantity", "unit_price", "revenue"]])

print("\nRejected (dead-letter):")
print(result["rejected"][["order_id", "quantity", "unit_price", "reject_reason"]])
```

The dead-letter records can be logged, written to a separate table, or sent to an alerting system. The key is they are preserved, not silently dropped.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Staged Exception Handling

<PracticeBlock
  prompt="Wrap a three-stage pipeline (extract, transform, load) with try/except at each stage. Each stage raises its own exception type. The main() function should catch each type and print a summary showing which stage failed, then re-raise."
  initialCode={`import pandas as pd
import io

class ExtractError(Exception): pass
class TransformError(Exception): pass
class LoadError(Exception): pass

BAD_EXTRACT = "not,valid\ncsv data"
GOOD_DATA = """id,amount,product
1,100.0,apple
2,200.0,orange
"""

def extract(raw: str) -> pd.DataFrame:
    df = pd.read_csv(io.StringIO(raw))
    if "amount" not in df.columns:
        raise ExtractError("Missing required column: amount")
    return df

def transform(df: pd.DataFrame) -> pd.DataFrame:
    if df["amount"].isna().any():
        raise TransformError("Null amounts found")
    return df[df["amount"] > 0].copy()

def load(df: pd.DataFrame) -> dict:
    return {"rows_written": len(df)}

# TODO: write main(raw_data) that catches ExtractError, TransformError, LoadError
# and prints "[STAGE FAILED] <message>" for each, then re-raises
# Test with BAD_EXTRACT (should catch ExtractError)
# Test with GOOD_DATA (should succeed)
`}
  hint="Use separate except clauses: except ExtractError as e, except TransformError as e, except LoadError as e. Print the stage name and error, then use 'raise' to re-raise."
  solution={`import pandas as pd
import io

class ExtractError(Exception): pass
class TransformError(Exception): pass
class LoadError(Exception): pass

BAD_EXTRACT = "not,valid\ncsv data"
GOOD_DATA = """id,amount,product
1,100.0,apple
2,200.0,orange
"""

def extract(raw: str) -> pd.DataFrame:
    df = pd.read_csv(io.StringIO(raw))
    if "amount" not in df.columns:
        raise ExtractError("Missing required column: amount")
    return df

def transform(df: pd.DataFrame) -> pd.DataFrame:
    if df["amount"].isna().any():
        raise TransformError("Null amounts found")
    return df[df["amount"] > 0].copy()

def load(df: pd.DataFrame) -> dict:
    return {"rows_written": len(df)}

def main(raw_data: str) -> dict:
    try:
        raw_df = extract(raw_data)
    except ExtractError as e:
        print(f"[EXTRACT FAILED] {e}")
        raise
    try:
        clean_df = transform(raw_df)
    except TransformError as e:
        print(f"[TRANSFORM FAILED] {e}")
        raise
    try:
        return load(clean_df)
    except LoadError as e:
        print(f"[LOAD FAILED] {e}")
        raise

# Test with bad data
try:
    main(BAD_EXTRACT)
except ExtractError:
    pass

# Test with good data
result = main(GOOD_DATA)
print("Success:", result)`}
/>

#### Exercise 2: Batch Processing with Dead-Letter

<PracticeBlock
  prompt="Write a batch_transform(records) function that processes a list of dicts one-by-one. Each record should have 'id', 'value', and 'divisor'. Compute result = value / divisor. Catch per-record errors and collect them in a failed list with the error message. Return {'processed': [...], 'failed': [...]}."
  initialCode={`import pandas as pd

RECORDS = [
    {"id": 1, "value": 100, "divisor": 4},
    {"id": 2, "value": 200, "divisor": 0},   # division by zero
    {"id": 3, "value": 300, "divisor": 5},
    {"id": 4, "value": "bad", "divisor": 2}, # type error
    {"id": 5, "value": 500, "divisor": 10},
]

# TODO: write batch_transform(records) -> dict
# Returns {"processed": [{"id": 1, "result": 25.0}, ...],
#          "failed": [{"record": {...}, "error": "..."}, ...]}
`}
  hint="Loop over records with try/except. On success, append {'id': r['id'], 'result': result} to processed. On failure, append {'record': r, 'error': str(e)} to failed."
  solution={`import pandas as pd

RECORDS = [
    {"id": 1, "value": 100, "divisor": 4},
    {"id": 2, "value": 200, "divisor": 0},
    {"id": 3, "value": 300, "divisor": 5},
    {"id": 4, "value": "bad", "divisor": 2},
    {"id": 5, "value": 500, "divisor": 10},
]

def batch_transform(records: list) -> dict:
    processed = []
    failed = []
    for record in records:
        try:
            result = record["value"] / record["divisor"]
            processed.append({"id": record["id"], "result": result})
        except (ZeroDivisionError, TypeError) as e:
            failed.append({"record": record, "error": str(e)})
    return {"processed": processed, "failed": failed}

result = batch_transform(RECORDS)
print(f"Processed: {len(result['processed'])}")
for item in result['processed']:
    print(f"  id={item['id']}, result={item['result']}")
print(f"\\nFailed: {len(result['failed'])}")
for item in result['failed']:
    print(f"  record={item['record']}, error={item['error']}")`}
/>

---

## Key Takeaways

- **Never use bare `except:`** — catch specific exception types (`ValueError`, `KeyError`, `TypeError`)
- **Custom exception classes** (`ExtractError`, `TransformError`, `LoadError`) let callers handle stage failures independently
- **`raise X from Y`** chains exceptions so both original cause and pipeline context are visible in tracebacks
- **Dead-letter pattern** — collect failed rows with an error reason column rather than crashing the pipeline
- **`finally` blocks** ensure cleanup (close connections, release locks) whether the stage succeeded or failed

---

## Common Mistakes to Avoid

- Using `except Exception:` to catch everything — hides programmer errors and makes debugging hard
- Swallowing exceptions silently with `except: pass` — data loss with no trace
- Logging the error and re-raising — correct pattern; never log and then swallow
- Not capturing the `reject_reason` in dead-letter rows — makes it impossible to diagnose failures later

---

[← Previous](./lesson-04-load-patterns.md) | [Back to Course](./README.md) | [Next →](./lesson-06-logging.md)
