# Lesson 7: The Parquet Format

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain what columnar storage is and why it matters for analytics
- Read Parquet files with `pd.read_parquet()` and write them with `to_parquet()`
- Load only specific columns from a Parquet file
- Compare Parquet vs CSV across size, speed, and schema preservation
- Explain where Parquet is used in production data engineering

---

## Prerequisites

- Lesson 1: Reading CSV Files
- Lesson 6: Writing DataFrames to Files

---

## Lesson Outline

### Part 1: What is Parquet? (10 minutes)

#### Explanation

Apache Parquet is a **columnar binary file format** originally developed for the Hadoop ecosystem. It is now the standard file format for data engineering work — used in S3 data lakes, BigQuery, Databricks, Snowflake external tables, and Spark.

**Columnar vs row-based storage:**

A CSV file stores data row by row:
```
Row 1: O001, Alice, Laptop, Electronics, 1, 1200.00
Row 2: O002, Bob, Mouse, Accessories, 2, 25.00
Row 3: O003, Alice, Keyboard, Accessories, 1, 75.00
```

To answer "what is the total revenue?" a row-based reader must read the entire file to extract the `unit_price` and `quantity` columns.

A Parquet file stores data **column by column**:
```
Column 'order_id':   [O001, O002, O003, ...]
Column 'customer':   [Alice, Bob, Alice, ...]
Column 'unit_price': [1200.00, 25.00, 75.00, ...]
Column 'quantity':   [1, 2, 1, ...]
```

To compute total revenue, the reader loads only `unit_price` and `quantity` — it never touches `order_id`, `customer`, `product`, or `region`. On a file with 100 columns, this means reading 2 columns instead of 100.

**Why this matters at scale:**

On a 10GB file with 200 columns, an analytic query that uses 5 columns:
- CSV: reads all 10GB
- Parquet: reads approximately 250MB (5/200 of the data)

This is a 40x reduction in I/O — which directly translates to faster queries and lower cloud storage costs.

---

### Part 2: Why Columnar Format Matters (10 minutes)

#### Explanation

Three distinct advantages of columnar storage:

**1. Column pruning — read only what you need**

Parquet readers skip columns entirely. `pd.read_parquet('file.parquet', columns=['unit_price', 'quantity'])` reads those two columns and ignores everything else at the file I/O level.

**2. Better compression per column**

Compression algorithms work better on homogeneous data. A column of floats compresses much better than a mix of strings, floats, and ints in the same byte stream. Parquet typically achieves 3-10x better compression than CSV, especially on string columns with many repeated values.

**3. Schema preservation — no type inference**

CSV stores everything as text. Every time you load a CSV, pandas guesses column types from the values. Parquet stores the schema — column names, types, and nullability — inside the file. When you load a Parquet file, the types are always exactly as written. No more `order_date` loading as `object` instead of `datetime64`.

```python
import pandas as pd

# Save with schema preserved
df = pd.read_csv('data/orders.csv', parse_dates=['order_date'])
df.to_parquet('data/orders.parquet', index=False)

# Load — order_date is datetime64 automatically, no parse_dates needed
df2 = pd.read_parquet('data/orders.parquet')
print(df2['order_date'].dtype)   # datetime64[ns]
```

---

### Part 3: `pd.read_parquet()` and `to_parquet()` (12 minutes)

#### Explanation

Parquet support in pandas requires either `pyarrow` or `fastparquet` as a backend engine. `pyarrow` is the default and recommended choice (pre-installed in this course environment).

**Writing Parquet:**

```python
import pandas as pd

df = pd.read_csv('data/orders.csv', parse_dates=['order_date'])
df.to_parquet('data/orders.parquet', index=False)
```

Key parameters for `to_parquet()`:
- `index=False` — same as CSV, avoids writing the integer index
- `engine='pyarrow'` — explicit engine (default)
- `compression='snappy'` — compression algorithm (snappy, gzip, brotli, zstd, or None)

**Reading Parquet:**

```python
df = pd.read_parquet('data/orders.parquet')
print(df.dtypes)  # types are exactly as stored — no inference
```

**Reading only specific columns:**

```python
# Only read the columns you need — I/O reduction happens at the file level
df = pd.read_parquet(
    'data/orders.parquet',
    columns=['customer', 'product', 'unit_price']
)
```

This is genuinely faster than reading all columns and then selecting — Parquet skips the other columns entirely when reading from disk.

---

### Part 4: Parquet vs CSV Comparison (8 minutes)

#### Explanation

| Property | CSV | Parquet |
|----------|-----|---------|
| Human readable | Yes (open in any text editor) | No (binary format) |
| File size | Baseline | 3-10x smaller (typically) |
| Read speed (full scan) | Baseline | 2-5x faster |
| Read speed (column subset) | Reads entire file | Reads only needed columns |
| Schema preserved | No — inferred on every load | Yes — embedded in file |
| Compression | None by default | Snappy/gzip/zstd (automatic) |
| Pandas dtype loss on load | Yes (dates load as strings) | No (types always correct) |
| Supported by | Everything | Spark, BigQuery, Redshift, Athena, DuckDB, pandas, Polars |
| Max file size practical | ~1GB before it gets slow | Terabytes (split into partitions) |

**When to use CSV vs Parquet:**

- Use **CSV** for: sharing data with non-technical users, interoperability with any tool, human inspection, files under a few MB
- Use **Parquet** for: data pipelines, data lakes, large files, anything that will be queried repeatedly, anything going to a cloud analytics service

---

### Part 5: Parquet in Practice (5 minutes)

#### Explanation

Parquet is the industry default for data engineering infrastructure:

- **AWS S3 + Athena** — query Parquet files directly with SQL; Parquet partitioning enables partition pruning (only scan relevant date/region folders)
- **Google BigQuery** — external tables and Bigtable exports use Parquet
- **Databricks / Apache Spark** — default format for the Databricks Lakehouse
- **DuckDB** — the local analytics engine; `SELECT * FROM 'file.parquet'` works natively
- **dbt** — materializes models as Parquet in the data lake layer

When a data engineer says "write it to the lake", they mean write Parquet to S3 or GCS.

<Info>
When in doubt about file format for a new data pipeline, use Parquet. It is the industry default for data engineering work. The only reason to use CSV in a pipeline is when the downstream system cannot read Parquet.
</Info>

---

## Practice

<PracticeBlock
  prompt="Load orders.csv with parse_dates=['order_date'], write it as Parquet with to_parquet('data/orders.parquet', index=False), then read it back and compare dtypes. Notice that order_date is datetime64 without needing parse_dates on the second read."
  initialCode={`import pandas as pd

# Load CSV — parse dates manually
df_csv = pd.read_csv('data/orders.csv', parse_dates=['order_date'])
print("CSV dtypes:")
print(df_csv.dtypes)

# Write to Parquet
df_csv.to_parquet('data/orders.parquet', index=False)

# Read back from Parquet
df_parquet = pd.read_parquet(___)
print()
print("Parquet dtypes (note: order_date is still datetime64):")
print(df_parquet.dtypes)
`}
  hint="Pass 'data/orders.parquet' to pd.read_parquet(). No parse_dates needed — the schema is embedded."
  solution={`import pandas as pd

# Load CSV — parse dates manually
df_csv = pd.read_csv('data/orders.csv', parse_dates=['order_date'])
print("CSV dtypes:")
print(df_csv.dtypes)

# Write to Parquet
df_csv.to_parquet('data/orders.parquet', index=False)

# Read back from Parquet — no parse_dates needed
df_parquet = pd.read_parquet('data/orders.parquet')
print()
print("Parquet dtypes (order_date preserved as datetime64):")
print(df_parquet.dtypes)
print()
print("order_date dtype:", df_parquet['order_date'].dtype)
`}
/>

<PracticeBlock
  prompt="Read only the 'customer' and 'unit_price' columns from the Parquet file you created. Use the columns parameter to load only those two columns. Print the result."
  initialCode={`import pandas as pd

# Read only specific columns from the Parquet file
df = pd.read_parquet('data/orders.parquet', columns=___)
print("Shape:", df.shape)
print(df)
`}
  hint="Pass a list to columns: columns=['customer', 'unit_price']"
  solution={`import pandas as pd

# Read only specific columns from the Parquet file
df = pd.read_parquet('data/orders.parquet', columns=['customer', 'unit_price'])
print("Shape:", df.shape)  # (10, 2) — only 2 columns loaded
print(df)
`}
/>

---

## Key Takeaways

- Parquet is a columnar binary format — the industry standard for data engineering
- Columnar storage enables reading only the columns needed, dramatically reducing I/O for analytic queries
- Parquet embeds the schema — types are always preserved exactly as written, no inference on load
- `to_parquet('file.parquet', index=False)` writes; `pd.read_parquet('file.parquet')` reads
- `columns=['a', 'b']` in `read_parquet()` triggers true column pruning at the file level
- Use CSV for human sharing; use Parquet for pipelines, data lakes, and analytics

---

## Common Mistakes

- **Not installing pyarrow.** `pd.read_parquet()` requires either `pyarrow` or `fastparquet`. Both are pre-installed in this course environment.
- **Writing the index to Parquet.** Just like CSV, use `index=False` to avoid an extra `__index_level_0__` column.
- **Using Parquet for tiny files.** For files under ~1MB, the overhead of the binary format and metadata is not worth it. Use CSV for small data exchange.

---

## Next Lesson Preview

In **Lesson 8: Chunked Reading for Large Files**, we cover:
- Why large CSV files crash pandas with MemoryError
- `pd.read_csv(chunksize=N)` to process files in pieces
- The accumulation pattern for computing statistics on chunked data

---

[Back to Section Overview](./README.md) | [Next Lesson: Chunked Reading for Large Files →](./lesson-08-chunked-reading.md)
