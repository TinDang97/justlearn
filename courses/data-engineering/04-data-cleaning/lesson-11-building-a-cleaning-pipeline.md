# Lesson 11: Building a Cleaning Pipeline

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 55 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain why ad-hoc cleaning code is not reusable and how pipeline functions solve this
- Implement each cleaning step as a pure function that takes and returns a DataFrame
- Compose multiple cleaning functions into a single pipeline using the `.pipe()` method
- Test each cleaning step individually before composing them
- Understand why this pattern is the foundation for Section 6 (ETL Pipelines)

---

## Prerequisites

- Lessons 1–10 of this section — all individual cleaning techniques
- Python: functions, return statements

---

## Lesson Outline

### Part 1: The Problem with Ad-Hoc Cleaning

Ad-hoc cleaning looks like this:

```python
df = pd.read_csv('data/sales_dirty.csv')
df = df.drop_duplicates()
df['customer'] = df['customer'].str.strip().str.title()
df['region'] = df['region'].str.strip().str.title()
df['units'] = df['units'].fillna(1).astype('Int64')
df = df.dropna(subset=['revenue'])
df['date'] = pd.to_datetime(df['date'], errors='coerce')
df = df[df['revenue'] >= 0]
```

The problems:
1. **Not reusable.** This code lives in a notebook. When a new file arrives, you copy-paste and manually re-run it.
2. **Not testable.** You cannot write a unit test for a sequence of statements.
3. **Not composable.** You cannot selectively apply or skip steps.
4. **Not documented.** There's no clear statement of what each step does or why.

---

### Part 2: The Cleaning Pipeline Pattern

The solution: define each cleaning step as a **pure function** that takes a DataFrame and returns a DataFrame:

```python
def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove exact duplicate rows."""
    return df.drop_duplicates()
```

A pure function in this context means:
- Takes a DataFrame as input
- Returns a new DataFrame (does not modify the input in place)
- Does one thing

This makes each step independently testable. And because every function has the same signature `(df) → df`, you can chain them.

---

### Part 3: Building the Six Cleaning Functions

```python
import pandas as pd

def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove exact duplicate rows."""
    return df.drop_duplicates()


def clean_strings(df: pd.DataFrame) -> pd.DataFrame:
    """Strip whitespace and normalize case for customer and region columns."""
    df = df.copy()
    df['customer'] = df['customer'].str.strip().str.title()
    df['region']   = df['region'].str.strip().str.title()
    return df


def fill_missing_units(df: pd.DataFrame) -> pd.DataFrame:
    """Fill missing units with 1 (business rule: assume 1 unit if not recorded)."""
    df = df.copy()
    df['units'] = df['units'].fillna(1)
    return df


def drop_missing_revenue(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows where revenue is null — a row without revenue cannot be analyzed."""
    return df.dropna(subset=['revenue'])


def convert_types(df: pd.DataFrame) -> pd.DataFrame:
    """Convert units to Int64 and date to datetime64."""
    df = df.copy()
    df['units'] = df['units'].astype('Int64')
    df['date']  = pd.to_datetime(df['date'], errors='coerce')
    return df


def fix_negative_revenue(df: pd.DataFrame) -> pd.DataFrame:
    """Remove rows with negative revenue — logically impossible for sales."""
    return df[df['revenue'] >= 0].copy()
```

<Tip>

Write each cleaning step as a pure function (takes df, returns df). This makes each step independently testable and the pipeline composable. This is the foundational pattern for Section 6 (ETL Pipelines).

</Tip>

Note the `.copy()` calls: these prevent pandas `SettingWithCopyWarning` by ensuring each function works on an independent copy of the data.

---

### Part 4: Composing the Pipeline with `.pipe()`

`.pipe(func)` calls `func(df)` and returns the result. It allows you to chain function calls without intermediate variable assignments:

```python
def clean_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    """Apply the complete sales data cleaning pipeline."""
    return (df
        .pipe(remove_duplicates)
        .pipe(clean_strings)
        .pipe(fill_missing_units)
        .pipe(drop_missing_revenue)
        .pipe(convert_types)
        .pipe(fix_negative_revenue)
    )
```

This is equivalent to the nested call version, but readable:

```python
# Equivalent — but unreadable at pipeline length
fix_negative_revenue(
    convert_types(
        drop_missing_revenue(
            fill_missing_units(
                clean_strings(
                    remove_duplicates(df)
                )
            )
        )
    )
)
```

---

### Part 5: The `.pipe()` Method

`.pipe()` accepts any callable that takes a DataFrame as its first argument. You can also pass keyword arguments:

```python
# Passing extra arguments with pipe
def drop_null_col(df, col):
    return df.dropna(subset=[col])

cleaned = df.pipe(drop_null_col, col='revenue')
```

The pipeline executes in order, top to bottom — the output of each step is the input to the next. This linear data flow makes it easy to debug: add a `print(df.shape)` to any step and you can see exactly where the row count changes.

---

<PracticeBlock
  prompt="Implement remove_duplicates(df) and clean_strings(df) functions. Test each individually on sales_dirty.csv."
  initialCode={`import pandas as pd

def remove_duplicates(df):
    # Remove exact duplicate rows
    pass

def clean_strings(df):
    # Strip whitespace and normalize customer and region to title case
    pass

df = pd.read_csv('data/sales_dirty.csv')
print(f"Original shape: {df.shape}")
print(f"Original customer unique: {df['customer'].unique()}")
print(f"Original region unique: {df['region'].unique()}")
`}
  hint="Use df.drop_duplicates() for remove_duplicates. Use df.copy() then .str.strip().str.title() for clean_strings."
  solution={`import pandas as pd

def remove_duplicates(df):
    """Remove exact duplicate rows."""
    return df.drop_duplicates()

def clean_strings(df):
    """Strip whitespace and normalize case for customer and region."""
    df = df.copy()
    df['customer'] = df['customer'].str.strip().str.title()
    df['region']   = df['region'].str.strip().str.title()
    return df

df = pd.read_csv('data/sales_dirty.csv')
print(f"Original:          {df.shape}")

df1 = remove_duplicates(df)
print(f"After dedup:       {df1.shape}")

df2 = clean_strings(df1)
print(f"After clean_strings: {df2.shape}")
print(f"Customer unique: {sorted(df2['customer'].unique())}")
print(f"Region unique:   {sorted(df2['region'].unique())}")
`}
/>

<PracticeBlock
  prompt="Compose all 6 cleaning functions into a clean_sales_data(df) pipeline using .pipe(). Run it on sales_dirty.csv and print before/after shape and dtypes."
  initialCode={`import pandas as pd

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

# Compose the pipeline using .pipe() and run it
df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(f"  Shape: {df.shape}")
print(f"  dtypes:\\n{df.dtypes}")
`}
  hint="Define clean_sales_data(df) that uses df.pipe(remove_duplicates).pipe(clean_strings)... chaining all 6 steps."
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
    """Complete sales data cleaning pipeline."""
    return (df
        .pipe(remove_duplicates)
        .pipe(clean_strings)
        .pipe(fill_missing_units)
        .pipe(drop_missing_revenue)
        .pipe(convert_types)
        .pipe(fix_negative_revenue)
    )

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}")
print(f"dtypes:\\n{df.dtypes}\\n")

df_clean = clean_sales_data(df)
print(f"After: {df_clean.shape}")
print(f"dtypes:\\n{df_clean.dtypes}")
`}
/>

---

## Key Takeaways

- Ad-hoc cleaning is not reusable, not testable, and not composable — move cleaning logic into functions
- Each cleaning step is a pure function `(df) → df` — same input shape, same output shape, one responsibility
- Use `df.copy()` inside functions that modify columns to avoid `SettingWithCopyWarning`
- `.pipe(func)` calls `func(df)` and returns the result — enabling a readable top-to-bottom chain
- The `.pipe()` pattern is directly reusable in Section 6 (ETL Pipelines) — this is not just a cleaning pattern, it's a pipeline architecture pattern

---

## Common Mistakes to Avoid

- **Modifying the input DataFrame in place.** Use `df = df.copy()` at the start of any function that modifies columns. Without this, the original DataFrame is mutated and debugging becomes confusing.
- **Making functions do too much.** If a function is called `clean_strings_and_fill_nulls_and_convert_types`, it violates single responsibility. Break it up.
- **Forgetting to return the DataFrame.** A function that modifies `df` in place but returns `None` will cause `NoneType has no attribute 'pipe'` in the chain.

---

## Next Lesson Preview

In **Lesson 12: Section Review — Data Cleaning**, you will apply the complete cleaning pipeline to `sales_dirty.csv` from scratch, practice the full inspect → clean → validate → save workflow, and save the result in both CSV and Parquet formats.

---

[Back to Section Overview](./README.md) | [Next Lesson: Section Review — Data Cleaning →](./lesson-12-section-review-data-cleaning.md)
