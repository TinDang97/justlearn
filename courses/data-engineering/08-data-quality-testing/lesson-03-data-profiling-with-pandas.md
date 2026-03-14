# Lesson 3: Data Profiling with Pandas

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Generate a null rate report for every column in a DataFrame
- Compute value distributions for categorical columns with `value_counts()`
- Detect high-cardinality columns (likely IDs or free-text) using uniqueness ratio
- Detect near-zero variance columns (likely constants or useless features)
- Build a reusable `profile_dataframe()` function that returns a per-column profile DataFrame
- Interpret profiling output to prioritize data cleaning work

---

## Prerequisites

- Lesson 1: Why Data Quality Matters
- Section 2: Pandas Fundamentals (`.describe()`, `.value_counts()`, `.nunique()`)

---

## Lesson Outline

### Part 1: Null Analysis (30 minutes)

#### Explanation

The first question to answer about any new dataset is: **where are the holes?** Null analysis identifies which columns have missing data and how severe the problem is.

```python
import pandas as pd

# Simulate a messy employee dataset
df = pd.DataFrame({
    'emp_id':       [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'full_name':    ['Alice', 'Bob', None, 'Diana', 'Eve', 'Frank', None, 'Grace', 'Hank', 'Iris'],
    'department':   ['Eng', 'Mktg', 'Eng', None, 'HR', 'Eng', 'Mktg', None, 'HR', 'Eng'],
    'salary':       [95000, 72000, 88000, 61000, None, 105000, 78000, 91000, None, 84000],
    'hire_date':    ['2020-01-15', '2019-06-01', '2021-03-20', None, '2022-07-01',
                     '2018-11-05', '2023-01-10', '2020-09-14', '2021-05-03', None],
    'performance':  [4, None, 3, 5, None, 4, None, 3, 4, None],
})

# --- Basic null counts ---
print("Null counts per column:")
print(df.isnull().sum())
print()

# --- Null rate (0.0 to 1.0) sorted by most missing ---
null_rates = df.isnull().mean().sort_values(ascending=False)
print("Null rate per column (sorted):")
print(null_rates.round(3))
print()

# --- ASCII bar chart of null rates (no matplotlib needed) ---
print("Null rate visualization:")
print(f"{'Column':<15} {'Null Rate':<10} {'Bar'}")
print("-" * 45)
for col, rate in null_rates.items():
    bar_len = int(rate * 20)          # scale to 20-char bar
    bar = "#" * bar_len + "." * (20 - bar_len)
    flag = " <-- HIGH" if rate > 0.20 else ""
    print(f"{col:<15} {rate:.1%}      [{bar}]{flag}")

# Output:
# Column          Null Rate  Bar
# ---------------------------------------------
# performance     0.4%      [########............] <-- HIGH
# hire_date       0.2%      [####................] <-- HIGH
# ...
```

**Decision rules based on null rate:**

| Null Rate | Action |
|-----------|--------|
| 0% | Perfect — no action needed |
| 1-5% | Acceptable — impute or drop rows case by case |
| 5-20% | Investigate — understand why values are missing |
| > 20% | Flag for review — consider dropping the column if not critical |

```python
# Programmatic flagging
HIGH_NULL_THRESHOLD = 0.20

high_null_cols = null_rates[null_rates > HIGH_NULL_THRESHOLD].index.tolist()
print(f"\nColumns with > {HIGH_NULL_THRESHOLD:.0%} null rate (candidates for dropping):")
print(high_null_cols)
```

---

### Part 2: Distribution Profiling (30 minutes)

#### Explanation

After null analysis, understand **what values are present** in each column. This reveals inconsistencies, dominant values, and high-cardinality columns.

```python
import pandas as pd

df = pd.DataFrame({
    'emp_id':      list(range(1, 11)),
    'department':  ['Eng', 'Mktg', 'Eng', 'HR', 'HR', 'Eng', 'Mktg', 'Eng', 'HR', 'Eng'],
    'level':       ['L3', 'L2', 'L4', 'L3', 'L2', 'L5', 'L3', 'L4', 'L3', 'L3'],
    'salary':      [95000, 72000, 88000, 61000, 58000, 105000, 78000, 91000, 64000, 84000],
    'notes':       ['Top performer', None, 'On PIP', None, None,
                    'Senior lead', None, None, None, 'Recent hire'],
})

# --- describe(include='all') — summary for every column ---
print("Full describe (all dtypes):")
print(df.describe(include='all'))
print()

# --- Value counts for categorical columns ---
object_cols = df.select_dtypes(include='object').columns
for col in object_cols:
    if df[col].isnull().mean() == 1.0:
        continue  # all null — skip
    print(f"\nValue distribution: '{col}'")
    counts = df[col].value_counts(normalize=True).head(10)
    for value, freq in counts.items():
        bar = "#" * int(freq * 20)
        print(f"  {str(value):<20} {freq:.1%}  {bar}")

# --- High cardinality detection ---
# If unique_count / total_rows > 0.9, the column is likely an ID or free-text field
print("\nCardinality check:")
for col in df.columns:
    n_unique = df[col].nunique()
    ratio = n_unique / len(df)
    col_type = "ID/free-text" if ratio > 0.9 else ("categorical" if ratio < 0.2 else "medium cardinality")
    print(f"  {col:<15} unique={n_unique:>3} / {len(df)} = {ratio:.2f}  [{col_type}]")

# --- Near-zero variance detection (numeric columns only) ---
# Columns with std/mean < 0.01 are likely constants — useless for analysis
print("\nVariance check (numeric columns):")
numeric_cols = df.select_dtypes(include='number').columns
for col in numeric_cols:
    col_std = df[col].std()
    col_mean = df[col].mean()
    cv = col_std / abs(col_mean) if col_mean != 0 else float('inf')
    flag = " <-- LOW VARIANCE (consider dropping)" if cv < 0.01 else ""
    print(f"  {col:<15} std={col_std:.2f}, mean={col_mean:.2f}, cv={cv:.4f}{flag}")
```

---

### Part 3: Building `profile_dataframe()` (30 minutes)

#### Explanation

A `profile_dataframe()` function consolidates all profiling metrics into a single DataFrame — one row per column. This makes it easy to sort, filter, and prioritize cleaning work.

```python
import pandas as pd

def profile_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Profile every column in df.

    Returns a DataFrame with one row per column and these fields:
      column       — column name
      dtype        — pandas dtype string
      null_rate    — fraction of null values (0.0-1.0)
      unique_count — number of distinct non-null values
      cardinality  — 'id_or_freetext', 'high', 'medium', 'low'
      top_value    — most frequent non-null value
      top_freq     — frequency of top_value (fraction)
      mean         — mean for numeric columns, NaN otherwise
      std          — std for numeric columns, NaN otherwise
    """
    rows = []
    n = len(df)

    for col in df.columns:
        series = df[col]
        non_null = series.dropna()

        null_rate    = series.isnull().mean()
        unique_count = series.nunique()
        ratio        = unique_count / n if n > 0 else 0

        # Cardinality bucket
        if ratio > 0.9:
            cardinality = 'id_or_freetext'
        elif ratio > 0.5:
            cardinality = 'high'
        elif ratio > 0.1:
            cardinality = 'medium'
        else:
            cardinality = 'low'

        # Top value and frequency
        if len(non_null) > 0:
            vc = non_null.value_counts(normalize=True)
            top_value = vc.index[0]
            top_freq  = float(vc.iloc[0])
        else:
            top_value = None
            top_freq  = 0.0

        # Numeric stats
        if pd.api.types.is_numeric_dtype(series):
            col_mean = float(non_null.mean()) if len(non_null) > 0 else float('nan')
            col_std  = float(non_null.std())  if len(non_null) > 1 else float('nan')
        else:
            col_mean = float('nan')
            col_std  = float('nan')

        rows.append({
            'column':       col,
            'dtype':        str(series.dtype),
            'null_rate':    round(float(null_rate), 4),
            'unique_count': int(unique_count),
            'cardinality':  cardinality,
            'top_value':    str(top_value) if top_value is not None else None,
            'top_freq':     round(top_freq, 4),
            'mean':         round(col_mean, 2) if not pd.isna(col_mean) else None,
            'std':          round(col_std, 2)  if not pd.isna(col_std)  else None,
        })

    return pd.DataFrame(rows)


# --- Demo: profile a transactions dataset ---
transactions = pd.DataFrame({
    'txn_id':      list(range(1001, 1021)),         # 20 rows
    'customer_id': [f'CUST-{i:04d}' for i in range(1, 21)],
    'amount':      [49.99, 120.0, None, 89.50, 250.0, 15.0, 33.0, 88.5,
                    200.0, 12.5, 75.0, None, 140.0, 60.0, 95.0, 18.5,
                    310.0, 44.0, 22.0, 180.0],
    'currency':    ['USD'] * 17 + ['EUR', 'USD', 'GBP'],
    'category':    ['retail', 'retail', 'food', 'food', 'travel',
                    'retail', 'food', 'travel', 'retail', 'food',
                    'food', 'retail', 'travel', 'food', 'retail',
                    'food', 'travel', 'retail', 'food', 'retail'],
    'notes':       [None if i % 3 != 0 else f'Note for txn {i}' for i in range(20)],
    'status':      ['complete'] * 15 + ['pending'] * 3 + ['refunded'] * 2,
})

profile = profile_dataframe(transactions)

print("DataFrame Profile:")
print(profile.to_string(index=False))

# Sort by null_rate to see worst columns first
print("\nColumns sorted by null rate (worst first):")
print(profile.sort_values('null_rate', ascending=False)[['column', 'null_rate', 'cardinality']].to_string(index=False))

# Identify ID-like columns
print("\nID or free-text columns:")
id_cols = profile[profile['cardinality'] == 'id_or_freetext']['column'].tolist()
print(id_cols)
```

---

### Part 4: Practice (30 minutes)

#### Explanation

Run `profile_dataframe()` on a provided DataFrame, then identify the 2 columns with the highest null rate and the 1 column that appears to be a free-text or ID field based on cardinality.

<PracticeBlock
  prompt="Run profile_dataframe() on the sales DataFrame below. Print: (1) the 2 columns with the highest null rate, (2) the 1 column with cardinality='id_or_freetext'."
  initialCode={`import pandas as pd

def profile_dataframe(df):
    rows = []
    n = len(df)
    for col in df.columns:
        series = df[col]
        non_null = series.dropna()
        null_rate    = series.isnull().mean()
        unique_count = series.nunique()
        ratio        = unique_count / n if n > 0 else 0
        if ratio > 0.9:
            cardinality = 'id_or_freetext'
        elif ratio > 0.5:
            cardinality = 'high'
        elif ratio > 0.1:
            cardinality = 'medium'
        else:
            cardinality = 'low'
        if len(non_null) > 0:
            vc = non_null.value_counts(normalize=True)
            top_value = vc.index[0]
            top_freq  = float(vc.iloc[0])
        else:
            top_value = None
            top_freq  = 0.0
        rows.append({
            'column':       col,
            'dtype':        str(series.dtype),
            'null_rate':    round(float(null_rate), 4),
            'unique_count': int(unique_count),
            'cardinality':  cardinality,
            'top_value':    str(top_value) if top_value is not None else None,
            'top_freq':     round(top_freq, 4),
        })
    return pd.DataFrame(rows)

# Sales DataFrame with varying null rates and one free-text column
import random
random.seed(42)
n = 25
sales = pd.DataFrame({
    'sale_id':    list(range(5001, 5001 + n)),          # unique IDs
    'product':    ['Widget', 'Gadget', 'Doohickey'] * 8 + ['Widget'],
    'region':     ['North', 'South', 'East', 'West'] * 6 + ['North'],
    'amount':     [round(random.uniform(10, 500), 2) for _ in range(n)],
    'rep_notes':  [f'Rep note #{i}: customer said ...' if i % 4 == 0 else None for i in range(n)],
    'discount':   [round(random.uniform(0, 0.3), 2) if i % 3 == 0 else None for i in range(n)],
    'verified':   [True if i % 2 == 0 else None for i in range(n)],
})

# TODO: run profile_dataframe(sales)
# TODO: print the 2 columns with highest null_rate
# TODO: print the column with cardinality == 'id_or_freetext'
`}
  hint="After calling profile_dataframe(), sort by null_rate descending and take the first 2 rows. For the free-text column, filter where cardinality == 'id_or_freetext'. sale_id and rep_notes are both candidates — check which has ratio > 0.9."
  solution={`import pandas as pd
import random

def profile_dataframe(df):
    rows = []
    n = len(df)
    for col in df.columns:
        series = df[col]
        non_null = series.dropna()
        null_rate    = series.isnull().mean()
        unique_count = series.nunique()
        ratio        = unique_count / n if n > 0 else 0
        if ratio > 0.9:
            cardinality = 'id_or_freetext'
        elif ratio > 0.5:
            cardinality = 'high'
        elif ratio > 0.1:
            cardinality = 'medium'
        else:
            cardinality = 'low'
        if len(non_null) > 0:
            vc = non_null.value_counts(normalize=True)
            top_value = vc.index[0]
            top_freq  = float(vc.iloc[0])
        else:
            top_value = None
            top_freq  = 0.0
        rows.append({
            'column':       col,
            'dtype':        str(series.dtype),
            'null_rate':    round(float(null_rate), 4),
            'unique_count': int(unique_count),
            'cardinality':  cardinality,
            'top_value':    str(top_value) if top_value is not None else None,
            'top_freq':     round(top_freq, 4),
        })
    return pd.DataFrame(rows)

random.seed(42)
n = 25
sales = pd.DataFrame({
    'sale_id':    list(range(5001, 5001 + n)),
    'product':    ['Widget', 'Gadget', 'Doohickey'] * 8 + ['Widget'],
    'region':     ['North', 'South', 'East', 'West'] * 6 + ['North'],
    'amount':     [round(random.uniform(10, 500), 2) for _ in range(n)],
    'rep_notes':  [f'Rep note #{i}: customer said ...' if i % 4 == 0 else None for i in range(n)],
    'discount':   [round(random.uniform(0, 0.3), 2) if i % 3 == 0 else None for i in range(n)],
    'verified':   [True if i % 2 == 0 else None for i in range(n)],
})

profile = profile_dataframe(sales)
print("Full profile:")
print(profile.to_string(index=False))

# 2 columns with highest null rate
top_null = profile.sort_values('null_rate', ascending=False).head(2)
print("\\n2 columns with highest null rate:")
print(top_null[['column', 'null_rate']].to_string(index=False))

# Column with id_or_freetext cardinality
freetext_cols = profile[profile['cardinality'] == 'id_or_freetext']['column'].tolist()
print("\\nID or free-text columns:")
print(freetext_cols)
# Expected: sale_id (unique integer IDs, ratio = 1.0) and rep_notes (non-null values are all unique)
`}
/>

---

## Key Takeaways

- Profiling is always step 1 before cleaning — you cannot make good cleaning decisions without knowing the data's shape
- `null_rate > 0.20` is a common threshold for flagging a column as a dropping candidate — but always verify business semantics first
- High cardinality (`unique / total > 0.9`) reveals ID columns and free-text fields — these need special handling
- `describe(include='all')` is useful but insufficient — it doesn't produce null rates, cardinality buckets, or per-column top-value frequency
- A `profile_dataframe()` function gives you a sortable, filterable view of your data's health — run it on every new dataset you receive
- Profiling a sample instead of the full dataset can miss rare violations — always profile the full data before making schema decisions

---

## Common Mistakes to Avoid

- **Jumping to cleaning without profiling**: you will spend 2 hours cleaning the wrong column. Always profile first.
- **Treating `describe()` as sufficient**: `describe()` skips object columns by default and gives no null rates. Use `profile_dataframe()` for a complete picture.
- **Ignoring near-zero variance columns**: a column with `std = 0` (a constant) wastes storage and misleads analysis. Flag it during profiling.
- **Conflating cardinality with importance**: a high-cardinality column (`rep_notes`) may be important for debugging even if useless for aggregation. Understanding semantics requires domain knowledge, not just statistics.

---

## Next Lesson Preview

- How the IQR method flags statistical outliers using only pandas
- How to compute z-scores manually (no scipy required)
- How domain rules catch anomalies that statistics miss

---

[← Previous: Schema Validation with Pandera](./lesson-02-schema-validation-with-pandera.md) | [Next: Detecting Anomalies and Outliers →](./lesson-04-detecting-anomalies-and-outliers.md)
