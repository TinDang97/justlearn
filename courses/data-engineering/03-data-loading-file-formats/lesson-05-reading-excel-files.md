# Lesson 5: Reading Excel Files

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Explain why Excel files appear in data engineering pipelines
- Load a single Excel sheet into a DataFrame with `pd.read_excel()`
- Access specific sheets by name or index
- Load all sheets from a multi-sheet workbook into a dict of DataFrames
- Perform an in-memory Excel round-trip using `io.BytesIO`

---

## Prerequisites

- Lesson 1: Reading CSV Files with pandas

---

## Lesson Outline

### Part 1: Why Excel in Data Engineering (8 minutes)

#### Explanation

Excel files (`.xlsx`, `.xls`) are ubiquitous in business environments. As a data engineer, you will receive them from:

- **Finance teams** — budget files, expense reports, monthly P&L statements
- **HR systems** — headcount exports, payroll summaries
- **Legacy systems** — older ERP systems that export only to Excel
- **External vendors** — partners who deliver data in Excel format
- **Business analysts** — manually maintained lookup tables and configuration files

Even in organizations with modern data stacks, someone will always send you an Excel file. Knowing how to load it quickly is a core DE skill.

<Warning>
Excel files are not a good format for large datasets. They cap at approximately 1 million rows, are slow to load, and encode cell formatting alongside data (colors, borders, merged cells). Convert to CSV or Parquet for production pipelines. Use `pd.read_excel()` only at the ingestion boundary.
</Warning>

---

### Part 2: `pd.read_excel()` (12 minutes)

#### Explanation

`pd.read_excel()` loads an Excel file into a DataFrame. Its parameters mirror `pd.read_csv()` closely:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `io` | str or path | required | File path or file-like object |
| `sheet_name` | int or str | 0 | Which sheet to load (0-indexed int, or sheet name string) |
| `header` | int | 0 | Row to use as column headers |
| `usecols` | list | None | Load only specified columns |
| `nrows` | int | None | Load only first N rows |
| `dtype` | dict | None | Override type inference |
| `na_values` | list | None | Extra strings to treat as NaN |
| `skiprows` | int or list | None | Skip rows at top |
| `index_col` | int or str | None | Use column as row index |

**Basic usage:**

```python
import pandas as pd

# Load the first sheet (sheet index 0)
df = pd.read_excel('data/sales_report.xlsx')

# Load by sheet name
df = pd.read_excel('data/sales_report.xlsx', sheet_name='January')

# Load the second sheet (index 1)
df = pd.read_excel('data/sales_report.xlsx', sheet_name=1)
```

**Subset loading (same as CSV):**

```python
df = pd.read_excel(
    'data/sales_report.xlsx',
    sheet_name='Q1',
    usecols=['date', 'revenue', 'region'],
    nrows=100,
    parse_dates=['date']
)
```

---

### Part 3: Multi-Sheet Workbooks (10 minutes)

#### Explanation

A single `.xlsx` file can contain multiple sheets. To load all sheets at once, pass `sheet_name=None`:

```python
import pandas as pd

# Returns a dict: {sheet_name: DataFrame}
all_sheets = pd.read_excel('data/annual_report.xlsx', sheet_name=None)

print(type(all_sheets))     # dict
print(list(all_sheets.keys()))  # ['Q1', 'Q2', 'Q3', 'Q4']

# Access individual sheets
q1_df = all_sheets['Q1']
q2_df = all_sheets['Q2']
```

**Combining all sheets into one DataFrame:**

```python
import pandas as pd

all_sheets = pd.read_excel('data/annual_report.xlsx', sheet_name=None)

# Add a 'quarter' column to each sheet before combining
dfs = []
for sheet_name, df in all_sheets.items():
    df['quarter'] = sheet_name
    dfs.append(df)

combined = pd.concat(dfs, ignore_index=True)
print(combined.shape)
```

This pattern — iterate over sheets, tag with source, combine — is a standard DE pattern for multi-tab Excel files.

---

### Part 4: The openpyxl Dependency (10 minutes)

#### Explanation

`pd.read_excel()` does not read Excel files directly. It delegates to an **engine library**:

| Engine | Formats | Notes |
|--------|---------|-------|
| `openpyxl` | `.xlsx` | Default for xlsx; handles Excel 2010+ format |
| `xlrd` | `.xls` | Older Excel format (pre-2007); `xlrd` 2.x+ only supports `.xls` |
| `odf` | `.ods` | OpenDocument spreadsheet format |

For modern `.xlsx` files, `openpyxl` is required. Install it with:

```bash
uv add openpyxl
```

`openpyxl` is pre-installed in this course's environment — you do not need to install it for the practice block below.

**Specify the engine explicitly if needed:**

```python
df = pd.read_excel('data/report.xlsx', engine='openpyxl')
df = pd.read_excel('data/old_report.xls', engine='xlrd')
```

Pandas auto-detects the engine from the file extension, so explicit `engine=` is usually not needed.

---

## Practice

<PracticeBlock
  prompt="Create a small DataFrame, write it to an in-memory Excel buffer using BytesIO and to_excel(), then read it back with pd.read_excel(). This is the standard pattern for testing Excel pipelines without needing a real .xlsx file on disk."
  initialCode={`import pandas as pd
import io

# Step 1: Create a sample DataFrame
df_original = pd.DataFrame({
    'product': ['Laptop', 'Mouse', 'Keyboard'],
    'price': [1200.0, 25.0, 75.0],
    'in_stock': [True, True, False]
})

# Step 2: Write to an in-memory Excel buffer
buffer = io.BytesIO()
df_original.to_excel(buffer, index=False)
buffer.seek(0)  # rewind the buffer to the start

# Step 3: Read it back
df_loaded = pd.read_excel(___)

print("Original:")
print(df_original)
print()
print("Loaded back from Excel buffer:")
print(df_loaded)
print()
print("Dtypes match:", list(df_original.dtypes) == list(df_loaded.dtypes))
`}
  hint="Pass buffer (the BytesIO object) as the first argument to pd.read_excel()."
  solution={`import pandas as pd
import io

# Step 1: Create a sample DataFrame
df_original = pd.DataFrame({
    'product': ['Laptop', 'Mouse', 'Keyboard'],
    'price': [1200.0, 25.0, 75.0],
    'in_stock': [True, True, False]
})

# Step 2: Write to an in-memory Excel buffer
buffer = io.BytesIO()
df_original.to_excel(buffer, index=False)
buffer.seek(0)  # rewind to start before reading

# Step 3: Read it back
df_loaded = pd.read_excel(buffer)

print("Original:")
print(df_original)
print()
print("Loaded back from Excel buffer:")
print(df_loaded)
print()
print("Shapes match:", df_original.shape == df_loaded.shape)
`}
/>

---

## Key Takeaways

- `pd.read_excel()` loads Excel files; most parameters mirror `pd.read_csv()`
- `sheet_name=0` loads the first sheet (default); use a string for named sheets
- `sheet_name=None` returns a `{name: DataFrame}` dict — iterate to process multi-sheet workbooks
- `openpyxl` is the required engine for modern `.xlsx` files
- Use `io.BytesIO` for in-memory Excel round-trips in tests and pipelines

---

## Common Mistakes

- **Not installing openpyxl.** `pd.read_excel()` silently fails or gives cryptic errors without it.
- **Assuming all sheets have the same schema.** Multi-sheet workbooks often have varying columns — always inspect each sheet before combining.
- **Using Excel for large data.** Files over a few hundred thousand rows load slowly. Convert to CSV or Parquet as the first step in any pipeline that receives large Excel files.

---

## Next Lesson Preview

In **Lesson 6: Writing DataFrames to Files**, we cover:
- Writing CSV with `to_csv()` — the `index=False` trap
- Writing JSON Lines format for pipelines
- Writing Excel with `to_excel()`
- File path best practices with `pathlib.Path`

---

[Back to Section Overview](./README.md) | [Next Lesson: Writing DataFrames to Files →](./lesson-06-writing-files.md)
