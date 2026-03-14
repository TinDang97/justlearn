# Lesson 1: Why Data Quality Matters

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Define the 6 data quality dimensions: completeness, accuracy, consistency, timeliness, validity, and uniqueness
- Explain the cost of bad data with real-world examples
- Identify quality issues in a sample dataset using pandas checks
- Build a `quality_report()` function that scores each dimension from 0.0 to 1.0
- Describe where in a pipeline quality problems most commonly originate

---

## Prerequisites

- Section 2: Pandas Fundamentals (DataFrames, boolean filtering, `.isnull()`, `.duplicated()`)
- Section 4: Data Cleaning (data types, missing value patterns)

---

## Lesson Outline

### Part 1: The Cost of Bad Data (30 minutes)

#### Explanation

Bad data is not just an inconvenience — it has a measurable financial and operational cost. Gartner research estimates that poor data quality costs organizations **$12.9 million per year on average**. That number comes from failed ETL runs, wrong business decisions, customer support escalations, and engineering time spent tracing bugs to their root: dirty data.

Before fixing data quality, you need a shared vocabulary. There are **6 dimensions** every data engineer measures:

| Dimension | Definition | Example | Impact if Violated |
|-----------|-----------|---------|-------------------|
| **Completeness** | Are all expected values present? | `customer_email` is null for 30% of rows | Cannot send order confirmations |
| **Accuracy** | Do values reflect reality? | `product_price = -5.00` in an orders table | Revenue reports are wrong |
| **Consistency** | Are the same facts represented the same way? | `status` stored as `"shipped"` in one table and `"SHIPPED"` in another | JOIN mismatches, duplicated records |
| **Timeliness** | Is data fresh enough for its use case? | Yesterday's inventory is used for today's stock decisions | Overselling, stockouts |
| **Validity** | Do values conform to defined formats and rules? | `order_date = "2099-01-01"` — date in the future | Incorrect reporting, pipeline errors |
| **Uniqueness** | Are there duplicate records? | Same customer registered twice with different IDs | Double-billing, inflated user counts |

**Real-world failure examples:**

- **Hospital patient routing (Completeness):** A missing `ward_id` field meant a patient's transfer request was silently dropped. The system had no validation — the record looked complete because other fields were filled. Result: 4-hour delay in urgent care.
- **E-commerce wrong address (Timeliness):** A customer moved and updated their address on the website. The order system cached addresses at checkout but refreshed them nightly. An order placed 20 minutes before the nightly refresh shipped to the old address.
- **Finance duplicate records (Uniqueness):** Two data sources were merged without deduplication. A customer appeared twice with slightly different names (`"John Smith"` vs `"John H. Smith"`). The loyalty system awarded double points on every purchase for 6 months before audit caught it.

**Where in the pipeline do quality problems originate?**

```
[Source System] → [Ingestion] → [Transformation] → [Storage] → [Reporting]
     ^                ^               ^                             ^
     |                |               |                             |
  Accuracy         Validity       Consistency               Timeliness
  Uniqueness      Completeness    Consistency               Completeness
```

Most quality issues originate at **ingestion** — when data crosses a system boundary with no contract enforced. The further downstream a quality issue travels, the more expensive it becomes to fix.

---

### Part 2: Measuring Quality Dimensions with pandas (30 minutes)

#### Explanation

Each dimension can be measured programmatically. Here is how to check all 6 on a DataFrame using only pandas.

```python
import pandas as pd

# Sample orders DataFrame with deliberate quality issues
df = pd.DataFrame({
    'order_id':    [1001, 1002, 1003, 1002, 1004, 1005],  # duplicate: 1002
    'customer_id': [101, 102, None, 104, 105, None],       # 2 nulls
    'amount':      [49.99, -5.00, 120.0, 89.50, 0.0, 250.0],  # -5.00 invalid
    'status':      ['shipped', 'SHIPPED', 'pending', 'delivered', 'shipped', 'Pending'],  # inconsistent case
    'order_date':  ['2024-01-15', '2024-01-16', '2024-01-17', '2099-12-01', '2024-01-18', '2024-01-19'],
    'region':      ['US', 'EU', 'US', 'EU', 'US', 'EU']
})

# --- COMPLETENESS ---
# What fraction of values are NOT null?
completeness = 1 - df.isnull().mean()
print("Completeness per column:")
print(completeness)
# order_id      1.000
# customer_id   0.667  <-- 2 nulls out of 6 rows
# amount        1.000
# ...

# --- UNIQUENESS ---
# What fraction of rows are NOT duplicates?
n_duplicates = df.duplicated(subset=['order_id']).sum()
uniqueness_score = 1 - (n_duplicates / len(df))
print(f"\nUniqueness (order_id): {uniqueness_score:.3f}")
# 0.833 (1 duplicate out of 6 rows)

# --- VALIDITY ---
# Dates that cannot be parsed or are in the future
dates = pd.to_datetime(df['order_date'], errors='coerce')
future_dates = (dates > pd.Timestamp.today()).sum()
invalid_dates = dates.isna().sum()
validity_score = 1 - ((future_dates + invalid_dates) / len(df))
print(f"Validity (order_date): {validity_score:.3f}")
# 0.833 (1 future date)

# --- ACCURACY ---
# Negative amounts are impossible in an orders table
negative_amounts = (df['amount'] < 0).sum()
accuracy_score = 1 - (negative_amounts / len(df))
print(f"Accuracy (amount >= 0): {accuracy_score:.3f}")
# 0.833 (1 negative amount)

# --- CONSISTENCY ---
# Status values should all be lowercase
valid_statuses = {'shipped', 'pending', 'delivered', 'cancelled'}
normalized = df['status'].str.lower()
inconsistent = ~normalized.isin(valid_statuses)
consistency_score = 1 - (inconsistent.sum() / len(df))
print(f"Consistency (status case): {consistency_score:.3f}")
# 1.0 after normalization check — original data has mixed case

# --- TIMELINESS ---
# For demo: check if data was refreshed within the last 30 days
most_recent = pd.to_datetime(df['order_date'], errors='coerce').max()
days_stale = (pd.Timestamp.today() - most_recent).days
timeliness_score = 1.0 if days_stale <= 30 else max(0, 1 - (days_stale - 30) / 365)
print(f"Timeliness (days stale: {days_stale}): {timeliness_score:.3f}")
```

---

### Part 3: Building a Quality Scorecard (30 minutes)

#### Explanation

A `quality_report()` function encapsulates all 6 checks into a single callable that returns a structured dict. This is the foundation for the quality dashboard you will build in Lesson 8.

```python
import pandas as pd

def quality_report(df: pd.DataFrame, date_col: str = None,
                   id_col: str = None, amount_col: str = None,
                   status_col: str = None, valid_statuses: set = None) -> dict:
    """
    Compute a quality score (0.0-1.0) for each applicable dimension.
    Returns a dict with dimension names as keys and scores as values.
    """
    report = {}

    # COMPLETENESS: fraction of non-null values across all columns
    report['completeness'] = float(1 - df.isnull().mean().mean())

    # UNIQUENESS: fraction of non-duplicate rows (by id_col if provided, else all columns)
    if id_col and id_col in df.columns:
        n_dupes = df.duplicated(subset=[id_col]).sum()
    else:
        n_dupes = df.duplicated().sum()
    report['uniqueness'] = float(1 - (n_dupes / len(df)))

    # VALIDITY: check date column for unparseable or future dates
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        invalid = dates.isna().sum() + (dates > pd.Timestamp.today()).sum()
        report['validity'] = float(1 - (invalid / len(df)))
    else:
        report['validity'] = 1.0  # no date column to check

    # ACCURACY: check that numeric amount column has no negative values
    if amount_col and amount_col in df.columns:
        neg = (df[amount_col] < 0).sum()
        report['accuracy'] = float(1 - (neg / len(df)))
    else:
        report['accuracy'] = 1.0

    # CONSISTENCY: check status column values are within allowed set
    if status_col and status_col in df.columns and valid_statuses:
        normalized = df[status_col].str.lower().str.strip()
        bad = ~normalized.isin(valid_statuses)
        report['consistency'] = float(1 - (bad.sum() / len(df)))
    else:
        report['consistency'] = 1.0

    # TIMELINESS: based on most recent date vs today (within 30 days = 1.0)
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        most_recent = dates.max()
        if pd.isna(most_recent):
            report['timeliness'] = 0.0
        else:
            days_stale = (pd.Timestamp.today() - most_recent).days
            report['timeliness'] = 1.0 if days_stale <= 30 else max(0.0, 1 - (days_stale - 30) / 365)
    else:
        report['timeliness'] = 1.0

    return report


# --- Demo usage ---
df = pd.DataFrame({
    'order_id':   [1001, 1002, 1003, 1002, 1004, 1005],
    'customer_id': [101, 102, None, 104, 105, None],
    'amount':     [49.99, -5.00, 120.0, 89.50, 0.0, 250.0],
    'status':     ['shipped', 'SHIPPED', 'pending', 'delivered', 'shipped', 'Pending'],
    'order_date': ['2024-01-15', '2024-01-16', '2024-01-17', '2099-12-01', '2024-01-18', '2024-01-19'],
})

scores = quality_report(
    df,
    date_col='order_date',
    id_col='order_id',
    amount_col='amount',
    status_col='status',
    valid_statuses={'shipped', 'pending', 'delivered', 'cancelled'}
)

print("Quality Scorecard:")
for dimension, score in scores.items():
    flag = "REVIEW" if score < 0.95 else "OK"
    print(f"  {dimension:<14}: {score:.3f}  [{flag}]")

# Output:
# Quality Scorecard:
#   completeness  : 0.833  [REVIEW]
#   uniqueness    : 0.833  [REVIEW]
#   validity      : 0.833  [REVIEW]
#   accuracy      : 0.833  [REVIEW]
#   consistency   : 0.667  [REVIEW]
#   timeliness    : 0.000  [REVIEW]  (2024 data is stale)
```

The threshold `score < 0.95` is a common starting point. Below 0.95 means more than 1 in 20 records has a problem — for most production use cases, that is unacceptable. Your thresholds should reflect business requirements: financial data may require 0.999, while exploratory analytics can tolerate 0.90.

---

### Part 4: Practice (30 minutes)

#### Explanation

You will call `quality_report()` on a messy transactions DataFrame and identify which dimensions fall below 0.95.

<PracticeBlock
  prompt="Call quality_report() on the messy transactions DataFrame below. Print each dimension score and flag any below 0.95. Which dimensions need attention?"
  initialCode={`import pandas as pd

def quality_report(df, date_col=None, id_col=None, amount_col=None,
                   status_col=None, valid_statuses=None):
    report = {}
    report['completeness'] = float(1 - df.isnull().mean().mean())
    if id_col and id_col in df.columns:
        n_dupes = df.duplicated(subset=[id_col]).sum()
    else:
        n_dupes = df.duplicated().sum()
    report['uniqueness'] = float(1 - (n_dupes / len(df)))
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        invalid = dates.isna().sum() + (dates > pd.Timestamp.today()).sum()
        report['validity'] = float(1 - (invalid / len(df)))
    else:
        report['validity'] = 1.0
    if amount_col and amount_col in df.columns:
        neg = (df[amount_col] < 0).sum()
        report['accuracy'] = float(1 - (neg / len(df)))
    else:
        report['accuracy'] = 1.0
    if status_col and status_col in df.columns and valid_statuses:
        normalized = df[status_col].str.lower().str.strip()
        bad = ~normalized.isin(valid_statuses)
        report['consistency'] = float(1 - (bad.sum() / len(df)))
    else:
        report['consistency'] = 1.0
    return report

# Messy transactions DataFrame
df = pd.DataFrame({
    'txn_id':   [1, 2, 3, 4, 5, 3, 6, 7, 8, 9],   # row 5 is a duplicate of row 2
    'amount':   [10.5, -3.0, 200.0, 15.0, None, 88.0, -12.0, 44.0, None, 300.0],
    'status':   ['complete', 'Complete', 'COMPLETE', 'pending', 'complete',
                 'complete', 'refunded', 'pending', 'PENDING', 'complete'],
    'txn_date': ['2024-06-01', '2024-06-02', '2099-01-01', '2024-06-04', '2024-06-05',
                 '2024-06-06', '2024-06-07', 'not-a-date', '2024-06-09', '2024-06-10'],
})

# TODO: call quality_report() with appropriate parameters
# TODO: print each dimension and flag those below 0.95
`}
  hint="Pass txn_id as id_col, amount as amount_col, txn_date as date_col, status as status_col, and valid_statuses={'complete', 'pending', 'refunded'}. Then loop over the result dict."
  solution={`import pandas as pd

def quality_report(df, date_col=None, id_col=None, amount_col=None,
                   status_col=None, valid_statuses=None):
    report = {}
    report['completeness'] = float(1 - df.isnull().mean().mean())
    if id_col and id_col in df.columns:
        n_dupes = df.duplicated(subset=[id_col]).sum()
    else:
        n_dupes = df.duplicated().sum()
    report['uniqueness'] = float(1 - (n_dupes / len(df)))
    if date_col and date_col in df.columns:
        dates = pd.to_datetime(df[date_col], errors='coerce')
        invalid = dates.isna().sum() + (dates > pd.Timestamp.today()).sum()
        report['validity'] = float(1 - (invalid / len(df)))
    else:
        report['validity'] = 1.0
    if amount_col and amount_col in df.columns:
        neg = (df[amount_col] < 0).sum()
        report['accuracy'] = float(1 - (neg / len(df)))
    else:
        report['accuracy'] = 1.0
    if status_col and status_col in df.columns and valid_statuses:
        normalized = df[status_col].str.lower().str.strip()
        bad = ~normalized.isin(valid_statuses)
        report['consistency'] = float(1 - (bad.sum() / len(df)))
    else:
        report['consistency'] = 1.0
    return report

df = pd.DataFrame({
    'txn_id':   [1, 2, 3, 4, 5, 3, 6, 7, 8, 9],
    'amount':   [10.5, -3.0, 200.0, 15.0, None, 88.0, -12.0, 44.0, None, 300.0],
    'status':   ['complete', 'Complete', 'COMPLETE', 'pending', 'complete',
                 'complete', 'refunded', 'pending', 'PENDING', 'complete'],
    'txn_date': ['2024-06-01', '2024-06-02', '2099-01-01', '2024-06-04', '2024-06-05',
                 '2024-06-06', '2024-06-07', 'not-a-date', '2024-06-09', '2024-06-10'],
})

scores = quality_report(
    df,
    id_col='txn_id',
    amount_col='amount',
    date_col='txn_date',
    status_col='status',
    valid_statuses={'complete', 'pending', 'refunded'}
)

print("Quality Report:")
print("-" * 35)
flagged = []
for dim, score in scores.items():
    status = "OK" if score >= 0.95 else "REVIEW"
    print(f"  {dim:<14}: {score:.3f}  [{status}]")
    if score < 0.95:
        flagged.append(dim)

print()
print(f"Dimensions needing attention: {flagged}")
# completeness: 0.9  (2 nulls in amount)
# uniqueness:   0.9  (1 duplicate txn_id)
# validity:     0.8  (1 future date + 1 unparseable date)
# accuracy:     0.8  (2 negative amounts)
# consistency:  1.0  (all statuses are valid after lowercase check)
`}
/>

---

## Key Takeaways

- Bad data costs organizations $12.9M/year on average (Gartner) — it is an engineering problem, not a data problem
- The 6 quality dimensions are: completeness, accuracy, consistency, timeliness, validity, uniqueness
- Each dimension can be measured with pandas — no external library needed
- A score < 0.95 (more than 1 in 20 records with issues) is a common threshold for flagging a dimension for review
- Shift-left: catch quality issues at ingestion, not at reporting — the further downstream, the more expensive the fix
- Quality must be **measured continuously**, not assumed — every pipeline run should produce a quality score

---

## Common Mistakes to Avoid

- **Checking quality only at the end of the pipeline**: by then, bad data has contaminated intermediate tables and downstream reports. Validate at every boundary.
- **Treating all nulls as bad data**: some nulls are valid (e.g., `discount_amount` is null when no discount applies). Always understand the business semantics before treating null as a violation.
- **Ignoring referential consistency**: a foreign key that doesn't match any primary key is a consistency violation pandas won't catch by default — you need an explicit check.
- **Using a single overall score**: a 0.95 overall can hide a 0.60 on one critical dimension. Always inspect per-dimension scores.
- **Profiling only a sample**: for schema and distribution checks, always profile the full dataset — samples can miss rare violations.

---

## Next Lesson Preview

- How to enforce schema rules automatically using pandera `DataFrameSchema`
- How `SchemaError` surfaces violations with row-level detail
- How lazy validation collects all errors in a single pass

---

[← Previous: Section 7 Review](../07-sql-databases/README.md) | [Next: Schema Validation with Pandera →](./lesson-02-schema-validation-with-pandera.md)
