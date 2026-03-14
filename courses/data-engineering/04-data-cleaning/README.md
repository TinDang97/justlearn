# Course 4: Data Cleaning

**Level:** Intermediate
**Duration:** 12 lessons x 30–60 minutes = ~8 hours total
**Prerequisites:** Section 3 (Data Loading & File Formats) + Python fundamentals

---

## Course Overview

Real-world data is always messy. In production data pipelines you will encounter missing values, duplicate records, inconsistent formatting, wrong data types, unparsed dates, and statistical outliers — often all in the same file. This section gives you the complete toolkit to identify and fix each category of data quality problem.

By the end of Section 4 you will be able to take any raw dataset and produce a clean, analysis-ready DataFrame. Every concept is taught using `sales_dirty.csv` — a realistic sales dataset with nine intentional quality issues built in.

---

## Lesson List

| # | Title | Key Topics | Duration |
|---|-------|------------|----------|
| 01 | Detecting Missing Values | isnull(), isna(), notna(), missing counts and percentages | 35 min |
| 02 | Handling Missing Values | dropna(), fillna(), ffill(), bfill(), interpolate(), strategy tradeoffs | 45 min |
| 03 | Detecting Duplicate Rows | duplicated(), keep parameter, subset-based checks | 30 min |
| 04 | Removing Duplicate Rows | drop_duplicates(), subset deduplication, verification | 30 min |
| 05 | Type Conversion Basics | astype(), pd.to_numeric(errors='coerce'), nullable Int64 | 40 min |
| 06 | Parsing and Working with Dates | pd.to_datetime(), format parameter, .dt accessor | 50 min |
| 07 | String Cleaning Fundamentals | str.strip(), str.lower(), str.title(), str.replace(), str.contains() | 40 min |
| 08 | String Methods: Extract, Split, Pad | str.split(), str.extract(), str.startswith(), str.len(), str.zfill() | 40 min |
| 09 | Detecting Outliers | IQR method, Z-score method, domain validation, flagging strategy | 40 min |
| 10 | Schema Validation Basics | Column presence, dtype validation, value range checks, validate_schema() | 35 min |
| 11 | Building a Cleaning Pipeline | Per-step functions, .pipe() method, composable clean_dataframe() | 55 min |
| 12 | Section Review: Data Cleaning | End-to-end cleaning of sales_dirty.csv, save to CSV and Parquet | 60 min |

---

## What You Will Learn

By the end of this section, you will be able to:

- Detect and count missing values using `isnull().sum()` and `isnull().mean()`
- Choose the right strategy for handling nulls: drop, fill with constant, fill with mean/median, or interpolate
- Identify and remove exact and logical duplicate rows using `duplicated()` and `drop_duplicates()`
- Convert column types safely using `.astype()`, `pd.to_numeric(errors='coerce')`, and nullable `Int64`
- Parse date strings with mixed formats using `pd.to_datetime()` and extract components with the `.dt` accessor
- Clean string columns with `.str.strip()`, `.str.lower()`, `.str.title()`, and `.str.replace()`
- Extract structured data from strings using `.str.split()` and `.str.extract()` with regex
- Detect statistical outliers using the IQR method and flag domain-logic violations
- Write a `validate_schema()` function that checks column presence, dtypes, and value ranges
- Compose individual cleaning steps into a reusable pipeline using `.pipe()`

---

## Bundled Dataset

This section uses `data/sales_dirty.csv` — a 13-row sales dataset with nine intentional quality issues:

1. Duplicate row (S002 appears twice)
2. Whitespace in customer names (`'  Bob Wilson  '`)
3. Inconsistent region casing (`'North'`, `'NORTH'`, `'north'`)
4. Missing revenue value (row S003)
5. Missing units value (row S008)
6. Negative revenue (row S007: `-89.00`)
7. Inconsistent date format (row S008: `'01/22/2024'` vs `'YYYY-MM-DD'`)
8. Inconsistent customer name casing (`'Alice Johnson'` vs `'alice johnson'`)
9. Units stored as float (`1.0`, `2.0`) instead of integer

---

## After This Section

Students who complete Section 4 are ready for:

- **Section 5:** Data Transformation — GroupBy aggregation, merge, reshape, and pivot operations on clean DataFrames

---

[Back to Course Overview](../README.md)
