# Lesson 12: Section Review — Data Cleaning

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 60 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Use the quick-reference table to look up the right method for any cleaning problem
- Execute the full inspect → document → clean → validate → save workflow on a real dataset
- Apply the `clean_sales_data()` pipeline from Lesson 11 and verify the output
- Save a cleaned DataFrame to both CSV and Parquet, and explain why Parquet preserves dtypes while CSV does not

---

## Prerequisites

- Lessons 1–11 of this section — all cleaning techniques and the pipeline pattern

---

## Lesson Outline

### Part 1: Quick Reference — Cleaning Problem to Method

| Problem | pandas Method |
|---------|---------------|
| Detect missing values | `isnull().sum()`, `isna().mean() * 100` |
| Drop null rows | `dropna(subset=['col'])` |
| Fill nulls with constant | `fillna(value)` |
| Fill nulls with statistic | `fillna(df['col'].median())` |
| Forward/backward fill | `ffill()`, `bfill()` |
| Find duplicates | `duplicated()`, `duplicated(subset=['key'])` |
| Remove duplicates | `drop_duplicates()`, `drop_duplicates(subset=['key'])` |
| Convert type safely | `pd.to_numeric(errors='coerce')` |
| Convert to nullable int | `astype('Int64')` |
| Parse dates | `pd.to_datetime(errors='coerce')` |
| Extract date components | `.dt.year`, `.dt.month`, `.dt.dayofweek` |
| Strip whitespace | `.str.strip()` |
| Normalize case | `.str.lower()`, `.str.title()` |
| Replace patterns | `.str.replace(pattern, repl, regex=True)` |
| Extract with regex | `.str.extract(r'(pattern)')` |
| Split into columns | `.str.split(' ', expand=True)` |
| Detect statistical outliers | IQR method: `Q1 - 1.5*IQR` to `Q3 + 1.5*IQR` |
| Flag domain violations | Boolean condition: `df['col'] < 0` |
| Validate schema at entry | `assert set(required).issubset(df.columns)` |
| Collect all violations | `validate_schema(df)` returns list of strings |
| Build reusable pipeline | Per-step functions + `.pipe()` chain |

---

### Part 2: The Complete Cleaning Workflow

The workflow you will practice in the three PracticeBlocks below:

```
1. Load the raw data
2. Inspect: shape, dtypes, isnull().sum(), value_counts() on key columns
3. Document: list all quality issues found
4. Clean: run validate_schema → apply cleaning pipeline
5. Verify: compare shape before/after, confirm dtypes, re-run null checks
6. Save: write to CSV and Parquet
```

---

### Part 3: Why Parquet Preserves Dtypes

When you save a DataFrame to CSV and reload it, dtypes are inferred again from scratch — and may be inferred incorrectly:

```python
import pandas as pd

df_clean.to_csv('data/sales_clean.csv', index=False)
reloaded_csv = pd.read_csv('data/sales_clean.csv')
print(reloaded_csv['date'].dtype)    # object — datetime not preserved!
print(reloaded_csv['units'].dtype)   # int64 (may differ from Int64)
```

Parquet is a binary columnar format that stores the dtype alongside the data:

```python
df_clean.to_parquet('data/sales_clean.parquet', index=False)
reloaded_parquet = pd.read_parquet('data/sales_clean.parquet')
print(reloaded_parquet['date'].dtype)   # datetime64[ns] — preserved!
print(reloaded_parquet['units'].dtype)  # Int64 — preserved!
```

In production pipelines, always use Parquet (or another typed format like Avro) for intermediate storage. Use CSV only for human-readable exports.

---

<PracticeBlock
  prompt="Run the inspection workflow on sales_dirty.csv. Document all 9 quality issues in comments. Use: shape, dtypes, isnull().sum(), value_counts() on customer and region, and describe() on revenue and units."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Step 1: Shape
print("Shape:", df.shape)

# Step 2: dtypes
print("\\nDtypes:")
print(df.dtypes)

# Step 3: Null counts
print("\\nNull counts:")
print(df.isnull().sum())

# Step 4: Value counts on text columns

# Step 5: Numeric summary

# Document all 9 quality issues found as comments below:
`}
  hint="Use df['region'].value_counts(), df['customer'].value_counts(), and df[['revenue','units']].describe() to surface the issues."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

print("=== Shape ===")
print(df.shape)  # (13, 8)

print("\\n=== dtypes ===")
print(df.dtypes)
# date is 'object' — not datetime
# units is 'float64' — should be int

print("\\n=== Null counts ===")
print(df.isnull().sum())
# revenue: 1 null (row S003)
# units:   1 null (row S008)

print("\\n=== Region value_counts ===")
print(df['region'].value_counts())
# 8 unique values for 4 actual regions — case inconsistency

print("\\n=== Customer value_counts ===")
print(df['customer'].value_counts())
# '  Bob Wilson  ' (with spaces) and 'alice johnson' (wrong case) are visible

print("\\n=== Revenue / Units describe ===")
print(df[['revenue', 'units']].describe())
# Revenue min is -89.00 — negative value

# === 9 QUALITY ISSUES DOCUMENTED ===
# Issue 1: Duplicate row — S002 appears twice (rows 2 and 7)
# Issue 2: Whitespace in customer — '  Bob Wilson  ' has leading/trailing spaces
# Issue 3: Inconsistent region case — 'North'/'NORTH'/'north', 'South'/'SOUTH'/'south', etc.
# Issue 4: Missing revenue — row S003 is blank
# Issue 5: Missing units — row S008 is blank
# Issue 6: Negative revenue — row S007 has revenue = -89.00 (impossible)
# Issue 7: Inconsistent date format — row S008 uses '01/22/2024' vs YYYY-MM-DD standard
# Issue 8: Customer name case — 'Alice Johnson' vs 'alice johnson' (row S008)
# Issue 9: Units stored as float (1.0, 2.0) — should be integer
`}
/>

<PracticeBlock
  prompt="Apply the full clean_sales_data() pipeline from Lesson 11 to produce a clean DataFrame. Print the final .info() and .describe() to confirm the result."
  initialCode={`import pandas as pd

# All 6 cleaning functions from Lesson 11
def remove_duplicates(df):
    return df.drop_duplicates()

def clean_strings(df):
    df = df.copy()
    df['customer'] = df['customer'].str.strip().str.title()
    df['region']   = df['region'].str.strip().str.title()
    return df

def fill_missing_units(df):
    df = df.copy()
    df['units'] = df['units'].fillna(1)
    return df

def drop_missing_revenue(df):
    return df.dropna(subset=['revenue'])

def convert_types(df):
    df = df.copy()
    df['units'] = df['units'].astype('Int64')
    df['date']  = pd.to_datetime(df['date'], errors='coerce')
    return df

def fix_negative_revenue(df):
    return df[df['revenue'] >= 0].copy()

def clean_sales_data(df):
    return (df
        .pipe(remove_duplicates)
        .pipe(clean_strings)
        .pipe(fill_missing_units)
        .pipe(drop_missing_revenue)
        .pipe(convert_types)
        .pipe(fix_negative_revenue)
    )

df_raw = pd.read_csv('data/sales_dirty.csv')
print(f"Raw shape: {df_raw.shape}")
# Apply the pipeline and inspect the result
`}
  hint="Call clean_sales_data(df_raw) then print df_clean.info() and df_clean.describe()."
  solution={`import pandas as pd

def remove_duplicates(df):
    return df.drop_duplicates()

def clean_strings(df):
    df = df.copy()
    df['customer'] = df['customer'].str.strip().str.title()
    df['region']   = df['region'].str.strip().str.title()
    return df

def fill_missing_units(df):
    df = df.copy()
    df['units'] = df['units'].fillna(1)
    return df

def drop_missing_revenue(df):
    return df.dropna(subset=['revenue'])

def convert_types(df):
    df = df.copy()
    df['units'] = df['units'].astype('Int64')
    df['date']  = pd.to_datetime(df['date'], errors='coerce')
    return df

def fix_negative_revenue(df):
    return df[df['revenue'] >= 0].copy()

def clean_sales_data(df):
    return (df
        .pipe(remove_duplicates)
        .pipe(clean_strings)
        .pipe(fill_missing_units)
        .pipe(drop_missing_revenue)
        .pipe(convert_types)
        .pipe(fix_negative_revenue)
    )

df_raw = pd.read_csv('data/sales_dirty.csv')
print(f"Raw shape: {df_raw.shape}")

df_clean = clean_sales_data(df_raw)
print(f"Clean shape: {df_clean.shape}")
# 13 rows → 12 (dedup) → 11 (drop null revenue) → 10 (drop negative revenue)

print("\\n=== .info() ===")
df_clean.info()
# date: datetime64[ns], units: Int64 — types correctly set

print("\\n=== .describe() ===")
print(df_clean.describe())
# revenue min >= 0, all non-null
`}
/>

<PracticeBlock
  prompt="Save the cleaned DataFrame to 'data/sales_clean.csv' (index=False) and to 'data/sales_clean.parquet'. Reload both and compare the 'date' dtype — show how Parquet preserves datetime while CSV does not."
  initialCode={`import pandas as pd

# Assume df_clean is the output from the pipeline above
# (recreating it here with a simplified version for the exercise)
df_clean = pd.DataFrame({
    'sale_id': ['S001', 'S003', 'S004'],
    'customer': ['Alice Johnson', 'Alice Johnson', 'Charlie Brown'],
    'revenue': [1200.0, 75.0, 350.0],
    'date': pd.to_datetime(['2024-01-15', '2024-01-17', '2024-01-18']),
    'units': pd.array([1, 1, 1], dtype='Int64')
})

print("Before saving:")
print(df_clean.dtypes)
# Save to CSV and Parquet, then reload and compare dtypes
`}
  hint="Use df_clean.to_csv('data/sales_clean.csv', index=False) and df_clean.to_parquet('data/sales_clean.parquet'). Reload with read_csv and read_parquet and compare .dtypes."
  solution={`import pandas as pd

df_clean = pd.DataFrame({
    'sale_id': ['S001', 'S003', 'S004'],
    'customer': ['Alice Johnson', 'Alice Johnson', 'Charlie Brown'],
    'revenue': [1200.0, 75.0, 350.0],
    'date': pd.to_datetime(['2024-01-15', '2024-01-17', '2024-01-18']),
    'units': pd.array([1, 1, 1], dtype='Int64')
})

print("Original dtypes:")
print(df_clean.dtypes)

# Save to both formats
df_clean.to_csv('data/sales_clean.csv', index=False)
df_clean.to_parquet('data/sales_clean.parquet', index=False)

# Reload and compare
csv_reload     = pd.read_csv('data/sales_clean.csv')
parquet_reload = pd.read_parquet('data/sales_clean.parquet')

print("\\nCSV dtypes (dtypes lost):")
print(csv_reload.dtypes)
# date: object — datetime NOT preserved
# units: int64 — Int64 nullable type NOT preserved

print("\\nParquet dtypes (dtypes preserved):")
print(parquet_reload.dtypes)
# date: datetime64[ns] — preserved!
# units: Int64 — preserved!

print("\\nConclusion: Use Parquet for pipeline intermediate storage.")
print("Use CSV only for human-readable exports.")
`}
/>

---

### What Comes Next

In **Section 5: Data Transformation** you will apply GroupBy aggregation, merge operations, reshape with pivot and melt, and window functions — all on the clean DataFrames that Section 4 produces.

The skills compound: clean data from Section 4 → transform in Section 5 → load into the pipeline in Section 6. Every section builds on this one.

---

## Key Takeaways

- Use the quick-reference table to navigate from symptom to method — you don't need to memorize everything, just know where to look
- The full workflow is: inspect → document all issues → validate schema → clean → verify → save
- The `.pipe()` cleaning pipeline from Lesson 11 is reusable across any dataset with the same schema
- CSV does not preserve dtypes — dates become strings, nullable integers lose the nullable flag
- Parquet preserves all pandas dtypes — use it for pipeline intermediate files

---

## Common Mistakes to Avoid

- **Skipping the inspection step.** Running the cleaning pipeline without first documenting all issues means you may miss problems the pipeline doesn't cover.
- **Saving to CSV for intermediate pipeline files.** Downstream steps then have to re-parse types. Use Parquet as your intermediate format.
- **Not verifying after cleaning.** Run `isnull().sum()`, `duplicated().sum()`, and check dtypes after the pipeline. Verify that each metric moved in the expected direction.

---

[Back to Course Overview](./README.md) | [Next Section: Data Transformation →](../05-data-transformation/lesson-01-groupby-basics.md)
