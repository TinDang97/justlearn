# Lesson 2: GroupBy — Transforms, Filters, and Custom Functions

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Use `.transform()` to broadcast group statistics back to the original DataFrame shape
- Filter entire groups with `.filter()`
- Apply custom functions to groups with `.apply()`
- Group by time periods using the `dt` accessor and `pd.Grouper`

---

## Prerequisites

- Lesson 1: GroupBy Basics (split-apply-combine, .agg())
- pandas Series and DataFrame indexing

---

## Lesson Outline

### Part 1: GroupBy Transform (30 minutes)

#### Explanation

`.agg()` collapses groups down to one row per group. `.transform()` does something different: it returns a result with the **same shape as the input** — every row in the original DataFrame gets the statistic for its group filled in.

This is essential when you want to add a group-level stat as a new column without collapsing the DataFrame.

```python
import pandas as pd

sales = pd.DataFrame({
    "region":  ["North", "South", "North", "West", "South", "North", "West", "South"],
    "product": ["A", "B", "A", "C", "A", "B", "A", "C"],
    "revenue": [1500, 800, 2200, 450, 1100, 950, 1800, 600],
})

# .agg() collapses to 3 rows (one per region)
agg_result = sales.groupby("region")["revenue"].sum()
print("agg shape:", agg_result.shape)   # (3,)

# .transform() returns same shape as original (8 rows)
sales["region_total"] = sales.groupby("region")["revenue"].transform("sum")
print("transform shape:", sales["region_total"].shape)  # (8,)

print(sales)
#   region product  revenue  region_total
# 0  North       A     1500          4650
# 1  South       B      800          2500
# 2  North       A     2200          4650
# 3   West       C      450          2250
# 4  South       A     1100          2500
# 5  North       B      950          4650
# 6   West       A     1800          2250
# 7  South       C      600          2500
```

A common use case is computing each row's percentage contribution to its group:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":  ["North", "South", "North", "West", "South", "North", "West", "South"],
    "product": ["A", "B", "A", "C", "A", "B", "A", "C"],
    "revenue": [1500, 800, 2200, 450, 1100, 950, 1800, 600],
})

sales["region_total"] = sales.groupby("region")["revenue"].transform("sum")
sales["pct_of_region"] = (sales["revenue"] / sales["region_total"] * 100).round(1)

print(sales[["region", "product", "revenue", "region_total", "pct_of_region"]])
```

Z-score normalization within groups (standardize each group independently):

```python
import pandas as pd

employees = pd.DataFrame({
    "dept":   ["Eng", "Eng", "Eng", "Mktg", "Mktg", "Mktg"],
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "salary": [110000, 75000, 88000, 62000, 95000, 78000],
})

# Z-score within each department
def z_score(series):
    return (series - series.mean()) / series.std()

employees["salary_z"] = employees.groupby("dept")["salary"].transform(z_score)
print(employees)
```

<PracticeBlock
  prompt="Add two new columns to the sales DataFrame: 'region_total' (sum of revenue per region, broadcast to all rows) and 'pct_of_region' (each row's revenue as a percentage of its region total, rounded to 1 decimal)."
  initialCode={`import pandas as pd

sales = pd.DataFrame({
    "region":  ["North", "South", "North", "West", "South", "North", "West", "South"],
    "product": ["A", "B", "A", "C", "A", "B", "A", "C"],
    "revenue": [1500, 800, 2200, 450, 1100, 950, 1800, 600],
})

# Add region_total column using transform
sales["region_total"] =

# Add pct_of_region column
sales["pct_of_region"] =

print(sales[["region", "product", "revenue", "region_total", "pct_of_region"]])
`}
  hint="Use .groupby('region')['revenue'].transform('sum') for region_total. Then divide revenue by region_total and multiply by 100, rounding to 1 decimal."
  solution={`import pandas as pd

sales = pd.DataFrame({
    "region":  ["North", "South", "North", "West", "South", "North", "West", "South"],
    "product": ["A", "B", "A", "C", "A", "B", "A", "C"],
    "revenue": [1500, 800, 2200, 450, 1100, 950, 1800, 600],
})

sales["region_total"] = sales.groupby("region")["revenue"].transform("sum")
sales["pct_of_region"] = (sales["revenue"] / sales["region_total"] * 100).round(1)

print(sales[["region", "product", "revenue", "region_total", "pct_of_region"]])
`}
/>

---

### Part 2: GroupBy Filter (30 minutes)

#### Explanation

`.filter()` operates on groups — it keeps or drops **entire groups** based on a predicate function. If the function returns `True` for a group, all rows in that group are kept. If it returns `False`, all rows in that group are dropped.

This is fundamentally different from row-level boolean filtering: you're making a decision per group, not per row.

```python
import pandas as pd

sales = pd.DataFrame({
    "region":  ["North", "South", "North", "West", "South", "North", "West", "South"],
    "product": ["A", "B", "A", "C", "A", "B", "A", "C"],
    "revenue": [1500, 800, 2200, 450, 1100, 950, 1800, 600],
})

# Keep only regions where total revenue > 3000
high_revenue = sales.groupby("region").filter(lambda g: g["revenue"].sum() > 3000)
print(high_revenue)
#   region product  revenue
# 0  North       A     1500
# 2  North       A     2200
# 5  North       B      950

# Keep only products with 3+ transactions
frequent_products = sales.groupby("product").filter(lambda g: len(g) >= 3)
print(frequent_products)
```

```python
import pandas as pd

employees = pd.DataFrame({
    "dept":   ["Eng", "Eng", "Eng", "Mktg", "Mktg", "Sales"],
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "salary": [110000, 75000, 88000, 62000, 95000, 72000],
})

# Keep only departments with average salary above 80000
high_paying_depts = employees.groupby("dept").filter(lambda g: g["salary"].mean() > 80000)
print(high_paying_depts)
# Engineering rows only (mean = 91000)
```

---

### Part 3: GroupBy Apply and Time Grouping (30 minutes)

#### Explanation

`.apply()` lets you run arbitrary Python functions on each group, returning any shape you want (scalar, Series, or DataFrame). It is the most flexible but also the slowest option — use it only when `.agg()` and `.transform()` cannot handle the logic.

```python
import pandas as pd

sales = pd.DataFrame({
    "region":  ["North", "South", "North", "West", "South", "North"],
    "product": ["A", "B", "A", "C", "A", "B"],
    "revenue": [1500, 800, 2200, 450, 1100, 950],
})

# Custom function: return top revenue row per group
def top_row(group):
    return group.nlargest(1, "revenue")

top_per_region = sales.groupby("region").apply(top_row, include_groups=False)
print(top_per_region)
```

**Grouping by time periods** — a critical pattern for time-series analytics:

```python
import pandas as pd

# Daily revenue data
daily = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=12, freq="10D"),
    "revenue": [1200, 950, 1800, 2100, 750, 1650, 2300, 1400, 880, 1950, 2200, 1100],
    "region":  ["North","South","North","West","South","North","West","South","North","South","West","North"],
})

# Group by calendar month using dt.to_period
daily["month"] = daily["date"].dt.to_period("M")
monthly = daily.groupby("month")["revenue"].sum()
print(monthly)

# Alternative: pd.Grouper for time-frequency groupby
monthly_v2 = daily.groupby(pd.Grouper(key="date", freq="ME"))["revenue"].sum()
print(monthly_v2)

# Cumulative sum within groups (running total per region)
daily = daily.sort_values(["region", "date"])
daily["running_total"] = daily.groupby("region")["revenue"].transform("cumsum")
print(daily[["date", "region", "revenue", "running_total"]])
```

<PracticeBlock
  prompt="Using the daily sales DataFrame: (1) group by month using dt.to_period('M') and sum revenue, (2) compute a running cumulative total per region using transform('cumsum') — sort by region and date first."
  initialCode={`import pandas as pd

daily = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=12, freq="10D"),
    "revenue": [1200, 950, 1800, 2100, 750, 1650, 2300, 1400, 880, 1950, 2200, 1100],
    "region":  ["North","South","North","West","South","North","West","South","North","South","West","North"],
})

# Step 1: Monthly revenue total
daily["month"] = daily["date"].dt.to_period("M")
monthly_revenue =
print("Monthly revenue:")
print(monthly_revenue)

# Step 2: Cumulative total per region
daily_sorted = daily.sort_values(["region", "date"])
daily_sorted["running_total"] =
print("\nRunning total by region:")
print(daily_sorted[["date", "region", "revenue", "running_total"]])
`}
  hint="For monthly: daily.groupby('month')['revenue'].sum(). For running total: daily_sorted.groupby('region')['revenue'].transform('cumsum')."
  solution={`import pandas as pd

daily = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=12, freq="10D"),
    "revenue": [1200, 950, 1800, 2100, 750, 1650, 2300, 1400, 880, 1950, 2200, 1100],
    "region":  ["North","South","North","West","South","North","West","South","North","South","West","North"],
})

# Step 1: Monthly revenue total
daily["month"] = daily["date"].dt.to_period("M")
monthly_revenue = daily.groupby("month")["revenue"].sum()
print("Monthly revenue:")
print(monthly_revenue)

# Step 2: Cumulative total per region
daily_sorted = daily.sort_values(["region", "date"])
daily_sorted["running_total"] = daily_sorted.groupby("region")["revenue"].transform("cumsum")
print("\nRunning total by region:")
print(daily_sorted[["date", "region", "revenue", "running_total"]])
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Regional Sales Analysis

```python
import pandas as pd

sales = pd.DataFrame({
    "date":    pd.date_range("2024-01-01", periods=16, freq="7D"),
    "region":  ["North","North","South","South","West","West","North","South",
                "West","North","South","West","North","South","West","North"],
    "revenue": [1200,1500,800,950,1800,2100,1100,750,1650,2300,1400,880,1950,2200,1100,1750],
})

# Task 1: Add a "region_avg" column — the mean revenue for each region (transform)
sales["region_avg"] = sales.groupby("region")["revenue"].transform("mean")

# Task 2: Add "above_avg" flag — True if revenue > region average
sales["above_avg"] = sales["revenue"] > sales["region_avg"]

# Task 3: Filter to keep only regions where average revenue > 1400
high_regions = sales.groupby("region").filter(lambda g: g["revenue"].mean() > 1400)

print("Sales with region stats:\n", sales.head(8))
print("\nHigh-performing regions only:\n", high_regions["region"].unique())
```

#### Exercise 2: Customer Lifetime Value

```python
import pandas as pd

orders = pd.DataFrame({
    "customer_id": [1, 2, 1, 3, 2, 1, 3, 2, 3, 1, 2, 3],
    "region":      ["North","South","North","West","South","North","West","South","West","North","South","West"],
    "amount":      [150, 80, 220, 90, 110, 180, 130, 95, 200, 165, 88, 175],
})

# Customer lifetime value (total spend)
clv = orders.groupby("customer_id")["amount"].sum().rename("lifetime_value")
orders = orders.merge(clv, on="customer_id")

# Rank customers within each region by lifetime value
orders["region_rank"] = orders.groupby("region")["lifetime_value"].rank(ascending=False, method="dense")

# Keep only customers with 3+ orders
active_customers = orders.groupby("customer_id").filter(lambda g: len(g) >= 3)

print("Orders with CLV and rank:\n", orders)
print("\nCustomers with 3+ orders:\n", active_customers["customer_id"].unique())
```

---

## Key Takeaways

- `.transform()` preserves the original DataFrame shape — use it to broadcast group stats as new columns
- `.filter(lambda g: condition)` keeps or drops **entire groups** — the lambda receives a group DataFrame
- `.apply(func)` gives maximum flexibility for complex group logic — use sparingly (slow)
- `dt.to_period("M")` converts dates to month periods for time-based groupby
- `pd.Grouper(key="date", freq="ME")` is an alternative for time-frequency grouping

---

## Common Mistakes to Avoid

- **Using transform when you want agg**: transform keeps original shape; if you want a summary table, use agg
- **Returning wrong type in filter**: the lambda must return a scalar boolean, not a Series
- **Forgetting to sort before cumsum**: `transform("cumsum")` cumulates in existing row order — sort first

---

[← Previous](./lesson-01-groupby-basics.md) | [Back to Course](./README.md) | [Next →](./lesson-03-pivot-tables.md)
