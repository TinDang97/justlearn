# Lesson 4: Detecting Anomalies and Outliers

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Apply the IQR method to flag numeric outliers in a DataFrame column
- Compute z-scores manually (without scipy) to detect statistical outliers
- Build boolean masks to isolate anomalous rows
- Distinguish between outliers (statistical) and anomalies (domain-specific)
- Decide when to remove, cap, or investigate flagged values

---

## Prerequisites

- Lesson 3: Data Profiling with Pandas
- Section 2: Pandas Fundamentals (boolean filtering, `.quantile()`)

---

## Lesson Outline

### Part 1: The IQR Method (30 minutes)

#### Explanation

The **Interquartile Range (IQR)** method is the most robust way to detect outliers in a numeric column. It is resistant to extreme values because it is based on the middle 50% of the data, not the mean or standard deviation.

**How it works:**
1. Compute Q1 (25th percentile) and Q3 (75th percentile)
2. `IQR = Q3 - Q1`
3. `lower_fence = Q1 - 1.5 * IQR`
4. `upper_fence = Q3 + 1.5 * IQR`
5. Flag rows where the value is below `lower_fence` or above `upper_fence`

```python
import pandas as pd

# Order amounts: mostly 10-200, with a few extreme values injected
df = pd.DataFrame({
    'order_id': range(1, 21),
    'amount':   [45.0, 120.0, 89.0, 55.0, 175.0, 32.0, 98.0, 67.0, 143.0, 88.0,
                 76.0, 110.0, 59.0, 2500.0, 82.0, 44.0, 195.0, 3100.0, 71.0, 150.0],
    'region':   ['US', 'EU'] * 10,
})

# Step 1: compute IQR fences
Q1 = df['amount'].quantile(0.25)
Q3 = df['amount'].quantile(0.75)
IQR = Q3 - Q1

lower_fence = Q1 - 1.5 * IQR
upper_fence = Q3 + 1.5 * IQR

print(f"Q1={Q1:.2f}, Q3={Q3:.2f}, IQR={IQR:.2f}")
print(f"Lower fence: {lower_fence:.2f}")
print(f"Upper fence: {upper_fence:.2f}")

# Step 2: boolean mask for outliers
outlier_mask = (df['amount'] < lower_fence) | (df['amount'] > upper_fence)

outliers = df[outlier_mask]
clean    = df[~outlier_mask]

print(f"\nTotal rows: {len(df)}")
print(f"Outliers:   {len(outliers)}")
print(f"Clean rows: {len(clean)}")
print("\nOutlier rows:")
print(outliers)
```

**When to use IQR:**
- Data is skewed or non-normal (prices, transaction amounts, response times)
- You expect extreme values but want to flag them for review
- You don't know the distribution in advance

**IQR multiplier guide:**

| Multiplier | Sensitivity | Use case |
|-----------|------------|---------|
| 1.5 | Standard | Most datasets |
| 3.0 | Conservative | Only extreme extremes |
| 1.0 | Aggressive | Tight quality control |

```python
# Applying different fences and comparing results
for multiplier in [1.0, 1.5, 3.0]:
    lower = Q1 - multiplier * IQR
    upper = Q3 + multiplier * IQR
    count = ((df['amount'] < lower) | (df['amount'] > upper)).sum()
    print(f"Multiplier {multiplier}: {count} outlier(s)")
```

---

### Part 2: Z-Score Method (30 minutes)

#### Explanation

The **z-score** measures how many standard deviations a value is from the mean. A z-score above 3 or below -3 (in absolute value) is conventionally flagged as an outlier.

**Important:** scipy is not available in Pyodide by default. Compute z-scores manually using pandas.

```python
import pandas as pd

df = pd.DataFrame({
    'order_id': range(1, 21),
    'amount':   [45.0, 120.0, 89.0, 55.0, 175.0, 32.0, 98.0, 67.0, 143.0, 88.0,
                 76.0, 110.0, 59.0, 2500.0, 82.0, 44.0, 195.0, 3100.0, 71.0, 150.0],
})

# Manual z-score computation (no scipy needed)
mean   = df['amount'].mean()
std    = df['amount'].std()

df['z_score'] = (df['amount'] - mean) / std

# Flag rows with |z| > 3
z_outliers = df[df['z_score'].abs() > 3]
print("Z-score outliers (|z| > 3):")
print(z_outliers[['order_id', 'amount', 'z_score']])

# --- Compare IQR vs z-score on the same data ---
Q1 = df['amount'].quantile(0.25)
Q3 = df['amount'].quantile(0.75)
IQR = Q3 - Q1
lower_fence = Q1 - 1.5 * IQR
upper_fence = Q3 + 1.5 * IQR
iqr_mask = (df['amount'] < lower_fence) | (df['amount'] > upper_fence)

print(f"\nIQR method:     {iqr_mask.sum()} outlier(s)")
print(f"Z-score method: {(df['z_score'].abs() > 3).sum()} outlier(s)")

# For this dataset: z-score may miss the 2500 outlier because the 3100 outlier
# inflates the mean and std, shifting the z-score distribution
print("\nDifference — in IQR but not z-score:")
in_iqr_not_z = df[iqr_mask & (df['z_score'].abs() <= 3)]
print(in_iqr_not_z[['order_id', 'amount', 'z_score']])
```

**IQR vs z-score comparison:**

| Method | Assumes normality | Sensitive to extreme values | Best for |
|--------|-----------------|--------------------------|---------|
| IQR | No | No (robust) | Skewed distributions, prices, times |
| Z-score | Yes | Yes (inflated by outliers) | Normally distributed data |

**Rule of thumb:** Start with IQR. Use z-score only if you have verified the data is approximately normal.

---

### Part 3: Domain Anomalies (30 minutes)

#### Explanation

Statistical methods find values that are unusual **relative to the distribution**. Domain anomalies are values that are **impossible or implausible** according to business rules — statistics won't catch them.

```python
import pandas as pd

# Order dataset with various domain violations
df = pd.DataFrame({
    'order_id':   [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008],
    'amount':     [49.99, 0.0, -15.00, 89.50, 250.0, 120.0, 0.01, 15000.0],
    'quantity':   [1, 2, 1, 0, 3, 1, 1, 2],
    'age':        [25, 32, 170, 41, 29, 88, 22, 35],
    'order_date': ['2024-01-15', '2024-01-16', '2024-01-17', '2099-12-01',
                   '2024-01-19', '2023-12-25', '2024-01-20', '1990-01-01'],
})
df['order_date'] = pd.to_datetime(df['order_date'])

def check_domain_rules(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply domain-specific rules to detect anomalous rows.
    Returns a summary DataFrame listing each violation.
    """
    violations = []

    # Rule 1: amount must be > 0
    bad = df[df['amount'] <= 0]
    for idx in bad.index:
        violations.append({
            'row_index': idx,
            'order_id':  df.loc[idx, 'order_id'],
            'rule':      'amount > 0',
            'value':     df.loc[idx, 'amount'],
            'severity':  'ERROR',
        })

    # Rule 2: quantity must be >= 1
    bad = df[df['quantity'] < 1]
    for idx in bad.index:
        violations.append({
            'row_index': idx,
            'order_id':  df.loc[idx, 'order_id'],
            'rule':      'quantity >= 1',
            'value':     df.loc[idx, 'quantity'],
            'severity':  'ERROR',
        })

    # Rule 3: customer age must be 18-120
    bad = df[(df['age'] < 18) | (df['age'] > 120)]
    for idx in bad.index:
        violations.append({
            'row_index': idx,
            'order_id':  df.loc[idx, 'order_id'],
            'rule':      '18 <= age <= 120',
            'value':     df.loc[idx, 'age'],
            'severity':  'ERROR',
        })

    # Rule 4: order_date must be in the past and after 2020-01-01
    min_date = pd.Timestamp('2020-01-01')
    today    = pd.Timestamp.today().normalize()

    future = df[df['order_date'] > today]
    for idx in future.index:
        violations.append({
            'row_index': idx,
            'order_id':  df.loc[idx, 'order_id'],
            'rule':      'order_date <= today',
            'value':     df.loc[idx, 'order_date'].date(),
            'severity':  'ERROR',
        })

    too_old = df[df['order_date'] < min_date]
    for idx in too_old.index:
        violations.append({
            'row_index': idx,
            'order_id':  df.loc[idx, 'order_id'],
            'rule':      'order_date >= 2020-01-01',
            'value':     df.loc[idx, 'order_date'].date(),
            'severity':  'WARNING',
        })

    return pd.DataFrame(violations) if violations else pd.DataFrame(columns=['row_index', 'order_id', 'rule', 'value', 'severity'])


summary = check_domain_rules(df)
print("Domain rule violations:")
print(summary.to_string(index=False))
print(f"\nTotal violations: {len(summary)}")
print(f"ERROR count:      {(summary['severity'] == 'ERROR').sum()}")
print(f"WARNING count:    {(summary['severity'] == 'WARNING').sum()}")
```

**The three actions for detected anomalies:**

| Action | When | Example |
|--------|------|---------|
| **Remove** | Value is clearly erroneous and cannot be imputed | `age = 170` — impossible |
| **Cap (winsorize)** | Value is statistically extreme but plausible | Amount capped at 99th percentile |
| **Investigate** | Value looks wrong but might be correct | Large order from a known bulk customer |

```python
# Capping at the IQR upper fence (winsorizing)
Q1 = df['amount'].quantile(0.25)
Q3 = df['amount'].quantile(0.75)
IQR = Q3 - Q1
upper_fence = Q3 + 1.5 * IQR

df_capped = df.copy()
df_capped['amount'] = df_capped['amount'].clip(lower=0.01, upper=upper_fence)

print(f"\nBefore capping: max amount = {df['amount'].max():.2f}")
print(f"After capping:  max amount = {df_capped['amount'].max():.2f}")
```

---

### Part 4: Practice (30 minutes)

#### Explanation

A sales DataFrame has 5 rows with `amount > 10,000` injected into a dataset where the normal range is 10-500. Use IQR to detect them, print the suspicious rows, and cap them at the upper fence.

<PracticeBlock
  prompt="The sales DataFrame has 5 injected outliers with amount > 10,000 (normal range: 10-500). Use IQR to detect them, print the outlier rows, then cap all amounts at the IQR upper fence."
  initialCode={`import pandas as pd

# Build sales DataFrame: 45 normal rows + 5 extreme outliers
normal_amounts = [round(10 + (i * 490 / 44), 2) for i in range(45)]
extreme_amounts = [12000.0, 15500.0, 18200.0, 11000.0, 25000.0]

df = pd.DataFrame({
    'sale_id': range(1, 51),
    'amount':  normal_amounts + extreme_amounts,
    'region':  ['North', 'South', 'East', 'West', 'Central'] * 10,
})

# Shuffle to mix outliers in
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Total rows: {len(df)}")
print(f"Amount range: {df['amount'].min():.2f} to {df['amount'].max():.2f}")

# TODO: compute Q1, Q3, IQR, lower_fence, upper_fence
# TODO: create outlier_mask and print outlier rows
# TODO: cap df['amount'] at upper_fence using .clip()
# TODO: verify the max amount after capping
`}
  hint="Q1 = df['amount'].quantile(0.25), Q3 = df['amount'].quantile(0.75). IQR = Q3 - Q1. upper_fence = Q3 + 1.5 * IQR. Outlier mask: df['amount'] > upper_fence (lower fence won't trigger here since all amounts > 0). Use .clip(upper=upper_fence) to cap."
  solution={`import pandas as pd

normal_amounts = [round(10 + (i * 490 / 44), 2) for i in range(45)]
extreme_amounts = [12000.0, 15500.0, 18200.0, 11000.0, 25000.0]

df = pd.DataFrame({
    'sale_id': range(1, 51),
    'amount':  normal_amounts + extreme_amounts,
    'region':  ['North', 'South', 'East', 'West', 'Central'] * 10,
})
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Step 1: compute IQR fences
Q1 = df['amount'].quantile(0.25)
Q3 = df['amount'].quantile(0.75)
IQR = Q3 - Q1
lower_fence = Q1 - 1.5 * IQR
upper_fence = Q3 + 1.5 * IQR

print(f"Q1={Q1:.2f}, Q3={Q3:.2f}, IQR={IQR:.2f}")
print(f"Lower fence: {lower_fence:.2f}, Upper fence: {upper_fence:.2f}")

# Step 2: detect outliers
outlier_mask = (df['amount'] < lower_fence) | (df['amount'] > upper_fence)
outliers = df[outlier_mask]

print(f"\\nOutliers detected: {len(outliers)}")
print(outliers[['sale_id', 'amount', 'region']].to_string(index=False))

# Step 3: cap at upper fence
df_capped = df.copy()
df_capped['amount'] = df_capped['amount'].clip(lower=max(0, lower_fence), upper=upper_fence)

print(f"\\nBefore capping: max = {df['amount'].max():.2f}")
print(f"After capping:  max = {df_capped['amount'].max():.2f}")
print(f"Rows changed:   {(df['amount'] != df_capped['amount']).sum()}")
`}
/>

---

## Key Takeaways

- IQR is resistant to extreme values because it uses Q1/Q3 (not mean/std) — use it as your default outlier detector
- Z-score assumes normality; manually compute it as `(value - mean) / std` — no scipy required in Pyodide
- Domain anomalies (negative amounts, future dates, impossible ages) require explicit business rules — statistics won't catch them
- The three responses to outliers: remove (clearly erroneous), cap/winsorize (plausible but extreme), investigate (context needed)
- Always investigate before removing — a $50,000 order from a bulk buyer is not an error
- For time-series data, apply outlier detection within time windows — a value that looks extreme globally may be normal within its period

---

## Common Mistakes to Avoid

- **Removing outliers without investigation**: a legitimate high-value transaction flagged by IQR is real revenue — dropping it silently is a data loss bug
- **Using z-score on skewed data**: skewed distributions violate the normality assumption; z-score will miss high-end outliers that inflate the mean
- **Applying row-level outlier removal to time series**: each time period has its own distribution context; a spike in December e-commerce is expected, not anomalous
- **Treating zero values as outliers**: zero can be valid (e.g., `discount = 0` means no discount). Combine IQR with domain rules before flagging zeros.

---

## Next Lesson Preview

- What a data contract is and why it is not the same as schema validation
- The three layers of a contract: schema, semantics, and SLA
- The producer/consumer model and where contract boundaries belong in a pipeline

---

[← Previous: Data Profiling with Pandas](./lesson-03-data-profiling-with-pandas.md) | [Next: Data Contracts: Introduction →](./lesson-05-data-contracts-introduction.md)
