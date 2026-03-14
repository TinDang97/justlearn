# Lesson 1: GroupBy — Splitting and Aggregating Data

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand the split-apply-combine pattern
- Use groupby with single and multiple keys
- Apply built-in aggregation functions (sum, mean, count, max, min, std)
- Use `.agg()` with a dictionary for per-column aggregation

---

## Prerequisites

- Section 2: Pandas Fundamentals (Series, DataFrames, selection, filtering)
- Basic Python: lists, dicts, functions

---

## Lesson Outline

### Part 1: The Split-Apply-Combine Pattern (30 minutes)

#### Explanation

GroupBy is built on a three-step mental model called **split-apply-combine**:

1. **Split** — divide the DataFrame into groups based on one or more key columns
2. **Apply** — run a function on each group independently
3. **Combine** — collect results into a single output DataFrame or Series

This pattern handles a huge class of real-world questions: "What is the total revenue per region?", "How many orders did each customer place?", "What is the average salary by department?"

```python
import pandas as pd

# Sales data with region, category, and revenue
sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

# Split by region, apply sum to revenue column, combine into result
regional_revenue = sales.groupby("region")["revenue"].sum()
print(regional_revenue)
# region
# North    4650
# South    2500
# West     2250
# Name: revenue, dtype: int64
```

The GroupBy object itself is lazy — no computation happens until you call an aggregation:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

grouped = sales.groupby("region")
print(type(grouped))         # DataFrameGroupBy object
print(grouped.ngroups)       # 3 (North, South, West)

# Inspect a single group
north_group = grouped.get_group("North")
print(north_group)
#   region     category  revenue  quantity
# 0  North  Electronics     1500         3
# 2  North  Electronics     2200         4
# 5  North     Clothing      950         6
```

#### Practice

Given the sales DataFrame above, use groupby to compute the total quantity sold per category.

---

### Part 2: Built-in Aggregation Functions (30 minutes)

#### Explanation

pandas provides a rich set of built-in aggregations you can call directly after groupby:

| Function | Description |
|----------|-------------|
| `.sum()` | Total of all values in the group |
| `.mean()` | Arithmetic average |
| `.count()` | Number of non-null values |
| `.size()` | Total number of rows (including nulls) |
| `.max()` | Maximum value |
| `.min()` | Minimum value |
| `.std()` | Standard deviation |
| `.var()` | Variance |
| `.median()` | Middle value |
| `.nunique()` | Count of distinct values |

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

# Aggregate a single column with multiple methods
print(sales.groupby("region")["revenue"].sum())    # total per region
print(sales.groupby("region")["revenue"].mean())   # average per region
print(sales.groupby("region")["revenue"].count())  # number of transactions
print(sales.groupby("region")["revenue"].max())    # highest single transaction

# Aggregate multiple columns at once
multi = sales.groupby("region")[["revenue", "quantity"]].sum()
print(multi)
#         revenue  quantity
# region
# North      4650        13
# South      2500        18
# West       2250        13

# Group by multiple keys
multi_key = sales.groupby(["region", "category"])["revenue"].sum()
print(multi_key)
```

<PracticeBlock
  prompt="Using the sales DataFrame, compute 4 stats grouped by region: total revenue, average revenue, number of transactions, and maximum revenue. Store each as a separate variable and print them."
  initialCode={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

# Compute 4 stats grouped by region
total_revenue =
avg_revenue =
transaction_count =
max_revenue =

print("Total:", total_revenue)
print("Average:", avg_revenue)
print("Count:", transaction_count)
print("Max:", max_revenue)
`}
  hint="Chain the aggregation method after .groupby('region')['revenue']: .sum(), .mean(), .count(), .max()"
  solution={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

total_revenue = sales.groupby("region")["revenue"].sum()
avg_revenue = sales.groupby("region")["revenue"].mean()
transaction_count = sales.groupby("region")["revenue"].count()
max_revenue = sales.groupby("region")["revenue"].max()

print("Total:", total_revenue)
print("Average:", avg_revenue)
print("Count:", transaction_count)
print("Max:", max_revenue)
`}
/>

---

### Part 3: .agg() with Dictionary and Named Aggregations (30 minutes)

#### Explanation

When you need multiple aggregations in a single operation, `.agg()` is the right tool.

**Dictionary syntax** — specify a different aggregation per column:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

# Per-column aggregation dict: different function per column
result = sales.groupby("region").agg({
    "revenue":  "sum",
    "quantity": "mean",
})
print(result)
#         revenue  quantity
# region
# North      4650      4.33
# South      2500      6.33
# West       2250      6.50
```

**Named aggregations** (pandas >= 0.25) — control the output column names explicitly:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

# Named aggregations: output_col_name=("input_col", "function")
summary = sales.groupby("region").agg(
    total_revenue=("revenue", "sum"),
    avg_order=("revenue", "mean"),
    order_count=("revenue", "count"),
    avg_qty=("quantity", "mean"),
)
print(summary)
#         total_revenue  avg_order  order_count  avg_qty
# region
# North            4650    1550.00            3     4.33
# South            2500     833.33            3     6.33
# West             2250    1125.00            2     6.50
```

**List of functions** on a single column:

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
})

# Multiple aggregations on one column
multi_agg = sales.groupby("region")["revenue"].agg(["sum", "mean", "count", "std"])
print(multi_agg)
```

<PracticeBlock
  prompt="Build a 'region summary' table with exactly these column names: total_revenue, avg_order, order_count. Use named aggregations (.agg with keyword arguments) on the sales DataFrame grouped by region."
  initialCode={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

# Use named aggregations to build the region summary
region_summary = sales.groupby("region").agg(
    # your named aggregations here
)

print(region_summary)
`}
  hint="Named aggregation syntax: col_name=(\"source_column\", \"function\"). Use 'sum' for total_revenue, 'mean' for avg_order, 'count' for order_count — all from the revenue column."
  solution={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North", "South", "North", "West", "South", "North", "West", "South"],
    "category": ["Electronics", "Clothing", "Electronics", "Food", "Electronics", "Clothing", "Electronics", "Food"],
    "revenue":  [1500, 800, 2200, 450, 1100, 950, 1800, 600],
    "quantity": [3, 5, 4, 10, 2, 6, 3, 8],
})

region_summary = sales.groupby("region").agg(
    total_revenue=("revenue", "sum"),
    avg_order=("revenue", "mean"),
    order_count=("revenue", "count"),
)

print(region_summary)
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Employee Statistics

```python
import pandas as pd
import numpy as np

employees = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Hank"],
    "dept":   ["Engineering", "Marketing", "Engineering", "Sales", "Marketing", "Engineering", "Sales", "Marketing"],
    "role":   ["Senior", "Junior", "Junior", "Mid", "Senior", "Mid", "Junior", "Mid"],
    "salary": [110000, 62000, 75000, 82000, 95000, 88000, 70000, 78000],
    "years":  [7, 2, 3, 5, 6, 4, 3, 4],
})

# Task 1: Average salary by department
avg_by_dept = employees.groupby("dept")["salary"].mean()
print("Avg salary by dept:\n", avg_by_dept)

# Task 2: Headcount by department
headcount = employees.groupby("dept")["name"].count()
print("\nHeadcount by dept:\n", headcount)

# Task 3: Max salary by role
max_by_role = employees.groupby("role")["salary"].max()
print("\nMax salary by role:\n", max_by_role)
```

#### Exercise 2: Orders Analysis

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id":   range(1, 13),
    "month":      ["Jan","Jan","Feb","Feb","Mar","Mar","Jan","Feb","Mar","Jan","Feb","Mar"],
    "customer_id": [1, 2, 1, 3, 2, 1, 3, 2, 3, 1, 3, 2],
    "product":    ["Widget","Gadget","Widget","Tool","Gadget","Widget","Tool","Widget","Gadget","Tool","Widget","Tool"],
    "quantity":   [2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 2],
    "price":      [29.99, 49.99, 29.99, 19.99, 49.99, 29.99, 19.99, 29.99, 49.99, 19.99, 29.99, 19.99],
})

orders["revenue"] = orders["quantity"] * orders["price"]

# Monthly revenue
monthly = orders.groupby("month")["revenue"].sum()
print("Monthly revenue:\n", monthly)

# Top customers by total spend
customer_spend = orders.groupby("customer_id")["revenue"].sum().sort_values(ascending=False)
print("\nTop customers:\n", customer_spend.head(3))

# Revenue by product
by_product = orders.groupby("product").agg(
    total_revenue=("revenue", "sum"),
    order_count=("order_id", "count"),
)
print("\nBy product:\n", by_product)
```

---

## Key Takeaways

- The **split-apply-combine** pattern: `groupby("key")` → aggregate function → combined result
- `df.groupby("col")["target"].sum()` — single key, single column aggregation
- `df.groupby(["col1","col2"])["target"].sum()` — multiple keys
- `.agg({"col": "func"})` — different aggregation per column
- Named aggregations: `.agg(output_name=("source_col", "func"))` — clean output column names
- `.agg(["sum","mean","count"])` — multiple aggregations on one column

---

## Common Mistakes to Avoid

- **Forgetting to select a column**: `df.groupby("region")` returns a GroupBy object — chain `["col"]` or `.agg()` to get data
- **Confusing `.count()` and `.size()`**: count skips NaN values, size does not
- **Index confusion**: groupby result has group keys as the index — use `.reset_index()` to move them back to columns

---

[← Back to Course Overview](./README.md) | [Next →](./lesson-02-groupby-advanced.md)
