# Lesson 1: Detecting Missing Values

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain what counts as "missing" in pandas and why empty strings are a common gotcha
- Use `isnull()` / `isna()` to produce a boolean mask of missing positions
- Use `notna()` as the inverse filter for non-null rows
- Count and compute the percentage of nulls per column
- Sort columns by missing count to prioritize your cleaning work

---

## Prerequisites

- Section 3: loading data with `pd.read_csv()`
- Basic pandas: DataFrame, boolean indexing

---

## Lesson Outline

### Part 1: What Counts as Missing?

Pandas recognizes three kinds of missing values:

| Sentinel | Dtype | Meaning |
|----------|-------|---------|
| `NaN` | float64 | IEEE "Not a Number"; the default missing marker for numeric columns |
| `None` | object | Python's null; appears in object (string) columns |
| `pd.NaT` | datetime64 | "Not a Time"; the missing marker for datetime columns |

When pandas reads a CSV it converts blank cells, `'NA'`, `'NaN'`, `'null'`, and `'None'` to `NaN` automatically. All three sentinels are detected by `isnull()`.

<Info>

Empty string `''` is **not** NaN. If a column contains `''` values you want to treat as missing, replace them first:

```python
df['col'] = df['col'].replace('', np.nan)
```

This is a frequent source of "I thought I cleaned the nulls but they're still there" bugs.

</Info>

---

### Part 2: `isnull()` and `isna()`

`isnull()` and `isna()` are exact aliases — they do the same thing. Both return a boolean DataFrame (or Series) of the same shape, with `True` wherever a value is missing:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Returns a DataFrame of True/False
df.isnull()

# On a single column — returns a Series
df['revenue'].isnull()
```

Use `isnull()` when you need to inspect or filter missing data. Both names exist purely for readability preference.

---

### Part 3: `notna()` — the inverse filter

`notna()` (also available as `notnull()`) returns `True` where a value is **present**:

```python
# Keep only rows where revenue is not null
df_with_revenue = df[df['revenue'].notna()]
```

This is the idiomatic way to filter out missing rows for a specific column without dropping them from the whole DataFrame.

---

### Part 4: Counting and Percentaging Missing Values

The single most useful missing-value operation: how many nulls per column?

```python
# Count of nulls per column
null_counts = df.isnull().sum()
print(null_counts)

# Percentage of nulls per column (0–100)
null_pct = df.isnull().mean() * 100
print(null_pct.round(2))

# Total null count across entire DataFrame
total_nulls = df.isnull().sum().sum()
print(f"Total missing values: {total_nulls}")
```

`isnull()` returns a boolean DataFrame. `True` coerces to `1` and `False` to `0` when you call `.sum()`. Dividing by the row count (`.mean()`) gives the fraction, and multiplying by 100 converts to a percentage.

---

### Part 5: Visualizing Missingness — Sort to Prioritize

When a dataset has many columns, sort by missing count to see which columns need the most attention:

```python
# Sort columns from most to least missing
missing_summary = (
    df.isnull()
      .sum()
      .sort_values(ascending=False)
)

# Filter to only columns that have at least one null
missing_only = missing_summary[missing_summary > 0]
print(missing_only)
```

In `sales_dirty.csv` this will surface `revenue` and `units` as the only columns with missing values — exactly the two columns you need to address before any numeric analysis.

---

<PracticeBlock
  prompt="Load sales_dirty.csv and find which columns have missing values. Print the count and percentage of nulls per column."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Count and percentage of nulls per column
`}
  hint="Use df.isnull().sum() for counts and df.isnull().mean() * 100 for percentages."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

null_counts = df.isnull().sum()
null_pct = df.isnull().mean() * 100

summary = pd.DataFrame({
    'null_count': null_counts,
    'null_pct': null_pct.round(2)
})
print(summary[summary['null_count'] > 0])
`}
/>

<PracticeBlock
  prompt="Filter the DataFrame to show only rows where 'revenue' is null."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Show rows with missing revenue
`}
  hint="Use df[df['revenue'].isnull()] to filter for null rows."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

null_revenue_rows = df[df['revenue'].isnull()]
print(null_revenue_rows)
print(f"\n{len(null_revenue_rows)} row(s) with missing revenue")
`}
/>

---

## Key Takeaways

- `NaN`, `None`, and `pd.NaT` are all "missing" — `isnull()` detects all three
- Empty string `''` is **not** missing by default; replace it with `np.nan` first
- `isnull()` and `isna()` are identical aliases; use whichever you prefer
- `notna()` is the inverse — use it to keep rows where a value is present
- `isnull().sum()` counts nulls per column; `.mean() * 100` gives the percentage
- Sort by missing count (`sort_values()`) to prioritize which columns to clean first

---

## Common Mistakes to Avoid

- **Treating `''` as missing.** pandas does not. Always replace empty strings explicitly with `np.nan` before running null checks.
- **Forgetting `.sum().sum()` for total count.** A single `.sum()` returns a Series (one count per column), not the grand total.
- **Using `== np.nan` instead of `isnull()`.** `NaN != NaN` in floating-point arithmetic. `df['col'] == np.nan` always returns `False`. Always use `isnull()`.

---

## Next Lesson Preview

In **Lesson 2: Handling Missing Values** we will act on the nulls we just found — deciding whether to drop, fill with a constant, fill with a statistical measure, or interpolate.

---

[Back to Section Overview](./README.md) | [Next Lesson: Handling Missing Values →](./lesson-02-handling-missing-values.md)
