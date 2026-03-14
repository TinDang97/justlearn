# Lesson 2: CSV Options and Edge Cases

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Handle custom missing value markers using `na_values`
- Parse date columns automatically on load using `parse_dates`
- Fix encoding errors caused by non-UTF-8 characters
- Skip bad lines and metadata rows in malformed CSV files

---

## Prerequisites

- Lesson 1: Reading CSV Files with pandas

---

## Lesson Outline

### Part 1: Handling Missing Values (8 minutes)

#### Explanation

Real CSV files rarely use clean, consistent `""` (empty cell) to indicate missing data. Depending on the system that exported the data, you might see:

- `N/A`
- `NA`
- `null`
- `NULL`
- `None`
- `missing`
- `-`
- `0` (zero used as a sentinel value — dangerous)

pandas recognizes a built-in set of strings as NaN by default: `''`, `'NA'`, `'N/A'`, `'NaN'`, `'null'`, `'NULL'`, `'None'`, `'n/a'`, `'nan'`. But any value outside this list will be loaded as a string, not as NaN.

**The `na_values` parameter** lets you extend this list:

```python
import pandas as pd

df = pd.read_csv(
    'data/report.csv',
    na_values=['missing', 'MISSING', '-', 'unknown', '?']
)
```

Now any cell containing those strings will become `NaN` in the resulting DataFrame.

**Keep defaults while adding custom values:**

```python
# keep_default_na=True (the default) — extend the built-in list
df = pd.read_csv('data/report.csv', na_values=['missing', '-'])

# keep_default_na=False — only use your custom list (disables built-in NA markers)
df = pd.read_csv('data/report.csv', na_values=['missing'], keep_default_na=False)
```

<Warning>
Always inspect dtypes after loading a CSV. pandas may silently load numeric columns as strings if they contain even one non-numeric value. A column with mostly numbers but one "N/A" cell will be inferred as `object` unless you specify `na_values` so pandas converts it properly.
</Warning>

---

### Part 2: Date Parsing (8 minutes)

#### Explanation

CSV files store everything as text. A date like `2024-01-15` is just the string `"2024-01-15"` — pandas does not know it is a date unless you tell it.

Without date parsing:
```python
df = pd.read_csv('data/orders.csv')
print(df['order_date'].dtype)   # object (string)
print(df['order_date'] + pd.Timedelta(days=1))  # TypeError!
```

**`parse_dates` parameter** — pass a list of column names to parse as datetime:

```python
df = pd.read_csv('data/orders.csv', parse_dates=['order_date'])
print(df['order_date'].dtype)   # datetime64[ns]
print(df['order_date'].dt.year) # now you can extract year, month, day
```

pandas automatically recognizes common date formats: `YYYY-MM-DD`, `MM/DD/YYYY`, `DD-MM-YYYY`, and ISO 8601 variants.

**When the format is non-standard**, use `pd.to_datetime()` after loading instead:

```python
df = pd.read_csv('data/orders.csv')
df['order_date'] = pd.to_datetime(df['order_date'], format='%d/%m/%Y')
```

---

### Part 3: Encoding Issues (8 minutes)

#### Explanation

Text files have an **encoding** — a mapping between characters and bytes. The most common encoding today is **UTF-8**, which handles virtually every character in every language.

The problem: files exported from Windows applications (especially older Excel versions) often use **Latin-1** (also called ISO-8859-1 or cp1252). Latin-1 encodes accented characters like `é`, `ñ`, `ü` differently from UTF-8. When you try to read a Latin-1 file as UTF-8, you get a `UnicodeDecodeError`.

```python
# This fails with UnicodeDecodeError if file is Latin-1
df = pd.read_csv('data/europe_sales.csv')

# Fix: specify the correct encoding
df = pd.read_csv('data/europe_sales.csv', encoding='latin-1')
# or equivalently:
df = pd.read_csv('data/europe_sales.csv', encoding='iso-8859-1')
df = pd.read_csv('data/europe_sales.csv', encoding='cp1252')
```

**Finding the right encoding:**

```python
# Option 1: Try latin-1 first — it almost always works for Western European text
df = pd.read_csv('data/file.csv', encoding='latin-1')

# Option 2: Use the chardet library to detect encoding
import chardet
with open('data/file.csv', 'rb') as f:
    result = chardet.detect(f.read())
print(result['encoding'])   # e.g., 'ISO-8859-1'
```

**Best practice:** Always export or receive files as UTF-8 when you control the process. Encoding issues are a common source of silent data corruption.

---

### Part 4: Malformed CSVs (8 minutes)

#### Explanation

Production CSV files are often imperfect. Common issues:

**Extra columns in some rows** — a row has more values than the header specifies. This can happen when unquoted commas appear in a field.

In pandas 2.x, `on_bad_lines` controls the behavior:
- `'error'` (default) — raise an error on bad lines
- `'warn'` — print a warning and skip bad lines
- `'skip'` — silently skip bad lines

```python
df = pd.read_csv('data/messy.csv', on_bad_lines='skip')
```

<Warning>
`error_bad_lines` and `warn_bad_lines` were removed in pandas 2.0. Use `on_bad_lines='skip'` or `on_bad_lines='warn'` instead.
</Warning>

**Quoting** — the `quoting` parameter controls how quoted fields are handled. The default (`csv.QUOTE_MINIMAL`) works for standard CSVs. Use `csv.QUOTE_NONE` for files that have no quoting at all.

```python
import csv
df = pd.read_csv('data/raw.csv', quoting=csv.QUOTE_NONE, escapechar='\\')
```

---

### Part 5: skiprows and skipfooter (8 minutes)

#### Explanation

Exported reports often include metadata rows above or below the actual data:

```
Report generated: 2024-01-15
Source: Sales System v3.2
                                       <- blank line
order_id,customer,product,quantity    <- actual headers start here
O001,Alice,Laptop,1
O002,Bob,Mouse,2
                                       <- blank line
Total records: 2                       <- footer metadata
```

**`skiprows`** — skip rows at the top before reading:

```python
# Skip 3 rows of metadata at the top
df = pd.read_csv('data/report.csv', skiprows=3)

# Skip specific row indices (0-based)
df = pd.read_csv('data/report.csv', skiprows=[0, 1, 3])  # skip rows 0, 1, and 3
```

**`skipfooter`** — skip rows at the bottom:

```python
# Skip 2 footer rows
df = pd.read_csv('data/report.csv', skipfooter=2, engine='python')
# Note: skipfooter requires engine='python' (not the default C engine)
```

---

## Practice

<PracticeBlock
  prompt="Load orders.csv with parse_dates=['order_date']. Print the dtype of the order_date column and verify it is datetime64, not object. Then print the earliest and latest order dates."
  initialCode={`import pandas as pd

df = pd.read_csv('data/orders.csv', parse_dates=___)

print("order_date dtype:", df['order_date'].dtype)
# Print min and max dates
`}
  hint="Use df['order_date'].min() and df['order_date'].max() to find the date range."
  solution={`import pandas as pd

df = pd.read_csv('data/orders.csv', parse_dates=['order_date'])

print("order_date dtype:", df['order_date'].dtype)
print("Earliest order:", df['order_date'].min())
print("Latest order:", df['order_date'].max())
`}
/>

<PracticeBlock
  prompt="Use io.StringIO to create a small in-memory CSV string that has 'N/A' and 'missing' as missing value markers. Load it with pd.read_csv() using na_values to convert both markers to NaN. Verify with isnull().sum()."
  initialCode={`import pandas as pd
import io

csv_data = """name,score,grade
Alice,95,A
Bob,N/A,missing
Charlie,78,B
Diana,missing,C"""

df = pd.read_csv(io.StringIO(csv_data), na_values=___)
print(df)
print()
print("Missing values per column:")
print(df.isnull().sum())
`}
  hint="Pass a list to na_values: na_values=['N/A', 'missing']"
  solution={`import pandas as pd
import io

csv_data = """name,score,grade
Alice,95,A
Bob,N/A,missing
Charlie,78,B
Diana,missing,C"""

df = pd.read_csv(io.StringIO(csv_data), na_values=['N/A', 'missing'])
print(df)
print()
print("Missing values per column:")
print(df.isnull().sum())
`}
/>

---

## Key Takeaways

- `na_values` extends the list of strings pandas treats as NaN on load
- `parse_dates=['col']` converts string date columns to `datetime64` at load time — always preferred over post-load conversion
- Encoding errors (`UnicodeDecodeError`) on Windows-exported files are fixed with `encoding='latin-1'`
- `on_bad_lines='skip'` silently discards rows with the wrong number of fields (pandas 2.x+)
- `skiprows=N` and `skipfooter=N` remove metadata rows above and below the data

---

## Common Mistakes

- **Ignoring encoding errors.** A `UnicodeDecodeError` is never "just a warning" — it means some rows were not read correctly.
- **Using deprecated `error_bad_lines`.** It was removed in pandas 2.0. Use `on_bad_lines='skip'` instead.
- **Forgetting `engine='python'` with `skipfooter`.** The default C engine does not support `skipfooter` and will raise an error.

---

## Next Lesson Preview

In **Lesson 3: Reading JSON Files**, we cover:
- Why JSON is the dominant format for web APIs and event logs
- `pd.read_json()` for loading flat arrays of objects
- The `orient` parameter and when it matters

---

[Back to Section Overview](./README.md) | [Next Lesson: Reading JSON Files →](./lesson-03-reading-json-files.md)
