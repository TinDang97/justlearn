# Lesson 8: Chunked Reading for Large Files

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain why files larger than available RAM crash pandas
- Use `pd.read_csv(chunksize=N)` to process a file in pieces
- Apply the accumulation pattern to compute statistics across chunks
- Decide when to use chunking vs Dask vs Spark based on file size

---

## Prerequisites

- Lesson 1: Reading CSV Files
- Python: for loops and list/dict manipulation

---

## Lesson Outline

### Part 1: The Memory Problem (8 minutes)

#### Explanation

When you call `pd.read_csv('data/bigfile.csv')`, pandas loads the entire file into RAM as a DataFrame. If the file is larger than available memory, Python raises:

```
MemoryError: Unable to allocate X GiB for an array
```

This is not a pandas bug — it is a fundamental constraint. A DataFrame in memory uses approximately 4-8x more space than the raw file on disk (due to Python object overhead, type storage, and alignment). A 4GB CSV file might require 16-32GB of RAM to load fully.

**Common scenarios where this matters:**
- A log file that grew to 50GB overnight
- A 10 million row transaction export from a database
- A multi-year historical dataset that fits on disk but not in RAM

The solution is to process the file in **chunks** — load N rows at a time, process them, discard, then load the next N rows.

---

### Part 2: `pd.read_csv(chunksize=N)` (12 minutes)

#### Explanation

Passing `chunksize=N` to `pd.read_csv()` changes its behavior entirely. Instead of returning a DataFrame, it returns a **`TextFileReader`** iterator. Each iteration of the iterator yields a DataFrame of exactly N rows (the final iteration may yield fewer if the file does not divide evenly).

```python
import pandas as pd

# Without chunksize: loads everything into memory
df = pd.read_csv('data/orders.csv')   # returns DataFrame

# With chunksize: returns an iterator
reader = pd.read_csv('data/orders.csv', chunksize=3)   # returns TextFileReader

for chunk in reader:
    print(type(chunk))    # <class 'pandas.core.frame.DataFrame'>
    print(chunk.shape)    # (3, 8) — 3 rows, 8 columns
```

Each `chunk` is a normal DataFrame. You can apply any pandas operation to it — filtering, aggregation, column transformations. The key is that you process each chunk and then move on — you do not hold all chunks in memory simultaneously.

<Tip>
For a 1GB CSV on a 4GB RAM machine, use chunksize=100_000. Each chunk will be approximately 10-20MB, leaving plenty of headroom for other operations and the accumulation data structure.
</Tip>

**All `pd.read_csv()` parameters work with `chunksize`:**

```python
reader = pd.read_csv(
    'data/large_orders.csv',
    chunksize=100_000,
    parse_dates=['order_date'],
    dtype={'unit_price': float},
    usecols=['customer', 'category', 'unit_price', 'quantity']
)
```

---

### Part 3: The Accumulation Pattern (12 minutes)

#### Explanation

Processing a file in chunks requires accumulating partial results from each chunk, then combining them at the end. The pattern has three steps:

1. **Initialize** an accumulator before the loop
2. **Process** each chunk and add its contribution to the accumulator
3. **Finalize** the accumulated results after the loop

**Example: compute total sales per category across chunks**

```python
import pandas as pd

# Accumulator — collect partial DataFrames from each chunk
partial_results = []

for chunk in pd.read_csv('data/orders.csv', chunksize=3):
    # Compute per-chunk subtotal per category
    chunk_totals = chunk.groupby('category')['unit_price'].sum()
    partial_results.append(chunk_totals)

# Combine all partial results
combined = pd.concat(partial_results)

# Final aggregation — sum across chunks for the same category
final_totals = combined.groupby(level=0).sum()
print(final_totals)
```

**Alternative: accumulate with a dict (lower memory overhead)**

```python
import pandas as pd

totals = {}   # category -> running total

for chunk in pd.read_csv('data/orders.csv', chunksize=3):
    for _, row in chunk.iterrows():
        category = row['category']
        totals[category] = totals.get(category, 0) + row['unit_price']

result = pd.Series(totals, name='unit_price_total')
print(result)
```

**Important:** the accumulator itself must stay small. If your accumulation logic stores a full row per chunk, you have not solved the memory problem. Aggregate into a small summary structure (counts, sums, category dictionaries) before appending to the accumulator.

---

### Part 4: Chunking vs Other Solutions (8 minutes)

#### Explanation

Chunking is one tool among several for handling large data. Choose based on file size and complexity:

| Scale | Recommended approach | Notes |
|-------|---------------------|-------|
| < 1GB | `pd.read_csv()` directly | No chunking needed |
| 1-10GB, single machine | `pd.read_csv(chunksize=N)` | Works well for simple aggregations |
| 1-10GB, complex operations | Dask | Parallel pandas API; same syntax as pandas |
| > 10GB or distributed | Apache Spark | Distributed computing across a cluster |
| Any size, analytical SQL | DuckDB | Can query CSV/Parquet directly with SQL, very fast |

**Estimating chunk size:**

A rough rule of thumb:

```
chunk_size = available_memory_bytes / (row_size_bytes * 3)
```

The factor of 3 accounts for: the chunk itself, intermediate computation, and the pandas overhead. For a 10MB chunk (typical for 100,000 rows of numeric data), this requires about 30MB of free RAM — very manageable.

**Chunking is not needed for Parquet:**

Parquet's columnar format with column pruning (`columns=['a', 'b']`) already reduces I/O dramatically. For most analytical queries on Parquet files, you read far less data than the full file, and Python can handle it without chunking.

---

## Practice

<PracticeBlock
  prompt="Read orders.csv in chunks of 3 rows (small chunksize to demonstrate the concept). Print the shape of each chunk and the chunk number."
  initialCode={`import pandas as pd

chunk_num = 0
for chunk in pd.read_csv('data/orders.csv', chunksize=___):
    chunk_num += 1
    print(f"Chunk {chunk_num}: shape = {chunk.shape}")

print(f"Total chunks processed: {chunk_num}")
`}
  hint="Pass chunksize=3 to pd.read_csv(). With 10 rows and chunksize=3, you should get 4 chunks (3+3+3+1)."
  solution={`import pandas as pd

chunk_num = 0
for chunk in pd.read_csv('data/orders.csv', chunksize=3):
    chunk_num += 1
    print(f"Chunk {chunk_num}: shape = {chunk.shape}")

print(f"Total chunks processed: {chunk_num}")
# Chunk 1: shape = (3, 8)
# Chunk 2: shape = (3, 8)
# Chunk 3: shape = (3, 8)
# Chunk 4: shape = (1, 8)
# Total chunks processed: 4
`}
/>

<PracticeBlock
  prompt="Compute the total quantity sold per category by processing orders.csv in chunks of 3. Accumulate partial results into a dict and print the final totals."
  initialCode={`import pandas as pd

# Accumulate totals per category
category_totals = {}

for chunk in pd.read_csv('data/orders.csv', chunksize=3):
    # For each row in this chunk, add quantity to the running total
    for _, row in chunk.iterrows():
        cat = row['category']
        qty = row['quantity']
        category_totals[cat] = category_totals.get(cat, 0) + ___

print("Total quantity per category:")
for category, total in sorted(category_totals.items()):
    print(f"  {category}: {total}")
`}
  hint="Add row['quantity'] to the running total: category_totals.get(cat, 0) + qty"
  solution={`import pandas as pd

# Accumulate totals per category
category_totals = {}

for chunk in pd.read_csv('data/orders.csv', chunksize=3):
    for _, row in chunk.iterrows():
        cat = row['category']
        qty = row['quantity']
        category_totals[cat] = category_totals.get(cat, 0) + qty

print("Total quantity per category:")
for category, total in sorted(category_totals.items()):
    print(f"  {category}: {total}")
# Accessories: 10
# Electronics: 7
`}
/>

---

## Key Takeaways

- Files larger than available RAM raise `MemoryError` when loaded directly — chunking is the solution
- `pd.read_csv(chunksize=N)` returns an iterator; each iteration yields a N-row DataFrame
- The accumulation pattern: initialize accumulator → process each chunk → finalize after loop
- The accumulator must stay small (sums, counts, category dicts) — not full rows
- Chunking works for CSV; for Parquet, column pruning achieves the same I/O reduction without iteration

---

## Common Mistakes

- **Loading all chunks into a list.** `chunks = list(pd.read_csv(..., chunksize=N))` defeats the purpose — you load the entire file into memory as a list of DataFrames.
- **Making the accumulator too large.** If you append full chunk DataFrames to a list, your accumulator grows to full-file size.
- **Using chunking when Parquet + column selection would suffice.** For files that can be stored as Parquet, selective column loading is simpler than chunking.

---

## Next Lesson Preview

In **Lesson 9: Inspecting New Datasets**, we cover:
- A 7-step repeatable workflow for inspecting any new dataset
- Red flags to look for (unexpected dtypes, all-null columns, duplicates)
- How to document your findings

---

[Back to Section Overview](./README.md) | [Next Lesson: Inspecting New Datasets →](./lesson-09-inspecting-new-datasets.md)
