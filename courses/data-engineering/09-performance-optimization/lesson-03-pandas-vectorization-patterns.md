# Lesson 3: Pandas Vectorization Patterns

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Replace `apply(lambda row: ...)` with direct column arithmetic
- Use the `.str` accessor for vectorized string operations without `apply()`
- Use the `.dt` accessor for vectorized datetime operations
- Apply conditional logic with `np.where` and `pd.cut` instead of row-level functions
- Measure the speedup of each pattern with `time.perf_counter()`

---

## Prerequisites

- Lesson 2: Vectorization with NumPy
- Section 2: Pandas Fundamentals (column operations, dtypes)

---

## Lesson Outline

### Part 1: Column Arithmetic — The Most Common Case (30 minutes)

#### Explanation

The single most impactful optimization in pandas is eliminating `apply(axis=1)` calls for numeric arithmetic. Any operation that combines values from two or more columns using math can be written as direct column operations.

```python
import pandas as pd
import numpy as np
import time

# 100,000-row orders DataFrame
np.random.seed(42)
n = 100_000
df = pd.DataFrame({
    'price':    np.random.uniform(1.0, 500.0,  size=n),
    'quantity': np.random.randint(1, 50,        size=n),
    'discount': np.random.uniform(0.0, 0.3,    size=n),
})

# BEFORE (slow) — apply with axis=1 processes one row at a time
start = time.perf_counter()
df['total_apply'] = df.apply(
    lambda row: row['price'] * row['quantity'] * (1 - row['discount']),
    axis=1
)
apply_time = time.perf_counter() - start
print(f"apply(axis=1):    {apply_time:.3f}s")
# apply(axis=1):    0.247s

# AFTER (fast) — vectorized column arithmetic
start = time.perf_counter()
df['total_vec'] = df['price'] * df['quantity'] * (1 - df['discount'])
vec_time = time.perf_counter() - start
print(f"Vectorized:       {vec_time:.4f}s")
# Vectorized:       0.0021s

print(f"Speedup: {apply_time / vec_time:.0f}x faster")
# Speedup: ~118x faster

# Verify identical results
pd.testing.assert_series_equal(
    df['total_apply'], df['total_vec'],
    check_names=False, rtol=1e-5
)
print("Results match: PASS")
```

**Rule:** any row-level arithmetic combining numeric columns can be vectorized. The pattern maps directly:

| apply pattern | vectorized equivalent |
|---|---|
| `lambda row: row['a'] + row['b']` | `df['a'] + df['b']` |
| `lambda row: row['a'] * row['b']` | `df['a'] * df['b']` |
| `lambda row: row['a'] / row['b']` | `df['a'] / df['b']` |
| `lambda row: row['a'] ** 2` | `df['a'] ** 2` |
| `lambda row: (row['a'] - row['b']) / row['c']` | `(df['a'] - df['b']) / df['c']` |

---

#### Practice

Write the vectorized equivalent for:
```python
df['margin'] = df.apply(lambda row: (row['price'] - row['cost']) / row['price'], axis=1)
```

Then time both versions on a 50,000-row DataFrame. Print the speedup.

---

### Part 2: The `.str` Accessor (30 minutes)

#### Explanation

String operations on object-dtype columns are a common source of slow `apply()` calls. The `.str` accessor gives you a vectorized interface to Python string methods — no loop, no apply.

```python
import pandas as pd
import numpy as np
import time

np.random.seed(42)
n = 50_000
first_names = ['Alice', 'Bob', 'Carol', 'David', 'Eve']
last_names  = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor']
df = pd.DataFrame({
    'full_name': [
        f"{np.random.choice(first_names)} {np.random.choice(last_names)}"
        for _ in range(n)
    ],
    'email': [
        f"user{i}@{'gmail' if i % 2 == 0 else 'yahoo'}.com"
        for i in range(n)
    ],
})

# BEFORE (slow) — apply to extract first name
start = time.perf_counter()
df['first_apply'] = df['full_name'].apply(lambda x: x.split()[0])
apply_time = time.perf_counter() - start
print(f"apply split:     {apply_time:.3f}s")
# apply split:     0.058s

# AFTER (fast) — .str accessor
start = time.perf_counter()
df['first_str'] = df['full_name'].str.split().str[0]
str_time = time.perf_counter() - start
print(f".str split:      {str_time:.4f}s")
# .str split:      0.0091s

print(f"Speedup: {apply_time / str_time:.0f}x faster")
# Speedup: ~6x faster (string ops are still Python-backed, but no per-row function call overhead)
```

**Full `.str` API surface — use these instead of apply:**

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['  Alice Smith  ', 'BOB JONES', 'carol williams'],
    'email':  ['alice@gmail.com', 'bob@YAHOO.COM', 'carol@hotmail.com'],
    'code':   ['A-001', 'B-002', 'C-003'],
})

# Case operations
print(df['name'].str.upper())        # ['  ALICE SMITH  ', 'BOB JONES', 'CAROL WILLIAMS']
print(df['name'].str.lower())        # ['  alice smith  ', 'bob jones', 'carol williams']
print(df['name'].str.title())        # ['  Alice Smith  ', 'Bob Jones', 'Carol Williams']

# Whitespace
print(df['name'].str.strip())        # ['Alice Smith', 'BOB JONES', 'carol williams']

# Pattern matching
print(df['email'].str.contains('gmail'))   # [True, False, False]
print(df['email'].str.endswith('.com'))    # [True, True, True]
print(df['email'].str.startswith('alice')) # [True, False, False]

# Extraction
print(df['email'].str.split('@').str[0])   # ['alice', 'bob', 'carol'] — local part
print(df['code'].str.split('-').str[1])    # ['001', '002', '003'] — after dash

# Length and replacement
print(df['name'].str.len())                # [15, 9, 14]
print(df['email'].str.replace('.com', '.org', regex=False))
# ['alice@gmail.org', 'bob@YAHOO.org', 'carol@hotmail.org']

# NaN handling — use na=False to treat NaN as False in boolean operations
df2 = pd.DataFrame({'text': ['hello', None, 'world']})
print(df2['text'].str.contains('o', na=False))  # [True, False, True]
```

---

#### Practice

Given a DataFrame with a `product_code` column containing values like `"CAT-A-001"`, `"CAT-B-042"`:
1. Extract the category letter (second segment, between the first and second dash) using `.str.split()`
2. Extract the numeric part (last 3 characters) using `.str[-3:]`
3. Add an `is_category_a` boolean column using `.str.contains('CAT-A')`

All without using `apply()`.

---

### Part 3: The `.dt` Accessor and Conditional Logic (30 minutes)

#### Explanation

Datetime columns support a `.dt` accessor analogous to `.str`. All temporal extraction operations are vectorized.

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 30_000
start_date = pd.Timestamp('2023-01-01')
df = pd.DataFrame({
    'order_date': pd.date_range(start=start_date, periods=n, freq='1H'),
    'amount':     np.random.uniform(10, 5000, size=n),
})

# .dt accessor — all vectorized, no apply needed
df['year']       = df['order_date'].dt.year
df['month']      = df['order_date'].dt.month
df['day']        = df['order_date'].dt.day
df['hour']       = df['order_date'].dt.hour
df['dayofweek']  = df['order_date'].dt.dayofweek   # 0=Monday, 6=Sunday
df['is_weekend'] = df['order_date'].dt.dayofweek >= 5
df['quarter']    = df['order_date'].dt.quarter
df['week']       = df['order_date'].dt.isocalendar().week

print(df[['order_date', 'year', 'month', 'is_weekend']].head(3))
#             order_date  year  month  is_weekend
# 0  2023-01-01 00:00:00  2023      1       False
# 1  2023-01-01 01:00:00  2023      1       False
# 2  2023-01-01 02:00:00  2023      1       False
```

**`np.where` — vectorized if-else:**

```python
import pandas as pd
import numpy as np
import time

np.random.seed(42)
n = 100_000
df = pd.DataFrame({'amount': np.random.uniform(0, 2000, size=n)})

# BEFORE (slow) — apply with conditional
start = time.perf_counter()
df['tier_apply'] = df['amount'].apply(lambda x: 'high' if x > 1000 else 'low')
apply_time = time.perf_counter() - start
print(f"apply conditional:  {apply_time:.3f}s")
# apply conditional:  0.042s

# AFTER (fast) — np.where
start = time.perf_counter()
df['tier_where'] = np.where(df['amount'] > 1000, 'high', 'low')
where_time = time.perf_counter() - start
print(f"np.where:           {where_time:.4f}s")
# np.where:           0.0014s

print(f"Speedup: {apply_time / where_time:.0f}x faster")
# Speedup: ~30x faster

# Nested np.where for 3 tiers
df['tier3'] = np.where(
    df['amount'] > 1000, 'premium',
    np.where(df['amount'] > 100, 'standard', 'basic')
)
print(df['tier3'].value_counts())
```

**`pd.cut` — bin continuous values without loops:**

```python
import pandas as pd
import numpy as np

np.random.seed(42)
amounts = pd.Series(np.random.uniform(0, 2000, size=20))

# pd.cut assigns each value to a named bin — no apply, no loop
tiers = pd.cut(
    amounts,
    bins=[0, 100, 500, 1000, float('inf')],
    labels=['low', 'medium', 'high', 'premium']
)
print(tiers.value_counts())
# low       4
# medium    8
# high      5
# premium   3
# dtype: int64

# Include_lowest ensures 0 is captured in the first bin
tiers2 = pd.cut(
    amounts,
    bins=[0, 100, 500, 1000, float('inf')],
    labels=['low', 'medium', 'high', 'premium'],
    include_lowest=True
)
```

---

#### Practice

<PracticeBlock
  title="Vectorized String and Datetime Operations"
  starter={`import pandas as pd
import numpy as np

np.random.seed(42)
n = 5_000
names = ['Alice Smith', 'Bob Jones', 'Carol Williams', 'David Brown', 'Eve Taylor']
df = pd.DataFrame({
    'full_name':   [np.random.choice(names) for _ in range(n)],
    'birth_date':  pd.date_range(start='1970-01-01', periods=n, freq='7D'),
    'salary':      np.random.uniform(40_000, 150_000, size=n),
})

# Task 1: Extract last name (second word) into 'last_name' column
# Use .str accessor only — no apply()
# df['last_name'] = ...

# Task 2: Compute age in years into 'birth_year' column
# Use .dt accessor
# df['birth_year'] = ...

# Task 3: Add 'salary_band' column using pd.cut
# Bins: [0, 60000, 90000, 120000, inf] → labels: ['junior', 'mid', 'senior', 'principal']
# df['salary_band'] = ...

# Print the first 5 rows of the result
print(df[['full_name', 'last_name', 'birth_year', 'salary_band']].head())
`}
  solution={`import pandas as pd
import numpy as np

np.random.seed(42)
n = 5_000
names = ['Alice Smith', 'Bob Jones', 'Carol Williams', 'David Brown', 'Eve Taylor']
df = pd.DataFrame({
    'full_name':   [np.random.choice(names) for _ in range(n)],
    'birth_date':  pd.date_range(start='1970-01-01', periods=n, freq='7D'),
    'salary':      np.random.uniform(40_000, 150_000, size=n),
})

# Task 1: Extract last name using .str
df['last_name'] = df['full_name'].str.split().str[-1]

# Task 2: Extract birth year using .dt
df['birth_year'] = df['birth_date'].dt.year

# Task 3: Salary band using pd.cut
df['salary_band'] = pd.cut(
    df['salary'],
    bins=[0, 60_000, 90_000, 120_000, float('inf')],
    labels=['junior', 'mid', 'senior', 'principal']
)

print(df[['full_name', 'last_name', 'birth_year', 'salary_band']].head())`}
/>

---

### Part 4: Combining Patterns in a Real Pipeline (30 minutes)

#### Explanation

Real pipelines combine all the patterns above. This part shows a complete before/after transformation of a mini-pipeline.

```python
import pandas as pd
import numpy as np
import time

np.random.seed(42)
n = 50_000
df = pd.DataFrame({
    'customer_name': [
        f"{'first_' + str(i)} {'last_' + str(i % 100)}"
        for i in range(n)
    ],
    'order_date':    pd.date_range('2023-01-01', periods=n, freq='30min'),
    'amount':        np.random.uniform(5, 3000, size=n),
    'cost':          np.random.uniform(1, 1500, size=n),
})

# BEFORE — pipeline using apply for everything
start = time.perf_counter()
df_slow = df.copy()
df_slow['last_name']   = df_slow['customer_name'].apply(lambda x: x.split()[1])
df_slow['year']        = df_slow['order_date'].apply(lambda x: x.year)
df_slow['margin']      = df_slow.apply(
    lambda r: (r['amount'] - r['cost']) / r['amount'], axis=1
)
df_slow['tier']        = df_slow['amount'].apply(
    lambda x: 'premium' if x > 1000 else ('mid' if x > 100 else 'basic')
)
slow_time = time.perf_counter() - start
print(f"apply-based pipeline:   {slow_time:.3f}s")
# apply-based pipeline:   0.312s

# AFTER — fully vectorized pipeline
start = time.perf_counter()
df_fast = df.copy()
df_fast['last_name']   = df_fast['customer_name'].str.split().str[1]
df_fast['year']        = df_fast['order_date'].dt.year
df_fast['margin']      = (df_fast['amount'] - df_fast['cost']) / df_fast['amount']
df_fast['tier']        = np.where(
    df_fast['amount'] > 1000, 'premium',
    np.where(df_fast['amount'] > 100, 'mid', 'basic')
)
fast_time = time.perf_counter() - start
print(f"Vectorized pipeline:    {fast_time:.4f}s")
# Vectorized pipeline:    0.0071s

print(f"Speedup: {slow_time / fast_time:.0f}x faster")
# Speedup: ~44x faster
```

---

<PracticeBlock
  title="Replace apply() with Vectorized Operations"
  starter={`import pandas as pd
import numpy as np
import time

np.random.seed(42)
n = 20_000
df = pd.DataFrame({
    'product_code': [f"CAT-{'AB'[i%2]}-{i:04d}" for i in range(n)],
    'sale_date':    pd.date_range('2024-01-01', periods=n, freq='45min'),
    'price':        np.random.uniform(10, 1000, size=n),
    'units':        np.random.randint(1, 20, size=n),
})

# BEFORE — using apply() for everything (runs but is slow)
start = time.perf_counter()
df['category']   = df['product_code'].apply(lambda x: x.split('-')[1])
df['sale_month'] = df['sale_date'].apply(lambda x: x.month)
df['revenue']    = df.apply(lambda r: r['price'] * r['units'], axis=1)
df['grade']      = df['revenue'].apply(
    lambda x: 'A' if x >= 10000 else ('B' if x >= 1000 else 'C')
)
slow_time = time.perf_counter() - start
print(f"apply-based:  {slow_time:.3f}s")

# TODO: Rewrite the 4 lines above using vectorized operations
# 1. df['category']   = ... (use .str)
# 2. df['sale_month'] = ... (use .dt)
# 3. df['revenue']    = ... (use column arithmetic)
# 4. df['grade']      = ... (use np.where)

# After rewriting, print the speedup ratio
`}
  solution={`import pandas as pd
import numpy as np
import time

np.random.seed(42)
n = 20_000
df = pd.DataFrame({
    'product_code': [f"CAT-{'AB'[i%2]}-{i:04d}" for i in range(n)],
    'sale_date':    pd.date_range('2024-01-01', periods=n, freq='45min'),
    'price':        np.random.uniform(10, 1000, size=n),
    'units':        np.random.randint(1, 20, size=n),
})

# BEFORE
start = time.perf_counter()
df2 = df.copy()
df2['category']   = df2['product_code'].apply(lambda x: x.split('-')[1])
df2['sale_month'] = df2['sale_date'].apply(lambda x: x.month)
df2['revenue']    = df2.apply(lambda r: r['price'] * r['units'], axis=1)
df2['grade']      = df2['revenue'].apply(
    lambda x: 'A' if x >= 10000 else ('B' if x >= 1000 else 'C')
)
slow_time = time.perf_counter() - start
print(f"apply-based:  {slow_time:.3f}s")

# AFTER — fully vectorized
start = time.perf_counter()
df['category']   = df['product_code'].str.split('-').str[1]
df['sale_month'] = df['sale_date'].dt.month
df['revenue']    = df['price'] * df['units']
df['grade']      = np.where(
    df['revenue'] >= 10000, 'A',
    np.where(df['revenue'] >= 1000, 'B', 'C')
)
fast_time = time.perf_counter() - start
print(f"Vectorized:   {fast_time:.4f}s")
print(f"Speedup: {slow_time / fast_time:.0f}x")

# Verify
pd.testing.assert_series_equal(df2['category'],   df['category'])
pd.testing.assert_series_equal(df2['sale_month'], df['sale_month'])
pd.testing.assert_series_equal(df2['revenue'],    df['revenue'])
pd.testing.assert_series_equal(df2['grade'],      df['grade'])
print("All results match: PASS")`}
/>

---

## Key Takeaways

- The only time `apply()` is acceptable is for genuinely complex multi-column logic that cannot be expressed as any vectorized operation
- `.str` and `.dt` accessors are already vectorized — never use `apply()` to call string or datetime methods
- `np.where(condition, a, b)` replaces all two-branch `apply()` conditionals and is ~30-50x faster
- `pd.cut()` replaces range-bucketing apply calls and produces a memory-efficient Categorical result
- Column arithmetic (`df['a'] * df['b']`) replaces `apply(lambda row: row['a'] * row['b'], axis=1)` and is ~50-200x faster on 100K rows

---

## Common Mistakes to Avoid

- **Using `apply()` out of habit** when column arithmetic works. Before writing `apply`, ask: "Can I express this as column ops, `.str.`, `.dt.`, or `np.where`?"
- **Chaining `.str` calls without checking for NaN**: NaN propagates through `.str` operations — use `na=False` in `.str.contains()` and `.str.startswith()` to avoid unexpected True/False results on nulls
- **Using `pd.cut` without explicit bin edges**: auto-generated edges change when new data arrives. Always define `bins=[...]` explicitly in production code
- **Forgetting that `.dt` requires datetime dtype**: if the column is `object` dtype, convert it first with `pd.to_datetime(df['col'])` before using `.dt`

---

## Next Lesson Preview

- Measuring DataFrame memory usage with `memory_usage(deep=True)`
- Downcasting integers (int64 → int8/int16/int32) and floats (float64 → float32)
- Converting low-cardinality string columns to `category` dtype for 5-10x memory savings
- Reducing a 80MB DataFrame to 12MB with systematic dtype optimization

---

[← Previous: Vectorization with NumPy](./lesson-02-vectorization-with-numpy.md) | [Next: Memory Optimization with Dtypes →](./lesson-04-memory-optimization-dtypes.md)
