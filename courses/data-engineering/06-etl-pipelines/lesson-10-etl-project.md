# Lesson 10: Mini-Project — End-to-End ETL Pipeline

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Build a complete ETL pipeline applying all Section 6 patterns
- Structure code with config, extract, transform, load, and main functions
- Add structured logging and error handling throughout
- Verify idempotency by running the pipeline twice and checking for duplicates

---

## Prerequisites

- All Section 6 lessons (01–09)
- pandas, sqlite3, io, logging, dataclasses, time (all standard library or Pyodide-available)

---

## Lesson Outline

### Part 1: Project Definition and Setup (30 minutes)

#### Scenario: Daily Sales Report Pipeline

This mini-project builds a production-style ETL pipeline with a realistic scenario:

- **Source**: raw daily transaction CSV (simulated with `io.StringIO`)
- **Transform**: filter invalid amounts, enrich with product category, aggregate by region
- **Load**: write regional summary into in-memory SQLite
- **Error handling**: custom exceptions at each stage, dead-letter for invalid rows
- **Logging**: structured stage logging with `PipelineStage` context manager
- **Idempotency**: overwrite load ensures re-runs produce identical results

```python
import pandas as pd
import io
import sqlite3
import logging
import time
from dataclasses import dataclass
from datetime import datetime

# ---------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("sales_etl")


# ---------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------

class PipelineError(Exception):
    pass

class ExtractError(PipelineError):
    pass

class TransformError(PipelineError):
    pass

class LoadError(PipelineError):
    pass


# ---------------------------------------------------------------
# PipelineStage context manager
# ---------------------------------------------------------------

class PipelineStage:
    def __init__(self, name: str):
        self.name = name
        self._start = None

    def __enter__(self):
        self._start = time.time()
        logger.info("Stage '%s' starting", self.name)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self._start
        if exc_type:
            logger.error("Stage '%s' FAILED (%.3fs): %s", self.name, duration, exc_val)
        else:
            logger.info("Stage '%s' complete (%.3fs)", self.name, duration)
        return False


# ---------------------------------------------------------------
# Pipeline configuration
# ---------------------------------------------------------------

@dataclass
class SalesETLConfig:
    min_amount: float = 0.0
    target_table: str = "sales_summary"
    dry_run: bool = False

    def __post_init__(self):
        if self.min_amount < 0:
            raise ValueError(f"min_amount must be >= 0, got {self.min_amount}")


# ---------------------------------------------------------------
# Raw data (simulated daily transaction file)
# ---------------------------------------------------------------

RAW_TRANSACTIONS = """transaction_id,region,product,quantity,unit_price
T001,EU,laptop,2,800.0
T002,US,keyboard,5,45.0
T003,EU,mouse,3,25.0
T004,AP,monitor,1,350.0
T005,US,cable,-2,10.0
T006,EU,headset,4,120.0
T007,US,laptop,1,900.0
T008,AP,keyboard,0,45.0
T009,EU,mouse,2,25.0
T010,US,monitor,3,350.0
"""

# Product category lookup
PRODUCT_CATEGORIES = {
    "laptop":   "computing",
    "keyboard": "peripherals",
    "mouse":    "peripherals",
    "monitor":  "display",
    "cable":    "accessories",
    "headset":  "audio",
}

print("Project setup complete.")
print(f"Config: {SalesETLConfig()}")
```

---

### Part 2: Extract and Transform Implementation (30 minutes)

#### Extract with Validation

```python
def extract(raw_csv: str) -> pd.DataFrame:
    """
    Read raw transactions CSV.
    Validates required columns are present.
    Raises ExtractError on failure.
    """
    required = ["transaction_id", "region", "product", "quantity", "unit_price"]
    try:
        df = pd.read_csv(io.StringIO(raw_csv))
        missing = set(required) - set(df.columns)
        if missing:
            raise ValueError(f"Missing columns: {sorted(missing)}")
        logger.info("Extracted %d raw transactions", len(df))
        return df
    except ValueError as e:
        raise ExtractError(f"Extract failed: {e}") from e
    except Exception as e:
        raise ExtractError(f"Extract unexpected error: {e}") from e


def transform(df: pd.DataFrame, config: SalesETLConfig) -> dict:
    """
    Apply business logic:
    1. Filter rows where quantity > 0 and unit_price > 0 (dead-letter the rest)
    2. Compute revenue = quantity * unit_price
    3. Enrich with product category
    4. Aggregate by region: sum revenue, count orders

    Returns {"data": summary_df, "rejected": rejected_df}
    """
    rows_in = len(df)

    # Step 1: identify invalid rows
    invalid_mask = (df["quantity"] <= 0) | (df["unit_price"] <= 0) | (df["unit_price"] < config.min_amount)
    rejected = df[invalid_mask].copy()
    rejected["reject_reason"] = "invalid quantity or unit_price"
    valid = df[~invalid_mask].copy()

    logger.info(
        "Transform: %d in, %d valid, %d rejected",
        rows_in, len(valid), len(rejected)
    )
    if len(rejected) > 0:
        logger.warning("Rejected rows: %s", list(rejected["transaction_id"]))

    if len(valid) == 0:
        raise TransformError("All rows rejected — no valid data to process")

    # Step 2: compute revenue
    valid["revenue"] = valid["quantity"] * valid["unit_price"]

    # Step 3: enrich with category
    valid["category"] = valid["product"].map(PRODUCT_CATEGORIES).fillna("other")

    # Step 4: aggregate by region
    summary = (
        valid.groupby("region")
        .agg(
            total_revenue=("revenue", "sum"),
            order_count=("transaction_id", "count"),
            unique_products=("product", "nunique"),
        )
        .reset_index()
        .round({"total_revenue": 2})
    )

    logger.info("Aggregated into %d regional summaries", len(summary))
    return {"data": summary, "rejected": rejected}


# Run extract + transform
with PipelineStage("extract"):
    raw_df = extract(RAW_TRANSACTIONS)

with PipelineStage("transform"):
    transform_result = transform(raw_df, SalesETLConfig())

print("\nRegional summary:")
print(transform_result["data"])
print(f"\nRejected rows: {len(transform_result['rejected'])}")
print(transform_result["rejected"][["transaction_id", "quantity", "unit_price", "reject_reason"]])
```

---

### Part 3: Load and Full Pipeline Assembly (30 minutes)

#### Load + Full run_pipeline()

```python
def load(summary_df: pd.DataFrame, conn: sqlite3.Connection,
         config: SalesETLConfig) -> dict:
    """
    Load summary DataFrame into SQLite.
    If dry_run=True: log what would be loaded, return 0 rows.
    Verifies load by reading back the row count.
    Raises LoadError on failure.
    """
    if config.dry_run:
        logger.info(
            "[DRY RUN] Would load %d rows to table '%s'",
            len(summary_df), config.target_table
        )
        return {"rows_written": 0, "table": config.target_table, "dry_run": True}

    try:
        summary_df.to_sql(config.target_table, conn, if_exists="replace", index=False)

        verification = pd.read_sql(
            f"SELECT COUNT(*) AS n FROM {config.target_table}", conn
        )
        rows_confirmed = int(verification["n"].iloc[0])

        if rows_confirmed != len(summary_df):
            raise LoadError(
                f"Row count mismatch: wrote {len(summary_df)}, found {rows_confirmed}"
            )

        logger.info(
            "Loaded %d rows to '%s' (verified)",
            rows_confirmed, config.target_table
        )
        return {
            "rows_written": rows_confirmed,
            "table": config.target_table,
            "dry_run": False,
        }
    except LoadError:
        raise
    except Exception as e:
        raise LoadError(f"Load failed: {e}") from e


def run_pipeline(raw_csv: str, conn: sqlite3.Connection,
                 config: SalesETLConfig) -> dict:
    """
    Orchestrate the full ETL pipeline.
    Returns a pipeline summary dict.
    """
    pipeline_start = time.time()
    logger.info("Pipeline starting — table=%s, dry_run=%s",
                config.target_table, config.dry_run)

    try:
        with PipelineStage("extract"):
            raw_df = extract(raw_csv)

        with PipelineStage("transform"):
            result = transform(raw_df, config)
            summary_df = result["data"]
            rejected_df = result["rejected"]

        with PipelineStage("load"):
            load_meta = load(summary_df, conn, config)

    except ExtractError as e:
        logger.error("Pipeline aborted at Extract: %s", e)
        raise
    except TransformError as e:
        logger.error("Pipeline aborted at Transform: %s", e)
        raise
    except LoadError as e:
        logger.error("Pipeline aborted at Load: %s", e)
        raise

    duration = round(time.time() - pipeline_start, 3)
    rejection_rate = len(rejected_df) / len(raw_df) * 100 if len(raw_df) > 0 else 0

    summary = {
        "rows_extracted": len(raw_df),
        "rows_valid": len(summary_df),
        "rows_rejected": len(rejected_df),
        "rejection_rate_pct": round(rejection_rate, 1),
        "rows_loaded": load_meta["rows_written"],
        "duration_seconds": duration,
        "table": config.target_table,
        "dry_run": config.dry_run,
    }

    logger.info(
        "Pipeline complete: %d extracted, %d loaded, %d rejected (%.1f%%), %.3fs",
        summary["rows_extracted"],
        summary["rows_loaded"],
        summary["rows_rejected"],
        summary["rejection_rate_pct"],
        summary["duration_seconds"],
    )
    return summary


# ---------------------------------------------------------------
# Execute the pipeline
# ---------------------------------------------------------------

conn = sqlite3.connect(":memory:")
config = SalesETLConfig(min_amount=0.0, target_table="sales_summary")

print("=" * 60)
print("RUN 1")
print("=" * 60)
run1_summary = run_pipeline(RAW_TRANSACTIONS, conn, config)

print("\nPipeline summary:")
for k, v in run1_summary.items():
    print(f"  {k}: {v}")

print("\nLoaded table:")
print(pd.read_sql("SELECT * FROM sales_summary ORDER BY region", conn))
```

---

### Part 4: Testing, Idempotency, and Reflection (30 minutes)

#### Verify Idempotency and dry_run

```python
# ---------------------------------------------------------------
# Idempotency test: run twice, verify identical results
# ---------------------------------------------------------------

print("\n" + "=" * 60)
print("RUN 2 (idempotency test)")
print("=" * 60)

run2_summary = run_pipeline(RAW_TRANSACTIONS, conn, config)

# Check row counts are identical
assert run1_summary["rows_loaded"] == run2_summary["rows_loaded"], \
    "Idempotency failed: row counts differ between runs"

print("\nIdempotency check PASSED — both runs produced identical results")

# Verify table contents are identical between runs
table_after_run2 = pd.read_sql("SELECT * FROM sales_summary ORDER BY region", conn)
print("\nTable after run 2 (should be identical to run 1):")
print(table_after_run2)


# ---------------------------------------------------------------
# Dry run test: verify no data is written
# ---------------------------------------------------------------

print("\n" + "=" * 60)
print("DRY RUN TEST")
print("=" * 60)

dry_config = SalesETLConfig(dry_run=True)
dry_summary = run_pipeline(RAW_TRANSACTIONS, conn, dry_config)

assert dry_summary["rows_loaded"] == 0, "Dry run should not load any rows"
print("\nDry run PASSED — rows_loaded =", dry_summary["rows_loaded"])


# ---------------------------------------------------------------
# Exercise: Add a second transform step
# ---------------------------------------------------------------

# Add month-over-month revenue change using a hardcoded baseline.
# This demonstrates how to chain a second aggregation step.

PREV_MONTH_BASELINE = pd.DataFrame({
    "region":            ["AP",   "EU",   "US"],
    "prev_total_revenue":[400.0, 1000.0, 1500.0],
})

def add_mom_change(summary_df: pd.DataFrame, baseline_df: pd.DataFrame) -> pd.DataFrame:
    """
    Add month-over-month revenue change column.
    Merges current summary with previous period baseline.
    """
    merged = summary_df.merge(baseline_df, on="region", how="left")
    merged["prev_total_revenue"] = merged["prev_total_revenue"].fillna(0)
    merged["mom_change_pct"] = (
        (merged["total_revenue"] - merged["prev_total_revenue"])
        / merged["prev_total_revenue"].replace(0, float("nan"))
        * 100
    ).round(1)
    return merged


# Apply to the loaded summary
current_summary = pd.read_sql("SELECT * FROM sales_summary ORDER BY region", conn)
enriched = add_mom_change(current_summary, PREV_MONTH_BASELINE)
print("\nSummary with MoM revenue change:")
print(enriched[["region", "total_revenue", "prev_total_revenue", "mom_change_pct"]])

conn.close()

print("\n" + "=" * 60)
print("MINI-PROJECT COMPLETE")
print("Patterns demonstrated:")
print("  - PipelineConfig dataclass with __post_init__ validation")
print("  - Custom ExtractError / TransformError / LoadError")
print("  - PipelineStage context manager with automatic timing")
print("  - Dead-letter pattern for rejected rows")
print("  - Overwrite load for idempotency")
print("  - dry_run flag for safe testing")
print("  - run_pipeline() returns structured summary dict")
print("=" * 60)
```

<PracticeBlock
  prompt="Run the complete pipeline above in your own environment. Then modify the SalesETLConfig to set min_amount=100.0 and rerun. Observe how many more rows are rejected and how the regional revenue totals change."
  initialCode={`# Copy the complete pipeline code from Parts 1-4 above, then:
# 1. Create a new config with min_amount=100.0
# 2. Run run_pipeline() with the new config
# 3. Compare rows_rejected between min_amount=0 and min_amount=100

import pandas as pd, io, sqlite3, logging, time
from dataclasses import dataclass

# Paste pipeline code here and experiment with config changes
`}
  hint="Change SalesETLConfig(min_amount=100.0). The invalid_mask in transform() checks unit_price < config.min_amount, so rows with unit_price below 100 will be rejected."
  solution={`# This exercise is open-ended — the key insight is:
# With min_amount=0: rows rejected due to quantity<=0 or unit_price<=0 only
# With min_amount=100: additionally rejects rows where unit_price < 100
# (keyboard at 45.0, mouse at 25.0, cable at 10.0 are rejected)
#
# Run the pipeline from Parts 1-4 and change:
#   config = SalesETLConfig(min_amount=100.0, target_table="sales_summary")
# Compare the rows_rejected count and the regional totals.
print("See the lesson explanation above for the expected behavior.")
print("Try it: the rejection rate should increase significantly with min_amount=100.")`}
/>

---

## Key Takeaways

- **All Section 6 patterns compose into a clean pipeline**: config → extract (validate) → transform (enrich/aggregate) → load (idempotent) → log everything
- **Custom exception hierarchy** (`ExtractError`, `TransformError`, `LoadError`) makes failures easy to diagnose and handle separately
- **`PipelineStage` context manager** keeps business functions clean while adding automatic timing and failure logging
- **Dead-letter rows** are preserved alongside valid output — never silently dropped
- **Overwrite load strategy** makes the pipeline idempotent by design — re-running produces identical results
- **`dry_run=True`** lets you run the full pipeline logic safely without touching the destination — invaluable for testing

---

## What Would Change for Production?

| Aspect | This mini-project | Production equivalent |
|---|---|---|
| Data source | `io.StringIO(RAW_TRANSACTIONS)` | `pd.read_csv("s3://bucket/file.csv")` |
| Destination | `sqlite3.connect(":memory:")` | PostgreSQL, Redshift, BigQuery |
| Watermark state | Not implemented (full load) | Row in `pipeline_state` table |
| Scheduling | Manual run | Airflow DAG or cron |
| Alerting | Print summary | PagerDuty on `rows_rejected_pct > 20%` |
| Dead-letter output | Printed to console | Written to `sales_rejected` table |

---

[← Previous](./lesson-09-config-and-env.md) | [Back to Course](./README.md) | [Next: Section 7 →](../07-sql-databases/lesson-01-sql-and-databases-overview.md)
