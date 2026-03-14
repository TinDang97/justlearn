# Lesson 6: Logging — Pipeline Audit Trails

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Configure Python's `logging` module for pipeline use
- Use appropriate log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Log pipeline lifecycle events: start, stage completion, row counts, errors
- Build a `PipelineStage` context manager that logs timing and failure automatically

---

## Prerequisites

- Lesson 5: Error Handling
- Python context managers (`with` statement)
- Basic Python `logging` module concepts

---

## Lesson Outline

### Part 1: Python Logging Basics (30 minutes)

#### Setting Up a Pipeline Logger

Python's `logging` module is the standard for all production-grade output. Using `print()` in pipelines is an anti-pattern — you cannot control output level, route messages to files, or integrate with monitoring systems.

```python
import logging
import pandas as pd
import io

# ---------------------------------------------------------------
# Configure the root logger once, at pipeline entry point
# ---------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Create a module-level logger — use __name__ in real modules
logger = logging.getLogger("sales_pipeline")

RAW_DATA = """order_id,amount,product
1001,250.0,laptop
1002,45.5,keyboard
1003,-10.0,invalid
1004,89.9,mouse
"""


def extract(raw_data: str) -> pd.DataFrame:
    logger.info("Extract: reading data")
    df = pd.read_csv(io.StringIO(raw_data))
    logger.info("Extract: complete, %d rows", len(df))
    return df


def transform(df: pd.DataFrame) -> pd.DataFrame:
    rows_in = len(df)
    logger.info("Transform: starting with %d rows", rows_in)

    result = df[df["amount"] > 0].copy()
    null_count = df["amount"].isna().sum()

    if null_count > 0:
        logger.warning("Transform: %d null amount rows removed", null_count)

    rows_rejected = rows_in - len(result)
    if rows_rejected > 0:
        logger.warning("Transform: %d rows rejected (amount <= 0)", rows_rejected)

    logger.info("Transform: complete, %d rows", len(result))
    return result


def load(df: pd.DataFrame) -> int:
    logger.info("Load: writing %d rows", len(df))
    # Simulate write
    rows = len(df)
    logger.info("Load: complete")
    return rows


# Run the pipeline
logger.info("Pipeline starting")
raw_df = extract(RAW_DATA)
clean_df = transform(raw_df)
n = load(clean_df)
logger.info("Pipeline complete: %d rows loaded", n)
```

#### Log Level Guidelines for Pipelines

| Level | When to use | Example |
|---|---|---|
| `DEBUG` | Detailed trace — only during development | Row values, intermediate calculations |
| `INFO` | Normal progress markers | "Extract complete: 1450 rows" |
| `WARNING` | Something unexpected but recoverable | "Null values found: 12 rows removed" |
| `ERROR` | A stage failed but pipeline may continue | "Transform failed for batch 3" |
| `CRITICAL` | Pipeline must abort immediately | "Database connection lost" |

Use `%s` formatting (not f-strings) in log calls — the string is only formatted if the log level is enabled:
```python
# Good: message formatted only if DEBUG level is enabled
logger.debug("Processing row %d: %s", row_id, row_data)

# Bad: f-string evaluated even when DEBUG is disabled
logger.debug(f"Processing row {row_id}: {row_data}")
```

---

### Part 2: Logger Hierarchy and Module Loggers (30 minutes)

#### Module-Specific Loggers

In a multi-module pipeline, each module creates its own logger using `getLogger(__name__)`. This gives you per-module log control.

```python
import logging
import pandas as pd
import io

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s [%(name)s]: %(message)s",
    datefmt="%H:%M:%S",
)

# Separate loggers for separate modules
extract_logger = logging.getLogger("pipeline.extract")
transform_logger = logging.getLogger("pipeline.transform")
load_logger = logging.getLogger("pipeline.load")

# Set different levels per module
extract_logger.setLevel(logging.INFO)   # less verbose
transform_logger.setLevel(logging.DEBUG)  # more verbose during dev
load_logger.setLevel(logging.INFO)


RAW = """id,value
1,100
2,200
3,300
"""

def extract(raw: str) -> pd.DataFrame:
    extract_logger.debug("Starting extraction")
    df = pd.read_csv(io.StringIO(raw))
    extract_logger.info("Extracted %d rows", len(df))
    return df

def transform(df: pd.DataFrame) -> pd.DataFrame:
    transform_logger.debug("Input dtypes: %s", df.dtypes.to_dict())
    result = df.copy()
    result["doubled"] = result["value"] * 2
    transform_logger.debug("Added 'doubled' column")
    transform_logger.info("Transform complete: %d rows", len(result))
    return result

def load(df: pd.DataFrame) -> int:
    load_logger.info("Loading %d rows", len(df))
    return len(df)


# Run with module loggers
raw_df = extract(RAW)
clean_df = transform(raw_df)
n = load(clean_df)
```

The logger name `"pipeline.extract"` is a child of `"pipeline"`, which is a child of the root logger. Setting the level on a parent controls all children unless they override it.

---

### Part 3: Structured Pipeline Logging with a Context Manager (30 minutes)

#### PipelineStage Context Manager

A context manager that automatically logs stage entry, exit, duration, and exceptions keeps each stage function clean of boilerplate.

```python
import logging
import time
import pandas as pd
import io

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger("etl")


class PipelineStage:
    """
    Context manager that logs stage start, completion, and any failures.

    Usage:
        with PipelineStage("extract", logger):
            df = pd.read_csv(...)
    """

    def __init__(self, name: str, logger: logging.Logger):
        self.name = name
        self.logger = logger
        self.start_time = None

    def __enter__(self) -> "PipelineStage":
        self.start_time = time.time()
        self.logger.info("Stage '%s' starting", self.name)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        duration = time.time() - self.start_time
        if exc_type is not None:
            self.logger.error(
                "Stage '%s' FAILED after %.3fs: %s",
                self.name, duration, exc_val
            )
        else:
            self.logger.info(
                "Stage '%s' complete in %.3fs",
                self.name, duration
            )
        return False  # never suppress exceptions


RAW_DATA = """order_id,amount,product
1001,250.0,laptop
1002,45.5,keyboard
1003,89.9,mouse
"""


def run_pipeline(raw_data: str) -> dict:
    """Run ETL pipeline with automatic stage logging."""
    metrics = {}

    with PipelineStage("extract", logger):
        raw_df = pd.read_csv(io.StringIO(raw_data))
        metrics["rows_extracted"] = len(raw_df)

    with PipelineStage("transform", logger):
        clean_df = raw_df[raw_df["amount"] > 0].copy()
        clean_df["revenue"] = clean_df["amount"]  # simplified
        metrics["rows_transformed"] = len(clean_df)
        metrics["rows_rejected"] = metrics["rows_extracted"] - len(clean_df)

    with PipelineStage("load", logger):
        # Simulate write
        metrics["rows_loaded"] = len(clean_df)

    rejection_pct = (
        metrics["rows_rejected"] / metrics["rows_extracted"] * 100
        if metrics["rows_extracted"] > 0 else 0
    )

    logger.info(
        "Pipeline summary: %d extracted, %d loaded, %d rejected (%.1f%%)",
        metrics["rows_extracted"],
        metrics["rows_loaded"],
        metrics["rows_rejected"],
        rejection_pct,
    )

    return metrics


result = run_pipeline(RAW_DATA)
print("\nMetrics dict:", result)
```

The `return False` in `__exit__` is critical — it means exceptions are NOT suppressed. The stage logs the error and lets the exception propagate normally.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Add Logging to an ETL Pipeline

<PracticeBlock
  prompt="Add logging to the extract/transform/load pipeline below. Every stage must log: (1) stage name at INFO level when starting, (2) rows in / rows out at INFO level on completion, (3) any errors at ERROR level. Use logging.basicConfig and a single named logger."
  initialCode={`import logging
import pandas as pd
import io

# TODO: configure logging with basicConfig
# format: "%(asctime)s %(levelname)s: %(message)s"
# datefmt: "%H:%M:%S"
# level: INFO

# TODO: create logger = logging.getLogger("etl_pipeline")

RAW = """id,amount,product
1,100.0,apple
2,-50.0,bad_row
3,200.0,orange
4,150.0,grape
"""

def extract(raw: str) -> pd.DataFrame:
    # TODO: log "Extract starting"
    df = pd.read_csv(io.StringIO(raw))
    # TODO: log rows extracted
    return df

def transform(df: pd.DataFrame) -> pd.DataFrame:
    # TODO: log rows in
    result = df[df["amount"] > 0].copy()
    # TODO: log rows out and rows rejected
    return result

def load(df: pd.DataFrame) -> int:
    # TODO: log rows being loaded
    n = len(df)
    # TODO: log completion
    return n

raw_df = extract(RAW)
clean_df = transform(raw_df)
n = load(clean_df)
`}
  hint="Use logger.info('Extract starting'). After read_csv, use logger.info('Extract complete: %d rows', len(df)). In transform, compute rejected = rows_in - len(result) and log it."
  solution={`import logging
import pandas as pd
import io

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("etl_pipeline")

RAW = """id,amount,product
1,100.0,apple
2,-50.0,bad_row
3,200.0,orange
4,150.0,grape
"""

def extract(raw: str) -> pd.DataFrame:
    logger.info("Extract starting")
    try:
        df = pd.read_csv(io.StringIO(raw))
        logger.info("Extract complete: %d rows", len(df))
        return df
    except Exception as e:
        logger.error("Extract failed: %s", e)
        raise

def transform(df: pd.DataFrame) -> pd.DataFrame:
    rows_in = len(df)
    logger.info("Transform starting: %d rows in", rows_in)
    result = df[df["amount"] > 0].copy()
    rejected = rows_in - len(result)
    if rejected:
        logger.info("Transform: %d rows rejected (amount <= 0)", rejected)
    logger.info("Transform complete: %d rows out", len(result))
    return result

def load(df: pd.DataFrame) -> int:
    logger.info("Load starting: %d rows", len(df))
    n = len(df)
    logger.info("Load complete: %d rows written", n)
    return n

raw_df = extract(RAW)
clean_df = transform(raw_df)
n = load(clean_df)`}
/>

#### Exercise 2: Pipeline Summary Logger

<PracticeBlock
  prompt="Write a run_summary(stage_metrics) function that accepts a dict of stage metrics and logs a single final summary line: 'Pipeline complete: 3 stages, N rows extracted, N rows loaded, N rows rejected (X.X%), total N.NNNs'. Then build a pipeline that accumulates metrics and calls run_summary at the end."
  initialCode={`import logging
import time
import pandas as pd
import io

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("etl")

RAW = """id,amount,product
1,100.0,apple
2,-50.0,bad
3,200.0,orange
4,150.0,grape
5,-30.0,bad2
"""

# TODO: write run_summary(metrics: dict) -> None
# metrics will have: extracted, loaded, rejected, duration, stages
# Log: "Pipeline complete: {stages} stages, {extracted} rows extracted,
#       {loaded} rows loaded, {rejected} rows rejected ({pct:.1f}%),
#       total {duration:.3f}s"

# TODO: build pipeline that tracks metrics and calls run_summary
`}
  hint="rejection_pct = rejected / extracted * 100 if extracted > 0 else 0. Use logger.info with %s format placeholders for all values."
  solution={`import logging
import time
import pandas as pd
import io

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("etl")

RAW = """id,amount,product
1,100.0,apple
2,-50.0,bad
3,200.0,orange
4,150.0,grape
5,-30.0,bad2
"""

def run_summary(metrics: dict) -> None:
    pct = (metrics["rejected"] / metrics["extracted"] * 100
           if metrics["extracted"] > 0 else 0)
    logger.info(
        "Pipeline complete: %d stages, %d rows extracted, %d rows loaded, "
        "%d rows rejected (%.1f%%), total %.3fs",
        metrics["stages"],
        metrics["extracted"],
        metrics["loaded"],
        metrics["rejected"],
        pct,
        metrics["duration"],
    )

start = time.time()
metrics = {"stages": 3}

df = pd.read_csv(io.StringIO(RAW))
metrics["extracted"] = len(df)
logger.info("Extract: %d rows", len(df))

clean_df = df[df["amount"] > 0].copy()
metrics["rejected"] = len(df) - len(clean_df)
logger.info("Transform: %d valid, %d rejected", len(clean_df), metrics["rejected"])

metrics["loaded"] = len(clean_df)
logger.info("Load: %d rows", len(clean_df))

metrics["duration"] = time.time() - start
run_summary(metrics)`}
/>

---

## Key Takeaways

- **`getLogger(__name__)`** creates a module-specific logger that participates in the hierarchy
- **Log at stage boundaries** (INFO): stage start, rows in, rows out, stage completion
- **Log data quality issues** (WARNING): nulls removed, rows rejected, schema mismatches
- **Log failures** (ERROR): exception message, stage name, optionally the exception object with `exc_info=True`
- **Use `%s` format** in log calls, not f-strings — the string is only formatted if the level is enabled
- **`PipelineStage` context manager** keeps stage functions clean by automating timing and failure logging

---

## Common Mistakes to Avoid

- Using `print()` in production pipelines — cannot be controlled by log level or routed to files
- Using f-strings in log calls — always format eagerly even when the level is disabled (performance issue)
- Not logging rejected row counts — makes it impossible to detect data quality degradation
- Catching exceptions, logging, and swallowing — always re-raise after logging

---

[← Previous](./lesson-05-error-handling.md) | [Back to Course](./README.md) | [Next →](./lesson-07-pipeline-orchestration.md)
