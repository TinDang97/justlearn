# Lesson 2: Handling Missing Values

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Choose the appropriate missing-value strategy based on the column's role and null rate
- Use `dropna()` to remove rows with null values, targeting specific columns with `subset`
- Use `fillna()` to replace nulls with constants, column statistics, or forward/backward fill
- Apply `interpolate()` for ordered numeric or time-series data
- Apply the decision framework: when to drop, fill with constant, fill with mean/median, or interpolate

---

## Prerequisites

- Lesson 1: Detecting Missing Values — `isnull().sum()`
- Basic pandas: `.shape`, boolean indexing

---

## Lesson Outline

### Part 1: Strategy Depends on Context

There is no universal correct answer for how to handle missing values. The right strategy depends on:

1. **Why is the value missing?** — Was it never collected? Was the event optional? Was it a system error?
2. **What is the null rate?** — 1% missing is very different from 40% missing.
3. **How will the column be used?** — A missing ID key is fatal; a missing optional tag is trivial.

The four strategies covered in this lesson:

| Strategy | When to use |
|----------|-------------|
| Drop the row | Null rate is low, or the row is unusable without this column |
| Fill with constant | Categorical columns; domain has a sensible default (e.g., `'Unknown'`, `0`) |
| Fill with mean/median | Numeric columns; distribution-preserving fill |
| Interpolate | Ordered data (time-series); fill based on neighboring values |

---

### Part 2: `dropna()` — Remove Rows with Nulls

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

print(f"Before: {df.shape}")

# Drop any row that has at least one null value
df_dropped = df.dropna()
print(f"After dropna(): {df_dropped.shape}")

# Drop rows only where 'revenue' is null (keep rows with other nulls)
df_rev = df.dropna(subset=['revenue'])
print(f"After dropna(subset=['revenue']): {df_rev.shape}")

# Drop rows where ALL values are null (very permissive)
df_all = df.dropna(how='all')
```

The `subset` parameter is the most useful — it lets you enforce that a critical column must be present without discarding rows that have unrelated nulls.

---

### Part 3: `fillna()` — Fill Nulls with a Value

```python
# Fill with a constant
df['region'] = df['region'].fillna('Unknown')

# Fill numeric with column mean
df['revenue'] = df['revenue'].fillna(df['revenue'].mean())

# Fill with column median (more robust to outliers)
df['revenue'] = df['revenue'].fillna(df['revenue'].median())

# Fill with a business rule constant
df['units'] = df['units'].fillna(1)  # assume 1 unit if not recorded
```

<Warning>

`.fillna(method='ffill')` and `.fillna(method='bfill')` are **deprecated in pandas 2.x**. Use `.ffill()` and `.bfill()` directly instead:

```python
# Deprecated (pandas 2.x warning):
df['revenue'] = df['revenue'].fillna(method='ffill')

# Correct for pandas 2.x:
df['revenue'] = df['revenue'].ffill()
df['revenue'] = df['revenue'].bfill()
```

</Warning>

**Forward fill** (`ffill()`) propagates the last valid value forward. **Backward fill** (`bfill()`) propagates the next valid value backward. Both are useful for ordered data where consecutive rows share context.

---

### Part 4: Interpolation for Ordered Numeric Data

`interpolate()` estimates missing values based on the values on either side — useful for time-series data where you expect gradual change:

```python
import pandas as pd
import numpy as np

# Example: daily temperature readings with a gap
temps = pd.Series([20.0, np.nan, np.nan, 23.0])
print(temps.interpolate())
# Output: [20.0, 21.0, 22.0, 23.0] — linear interpolation
```

For transactional data like sales, interpolation is usually **not appropriate** — a missing revenue value has no meaningful "value between neighbors". Interpolation works best for sensor readings, stock prices, or other continuous measurements.

---

### Part 5: Decision Framework

```
Is null rate > 50%?
  YES → The column is too sparse to be useful. Drop the column or accept heavy imputation bias.
  NO  → Continue

Is the column a required key (ID, FK)?
  YES → Drop the row. A record without its key is unidentifiable.
  NO  → Continue

Is the column categorical?
  YES → fillna('Unknown') or the most common category (mode)

Is the column numeric?
  Is the data ordered (time-series, sequence)?
    YES → interpolate()
    NO  → fillna(df[col].median())  # median is more robust than mean for skewed data
```

---

<PracticeBlock
  prompt="Drop rows where 'revenue' is null. Compare shape before and after."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}")
# Drop rows where revenue is null and print new shape
`}
  hint="Use df.dropna(subset=['revenue']) to drop only rows where revenue is null."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}")

df_clean = df.dropna(subset=['revenue'])
print(f"After:  {df_clean.shape}")
print(f"Dropped {df.shape[0] - df_clean.shape[0]} row(s)")
`}
/>

<PracticeBlock
  prompt="Instead of dropping, fill null 'revenue' with the column median. Then fill null 'units' with 1 (business rule: assume 1 unit if not recorded)."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(df[['revenue', 'units']].isnull().sum())
# Fill revenue nulls with median, units nulls with 1
`}
  hint="Use df['revenue'].fillna(df['revenue'].median()) and df['units'].fillna(1)."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(df[['revenue', 'units']].isnull().sum())

df['revenue'] = df['revenue'].fillna(df['revenue'].median())
df['units'] = df['units'].fillna(1)

print("\nAfter:")
print(df[['revenue', 'units']].isnull().sum())
print(f"\nRevenue median fill value: {df['revenue'].median():.2f}")
`}
/>

<PracticeBlock
  prompt="Fill null 'revenue' using forward fill (ffill). Add a comment explaining why this may be inappropriate for sales data."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Null revenue rows:")
print(df[df['revenue'].isnull()][['sale_id', 'customer', 'revenue']])

# Fill using forward fill — note why this might be wrong for sales
`}
  hint="Use df['revenue'].ffill() for forward fill in pandas 2.x."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before ffill:")
print(df[df['revenue'].isnull()][['sale_id', 'customer', 'revenue']])

# Forward fill propagates the previous row's revenue value
# This is INAPPROPRIATE for sales data because:
# - Revenue depends on product and quantity, not temporal proximity
# - Row S003 (Keyboard, 1 unit) getting row S002's revenue (Mouse, $50) is nonsense
# Correct approach: fill with median or drop the row
df['revenue'] = df['revenue'].ffill()

print("\nAfter ffill:")
print(df[df['sale_id'] == 'S003'][['sale_id', 'product', 'revenue']])
# S003 now has S002's revenue of $50 — clearly wrong for a Keyboard sale
`}
/>

---

## Key Takeaways

- Choose your null-handling strategy based on **why** values are missing and the null rate
- `dropna(subset=['col'])` removes rows where a specific column is null
- `fillna()` fills nulls with a constant, mean, median, or any scalar value
- Use `.ffill()` and `.bfill()` directly (the `method=` parameter is deprecated in pandas 2.x)
- `interpolate()` is for continuous ordered data — not for transactional records
- When null rate exceeds 20–30% for a numeric column, consider whether the column is worth keeping

---

## Common Mistakes to Avoid

- **Using `fillna(method='ffill')` in pandas 2.x.** This raises a `FutureWarning` or error. Use `.ffill()` directly.
- **Filling ID or key columns.** Never fill a null primary key — drop the row or investigate the source system.
- **Using mean when outliers are present.** Mean is skewed by outliers. Default to median for financial data.
- **Not checking how many rows were dropped.** Always compare `.shape` before and after to verify your cleaning logic behaves as expected.

---

## Next Lesson Preview

In **Lesson 3: Detecting Duplicate Rows** we will look at the second category of data quality issues: records that appear more than once — both exact duplicates and logical duplicates based on a business key.

---

[Back to Section Overview](./README.md) | [Next Lesson: Detecting Duplicate Rows →](./lesson-03-detecting-duplicates.md)
