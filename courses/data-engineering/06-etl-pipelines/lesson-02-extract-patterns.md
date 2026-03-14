# Lesson 2: Extract — Reading from Multiple Sources

**Course:** ETL Pipelines | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Extract from CSV, JSON, and in-memory sources with consistent interfaces
- Handle multi-source extraction by combining DataFrames with source tracking
- Understand the API extraction pattern and how to paginate responses
- Return metadata alongside data for traceability

---

## Prerequisites

- Lesson 1: ETL Overview
- pandas read_csv, read_json (Section 3: Data Loading)
- io.StringIO for in-memory data simulation

---

## Lesson Outline

### Part 1: File-Based Extraction (30 minutes)

#### Consistent Extract Interface

Every extract function should have the same contract regardless of source: accept input parameters, validate that expected columns are present, and return a typed DataFrame.

```python
import pandas as pd
import io

# Simulated CSV source
CSV_DATA = """order_id,customer_id,amount,product
1001,C1,250.00,laptop
1002,C2,45.50,keyboard
1003,C3,-10.00,invalid_refund
1004,C1,89.99,mouse
"""

# Simulated JSON source (list of records)
JSON_DATA = """[
  {"order_id": 2001, "customer_id": "C4", "amount": 199.99, "product": "monitor"},
  {"order_id": 2002, "customer_id": "C5", "amount": 34.99, "product": "cable"}
]"""


def extract_csv(data: str, required_columns: list) -> pd.DataFrame:
    """
    Read a CSV string and validate that required columns exist.
    Raises ValueError if any required column is missing.
    """
    df = pd.read_csv(
        io.StringIO(data),
        dtype={"order_id": int, "amount": float}
    )
    missing = set(required_columns) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    return df


def extract_json(data: str, required_columns: list) -> pd.DataFrame:
    """Read a JSON string (array of objects) and validate columns."""
    df = pd.read_json(io.StringIO(data))
    missing = set(required_columns) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    return df


REQUIRED = ["order_id", "customer_id", "amount", "product"]

csv_df = extract_csv(CSV_DATA, REQUIRED)
json_df = extract_json(JSON_DATA, REQUIRED)

print("CSV extract shape:", csv_df.shape)
print(csv_df)

print("\nJSON extract shape:", json_df.shape)
print(json_df)
```

The `required_columns` check is the extraction boundary: if the source schema changes unexpectedly, the pipeline fails early with a clear error instead of silently producing wrong results downstream.

#### Nested JSON Normalization

Many APIs return nested JSON. `pd.json_normalize()` flattens nested structures into columns:

```python
import pandas as pd

# Nested JSON — common from REST APIs
nested_data = [
    {"id": 1, "user": {"name": "Alice", "region": "EU"}, "amount": 100},
    {"id": 2, "user": {"name": "Bob",   "region": "US"}, "amount": 200},
]

df = pd.json_normalize(nested_data, sep="__")
print(df.columns.tolist())
# ['id', 'amount', 'user__name', 'user__region']
print(df)
```

Use `sep="__"` (double underscore) to avoid name conflicts with single-underscore columns.

---

### Part 2: Multi-Source Extraction (30 minutes)

#### Combining Multiple Sources with Source Tracking

In production, data often comes from multiple files or database shards. When combining, you need to know which source each row came from.

```python
import pandas as pd
import io

# Simulate two regional data files
REGION_A = """order_id,amount,product
1001,250.00,laptop
1002,45.50,keyboard
"""

REGION_B = """order_id,amount,product
2001,199.99,monitor
2002,34.99,cable
2003,89.99,mouse
"""

def extract_one(data: str, source_name: str) -> pd.DataFrame:
    """Extract a single source and tag rows with source name."""
    df = pd.read_csv(io.StringIO(data))
    df["_source"] = source_name
    return df


def extract_multi(sources: dict) -> pd.DataFrame:
    """
    Extract from multiple sources and concatenate.
    sources: dict of {source_name: csv_string}
    Returns single DataFrame with _source column.
    """
    frames = []
    for name, data in sources.items():
        df = extract_one(data, name)
        frames.append(df)
        print(f"  Extracted '{name}': {len(df)} rows")

    combined = pd.concat(frames, ignore_index=True)
    return combined


sources = {
    "region_a": REGION_A,
    "region_b": REGION_B,
}

combined_df = extract_multi(sources)
print(f"\nCombined: {len(combined_df)} rows")
print(combined_df)
print("\nRows per source:")
print(combined_df["_source"].value_counts())
```

The `_source` column (leading underscore signals it is a metadata column, not business data) is invaluable for debugging — when a downstream transform fails, you can trace the row back to its origin file.

#### Schema Drift Detection

When combining multiple sources, column sets may differ. Always check:

```python
import pandas as pd
import io

SOURCE_1 = """id,amount,product
1,100,apple
2,200,orange
"""

SOURCE_2 = """id,amount,product,discount
3,300,grape,0.1
4,400,melon,0.0
"""

def extract_with_drift_check(sources: dict) -> pd.DataFrame:
    frames = []
    reference_cols = None

    for name, data in sources.items():
        df = pd.read_csv(io.StringIO(data))
        df["_source"] = name

        if reference_cols is None:
            reference_cols = set(df.columns) - {"_source"}
        else:
            current_cols = set(df.columns) - {"_source"}
            extra = current_cols - reference_cols
            missing = reference_cols - current_cols
            if extra or missing:
                print(f"Schema drift in '{name}': extra={extra}, missing={missing}")

        frames.append(df)

    # concat with fill — missing columns become NaN
    return pd.concat(frames, ignore_index=True)


result = extract_with_drift_check({"file1": SOURCE_1, "file2": SOURCE_2})
print(result)
```

---

### Part 3: API Extraction Pattern (30 minutes)

#### Simulated REST API Extraction

In production pipelines, data often comes from REST APIs. The pattern involves: make request, check status, parse JSON, convert to DataFrame. Pagination is common.

Since Pyodide cannot make real HTTP requests, this section shows the pattern using a simulated response function:

```python
import pandas as pd

# Simulate paginated API responses
def fake_api_get(page: int, page_size: int = 3) -> dict:
    """Simulates a paginated REST API response."""
    all_items = [
        {"id": 1, "product": "apple",   "amount": 100},
        {"id": 2, "product": "orange",  "amount": 150},
        {"id": 3, "product": "grape",   "amount": 200},
        {"id": 4, "product": "melon",   "amount": 250},
        {"id": 5, "product": "cherry",  "amount": 300},
        {"id": 6, "product": "plum",    "amount": 350},
        {"id": 7, "product": "mango",   "amount": 400},
    ]
    start = (page - 1) * page_size
    end = start + page_size
    items = all_items[start:end]
    return {
        "page": page,
        "total_pages": -(-len(all_items) // page_size),  # ceiling div
        "items": items,
    }


def extract_paginated_api(page_size: int = 3) -> pd.DataFrame:
    """
    Extract all pages from a paginated API.
    In production: replace fake_api_get() with requests.get()
    """
    frames = []
    page = 1

    while True:
        response = fake_api_get(page, page_size)
        items = response.get("items", [])
        if not items:
            break

        batch_df = pd.DataFrame(items)
        frames.append(batch_df)
        print(f"  Page {page}: {len(batch_df)} rows")

        if page >= response["total_pages"]:
            break
        page += 1

    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()


result = extract_paginated_api(page_size=3)
print(f"\nAll pages combined: {len(result)} rows")
print(result)
```

In production, replace `fake_api_get(page, page_size)` with:
```python
response = requests.get(url, params={"page": page, "size": page_size}, timeout=30)
response.raise_for_status()
data = response.json()
```

Always set a `timeout` and call `raise_for_status()` to catch HTTP errors.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Validated CSV Extract

<PracticeBlock
  prompt="Write an extract_csv(data_string, required_columns) function that raises ValueError listing all missing columns if any required column is absent, otherwise returns a typed DataFrame with order_id as int and amount as float."
  initialCode={`import pandas as pd
import io

VALID_DATA = """order_id,customer_id,amount,status
1001,C1,250.00,completed
1002,C2,45.50,pending
"""

BAD_DATA = """order_id,amount
1001,250.00
1002,45.50
"""

# TODO: write extract_csv(data_string, required_columns)
# Test 1: extract_csv(VALID_DATA, ["order_id", "customer_id", "amount", "status"]) succeeds
# Test 2: extract_csv(BAD_DATA, ["order_id", "customer_id", "amount", "status"]) raises ValueError
`}
  hint="Use set(required_columns) - set(df.columns) to find missing columns. Pass dtype={'order_id': int, 'amount': float} to read_csv."
  solution={`import pandas as pd
import io

VALID_DATA = """order_id,customer_id,amount,status
1001,C1,250.00,completed
1002,C2,45.50,pending
"""

BAD_DATA = """order_id,amount
1001,250.00
1002,45.50
"""

def extract_csv(data_string: str, required_columns: list) -> pd.DataFrame:
    df = pd.read_csv(
        io.StringIO(data_string),
        dtype={"order_id": int, "amount": float}
    )
    missing = set(required_columns) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    return df

# Test 1: valid data
df = extract_csv(VALID_DATA, ["order_id", "customer_id", "amount", "status"])
print("Valid extract OK:", df.dtypes["order_id"], df.dtypes["amount"])
print(df)

# Test 2: missing columns
try:
    extract_csv(BAD_DATA, ["order_id", "customer_id", "amount", "status"])
except ValueError as e:
    print("Caught expected error:", e)`}
/>

#### Exercise 2: Multi-Source Extract with Source Tracking

<PracticeBlock
  prompt="Write an extract_multi(data_sources) function that accepts a list of CSV strings, extracts each, adds a source_index column (0, 1, 2...), and returns a single concatenated DataFrame."
  initialCode={`import pandas as pd
import io

SOURCES = [
    """id,product,amount
1,apple,100
2,orange,150
""",
    """id,product,amount
3,grape,200
4,melon,250
""",
    """id,product,amount
5,cherry,300
""",
]

# TODO: write extract_multi(data_sources: list) -> pd.DataFrame
# Each source gets a source_index column: 0, 1, 2...
# Return all sources concatenated with reset index
`}
  hint="Enumerate the list with enumerate(data_sources). Set df['source_index'] = i. Use pd.concat(..., ignore_index=True) to combine."
  solution={`import pandas as pd
import io

SOURCES = [
    """id,product,amount
1,apple,100
2,orange,150
""",
    """id,product,amount
3,grape,200
4,melon,250
""",
    """id,product,amount
5,cherry,300
""",
]

def extract_multi(data_sources: list) -> pd.DataFrame:
    frames = []
    for i, data in enumerate(data_sources):
        df = pd.read_csv(io.StringIO(data))
        df["source_index"] = i
        frames.append(df)
    return pd.concat(frames, ignore_index=True)

result = extract_multi(SOURCES)
print(f"Combined: {len(result)} rows")
print(result)
print("\\nRows per source:")
print(result["source_index"].value_counts().sort_index())`}
/>

---

## Key Takeaways

- **Extract returns a typed DataFrame** — enforce dtypes at the boundary, not inside transforms
- **Validate columns at extraction time** — fail fast with a clear error if schema is wrong
- **Add `_source` column for traceability** — always know where a row came from in multi-source pipelines
- **Schema drift is normal** — detect and log it; use `pd.concat` with `ignore_index=True` to handle extra columns
- **Simulate I/O with `io.StringIO`** in tests — the extract function should not care if data came from a file or string

---

## Common Mistakes to Avoid

- Applying business logic inside `extract()` — it belongs in `transform()`
- Skipping column validation — downstream errors are harder to debug than early failures
- Forgetting `ignore_index=True` when concatenating — duplicate indices cause subtle bugs
- Not adding source tracking when combining multiple files

---

[← Previous](./lesson-01-etl-overview.md) | [Back to Course](./README.md) | [Next →](./lesson-03-transform-patterns.md)
