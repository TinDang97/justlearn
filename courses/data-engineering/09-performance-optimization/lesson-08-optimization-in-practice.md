# Lesson 8: Optimization in Practice

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Advanced

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Apply the full 4-step optimization workflow: profile → identify → optimize → verify
- Combine dtype optimization, vectorization, and chunking in a single pipeline
- Verify that optimizations produce identical output using `pd.testing.assert_frame_equal`
- Document optimization decisions in pipeline code for future maintainability
- Calculate and report total speedup ratios after optimization

---

## Prerequisites

- Lessons 1-7: all Section 9 content (performance model, vectorization, memory, chunking, profiling, NumPy integration)

---

## Lesson Outline

### Part 1: The 4-Step Optimization Workflow (30 minutes)

#### Explanation

Optimization without measurement is guesswork. The 4-step workflow ensures you fix the right thing in the right order — and that you can prove it worked.

**Step 1 — Profile: measure the current state**

Run `benchmark()` on the full pipeline. Record total time and per-step breakdown. Do not optimize yet.

**Step 2 — Identify: find the bottleneck**

The step consuming >50% of total time is your target. Anything else is background noise. Use the `@timer` decorator from Lesson 6 on each pipeline function.

**Step 3 — Optimize: apply the correct technique**

Match the bottleneck type to the right tool:

| Bottleneck type | Technique |
|---|---|
| `iterrows()` or `apply(axis=1)` for arithmetic | Column arithmetic |
| `apply()` for string operations | `.str` accessor |
| `apply()` for conditionals | `np.where` or `np.select` |
| Wide dtypes (int64/float64) | Downcast with `pd.to_numeric()` |
| File too large for RAM | `pd.read_csv(chunksize=N)` |
| Repeated per-row string parsing | `.str.split().str[N]` or `.str.extract()` |

**Step 4 — Verify: confirm identical output**

```python
import pandas as pd

original_result  = slow_pipeline(df)
optimized_result = fast_pipeline(df)

pd.testing.assert_frame_equal(
    original_result.reset_index(drop=True),
    optimized_result.reset_index(drop=True),
    check_dtype=False,     # allow int32 vs int64 from downcasting
    rtol=1e-4,             # allow tiny float rounding differences
)
print("Output verification: PASS")
```

`assert_frame_equal` checks shape, column names, values, and (optionally) dtypes. Use `check_dtype=False` when downcasting is part of the optimization. Use `rtol=1e-4` when float32 rounding differs slightly from float64.

```python
import time
import pandas as pd
import numpy as np

# The 4-step workflow as a reusable pattern
def run_optimization_workflow(slow_fn, fast_fn, df, n_benchmark=5):
    """
    Run the complete optimization workflow.
    Returns (slow_stats, fast_stats, speedup_ratio).
    """
    import statistics

    def time_fn(fn, df, n):
        timings = []
        for _ in range(n):
            start = time.perf_counter()
            result = fn(df)
            timings.append(time.perf_counter() - start)
        return result, {'mean': statistics.mean(timings), 'min': min(timings)}

    # Step 1: Profile
    print("Step 1: Profiling both pipelines...")
    slow_result, slow_stats = time_fn(slow_fn, df, n_benchmark)
    fast_result, fast_stats = time_fn(fast_fn, df, n_benchmark)

    # Step 2: Identify bottleneck (done externally with @timer)

    # Step 3: Optimization (implemented in fast_fn)

    # Step 4: Verify
    print("Step 4: Verifying output equality...")
    pd.testing.assert_frame_equal(
        slow_result.reset_index(drop=True),
        fast_result.reset_index(drop=True),
        check_dtype=False,
        rtol=1e-4,
    )
    print("Verification: PASS")

    speedup = slow_stats['mean'] / fast_stats['mean']
    print(f"\nSlow pipeline: {slow_stats['mean']:.3f}s (mean over {n_benchmark} runs)")
    print(f"Fast pipeline: {fast_stats['mean']:.4f}s (mean over {n_benchmark} runs)")
    print(f"Speedup:       {speedup:.0f}x")

    return slow_stats, fast_stats, speedup
```

---

#### Practice

Before looking at Parts 2 and 3, try to identify which operations in the following pipeline are the bottleneck:

```python
def mystery_pipeline(df):
    df = df.copy()
    df['name_upper']  = df['name'].apply(str.upper)           # Line A
    df['total']       = df.apply(lambda r: r['price'] * r['quantity'], axis=1)  # Line B
    df['tier']        = df['total'].apply(lambda x: 'high' if x > 500 else 'low')  # Line C
    df['year']        = df['date'].apply(lambda x: x.year)    # Line D
    return df
```

Rank lines A-D from slowest to fastest. Write down your reasoning, then continue to Part 2.

---

### Part 2: Before — The Unoptimized Pipeline (30 minutes)

#### Explanation

```python
import pandas as pd
import numpy as np
import time
import functools
import statistics

np.random.seed(42)

def generate_orders_df(n=100_000):
    """Generate a realistic orders DataFrame for benchmarking."""
    statuses    = ['delivered', 'pending', 'cancelled', 'refunded']
    regions     = ['north', 'south', 'east', 'west', 'central']
    categories  = ['electronics', 'clothing', 'food', 'books', 'home']
    return pd.DataFrame({
        'order_id':    range(1, n + 1),
        'customer_id': np.random.randint(1, 10_000, size=n),
        'product_cat': np.random.choice(categories, size=n),
        'status':      np.random.choice(statuses, size=n),
        'region':      np.random.choice(regions, size=n),
        'price':       np.random.uniform(5.0, 2000.0, size=n).round(2),
        'quantity':    np.random.randint(1, 25, size=n),
        'discount':    np.random.uniform(0.0, 0.4, size=n).round(3),
        'order_date':  pd.date_range('2023-01-01', periods=n, freq='5min'),
    })

def process_orders_slow(df):
    """
    Unoptimized pipeline — uses iterrows() and apply() throughout.
    This is the kind of code that works but does not scale.
    """
    df = df.copy()

    # Anti-pattern 1: row-level arithmetic via apply()
    df['revenue'] = df.apply(
        lambda row: row['price'] * row['quantity'] * (1 - row['discount']),
        axis=1
    )

    # Anti-pattern 2: conditional via apply()
    df['tier'] = df['revenue'].apply(
        lambda x: 'premium' if x > 5000
                  else ('high' if x > 1000
                        else ('mid' if x > 100 else 'low'))
    )

    # Anti-pattern 3: datetime extraction via apply()
    df['order_year']  = df['order_date'].apply(lambda x: x.year)
    df['order_month'] = df['order_date'].apply(lambda x: x.month)

    # Anti-pattern 4: string operation via apply()
    df['product_cat_upper'] = df['product_cat'].apply(str.upper)

    # Aggregation (this part is already fast)
    summary = df.groupby(['region', 'tier'])['revenue'].agg(['sum', 'count', 'mean'])

    return summary.reset_index()

# Benchmark the slow pipeline
df = generate_orders_df(100_000)

timings = []
for _ in range(3):
    start = time.perf_counter()
    slow_result = process_orders_slow(df)
    timings.append(time.perf_counter() - start)

slow_mean = statistics.mean(timings)
print(f"Slow pipeline (mean over 3 runs): {slow_mean:.3f}s")
# Slow pipeline (mean over 3 runs): ~1.2s on 100K rows
print(slow_result.head(5))
```

**Step 2 — Identify:** Using the `@timer` decorator on each block of `process_orders_slow`:

| Step | Time | % of total |
|---|---|---|
| `apply` for revenue | 0.54s | 45% |
| `apply` for tier | 0.48s | 40% |
| `apply` for dates | 0.14s | 12% |
| `apply` for str.upper | 0.02s | 2% |
| `groupby` aggregation | 0.02s | 1% |

The two `apply()` calls for arithmetic and conditionals account for 85% of runtime. Those are the targets.

---

#### Practice

Run `process_orders_slow(df)` yourself on a 50K-row DataFrame. Using the `@timer` decorator, identify which step consumes the most time. Does the distribution match the table above?

---

### Part 3: After — The Optimized Pipeline (30 minutes)

#### Explanation

```python
import pandas as pd
import numpy as np
import time
import statistics

def process_orders_fast(df):
    """
    Optimized pipeline — vectorized throughout.

    Optimizations applied:
    1. Revenue: apply(axis=1) → column arithmetic (was 45% of time)
    2. Tier: nested apply() → np.select (was 40% of time)
    3. Dates: apply(lambda) → .dt accessor (was 12% of time)
    4. String: apply(str.upper) → .str.upper() (was 2% of time)
    5. Groupby: unchanged (already C-level, 1% of time)
    """
    df = df.copy()

    # Optimization 1: vectorized revenue (replaces apply axis=1)
    df['revenue'] = df['price'] * df['quantity'] * (1 - df['discount'])

    # Optimization 2: np.select for 4-tier classification (replaces nested apply)
    conditions = [
        df['revenue'] > 5000,
        df['revenue'] > 1000,
        df['revenue'] > 100,
    ]
    choices = ['premium', 'high', 'mid']
    df['tier'] = np.select(conditions, choices, default='low')

    # Optimization 3: .dt accessor (replaces apply lambda)
    df['order_year']  = df['order_date'].dt.year
    df['order_month'] = df['order_date'].dt.month

    # Optimization 4: .str accessor (replaces apply str.upper)
    df['product_cat_upper'] = df['product_cat'].str.upper()

    # Aggregation: unchanged
    summary = df.groupby(['region', 'tier'])['revenue'].agg(['sum', 'count', 'mean'])

    return summary.reset_index()

# Benchmark the fast pipeline
df = generate_orders_df(100_000)

timings = []
for _ in range(3):
    start = time.perf_counter()
    fast_result = process_orders_fast(df)
    timings.append(time.perf_counter() - start)

fast_mean = statistics.mean(timings)
print(f"Fast pipeline  (mean over 3 runs): {fast_mean:.4f}s")
# Fast pipeline  (mean over 3 runs): ~0.027s

# Verify output equality
pd.testing.assert_frame_equal(
    slow_result.sort_values(['region', 'tier']).reset_index(drop=True),
    fast_result.sort_values(['region', 'tier']).reset_index(drop=True),
    check_dtype=False,
    rtol=1e-4,
)
print("Output verification: PASS")

# Summary table
speedup = slow_mean / fast_mean
print(f"\n{'Pipeline':<20} {'Mean time':>12} {'Speedup':>10}")
print(f"{'-'*44}")
print(f"{'Slow (apply)':<20} {slow_mean:>10.3f}s {'1x':>10}")
print(f"{'Fast (vectorized)':<20} {fast_mean:>10.4f}s {f'{speedup:.0f}x':>10}")
# Pipeline             Mean time    Speedup
# --------------------------------------------
# Slow (apply)             1.203s         1x
# Fast (vectorized)        0.027s        45x
```

---

### Part 4: End-to-End Practice (30 minutes)

#### Explanation

The final practice combines the full workflow — you are given a slow pipeline and must apply all 4 steps yourself.

```python
import pandas as pd
import numpy as np

def generate_orders_df(n=50_000):
    """Provided helper — generates practice data."""
    np.random.seed(42)
    return pd.DataFrame({
        'order_id':    range(1, n + 1),
        'customer_id': np.random.randint(1, 5_000, size=n),
        'product_cat': np.random.choice(['electronics','clothing','food','books'], size=n),
        'status':      np.random.choice(['delivered','pending','cancelled'], size=n),
        'region':      np.random.choice(['north','south','east','west'], size=n),
        'price':       np.random.uniform(5.0, 1500.0, size=n).round(2),
        'quantity':    np.random.randint(1, 20, size=n),
        'discount':    np.random.uniform(0.0, 0.35, size=n).round(3),
        'order_date':  pd.date_range('2023-01-01', periods=n, freq='10min'),
    })
```

---

<PracticeBlock
  title="Apply the 4-Step Optimization Workflow"
  starter={`import pandas as pd
import numpy as np
import time
import functools
import statistics

# Provided helpers
def generate_orders_df(n=50_000):
    np.random.seed(42)
    return pd.DataFrame({
        'order_id':    range(1, n + 1),
        'customer_id': np.random.randint(1, 5_000, size=n),
        'product_cat': np.random.choice(['electronics','clothing','food','books'], size=n),
        'status':      np.random.choice(['delivered','pending','cancelled'], size=n),
        'region':      np.random.choice(['north','south','east','west'], size=n),
        'price':       np.random.uniform(5.0, 1500.0, size=n).round(2),
        'quantity':    np.random.randint(1, 20, size=n),
        'discount':    np.random.uniform(0.0, 0.35, size=n).round(3),
        'order_date':  pd.date_range('2023-01-01', periods=n, freq='10min'),
    })

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[timer] {func.__name__}: {elapsed:.4f}s")
        return result
    return wrapper

# ============================================================
# SLOW PIPELINE (do not modify this)
# ============================================================
def slow_pipeline(df):
    df = df.copy()
    df['net_price']  = df.apply(lambda r: r['price'] * (1 - r['discount']), axis=1)
    df['revenue']    = df.apply(lambda r: r['net_price'] * r['quantity'],   axis=1)
    df['grade']      = df['revenue'].apply(
        lambda x: 'A' if x > 10000 else ('B' if x > 1000 else 'C')
    )
    df['cat_upper']  = df['product_cat'].apply(str.upper)
    df['order_year'] = df['order_date'].apply(lambda x: x.year)
    return df.groupby(['region', 'grade'])['revenue'].sum().reset_index()

# ============================================================
# Step 1: Profile — time the slow pipeline
# ============================================================
df = generate_orders_df(50_000)

start = time.perf_counter()
slow_result = slow_pipeline(df)
slow_time = time.perf_counter() - start
print(f"Slow pipeline: {slow_time:.3f}s")

# ============================================================
# Step 2: Identify — add @timer to the slow operations above
# (hint: the apply() calls are the bottleneck)

# ============================================================
# Step 3: Implement fast_pipeline using vectorized operations
# ============================================================
def fast_pipeline(df):
    df = df.copy()

    # TODO: Replace each apply() with vectorized equivalent
    # 1. net_price: df['price'] * (1 - df['discount'])
    # 2. revenue: net_price * quantity
    # 3. grade: np.where or np.select
    # 4. cat_upper: .str accessor
    # 5. order_year: .dt accessor

    return df.groupby(['region', 'grade'])['revenue'].sum().reset_index()

start = time.perf_counter()
fast_result = fast_pipeline(df)
fast_time = time.perf_counter() - start
print(f"Fast pipeline: {fast_time:.4f}s")

# ============================================================
# Step 4: Verify output equality
# ============================================================
pd.testing.assert_frame_equal(
    slow_result.sort_values(['region', 'grade']).reset_index(drop=True),
    fast_result.sort_values(['region', 'grade']).reset_index(drop=True),
    check_dtype=False, rtol=1e-4
)
print("Verification: PASS")
print(f"Speedup: {slow_time / fast_time:.0f}x")
`}
  solution={`import pandas as pd
import numpy as np
import time
import functools
import statistics

def generate_orders_df(n=50_000):
    np.random.seed(42)
    return pd.DataFrame({
        'order_id':    range(1, n + 1),
        'customer_id': np.random.randint(1, 5_000, size=n),
        'product_cat': np.random.choice(['electronics','clothing','food','books'], size=n),
        'status':      np.random.choice(['delivered','pending','cancelled'], size=n),
        'region':      np.random.choice(['north','south','east','west'], size=n),
        'price':       np.random.uniform(5.0, 1500.0, size=n).round(2),
        'quantity':    np.random.randint(1, 20, size=n),
        'discount':    np.random.uniform(0.0, 0.35, size=n).round(3),
        'order_date':  pd.date_range('2023-01-01', periods=n, freq='10min'),
    })

def slow_pipeline(df):
    df = df.copy()
    df['net_price']  = df.apply(lambda r: r['price'] * (1 - r['discount']), axis=1)
    df['revenue']    = df.apply(lambda r: r['net_price'] * r['quantity'],   axis=1)
    df['grade']      = df['revenue'].apply(
        lambda x: 'A' if x > 10000 else ('B' if x > 1000 else 'C')
    )
    df['cat_upper']  = df['product_cat'].apply(str.upper)
    df['order_year'] = df['order_date'].apply(lambda x: x.year)
    return df.groupby(['region', 'grade'])['revenue'].sum().reset_index()

def fast_pipeline(df):
    """
    Optimized pipeline — 4-step workflow applied.

    Step 1 (profiled): slow_pipeline takes ~0.9s on 50K rows
    Step 2 (identified): apply(axis=1) calls account for ~85% of time
    Step 3 (optimized):
      - net_price: apply(axis=1) → column arithmetic
      - revenue:   apply(axis=1) → column arithmetic
      - grade:     nested apply  → np.select
      - cat_upper: apply(str.upper) → .str.upper()
      - order_year: apply(lambda) → .dt.year
    Step 4 (verified): assert_frame_equal confirms identical output
    """
    df = df.copy()

    # Vectorized arithmetic (was two apply(axis=1) calls)
    df['net_price'] = df['price'] * (1 - df['discount'])
    df['revenue']   = df['net_price'] * df['quantity']

    # np.select replaces nested apply conditional
    conditions = [df['revenue'] > 10000, df['revenue'] > 1000]
    choices    = ['A', 'B']
    df['grade'] = np.select(conditions, choices, default='C')

    # .str and .dt accessors replace apply() for string and datetime
    df['cat_upper']  = df['product_cat'].str.upper()
    df['order_year'] = df['order_date'].dt.year

    return df.groupby(['region', 'grade'])['revenue'].sum().reset_index()

df = generate_orders_df(50_000)

start = time.perf_counter()
slow_result = slow_pipeline(df)
slow_time = time.perf_counter() - start
print(f"Slow pipeline: {slow_time:.3f}s")

start = time.perf_counter()
fast_result = fast_pipeline(df)
fast_time = time.perf_counter() - start
print(f"Fast pipeline: {fast_time:.4f}s")

pd.testing.assert_frame_equal(
    slow_result.sort_values(['region', 'grade']).reset_index(drop=True),
    fast_result.sort_values(['region', 'grade']).reset_index(drop=True),
    check_dtype=False, rtol=1e-4
)
print("Verification: PASS")
print(f"Speedup: {slow_time / fast_time:.0f}x")`}
/>

---

## Key Takeaways

- Always profile before optimizing — the bottleneck is almost never where you expect it to be
- Verify output equality after every optimization with `pd.testing.assert_frame_equal` — a fast pipeline that produces wrong results is worse than a slow correct one
- Document WHY each optimization was applied in code comments: "apply(axis=1) → column arithmetic (was 45% of pipeline time)" helps the next developer understand the intent
- The 80/20 rule applies: one or two optimizations (typically the `apply(axis=1)` calls) usually account for 80-90% of total speedup
- Combining all techniques from this section — vectorization + dtype optimization + profiling-guided decisions — typically achieves 20-50x speedup on real pandas pipelines

---

## Common Mistakes to Avoid

- **Optimizing everything instead of the bottleneck**: optimizing a step that takes 2% of total time cannot improve total performance by more than 2% — spend effort proportionally
- **Not verifying output equality**: "close enough" is not acceptable. Use `assert_frame_equal` with appropriate `rtol` to confirm bitwise or near-exact equality after every change
- **Removing readable code in favor of micro-optimizations for 1% gain**: if a step takes 0.5ms and your readable code takes 0.6ms, the 0.1ms gain is not worth sacrificing clarity
- **Forgetting that `check_dtype=False` is needed after downcasting**: int32 vs int64 comparison without this flag will raise a `TypeError` even if all values are identical

---

## Section Review

You have completed Section 9: Performance & Optimization. Here is what you can now do:

| Skill | Technique | Lesson |
|---|---|---|
| Estimate pipeline cost | Row × col × operation model | 01 |
| Vectorize array operations | NumPy ufuncs, broadcasting | 02 |
| Vectorize pandas operations | Column arithmetic, .str, .dt | 03 |
| Reduce memory 50-95% | Dtype downcasting, category | 04 |
| Handle files larger than RAM | Chunked reading + accumulator | 05 |
| Find the actual bottleneck | perf_counter, @timer, cProfile | 06 |
| Replace conditional apply() | np.where, np.select | 07 |
| End-to-end optimization | 4-step workflow, assert_frame_equal | 08 |

In Section 10 (Real-World Projects), you will apply all of these skills to complete data engineering pipelines on realistic datasets.

---

[← Previous: NumPy Integration Patterns](./lesson-07-numpy-integration-patterns.md) | [Next: Section 10 — Real-World Projects →](../10-real-world-projects/README.md)
