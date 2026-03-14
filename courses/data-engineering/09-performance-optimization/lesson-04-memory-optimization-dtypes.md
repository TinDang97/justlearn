# Lesson 4: Memory Optimization with Dtypes

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Read a DataFrame's memory footprint using `memory_usage(deep=True)`
- Downcast integer columns from int64 to the smallest fitting integer type
- Downcast float columns from float64 to float32
- Convert low-cardinality string columns to `category` dtype
- Measure memory reduction after downcasting and verify no data loss

---

## Prerequisites

- Lesson 1: Why Performance Matters
- Section 2: Pandas Fundamentals — Dtypes and Type Inspection (Lesson 7)

---

## Lesson Outline

### Part 1: Measuring Memory Usage (30 minutes)

#### Explanation

Before optimizing memory, you need to measure it accurately. Pandas provides `memory_usage(deep=True)` — the `deep=True` flag is critical for object columns, which store Python string objects rather than raw bytes.

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 1_000_000

# A realistic wide DataFrame with default dtypes (all "safe" but wasteful)
df = pd.DataFrame({
    'user_id':    np.random.randint(1, 100_000, size=n),        # int64
    'age':        np.random.randint(18, 80, size=n),            # int64
    'score':      np.random.uniform(0.0, 100.0, size=n),        # float64
    'price':      np.random.uniform(0.01, 999.99, size=n),      # float64
    'status':     np.random.choice(['active', 'inactive', 'pending'], size=n),   # object
    'category':   np.random.choice(['A', 'B', 'C', 'D', 'E'], size=n),          # object
    'region':     np.random.choice(['north', 'south', 'east', 'west'], size=n), # object
})

# Memory per column (in bytes)
mem_per_col = df.memory_usage(deep=True)
print(mem_per_col)
# Index      128
# user_id    8000128   (8 bytes × 1M rows)
# age        8000128
# score      8000128
# price      8000128
# status    66000560   (object strings — variable size, measured deeply)
# category  58000448
# region    62000448

total_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
print(f"Total memory: {total_mb:.1f} MB")
# Total memory: 247.6 MB

# Compare: without deep=True, object columns show wrong (too small) size
mem_shallow = df.memory_usage(deep=False).sum() / 1024 ** 2
print(f"Shallow (wrong for objects): {mem_shallow:.1f} MB")
# Shallow (wrong for objects): 61.0 MB  ← misleading!

print(f"\nColumn dtypes:")
print(df.dtypes)
# user_id     int64
# age         int64
# score       float64
# price       float64
# status      object
# category    object
# region      object
```

**Reading the output:** each int64 column uses 8 bytes per row. With 1M rows, that is 8MB per column. Object columns use more because each element is a Python string object (24+ bytes for the object header, plus the string data).

---

#### Practice

Load a DataFrame with 200,000 rows and at least 5 columns (mix of int, float, and object types). Print the memory usage per column in megabytes. Identify which column uses the most memory.

---

### Part 2: Integer Downcasting (30 minutes)

#### Explanation

int64 uses 8 bytes per value. If your column's values fit in a smaller type, you can cut memory use by 2x, 4x, or even 8x.

**Integer type ranges:**

| dtype | bytes | min value | max value |
|---|---|---|---|
| int8 | 1 | -128 | 127 |
| int16 | 2 | -32,768 | 32,767 |
| int32 | 4 | -2,147,483,648 | 2,147,483,647 |
| int64 | 8 | -9.2×10^18 | 9.2×10^18 |
| uint8 | 1 | 0 | 255 |
| uint16 | 2 | 0 | 65,535 |
| uint32 | 4 | 0 | 4,294,967,295 |

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 1_000_000

df = pd.DataFrame({
    'user_id':    np.random.randint(1, 100_000, size=n),   # max ~100K → fits int32
    'age':        np.random.randint(18, 80, size=n),        # max 80 → fits int8
    'percentage': np.random.randint(0, 100, size=n),        # 0-100 → fits uint8
})

print("Before downcasting:")
print(df.dtypes)
print(f"Memory: {df.memory_usage(deep=True).sum() / 1024**2:.1f} MB")
# Memory: 24.0 MB

# Method 1: pd.to_numeric with downcast='integer' — auto-selects smallest type
df['age_downcast'] = pd.to_numeric(df['age'], downcast='integer')
print(f"age before: int64, after: {df['age_downcast'].dtype}")
# age before: int64, after: int8

# Method 2: manual astype — explicit and clear in code
df['user_id']    = df['user_id'].astype('int32')    # 8 bytes → 4 bytes
df['age']        = df['age'].astype('int8')          # 8 bytes → 1 byte
df['percentage'] = df['percentage'].astype('uint8')  # 8 bytes → 1 byte (unsigned: 0-255)

print("\nAfter downcasting:")
print(df[['user_id', 'age', 'percentage']].dtypes)
# user_id       int32
# age            int8
# percentage    uint8

mem_after = df[['user_id', 'age', 'percentage']].memory_usage(deep=True).sum() / 1024**2
print(f"Memory (3 cols): {mem_after:.1f} MB")
# Memory (3 cols): 5.7 MB  (was 24 MB → 76% reduction for these 3 columns)
```

**Safety check — always validate after downcast:**

```python
import pandas as pd
import numpy as np

# DANGER: if max value exceeds int8 range (127), overflow corrupts data silently
data = pd.Series([100, 200, 127, 50])
print(data.max())  # 200 — exceeds int8 max of 127!

overflowed = data.astype('int8')
print(overflowed)
# 0    100
# 1    -56  ← 200 overflowed to -56 — data corruption, no error raised
# 2    127
# 3     50

# CORRECT approach: check before downcasting
def safe_int_downcast(series):
    col_min = series.min()
    col_max = series.max()
    print(f"  Range: [{col_min}, {col_max}]")

    if col_min >= 0:
        # Try unsigned types first (twice the positive range)
        if col_max <= 255:
            return series.astype('uint8')
        elif col_max <= 65535:
            return series.astype('uint16')
        elif col_max <= 4_294_967_295:
            return series.astype('uint32')
    else:
        # Need signed types
        if col_min >= -128 and col_max <= 127:
            return series.astype('int8')
        elif col_min >= -32768 and col_max <= 32767:
            return series.astype('int16')
        elif col_min >= -2_147_483_648 and col_max <= 2_147_483_647:
            return series.astype('int32')
    return series  # Leave as int64 if no smaller type fits
```

---

#### Practice

Given a DataFrame column with values ranging 0 to 50,000, determine the smallest safe integer dtype. Show the memory before and after downcasting for a 500,000-row column.

---

### Part 3: Float Downcasting and Categorical Dtype (30 minutes)

#### Explanation

**Float downcasting:**

float64 uses 8 bytes per value. float32 uses 4 bytes — half the memory — with about 7 decimal digits of precision (versus ~15 for float64).

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 1_000_000
df = pd.DataFrame({
    'price':       np.random.uniform(0.01, 999.99, size=n),   # float64
    'temperature': np.random.uniform(-50.0, 60.0,   size=n),  # float64
})

print(f"float64 memory: {df.memory_usage(deep=True).sum() / 1024**2:.1f} MB")
# float64 memory: 16.0 MB

# Downcast to float32 — half the memory, adequate for most measurement data
df['price']       = pd.to_numeric(df['price'],       downcast='float')
df['temperature'] = pd.to_numeric(df['temperature'], downcast='float')

print(df.dtypes)
# price         float32
# temperature   float32

print(f"float32 memory: {df.memory_usage(deep=True).sum() / 1024**2:.1f} MB")
# float32 memory: 8.0 MB  (50% reduction)

# Precision check: float32 is fine for currency (2 decimal places)
# float32 is NOT fine for scientific measurements requiring 10+ decimal places
import math
price64 = 123.456789012345
price32 = np.float32(price64)
print(f"float64: {price64}")
print(f"float32: {price32}")
# float64: 123.456789012345
# float32: 123.45679      ← rounds at 7th significant digit — fine for most use cases
```

**Categorical dtype — the highest-impact optimization for string columns:**

Object-dtype string columns store one Python string object per row. Categorical stores the unique strings once and uses an integer index per row — dramatically reducing memory for low-cardinality columns.

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 1_000_000

# Low-cardinality columns (few unique values)
df = pd.DataFrame({
    'status':   np.random.choice(['active', 'inactive', 'pending'], size=n),     # 3 unique
    'category': np.random.choice(['A', 'B', 'C', 'D', 'E'], size=n),            # 5 unique
    'region':   np.random.choice(['north', 'south', 'east', 'west'], size=n),   # 4 unique
})

# Memory BEFORE
before = df.memory_usage(deep=True).sum() / 1024 ** 2
print(f"Before (object): {before:.1f} MB")
# Before (object): 186.1 MB

# Convert to category
df['status']   = df['status'].astype('category')
df['category'] = df['category'].astype('category')
df['region']   = df['region'].astype('category')

# Memory AFTER
after = df.memory_usage(deep=True).sum() / 1024 ** 2
print(f"After (category): {after:.1f} MB")
# After (category): 3.2 MB

reduction = (1 - after / before) * 100
print(f"Reduction: {reduction:.0f}%")
# Reduction: 98%

# How category stores data internally
print(df['status'].cat.categories)   # Index(['active', 'inactive', 'pending'], dtype='object')
print(df['status'].cat.codes[:5])    # [0, 2, 1, 0, 0] — integer codes, not strings
```

**When to use category:**
- Rule of thumb: cardinality (unique values) < 50% of row count
- Ideal: status codes, region names, product categories, enum-like columns
- Avoid: free-text columns (description, notes), IDs, high-cardinality labels

---

#### Practice

<PracticeBlock
  title="Build an optimize_dtypes() Function"
  starter={`import pandas as pd
import numpy as np

np.random.seed(42)
n = 500_000

df = pd.DataFrame({
    'order_id':   np.random.randint(1, 1_000_000, size=n),    # int64, max ~1M
    'customer_id':np.random.randint(1, 50_000, size=n),       # int64, max ~50K
    'quantity':   np.random.randint(1, 100, size=n),           # int64, max 100
    'price':      np.random.uniform(0.5, 2000.0, size=n),     # float64
    'status':     np.random.choice(['open','closed','pending','cancelled'], size=n),
    'region':     np.random.choice(['north','south','east','west'], size=n),
})

def optimize_dtypes(df):
    """
    Optimize DataFrame dtypes to reduce memory usage.
    Returns optimized DataFrame and prints before/after memory.
    """
    df = df.copy()

    before_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
    print(f"Before: {before_mb:.1f} MB")

    # TODO: Step 1 — Downcast integer columns
    # For each column with dtype int64:
    #   Use pd.to_numeric(df[col], downcast='integer')

    # TODO: Step 2 — Downcast float columns
    # For each column with dtype float64:
    #   Use pd.to_numeric(df[col], downcast='float')

    # TODO: Step 3 — Convert low-cardinality object columns to category
    # For each column with dtype object:
    #   If df[col].nunique() < 20: convert to 'category'

    after_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
    print(f"After:  {after_mb:.1f} MB")
    reduction = (1 - after_mb / before_mb) * 100
    print(f"Reduction: {reduction:.0f}%")
    assert reduction > 40, f"Expected >40% reduction, got {reduction:.1f}%"
    return df

optimized = optimize_dtypes(df)
print("\\nOptimized dtypes:")
print(optimized.dtypes)
`}
  solution={`import pandas as pd
import numpy as np

np.random.seed(42)
n = 500_000

df = pd.DataFrame({
    'order_id':   np.random.randint(1, 1_000_000, size=n),
    'customer_id':np.random.randint(1, 50_000, size=n),
    'quantity':   np.random.randint(1, 100, size=n),
    'price':      np.random.uniform(0.5, 2000.0, size=n),
    'status':     np.random.choice(['open','closed','pending','cancelled'], size=n),
    'region':     np.random.choice(['north','south','east','west'], size=n),
})

def optimize_dtypes(df):
    df = df.copy()

    before_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
    print(f"Before: {before_mb:.1f} MB")

    # Step 1: Downcast integer columns
    for col in df.select_dtypes(include=['int64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='integer')

    # Step 2: Downcast float columns
    for col in df.select_dtypes(include=['float64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='float')

    # Step 3: Convert low-cardinality object columns to category
    for col in df.select_dtypes(include=['object']).columns:
        if df[col].nunique() < 20:
            df[col] = df[col].astype('category')

    after_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
    print(f"After:  {after_mb:.1f} MB")
    reduction = (1 - after_mb / before_mb) * 100
    print(f"Reduction: {reduction:.0f}%")
    assert reduction > 40, f"Expected >40% reduction, got {reduction:.1f}%"
    return df

optimized = optimize_dtypes(df)
print("\\nOptimized dtypes:")
print(optimized.dtypes)`}
/>

---

### Part 4: Putting It All Together (30 minutes)

#### Explanation

A systematic dtype optimization workflow applied to a full DataFrame:

```python
import pandas as pd
import numpy as np

np.random.seed(42)
n = 1_000_000

# Simulate a wide DataFrame with realistic column mix
df = pd.DataFrame({
    'user_id':    np.random.randint(1, 100_000, size=n),
    'age':        np.random.randint(18, 80, size=n),
    'score':      np.random.uniform(0.0, 100.0, size=n),
    'price':      np.random.uniform(0.01, 999.99, size=n),
    'status':     np.random.choice(['active', 'inactive', 'pending'], size=n),
    'category':   np.random.choice(['A', 'B', 'C', 'D', 'E'], size=n),
    'region':     np.random.choice(['north', 'south', 'east', 'west'], size=n),
})

before_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
print(f"Before optimization: {before_mb:.1f} MB")

# Step 1: Integer downcasting
df['user_id'] = df['user_id'].astype('int32')   # max ~100K, fits int32
df['age']     = df['age'].astype('int8')         # max 80, fits int8

# Step 2: Float downcasting
df['score'] = pd.to_numeric(df['score'], downcast='float')  # float64 → float32
df['price'] = pd.to_numeric(df['price'], downcast='float')  # float64 → float32

# Step 3: Categorical for low-cardinality strings
df['status']   = df['status'].astype('category')
df['category'] = df['category'].astype('category')
df['region']   = df['region'].astype('category')

after_mb = df.memory_usage(deep=True).sum() / 1024 ** 2
print(f"After optimization:  {after_mb:.1f} MB")
print(f"Memory saved: {before_mb - after_mb:.1f} MB ({(1 - after_mb/before_mb)*100:.0f}% reduction)")

print("\nDtype comparison:")
for col in df.columns:
    print(f"  {col:12s}: {df[col].dtype}")

# Before: ~247.6 MB
# After:  ~11.8 MB  (95% reduction!)
```

**Verification — no data loss after downcasting:**

```python
import pandas as pd
import numpy as np

# Always spot-check after downcasting
original_age_max = 79      # from before-downcast df
original_age_min = 18

# After converting to int8
assert df['age'].max() == original_age_max, "Max value changed!"
assert df['age'].min() == original_age_min, "Min value changed!"
assert df['age'].isna().sum() == 0, "Nulls introduced!"

# For categoricals: confirm unique values preserved
original_statuses = {'active', 'inactive', 'pending'}
assert set(df['status'].cat.categories) == original_statuses
print("Verification passed — no data loss")
```

---

## Key Takeaways

- Default dtypes (int64, float64) are safe but wasteful — pandas chooses them to never overflow, not to be memory-efficient
- `memory_usage(deep=True)` is the only accurate way to measure object-column memory — without `deep=True`, string columns appear 8x smaller than they are
- Categorical dtype is the highest-impact optimization for string columns with low cardinality — typically 95%+ memory reduction
- Memory reduction also speeds up operations: smaller data = fewer cache misses = faster scans, sorts, and group-bys
- Always validate after downcasting: check `min()`, `max()`, and `isna().sum()` to confirm no data corruption or null introduction

---

## Common Mistakes to Avoid

- **Downcasting to int8 without checking max value**: if max > 127, data silently overflows to negative numbers — no exception is raised
- **Converting high-cardinality columns to category**: if a `description` column has 900K unique values in 1M rows, the category overhead (storing each unique value) uses MORE memory than the original object dtype
- **Forgetting `deep=True`**: `df.memory_usage()` without `deep=True` shows object columns as `8 bytes × n_rows` (just the pointer), not the actual string data size
- **Losing precision with float32**: float32 has ~7 significant decimal digits. For financial calculations requiring exact cent precision across large sums, stick with float64

---

## Next Lesson Preview

- Processing CSV files larger than available RAM using `pd.read_csv(chunksize=N)`
- The accumulator pattern: computing aggregations across chunks without loading full data
- Writing a cleaned version of a large file chunk by chunk
- Tradeoffs of different chunk sizes (speed vs. memory)

---

[← Previous: Pandas Vectorization Patterns](./lesson-03-pandas-vectorization-patterns.md) | [Next: Chunked Processing →](./lesson-05-chunked-processing.md)
