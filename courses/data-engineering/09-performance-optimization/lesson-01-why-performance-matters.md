# Lesson 1: Why Performance Matters

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain why pandas operations have overhead due to the Python GIL and object boxing
- Estimate processing time using a row × column × operation cost model
- Identify the 3 most common performance anti-patterns in pandas code
- Describe when to optimize: after correctness, at a measurable bottleneck
- Apply Knuth's rule to avoid premature optimization

---

## Prerequisites

- Section 2: Pandas Fundamentals
- Section 6: ETL Pipelines (familiarity with data pipeline structure)

---

## Lesson Outline

### Part 1: The Performance Cost Model (30 minutes)

#### Explanation

When you write a Python loop over a DataFrame, you are not just running arithmetic — you are orchestrating thousands of Python object interactions. Understanding the cost model helps you predict where slowdowns will occur before you even run the code.

**The mental model: rows × columns × operations**

Consider a 1-million-row, 10-column DataFrame. If you touch every cell once in a Python loop:

- 1,000,000 rows × 10 columns = 10,000,000 Python object touches
- Each Python object allocation costs approximately 50 nanoseconds
- 10,000,000 × 50ns = **500 milliseconds** of overhead — for *trivial* work

The vectorized equivalent — a C-level NumPy operation over contiguous memory — processes 4-8 floats per CPU instruction using SIMD:

- 10,000,000 floats in contiguous memory
- One SIMD instruction per 4-8 floats → ~2,500,000 instructions total
- At 3GHz CPU: ~0.8 milliseconds

That is the **~600x gap** between loop-based and vectorized code.

**Operation type reference:**

| Operation type | Relative speed | Example |
|---|---|---|
| NumPy/C vectorized op | 1x (baseline) | `df['col'] * 2` |
| pandas built-in method | 1–5x | `df['col'].sum()` |
| `apply()` on Series | 50–200x slower | `df['col'].apply(fn)` |
| `apply(axis=1)` on rows | 200–1000x slower | `df.apply(fn, axis=1)` |
| `iterrows()` loop | 500–2000x slower | `for _, row in df.iterrows()` |

```python
import pandas as pd
import numpy as np

# 1-million-row DataFrame to illustrate the cost model
df = pd.DataFrame({
    'amount': np.random.uniform(10, 1000, size=1_000_000),
    'quantity': np.random.randint(1, 50, size=1_000_000),
})

# Vectorized: single C-level operation across 1M rows
df['total'] = df['amount'] * df['quantity']
print(df['total'].head())
# 0      842.31
# 1    12480.50
# ...

# The alternative — iterrows() — would take ~30-60 seconds for the same task
# Never use iterrows() to compute new columns
```

---

#### Practice

Look at the cost model table. Based on the relative speeds, rank these three operations from fastest to slowest without running them:
1. `df['total'] = df['amount'] * df['quantity']`
2. `df['total'] = df.apply(lambda r: r['amount'] * r['quantity'], axis=1)`
3. `totals = [row['amount'] * row['quantity'] for _, row in df.iterrows()]`

Write your ranking and reasoning before reading Part 2.

---

### Part 2: The Three Common Anti-Patterns (30 minutes)

#### Explanation

Most performance problems in pandas pipelines come from three patterns. Recognizing them on sight is the first step to eliminating them.

**Anti-pattern 1: `iterrows()` to compute a new column**

```python
# BAD — Python loop over every row
results = []
for _, row in df.iterrows():
    results.append(row['amount'] * row['quantity'])
df['total'] = results

# WHY IT'S SLOW: iterrows() creates a new pandas Series for each row.
# 1M rows → 1M Series objects constructed and discarded.
# Each construction involves Python memory allocation, dtype checking, and index alignment.
```

**Anti-pattern 2: `apply(lambda row: ...)` for row-level arithmetic**

```python
# BAD — apply with axis=1 iterates row by row
df['total'] = df.apply(lambda row: row['amount'] * row['quantity'], axis=1)

# WHY IT'S SLOW: apply(axis=1) calls your Python function once per row.
# 1M rows = 1M Python function calls. Function call overhead is ~200ns each.
# 1M × 200ns = 200ms of call overhead before the actual computation runs.
```

**Anti-pattern 3: Building a list with `append()` and converting to DataFrame**

```python
# BAD — growing a list then converting
result_rows = []
for _, row in df.iterrows():
    result_rows.append({
        'total': row['amount'] * row['quantity'],
        'status': 'processed'
    })
final_df = pd.DataFrame(result_rows)

# WHY IT'S SLOW: Two problems combined.
# (1) iterrows() overhead as described above.
# (2) Constructing dicts per row and calling pd.DataFrame() on a list of dicts
#     requires type inference on every column — O(n*m) string comparisons.
```

**The fast alternative for all three:**

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'amount':   np.random.uniform(10, 1000, size=100_000),
    'quantity': np.random.randint(1, 50,   size=100_000),
})

# FAST — vectorized column arithmetic
df['total']  = df['amount'] * df['quantity']
df['status'] = 'processed'  # scalar broadcasts to all rows

print(df.head(3))
#    amount  quantity         total    status
# 0   342.1        12     4105.200  processed
# 1   891.5         7     6240.500  processed
# 2    57.3        33     1890.900  processed
```

---

#### Practice

For each anti-pattern below, write one sentence explaining why it is slow:

1. `df['score'] = df.apply(lambda row: row['a'] + row['b'], axis=1)`
2. `result = []` followed by `for _, row in df.iterrows(): result.append(row['a'] * 2)`
3. `df['label'] = df['category'].apply(lambda x: x.upper())`

(Hint for #3: check if `.str.upper()` exists before reaching for apply.)

---

### Part 3: When NOT to Optimize (30 minutes)

#### Explanation

> "Premature optimization is the root of all evil." — Donald Knuth, 1974

Knuth's rule is not an excuse to write terrible code — it is a reminder to measure before investing optimization effort.

**The optimization decision tree:**

```
Does this pipeline run frequently?
    └── YES: Does it take measurably long (>1 second)?
            └── YES: Is the slow part in a hot path (called many times)?
                    └── YES: → Optimize
                    └── NO: → Leave it
            └── NO: → Leave it
    └── NO: → Leave it
```

**Practical thresholds:**

| Runtime | Frequency | Optimize? |
|---|---|---|
| 2 seconds | Once per day | No — total daily cost: 2s |
| 2 seconds | 10,000 times per day | Yes — total daily cost: 5.5 hours |
| 30 minutes | Once per week | Maybe — measure the business impact |
| 30 seconds | Every API request | Yes — user experience is blocked |

**What to optimize first:**

1. Profile first (Lesson 6) — identify the actual bottleneck
2. Fix the biggest bottleneck only — 80/20 rule applies
3. Re-measure — confirm the change improved things
4. Stop — most pipelines have 1-2 true bottlenecks

```python
import time

def profile_pipeline(df):
    """Rough profiling without cProfile — time each stage."""
    stages = {}

    start = time.perf_counter()
    df = df.dropna()
    stages['drop_na'] = time.perf_counter() - start

    start = time.perf_counter()
    df['total'] = df['amount'] * df['quantity']
    stages['compute_total'] = time.perf_counter() - start

    start = time.perf_counter()
    summary = df.groupby('category')['total'].sum()
    stages['groupby'] = time.perf_counter() - start

    total = sum(stages.values())
    for name, t in sorted(stages.items(), key=lambda x: -x[1]):
        print(f"  {name:20s}: {t:.4f}s  ({t/total*100:.1f}%)")
    return df, summary

# The output tells you WHICH stage to focus on.
# You will often find that one stage accounts for 70-90% of total time.
```

---

#### Practice

Given a pipeline that runs in 8 seconds total:
- Stage A: file loading — 4.5 seconds
- Stage B: column arithmetic — 0.1 seconds
- Stage C: groupby aggregation — 3.4 seconds

Which stage should you optimize first? Which should you leave alone? Explain your reasoning using the 80/20 rule.

---

### Part 4: Discussion and Reflection (30 minutes)

#### Explanation

Before reaching for optimizations, build the habit of reading code for performance signals. Most bottlenecks are visible without profiling — if you know what to look for.

**Reading code for performance signals:**

| Code pattern | Performance signal |
|---|---|
| `for _, row in df.iterrows()` | Almost always replaceable |
| `df.apply(fn, axis=1)` | Check if column arithmetic works |
| `df['col'].apply(str.upper)` | Replace with `.str.upper()` |
| `pd.concat([...])` inside a loop | Move concat outside the loop |
| `df[df['col'] == val]` in a loop | Use `df.groupby('col')` instead |

**The habit to build:**

1. Write correct code first — never optimize before it works
2. Run it once on real data
3. If it's slow, profile it (Lesson 6)
4. Optimize only the measured bottleneck

This section (Lessons 1-8) teaches you the full toolkit. Each lesson pairs a slow pattern with its fast replacement and measures the difference.

```python
import pandas as pd
import numpy as np

# Three code snippets — rank them by expected speed (fastest to slowest)
# Snippet A — vectorized
def snippet_a(df):
    return df['price'] * df['quantity']

# Snippet B — apply on rows
def snippet_b(df):
    return df.apply(lambda row: row['price'] * row['quantity'], axis=1)

# Snippet C — iterrows loop
def snippet_c(df):
    results = []
    for _, row in df.iterrows():
        results.append(row['price'] * row['quantity'])
    return pd.Series(results, index=df.index)

# Expected ranking: A (fastest) → B (50-200x slower) → C (500-2000x slower)
# All three produce the same result — only the path differs.
```

---

#### Practice

Look at the three snippets above. Without running them, predict:
1. Which snippet runs fastest and why
2. Which snippet runs slowest and why
3. Under what conditions (if any) would you use Snippet B instead of Snippet A

---

## Key Takeaways

- Python loops over DataFrames are slow because each row access creates a new Python object, bypassing C-optimized array operations
- Vectorization means applying one operation to the entire array at the C level — no Python overhead per element
- The cost model is: rows × columns × operations. For 1M rows, loop overhead alone can cost 500ms before doing any real work
- Profile before optimizing — the bottleneck is rarely where you expect it
- Most pipelines have 1-2 true bottlenecks; fixing them accounts for 80-90% of the total improvement
- Write correct code first, then optimize the measured slow part

---

## Common Mistakes to Avoid

- **Optimizing readable code that runs fast enough**: if a 2-second script runs once per day, spending 4 hours optimizing it saves 2 seconds per day — a losing trade
- **Ignoring memory**: at scale, RAM limits matter more than CPU. A 100x faster computation that runs out of memory is still broken
- **Treating pandas like a database**: for joins on 100M+ rows, SQL with proper indexes will outperform pandas by 10-100x. Choose the right tool
- **Over-generalizing the cost model**: the 50ns-per-object estimate applies to Python 3.x CPython on typical hardware — it varies, but the order-of-magnitude intuition holds

---

## Next Lesson Preview

- How NumPy stores data as contiguous C arrays (not Python objects)
- Element-wise arithmetic and universal functions (ufuncs) without loops
- Before/After timing: Python loop vs. `np.sum()` on 1 million elements

---

[← Previous: Section 8 Review](../08-advanced-data-patterns/lesson-08-section-review.md) | [Next: Vectorization with NumPy →](./lesson-02-vectorization-with-numpy.md)
