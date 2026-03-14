# Lesson 4: Project 3 — ETL Pipeline with Validation

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

A production-style ETL pipeline needs more than just "read, transform, write" — it needs error handling, a data contract at the load boundary, per-step timing, and a structured result that downstream systems can act on. Build a full ETL pipeline for the orders dataset: extract from CSV with error recovery, transform with column normalization and business rule application, enforce a data contract, load to an in-memory accumulator, and log each step with timing.

**Deliverable:** A pipeline run log showing per-step timing and a final summary: `Pipeline: SUCCESS | 3 steps | 1000 → 998 rows | 0.23s total`.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| Full ETL extract-transform-load pattern | Section 6: ETL Pipelines |
| Data contracts and validation rules | Section 8: Data Quality & Testing |
| SQLite as a load target (in-memory) | Section 7: SQL & Databases |
| Column normalization and type conversion | Section 4: Data Cleaning |

---

## Architecture

```
extract(csv_string)
        |
        v
transform(raw_df)     <-- normalize columns, parse dates, drop nulls, compute derived
        |
        v
contract_check(df)    <-- validate schema rules, raise on violation
        |
        v
load(df, target)      <-- append rows to in-memory accumulator (list of dicts)
        |
        v
log_run(steps)        <-- collect PipelineResult per step, print summary
        |
        v
        STDOUT: Pipeline: SUCCESS | 3 steps | 1000 → 998 rows | 0.23s total
```

---

## Dataset

**File:** `data/transactions.csv` | 1,000 rows | 6 columns

Same dataset as Project 1. This project treats it as a raw source requiring ETL processing before loading into a target system (SQLite in production, an in-memory list in the browser).

---

## Starter Code

```python
import pandas as pd
import numpy as np
import io
import time
from dataclasses import dataclass, field
from typing import Optional

# --- Bundled dataset ---
TRANSACTIONS_CSV = """order_id,customer_id,Amount,Status,Order Date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,220.00,completed,2024-01-17,East
1004,C001,149.99,completed,2024-01-15,North
1005,C004,,pending,2024-01-18,West
1006,C005,-15.00,cancelled,2024-01-19,North
1007,C006,55.25,completed,2024-01-20,
1008,C007,320.80,Completed,2024-01-21,South
1009,C008,90.00,refunded,2024-01-22,East
1010,C009,410.50,completed,2024-01-23,West
"""


class PipelineError(Exception):
    """Raised when a pipeline step fails unrecoverably."""
    pass


class ContractViolationError(Exception):
    """Raised when the data contract is violated."""
    def __init__(self, violations: list):
        self.violations = violations
        super().__init__(f"Contract violated: {len(violations)} rule(s) failed")


@dataclass
class StepResult:
    """Result of a single pipeline step."""
    name: str
    status: str              # 'success' or 'failed'
    rows_in: int
    rows_out: int
    duration_s: float
    error: Optional[str] = None


@dataclass
class PipelineResult:
    """Aggregated result of the full pipeline run."""
    status: str
    steps: list = field(default_factory=list)
    total_rows_in: int = 0
    total_rows_out: int = 0
    total_duration_s: float = 0.0
    errors: list = field(default_factory=list)


def extract(csv_string: str) -> pd.DataFrame:
    """Extract raw data from CSV string.

    Wraps the read operation in error handling for:
    - Empty data (pd.errors.EmptyDataError)
    - Malformed CSV (pd.errors.ParserError)

    Returns:
        Raw DataFrame with original column names (may have spaces and mixed case).

    Raises:
        PipelineError: if the source data cannot be read.
    """
    # TODO: implement extract with error handling
    # try:
    #     df = pd.read_csv(io.StringIO(csv_string))
    #     if df.empty:
    #         raise PipelineError("Source data is empty")
    #     return df
    # except pd.errors.EmptyDataError as e:
    #     raise PipelineError(f"Empty data source: {e}")
    # except pd.errors.ParserError as e:
    #     raise PipelineError(f"Malformed CSV: {e}")
    return pd.read_csv(io.StringIO(csv_string))


def transform(df: pd.DataFrame) -> pd.DataFrame:
    """Transform the raw DataFrame.

    Steps:
    1. Normalize column names: lowercase, replace spaces with underscores
    2. Parse order_date to datetime
    3. Drop rows where order_id is null
    4. Normalize status to lowercase
    5. Drop rows with null or negative amount

    Returns:
        Transformed DataFrame (copy of input — do not modify in place).

    Raises:
        PipelineError: if a required column is missing after normalization.
    """
    # TODO: Step 1 — normalize column names
    # df_t = df.copy()
    # df_t.columns = df_t.columns.str.lower().str.replace(' ', '_')

    # TODO: check required columns exist
    # required = {'order_id', 'amount', 'status', 'order_date'}
    # missing = required - set(df_t.columns)
    # if missing:
    #     raise PipelineError(f"Missing required columns after normalization: {missing}")

    # TODO: Step 2 — parse order_date
    # df_t['order_date'] = pd.to_datetime(df_t['order_date'], errors='coerce')

    # TODO: Step 3 — drop null order_id
    # df_t = df_t[df_t['order_id'].notna()]

    # TODO: Step 4 — normalize status
    # df_t['status'] = df_t['status'].str.lower().str.strip()

    # TODO: Step 5 — drop invalid amounts
    # df_t = df_t[df_t['amount'].notna() & (df_t['amount'] > 0)]

    return df.copy()  # replace with df_t


def check_contract(df: pd.DataFrame) -> None:
    """Enforce the data contract on the transformed DataFrame.

    Contract rules:
    - order_id must be unique and not null
    - amount must be > 0
    - status must be in {'completed', 'pending', 'cancelled', 'refunded'}
    - order_date must not be null

    Raises:
        ContractViolationError: if any rule is violated (collect all violations first).
    """
    violations = []

    # TODO: Rule 1 — order_id unique and not null
    # if df['order_id'].isna().any():
    #     violations.append("order_id contains nulls")
    # if df['order_id'].duplicated().any():
    #     violations.append(f"order_id has {df['order_id'].duplicated().sum()} duplicates")

    # TODO: Rule 2 — amount > 0
    # invalid = df[~(df['amount'] > 0)]
    # if not invalid.empty:
    #     violations.append(f"amount: {len(invalid)} rows with value <= 0")

    # TODO: Rule 3 — valid status values
    # valid_statuses = {'completed', 'pending', 'cancelled', 'refunded'}
    # bad = df[~df['status'].isin(valid_statuses)]
    # if not bad.empty:
    #     violations.append(f"status: {len(bad)} rows with invalid values: {bad['status'].unique().tolist()}")

    # TODO: Rule 4 — order_date not null
    # if df['order_date'].isna().any():
    #     null_count = df['order_date'].isna().sum()
    #     violations.append(f"order_date: {null_count} null values")

    if violations:
        raise ContractViolationError(violations)


def load(df: pd.DataFrame, target: list) -> int:
    """Load transformed data to the target accumulator.

    In production this would be: df.to_sql('orders', conn, if_exists='append')
    In the browser, we append dicts to a list (simulates the DB write).

    Args:
        df: Cleaned, validated DataFrame ready for loading.
        target: In-memory list that accumulates loaded records.

    Returns:
        Number of rows loaded.
    """
    records = df.to_dict('records')
    target.extend(records)
    return len(records)


def run_pipeline(csv_string: str) -> PipelineResult:
    """Orchestrate the ETL pipeline with per-step timing and logging.

    Returns:
        PipelineResult with status, step details, and totals.
    """
    result = PipelineResult(status='running')
    loaded_records = []  # in-memory target

    # --- Step 1: Extract ---
    t0 = time.time()
    try:
        raw_df = extract(csv_string)
        result.steps.append(StepResult(
            name='extract',
            status='success',
            rows_in=0,
            rows_out=len(raw_df),
            duration_s=round(time.time() - t0, 4),
        ))
        result.total_rows_in = len(raw_df)
    except PipelineError as e:
        result.steps.append(StepResult(
            name='extract', status='failed', rows_in=0, rows_out=0,
            duration_s=round(time.time() - t0, 4), error=str(e)
        ))
        result.status = 'failed'
        result.errors.append(str(e))
        return result

    # --- Step 2: Transform ---
    t0 = time.time()
    try:
        clean_df = transform(raw_df)
        result.steps.append(StepResult(
            name='transform',
            status='success',
            rows_in=len(raw_df),
            rows_out=len(clean_df),
            duration_s=round(time.time() - t0, 4),
        ))
    except PipelineError as e:
        result.steps.append(StepResult(
            name='transform', status='failed', rows_in=len(raw_df), rows_out=0,
            duration_s=round(time.time() - t0, 4), error=str(e)
        ))
        result.status = 'failed'
        result.errors.append(str(e))
        return result

    # --- Step 3: Check contract ---
    t0 = time.time()
    try:
        check_contract(clean_df)
        result.steps.append(StepResult(
            name='contract_check',
            status='success',
            rows_in=len(clean_df),
            rows_out=len(clean_df),
            duration_s=round(time.time() - t0, 4),
        ))
    except ContractViolationError as e:
        result.steps.append(StepResult(
            name='contract_check', status='failed', rows_in=len(clean_df), rows_out=0,
            duration_s=round(time.time() - t0, 4), error=str(e)
        ))
        result.status = 'failed'
        result.errors.append(str(e))
        return result

    # --- Step 4: Load ---
    t0 = time.time()
    loaded_count = load(clean_df, loaded_records)
    result.steps.append(StepResult(
        name='load',
        status='success',
        rows_in=len(clean_df),
        rows_out=loaded_count,
        duration_s=round(time.time() - t0, 4),
    ))

    result.status = 'success'
    result.total_rows_out = loaded_count
    result.total_duration_s = sum(s.duration_s for s in result.steps)
    return result


def print_pipeline_log(result: PipelineResult) -> None:
    """Print a structured run log for the pipeline result."""
    print("PIPELINE RUN LOG")
    print("-" * 50)
    for step in result.steps:
        status_icon = "OK" if step.status == 'success' else "FAIL"
        print(f"  [{status_icon}] {step.name:<20} "
              f"{step.rows_in:>5} → {step.rows_out:>5} rows  "
              f"{step.duration_s:.4f}s")
        if step.error:
            print(f"        ERROR: {step.error}")
    print("-" * 50)
    print(f"Pipeline: {result.status.upper()} | "
          f"{len(result.steps)} steps | "
          f"{result.total_rows_in} → {result.total_rows_out} rows | "
          f"{result.total_duration_s:.3f}s total")
    if result.errors:
        print("Errors:")
        for err in result.errors:
            print(f"  - {err}")


def main():
    result = run_pipeline(TRANSACTIONS_CSV)
    print_pipeline_log(result)


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Extract with Error Handling (20 minutes)

The `extract()` function wraps `pd.read_csv()` in exception handling. In production, extract is the step most likely to fail (network issues, file not found, corrupted data). Catching specific exceptions and re-raising as `PipelineError` gives the orchestrator a single exception type to handle:

```python
def extract(csv_string: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(io.StringIO(csv_string))
        if df.empty:
            raise PipelineError("Source data is empty")
        return df
    except pd.errors.EmptyDataError as e:
        raise PipelineError(f"Empty data source: {e}")
    except pd.errors.ParserError as e:
        raise PipelineError(f"Malformed CSV: {e}")
```

Note that the column names in the raw CSV have mixed case and spaces (`Amount`, `Order Date`). The `transform()` step normalizes them — `extract()` returns the data exactly as read.

---

### Step 2: Transform (25 minutes)

The `transform()` function applies all normalization in one pass. The column name normalization step is critical — it enables the rest of the pipeline to reference columns by consistent names:

```python
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df_t = df.copy()

    # Step 1: normalize column names
    df_t.columns = df_t.columns.str.lower().str.replace(' ', '_')

    # Guard: verify required columns exist after normalization
    required = {'order_id', 'amount', 'status', 'order_date'}
    missing = required - set(df_t.columns)
    if missing:
        raise PipelineError(f"Missing required columns: {missing}")

    # Step 2: parse order_date
    df_t['order_date'] = pd.to_datetime(df_t['order_date'], errors='coerce')

    # Step 3: drop null order_id (primary key — cannot be null)
    df_t = df_t[df_t['order_id'].notna()]

    # Step 4: normalize status
    df_t['status'] = df_t['status'].str.lower().str.strip()

    # Step 5: drop invalid amounts
    df_t = df_t[df_t['amount'].notna() & (df_t['amount'] > 0)]

    return df_t
```

<Info>
`df.columns.str.lower().str.replace(' ', '_')` is a vectorized operation on the Index object. This single line handles any column name with spaces or mixed case — much more robust than manually renaming each column.
</Info>

---

### Step 3: Contract Enforcement (20 minutes)

The contract check runs after transform and before load. If the contract fails, the pipeline stops — loading bad data is worse than not loading at all:

```python
def check_contract(df: pd.DataFrame) -> None:
    violations = []

    if df['order_id'].isna().any():
        violations.append("order_id contains nulls")
    if df['order_id'].duplicated().any():
        violations.append(f"order_id has {df['order_id'].duplicated().sum()} duplicates")

    invalid_amounts = df[~(df['amount'] > 0)]
    if not invalid_amounts.empty:
        violations.append(f"amount: {len(invalid_amounts)} rows with value <= 0")

    valid_statuses = {'completed', 'pending', 'cancelled', 'refunded'}
    bad_status = df[~df['status'].isin(valid_statuses)]
    if not bad_status.empty:
        violations.append(f"status: {len(bad_status)} rows with invalid values")

    null_dates = df[df['order_date'].isna()]
    if not null_dates.empty:
        violations.append(f"order_date: {len(null_dates)} null values")

    if violations:
        raise ContractViolationError(violations)
```

The `ContractViolationError` stores the full violations list, not just a message string. This allows the orchestrator to surface specific violations in the pipeline log.

---

### Step 4: Load and Log (15 minutes)

The `load()` function uses `.to_dict('records')` to convert the DataFrame to a list of dicts before appending to the target. In production, this would be `df.to_sql('orders', conn, if_exists='append', index=False)`.

The `run_pipeline()` orchestrator wraps each step in try/except, records a `StepResult` with timing, and returns early on failure. This means the pipeline log always has entries for every step that was attempted — even failed ones.

---

## Expected Output

```
PIPELINE RUN LOG
--------------------------------------------------
  [OK] extract                  0 →    10 rows  0.0012s
  [OK] transform               10 →     7 rows  0.0018s
  [OK] contract_check           7 →     7 rows  0.0005s
  [OK] load                     7 →     7 rows  0.0003s
--------------------------------------------------
Pipeline: SUCCESS | 4 steps | 10 → 7 rows | 0.004s total
```

On the full 1,000-row dataset: `Pipeline: SUCCESS | 4 steps | 1000 → 978 rows | 0.023s total`.

A pipeline with contract violations produces:

```
PIPELINE RUN LOG
--------------------------------------------------
  [OK] extract                  0 →    10 rows  0.0011s
  [OK] transform               10 →    10 rows  0.0016s
  [FAIL] contract_check        10 →     0 rows  0.0008s
        ERROR: Contract violated: 1 rule(s) failed
--------------------------------------------------
Pipeline: FAILED | 3 steps | 10 → 0 rows | 0.004s total
Errors:
  - Contract violated: 1 rule(s) failed
```

---

## Practice Exercises

<PracticeBlock
  prompt="Implement the `transform(df)` function. The raw DataFrame has columns with mixed case and spaces ('Amount', 'Order Date'). Your function should: (1) normalize all column names to lowercase with underscores, (2) raise PipelineError if any required column is missing after normalization, (3) parse order_date to datetime, (4) drop rows with null order_id, (5) normalize status to lowercase, (6) drop rows with null or negative amount. Return the transformed copy."
  initialCode={`import pandas as pd
import io

class PipelineError(Exception):
    pass

TRANSACTIONS_CSV = """order_id,customer_id,Amount,Status,Order Date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,,pending,2024-01-18,West
1004,C005,-15.00,cancelled,2024-01-19,North
1005,C006,55.25,Completed,2024-01-20,East
"""

def transform(df: pd.DataFrame) -> pd.DataFrame:
    # TODO: implement all 6 transformation steps
    return df.copy()

raw = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
print("Raw columns:", list(raw.columns))
print("Raw dtypes:", raw.dtypes.to_dict())
print()
clean = transform(raw)
print("Clean columns:", list(clean.columns))
print("Clean dtypes:", clean.dtypes.to_dict())
print("Rows:", len(clean))
print(clean)`}
  hint="Use df.columns.str.lower().str.replace(' ', '_') for column normalization. Check required = {'order_id', 'amount', 'status', 'order_date'} against set(df_t.columns). Use pd.to_datetime(errors='coerce') for dates."
  solution={`import pandas as pd
import io

class PipelineError(Exception):
    pass

TRANSACTIONS_CSV = """order_id,customer_id,Amount,Status,Order Date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,,pending,2024-01-18,West
1004,C005,-15.00,cancelled,2024-01-19,North
1005,C006,55.25,Completed,2024-01-20,East
"""

def transform(df: pd.DataFrame) -> pd.DataFrame:
    df_t = df.copy()

    # Step 1: normalize column names
    df_t.columns = df_t.columns.str.lower().str.replace(' ', '_')

    # Step 2: check required columns
    required = {'order_id', 'amount', 'status', 'order_date'}
    missing = required - set(df_t.columns)
    if missing:
        raise PipelineError(f"Missing required columns: {missing}")

    # Step 3: parse order_date
    df_t['order_date'] = pd.to_datetime(df_t['order_date'], errors='coerce')

    # Step 4: drop null order_id
    df_t = df_t[df_t['order_id'].notna()]

    # Step 5: normalize status
    df_t['status'] = df_t['status'].str.lower().str.strip()

    # Step 6: drop invalid amounts
    df_t = df_t[df_t['amount'].notna() & (df_t['amount'] > 0)]

    return df_t

raw = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
print("Raw columns:", list(raw.columns))
print()
clean = transform(raw)
print("Clean columns:", list(clean.columns))
print("Clean dtypes:", clean.dtypes.to_dict())
print("Rows:", len(clean))
print(clean)`}
/>

---

## Extension Challenges

1. **Retry mechanism**: Modify the orchestrator to retry the extract step up to 3 times on `PipelineError`. Add a `max_retries` parameter to `run_pipeline()`. Use a loop with `time.sleep(0)` between retries (in production this would be `time.sleep(backoff_seconds)`). Log each retry attempt.

2. **Idempotency check**: Add an `already_processed` set to `run_pipeline()`. Before running, compute a hash of the CSV string (`hashlib.md5(csv_string.encode()).hexdigest()`). If the hash is already in `already_processed`, return a `PipelineResult` with `status='skipped'`. Log "Skipping already-processed source".

3. **Pytest tests**: Write three pytest tests for `transform()`: (a) test that column names with spaces and mixed case are normalized, (b) test that `PipelineError` is raised when a required column is missing, (c) test that rows with negative amounts are dropped. Use `pd.DataFrame` constructors to build test inputs.

---

## Key Takeaways

- ETL pipelines fail in the extract step most often — wrap `pd.read_csv()` in specific exception handlers and re-raise as a single `PipelineError` type
- Column name normalization (`str.lower().str.replace(' ', '_')`) should be the first transform step — it makes every subsequent column reference consistent
- Contract violations at the load boundary are not recoverable — raise and stop rather than loading bad data
- `PipelineResult` dataclass captures the complete run history: every step, every duration, every error — this is what monitoring systems query
- Per-step timing (`time.time()` before and after each step) costs almost nothing and reveals where pipeline time is spent

---

[← Lesson 3: Project 2 — Log File Analyzer](./lesson-03-project-2-log-file-analyzer.md) | [Next Lesson: Project 4 — Customer Segmentation →](./lesson-05-project-4-customer-segmentation.md)
