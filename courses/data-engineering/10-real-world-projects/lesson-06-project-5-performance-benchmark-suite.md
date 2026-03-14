# Lesson 6: Project 5 — Performance Benchmark Suite

**Course:** Data Engineering | **Duration:** 3–4 hours | **Level:** Advanced

---

## Project Overview

When a pipeline is slow, you need measurements — not intuition — to decide where to optimize. Build a benchmark harness that generates synthetic datasets at three sizes (1K, 10K, 100K rows), runs three implementations of the same pipeline (naive loop, pandas apply, and fully vectorized), measures execution time for each, verifies all three produce identical output, and formats a comparison table showing speedup factors.

**Deliverable:** A formatted benchmark table showing mean execution time and speedup factor for each implementation at each dataset size, with correctness verified.

---

## Skills Integrated

| Skill | Source Section |
|-------|---------------|
| Vectorized column operations and `np.select` | Section 9: Performance & Optimization |
| Reading and generating synthetic DataFrames | Section 3: Data Loading & File Formats |
| `groupby`, aggregation, and column arithmetic | Section 5: Data Transformation |
| Memory usage measurement | Section 9: Performance & Optimization |

---

## Architecture

```
generate_dataset(n)         <-- synthetic DataFrame with price, quantity, category
        |
        v
run_naive(df)               <-- iterrows() loop — compute total and tier per row
run_apply(df)               <-- df.apply(fn, axis=1) — per-row function
run_vectorized(df)          <-- column arithmetic + np.select — fully vectorized
        |
        v
benchmark(fn, df, n=3)      <-- time each implementation n times, return mean
        |
        v
benchmark_all(sizes)        <-- nested loop: sizes × implementations
        |
        v
format_benchmark_report(results)  <-- table with mean time, speedup, winner
        |
        v
        STDOUT: benchmark comparison table
```

---

## Dataset

**Synthetic dataset** generated in-memory. Each row represents an order line:

| Column | Type | Description |
|--------|------|-------------|
| `product_id` | string | `PROD-####` format |
| `price` | float | 1.00–500.00 |
| `quantity` | int | 1–50 |
| `category` | string | `Electronics`, `Clothing`, `Food`, `Books`, `Sports` |

The pipeline computes `total = price * quantity` and assigns a `tier` based on total value.

---

## Starter Code

All three pipeline implementations and the dataset generator are provided. Your task is to implement `benchmark()` and `benchmark_all()`.

```python
import pandas as pd
import numpy as np
import time

# --- The Three Pipeline Implementations ---

def generate_dataset(n: int, seed: int = 42) -> pd.DataFrame:
    """Generate a synthetic dataset of n rows."""
    rng = np.random.default_rng(seed)
    categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports']
    return pd.DataFrame({
        'product_id': [f'PROD-{i:04d}' for i in range(n)],
        'price': rng.uniform(1.0, 500.0, n).round(2),
        'quantity': rng.integers(1, 51, n),
        'category': rng.choice(categories, n),
    })


def run_naive(df: pd.DataFrame) -> pd.DataFrame:
    """Naive implementation: Python loop with iterrows()."""
    results = []
    for _, row in df.iterrows():
        total = row['price'] * row['quantity']
        if total >= 5000:
            tier = 'Platinum'
        elif total >= 1000:
            tier = 'Gold'
        elif total >= 100:
            tier = 'Silver'
        else:
            tier = 'Bronze'
        results.append({'product_id': row['product_id'], 'total': total, 'tier': tier})
    return pd.DataFrame(results)


def run_apply(df: pd.DataFrame) -> pd.DataFrame:
    """Apply-based implementation: per-row lambda with df.apply(axis=1)."""
    def compute_row(row):
        total = row['price'] * row['quantity']
        if total >= 5000:
            tier = 'Platinum'
        elif total >= 1000:
            tier = 'Gold'
        elif total >= 100:
            tier = 'Silver'
        else:
            tier = 'Bronze'
        return pd.Series({'product_id': row['product_id'], 'total': total, 'tier': tier})

    return df.apply(compute_row, axis=1)


def run_vectorized(df: pd.DataFrame) -> pd.DataFrame:
    """Vectorized implementation: column arithmetic and np.select."""
    result = df[['product_id']].copy()

    # Column arithmetic — runs in compiled C, not Python
    result['total'] = df['price'] * df['quantity']

    # np.select — vectorized conditional assignment
    conditions = [
        result['total'] >= 5000,
        result['total'] >= 1000,
        result['total'] >= 100,
    ]
    choices = ['Platinum', 'Gold', 'Silver']
    result['tier'] = np.select(conditions, choices, default='Bronze')

    return result


# --- Benchmark Infrastructure ---

def benchmark(fn, df: pd.DataFrame, n: int = 3) -> dict:
    """Run fn(df) n times and return timing statistics.

    Args:
        fn: Callable that takes a DataFrame and returns a DataFrame.
        df: Input DataFrame to pass to fn.
        n: Number of repetitions.

    Returns:
        Dict with keys: mean_s, min_s, max_s, runs (list of individual times).
    """
    # TODO: implement timing loop
    # times = []
    # for _ in range(n):
    #     t0 = time.perf_counter()
    #     result = fn(df)
    #     elapsed = time.perf_counter() - t0
    #     times.append(elapsed)
    # return {
    #     'mean_s': round(sum(times) / len(times), 6),
    #     'min_s': round(min(times), 6),
    #     'max_s': round(max(times), 6),
    #     'runs': times,
    # }
    return {'mean_s': 0.0, 'min_s': 0.0, 'max_s': 0.0, 'runs': []}


def verify_correctness(df: pd.DataFrame) -> bool:
    """Verify that all three implementations produce identical output.

    Runs all three implementations on df and compares results using
    pd.testing.assert_frame_equal (ignoring column order and index).

    Returns:
        True if all outputs match, False if any differ.
    """
    naive_result = run_naive(df)
    apply_result = run_apply(df)
    vec_result = run_vectorized(df)

    try:
        # Sort by product_id to normalize order before comparing
        naive_sorted = naive_result.sort_values('product_id').reset_index(drop=True)
        apply_sorted = apply_result.sort_values('product_id').reset_index(drop=True)
        vec_sorted = vec_result.sort_values('product_id').reset_index(drop=True)

        pd.testing.assert_frame_equal(
            naive_sorted[['product_id', 'total', 'tier']],
            apply_sorted[['product_id', 'total', 'tier']],
            check_dtype=False,
        )
        pd.testing.assert_frame_equal(
            naive_sorted[['product_id', 'total', 'tier']],
            vec_sorted[['product_id', 'total', 'tier']],
            check_dtype=False,
        )
        return True
    except AssertionError as e:
        print(f"Correctness check FAILED: {e}")
        return False


def benchmark_all(sizes: list) -> list:
    """Run all three implementations on each dataset size.

    For each size in sizes:
    1. Generate a dataset of that size
    2. Verify correctness (all 3 implementations produce same output)
    3. Benchmark each implementation (n=3 runs)
    4. Compute speedup: naive_mean / implementation_mean

    Returns:
        List of result dicts:
        {
          'size': int,
          'correct': bool,
          'implementations': {
            'naive': {'mean_s': float, 'speedup': 1.0},
            'apply': {'mean_s': float, 'speedup': float},
            'vectorized': {'mean_s': float, 'speedup': float},
          }
        }
    """
    # TODO: implement benchmark_all
    # results = []
    # for size in sizes:
    #     df = generate_dataset(size)
    #     correct = verify_correctness(df)
    #
    #     impl_results = {}
    #     for name, fn in [('naive', run_naive), ('apply', run_apply), ('vectorized', run_vectorized)]:
    #         stats = benchmark(fn, df, n=3)
    #         impl_results[name] = stats
    #
    #     # Compute speedup relative to naive
    #     naive_mean = impl_results['naive']['mean_s']
    #     for name in impl_results:
    #         impl_mean = impl_results[name]['mean_s']
    #         speedup = naive_mean / impl_mean if impl_mean > 0 else 1.0
    #         impl_results[name]['speedup'] = round(speedup, 1)
    #
    #     results.append({'size': size, 'correct': correct, 'implementations': impl_results})
    #
    # return results
    return []


def format_benchmark_report(results: list) -> str:
    """Format benchmark results as a comparison table.

    Output format:
        PERFORMANCE BENCHMARK RESULTS
        ============================================================
        Size       Implementation     Mean (s)    Speedup   Correct
        ------------------------------------------------------------
        1,000      naive              0.0423      1.0x      YES
        1,000      apply              0.0089      4.8x      YES
        1,000      vectorized         0.0004     105.8x     YES
        ...

    Returns:
        Formatted report string.
    """
    lines = [
        "PERFORMANCE BENCHMARK RESULTS",
        "=" * 60,
        f"{'Size':<10} {'Implementation':<20} {'Mean (s)':>10} {'Speedup':>9} {'Correct':>8}",
        "-" * 60,
    ]

    for row in results:
        size = row['size']
        correct_str = "YES" if row['correct'] else "NO"
        for impl_name, stats in row['implementations'].items():
            lines.append(
                f"{size:<10,} {impl_name:<20} "
                f"{stats['mean_s']:>10.4f} "
                f"{stats.get('speedup', 1.0):>8.1f}x "
                f"{correct_str:>8}"
            )
        lines.append("")

    # Find the winner for each size
    lines.append("WINNER (fastest per dataset size):")
    for row in results:
        fastest = min(row['implementations'].items(), key=lambda x: x[1]['mean_s'])
        lines.append(f"  {row['size']:>7,} rows → {fastest[0]} ({fastest[1]['mean_s']:.4f}s)")

    report = "\n".join(lines)
    print(report)
    return report


def main():
    sizes = [100, 1000, 10000]  # use smaller sizes for browser; full suite: [1000, 10000, 100000]
    print(f"Running benchmarks on {sizes} — this may take 30–60 seconds for 100K rows...\n")
    results = benchmark_all(sizes)
    if results:
        format_benchmark_report(results)
    else:
        print("benchmark_all() returned empty results — implement the TODO.")


if __name__ == "__main__":
    main()
```

---

## Step-by-Step Walkthrough

### Step 1: Understand the Three Implementations (20 minutes)

Before benchmarking, understand what each implementation does and why the performance differs.

**Naive (iterrows):** Calls Python for every single row. With 100K rows, that's 100,000 Python function calls plus the overhead of constructing a `pd.Series` object for each row. This is the worst-case pattern.

**Apply:** Still calls a Python function per row, but avoids `pd.Series` construction by using a lambda. Faster than naive but still row-by-row Python execution.

**Vectorized:** Multiplies entire columns using NumPy's compiled C operations. `df['price'] * df['quantity']` processes all rows simultaneously in C — no Python overhead per row. `np.select()` applies conditions to entire arrays.

Run all three on a 100-row dataset and print the results to confirm they are identical before benchmarking.

---

### Step 2: Implement `benchmark()` (20 minutes)

Use `time.perf_counter()` for high-resolution timing. Run the function `n` times and return the mean:

```python
def benchmark(fn, df: pd.DataFrame, n: int = 3) -> dict:
    times = []
    for _ in range(n):
        t0 = time.perf_counter()
        result = fn(df)
        elapsed = time.perf_counter() - t0
        times.append(elapsed)
    return {
        'mean_s': round(sum(times) / len(times), 6),
        'min_s': round(min(times), 6),
        'max_s': round(max(times), 6),
        'runs': times,
    }
```

`time.perf_counter()` is more precise than `time.time()` for short operations. The `n=3` default gives a stable mean without excessive wall time — pandas operations have low variance across runs.

---

### Step 3: Implement `benchmark_all()` (25 minutes)

The nested loop structure: for each size, benchmark each implementation:

```python
def benchmark_all(sizes: list) -> list:
    results = []
    for size in sizes:
        print(f"  Benchmarking size={size:,}...", end='', flush=True)
        df = generate_dataset(size)
        correct = verify_correctness(df)

        impl_results = {}
        for name, fn in [('naive', run_naive), ('apply', run_apply), ('vectorized', run_vectorized)]:
            stats = benchmark(fn, df, n=3)
            impl_results[name] = stats

        # Compute speedup: how many times faster than naive?
        naive_mean = impl_results['naive']['mean_s']
        for name in impl_results:
            impl_mean = impl_results[name]['mean_s']
            speedup = naive_mean / impl_mean if impl_mean > 0 else 1.0
            impl_results[name]['speedup'] = round(speedup, 1)

        results.append({'size': size, 'correct': correct, 'implementations': impl_results})
        print(f" done (naive={impl_results['naive']['mean_s']:.4f}s)")

    return results
```

<Warning>
Benchmarking 100K rows with the naive `iterrows()` implementation takes 20–60 seconds depending on browser speed. Start with `sizes = [100, 1000, 10000]` for the practice exercise.
</Warning>

---

### Step 4: Interpret Results (15 minutes)

After running the benchmark, answer these questions in comments in your code:

1. At what dataset size does the vectorized speedup become significant (>10x)?
2. Is `apply` significantly faster than `naive` at 10K rows?
3. Which implementation should you default to in production? Why?
4. When would `apply` be acceptable (name a real use case)?

---

## Expected Output

```
Running benchmarks on [100, 1000, 10000] — this may take 30–60 seconds for 100K rows...
  Benchmarking size=100... done (naive=0.0004s)
  Benchmarking size=1,000... done (naive=0.0042s)
  Benchmarking size=10,000... done (naive=0.0421s)

PERFORMANCE BENCHMARK RESULTS
============================================================
Size       Implementation       Mean (s)   Speedup  Correct
------------------------------------------------------------
100        naive                  0.0004      1.0x      YES
100        apply                  0.0003      1.3x      YES
100        vectorized             0.0001     10.2x      YES

1,000      naive                  0.0042      1.0x      YES
1,000      apply                  0.0025      1.7x      YES
1,000      vectorized             0.0001     52.1x      YES

10,000     naive                  0.0421      1.0x      YES
10,000     apply                  0.0243      1.7x      YES
10,000     vectorized             0.0003    140.3x      YES

WINNER (fastest per dataset size):
      100 rows → vectorized (0.0001s)
    1,000 rows → vectorized (0.0001s)
   10,000 rows → vectorized (0.0003s)
```

The vectorized implementation is ~10x faster at 100 rows and ~100–140x faster at 10,000 rows. At 100K rows, the speedup typically exceeds 500x.

---

## Practice Exercises

<PracticeBlock
  prompt="Implement `benchmark_all(sizes)`. For each size in the list: (1) generate a dataset, (2) verify correctness of all 3 implementations, (3) benchmark each implementation with n=3 runs, (4) compute speedup as naive_mean / impl_mean. Return a list of result dicts. Use sizes=[100, 500, 2000] for speed in the browser."
  initialCode={`import pandas as pd
import numpy as np
import time

def generate_dataset(n, seed=42):
    rng = np.random.default_rng(seed)
    return pd.DataFrame({
        'product_id': [f'PROD-{i:04d}' for i in range(n)],
        'price': rng.uniform(1.0, 500.0, n).round(2),
        'quantity': rng.integers(1, 51, n),
        'category': rng.choice(['Electronics', 'Clothing', 'Food'], n),
    })

def run_naive(df):
    results = []
    for _, row in df.iterrows():
        total = row['price'] * row['quantity']
        tier = 'Platinum' if total >= 5000 else 'Gold' if total >= 1000 else 'Silver' if total >= 100 else 'Bronze'
        results.append({'product_id': row['product_id'], 'total': total, 'tier': tier})
    return pd.DataFrame(results)

def run_vectorized(df):
    result = df[['product_id']].copy()
    result['total'] = df['price'] * df['quantity']
    conditions = [result['total'] >= 5000, result['total'] >= 1000, result['total'] >= 100]
    result['tier'] = np.select(conditions, ['Platinum', 'Gold', 'Silver'], default='Bronze')
    return result

def benchmark(fn, df, n=3):
    times = []
    for _ in range(n):
        t0 = time.perf_counter()
        fn(df)
        times.append(time.perf_counter() - t0)
    return {'mean_s': round(sum(times)/len(times), 6)}

def benchmark_all(sizes):
    # TODO: implement nested benchmark loop
    return []

results = benchmark_all([100, 500, 2000])
for r in results:
    naive_t = r['implementations']['naive']['mean_s']
    vec_t = r['implementations']['vectorized']['mean_s']
    speedup = r['implementations']['vectorized'].get('speedup', 'N/A')
    print(f"Size {r['size']:>5}: naive={naive_t:.4f}s  vectorized={vec_t:.4f}s  speedup={speedup}x")`}
  hint="Nested loop: for size in sizes: generate df, then for name, fn in [('naive', run_naive), ('vectorized', run_vectorized)]: call benchmark(fn, df). After collecting both, speedup = naive_mean / vec_mean."
  solution={`import pandas as pd
import numpy as np
import time

def generate_dataset(n, seed=42):
    rng = np.random.default_rng(seed)
    return pd.DataFrame({
        'product_id': [f'PROD-{i:04d}' for i in range(n)],
        'price': rng.uniform(1.0, 500.0, n).round(2),
        'quantity': rng.integers(1, 51, n),
        'category': rng.choice(['Electronics', 'Clothing', 'Food'], n),
    })

def run_naive(df):
    results = []
    for _, row in df.iterrows():
        total = row['price'] * row['quantity']
        tier = 'Platinum' if total >= 5000 else 'Gold' if total >= 1000 else 'Silver' if total >= 100 else 'Bronze'
        results.append({'product_id': row['product_id'], 'total': total, 'tier': tier})
    return pd.DataFrame(results)

def run_vectorized(df):
    result = df[['product_id']].copy()
    result['total'] = df['price'] * df['quantity']
    conditions = [result['total'] >= 5000, result['total'] >= 1000, result['total'] >= 100]
    result['tier'] = np.select(conditions, ['Platinum', 'Gold', 'Silver'], default='Bronze')
    return result

def benchmark(fn, df, n=3):
    times = []
    for _ in range(n):
        t0 = time.perf_counter()
        fn(df)
        times.append(time.perf_counter() - t0)
    return {'mean_s': round(sum(times)/len(times), 6)}

def benchmark_all(sizes):
    results = []
    for size in sizes:
        df = generate_dataset(size)
        impl_results = {}
        for name, fn in [('naive', run_naive), ('vectorized', run_vectorized)]:
            stats = benchmark(fn, df, n=3)
            impl_results[name] = stats
        naive_mean = impl_results['naive']['mean_s']
        for name in impl_results:
            impl_mean = impl_results[name]['mean_s']
            impl_results[name]['speedup'] = round(naive_mean / impl_mean, 1) if impl_mean > 0 else 1.0
        results.append({'size': size, 'correct': True, 'implementations': impl_results})
    return results

results = benchmark_all([100, 500, 2000])
for r in results:
    naive_t = r['implementations']['naive']['mean_s']
    vec_t = r['implementations']['vectorized']['mean_s']
    speedup = r['implementations']['vectorized'].get('speedup', 'N/A')
    print(f"Size {r['size']:>5}: naive={naive_t:.4f}s  vectorized={vec_t:.4f}s  speedup={speedup}x")`}
/>

---

## Extension Challenges

1. **NumPy-only variant**: Add a 4th implementation `run_numpy(df)` that uses raw NumPy arrays (no pandas): extract `price` and `quantity` as `np.ndarray` using `df['price'].values`, compute total, and use `np.where` for tier assignment. Compare against vectorized pandas.

2. **Memory profiling**: Use `tracemalloc` to measure peak memory for each implementation. Add a `peak_memory_mb` field to the benchmark results. Which implementation uses the most memory? Does memory usage scale linearly with dataset size?

3. **Chunked naive processing**: For the naive implementation on 1M rows, add a chunked variant that processes 10,000 rows at a time using a generator. Measure if chunking reduces peak memory without significantly impacting speed.

---

## Key Takeaways

- `iterrows()` processes one row at a time in Python — it is never the right choice for computation on large DataFrames
- `apply(axis=1)` is also row-by-row Python — it is 2–5x faster than `iterrows` but still 50–200x slower than vectorized operations at scale
- Vectorized operations (`df['col1'] * df['col2']`, `np.select`) run in C and process entire arrays — always use them for column arithmetic and conditional assignment
- `time.perf_counter()` is the correct timer for short operations — more precise than `time.time()`
- Always verify correctness before publishing benchmark results — a fast implementation that produces wrong output is useless

---

[← Lesson 5: Project 4 — Customer Segmentation](./lesson-05-project-4-customer-segmentation.md) | [Next Lesson: Project 6 — Data Quality Monitor →](./lesson-07-project-6-data-quality-monitor.md)
