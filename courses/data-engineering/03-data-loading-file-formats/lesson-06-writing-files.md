# Lesson 6: Writing DataFrames to Files

**Course:** Data Engineering | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Write a DataFrame to CSV with `to_csv()` and avoid the index trap
- Write JSON and JSON Lines format with `to_json()`
- Write Excel files with `to_excel()`
- Use `pathlib.Path` for cross-platform file paths in pipelines

---

## Prerequisites

- Lesson 1: Reading CSV Files
- Lesson 3: Reading JSON Files

---

## Lesson Outline

### Part 1: Writing CSV with `to_csv()` (8 minutes)

#### Explanation

`DataFrame.to_csv()` writes a DataFrame to a CSV file. The call mirrors `pd.read_csv()` in its parameters.

```python
import pandas as pd

df = pd.read_csv('data/orders.csv')
df.to_csv('data/orders_copy.csv')
```

This works, but it has a trap.

**The index trap:**

By default, `to_csv()` writes the DataFrame's integer index as a column named `Unnamed: 0`:

```
Unnamed: 0,order_id,customer,product,...
0,O001,Alice,Laptop,...
1,O002,Bob,Mouse,...
```

When you read this file back later, you get an extra column `Unnamed: 0` that you never intended. This is one of the most common pandas mistakes.

**Fix: always pass `index=False`:**

```python
df.to_csv('data/orders_export.csv', index=False)
```

<Tip>
Always write CSV with `index=False`. Writing the default integer index creates a spurious `Unnamed: 0` column on the next read. Make `index=False` your muscle memory.
</Tip>

**Other useful parameters:**

```python
df.to_csv(
    'data/output.csv',
    index=False,
    sep='|',           # pipe-delimited
    encoding='utf-8',  # always explicit for portability
    na_rep='',         # how to represent NaN (empty string is standard)
)
```

---

### Part 2: Writing JSON with `to_json()` (10 minutes)

#### Explanation

`DataFrame.to_json()` writes JSON output. The most important parameter is `orient`, which controls the JSON shape.

**`orient='records'`** — array of objects (standard REST API format):

```python
df.to_json('data/orders.json', orient='records', indent=2)
```

Output:
```json
[
  {"order_id": "O001", "customer": "Alice", "product": "Laptop"},
  {"order_id": "O002", "customer": "Bob", "product": "Mouse"}
]
```

**JSON Lines format — the pipeline standard:**

JSON Lines (`.jsonl` or `.ndjson`) writes one JSON object per line, with no enclosing array. This format is preferred in data pipelines because:
- Files can be appended to without rewriting the entire structure
- Streaming readers can process one line at a time without loading the full file
- Widely supported by cloud services (S3 Select, BigQuery, Kinesis)

```python
df.to_json('data/orders.jsonl', orient='records', lines=True)
```

Output:
```
{"order_id":"O001","customer":"Alice","product":"Laptop"}
{"order_id":"O002","customer":"Bob","product":"Mouse"}
```

**Reading JSON Lines back:**

```python
df = pd.read_json('data/orders.jsonl', lines=True)
```

**`orient='split'`** — preserves exact dtypes for pandas-to-pandas round trips:

```python
# Write
df.to_json('data/checkpoint.json', orient='split')

# Read back with exact same dtypes
df = pd.read_json('data/checkpoint.json', orient='split')
```

---

### Part 3: Writing Excel with `to_excel()` (8 minutes)

#### Explanation

`DataFrame.to_excel()` writes a DataFrame to an Excel file. `openpyxl` must be installed (pre-installed in this course environment).

```python
df.to_excel('data/orders_report.xlsx', sheet_name='Orders', index=False)
```

**Writing multiple sheets:**

Use `pd.ExcelWriter` as a context manager to write multiple DataFrames to different sheets in the same file:

```python
import pandas as pd

orders = pd.read_csv('data/orders.csv')
electronics = orders[orders['category'] == 'Electronics']
accessories = orders[orders['category'] == 'Accessories']

with pd.ExcelWriter('data/orders_by_category.xlsx', engine='openpyxl') as writer:
    electronics.to_excel(writer, sheet_name='Electronics', index=False)
    accessories.to_excel(writer, sheet_name='Accessories', index=False)
```

This is the correct way to write multi-sheet Excel — opening the file separately for each sheet would overwrite previous sheets.

---

### Part 4: File Path Best Practices (9 minutes)

#### Explanation

Hard-coded string paths like `'data/orders.csv'` work on your machine but can fail on Windows (which uses backslashes) or when paths change. The `pathlib.Path` class provides cross-platform path handling.

```python
from pathlib import Path
import pandas as pd

# Build paths from components — works on all OS
data_dir = Path('data')
input_path = data_dir / 'orders.csv'
output_path = data_dir / 'orders_export.csv'

df = pd.read_csv(input_path)
df.to_csv(output_path, index=False)
```

**Create parent directories if needed:**

```python
output_path = Path('output') / 'processed' / 'orders.csv'
output_path.parent.mkdir(parents=True, exist_ok=True)  # create output/processed/
df.to_csv(output_path, index=False)
```

**Check if file exists before loading:**

```python
input_path = Path('data/orders.csv')
if not input_path.exists():
    raise FileNotFoundError(f"Dataset not found: {input_path}")
df = pd.read_csv(input_path)
```

For simple local exercises, string paths like `'data/orders.csv'` are fine. In production pipelines, use `pathlib.Path`.

---

## Practice

<PracticeBlock
  prompt="Load orders.csv, add a 'total_price' column (quantity * unit_price), write the result to 'data/orders_with_total.csv' with index=False, then read it back and print the new column."
  initialCode={`import pandas as pd

df = pd.read_csv('data/orders.csv')

# Add total_price column
df['total_price'] = ___

# Write to CSV without the index
df.to_csv('data/orders_with_total.csv', ___)

# Read it back and verify
df_loaded = pd.read_csv('data/orders_with_total.csv')
print("Columns:", list(df_loaded.columns))
print(df_loaded[['order_id', 'quantity', 'unit_price', 'total_price']])
`}
  hint="total_price = df['quantity'] * df['unit_price']. Pass index=False to to_csv()."
  solution={`import pandas as pd

df = pd.read_csv('data/orders.csv')

# Add total_price column
df['total_price'] = df['quantity'] * df['unit_price']

# Write to CSV without the index
df.to_csv('data/orders_with_total.csv', index=False)

# Read it back and verify
df_loaded = pd.read_csv('data/orders_with_total.csv')
print("Columns:", list(df_loaded.columns))
print(df_loaded[['order_id', 'quantity', 'unit_price', 'total_price']])
`}
/>

<PracticeBlock
  prompt="Write the orders DataFrame (with total_price column) as JSON Lines format using orient='records' and lines=True, then read it back with pd.read_json(lines=True) and print the first 3 rows."
  initialCode={`import pandas as pd

df = pd.read_csv('data/orders.csv')
df['total_price'] = df['quantity'] * df['unit_price']

# Write as JSON Lines
df.to_json('data/orders.jsonl', orient=___, lines=___)

# Read back JSON Lines
df_json = pd.read_json('data/orders.jsonl', lines=___)
print(df_json.head(3))
`}
  hint="Use orient='records', lines=True for writing. Use lines=True for reading."
  solution={`import pandas as pd

df = pd.read_csv('data/orders.csv')
df['total_price'] = df['quantity'] * df['unit_price']

# Write as JSON Lines
df.to_json('data/orders.jsonl', orient='records', lines=True)

# Read back JSON Lines
df_json = pd.read_json('data/orders.jsonl', lines=True)
print(df_json.head(3))
`}
/>

---

## Key Takeaways

- `to_csv(index=False)` is mandatory — omitting `index=False` creates a spurious `Unnamed: 0` column on the next read
- `to_json(orient='records', lines=True)` produces JSON Lines format — preferred for pipelines over standard JSON arrays
- `to_excel(sheet_name=..., index=False)` writes Excel; use `ExcelWriter` context manager for multi-sheet files
- `pathlib.Path` handles cross-platform paths cleanly in production code

---

## Common Mistakes

- **Forgetting `index=False` on `to_csv()`.** This is the single most common pandas mistake. The extra index column causes confusion on every subsequent load.
- **Writing multi-sheet Excel by opening the file multiple times.** Each open-write-close cycle overwrites the previous content. Use `ExcelWriter` context manager.
- **Using string concatenation for file paths.** `'data/' + 'file.csv'` fails on Windows. Use `pathlib.Path` or `os.path.join()`.

---

## Next Lesson Preview

In **Lesson 7: The Parquet Format**, we cover:
- What columnar storage is and why it beats CSV for analytics
- `pd.read_parquet()` and `to_parquet()`
- Parquet's role in modern data lakes and cloud analytics

---

[Back to Section Overview](./README.md) | [Next Lesson: The Parquet Format →](./lesson-07-parquet-format.md)
