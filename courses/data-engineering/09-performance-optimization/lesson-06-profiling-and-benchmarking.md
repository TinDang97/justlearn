# Lesson 6: Profiling and Benchmarking

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Time individual operations with `time.perf_counter()` accurately
- Wrap code in a reusable `@timer` decorator
- Build a benchmark harness that runs N iterations and reports mean, min, max, and standard deviation
- Use `cProfile` to identify the slowest functions inside a pipeline
- Interpret cProfile output: `ncalls`, `tottime`, and `cumtime`

---

## Prerequisites

- Lesson 1: Why Performance Matters (when to optimize)

---

## Lesson Outline

### Part 1: time.perf_counter() Timing (30 minutes)

#### Explanation

Python's `time` module provides several clocks. For benchmarking code on a single machine, `time.perf_counter()` is the right choice.

**Why `perf_counter` over `time.time()`:**

| Clock | Resolution | Monotonic | Use case |
|---|---|---|---|
| `time.time()` | ~1ms | No | Wall clock, timestamps |
| `time.perf_counter()` | ~100ns | Yes | Benchmarking, timing code |
| `time.process_time()` | ~1ns | Yes | CPU time only (excludes sleep/IO) |

`perf_counter` is monotonic — it never goes backward (even during NTP adjustments). It has the highest available resolution on your OS.

```python
import time
import pandas as pd
import numpy as np

np.random.seed(42)
df = pd.DataFrame({
    'amount':   np.random.uniform(1, 5000, size=100_000),
    'quantity': np.random.randint(1, 50, size=100_000),
})

# Basic timing pattern
start = time.perf_counter()
df['total'] = df['amount'] * df['quantity']
elapsed = time.perf_counter() - start
print(f"Elapsed: {elapsed:.6f}s")
# Elapsed: 0.001847s

# Timing with microsecond precision
print(f"Elapsed: {elapsed * 1000:.3f}ms")
# Elapsed: 1.847ms

# For very fast operations, a single run is noisy — time 100 runs and average
runs = 100
start = time.perf_counter()
for _ in range(runs):
    result = df['amount'] * df['quantity']
total_time = time.perf_counter() - start
avg_time = total_time / runs
print(f"Average over {runs} runs: {avg_time * 1000:.3f}ms")
# Average over 100 runs: 1.621ms
```

**Building a reusable `@timer` decorator:**

```python
import time
import functools

def timer(func):
    """Decorator that prints the function name and elapsed time on each call."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[timer] {func.__name__}: {elapsed:.4f}s")
        return result
    return wrapper

# Usage
import pandas as pd
import numpy as np

@timer
def compute_totals(df):
    return df['amount'] * df['quantity']

@timer
def group_by_region(df):
    return df.groupby('region')['amount'].sum()

np.random.seed(42)
df = pd.DataFrame({
    'amount':   np.random.uniform(1, 5000, size=200_000),
    'quantity': np.random.randint(1, 50, size=200_000),
    'region':   np.random.choice(['north', 'south', 'east', 'west'], size=200_000),
})

totals  = compute_totals(df)
summary = group_by_region(df)
# [timer] compute_totals: 0.0016s
# [timer] group_by_region: 0.0048s
```

---

#### Practice

Write a `@timer` decorator that stores timing results in a list (not just prints them), so you can collect timings across multiple calls and compute the average afterward. Call a test function 10 times and print the min, max, and mean timing.

---

### Part 2: Benchmark Harness (30 minutes)

#### Explanation

A single timing measurement is noisy — CPU frequency scaling, OS scheduler interrupts, and memory allocation variance all introduce jitter. Running N iterations and reporting statistics gives a reliable picture.

```python
import time
import statistics
import pandas as pd
import numpy as np

def benchmark(fn, *args, n=10, warmup=1, **kwargs):
    """
    Run fn(*args, **kwargs) n times and return timing statistics.

    Parameters
    ----------
    fn     : callable — function to benchmark
    *args  : positional arguments passed to fn
    n      : int — number of timed iterations (default 10)
    warmup : int — number of warmup runs (not timed, avoids JIT/cache effects)
    **kwargs: keyword arguments passed to fn

    Returns
    -------
    dict with keys: mean, min, max, std, median (all in seconds)
    """
    # Warmup runs: caches, JIT compilation, lazy imports
    for _ in range(warmup):
        fn(*args, **kwargs)

    timings = []
    for _ in range(n):
        start = time.perf_counter()
        fn(*args, **kwargs)
        timings.append(time.perf_counter() - start)

    result = {
        'mean':   statistics.mean(timings),
        'min':    min(timings),
        'max':    max(timings),
        'std':    statistics.stdev(timings) if len(timings) > 1 else 0.0,
        'median': statistics.median(timings),
        'n':      n,
    }
    return result

def print_benchmark(label, stats):
    """Print benchmark results in a readable format."""
    print(f"{label}:")
    print(f"  mean:   {stats['mean']*1000:.3f}ms")
    print(f"  min:    {stats['min']*1000:.3f}ms")
    print(f"  max:    {stats['max']*1000:.3f}ms")
    print(f"  std:    {stats['std']*1000:.3f}ms")
    print(f"  median: {stats['median']*1000:.3f}ms")

# Example: compare two implementations
np.random.seed(42)
df = pd.DataFrame({
    'amount':   np.random.uniform(1, 5000, size=100_000),
    'quantity': np.random.randint(1, 50, size=100_000),
})

def slow_total(df):
    return df.apply(lambda r: r['amount'] * r['quantity'], axis=1)

def fast_total(df):
    return df['amount'] * df['quantity']

slow_stats = benchmark(slow_total, df, n=5)
fast_stats = benchmark(fast_total, df, n=10)

print_benchmark("apply (slow)", slow_stats)
print_benchmark("vectorized  ", fast_stats)

speedup = slow_stats['mean'] / fast_stats['mean']
print(f"\nSpeedup: {speedup:.0f}x")
# apply (slow):
#   mean:   248.314ms
# vectorized  :
#   mean:   1.923ms
# Speedup: 129x
```

---

#### Practice

Using the `benchmark()` function above, compare two approaches to computing a `log(amount + 1)` column on a 500K-row DataFrame:
1. `df['amount'].apply(import math; math.log1p)` — element-wise Python
2. `np.log1p(df['amount'])` — ufunc

Run 10 iterations each. Print both mean times and the speedup ratio.

---

### Part 3: cProfile Basics (30 minutes)

#### Explanation

`time.perf_counter()` tells you *how long* a function takes. `cProfile` tells you *which sub-calls inside a function* are slow. It instruments every function call and records counts and times.

```python
import cProfile
import pstats
import io
import pandas as pd
import numpy as np

np.random.seed(42)
n = 100_000
df = pd.DataFrame({
    'amount':   np.random.uniform(1, 5000, size=n),
    'quantity': np.random.randint(1, 50, size=n),
    'region':   np.random.choice(['north', 'south', 'east', 'west'], size=n),
    'status':   np.random.choice(['active', 'inactive'], size=n),
})

def step_enrich(df):
    """Step 1: derive new columns."""
    df = df.copy()
    df['total'] = df['amount'] * df['quantity']
    df['tier']  = pd.cut(df['amount'], bins=[0,100,500,2000,float('inf')],
                         labels=['low','mid','high','premium'])
    return df

def step_filter(df):
    """Step 2: filter to active orders."""
    return df[df['status'] == 'active'].copy()

def step_aggregate(df):
    """Step 3: summarize by region."""
    return df.groupby('region')['total'].agg(['sum', 'mean', 'count'])

def full_pipeline(df):
    """Pipeline: enrich → filter → aggregate."""
    enriched   = step_enrich(df)
    filtered   = step_filter(enriched)
    summary    = step_aggregate(filtered)
    return summary

# Profile the pipeline
profiler = cProfile.Profile()
profiler.enable()
result = full_pipeline(df)
profiler.disable()

# Print sorted by cumtime (total time including sub-calls)
stream = io.StringIO()
stats  = pstats.Stats(profiler, stream=stream).sort_stats('cumtime')
stats.print_stats(20)  # top 20 functions
print(stream.getvalue())
```

**Reading cProfile output:**

| Column | Meaning |
|---|---|
| `ncalls` | Number of times this function was called |
| `tottime` | Time spent IN this function (not counting sub-calls) |
| `percall` | tottime / ncalls |
| `cumtime` | Total time including all sub-calls (the one to focus on) |
| `percall (cum)` | cumtime / ncalls |

**What to look for:**
- Sort by `cumtime` — the function with the highest cumtime is your bottleneck
- If a function has high `cumtime` but low `tottime`, the slow part is in its sub-calls
- If a function has high `tottime`, the slow part is inside that function's own code

```python
# Simpler approach: profile a specific code block inline
import cProfile

# Profile just one operation
cProfile.run(
    'df.apply(lambda r: r["amount"] * r["quantity"], axis=1)',
    sort='cumtime'
)
# Shows the call stack: apply → <lambda> → many Python function calls
```

---

#### Practice

Write a `slow_pipeline(df)` function that:
1. Uses `apply(axis=1)` to compute a `total` column (artificially slow)
2. Uses `.str.upper()` on a string column (fast)
3. Does a `groupby().sum()` aggregation (fast)

Profile it with `cProfile`. Which step appears at the top of the cumtime-sorted output?

---

### Part 4: Practice — Identify the Bottleneck (30 minutes)

#### Explanation

Profiling reveals surprises. Before looking at timing numbers, most developers guess the wrong step. The only reliable approach is to measure.

```python
import time
import pandas as pd
import numpy as np

np.random.seed(42)
n = 80_000

df = pd.DataFrame({
    'customer_name': [f"Customer {i}" for i in range(n)],
    'amount':        np.random.uniform(5, 3000, size=n),
    'quantity':      np.random.randint(1, 30, size=n),
    'category':      np.random.choice(['electronics', 'clothing', 'food', 'books'], size=n),
})

@timer
def step_string_ops(df):
    """Extract last word from customer_name (fast — .str accessor)."""
    return df['customer_name'].str.split().str[-1]

@timer
def step_numeric(df):
    """Compute revenue using apply (slow — row-by-row)."""
    return df.apply(lambda r: r['amount'] * r['quantity'], axis=1)

@timer
def step_groupby(df):
    """Sum revenue by category (fast — C-level operation)."""
    return df.groupby('category')['amount'].sum()

# Run all steps and observe which takes longest
label   = step_string_ops(df)
revenue = step_numeric(df)
summary = step_groupby(df)

# Expected output:
# [timer] step_string_ops: 0.0124s   ← fast
# [timer] step_numeric:    0.1830s   ← BOTTLENECK (apply row-by-row)
# [timer] step_groupby:    0.0031s   ← fast
#
# step_numeric accounts for ~93% of total time
# → Replace with: df['amount'] * df['quantity']
```

---

<PracticeBlock
  title="Profile a Pipeline and Find the Bottleneck"
  starter={`import time
import functools
import pandas as pd
import numpy as np

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[timer] {func.__name__}: {elapsed:.4f}s")
        return result, elapsed
    return wrapper

np.random.seed(42)
n = 60_000
df = pd.DataFrame({
    'product_code': [f"PROD-{i:05d}" for i in range(n)],
    'price':        np.random.uniform(5.0, 2000.0, size=n),
    'units':        np.random.randint(1, 25, size=n),
    'region':       np.random.choice(['north', 'south', 'east', 'west'], size=n),
})

# TODO: Decorate each step with @timer

def step_extract_code(df):
    """Extract first 4 chars of product_code as category."""
    return df['product_code'].str[:4]

def step_compute_revenue(df):
    """Compute revenue — uses apply (slow path for demonstration)."""
    return df.apply(lambda r: r['price'] * r['units'], axis=1)

def step_summarize(df):
    """Sum revenue by region."""
    df2 = df.copy()
    df2['revenue'] = df2['price'] * df2['units']
    return df2.groupby('region')['revenue'].sum()

# Run all steps
category = step_extract_code(df)
revenue  = step_compute_revenue(df)
summary  = step_summarize(df)

# TODO: After timing, identify which step is the bottleneck
# Then rewrite step_compute_revenue to be vectorized and measure the speedup
`}
  solution={`import time
import functools
import pandas as pd
import numpy as np

timings = {}

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        timings[func.__name__] = elapsed
        print(f"[timer] {func.__name__}: {elapsed:.4f}s")
        return result
    return wrapper

np.random.seed(42)
n = 60_000
df = pd.DataFrame({
    'product_code': [f"PROD-{i:05d}" for i in range(n)],
    'price':        np.random.uniform(5.0, 2000.0, size=n),
    'units':        np.random.randint(1, 25, size=n),
    'region':       np.random.choice(['north', 'south', 'east', 'west'], size=n),
})

@timer
def step_extract_code(df):
    return df['product_code'].str[:4]

@timer
def step_compute_revenue_slow(df):
    """Slow: apply row-by-row."""
    return df.apply(lambda r: r['price'] * r['units'], axis=1)

@timer
def step_compute_revenue_fast(df):
    """Fast: vectorized column arithmetic."""
    return df['price'] * df['units']

@timer
def step_summarize(df):
    df2 = df.copy()
    df2['revenue'] = df2['price'] * df2['units']
    return df2.groupby('region')['revenue'].sum()

print("=== BEFORE (slow path) ===")
category = step_extract_code(df)
revenue  = step_compute_revenue_slow(df)
summary  = step_summarize(df)

total = sum(timings.values())
print(f"\\nBottleneck: step_compute_revenue_slow = {timings['step_compute_revenue_slow'] / total * 100:.0f}% of total time")

print("\\n=== AFTER (vectorized) ===")
timings.clear()
category = step_extract_code(df)
revenue  = step_compute_revenue_fast(df)
summary  = step_summarize(df)

speedup = timings.get('step_compute_revenue_slow', timings['step_compute_revenue_fast']) / timings['step_compute_revenue_fast']
print(f"step_compute_revenue_fast: {timings['step_compute_revenue_fast']:.4f}s")`}
/>

---

## Key Takeaways

- Measure before optimizing — the bottleneck is rarely where you expect it
- `time.perf_counter()` is the right clock for benchmarking: high resolution, monotonic, not affected by NTP
- A single timing run is noisy — always average N runs and report mean, min, max
- The `@timer` decorator is the simplest profiling tool — add it to pipeline steps to see per-step breakdown
- cProfile reveals the call graph: which function calls which slow function. Focus on high-`cumtime` entries
- `tottime` = time inside the function; `cumtime` = time including sub-calls. Sort by `cumtime` to find the root bottleneck

---

## Common Mistakes to Avoid

- **Timing includes I/O**: if your function reads a file, disk latency dominates. Time CPU-only operations separately from I/O operations
- **Single-run timing is noisy**: a single `perf_counter` measurement can vary 2-5x due to OS scheduling. Always average at least 5 runs
- **Profiling too coarsely**: timing an entire 200-line function tells you nothing useful. Decorate individual steps
- **Profiling too finely**: timing every line adds overhead that distorts the measurements. Profile at the function level first, then drill down only into the confirmed bottleneck

---

## Next Lesson Preview

- `np.where()` as a vectorized if-else replacement (30-50x faster than apply conditionals)
- `np.select()` for multi-condition assignment with a clean, readable syntax
- `np.vectorize()` — when to use it and why it does NOT improve performance
- Passing `.values` to NumPy to avoid pandas overhead in tight numeric operations

---

[← Previous: Chunked Processing](./lesson-05-chunked-processing.md) | [Next: NumPy Integration Patterns →](./lesson-07-numpy-integration-patterns.md)
