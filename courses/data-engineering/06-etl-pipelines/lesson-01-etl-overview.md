# Lesson 1: What Is an ETL Pipeline?

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand Extract, Transform, Load as distinct pipeline stages
- Identify the responsibilities of each ETL stage
- Recognize common ETL pipeline shapes: batch, incremental, and micro-batch
- Understand why ETL code is structured as functions rather than scripts

---

## Prerequisites

- Python functions and modules
- pandas DataFrames (Section 2)
- io.StringIO for in-memory file simulation

---

## Lesson Outline

### Part 1: The ETL Mental Model (30 minutes)

#### Why Separate Extract, Transform, and Load?

A data pipeline moves data from a source to a destination while applying business logic. The most common mistake beginners make is writing all of this in one block of code — a "script" that reads, processes, and writes simultaneously. This creates three problems:

- **Untestable**: you cannot test the business logic without also triggering I/O
- **Non-retryable**: if the load fails, you have to re-run everything including the slow extract
- **Hard to replace**: changing the source format requires touching transformation code

The ETL pattern solves this by assigning each concern to a separate function:

- **Extract**: read raw data from the source; return it unchanged
- **Transform**: apply all business logic; no I/O allowed
- **Load**: write the result to the destination; no business logic allowed

```python
import pandas as pd
import io

# ---------------------------------------------------------------
# Naive approach: reading, logic, and output all mixed together
# ---------------------------------------------------------------

def process_sales_naive(raw_data: str) -> None:
    df = pd.read_csv(io.StringIO(raw_data))      # I/O
    df = df[df["amount"] > 0]                     # business logic
    df["revenue"] = df["amount"] * df["price"]   # business logic
    print(df.to_csv(index=False))                 # output mixed with logic


# ---------------------------------------------------------------
# ETL approach: clear separation of concerns
# ---------------------------------------------------------------

def extract(raw_data: str) -> pd.DataFrame:
    """Read raw data. No business logic here."""
    return pd.read_csv(io.StringIO(raw_data))


def transform(df: pd.DataFrame) -> pd.DataFrame:
    """Apply business logic. No I/O here."""
    df = df[df["amount"] > 0].copy()
    df["revenue"] = df["amount"] * df["price"]
    return df


def load(df: pd.DataFrame) -> str:
    """Write output. No business logic here."""
    return df.to_csv(index=False)


# Pipeline: compose the three stages
def run_pipeline(raw_data: str) -> str:
    return load(transform(extract(raw_data)))


# ---------------------------------------------------------------
# Run it
# ---------------------------------------------------------------

raw_csv = """amount,price,product
10,2.5,apple
-5,1.0,bad_row
8,3.0,orange
"""

result = run_pipeline(raw_csv)
print(result)
```

Notice that `transform` can be tested with any DataFrame — no CSV required. If the load destination changes, `load` is the only function that changes.

---

### Part 2: Pipeline Shapes (30 minutes)

#### Batch, Incremental, and Micro-Batch

Not all pipelines process all data every run. Three shapes are common in production:

**Full batch**: extract the entire dataset, transform it, load it. Simple to reason about, but slow for large datasets. Run once per day or hour.

**Incremental (watermark-based)**: track the last processed timestamp or ID. Each run extracts only records newer than the watermark.

**Micro-batch**: small batches triggered every few seconds or minutes. Used when near-real-time freshness matters. Spark Structured Streaming and Kafka Streams are typical tools — conceptual for now.

```python
import pandas as pd
import io
from datetime import datetime

# Simulated source data with timestamps
SOURCE_DATA = """id,amount,created_at
1,100,2024-01-01
2,200,2024-01-02
3,300,2024-01-03
4,400,2024-01-04
5,500,2024-01-05
"""

def extract_incremental(raw_data: str, watermark: str) -> pd.DataFrame:
    """Extract only records created after the watermark date."""
    df = pd.read_csv(io.StringIO(raw_data))
    df["created_at"] = pd.to_datetime(df["created_at"])
    cutoff = pd.to_datetime(watermark)
    return df[df["created_at"] > cutoff].copy()


# First run: watermark is start of year
batch_1 = extract_incremental(SOURCE_DATA, watermark="2024-01-02")
print("Records after 2024-01-02:")
print(batch_1)
print(f"New watermark: {batch_1['created_at'].max().date()}")

# Second run: watermark advances
batch_2 = extract_incremental(SOURCE_DATA, watermark="2024-01-04")
print("\nRecords after 2024-01-04:")
print(batch_2)
```

The watermark is the key to incremental processing. You store it somewhere (a file, a database row) after each successful run and read it at the start of the next.

---

### Part 3: Pipeline Anatomy (30 minutes)

#### A Production-Style Pipeline Structure

A complete pipeline has more than just three functions. In production code you will see: configuration, timing, record counts, and a clear entry point.

```python
import pandas as pd
import io
import time
from datetime import datetime

# Pipeline configuration — all parameters in one place
CONFIG = {
    "pipeline_name": "sales_daily",
    "min_amount": 0.0,
}

# Simulated raw data
RAW_DATA = """id,product,amount,price
1,apple,10,2.5
2,orange,8,3.0
3,bad,-5,1.0
4,grape,12,4.0
"""


def extract(raw_data: str) -> pd.DataFrame:
    """Read raw data and return as DataFrame."""
    df = pd.read_csv(io.StringIO(raw_data))
    return df


def transform(df: pd.DataFrame, config: dict) -> pd.DataFrame:
    """Apply business logic and return cleaned DataFrame."""
    df = df[df["amount"] > config["min_amount"]].copy()
    df["revenue"] = df["amount"] * df["price"]
    return df


def load(df: pd.DataFrame) -> int:
    """Simulate writing output; return row count."""
    # In production: df.to_sql(...) or df.to_csv(...)
    output = df.to_csv(index=False)
    return len(df)


def main(raw_data: str, config: dict) -> dict:
    """Orchestrate the pipeline and return a summary."""
    start_time = time.time()
    start_ts = datetime.utcnow().isoformat()

    raw_df = extract(raw_data)
    clean_df = transform(raw_df, config)
    rows_loaded = load(clean_df)

    duration = round(time.time() - start_time, 3)

    summary = {
        "pipeline": config["pipeline_name"],
        "started_at": start_ts,
        "records_in": len(raw_df),
        "records_out": rows_loaded,
        "records_rejected": len(raw_df) - rows_loaded,
        "duration_seconds": duration,
    }
    return summary


# Entry point
result = main(RAW_DATA, CONFIG)
for key, value in result.items():
    print(f"{key}: {value}")
```

Key patterns here:
- `CONFIG` dict holds all parameters — easy to change without touching function bodies
- `main()` returns a dict (not `None`) — callers can log it, assert on it, display it
- `load()` returns the row count — a concrete success signal

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Refactor a Script into ETL Functions

The following script processes employee data all in one place. Refactor it into separate `extract()`, `transform()`, and `load()` functions, then verify the output is identical.

<PracticeBlock
  prompt="Refactor the all-in-one script below into separate extract(), transform(), and load() functions. Call them in a run_pipeline() function and verify the CSV output matches."
  initialCode={`import pandas as pd
import io

RAW = """employee_id,name,salary,department
1,Alice,95000,Engineering
2,Bob,72000,Marketing
3,Carol,88000,Engineering
4,Dave,-1000,HR
"""

# All-in-one script — refactor this into extract/transform/load
def process_all_in_one(raw: str) -> str:
    df = pd.read_csv(io.StringIO(raw))
    df = df[df["salary"] > 0].copy()
    df["annual_bonus"] = df["salary"] * 0.1
    return df.to_csv(index=False)

# TODO: write extract(), transform(), load(), run_pipeline()
# Verify: run_pipeline(RAW) == process_all_in_one(RAW)
`}
  hint="extract() returns a DataFrame from io.StringIO. transform() filters and adds the column. load() calls .to_csv(index=False). run_pipeline() chains them."
  solution={`import pandas as pd
import io

RAW = """employee_id,name,salary,department
1,Alice,95000,Engineering
2,Bob,72000,Marketing
3,Carol,88000,Engineering
4,Dave,-1000,HR
"""

def process_all_in_one(raw: str) -> str:
    df = pd.read_csv(io.StringIO(raw))
    df = df[df["salary"] > 0].copy()
    df["annual_bonus"] = df["salary"] * 0.1
    return df.to_csv(index=False)

def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def transform(df: pd.DataFrame) -> pd.DataFrame:
    df = df[df["salary"] > 0].copy()
    df["annual_bonus"] = df["salary"] * 0.1
    return df

def load(df: pd.DataFrame) -> str:
    return df.to_csv(index=False)

def run_pipeline(raw: str) -> str:
    return load(transform(extract(raw)))

original = process_all_in_one(RAW)
refactored = run_pipeline(RAW)
print("Outputs match:", original == refactored)
print(refactored)`}
/>

#### Exercise 2: Pipeline Summary Function

<PracticeBlock
  prompt="Write a pipeline_summary(pipeline_name, start_time, raw_df, clean_df) function that prints a formatted summary showing source rows, valid rows, rejected rows, and duration in seconds."
  initialCode={`import pandas as pd
import io
import time

RAW = """id,product,amount
1,apple,10
2,orange,-5
3,grape,8
4,cherry,-2
5,melon,15
"""

def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["amount"] > 0].copy()

# TODO: write pipeline_summary(pipeline_name, start_time, raw_df, clean_df)
# It should print:
#   Pipeline: <name>
#   Source rows: <n>
#   Valid rows: <n>
#   Rejected rows: <n>
#   Duration: <n.nnn>s

start = time.time()
raw_df = extract(RAW)
clean_df = transform(raw_df)
# pipeline_summary("fruit_etl", start, raw_df, clean_df)
`}
  hint="Duration = time.time() - start_time. Rejected rows = len(raw_df) - len(clean_df)."
  solution={`import pandas as pd
import io
import time

RAW = """id,product,amount
1,apple,10
2,orange,-5
3,grape,8
4,cherry,-2
5,melon,15
"""

def extract(raw: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(raw))

def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["amount"] > 0].copy()

def pipeline_summary(pipeline_name: str, start_time: float,
                     raw_df: pd.DataFrame, clean_df: pd.DataFrame) -> None:
    duration = round(time.time() - start_time, 3)
    rejected = len(raw_df) - len(clean_df)
    print(f"Pipeline: {pipeline_name}")
    print(f"Source rows:   {len(raw_df)}")
    print(f"Valid rows:    {len(clean_df)}")
    print(f"Rejected rows: {rejected}")
    print(f"Duration:      {duration}s")

start = time.time()
raw_df = extract(RAW)
clean_df = transform(raw_df)
pipeline_summary("fruit_etl", start, raw_df, clean_df)`}
/>

---

## Key Takeaways

- **ETL separates reading, logic, and writing** so each stage can be tested, retried, and replaced independently
- **Each stage returns a value** — extract returns a DataFrame, transform returns a DataFrame, load returns row count or metadata
- **Never print inside a stage function** — return the data and let the caller decide what to do with it
- **`run_pipeline()` or `main()` composes E → T → L** and produces a summary dict
- **Batch vs incremental vs micro-batch** are pipeline shapes — choose based on data volume and freshness requirements

---

## Common Mistakes to Avoid

- Doing business logic inside `extract()` — it should only read
- Doing I/O inside `transform()` — it should only compute
- Returning `None` from functions instead of the transformed data
- Using global variables instead of passing config explicitly

---

[← Section 5](../05-data-transformation/README.md) | [Back to Course](./README.md) | [Next →](./lesson-02-extract-patterns.md)
