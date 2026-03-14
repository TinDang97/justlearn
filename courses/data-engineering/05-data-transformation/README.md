# Section 5: Data Transformation

**Course:** Data Engineering | **Lessons:** 10 | **Level:** Intermediate

---

This section covers the core data transformation skills every data engineer needs: reshaping, aggregating, and combining datasets using pandas. By the end of Section 5 you will be able to take raw data from multiple sources, join it together, summarize it, reshape it for reporting, and build reusable transformation pipelines.

## Lessons

| # | Title | Key Topics |
|---|-------|------------|
| 01 | [GroupBy Basics](./lesson-01-groupby-basics.md) | split-apply-combine, single/multi-key groupby, .agg(), named aggregations |
| 02 | [GroupBy Advanced](./lesson-02-groupby-advanced.md) | .transform(), .filter(), .apply(), time groupby, pd.Grouper |
| 03 | [Pivot Tables](./lesson-03-pivot-tables.md) | pd.pivot_table(), pd.crosstab(), normalize, margins, pd.pivot() |
| 04 | [Melt and Reshape](./lesson-04-melt-reshape.md) | pd.melt(), wide vs long format, stack(), unstack(), MultiIndex |
| 05 | [Merge/Join Basics](./lesson-05-merge-join-basics.md) | inner/left/right/outer joins, left_on/right_on, indicator=True, suffixes |
| 06 | [Merge/Join Advanced](./lesson-06-merge-join-advanced.md) | chained merges, pd.concat(), .join(), pd.merge_asof() |
| 07 | [Concat and Dedup](./lesson-07-concat-append.md) | concat patterns, schema alignment, drop_duplicates(), combine_first(), update() |
| 08 | [Window Functions](./lesson-08-window-functions.md) | rolling(), expanding(), ewm(), shift(), diff(), pct_change(), rank() |
| 09 | [Apply and Map](./lesson-09-apply-map-transform.md) | Series.map(), Series.apply(), DataFrame.apply(), np.where(), np.select() |
| 10 | [Mini-Project](./lesson-10-transformation-project.md) | Full transformation pipeline integrating all Section 5 concepts |

## Learning Path

```
Lesson 01: GroupBy Basics
     ↓
Lesson 02: GroupBy Advanced
     ↓
Lesson 03: Pivot Tables
     ↓
Lesson 04: Melt and Reshape
     ↓
Lesson 05: Merge/Join Basics
     ↓
Lesson 06: Merge/Join Advanced
     ↓
Lesson 07: Concat and Dedup
     ↓
Lesson 08: Window Functions
     ↓
Lesson 09: Apply and Map
     ↓
Lesson 10: Mini-Project (integrates all concepts)
```

## Prerequisites

- **Section 2: Pandas Fundamentals** — Series, DataFrames, selection, filtering, dtypes (required)
- **Section 4: Data Cleaning** — handling nulls, type casting, string ops (recommended)

## What You Will Build

By the end of this section you will have built a **sales transformation pipeline** that:
1. Merges a fact table with dimension tables (products, regions)
2. Aggregates to monthly revenue by region using groupby
3. Pivots to a wide-format reporting table
4. Computes month-over-month growth using window functions
5. Identifies the top product per region

All practice exercises use in-memory DataFrames runnable in the browser.

---

[← Section 4](../04-data-cleaning/README.md) | [Section 6 →](../06-etl-pipelines/README.md)
