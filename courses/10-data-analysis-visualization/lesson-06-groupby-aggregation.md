# Lesson 6: GroupBy and Aggregation

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Use `groupby` to segment data
- Apply aggregation functions
- Create pivot tables
- Combine and merge DataFrames

---

## Lesson Outline

### Part 1: GroupBy (30 minutes)

#### Explanation

```python
import pandas as pd

# Basic groupby:
df.groupby("region")["revenue"].sum()      # Total revenue per region
df.groupby("region")["revenue"].mean()     # Average revenue per region
df.groupby("category").size()              # Count rows per category

# Multiple aggregations:
df.groupby("region")["revenue"].agg(["sum", "mean", "count", "max"])

# .agg() with custom functions:
df.groupby("region")["revenue"].agg(
    total="sum",
    average="mean",
    count="count",
    top=lambda x: x.nlargest(1).values[0]
)

# Multiple columns:
df.groupby("region")[["revenue", "quantity"]].sum()

# Multiple groupby keys:
df.groupby(["region", "category"])["revenue"].sum()

# Groupby with date:
df["month"] = df["date"].dt.to_period("M")
monthly = df.groupby("month")["revenue"].sum()
```

#### Practice

Given sales data, compute: total revenue by region, average order value by product category, top-selling product per region.

---

### Part 2: Pivot Tables (30 minutes)

#### Explanation

```python
# Pivot table (like Excel):
pivot = pd.pivot_table(
    df,
    values="revenue",
    index="region",
    columns="category",
    aggfunc="sum",
    fill_value=0
)
print(pivot)
#           Electronics  Clothing  Food
# East          150000     45000  23000
# North          89000     67000  31000
# South          112000    38000  19000
# West           203000    52000  28000

# With margins (totals):
pivot = pd.pivot_table(
    df, values="revenue",
    index="region", columns="category",
    aggfunc="sum", fill_value=0, margins=True
)

# Crosstab (counts):
pd.crosstab(df["region"], df["product"])
pd.crosstab(df["region"], df["product"], values=df["revenue"], aggfunc="sum")

# Melt (wide to long format):
df_long = pd.melt(
    df,
    id_vars=["date", "region"],
    value_vars=["q1_sales", "q2_sales", "q3_sales", "q4_sales"],
    var_name="quarter", value_name="sales"
)
```

#### Practice

Create a pivot table showing monthly sales by product category (months as columns, categories as rows).

---

### Part 3: Merging DataFrames (30 minutes)

#### Explanation

```python
# merge (SQL JOIN equivalent):
# Inner join (only matching rows):
merged = pd.merge(orders, customers, on="customer_id", how="inner")

# Left join (all orders, matching customer data):
merged = pd.merge(orders, customers, on="customer_id", how="left")

# Different key names:
merged = pd.merge(orders, customers,
                  left_on="cust_id", right_on="customer_id")

# Concatenate (stack DataFrames):
df_all = pd.concat([df_2022, df_2023, df_2024], ignore_index=True)
df_wide = pd.concat([df1, df2], axis=1)   # Side by side

# join (merge on index):
df.join(other_df, on="shared_column")

# Practical example:
sales = pd.read_csv("sales.csv")
products = pd.read_csv("products.csv")
regions = pd.read_csv("regions.csv")

# Enrich sales with product names and region info:
enriched = (sales
    .merge(products[["id", "name", "category"]], left_on="product_id", right_on="id")
    .merge(regions[["code", "region_name"]], left_on="region_code", right_on="code")
    .drop(columns=["id", "code"])
)
```

#### Practice

Merge a sales DataFrame with a products table and a customers table. Calculate revenue per customer segment.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Sales Dashboard Numbers

From a sales DataFrame, compute:
1. Revenue by region (sorted descending)
2. Revenue by month (for trend analysis)
3. Top 10 products by total revenue
4. Revenue breakdown by region × category (pivot table)
5. Month-over-month growth rate

#### Exercise 2: Customer Cohort Analysis

Given orders data with `customer_id`, `order_date`, `revenue`:
1. Find each customer's first order date (cohort)
2. Calculate monthly retention: what % of each cohort orders again each month?
3. Show as a pivot table (cohort × months since first order)

---

## Key Takeaways

- `df.groupby("col").agg({"col2": "sum", "col3": "mean"})` — aggregate per group
- `.agg()` accepts string functions, lists of functions, or custom lambdas
- `pd.pivot_table(df, values, index, columns, aggfunc)` — Excel-style cross-tabulation
- `pd.merge(df1, df2, on="key", how="inner/left/right/outer")` — SQL-style join
- `pd.concat([df1, df2])` — stack DataFrames vertically

---

[← Previous](./lesson-05-filtering-selecting.md) | [Back to Course](./README.md) | [Next →](./lesson-07-matplotlib-basics.md)
