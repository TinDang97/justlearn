# Lesson 5: Chunked Processing

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Read a large CSV in chunks using the `chunksize` parameter
- Apply per-chunk transformations and accumulate results across chunks
- Aggregate across chunks without loading full data into memory
- Handle errors at the chunk level without losing all progress
- Explain the tradeoffs of different chunk size selections

---

## Prerequisites

- Lesson 4: Memory Optimization with Dtypes
- Section 3: Data Loading and File Formats
- Section 6: ETL Pipelines (familiarity with pipeline structure)

---

## Lesson Outline

### Part 1: The Problem — Files Larger Than RAM (30 minutes)

#### Explanation

The standard `pd.read_csv()` call loads the entire file into RAM at once. On most development machines, this works fine for files up to a few hundred MB. At gigabyte scale, it fails.

```python
import pandas as pd
import numpy as np
import io

# Simulate the problem: what happens when a file is "too large"
# In a real scenario this would be: pd.read_csv('/data/transactions_10gb.csv')
# → MemoryError: Unable to allocate 12.4 GB for array

# Chunked reading is the solution: read N rows at a time
# pandas returns a TextFileReader iterator — no data in memory yet
reader = pd.read_csv('data/transactions.csv', chunksize=10_000)
print(type(reader))
# <class 'pandas.io.parsers.readers.TextFileReader'>

# The data is loaded lazily — only when you call next() or iterate
for chunk in reader:
    print(f"Chunk shape: {chunk.shape}")
    # Chunk shape: (10000, 7)
    # Chunk shape: (10000, 7)
    # ...last chunk may be smaller
    break  # just showing one iteration
```

**Simulating a large file for practice:**

Since we work in-memory (Pyodide environment), we will use a helper function that generates a DataFrame simulating a large CSV:

```python
import pandas as pd
import numpy as np
import io

def generate_transactions_csv(n_rows=500_000):
    """Generate a CSV string simulating a large transactions file."""
    np.random.seed(42)
    df = pd.DataFrame({
        'transaction_id': range(1, n_rows + 1),
        'customer_id':    np.random.randint(1, 10_000, size=n_rows),
        'amount':         np.random.uniform(5.0, 5000.0, size=n_rows).round(2),
        'status':         np.random.choice(['delivered', 'pending', 'cancelled', 'refunded'], size=n_rows),
        'region':         np.random.choice(['north', 'south', 'east', 'west'], size=n_rows),
        'year':           np.random.choice([2022, 2023, 2024], size=n_rows),
    })
    return df.to_csv(index=False)

# Convert to StringIO so pd.read_csv() can read it with chunksize
csv_content = generate_transactions_csv(500_000)
csv_buffer = io.StringIO(csv_content)

# Now iterate in 50K-row chunks
chunk_count = 0
for chunk in pd.read_csv(csv_buffer, chunksize=50_000):
    chunk_count += 1
    print(f"Chunk {chunk_count}: {len(chunk)} rows, {chunk.dtypes['amount']}")

print(f"Total chunks: {chunk_count}")
# Total chunks: 10
```

---

#### Practice

Using the `generate_transactions_csv()` helper, iterate over all chunks with `chunksize=100_000` and print the shape of each chunk. How many chunks are there for 500K rows?

---

### Part 2: The Accumulator Pattern (30 minutes)

#### Explanation

Chunk processing changes how you think about aggregation. Instead of calling `df.groupby().sum()` on the full DataFrame, you compute per-chunk partial results and combine them afterward.

**Simple accumulator — sum and count across chunks:**

```python
import pandas as pd
import numpy as np
import io

csv_content = generate_transactions_csv(500_000)
csv_buffer  = io.StringIO(csv_content)

# Accumulate totals without loading full data
total_revenue   = 0.0
total_rows      = 0
delivered_count = 0

for chunk in pd.read_csv(csv_buffer, chunksize=50_000):
    total_revenue   += chunk['amount'].sum()
    total_rows      += len(chunk)
    delivered_count += (chunk['status'] == 'delivered').sum()

average_order = total_revenue / total_rows
print(f"Total rows:       {total_rows:,}")
print(f"Total revenue:    ${total_revenue:,.2f}")
print(f"Average order:    ${average_order:.2f}")
print(f"Delivered orders: {delivered_count:,}")

# Verify: compare with full DataFrame result
full_df = pd.read_csv(io.StringIO(csv_content))
assert abs(total_revenue - full_df['amount'].sum()) < 0.01, "Revenue mismatch!"
assert total_rows == len(full_df), "Row count mismatch!"
print("Verification: PASS")
```

**Group-level accumulator — aggregation by category across chunks:**

```python
import pandas as pd
import numpy as np
import io
from collections import defaultdict

csv_content = generate_transactions_csv(500_000)
csv_buffer  = io.StringIO(csv_content)

# Accumulate per-region totals
region_revenue = defaultdict(float)
region_count   = defaultdict(int)

for chunk in pd.read_csv(csv_buffer, chunksize=50_000):
    # Per-chunk groupby — fast, small result
    chunk_summary = chunk.groupby('region')['amount'].agg(['sum', 'count'])
    for region, row in chunk_summary.iterrows():
        region_revenue[region] += row['sum']
        region_count[region]   += row['count']

# Final computation after all chunks
print("\nRevenue by region:")
for region in sorted(region_revenue):
    avg = region_revenue[region] / region_count[region]
    print(f"  {region:8s}: ${region_revenue[region]:>12,.2f}  (avg ${avg:.2f}, {region_count[region]:,} orders)")
```

---

#### Practice

Using the `generate_transactions_csv()` helper with 300,000 rows and `chunksize=30_000`:
1. Compute the total row count using an accumulator
2. Compute the sum of `amount` for each `status` value using a dict accumulator
3. After all chunks, print the result sorted by total amount descending
4. Verify the totals match a full-load computation

---

### Part 3: Per-Chunk Transformation with Output (30 minutes)

#### Explanation

When processing a large file and writing a cleaned version, you write each chunk as it is processed — never holding more than one chunk in memory at a time.

```python
import pandas as pd
import numpy as np
import io

def transform_chunk(chunk):
    """Apply cleaning and enrichment to a single chunk."""
    chunk = chunk.copy()

    # Filter out cancelled orders
    chunk = chunk[chunk['status'] != 'cancelled']

    # Downcast dtypes to save memory
    chunk['amount']      = pd.to_numeric(chunk['amount'],      downcast='float')
    chunk['customer_id'] = pd.to_numeric(chunk['customer_id'], downcast='integer')

    # Derive new columns
    chunk['revenue_tier'] = pd.cut(
        chunk['amount'],
        bins=[0, 100, 500, 1000, float('inf')],
        labels=['low', 'medium', 'high', 'premium']
    )

    return chunk

csv_content = generate_transactions_csv(200_000)
csv_buffer  = io.StringIO(csv_content)
output_buf  = io.StringIO()

# Process and write chunk by chunk
for i, chunk in enumerate(pd.read_csv(csv_buffer, chunksize=40_000)):
    cleaned = transform_chunk(chunk)

    if i == 0:
        # First chunk: write with header
        cleaned.to_csv(output_buf, index=False)
    else:
        # Subsequent chunks: append without header
        cleaned.to_csv(output_buf, index=False, header=False)

    print(f"Chunk {i+1}: {len(chunk)} → {len(cleaned)} rows after filtering")

# Verify output
output_buf.seek(0)
result_df = pd.read_csv(output_buf)
print(f"\nFinal output: {len(result_df):,} rows")
print(result_df.head(2))
```

**Using `enumerate` to detect the first chunk** is the standard pattern. For file-based output in a real system, replace `io.StringIO()` with `open('output.csv', 'w')`.

---

#### Practice

<PracticeBlock
  title="Chunked Aggregation Across a Simulated Large Dataset"
  starter={`import pandas as pd
import numpy as np
import io

def generate_large_df(n=500_000):
    """Returns a DataFrame simulating a large in-memory dataset."""
    np.random.seed(42)
    return pd.DataFrame({
        'row_id':    range(1, n + 1),
        'amount':    np.random.uniform(1.0, 10_000.0, size=n).round(2),
        'status':    np.random.choice(['delivered', 'pending', 'cancelled'], size=n),
        'region':    np.random.choice(['north', 'south', 'east', 'west'], size=n),
    })

# Convert to CSV string so we can use chunksize
full_df = generate_large_df(500_000)
csv_str = full_df.to_csv(index=False)

CHUNK_SIZE = 50_000

# TODO: Process in chunks and accumulate:
# 1. total_rows — count of all rows
# 2. total_amount — sum of 'amount' column
# 3. delivered_count — count of rows where status == 'delivered'

total_rows      = 0
total_amount    = 0.0
delivered_count = 0

# for chunk in pd.read_csv(..., chunksize=CHUNK_SIZE):
#     ...

print(f"Total rows:      {total_rows:,}")
print(f"Total amount:    ${total_amount:,.2f}")
print(f"Delivered count: {delivered_count:,}")

# Verify against full DataFrame
print("\\nVerification:")
print(f"Expected rows:      {len(full_df):,}")
print(f"Expected amount:    ${full_df['amount'].sum():,.2f}")
print(f"Expected delivered: {(full_df['status'] == 'delivered').sum():,}")
`}
  solution={`import pandas as pd
import numpy as np
import io

def generate_large_df(n=500_000):
    np.random.seed(42)
    return pd.DataFrame({
        'row_id':    range(1, n + 1),
        'amount':    np.random.uniform(1.0, 10_000.0, size=n).round(2),
        'status':    np.random.choice(['delivered', 'pending', 'cancelled'], size=n),
        'region':    np.random.choice(['north', 'south', 'east', 'west'], size=n),
    })

full_df = generate_large_df(500_000)
csv_str = full_df.to_csv(index=False)

CHUNK_SIZE = 50_000

total_rows      = 0
total_amount    = 0.0
delivered_count = 0

for chunk in pd.read_csv(io.StringIO(csv_str), chunksize=CHUNK_SIZE):
    total_rows      += len(chunk)
    total_amount    += chunk['amount'].sum()
    delivered_count += (chunk['status'] == 'delivered').sum()

print(f"Total rows:      {total_rows:,}")
print(f"Total amount:    ${total_amount:,.2f}")
print(f"Delivered count: {delivered_count:,}")

# Verify
assert total_rows == len(full_df), "Row count mismatch!"
assert abs(total_amount - full_df['amount'].sum()) < 0.01, "Amount mismatch!"
assert delivered_count == (full_df['status'] == 'delivered').sum(), "Count mismatch!"
print("\\nAll verifications PASSED")`}
/>

---

### Part 4: Chunk Size Selection and Tradeoffs (30 minutes)

#### Explanation

Choosing the right chunk size is a tradeoff between memory usage and processing speed.

```python
import pandas as pd
import numpy as np
import io
import time

def generate_large_df(n=500_000):
    np.random.seed(42)
    return pd.DataFrame({
        'amount':  np.random.uniform(1.0, 10_000.0, size=n).round(2),
        'status':  np.random.choice(['delivered', 'pending', 'cancelled'], size=n),
    })

full_df = generate_large_df(500_000)
csv_str = full_df.to_csv(index=False)

def time_chunk_processing(chunk_size):
    total = 0.0
    start = time.perf_counter()
    for chunk in pd.read_csv(io.StringIO(csv_str), chunksize=chunk_size):
        total += chunk['amount'].sum()
    elapsed = time.perf_counter() - start
    return elapsed, total

# Test different chunk sizes
for size in [1_000, 10_000, 50_000, 100_000, 500_000]:
    elapsed, total = time_chunk_processing(size)
    print(f"chunksize={size:>7,}: {elapsed:.3f}s  total={total:,.2f}")

# chunksize=   1,000: 0.891s  (many small chunks — overhead dominates)
# chunksize=  10,000: 0.143s
# chunksize=  50,000: 0.061s
# chunksize= 100,000: 0.052s
# chunksize= 500,000: 0.031s  (one chunk = full load)
```

**Selection guide:**

| Scenario | Recommended chunk size |
|---|---|
| 1GB file, 16GB RAM | 100K–500K rows |
| 10GB file, 16GB RAM | 50K–100K rows |
| Per-chunk transformation is complex | Smaller chunks (more parallelizable later) |
| Simple sum/count accumulator | Larger chunks (less iterator overhead) |
| Writing transformed output | Medium chunks (balance read/write buffers) |

---

## Key Takeaways

- `chunksize` controls the memory-speed tradeoff: larger chunks are faster (less iterator overhead) but use more RAM
- Chunk processing requires rethinking aggregations — you need a two-pass approach: per-chunk partial results, then a final combination step
- Stateless transformations (filter, enrich, clean) work naturally in chunks — apply them inside the loop
- Stateful operations that require global knowledge (exact median, percentile, full sort) cannot be done in chunks without approximation or loading all values
- The `enumerate` trick detects the first chunk — critical for writing CSV output with the header on the first pass only

---

## Common Mistakes to Avoid

- **Choosing too-small chunk sizes**: with 1,000-row chunks, the iterator setup and teardown overhead dominates computation. Start at 50K rows and tune from there
- **Computing exact median across chunks**: `median` requires all values sorted. Use `df['col'].quantile(0.5)` per-chunk approximation or `tdigest` for streaming percentiles — or simply load the quantile columns only (not the full file)
- **Forgetting the first-chunk header case when writing CSVs**: `to_csv(f, header=True)` on chunk 2 adds a second header row in the middle of your output file — always use `header=False` for chunks after the first
- **Re-creating the StringIO/file handle inside the loop**: the iterator is exhausted after one full pass — create a fresh `io.StringIO(csv_str)` each time you need to re-read

---

## Next Lesson Preview

- Timing code precisely with `time.perf_counter()` and a reusable `@timer` decorator
- Building a benchmark harness that runs N iterations and reports mean/min/max
- Using `cProfile` to identify which function inside a pipeline is the actual bottleneck
- Interpreting `ncalls`, `tottime`, and `cumtime` in profiler output

---

[← Previous: Memory Optimization with Dtypes](./lesson-04-memory-optimization-dtypes.md) | [Next: Profiling and Benchmarking →](./lesson-06-profiling-and-benchmarking.md)
