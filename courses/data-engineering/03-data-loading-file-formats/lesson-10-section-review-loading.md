# Lesson 10: Section Review — Data Loading

**Course:** Data Engineering | **Duration:** 55 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Select the right file format for any data engineering task using the decision guide
- Load, transform, and write data using the complete Section 3 toolkit
- Combine CSV, JSON, Parquet, and inspection skills in integrated workflows

---

## Prerequisites

- Lessons 1-9 of this section

---

## Lesson Outline

### Part 1: Quick Reference — Format Summary (8 minutes)

#### File Format Cheat Sheet

| Format | Read function | Write function | Key parameters | Best for |
|--------|--------------|----------------|----------------|----------|
| CSV | `pd.read_csv()` | `df.to_csv()` | sep, parse_dates, usecols, na_values, on_bad_lines | Universal exchange, human-readable |
| JSON (flat) | `pd.read_json()` | `df.to_json()` | orient, lines | REST APIs, web data |
| JSON (nested) | `pd.json_normalize()` | — | record_path, meta, sep | API responses with nested objects |
| Excel | `pd.read_excel()` | `df.to_excel()` | sheet_name, usecols | Finance, HR, legacy systems |
| Parquet | `pd.read_parquet()` | `df.to_parquet()` | columns, engine | Data lakes, pipelines, large analytics |

#### Common gotchas at a glance

| Gotcha | Fix |
|--------|-----|
| `to_csv()` creates `Unnamed: 0` on next load | Always pass `index=False` |
| Date columns load as `object` from CSV | Pass `parse_dates=['col_name']` |
| `UnicodeDecodeError` on CSV load | Pass `encoding='latin-1'` |
| `json_normalize()` TypeError | Pass a list of dicts, not a DataFrame |
| `on_bad_lines` parameter not found | Use pandas 2.x+ syntax (removed `error_bad_lines`) |
| `skipfooter` error | Add `engine='python'` |
| `pd.read_parquet()` import error | Install pyarrow: `uv add pyarrow` |

---

### Part 2: Format Selection Guide (10 minutes)

#### Decision Tree

Use this decision tree to pick the right format for any situation:

```
Is the data coming from a web API or HTTP endpoint?
  YES → JSON. Use pd.read_json() with orient='records'
  NO  → continue

Is the data coming from Excel (finance, HR, legacy system)?
  YES → Excel. Use pd.read_excel(). Convert to Parquet for pipeline output.
  NO  → continue

Is the data going into a data lake, warehouse, or will it be queried repeatedly?
  YES → Parquet. Use to_parquet() for output. Read back with read_parquet().
  NO  → continue

Does the destination need maximum compatibility (non-technical users, Excel, external partners)?
  YES → CSV. Use to_csv(index=False).
  NO  → Parquet (default for internal pipelines)
```

**Practical defaults:**
- Receiving data from external sources: accept any format, convert to Parquet immediately
- Sending data to non-technical recipients: CSV
- Internal pipeline intermediate files: Parquet
- Debugging / human inspection: CSV (open in any editor)
- API responses: JSON with `orient='records'`

---

### Part 3: Integrated Review Exercises (37 minutes)

The following three exercises combine the tools from across this section.

---

<PracticeBlock
  prompt="Exercise 1: Load orders.csv with parse_dates=['order_date'], add a 'total_price' column (quantity * unit_price), then save the result to Parquet at 'data/orders_enriched.parquet'. Read it back and confirm that order_date is still datetime64 and total_price exists."
  initialCode={`import pandas as pd

# Step 1: Load CSV with date parsing
df = pd.read_csv('data/orders.csv', parse_dates=___)

# Step 2: Add total_price column
df['total_price'] = ___

print("After enrichment:")
print(df[['order_id', 'order_date', 'quantity', 'unit_price', 'total_price']].head(3))
print("order_date dtype:", df['order_date'].dtype)

# Step 3: Save to Parquet
df.to_parquet(___, index=False)

# Step 4: Read back and verify
df_loaded = pd.read_parquet(___)
print("\\nLoaded from Parquet:")
print("order_date dtype:", df_loaded['order_date'].dtype)
print("Columns:", list(df_loaded.columns))
`}
  hint="parse_dates=['order_date'], total_price = df['quantity'] * df['unit_price'], path is 'data/orders_enriched.parquet'"
  solution={`import pandas as pd

# Step 1: Load CSV with date parsing
df = pd.read_csv('data/orders.csv', parse_dates=['order_date'])

# Step 2: Add total_price column
df['total_price'] = df['quantity'] * df['unit_price']

print("After enrichment:")
print(df[['order_id', 'order_date', 'quantity', 'unit_price', 'total_price']].head(3))
print("order_date dtype:", df['order_date'].dtype)  # datetime64

# Step 3: Save to Parquet
df.to_parquet('data/orders_enriched.parquet', index=False)

# Step 4: Read back and verify
df_loaded = pd.read_parquet('data/orders_enriched.parquet')
print("\\nLoaded from Parquet:")
print("order_date dtype:", df_loaded['order_date'].dtype)  # still datetime64
print("Columns:", list(df_loaded.columns))
print("total_price sample:", df_loaded['total_price'].tolist()[:3])
`}
/>

<PracticeBlock
  prompt="Exercise 2: Load products.json, use pd.json_normalize() to flatten the 'specs' nested dict, filter to only in-stock products, then save the result to 'data/products_flat.csv' with index=False."
  initialCode={`import pandas as pd
import json

# Step 1: Load raw JSON as a Python list
with open('data/products.json') as f:
    products = json.load(f)

# Step 2: Normalize (flatten nested specs dict)
df = pd.json_normalize(___)
print("Columns after normalize:", df.columns.tolist())

# Step 3: Filter to in-stock products only
df_in_stock = df[df['in_stock'] == ___]
print(f"\\nIn-stock products: {len(df_in_stock)}")
print(df_in_stock[['name', 'price', 'specs.weight_kg', 'specs.warranty_years']])

# Step 4: Save to CSV without index
df_in_stock.to_csv(___, index=___)
print("\\nSaved to data/products_flat.csv")
`}
  hint="json_normalize(products), filter by in_stock == True, save to 'data/products_flat.csv' with index=False"
  solution={`import pandas as pd
import json

# Step 1: Load raw JSON as a Python list
with open('data/products.json') as f:
    products = json.load(f)

# Step 2: Normalize (flatten nested specs dict)
df = pd.json_normalize(products)
print("Columns after normalize:", df.columns.tolist())

# Step 3: Filter to in-stock products only
df_in_stock = df[df['in_stock'] == True]
print(f"\\nIn-stock products: {len(df_in_stock)}")
print(df_in_stock[['name', 'price', 'specs.weight_kg', 'specs.warranty_years']])

# Step 4: Save to CSV without index
df_in_stock.to_csv('data/products_flat.csv', index=False)
print("\\nSaved to data/products_flat.csv")
`}
/>

<PracticeBlock
  prompt="Exercise 3: Load orders.csv in chunks of 4, then compute the total revenue (sum of quantity * unit_price) per region by accumulating partial results across chunks. Print the final totals sorted by revenue descending."
  initialCode={`import pandas as pd

# Accumulator: region -> total revenue
region_revenue = {}

for chunk in pd.read_csv('data/orders.csv', chunksize=___):
    # For each row, compute row revenue and add to region total
    for _, row in chunk.iterrows():
        region = row['region']
        revenue = row['quantity'] * row['unit_price']
        region_revenue[region] = region_revenue.get(region, 0) + ___

# Convert to Series and sort descending
result = pd.Series(region_revenue, name='total_revenue').sort_values(ascending=___)
print("Total revenue per region:")
print(result)
`}
  hint="chunksize=4, add revenue to accumulator, sort_values(ascending=False)"
  solution={`import pandas as pd

# Accumulator: region -> total revenue
region_revenue = {}

for chunk in pd.read_csv('data/orders.csv', chunksize=4):
    for _, row in chunk.iterrows():
        region = row['region']
        revenue = row['quantity'] * row['unit_price']
        region_revenue[region] = region_revenue.get(region, 0) + revenue

# Convert to Series and sort descending
result = pd.Series(region_revenue, name='total_revenue').sort_values(ascending=False)
print("Total revenue per region:")
print(result)
`}
/>

---

### Part 4: What Section 4 Covers (5 minutes)

#### What Comes Next

You now know how to load data from any common format. The next challenge is that real data is almost never clean:

- **Missing values** — NaN in places you do not expect
- **Duplicate rows** — from system retries, joins gone wrong, or bad exports
- **Type errors** — columns with mixed types (strings mixed into numeric columns)
- **Inconsistent strings** — `"New York"`, `"new york"`, `"NY"`, `"New York City"` all meaning the same thing
- **Outliers** — values that are technically present but statistically extreme

Section 4 — **Data Cleaning** — covers all of this systematically. You will learn to detect, diagnose, and fix every category of data quality issue using pandas.

Loading gets you the data. Cleaning makes it usable.

---

## Key Takeaways

- CSV is the universal format; always use `index=False` on write
- JSON is the default for web APIs; `orient='records'` for flat arrays, `json_normalize()` for nested
- Parquet is the pipeline standard — preserves schema, compresses well, supports column pruning
- Excel appears at the boundary of business systems; convert to Parquet or CSV for internal use
- The inspection workflow (7 steps) should precede every transformation
- Chunking solves the memory problem for large CSV files; the accumulation pattern collects partial results

---

## Section 3 Summary

You completed Section 3: Data Loading & File Formats. You can now:

- Load CSV with full control over separators, types, encoding, missing values, and date parsing
- Load JSON (flat and nested), flatten nested structures with `json_normalize()`
- Load Excel from single and multi-sheet workbooks
- Write DataFrames to CSV, JSON Lines, Excel, and Parquet
- Process files too large for memory using `chunksize` and the accumulation pattern
- Apply a 7-step inspection checklist to any new dataset
- Choose the right file format for any data engineering scenario

---

[Back to Course Overview](./README.md) | [Next Section: Data Cleaning →](../04-data-cleaning/lesson-01-detecting-missing-values.md)
