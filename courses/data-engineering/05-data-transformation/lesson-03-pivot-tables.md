# Lesson 3: Pivot Tables — Cross-Tabulation and Summarization

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Create pivot tables with `pd.pivot_table()`
- Use `pd.crosstab()` for frequency tables
- Understand index, columns, values, and aggfunc parameters
- Add margins (subtotals) to pivot tables
- Use `pd.pivot()` for reshaping without aggregation

---

## Prerequisites

- Lesson 1-2: GroupBy (aggregation patterns)
- pandas DataFrame selection and indexing

---

## Lesson Outline

### Part 1: pd.pivot_table() Fundamentals (30 minutes)

#### Explanation

A pivot table rearranges a "long" DataFrame into a "wide" summary table. You define:
- **index** — which column becomes the row labels
- **columns** — which column's values become column headers
- **values** — which column to aggregate
- **aggfunc** — how to aggregate (default is mean)

```python
import pandas as pd

# Sales data: region, category, revenue, quantity
sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West","North","South","West"],
    "category": ["Electronics","Clothing","Electronics","Clothing","Electronics","Food","Food","Food","Clothing"],
    "revenue":  [1500, 800, 1100, 750, 1800, 450, 600, 650, 950],
    "quantity": [3, 5, 2, 6, 3, 10, 8, 7, 4],
})

# Pivot: rows=region, columns=category, cells=sum of revenue
pivot = pd.pivot_table(
    sales,
    values="revenue",
    index="region",
    columns="category",
    aggfunc="sum",
    fill_value=0,   # fill NaN (no data for that combo) with 0
)
print(pivot)
# category  Clothing  Electronics  Food
# region
# North          800         1500   600
# South          750         1100   650
# West           950         1800   450
```

**Multiple aggfuncs** — get multiple stats in one pivot:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West","North","South","West"],
    "category": ["Electronics","Clothing","Electronics","Clothing","Electronics","Food","Food","Food","Clothing"],
    "revenue":  [1500, 800, 1100, 750, 1800, 450, 600, 650, 950],
    "quantity": [3, 5, 2, 6, 3, 10, 8, 7, 4],
})

# Different aggfuncs per value column
pivot_multi = pd.pivot_table(
    sales,
    values=["revenue", "quantity"],
    index="region",
    columns="category",
    aggfunc={"revenue": "sum", "quantity": "mean"},
    fill_value=0,
)
print(pivot_multi)
```

**margins=True** — adds row and column totals:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West","North","South","West"],
    "category": ["Electronics","Clothing","Electronics","Clothing","Electronics","Food","Food","Food","Clothing"],
    "revenue":  [1500, 800, 1100, 750, 1800, 450, 600, 650, 950],
    "quantity": [3, 5, 2, 6, 3, 10, 8, 7, 4],
})

pivot_with_totals = pd.pivot_table(
    sales,
    values="revenue",
    index="region",
    columns="category",
    aggfunc="sum",
    fill_value=0,
    margins=True,         # Add "All" row and column
    margins_name="Total", # Label for the totals
)
print(pivot_with_totals)
```

<PracticeBlock
  prompt="Create a pivot table from the sales DataFrame with: rows=region, columns=category, values=revenue (sum), fill_value=0, and margins=True with margins_name='Total'. Print the result."
  initialCode={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West","North","South","West"],
    "category": ["Electronics","Clothing","Electronics","Clothing","Electronics","Food","Food","Food","Clothing"],
    "revenue":  [1500, 800, 1100, 750, 1800, 450, 600, 650, 950],
    "quantity": [3, 5, 2, 6, 3, 10, 8, 7, 4],
})

# Create pivot table with totals
pivot =

print(pivot)
`}
  hint="Use pd.pivot_table(sales, values='revenue', index='region', columns='category', aggfunc='sum', fill_value=0, margins=True, margins_name='Total')"
  solution={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West","North","South","West"],
    "category": ["Electronics","Clothing","Electronics","Clothing","Electronics","Food","Food","Food","Clothing"],
    "revenue":  [1500, 800, 1100, 750, 1800, 450, 600, 650, 950],
    "quantity": [3, 5, 2, 6, 3, 10, 8, 7, 4],
})

pivot = pd.pivot_table(
    sales,
    values="revenue",
    index="region",
    columns="category",
    aggfunc="sum",
    fill_value=0,
    margins=True,
    margins_name="Total",
)
print(pivot)
`}
/>

---

### Part 2: pd.crosstab() (30 minutes)

#### Explanation

`pd.crosstab()` is a convenience function for building frequency tables between two categorical columns. By default it counts how often each combination of values appears.

```python
import pandas as pd

customers = pd.DataFrame({
    "region":  ["North","North","South","South","West","West","North","South","West","North"],
    "segment": ["Premium","Standard","Premium","Standard","Premium","Standard","Premium","Standard","Premium","Standard"],
    "product": ["A","B","A","C","B","A","C","B","A","C"],
    "revenue": [200, 80, 180, 60, 220, 90, 160, 75, 210, 70],
})

# Basic crosstab: count combinations
ct = pd.crosstab(customers["segment"], customers["product"])
print(ct)
# product   A  B  C
# segment
# Premium   3  1  1
# Standard  1  2  2

# Normalize to show percentages by row
ct_pct = pd.crosstab(customers["segment"], customers["product"], normalize="index")
print(ct_pct.round(2))
```

**Crosstab with values and aggfunc** — aggregate a numeric column instead of just counting:

```python
import pandas as pd

customers = pd.DataFrame({
    "region":  ["North","North","South","South","West","West","North","South","West","North"],
    "segment": ["Premium","Standard","Premium","Standard","Premium","Standard","Premium","Standard","Premium","Standard"],
    "product": ["A","B","A","C","B","A","C","B","A","C"],
    "revenue": [200, 80, 180, 60, 220, 90, 160, 75, 210, 70],
})

# Sum of revenue per segment × product combination
ct_revenue = pd.crosstab(
    customers["segment"],
    customers["product"],
    values=customers["revenue"],
    aggfunc="sum",
)
print(ct_revenue)

# Crosstab with margins for totals
ct_with_totals = pd.crosstab(
    customers["region"],
    customers["segment"],
    margins=True,
    margins_name="All",
)
print(ct_with_totals)
```

---

### Part 3: pd.pivot() (30 minutes)

#### Explanation

`pd.pivot()` reshapes data **without aggregation**. It requires that each combination of index + columns values is unique — otherwise it raises a ValueError.

Use `pivot()` when your data is already aggregated and you just want to reshape it from long to wide format.

```python
import pandas as pd

# Long-format metrics table (one row per metric per date)
metrics_long = pd.DataFrame({
    "date":   ["2024-01", "2024-01", "2024-01", "2024-02", "2024-02", "2024-02"],
    "metric": ["revenue", "orders", "customers", "revenue", "orders", "customers"],
    "value":  [15000, 120, 85, 18000, 145, 98],
})

# Pivot to wide: one row per date, one column per metric
metrics_wide = metrics_long.pivot(
    index="date",
    columns="metric",
    values="value",
)
print(metrics_wide)
# metric  customers  orders  revenue
# date
# 2024-01         85     120    15000
# 2024-02         98     145    18000
```

**When to use pivot vs pivot_table:**
- Use `pivot()` when you know each (index, column) combo is unique — no aggregation needed
- Use `pivot_table()` when multiple rows share the same (index, column) key and you need to aggregate them

```python
import pandas as pd

# Example: wide-format time series data
wide_ts = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=5, freq="D"),
    "temp":    [22.1, 23.5, 21.8, 24.0, 22.9],
    "humidity":[65, 62, 70, 58, 67],
    "wind":    [12, 15, 8, 18, 11],
})

# Melt to long, then pivot back to verify round-trip
long = wide_ts.melt(id_vars=["date"], var_name="metric", value_name="value")
back_to_wide = long.pivot(index="date", columns="metric", values="value")
print(back_to_wide)
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: P&L Pivot Table

```python
import pandas as pd

# Quarterly P&L data
pnl = pd.DataFrame({
    "product":  ["Widget","Widget","Widget","Widget","Gadget","Gadget","Gadget","Gadget","Tool","Tool","Tool","Tool"],
    "quarter":  ["Q1","Q2","Q3","Q4","Q1","Q2","Q3","Q4","Q1","Q2","Q3","Q4"],
    "revenue":  [12000,14000,11000,16000,8000,9500,8800,11000,5000,5500,4800,6200],
    "cost":     [7000, 8000, 6500, 9000, 4500,5200,4800, 6000, 2800,3000,2600,3400],
})

pnl["profit"] = pnl["revenue"] - pnl["cost"]

# P&L pivot: products as rows, quarters as columns, profit as values, with totals
pnl_pivot = pd.pivot_table(
    pnl,
    values="profit",
    index="product",
    columns="quarter",
    aggfunc="sum",
    margins=True,
    margins_name="Total",
)
print("P&L Pivot Table:")
print(pnl_pivot)
```

#### Exercise 2: Survey Crosstab

```python
import pandas as pd

survey = pd.DataFrame({
    "age_group":  ["18-24","25-34","18-24","35-44","25-34","18-24","35-44","25-34","35-44","18-24"],
    "response":   ["Agree","Disagree","Agree","Neutral","Agree","Neutral","Agree","Disagree","Agree","Agree"],
})

# Raw count crosstab
ct_raw = pd.crosstab(survey["age_group"], survey["response"])
print("Raw counts:")
print(ct_raw)

# Normalize by row (% within each age group)
ct_pct = pd.crosstab(survey["age_group"], survey["response"], normalize="index")
print("\nPercentage within age group:")
print((ct_pct * 100).round(1))
```

---

## Key Takeaways

- `pd.pivot_table(df, values, index, columns, aggfunc, fill_value, margins)` — aggregated cross-tab
- `pd.crosstab(rows, cols)` — frequency count; add `values` + `aggfunc` for numeric aggregation
- `normalize="index"/"columns"/"all"` — converts crosstab counts to percentages
- `pd.pivot(index, columns, values)` — reshape without aggregation (requires unique combos)
- Use `pivot_table` when data has duplicates; use `pivot` when data is already unique per (row, col) pair

---

## Common Mistakes to Avoid

- **Forgetting fill_value**: missing combinations produce NaN by default — add `fill_value=0` for additive metrics
- **Using pivot with duplicate keys**: will raise a ValueError — switch to pivot_table with an aggfunc
- **Misreading margins**: the "Total" row/column is the sum of the visible values, not necessarily all data

---

[← Previous](./lesson-02-groupby-advanced.md) | [Back to Course](./README.md) | [Next →](./lesson-04-melt-reshape.md)
