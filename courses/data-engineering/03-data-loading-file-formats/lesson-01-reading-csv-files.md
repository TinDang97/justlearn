# Lesson 1: Reading CSV Files with pandas

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain what a CSV file is and why it is the most universal data format
- Load a CSV file into a pandas DataFrame using `pd.read_csv()`
- Control which columns, rows, and separator character pandas uses when loading
- Specify data types explicitly to prevent type inference surprises

---

## Prerequisites

- pandas installed and importable
- Section 2: creating and indexing DataFrames

---

## Lesson Outline

### Part 1: What is CSV? (8 minutes)

#### Explanation

CSV stands for **Comma-Separated Values**. A CSV file is a plain-text file where each line is a row of data and values on each line are separated by a delimiter — usually a comma.

```
order_id,customer,product,quantity,unit_price
O001,Alice,Laptop,1,1200.00
O002,Bob,Mouse,2,25.00
```

The first line is almost always a **header row** — the column names. Every subsequent line is one record.

**Why CSV is universal:**
- Every spreadsheet application (Excel, Google Sheets, LibreOffice) can import and export CSV
- Every programming language can read a plain text file
- Human-readable — you can open it in a text editor and understand it immediately
- No proprietary format or license required

**CSV limitations:**
- **No schema** — column types are not stored. pandas must guess whether `1200.00` is a float or a string
- **No nested structures** — everything must be flat (one value per cell)
- **Encoding ambiguity** — the file might be UTF-8, Latin-1, or something else
- **Fragile with commas in data** — a product name like `"Desk, Standing"` needs quoting rules

Despite its limitations, CSV is the lingua franca of data exchange. You will encounter it constantly.

---

### Part 2: `pd.read_csv()` Basics (10 minutes)

#### Explanation

`pd.read_csv()` is the primary function for loading CSV files. The minimum usage is:

```python
import pandas as pd

df = pd.read_csv('path/to/file.csv')
```

This returns a **DataFrame** — the same data structure you learned in Section 2, now populated from a file on disk.

**What pandas does automatically:**
1. Opens the file and reads it as text
2. Detects the delimiter (assumes comma unless told otherwise)
3. Uses the first row as column headers
4. Assigns a default integer index (0, 1, 2, ...)
5. Infers data types for each column (integer, float, or object/string)

```python
import pandas as pd

df = pd.read_csv('data/orders.csv')
print(df.shape)    # (10, 8) — 10 rows, 8 columns
print(df.head())   # first 5 rows
print(df.dtypes)   # column types as inferred by pandas
```

---

### Part 3: Essential Parameters (18 minutes)

#### Explanation

`pd.read_csv()` has over 40 parameters. You need to know six well.

**`sep` — change the delimiter**

Not all "CSV" files use commas. Pipe-delimited (`|`) and tab-delimited (`\t`) files are common, especially from database exports.

```python
# Pipe-delimited file
df = pd.read_csv('data/report.csv', sep='|')

# Tab-delimited file (also: use pd.read_table for TSV)
df = pd.read_csv('data/export.tsv', sep='\t')
```

**`header` — specify which row contains column names**

By default, row 0 (the first row) is treated as the header. Change this if your file has metadata rows before the actual headers.

```python
# File has metadata in rows 0-2, headers at row 3
df = pd.read_csv('data/report.csv', header=3)

# No header at all — pandas assigns 0, 1, 2, ...
df = pd.read_csv('data/raw.csv', header=None)
```

**`index_col` — use a column as the row index**

```python
# Use order_id column as the index instead of 0, 1, 2, ...
df = pd.read_csv('data/orders.csv', index_col='order_id')
print(df.loc['O001'])   # access row by order_id
```

**`usecols` — load only specific columns**

Loading fewer columns means less memory usage and faster reads on large files.

```python
# Load only customer, product, and unit_price
df = pd.read_csv('data/orders.csv', usecols=['customer', 'product', 'unit_price'])
print(df.columns)  # Index(['customer', 'product', 'unit_price'], dtype='object')
```

**`nrows` — load only the first N rows**

Useful for inspecting a large file without loading the whole thing.

```python
# Just peek at the first 5 rows
df = pd.read_csv('data/orders.csv', nrows=5)
```

**`dtype` — override type inference**

pandas infers column types automatically, but inference can be wrong. A column that contains mostly numbers but has one `"N/A"` string will be inferred as `object`. Specify dtypes explicitly to be safe.

```python
df = pd.read_csv(
    'data/orders.csv',
    dtype={
        'order_id': str,       # keep as string, not auto-converted
        'quantity': int,
        'unit_price': float,
    }
)
```

#### Examples

```python
import pandas as pd

# Full load with explicit dtypes
df = pd.read_csv(
    'data/orders.csv',
    dtype={
        'order_id': str,
        'quantity': int,
        'unit_price': float,
    }
)

print(f"Shape: {df.shape}")
print(f"\nColumns: {list(df.columns)}")
print(f"\nDtypes:\n{df.dtypes}")
print(f"\nFirst 3 rows:\n{df.head(3)}")
```

---

### Part 4: Dtype Specification (9 minutes)

#### Explanation

Type inference is one of the most common sources of subtle bugs when loading CSV files. pandas examines the values in each column and guesses the type. This works most of the time, but fails in predictable ways:

| Situation | pandas infers | You probably want |
|-----------|--------------|-------------------|
| Column with `1`, `2`, `3` | `int64` | Usually correct |
| Column with `1.5`, `2.3` | `float64` | Usually correct |
| Column with `1`, `2`, `""` | `float64` (coerces int to float for NaN) | May want `Int64` (nullable int) |
| Column with `1200`, `N/A`, `750` | `object` (string) | `float64` after handling N/A |
| Column with `2024-01-15` | `object` (string) | `datetime64` — use `parse_dates` |

**Rule:** For any column you will compute with (filter, sum, compare), verify its dtype after loading.

```python
import pandas as pd

df = pd.read_csv('data/orders.csv')

# Always check dtypes immediately after loading
print(df.dtypes)
# order_id       object
# customer       object
# product        object
# category       object
# quantity        int64
# unit_price    float64
# order_date     object   <-- this is a string, not a date!
# region         object
```

---

## Practice

<PracticeBlock
  prompt="Load the bundled orders dataset using pd.read_csv('data/orders.csv'). Print the shape, the first 3 rows using head(3), and the dtypes of all columns."
  initialCode={`import pandas as pd

df = pd.read_csv('data/orders.csv')
# Print shape, first 3 rows, and dtypes
`}
  hint="Use df.shape, df.head(3), and df.dtypes — three separate print() calls."
  solution={`import pandas as pd

df = pd.read_csv('data/orders.csv')

print("Shape:", df.shape)
print()
print("First 3 rows:")
print(df.head(3))
print()
print("Dtypes:")
print(df.dtypes)
`}
/>

<PracticeBlock
  prompt="Load only the 'customer', 'product', and 'unit_price' columns from orders.csv using the usecols parameter. Print the result."
  initialCode={`import pandas as pd

# Use usecols to load only 3 columns
df = pd.read_csv('data/orders.csv', usecols=___)
print(df)
`}
  hint="Pass a list of column name strings to usecols: usecols=['col1', 'col2', 'col3']"
  solution={`import pandas as pd

df = pd.read_csv(
    'data/orders.csv',
    usecols=['customer', 'product', 'unit_price']
)
print(df)
`}
/>

---

## Key Takeaways

- CSV is universal but has no schema — pandas must infer types
- `pd.read_csv()` returns a DataFrame; minimum usage is just the filepath
- `sep` handles pipe-delimited and tab-delimited files
- `usecols` reduces memory by loading only the columns you need
- `nrows` is useful for peeking at large files before full load
- `dtype` prevents type inference surprises — specify types for columns you will compute with
- Always check `df.dtypes` immediately after loading a CSV

---

## Common Mistakes

- **Not checking dtypes after load.** Date columns often load as `object` (string). Verify before doing date arithmetic.
- **Forgetting `usecols` on large files.** A 100-column dataset where you need 5 columns still loads all 100 by default.
- **Assuming the first row is always the header.** Some exported files have metadata rows above the actual column names.

---

## Next Lesson Preview

In **Lesson 2: CSV Options and Edge Cases**, we cover:
- Handling custom missing value markers with `na_values`
- Parsing date columns automatically with `parse_dates`
- Encoding issues and how to fix them
- Skipping metadata rows at the top or bottom of files

---

[Back to Section Overview](./README.md) | [Next Lesson: CSV Options and Edge Cases →](./lesson-02-csv-options-and-edge-cases.md)
