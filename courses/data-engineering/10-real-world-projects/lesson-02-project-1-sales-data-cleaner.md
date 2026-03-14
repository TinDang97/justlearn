# Lesson 2: Project 1 — Sales Data Cleaner

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

A CSV export from a legacy sales system contains common real-world data quality problems: mixed date formats, duplicate order IDs, nulls in critical fields, and negative amounts that shouldn't exist. Your task is to build a cleaning pipeline that ingests the raw data, profiles it for quality issues, applies targeted cleaning steps, validates the result against a pandera schema, and prints a structured summary showing exactly what changed.

**Deliverable:** A printed cleaning summary showing `1000 → 952 rows | 18 duplicates removed | 12 nulls filled | 0 validation errors`.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| Reading CSV files with `pd.read_csv()` | Section 3: Data Loading & File Formats |
| Null handling, type conversion, deduplication | Section 4: Data Cleaning |
| Profiling with null rates and cardinality | Section 8: Data Quality & Testing |
| pandera schema validation with lazy evaluation | Section 8: Data Quality & Testing |

---

## Architecture

```
load('data/transactions.csv')
        |
        v
profile(df)           <-- print null rates + cardinality, no mutation
        |
        v
clean(df)             <-- drop dups, fill nulls, parse dates, remove invalid rows
        |
        v
validate(clean_df, schema)  <-- pandera schema check, collect violations
        |
        v
summarize(original_df, clean_df, violations)  <-- print structured summary
        |
        v
        STDOUT: cleaning summary report
```

---

## Dataset

**File:** `data/transactions.csv` | 1,000 rows | 6 columns

| Column | Type | Known Issues |
|--------|------|-------------|
| `order_id` | int | ~18 duplicate values |
| `customer_id` | string | no issues |
| `amount` | float | ~5 null or negative values |
| `status` | string | some inconsistent casing |
| `order_date` | string | mixed formats (`YYYY-MM-DD` and `MM/DD/YYYY`) |
| `region` | string | ~12 nulls |

---

## Starter Code

```python
import pandas as pd
import numpy as np
import io

# --- Bundled dataset (simulates pd.read_csv('data/transactions.csv')) ---
TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,220.00,completed,01/17/2024,East
1004,C001,149.99,completed,2024-01-15,North
1005,C004,,pending,2024-01-18,West
1006,C005,-15.00,cancelled,2024-01-19,North
1007,C006,55.25,completed,2024-01-20,
1008,C007,320.80,completed,2024-01-21,South
1009,C008,90.00,refunded,01/22/2024,East
1010,C009,410.50,completed,2024-01-23,West
1011,C010,75.00,Completed,2024-01-24,North
1012,C011,185.00,completed,2024-01-25,South
"""


def load(csv_string: str) -> pd.DataFrame:
    """Load transactions from a CSV string (simulates reading from disk).

    Returns:
        Raw DataFrame with original dtypes as inferred by pandas.
    """
    return pd.read_csv(io.StringIO(csv_string))


def profile(df: pd.DataFrame) -> dict:
    """Profile the DataFrame for quality issues without mutating it.

    Computes and prints:
    - Row count and column count
    - Null rate per column (nulls / total rows)
    - Cardinality (unique value count) per categorical column

    Returns:
        Dict with 'null_rates' and 'cardinality' keys for downstream use.
    """
    # TODO: compute null rates per column
    # null_rates = df.isnull().mean().round(4)

    # TODO: compute cardinality for string/object columns
    # cardinality = {col: df[col].nunique() for col in df.select_dtypes(include='object').columns}

    # TODO: print a formatted profile summary
    # Example output:
    #   PROFILE: 12 rows x 6 columns
    #   Null rates: amount=0.0833, region=0.0833
    #   Cardinality: customer_id=11, status=5, region=5

    profile_result = {}
    return profile_result


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the transactions DataFrame.

    Steps (in order):
    1. Drop exact duplicate rows based on order_id
    2. Fill missing region values with 'Unknown'
    3. Parse order_date to datetime using pd.to_datetime(errors='coerce')
    4. Drop rows where amount is null or negative (invalid business data)
    5. Normalize status to lowercase

    Returns:
        Cleaned DataFrame (does not modify the input — work on a copy).
    """
    # TODO: Step 1 — drop duplicate order_ids
    # df_clean = df.drop_duplicates(subset=['order_id'])

    # TODO: Step 2 — fill missing region
    # df_clean['region'] = df_clean['region'].fillna('Unknown')

    # TODO: Step 3 — parse order_date
    # df_clean['order_date'] = pd.to_datetime(df_clean['order_date'], errors='coerce')

    # TODO: Step 4 — remove rows with null or negative amount
    # df_clean = df_clean[df_clean['amount'].notna() & (df_clean['amount'] > 0)]

    # TODO: Step 5 — normalize status to lowercase
    # df_clean['status'] = df_clean['status'].str.lower().str.strip()

    return df.copy()  # replace this with df_clean


def validate(df: pd.DataFrame) -> list:
    """Validate the cleaned DataFrame against a set of rules.

    Validation rules:
    - order_id must be unique
    - amount must be > 0
    - status must be one of: completed, pending, cancelled, refunded
    - order_date must not be null (NaT)

    Returns:
        List of violation strings. Empty list means no violations.
    """
    violations = []

    # TODO: check order_id uniqueness
    # dup_ids = df[df.duplicated(subset=['order_id'])]['order_id'].tolist()
    # if dup_ids:
    #     violations.append(f"Duplicate order_ids: {dup_ids}")

    # TODO: check amount > 0
    # invalid_amounts = df[df['amount'] <= 0]
    # if not invalid_amounts.empty:
    #     violations.append(f"{len(invalid_amounts)} rows with amount <= 0")

    # TODO: check status values
    # valid_statuses = {'completed', 'pending', 'cancelled', 'refunded'}
    # bad_status = df[~df['status'].isin(valid_statuses)]
    # if not bad_status.empty:
    #     violations.append(f"{len(bad_status)} rows with invalid status: {bad_status['status'].unique().tolist()}")

    # TODO: check order_date not null
    # null_dates = df[df['order_date'].isna()]
    # if not null_dates.empty:
    #     violations.append(f"{len(null_dates)} rows with null order_date")

    return violations


def summarize(original: pd.DataFrame, cleaned: pd.DataFrame, violations: list) -> str:
    """Print a structured cleaning summary and return it as a string.

    Output format:
        ===== CLEANING SUMMARY =====
        Rows in:             1000
        Rows out:             952
        Duplicates removed:    18
        Nulls filled (region): 12
        Validation errors:      0
        ============================

    Returns:
        The formatted summary string.
    """
    rows_in = len(original)
    rows_out = len(cleaned)
    duplicates_removed = rows_in - len(original.drop_duplicates(subset=['order_id']))
    nulls_filled = original['region'].isna().sum()
    error_count = len(violations)

    lines = [
        "===== CLEANING SUMMARY =====",
        f"{'Rows in:':<26} {rows_in:>6}",
        f"{'Rows out:':<26} {rows_out:>6}",
        f"{'Duplicates removed:':<26} {duplicates_removed:>6}",
        f"{'Nulls filled (region):':<26} {nulls_filled:>6}",
        f"{'Validation errors:':<26} {error_count:>6}",
        "============================",
    ]
    if violations:
        lines.append("\nViolations:")
        for v in violations:
            lines.append(f"  - {v}")

    summary = "\n".join(lines)
    print(summary)
    return summary


def main():
    """Orchestrate the full cleaning pipeline."""
    print("Loading transactions...")
    raw_df = load(TRANSACTIONS_CSV)

    print("\nProfiling raw data...")
    profile(raw_df)

    print("\nCleaning data...")
    clean_df = clean(raw_df)

    print("\nValidating cleaned data...")
    violations = validate(clean_df)

    print()
    summarize(raw_df, clean_df, violations)


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Load and Profile (20 minutes)

The `load()` function uses `io.StringIO` to simulate reading from disk — in a real environment this would be `pd.read_csv('data/transactions.csv')`. After loading, call `profile()` to understand what you are working with before touching the data.

```python
def load(csv_string: str) -> pd.DataFrame:
    return pd.read_csv(io.StringIO(csv_string))

def profile(df: pd.DataFrame) -> dict:
    null_rates = df.isnull().mean().round(4)
    cardinality = {col: df[col].nunique()
                   for col in df.select_dtypes(include='object').columns}

    print(f"PROFILE: {len(df)} rows x {len(df.columns)} columns")
    non_zero_nulls = null_rates[null_rates > 0]
    if not non_zero_nulls.empty:
        null_str = ", ".join(f"{col}={rate}" for col, rate in non_zero_nulls.items())
        print(f"Null rates: {null_str}")
    else:
        print("Null rates: none")
    card_str = ", ".join(f"{k}={v}" for k, v in cardinality.items())
    print(f"Cardinality: {card_str}")

    return {'null_rates': null_rates, 'cardinality': cardinality}
```

**What to look for in the profile output:**
- `amount` null rate > 0 → rows to drop
- `region` null rate > 0 → rows to fill
- `status` cardinality > 4 → inconsistent casing (should be exactly 4 values)

---

### Step 2: Clean (30 minutes)

Implement `clean()` with the four cleaning steps in order. Work on a copy — never mutate the original DataFrame. You need the original to compute the diff in `summarize()`.

```python
def clean(df: pd.DataFrame) -> pd.DataFrame:
    df_clean = df.copy()

    # Step 1: Drop exact duplicate rows on order_id
    before_dedup = len(df_clean)
    df_clean = df_clean.drop_duplicates(subset=['order_id'])
    print(f"  Deduplication: {before_dedup - len(df_clean)} rows removed")

    # Step 2: Fill missing region with 'Unknown'
    null_region_count = df_clean['region'].isna().sum()
    df_clean['region'] = df_clean['region'].fillna('Unknown')
    print(f"  Region nulls filled: {null_region_count}")

    # Step 3: Parse order_date (handles both YYYY-MM-DD and MM/DD/YYYY)
    df_clean['order_date'] = pd.to_datetime(df_clean['order_date'], errors='coerce')

    # Step 4: Drop rows with null or negative amount
    before_amount = len(df_clean)
    df_clean = df_clean[df_clean['amount'].notna() & (df_clean['amount'] > 0)]
    print(f"  Invalid amounts removed: {before_amount - len(df_clean)}")

    # Step 5: Normalize status to lowercase
    df_clean['status'] = df_clean['status'].str.lower().str.strip()

    return df_clean
```

<Info>
`pd.to_datetime(errors='coerce')` converts unparseable dates to `NaT` (Not a Time) instead of raising an exception. This is the correct default for dirty data — you convert what you can, then drop or flag the rows that couldn't be parsed.
</Info>

---

### Step 3: Validate (20 minutes)

After cleaning, verify the output matches your expected data contract. In production, this would use pandera — here we implement the checks manually to make the rules explicit:

```python
def validate(df: pd.DataFrame) -> list:
    violations = []

    # Rule 1: order_id must be unique
    dup_ids = df[df.duplicated(subset=['order_id'])]['order_id'].tolist()
    if dup_ids:
        violations.append(f"Duplicate order_ids: {dup_ids}")

    # Rule 2: amount must be > 0
    invalid_amounts = df[df['amount'] <= 0]
    if not invalid_amounts.empty:
        violations.append(f"{len(invalid_amounts)} rows with amount <= 0")

    # Rule 3: status must be in the allowed set
    valid_statuses = {'completed', 'pending', 'cancelled', 'refunded'}
    bad_status = df[~df['status'].isin(valid_statuses)]
    if not bad_status.empty:
        violations.append(
            f"{len(bad_status)} rows with invalid status: "
            f"{bad_status['status'].unique().tolist()}"
        )

    # Rule 4: order_date must not be null
    null_dates = df[df['order_date'].isna()]
    if not null_dates.empty:
        violations.append(f"{len(null_dates)} rows with null order_date")

    return violations
```

---

### Step 4: Summarize (15 minutes)

The `summarize()` function computes diffs by comparing original and cleaned DataFrames. The formatting uses f-string alignment with `<` (left-align) and `>` (right-align) for clean column output:

```python
def summarize(original: pd.DataFrame, cleaned: pd.DataFrame, violations: list) -> str:
    rows_in = len(original)
    rows_out = len(cleaned)
    duplicates_removed = rows_in - len(original.drop_duplicates(subset=['order_id']))
    nulls_filled = original['region'].isna().sum()
    error_count = len(violations)

    lines = [
        "===== CLEANING SUMMARY =====",
        f"{'Rows in:':<26} {rows_in:>6}",
        f"{'Rows out:':<26} {rows_out:>6}",
        f"{'Duplicates removed:':<26} {duplicates_removed:>6}",
        f"{'Nulls filled (region):':<26} {nulls_filled:>6}",
        f"{'Validation errors:':<26} {error_count:>6}",
        "============================",
    ]
    summary = "\n".join(lines)
    print(summary)
    return summary
```

---

## Expected Output

When your pipeline runs correctly against the bundled dataset, you should see:

```
Loading transactions...

Profiling raw data...
PROFILE: 12 rows x 6 columns
Null rates: amount=0.0833, region=0.0833
Cardinality: customer_id=11, status=5, region=5

Cleaning data...
  Deduplication: 1 rows removed
  Region nulls filled: 1
  Invalid amounts removed: 2

Validating cleaned data...

===== CLEANING SUMMARY =====
Rows in:                   12
Rows out:                   9
Duplicates removed:         1
Nulls filled (region):      1
Validation errors:          0
============================
```

On the full 1,000-row transactions dataset the numbers scale proportionally: `~1000 → ~952 rows | ~18 duplicates removed | ~12 nulls filled | 0 validation errors`.

---

## Practice Exercises

<PracticeBlock
  prompt="Implement the `clean(df)` function. It should: (1) drop duplicate order_ids, (2) fill null region values with 'Unknown', (3) parse order_date to datetime, (4) drop rows with null or negative amount, (5) normalize status to lowercase. Print a one-line count for each step. Return the cleaned DataFrame."
  initialCode={`import pandas as pd
import numpy as np
import io

TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,220.00,completed,01/17/2024,East
1004,C001,149.99,completed,2024-01-15,North
1005,C004,,pending,2024-01-18,West
1006,C005,-15.00,cancelled,2024-01-19,North
1007,C006,55.25,completed,2024-01-20,
1008,C007,320.80,completed,2024-01-21,South
"""

def clean(df: pd.DataFrame) -> pd.DataFrame:
    # TODO: implement cleaning steps
    return df.copy()

raw = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
print("Before:", len(raw), "rows")
cleaned = clean(raw)
print("After:", len(cleaned), "rows")
print(cleaned[['order_id', 'amount', 'status', 'order_date', 'region']])`}
  hint="Work on df.copy(). Use drop_duplicates(subset=['order_id']), fillna('Unknown'), pd.to_datetime(errors='coerce'), boolean filter for amount, and .str.lower().str.strip() for status."
  solution={`import pandas as pd
import numpy as np
import io

TRANSACTIONS_CSV = """order_id,customer_id,amount,status,order_date,region
1001,C001,149.99,completed,2024-01-15,North
1002,C002,84.50,pending,2024-01-16,South
1003,C003,220.00,completed,01/17/2024,East
1004,C001,149.99,completed,2024-01-15,North
1005,C004,,pending,2024-01-18,West
1006,C005,-15.00,cancelled,2024-01-19,North
1007,C006,55.25,completed,2024-01-20,
1008,C007,320.80,completed,2024-01-21,South
"""

def clean(df: pd.DataFrame) -> pd.DataFrame:
    df_clean = df.copy()

    before = len(df_clean)
    df_clean = df_clean.drop_duplicates(subset=['order_id'])
    print(f"  Deduplication: {before - len(df_clean)} rows removed")

    null_region = df_clean['region'].isna().sum()
    df_clean['region'] = df_clean['region'].fillna('Unknown')
    print(f"  Region nulls filled: {null_region}")

    df_clean['order_date'] = pd.to_datetime(df_clean['order_date'], errors='coerce')

    before_amt = len(df_clean)
    df_clean = df_clean[df_clean['amount'].notna() & (df_clean['amount'] > 0)]
    print(f"  Invalid amounts removed: {before_amt - len(df_clean)}")

    df_clean['status'] = df_clean['status'].str.lower().str.strip()

    return df_clean

raw = pd.read_csv(io.StringIO(TRANSACTIONS_CSV))
print("Before:", len(raw), "rows")
cleaned = clean(raw)
print("After:", len(cleaned), "rows")
print(cleaned[['order_id', 'amount', 'status', 'order_date', 'region']])`}
/>

---

## Extension Challenges

1. **Audit log column**: Add a `cleaning_notes` column to the output DataFrame. For each row, record a comma-separated string explaining what was changed (e.g., `"region_filled"`, `"date_coerced"`, `"status_normalized"`). Rows with no changes get an empty string.

2. **Config-driven thresholds**: Replace the hardcoded `amount > 0` rule with a config dict: `CONFIG = {'min_amount': 0, 'required_region': True, 'valid_statuses': [...]}`. The `clean()` function should read all thresholds from `CONFIG`. This makes the pipeline reusable for different datasets without code changes.

3. **Pytest test suite**: Write three pytest tests for `clean()`: (a) test that duplicate order_ids are removed, (b) test that null regions are filled with 'Unknown', (c) test that negative amounts are dropped. Use `pd.DataFrame` constructors to build test inputs instead of reading from CSV.

---

## Key Takeaways

- Profile before cleaning — never modify data without first understanding the extent of quality issues
- `drop_duplicates(subset=[key])` removes rows with repeated key values; `.duplicated()` identifies them without removing
- `pd.to_datetime(errors='coerce')` is the safe default for dirty date strings — it converts failures to `NaT` instead of raising
- Work on a copy (`df.copy()`) when cleaning — the original is needed to compute diffs in the summary
- Validation after cleaning confirms the cleaning logic actually fixed the problems it was supposed to fix

---

[← Lesson 1: Project Overview and Setup](./lesson-01-project-overview-and-setup.md) | [Next Lesson: Project 2 — Log File Analyzer →](./lesson-03-project-2-log-file-analyzer.md)
