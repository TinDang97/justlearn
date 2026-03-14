# Lesson 5: Type Conversion Basics

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain why wrong dtypes cause silent incorrect behavior in numeric operations
- Use `.astype()` for straightforward type conversion
- Use `pd.to_numeric(errors='coerce')` to safely convert dirty numeric columns
- Handle the NaN-prevents-int-conversion problem using pandas nullable `Int64`
- Apply the pattern: coerce → inspect NaN count → decide

---

## Prerequisites

- Lesson 1: Detecting Missing Values — `isnull().sum()`
- Lesson 2: Handling Missing Values — `fillna()`
- Basic pandas: `.dtypes`, `.info()`

---

## Lesson Outline

### Part 1: Why Types Matter

When pandas reads a CSV, it infers column types. If a numeric column contains any non-numeric characters, pandas infers `object` dtype (stored as Python strings). Operations on string columns behave differently than on numeric columns:

```python
import pandas as pd

# String "addition" is concatenation, not math
s = pd.Series(['100', '200', '300'])
print(s.sum())   # '100200300' — wrong!
print(s.astype(float).sum())  # 600.0 — correct
```

This is a silent failure — no error is raised, you just get wrong results. Type validation is part of every data cleaning pipeline.

---

### Part 2: `.astype()` — Direct Type Conversion

`.astype()` converts a column to a specified dtype:

```python
df = pd.read_csv('data/sales_dirty.csv')

# Convert revenue to float (it already is, but explicit is safer)
df['revenue'] = df['revenue'].astype(float)

# Convert sale_id to string (prevent accidental numeric operations on IDs)
df['sale_id'] = df['sale_id'].astype(str)

# Convert a column to pandas categorical (memory efficient for low-cardinality)
df['region'] = df['region'].astype('category')
```

`.astype()` raises a `ValueError` if any value cannot be converted. For clean data this is fine. For dirty data, you need the safer pattern below.

---

### Part 3: `pd.to_numeric(errors='coerce')` — Safe Numeric Conversion

`pd.to_numeric()` with `errors='coerce'` converts what it can and silently converts unconvertible values to `NaN` instead of raising:

```python
import pandas as pd
import numpy as np

# A realistic dirty column: mostly numbers, one bad value
dirty = pd.Series(['100', '200', 'N/A', '400', ''])

# errors='raise' (default) would throw ValueError on 'N/A'
# errors='coerce' replaces bad values with NaN
clean = pd.to_numeric(dirty, errors='coerce')
print(clean)
# 0    100.0
# 1    200.0
# 2      NaN   ← 'N/A' coerced to NaN
# 3    400.0
# 4      NaN   ← '' coerced to NaN

print(f"NaN introduced: {clean.isnull().sum()}")
```

The pattern is: coerce → inspect how many NaN were introduced → decide whether to fill or drop.

---

### Part 4: The Coerce Pattern

```python
df = pd.read_csv('data/sales_dirty.csv')

before_nulls = df['units'].isnull().sum()
df['units'] = pd.to_numeric(df['units'], errors='coerce')
after_nulls = df['units'].isnull().sum()

new_nulls = after_nulls - before_nulls
print(f"Conversion introduced {new_nulls} new NaN value(s)")

# Inspect rows where conversion failed
if new_nulls > 0:
    print(df[df['units'].isnull()][['sale_id', 'units']])
```

This pattern is safe: you can see exactly which rows had unconvertible values and handle them deliberately.

---

### Part 5: Float-to-Int Conversion and Nullable `Int64`

A common issue: a column of integers was stored as float (`1.0`, `2.0`) because it has at least one `NaN` — standard Python `int` cannot represent `NaN`, so pandas uses float.

Converting directly fails:

```python
df['units'].astype(int)  # ValueError: Cannot convert NaN to integer
```

<Warning>

`.astype(int)` raises an error if the column contains `NaN`. Use `.astype('Int64')` (capital `I`) for pandas nullable integer, which can hold both integer values and `NaN`.

</Warning>

The full safe workflow:

```python
# Step 1: fill NaN before converting to standard int
df['units'] = df['units'].fillna(0).astype(int)

# Or: use nullable Int64 to preserve NaN
df['units'] = df['units'].astype('Int64')
# Now df['units'] dtype is Int64 (nullable), not int64 (non-nullable)
```

The difference: `int64` (lowercase) cannot hold `NaN`. `Int64` (uppercase) is pandas' nullable integer type that can.

---

<PracticeBlock
  prompt="The 'units' column in sales_dirty.csv has values like 1.0, 2.0. Convert it to integer type safely — fill NaN with 0 first, then convert to Int64."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(df['units'].dtype)
print(df['units'].isnull().sum(), "null values")
# Fill NaN then convert to Int64
`}
  hint="Use fillna(0) first to handle the NaN in row S008, then .astype('Int64')."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: dtype={df['units'].dtype}, nulls={df['units'].isnull().sum()}")

# Fill NaN with 0 (business rule: 0 units if unknown)
df['units'] = df['units'].fillna(0).astype('Int64')

print(f"After:  dtype={df['units'].dtype}, nulls={df['units'].isnull().sum()}")
print(df[['sale_id', 'units']].head(10))
`}
/>

<PracticeBlock
  prompt="Use pd.to_numeric(errors='coerce') on a revenue-like column that contains a string 'N/A'. Show how NaN is introduced and how many rows are affected."
  initialCode={`import pandas as pd
import numpy as np

# Simulate a dirty revenue column
dirty_revenue = pd.Series(['1200.00', '50.00', 'N/A', '350.00', '', '-89.00'])
print("Before conversion:")
print(dirty_revenue)
# Apply pd.to_numeric with errors='coerce'
`}
  hint="Use pd.to_numeric(dirty_revenue, errors='coerce') to coerce bad values to NaN."
  solution={`import pandas as pd
import numpy as np

dirty_revenue = pd.Series(['1200.00', '50.00', 'N/A', '350.00', '', '-89.00'])
print("Before conversion:")
print(dirty_revenue)

clean_revenue = pd.to_numeric(dirty_revenue, errors='coerce')
print("\nAfter pd.to_numeric(errors='coerce'):")
print(clean_revenue)
print(f"\nNaN introduced: {clean_revenue.isnull().sum()} value(s)")
print(f"Indices with NaN: {list(clean_revenue[clean_revenue.isnull()].index)}")
`}
/>

<PracticeBlock
  prompt="Convert 'sale_id' to string type explicitly to prevent accidental numeric operations on ID columns."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"sale_id dtype before: {df['sale_id'].dtype}")
# Convert sale_id to string
`}
  hint="Use df['sale_id'].astype(str) to convert to string dtype."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"sale_id dtype before: {df['sale_id'].dtype}")

df['sale_id'] = df['sale_id'].astype(str)
print(f"sale_id dtype after:  {df['sale_id'].dtype}")

# Demonstrate why this matters: string IDs should never be summed
# df['sale_id'].sum() now returns a concatenated string, making the mistake visible
# rather than silently producing a meaningless number
print(f"\nFirst 3 sale_ids: {df['sale_id'].head(3).tolist()}")
`}
/>

---

## Key Takeaways

- Wrong dtypes cause silent incorrect behavior — string columns summed give concatenation, not math
- `.astype()` is the direct conversion tool; it raises on failure (good for clean data)
- `pd.to_numeric(errors='coerce')` is the safe conversion tool — converts bad values to NaN instead of raising
- Always inspect how many NaN the coerce pattern introduces before deciding how to handle them
- `int64` cannot hold NaN; use `'Int64'` (pandas nullable integer) when you need integers with missing values
- ID columns (sale_id, customer_id) should be stored as strings to prevent accidental arithmetic

---

## Common Mistakes to Avoid

- **Using `.astype(int)` when nulls exist.** This raises immediately. Fill nulls first or use `'Int64'`.
- **Ignoring NaN introduced by `errors='coerce'`.** Every coerced NaN was a bad value in the source. Log or report these — don't silently swallow data quality issues.
- **Leaving ID columns as integers.** IDs like `S001`, `12345`, `user_007` should be strings. Summing or averaging them is meaningless and misleading.

---

## Next Lesson Preview

In **Lesson 6: Parsing and Working with Dates** we tackle one of the most common type issues in real data: date strings stored as text, mixed formats in a single column, and extracting date components with the `.dt` accessor.

---

[Back to Section Overview](./README.md) | [Next Lesson: Parsing and Working with Dates →](./lesson-06-parsing-dates.md)
