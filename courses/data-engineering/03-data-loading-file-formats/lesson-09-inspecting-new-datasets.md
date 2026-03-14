# Lesson 9: Inspecting New Datasets: A Workflow

**Course:** Data Engineering | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Apply a 7-step inspection workflow to any new dataset immediately after loading
- Identify the most common data quality red flags during inspection
- Document your findings at the top of your analysis script

---

## Prerequisites

- Lessons 1-8 in this section (or comfort with pd.read_csv, dtypes, describe, value_counts)

---

## Lesson Outline

### Part 1: The First 5 Minutes with New Data (5 minutes)

#### Explanation

Every data engineer develops a mental checklist for new datasets. When a stakeholder sends you a file or you pull data from a new source for the first time, the first thing you do is **inspect it** — before writing any transformation logic, before joining it with other data, before building any pipeline.

Skipping this step is how you spend three hours debugging a pipeline only to discover the source data had null values in a key column, or dates in a non-standard format, or duplicate rows from a system bug.

The inspection takes 5-10 minutes. It saves hours downstream.

The workflow below works for any DataFrame regardless of format (CSV, JSON, Excel, Parquet). Load the file first, then run through the checklist.

---

### Part 2: The 7-Step Inspection Checklist (20 minutes)

#### Explanation

**Step 1: Shape — how big is this dataset?**

```python
print(df.shape)   # (rows, columns)
```

Check if the number of rows is what you expect. If you were told "last month's orders" and the file has 10 million rows, something is wrong.

---

**Step 2: Head and tail — does it look like what was described?**

```python
print(df.head())   # first 5 rows — check column names and values
print(df.tail())   # last 5 rows — check if file ends cleanly (no footer metadata)
```

---

**Step 3: Dtypes and info() — are types correct?**

```python
print(df.dtypes)   # quick overview
print(df.info())   # dtypes + non-null counts + memory usage
```

`df.info()` shows both the type and the count of non-null values per column — you see missing data at a glance. If a column has 1000 rows but only 800 non-null values, 200 values are missing.

Red flag: date columns showing `object` dtype. Numeric columns showing `object` dtype (means some rows have non-numeric values).

---

**Step 4: describe() — summary statistics for numeric columns**

```python
print(df.describe())
```

`describe()` shows count, mean, std, min, 25th percentile, median, 75th percentile, and max for each numeric column.

Red flags:
- `min` is negative for a column that should never be negative (e.g., price, quantity)
- `max` is impossibly large (data entry error or unit mismatch)
- `mean` and `median` are far apart (heavy skew or outliers)
- `count` is less than `df.shape[0]` — there are null values

---

**Step 5: value_counts() — distribution of categorical columns**

```python
print(df['category'].value_counts())
print(df['region'].value_counts())
```

Red flags:
- Unexpected categories (typos: "Electrnics" instead of "Electronics")
- One category has 99% of the records — possible data issue
- Categories you expected are missing

---

**Step 6: isnull().sum() — count missing values per column**

```python
print(df.isnull().sum())
```

This gives you the count of NaN values in each column. Divide by `df.shape[0]` to get the percentage:

```python
print(df.isnull().sum() / df.shape[0] * 100)
```

Any column with more than 5-10% missing is worth flagging. Columns with 100% null are useless and should be dropped.

---

**Step 7: duplicates — are rows unique?**

```python
print(f"Duplicate rows: {df.duplicated().sum()}")
```

If you expect each row to be a unique event or record, any duplicates indicate a data quality issue — usually from a system that double-writes records on retry.

Check duplicates on a key column (not all columns):

```python
# Are order_ids unique?
print(f"Duplicate order_ids: {df['order_id'].duplicated().sum()}")
```

---

### Part 3: Red Flags to Look For (5 minutes)

#### Explanation

A consolidated list of what to watch for during inspection:

| Red Flag | What to Check | Likely Cause |
|----------|---------------|-------------|
| Date column is `object` dtype | `df.dtypes` | Not parsed on load; use `parse_dates` |
| Numeric column is `object` dtype | `df.dtypes` | Mixed values in that column (string mixed with numbers) |
| Negative values in always-positive column | `df.describe()` | Data entry error, unit issue |
| Surprisingly few rows | `df.shape` | Wrong date filter, partial export |
| Surprisingly many rows | `df.shape` | Accidental join duplication, union of multiple sources |
| Typos in categorical values | `value_counts()` | No validation at source |
| Column with >50% null | `isnull().sum()` | Optional field rarely filled, wrong join |
| Duplicate key values | `duplicated()` on key col | Retry duplication in source system |
| All-null column | `isnull().sum()` | Feature not yet populated, wrong column export |

---

### Part 4: Documenting Your Findings (5 minutes)

#### Explanation

After inspection, add a brief comment block at the top of your script or notebook:

```python
# Dataset: orders.csv
# Source: Sales system export, Jan 2024
# Rows: 10 | Columns: 8
# Key findings:
#   - order_date loads as object — use parse_dates=['order_date']
#   - No null values in any column
#   - All order_ids are unique
#   - Two categories: Electronics (5 rows), Accessories (5 rows)
#   - unit_price range: $15.00 - $1200.00 (looks correct)
```

This comment takes 2 minutes to write and saves the next person (or future you) from re-running the inspection.

<Tip>
Build this checklist into a reusable function: `def inspect_df(df): ...` that runs all 7 steps and prints a summary. Paste it into every new project. 10 minutes of inspection saves hours of debugging pipeline failures caused by data quality issues.
</Tip>

---

## Practice

<PracticeBlock
  prompt="Apply the full 7-step inspection workflow to orders.csv. For each step, print the result. Identify at least one data quality finding (hint: check the order_date dtype)."
  initialCode={`import pandas as pd

df = pd.read_csv('data/orders.csv')

# Step 1: Shape
print("=== Step 1: Shape ===")
print(___)

# Step 2: Head and tail
print("\\n=== Step 2: Head ===")
print(___)
print("\\n=== Step 2: Tail ===")
print(___)

# Step 3: Dtypes and info
print("\\n=== Step 3: Dtypes ===")
print(___)

# Step 4: describe()
print("\\n=== Step 4: Describe ===")
print(___)

# Step 5: value_counts for category
print("\\n=== Step 5: Category value_counts ===")
print(___)

# Step 6: Missing values
print("\\n=== Step 6: Missing values ===")
print(___)

# Step 7: Duplicates
print("\\n=== Step 7: Duplicate rows ===")
print(___)
print("\\n=== Step 7: Duplicate order_ids ===")
print(___)
`}
  hint="Fill in: df.shape, df.head(), df.tail(), df.dtypes, df.describe(), df['category'].value_counts(), df.isnull().sum(), df.duplicated().sum(), df['order_id'].duplicated().sum()"
  solution={`import pandas as pd

df = pd.read_csv('data/orders.csv')

# Step 1: Shape
print("=== Step 1: Shape ===")
print(df.shape)   # (10, 8)

# Step 2: Head and tail
print("\\n=== Step 2: Head ===")
print(df.head())
print("\\n=== Step 2: Tail ===")
print(df.tail())

# Step 3: Dtypes and info
print("\\n=== Step 3: Dtypes ===")
print(df.dtypes)  # Note: order_date is 'object' — not parsed as datetime!

# Step 4: describe()
print("\\n=== Step 4: Describe ===")
print(df.describe())

# Step 5: value_counts for category
print("\\n=== Step 5: Category value_counts ===")
print(df['category'].value_counts())

# Step 6: Missing values
print("\\n=== Step 6: Missing values ===")
print(df.isnull().sum())   # All zeros — no missing values

# Step 7: Duplicates
print("\\n=== Step 7: Duplicate rows ===")
print(f"Duplicate rows: {df.duplicated().sum()}")   # 0
print("\\n=== Step 7: Duplicate order_ids ===")
print(f"Duplicate order_ids: {df['order_id'].duplicated().sum()}")   # 0

# Finding: order_date is 'object' dtype — use parse_dates=['order_date'] to fix
`}
/>

---

## Key Takeaways

- Always inspect a new dataset before writing any transformation logic
- The 7-step checklist: shape, head/tail, dtypes/info, describe, value_counts, isnull, duplicated
- `df.info()` combines dtype and null count in one call — the most information-dense single function
- Red flags: unexpected dtypes, negative values in always-positive columns, high null percentages, duplicate key values
- Document findings at the top of your script — 2 minutes of notes saves hours of debugging

---

## Common Mistakes

- **Skipping inspection and diving straight into transformation.** The most common cause of pipeline bugs discovered late.
- **Only checking `df.head()` and assuming the file is clean.** Problems are usually in the middle or tail of large files.
- **Not checking `value_counts()` on categorical columns.** Typos and unexpected categories are invisible until you aggregate and get unexpected groups.

---

## Next Lesson Preview

In **Lesson 10: Section Review**, we synthesize the full section with a format selection guide and three integrated practice exercises combining CSV, JSON, Parquet, and inspection skills.

---

[Back to Section Overview](./README.md) | [Next Lesson: Section Review →](./lesson-10-section-review-loading.md)
