# Lesson 7: NumPy Integration Patterns

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Use `np.where()` as a vectorized if-else replacement for conditional column creation
- Use `np.select()` for multi-condition assignment with a clean, readable structure
- Apply `np.vectorize()` correctly — and understand why it does NOT improve performance
- Use `.values` to pass pandas Series as NumPy arrays for tight numeric operations
- Compare performance of `np.where` vs `apply()` for conditional column creation with timing evidence

---

## Prerequisites

- Lesson 2: Vectorization with NumPy (array fundamentals)
- Lesson 3: Pandas Vectorization Patterns (apply anti-pattern)
- Section 2: Pandas Fundamentals

---

## Lesson Outline

### Part 1: np.where — Binary Conditional (30 minutes)

#### Explanation

`np.where(condition, value_if_true, value_if_false)` is the vectorized if-else. It evaluates the condition on the entire array at once in C, then selects from two arrays or scalars. No Python loop, no per-row function call.

```python
import numpy as np
import pandas as pd
import time

np.random.seed(42)
n = 200_000
df = pd.DataFrame({
    'amount': np.random.uniform(0, 2000, size=n),
})

# BEFORE (slow) — apply with conditional lambda
start = time.perf_counter()
df['tier_apply'] = df['amount'].apply(lambda x: 'premium' if x > 1000 else 'standard')
apply_time = time.perf_counter() - start
print(f"apply conditional:  {apply_time:.3f}s")
# apply conditional:  0.085s

# AFTER (fast) — np.where
start = time.perf_counter()
df['tier_where'] = np.where(df['amount'] > 1000, 'premium', 'standard')
where_time = time.perf_counter() - start
print(f"np.where:           {where_time:.4f}s")
# np.where:           0.0028s

print(f"Speedup: {apply_time / where_time:.0f}x faster")
# Speedup: ~30x faster

# Verify identical results
pd.testing.assert_series_equal(
    df['tier_apply'], df['tier_where'], check_names=False
)
print("Results match: PASS")
```

**Nested `np.where` for 3 tiers:**

```python
import numpy as np
import pandas as pd

np.random.seed(42)
amounts = pd.Series(np.random.uniform(0, 2000, size=10))

# Three-tier classification
tiers = np.where(
    amounts > 1000, 'premium',
    np.where(amounts > 100, 'standard', 'basic')
)
print(tiers)
# ['standard' 'premium' 'basic' 'standard' 'premium'
#  'standard' 'basic'   'standard' 'premium' 'standard']

# np.where works with numeric values too
# Clip values: anything below 0 becomes 0, above 1000 becomes 1000
clipped = np.where(amounts < 0, 0, np.where(amounts > 1000, 1000, amounts))
print(clipped[:3])
# Use np.clip for this specific pattern (cleaner)
clipped2 = np.clip(amounts, 0, 1000)
```

**np.where with array values (not just scalars):**

```python
import numpy as np
import pandas as pd

np.random.seed(42)
n = 5
df = pd.DataFrame({
    'amount':   np.random.uniform(100, 2000, size=n),
    'discount': np.random.uniform(0.05, 0.3, size=n),
})

# Apply discount only to amounts > 500
df['final_amount'] = np.where(
    df['amount'] > 500,
    df['amount'] * (1 - df['discount']),   # discounted price
    df['amount']                            # original price
)
print(df[['amount', 'discount', 'final_amount']])
#     amount  discount  final_amount
# 0   381.7    0.187       381.7     (< 500, no discount)
# 1  1395.3    0.054      1320.6     (> 500, discounted)
# ...
```

---

#### Practice

Given a DataFrame with a `score` column (0-100), create a `grade` column using `np.where`:
- score >= 90 → 'A'
- score >= 70 (and < 90) → 'B'
- score < 70 → 'C'

Use nested `np.where`. Print the value counts. Then time it against an equivalent `apply()` version on 100K rows.

---

### Part 2: np.select — Multi-Condition Assignment (30 minutes)

#### Explanation

Nested `np.where` becomes unreadable for more than 3 conditions. `np.select` is the clean alternative — you provide a list of conditions and a list of choices, and it picks the first matching condition for each element.

```python
import numpy as np
import pandas as pd

np.random.seed(42)
n = 8
df = pd.DataFrame({
    'amount': np.random.choice([5, 50, 200, 700, 1500, 8000], size=n),
})

# np.select: conditions evaluated in order, first True wins
conditions = [
    df['amount'] > 5000,
    df['amount'] > 1000,
    df['amount'] > 100,
    df['amount'] > 10,
]
choices = ['platinum', 'premium', 'standard', 'basic']

df['tier'] = np.select(conditions, choices, default='micro')
print(df)
#    amount      tier
# 0    1500   premium
# 1       5     micro
# 2    8000  platinum
# 3     200  standard
# 4      50     basic
# 5     700  standard
# 6    1500   premium
# 7     200  standard
```

**When to use `np.select` vs `np.where` vs `pd.cut`:**

| Pattern | Best tool | Why |
|---|---|---|
| 2 outcomes | `np.where` | Cleanest syntax |
| 3-4 outcomes, arbitrary conditions | `np.select` | Readable list of conditions |
| Contiguous numeric ranges → labels | `pd.cut` | Semantic bin definition |
| Mixed string + numeric conditions | `np.select` | Most flexible |

```python
import numpy as np
import pandas as pd

np.random.seed(42)
n = 100_000
df = pd.DataFrame({
    'amount': np.random.uniform(0, 10000, size=n),
    'region': np.random.choice(['north', 'south', 'east', 'west'], size=n),
})

# Multi-condition including a string column
conditions = [
    (df['amount'] > 5000) & (df['region'] == 'north'),
    (df['amount'] > 5000),
    (df['amount'] > 1000) & (df['region'].isin(['north', 'east'])),
    (df['amount'] > 1000),
]
choices = ['priority_north', 'priority_other', 'standard_north', 'standard_other']
df['routing'] = np.select(conditions, choices, default='low_priority')
print(df['routing'].value_counts())
```

---

#### Practice

<PracticeBlock
  title="Risk Score with np.select"
  starter={`import numpy as np
import pandas as pd

np.random.seed(42)
n = 10_000
df = pd.DataFrame({
    'transaction_id': range(1, n + 1),
    'amount':         np.random.uniform(0.5, 10_000.0, size=n).round(2),
    'is_new_customer': np.random.choice([True, False], size=n),
})

# Task 1: Create 'risk_score' column using np.select with 4 conditions:
#   - amount > 5000                   → 1.0  (high risk)
#   - amount > 1000                   → 0.7  (medium-high risk)
#   - amount > 100                    → 0.3  (medium risk)
#   - default                         → 0.1  (low risk)

# Task 2: Create 'flag' column using np.where:
#   - True if risk_score > 0.5, else False

# Task 3: Print value_counts() of both 'risk_score' and 'flag'

# Task 4: What % of transactions are flagged?
`}
  solution={`import numpy as np
import pandas as pd

np.random.seed(42)
n = 10_000
df = pd.DataFrame({
    'transaction_id': range(1, n + 1),
    'amount':         np.random.uniform(0.5, 10_000.0, size=n).round(2),
    'is_new_customer': np.random.choice([True, False], size=n),
})

# Task 1: risk_score with np.select
conditions = [
    df['amount'] > 5000,
    df['amount'] > 1000,
    df['amount'] > 100,
]
choices = [1.0, 0.7, 0.3]
df['risk_score'] = np.select(conditions, choices, default=0.1)

# Task 2: flag with np.where
df['flag'] = np.where(df['risk_score'] > 0.5, True, False)

# Task 3: value_counts
print("risk_score distribution:")
print(df['risk_score'].value_counts().sort_index())

print("\\nflag distribution:")
print(df['flag'].value_counts())

# Task 4: flagged %
flagged_pct = df['flag'].mean() * 100
print(f"\\nFlagged transactions: {flagged_pct:.1f}%")`}
/>

---

### Part 3: np.vectorize — When to Use It (30 minutes)

#### Explanation

`np.vectorize` wraps a Python function so it can be called with array inputs. It handles broadcasting and dtype inference. However, it is still a Python loop under the hood — it does NOT make your function faster.

```python
import numpy as np
import pandas as pd
import time

# A Python function that cannot be easily expressed as array operations
def classify_product(code):
    """Business logic: parse a product code string and return a category."""
    prefix = str(code)[:3]
    if prefix == 'ELC':
        return 'electronics'
    elif prefix == 'CLT':
        return 'clothing'
    elif prefix == 'FOD':
        return 'food'
    return 'other'

np.random.seed(42)
n = 50_000
codes = pd.Series(
    np.random.choice(['ELC-001', 'CLT-042', 'FOD-113', 'BKS-007'], size=n)
)

# Method 1: apply
start = time.perf_counter()
result_apply = codes.apply(classify_product)
apply_time = time.perf_counter() - start
print(f"apply:         {apply_time:.4f}s")
# apply:         0.0312s

# Method 2: np.vectorize
vec_classify = np.vectorize(classify_product)
start = time.perf_counter()
result_vec = vec_classify(codes.values)
vec_time = time.perf_counter() - start
print(f"np.vectorize:  {vec_time:.4f}s")
# np.vectorize:  0.0318s  ← similar to apply, NOT faster

# Both are Python loops — np.vectorize provides no speed advantage here
# But it does handle broadcasting and can simplify calling patterns

# Method 3: .str accessor (correct solution for this specific case)
start = time.perf_counter()
prefix_map = {'ELC': 'electronics', 'CLT': 'clothing', 'FOD': 'food'}
result_str = codes.str[:3].map(prefix_map).fillna('other')
str_time = time.perf_counter() - start
print(f".str + .map:   {str_time:.4f}s")
# .str + .map:   0.0021s  ← 15x faster — truly vectorized
```

**When is `np.vectorize` actually useful?**

```python
import numpy as np

# Scenario: you have a function that works on scalars and you need it
# to accept array inputs for broadcasting (not performance)
def distance(x1, y1, x2, y2):
    """Euclidean distance between two points."""
    return ((x2 - x1)**2 + (y2 - y1)**2) ** 0.5

# Without vectorize: you can already do this with arrays (no loop needed!)
import numpy as np
x1 = np.array([0, 1, 2])
y1 = np.array([0, 0, 0])
x2 = np.array([3, 4, 5])
y2 = np.array([4, 3, 12])

# Already vectorized — no np.vectorize needed
distances = ((x2 - x1)**2 + (y2 - y1)**2) ** 0.5
print(distances)  # [5. 5. 13.]

# np.vectorize is useful ONLY when the function contains Python-specific
# logic (try/except, external API call, complex branching) that truly
# cannot be expressed as array operations.
```

---

#### Practice

Given a function `def parse_code(code): ...` that extracts a numeric ID from codes like `"ORD-00042"` using string slicing:

1. Implement it using `np.vectorize` on 50K codes
2. Implement it using `.str.split('-').str[1].astype(int)` (vectorized)
3. Time both and print the speedup

This exercise demonstrates that string operations with `.str` are almost always faster than `np.vectorize`.

---

### Part 4: Using .values for Tight Numeric Operations (30 minutes)

#### Explanation

When calling NumPy functions on pandas Series, there is a small overhead for pandas index alignment and dtype validation. For tight inner loops or repeated numeric operations, passing `.values` (which returns the underlying NumPy array) skips this overhead.

```python
import numpy as np
import pandas as pd
import time

np.random.seed(42)
n = 500_000
series = pd.Series(np.random.uniform(1.0, 100.0, size=n))

# With pandas Series
start = time.perf_counter()
for _ in range(20):
    result = np.sqrt(series)        # pandas overhead on each call
pd_time = (time.perf_counter() - start) / 20
print(f"np.sqrt(series):        {pd_time*1000:.3f}ms")

# With NumPy array (.values)
arr = series.values
start = time.perf_counter()
for _ in range(20):
    result = np.sqrt(arr)           # raw NumPy, no pandas overhead
np_time = (time.perf_counter() - start) / 20
print(f"np.sqrt(series.values): {np_time*1000:.3f}ms")

# Difference is small for simple ops, but matters in tight loops

# IMPORTANT: .values loses the index — only use it for numeric computation
# Always put results back into a Series with the original index if needed
result_series = pd.Series(np.sqrt(arr), index=series.index)
```

**When `.values` matters most:**

```python
import numpy as np
import pandas as pd
import time

np.random.seed(42)
n = 100_000
df = pd.DataFrame({
    'a': np.random.uniform(1, 100, size=n),
    'b': np.random.uniform(1, 100, size=n),
    'c': np.random.uniform(1, 100, size=n),
})

# Scenario: compute a custom formula many times (e.g., financial calculation)
def formula_pandas(df):
    return np.sqrt(df['a']) * np.log(df['b']) + df['c'] ** 2

def formula_values(df):
    a, b, c = df['a'].values, df['b'].values, df['c'].values
    return np.sqrt(a) * np.log(b) + c ** 2

# Time 50 iterations each
n_iter = 50

start = time.perf_counter()
for _ in range(n_iter):
    formula_pandas(df)
pd_time = (time.perf_counter() - start) / n_iter

start = time.perf_counter()
for _ in range(n_iter):
    formula_values(df)
np_time = (time.perf_counter() - start) / n_iter

print(f"With pandas Series: {pd_time*1000:.3f}ms")
print(f"With .values:       {np_time*1000:.3f}ms")
# The .values version is typically 10-30% faster for formula-heavy code
```

---

## Key Takeaways

- `np.where(cond, a, b)` is the go-to for binary conditionals — 20-50x faster than equivalent `apply()` calls
- `np.select(conditions, choices, default=...)` handles multi-condition assignment cleanly; first matching condition wins
- `np.vectorize` is for API compatibility (broadcasting support), NOT for performance — it is still a Python loop internally
- `.values` returns the underlying NumPy array, removing pandas index overhead — useful for tight numeric loops but loses the index
- The correct tool for string-based conditional logic is `.str.map()` or `.str.replace()`, not `np.vectorize`

---

## Common Mistakes to Avoid

- **Using `np.vectorize` expecting speed**: it wraps a Python function in a loop. If you benchmark it, you will find it is the same speed as `apply()` — sometimes slightly slower due to setup overhead
- **Forgetting the `default` parameter in `np.select`**: without `default`, `np.select` raises a `ValueError` when none of the conditions match a row. Always provide a sensible default
- **Using `.values` without checking dtype**: if the column is `object` dtype (strings or mixed), `.values` returns an object array that loses NumPy SIMD optimization. Only use `.values` on numeric dtypes
- **Mutating `.values` and expecting DataFrame to update**: `series.values` returns a view in some cases and a copy in others — never mutate it directly. Assign to a new variable and reconstruct the Series

---

## Next Lesson Preview

- The 4-step optimization workflow applied end-to-end: profile → identify → optimize → verify
- A complete before/after pipeline comparison showing 20-50x total speedup
- Using `pd.testing.assert_frame_equal` to verify that optimizations produce identical output
- Documenting optimization decisions in code comments so future readers understand why

---

[← Previous: Profiling and Benchmarking](./lesson-06-profiling-and-benchmarking.md) | [Next: Optimization in Practice →](./lesson-08-optimization-in-practice.md)
