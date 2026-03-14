# Lesson 10: Schema Validation Basics

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain what schema validation is and why it belongs at the start of every pipeline
- Check column presence using `assert` and `set.issubset()`
- Validate that numeric columns are actually numeric dtypes
- Assert value range constraints on key columns
- Write a `validate_schema(df)` function that collects all violations instead of failing on the first

---

## Prerequisites

- Lesson 5: Type Conversion Basics — dtypes
- Lesson 9: Detecting Outliers — domain assertions
- Python: `assert` statement, `isinstance()`

---

## Lesson Outline

### Part 1: What is Schema Validation?

Schema validation is the practice of asserting that a DataFrame conforms to expected structure **before** you start transforming or writing it downstream.

Without schema validation, a bad input file silently propagates errors through your entire pipeline:

- A `revenue` column that arrives as `object` dtype → `.sum()` returns a garbage string concatenation
- A required column renamed in the source → `KeyError` halfway through the pipeline
- Negative units pass through → downstream aggregations produce impossible totals

<Info>

Schema validation belongs at the **start** of every pipeline, before any transformation. Fail fast with a clear message rather than corrupt downstream outputs with silent bad data.

</Info>

---

### Part 2: Column Presence Check

```python
import pandas as pd

def check_columns(df):
    required = {'sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date'}
    actual   = set(df.columns)
    missing  = required - actual

    assert len(missing) == 0, f"Missing required columns: {missing}"

df = pd.read_csv('data/sales_dirty.csv')
check_columns(df)  # Passes — all columns present

# Simulate a missing column
df_bad = df.drop(columns=['revenue'])
check_columns(df_bad)  # AssertionError: Missing required columns: {'revenue'}
```

Using `set.issubset()`:

```python
required_cols = ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']
assert set(required_cols).issubset(df.columns), \
    f"Missing columns: {set(required_cols) - set(df.columns)}"
```

---

### Part 3: Dtype Validation

```python
import numpy as np

def check_numeric_columns(df):
    numeric_cols = ['units', 'revenue']
    for col in numeric_cols:
        assert pd.api.types.is_numeric_dtype(df[col]), \
            f"Column '{col}' should be numeric but is {df[col].dtype}"
```

`pd.api.types.is_numeric_dtype()` returns `True` for `int64`, `float64`, `Int64`, etc. This catches the case where a CSV was loaded with a column as `object` instead of `float`.

---

### Part 4: Value Range Checks

```python
def check_value_ranges(df):
    # Revenue must be non-negative (where not null)
    if df['revenue'].notna().any():
        min_rev = df['revenue'].dropna().min()
        assert min_rev >= 0, f"revenue has negative values (min={min_rev})"

    # Units must be positive (where not null)
    if df['units'].notna().any():
        min_units = df['units'].dropna().min()
        assert min_units > 0, f"units has non-positive values (min={min_units})"
```

---

### Part 5: Writing a `validate_schema()` Function

`assert` raises on the first failure. In practice, you want to collect **all** violations and report them together — so the data owner can fix everything at once rather than re-running the pipeline for each error:

```python
import pandas as pd

def validate_schema(df):
    violations = []

    # Check 1: required columns present
    required = ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']
    missing_cols = [c for c in required if c not in df.columns]
    if missing_cols:
        violations.append(f"Missing required columns: {missing_cols}")

    # Check 2: revenue >= 0 where not null
    if 'revenue' in df.columns:
        neg_count = (df['revenue'].dropna() < 0).sum()
        if neg_count > 0:
            violations.append(f"revenue has {neg_count} negative value(s)")

    # Check 3: units > 0 where not null
    if 'units' in df.columns:
        nonpos_count = (df['units'].dropna() <= 0).sum()
        if nonpos_count > 0:
            violations.append(f"units has {nonpos_count} non-positive value(s)")

    return violations


df = pd.read_csv('data/sales_dirty.csv')
issues = validate_schema(df)

if issues:
    print("Schema violations found:")
    for issue in issues:
        print(f"  - {issue}")
else:
    print("Schema validation passed.")
```

This pattern — collect violations, return a list, check the list length — is the foundation of every production data quality check. Libraries like `great_expectations` and `pandera` are built on this exact pattern at scale.

---

<PracticeBlock
  prompt="Write an assert that checks sales_dirty.csv has all required columns: ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
required_cols = ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']
# Write an assert that verifies all required columns are present
`}
  hint="Use assert set(required_cols).issubset(df.columns) with a helpful error message."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
required_cols = ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']

assert set(required_cols).issubset(df.columns), \
    f"Missing columns: {set(required_cols) - set(df.columns)}"

print("All required columns present.")
print(f"Actual columns: {list(df.columns)}")

# Test it fails gracefully with a missing column
df_bad = df.drop(columns=['revenue'])
try:
    assert set(required_cols).issubset(df_bad.columns), \
        f"Missing columns: {set(required_cols) - set(df_bad.columns)}"
except AssertionError as e:
    print(f"\nExpected error caught: {e}")
`}
/>

<PracticeBlock
  prompt="Write a validate_schema(df) function that checks: (a) required columns present, (b) revenue >= 0 where not null, (c) units > 0 where not null. Return a list of violation strings."
  initialCode={`import pandas as pd

def validate_schema(df):
    violations = []
    required = ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']

    # Check 1: required columns present

    # Check 2: revenue >= 0 where not null

    # Check 3: units > 0 where not null

    return violations

df = pd.read_csv('data/sales_dirty.csv')
issues = validate_schema(df)
print(f"Found {len(issues)} violation(s):")
for issue in issues:
    print(f"  - {issue}")
`}
  hint="Use list comprehension to find missing columns. Use .dropna() before checking value ranges to skip nulls."
  solution={`import pandas as pd

def validate_schema(df):
    violations = []
    required = ['sale_id', 'customer', 'product', 'region', 'units', 'revenue', 'date']

    # Check 1: required columns present
    missing_cols = [c for c in required if c not in df.columns]
    if missing_cols:
        violations.append(f"Missing required columns: {missing_cols}")

    # Check 2: revenue >= 0 where not null
    if 'revenue' in df.columns:
        neg_count = (df['revenue'].dropna() < 0).sum()
        if neg_count > 0:
            violations.append(f"revenue has {neg_count} negative value(s)")

    # Check 3: units > 0 where not null
    if 'units' in df.columns:
        nonpos_count = (df['units'].dropna() <= 0).sum()
        if nonpos_count > 0:
            violations.append(f"units has {nonpos_count} non-positive value(s)")

    return violations

df = pd.read_csv('data/sales_dirty.csv')
issues = validate_schema(df)
print(f"Found {len(issues)} violation(s):")
for issue in issues:
    print(f"  - {issue}")
# Expected: 1 violation — negative revenue in row S007
`}
/>

---

## Key Takeaways

- Schema validation runs at pipeline entry — fail fast with a clear error message rather than corrupt outputs
- Column presence: `assert set(required).issubset(df.columns)` with informative error
- Dtype validation: `pd.api.types.is_numeric_dtype(df['col'])` checks if a column is numeric
- Value range: use `df['col'].dropna().min()` with an `assert` to enforce non-negative, positive, or bounded values
- Prefer collecting all violations into a list over `assert` raising on the first — one data fix submission instead of many

---

## Common Mistakes to Avoid

- **Running validation after transformation.** Schema validation checks the incoming data — run it before you modify anything.
- **Validating on the full dataset without filtering nulls.** `df['revenue'].min()` includes NaN rows and returns NaN, not the actual minimum. Use `.dropna()` before computing statistics for validation.
- **Missing the `issubset()` direction.** `required.issubset(actual)` checks "is everything required present in actual?" — not the reverse. Getting the direction wrong produces false positives.

---

## Next Lesson Preview

In **Lesson 11: Building a Cleaning Pipeline** we bring all cleaning skills together — defining each operation as a reusable function and composing them into a single `clean_sales_data()` pipeline using the `.pipe()` method.

---

[Back to Section Overview](./README.md) | [Next Lesson: Building a Cleaning Pipeline →](./lesson-11-building-a-cleaning-pipeline.md)
