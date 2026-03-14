# Course 3: Data Loading & File Formats

**Course:** Data Engineering | **Level:** Intermediate | **Lessons:** 10

---

## Overview

Section 3 transitions students from constructing DataFrames by hand to loading real-world files. Every data engineering pipeline begins with ingestion — reading data from CSV files, JSON APIs, Excel spreadsheets, or Parquet data lakes. This section covers the full spectrum of formats you will encounter in production work.

By the end of this section, you can load any of the four primary formats, handle common edge cases (encoding issues, nested structures, large files), write data back to disk in the right format for each use case, and apply a repeatable inspection workflow to any new dataset.

---

## Lessons

| # | Lesson | Duration | Topics |
|---|--------|----------|--------|
| 01 | [Reading CSV Files](./lesson-01-reading-csv-files.md) | 45 min | `pd.read_csv()`, sep, header, usecols, nrows, dtype |
| 02 | [CSV Options and Edge Cases](./lesson-02-csv-options-and-edge-cases.md) | 40 min | na_values, parse_dates, encoding, on_bad_lines, skiprows |
| 03 | [Reading JSON Files](./lesson-03-reading-json-files.md) | 40 min | `pd.read_json()`, orient parameter, flat arrays |
| 04 | [Flattening Nested JSON](./lesson-04-normalizing-json.md) | 45 min | `pd.json_normalize()`, record_path, meta, sep |
| 05 | [Reading Excel Files](./lesson-05-reading-excel-files.md) | 40 min | `pd.read_excel()`, sheet_name, multi-sheet workbooks |
| 06 | [Writing DataFrames to Files](./lesson-06-writing-files.md) | 35 min | to_csv, to_json, to_excel, JSON Lines format |
| 07 | [The Parquet Format](./lesson-07-parquet-format.md) | 45 min | Columnar storage, read_parquet, to_parquet, compression |
| 08 | [Chunked Reading for Large Files](./lesson-08-chunked-reading.md) | 40 min | chunksize iterator, accumulation pattern, when to chunk |
| 09 | [Inspecting New Datasets](./lesson-09-inspecting-new-datasets.md) | 35 min | shape, dtypes, info, describe, value_counts, isnull |
| 10 | [Section Review: Data Loading](./lesson-10-section-review-loading.md) | 55 min | Format selection guide, integrated exercises |

---

## Bundled Datasets

Practice exercises in this section use two bundled datasets:

- **`data/orders.csv`** — 10 sales orders with customer, product, quantity, price, date, and region
- **`data/products.json`** — 6 products with nested specs (weight, warranty)

Both files are accessible from code as `pd.read_csv('data/orders.csv')` and `pd.read_json('data/products.json')`.

---

## Prerequisites

- Section 2: pandas DataFrames (creation, indexing, basic operations)
- Python fundamentals (loops, functions, data types)

---

## What You Will Be Able to Do

After completing Section 3, you will be able to:

- Load CSV, JSON, Excel, and Parquet files into pandas DataFrames
- Handle encoding issues, missing value markers, and malformed rows
- Flatten nested JSON structures for analysis
- Write DataFrames to disk in the appropriate format for each use case
- Process files larger than available RAM using chunked reading
- Apply a 7-step inspection workflow to any new dataset

---

[Back to Data Engineering Course](../README.md) | [Next Section: Data Cleaning →](../04-data-cleaning/lesson-01-detecting-missing-values.md)
