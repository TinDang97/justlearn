# Lesson 9: Detecting Outliers

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Distinguish between statistical outliers and domain-logic violations
- Apply the IQR method to identify statistical outliers in a numeric column
- Compute Z-scores to detect values more than 3 standard deviations from the mean
- Use boolean conditions to flag domain violations (negative revenue, zero quantity)
- Choose between flagging, capping, removing, and investigating as your outlier response strategy

---

## Prerequisites

- Basic pandas: boolean indexing, column assignment
- Basic statistics: mean, standard deviation, percentiles

---

## Lesson Outline

### Part 1: Two Kinds of Outliers

**Statistical outlier:** A value that is unusually far from the rest of the distribution. Whether it's a problem depends on context — a $10,000 sale in a dataset where most sales are $50–$500 is suspicious but may be legitimate.

**Domain violation:** A value that is logically impossible regardless of statistics. Negative revenue, a product quantity of -3, or an age of 500 are never correct — no statistical method is needed to identify them.

Always handle domain violations first (they require no judgment), then apply statistical methods for the remaining anomalies.

---

### Part 2: IQR Method

The Interquartile Range (IQR) method is robust to extreme values. It defines outlier boundaries based on the spread of the middle 50% of data:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Remove nulls before calculating statistics
revenue = df['revenue'].dropna()

Q1  = revenue.quantile(0.25)
Q3  = revenue.quantile(0.75)
IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

print(f"Q1: {Q1}, Q3: {Q3}, IQR: {IQR}")
print(f"Lower bound: {lower_bound:.2f}")
print(f"Upper bound: {upper_bound:.2f}")

# Flag outliers
df['is_revenue_outlier'] = (
    (df['revenue'] < lower_bound) | (df['revenue'] > upper_bound)
)
print(df[df['is_revenue_outlier']][['sale_id', 'revenue']])
```

The 1.5×IQR multiplier is the standard Tukey fence. Using 3×IQR produces a more conservative boundary that only flags extreme outliers.

---

### Part 3: Z-Score Method

Z-scores measure how many standard deviations a value is from the mean. Values with `|z| > 3` are conventionally flagged as outliers:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

revenue = df['revenue'].dropna()
mean   = revenue.mean()
std    = revenue.std()

df['revenue_zscore'] = (df['revenue'] - mean) / std

# Flag values more than 3 standard deviations from the mean
df['is_zscore_outlier'] = df['revenue_zscore'].abs() > 3
print(df[df['is_zscore_outlier']][['sale_id', 'revenue', 'revenue_zscore']])
```

Z-scores are less robust than IQR when the distribution itself is skewed (outliers inflate the mean and std, making detection unreliable). For financial data with natural skew, prefer IQR.

---

### Part 4: Domain Validation — Logical Impossibilities

Some conditions are impossible by definition and should be caught regardless of distribution:

```python
# Negative revenue is a logical impossibility in sales data
negative_revenue = df[df['revenue'] < 0]
print(f"Negative revenue rows: {len(negative_revenue)}")
print(negative_revenue[['sale_id', 'revenue', 'product']])

# Zero or negative units
invalid_units = df[df['units'] <= 0]

# Revenue exceeds maximum possible (price ceiling validation)
MAX_SINGLE_SALE = 5000  # domain knowledge
impossible_revenue = df[df['revenue'] > MAX_SINGLE_SALE]
```

These checks encode business rules. The data team or domain expert defines them — the engineer enforces them.

---

### Part 5: What To Do With Outliers

<Warning>

Never automatically remove outliers in a production pipeline. Flag them first, investigate the source, then decide with a stakeholder. Removing real data is unrecoverable.

</Warning>

| Strategy | When to use |
|----------|-------------|
| **Flag** | Add an `is_outlier` boolean column; keep the row but mark it | Unknown cause — needs investigation |
| **Cap** | `df['col'].clip(lower=lb, upper=ub)` — replace outlier with the boundary value | Statistical models that are sensitive to extreme values |
| **Remove** | `df[df['col'] >= 0]` — drop the row | Confirmed impossible values (negative quantity) |
| **Investigate** | Export flagged rows, review with data owner | High-value data where business context determines valid ranges |

For `sales_dirty.csv`, row S007 has revenue of `-89.00`. This is a domain violation — revenue cannot be negative. The response is to investigate: was this a refund? A data entry error? Until we know, flag and exclude from aggregations.

---

<PracticeBlock
  prompt="Find rows in sales_dirty.csv where 'revenue' is negative (a logical impossibility). How many are there? Filter them out."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Revenue range:")
print(df['revenue'].describe())
# Find and report negative revenue rows
`}
  hint="Use df[df['revenue'] < 0] to find rows with negative revenue."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Revenue range:")
print(df['revenue'].describe())

# Find negative revenue rows
negative_rows = df[df['revenue'] < 0]
print(f"\nNegative revenue rows: {len(negative_rows)}")
print(negative_rows[['sale_id', 'customer', 'product', 'revenue']])

# Filter them out (keep only non-negative revenue)
df_clean = df[df['revenue'] >= 0]
print(f"\nAfter removing negatives: {df_clean.shape}")
`}
/>

<PracticeBlock
  prompt="Apply the IQR method to 'revenue' to detect statistical outliers. Add an 'is_revenue_outlier' boolean column to the DataFrame."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Drop nulls before calculating statistics
revenue = df['revenue'].dropna()
# Compute Q1, Q3, IQR, and set outlier bounds
`}
  hint="Compute Q1 = revenue.quantile(0.25), Q3 = revenue.quantile(0.75), IQR = Q3 - Q1, then set bounds at Q1 - 1.5*IQR and Q3 + 1.5*IQR."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

revenue = df['revenue'].dropna()
Q1  = revenue.quantile(0.25)
Q3  = revenue.quantile(0.75)
IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

print(f"Q1={Q1:.2f}, Q3={Q3:.2f}, IQR={IQR:.2f}")
print(f"Outlier bounds: [{lower_bound:.2f}, {upper_bound:.2f}]")

df['is_revenue_outlier'] = (
    (df['revenue'] < lower_bound) | (df['revenue'] > upper_bound)
)

outliers = df[df['is_revenue_outlier']]
print(f"\nStatistical outliers: {len(outliers)}")
print(outliers[['sale_id', 'revenue', 'is_revenue_outlier']])
`}
/>

---

## Key Takeaways

- Handle domain violations (logically impossible values) first — they require no statistical judgment
- The IQR method is robust to skewed distributions: flag values outside `[Q1 - 1.5*IQR, Q3 + 1.5*IQR]`
- Z-scores work better for symmetric distributions; IQR is preferred for financial data
- Never remove outliers automatically in production — flag them and investigate before deciding
- The four responses to outliers: flag (add boolean column), cap (clip), remove (drop), investigate

---

## Common Mistakes to Avoid

- **Computing mean and std including NaN.** pandas skips NaN in `.mean()` and `.std()` by default, but always drop nulls explicitly before applying statistical methods to avoid confusion.
- **Removing all statistical outliers without business review.** An IQR outlier might be the largest legitimate sale of the quarter — it's real data.
- **Using the same outlier threshold for every column.** Thresholds are domain-specific. A Z-score of 3 makes sense for a normally distributed sensor reading; it may not make sense for a heavily skewed revenue column.

---

## Next Lesson Preview

In **Lesson 10: Schema Validation Basics** we shift from reactive cleaning to proactive enforcement — writing validation logic that checks column presence, dtypes, and value ranges at the start of a pipeline.

---

[Back to Section Overview](./README.md) | [Next Lesson: Schema Validation Basics →](./lesson-10-schema-validation-basics.md)
