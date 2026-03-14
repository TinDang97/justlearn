# Lesson 4: Melt and Stack — Long vs Wide Format

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Convert wide format to long format with `pd.melt()`
- Convert long format back to wide with `pd.pivot()` or `unstack()`
- Use `stack()` and `unstack()` with MultiIndex DataFrames
- Understand when each format is appropriate for analysis

---

## Prerequisites

- Lesson 3: Pivot Tables (pivot, pivot_table)
- Lesson 1-2: GroupBy (needed for post-melt analysis examples)

---

## Lesson Outline

### Part 1: Wide vs Long Format (30 minutes)

#### Explanation

Data can be stored in two fundamental shapes:

**Wide format** — one row per entity, multiple value columns (one per time period or metric):

| region | Q1    | Q2    | Q3    | Q4    |
|--------|-------|-------|-------|-------|
| North  | 12000 | 14000 | 11000 | 16000 |
| South  | 8000  | 9500  | 8800  | 11000 |

**Long format** — one row per entity+metric pair:

| region | quarter | revenue |
|--------|---------|---------|
| North  | Q1      | 12000   |
| North  | Q2      | 14000   |
| South  | Q1      | 8000    |

**When to use each:**
- Wide format: display tables, Excel-style reports, pivot tables
- Long format: groupby, plotting (seaborn/matplotlib), tidy data standard, machine learning features

`pd.melt()` converts wide → long. `pd.pivot()` converts long → wide.

```python
import pandas as pd

# Wide-format quarterly revenue
wide = pd.DataFrame({
    "region": ["North", "South", "West"],
    "Q1":     [12000, 8000, 5000],
    "Q2":     [14000, 9500, 5500],
    "Q3":     [11000, 8800, 4800],
    "Q4":     [16000, 11000, 6200],
})

# Melt: wide → long
long = pd.melt(
    wide,
    id_vars=["region"],          # columns to keep as-is (identifiers)
    value_vars=["Q1","Q2","Q3","Q4"],  # columns to melt (measure columns)
    var_name="quarter",          # name for the new "variable" column
    value_name="revenue",        # name for the new "value" column
)
print(long)
#     region quarter  revenue
# 0    North      Q1    12000
# 1    South      Q1     8000
# 2     West      Q1     5000
# 3    North      Q2    14000
# ...
```

<PracticeBlock
  prompt="Melt the wide DataFrame to long format. id_vars should be 'region', the quarter columns (Q1-Q4) should become a 'quarter' column, and the values should be named 'revenue'. Print the resulting long DataFrame."
  initialCode={`import pandas as pd

wide = pd.DataFrame({
    "region": ["North", "South", "West"],
    "Q1":     [12000, 8000, 5000],
    "Q2":     [14000, 9500, 5500],
    "Q3":     [11000, 8800, 4800],
    "Q4":     [16000, 11000, 6200],
})

# Melt to long format
long = pd.melt(
    wide,
    id_vars=,
    value_vars=,
    var_name=,
    value_name=,
)
print(long)
print("Shape:", long.shape)
`}
  hint="id_vars=['region'], value_vars=['Q1','Q2','Q3','Q4'], var_name='quarter', value_name='revenue'"
  solution={`import pandas as pd

wide = pd.DataFrame({
    "region": ["North", "South", "West"],
    "Q1":     [12000, 8000, 5000],
    "Q2":     [14000, 9500, 5500],
    "Q3":     [11000, 8800, 4800],
    "Q4":     [16000, 11000, 6200],
})

long = pd.melt(
    wide,
    id_vars=["region"],
    value_vars=["Q1","Q2","Q3","Q4"],
    var_name="quarter",
    value_name="revenue",
)
print(long)
print("Shape:", long.shape)
`}
/>

---

### Part 2: pd.melt() Deep Dive (30 minutes)

#### Explanation

`pd.melt()` has several parameters worth knowing:

```python
import pandas as pd

# Employee survey: wide format with score per quarter
survey = pd.DataFrame({
    "employee_id": [101, 102, 103, 104],
    "department":  ["Eng", "Mktg", "Eng", "Sales"],
    "Q1_score":    [4.2, 3.8, 4.5, 3.9],
    "Q2_score":    [4.0, 4.1, 4.3, 4.2],
    "Q3_score":    [4.4, 3.7, 4.6, 4.0],
    "Q4_score":    [4.1, 4.3, 4.8, 4.5],
})

# Melt only the score columns; keep employee_id and department as identifiers
long_survey = pd.melt(
    survey,
    id_vars=["employee_id", "department"],
    value_vars=["Q1_score", "Q2_score", "Q3_score", "Q4_score"],
    var_name="quarter",
    value_name="score",
)
print(long_survey)

# Clean the quarter column: remove "_score" suffix
long_survey["quarter"] = long_survey["quarter"].str.replace("_score", "")
print(long_survey.head(8))
```

**Round-trip pattern: melt → groupby → pivot back**

```python
import pandas as pd

wide = pd.DataFrame({
    "region": ["North", "South", "West"],
    "Q1":     [12000, 8000, 5000],
    "Q2":     [14000, 9500, 5500],
    "Q3":     [11000, 8800, 4800],
    "Q4":     [16000, 11000, 6200],
})

# Step 1: Melt to long
long = pd.melt(wide, id_vars=["region"], var_name="quarter", value_name="revenue")

# Step 2: GroupBy — compute average revenue per quarter across all regions
quarterly_avg = long.groupby("quarter")["revenue"].mean().reset_index()
quarterly_avg.columns = ["quarter", "avg_revenue"]
print("Average per quarter:", quarterly_avg)

# Step 3: Pivot back to wide if needed for display
wide_avg = quarterly_avg.set_index("quarter").T
print("Wide format:", wide_avg)
```

**Partial melt** — keep some measure columns wide, melt only others:

```python
import pandas as pd

products = pd.DataFrame({
    "product_id": [1, 2, 3],
    "product_name": ["Widget", "Gadget", "Tool"],
    "price":       [29.99, 49.99, 19.99],  # keep wide (single value)
    "sales_jan":   [120, 85, 200],
    "sales_feb":   [135, 92, 185],
    "sales_mar":   [118, 78, 220],
})

# Only melt the sales columns; keep product_id, name, and price as identifiers
long_products = pd.melt(
    products,
    id_vars=["product_id", "product_name", "price"],
    value_vars=["sales_jan", "sales_feb", "sales_mar"],
    var_name="month",
    value_name="units_sold",
)

long_products["month"] = long_products["month"].str.replace("sales_", "")
long_products["revenue"] = long_products["price"] * long_products["units_sold"]
print(long_products)
```

---

### Part 3: stack() and unstack() (30 minutes)

#### Explanation

`stack()` and `unstack()` operate on DataFrames with a MultiIndex. They move levels between the row index and the column index.

- **`stack()`**: moves the column level down into the row index (wide → long, for MultiIndex)
- **`unstack()`**: moves a row index level up into columns (long → wide, for MultiIndex)

```python
import pandas as pd

# GroupBy with multiple keys creates a MultiIndex result
sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West"],
    "quarter":  ["Q1","Q2","Q1","Q2","Q1","Q2"],
    "revenue":  [12000, 14000, 8000, 9500, 5000, 5500],
})

# GroupBy result: MultiIndex Series (region, quarter)
grouped = sales.groupby(["region", "quarter"])["revenue"].sum()
print("Grouped (MultiIndex):")
print(grouped)

# Unstack quarter level to columns: regions as rows, quarters as columns
wide = grouped.unstack("quarter")
print("\nUnstacked (wide):")
print(wide)

# Stack it back: wide DataFrame → long MultiIndex Series
long = wide.stack()
print("\nStacked back (long):")
print(long)
```

`unstack()` with a DataFrame of multiple columns:

```python
import pandas as pd

# MultiIndex DataFrame from groupby
sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West"],
    "quarter":  ["Q1","Q2","Q1","Q2","Q1","Q2"],
    "revenue":  [12000, 14000, 8000, 9500, 5000, 5500],
    "orders":   [100, 115, 75, 88, 45, 52],
})

multi = sales.groupby(["region", "quarter"])[["revenue", "orders"]].sum()
print("MultiIndex DataFrame:")
print(multi)

# Unstack quarter → get revenue and orders columns per quarter
wide = multi.unstack("quarter")
print("\nWide MultiIndex columns:")
print(wide)

# Compute % share per region
wide["revenue_share_Q1"] = wide[("revenue","Q1")] / wide[("revenue","Q1")].sum() * 100
print(wide)
```

<PracticeBlock
  prompt="From the sales DataFrame, groupby region and quarter to sum revenue and orders. Then unstack 'quarter' to make quarters into columns. Finally print the resulting wide DataFrame."
  initialCode={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West"],
    "quarter":  ["Q1","Q2","Q1","Q2","Q1","Q2"],
    "revenue":  [12000, 14000, 8000, 9500, 5000, 5500],
    "orders":   [100, 115, 75, 88, 45, 52],
})

# Step 1: GroupBy region and quarter
grouped =

# Step 2: Unstack quarter to columns
wide =

print(wide)
`}
  hint="grouped = sales.groupby(['region','quarter'])[['revenue','orders']].sum() — then call .unstack('quarter') on the result."
  solution={`import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","South","South","West","West"],
    "quarter":  ["Q1","Q2","Q1","Q2","Q1","Q2"],
    "revenue":  [12000, 14000, 8000, 9500, 5000, 5500],
    "orders":   [100, 115, 75, 88, 45, 52],
})

grouped = sales.groupby(["region", "quarter"])[["revenue", "orders"]].sum()
wide = grouped.unstack("quarter")
print(wide)
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Financial Data Round-Trip

```python
import pandas as pd

# Wide financial data with Jan-Dec columns
finance = pd.DataFrame({
    "department": ["Engineering", "Marketing", "Sales"],
    "Jan": [50000, 30000, 45000],
    "Feb": [52000, 31000, 47000],
    "Mar": [51000, 29000, 46000],
    "Apr": [53000, 32000, 48000],
    "May": [54000, 33000, 49000],
    "Jun": [52000, 30000, 47000],
})

# Step 1: Melt to long format
long = pd.melt(
    finance,
    id_vars=["department"],
    var_name="month",
    value_name="budget",
)

# Step 2: Add quarter column
month_to_q = {"Jan":"Q1","Feb":"Q1","Mar":"Q1","Apr":"Q2","May":"Q2","Jun":"Q2"}
long["quarter"] = long["month"].map(month_to_q)

# Step 3: GroupBy quarter and department
quarterly = long.groupby(["department", "quarter"])["budget"].sum().reset_index()

# Step 4: Pivot to quarterly summary (depts as rows, quarters as columns)
quarterly_pivot = quarterly.pivot(index="department", columns="quarter", values="budget")
print("Quarterly Budget Summary:")
print(quarterly_pivot)
```

#### Exercise 2: MultiIndex Share Analysis

```python
import pandas as pd

sales = pd.DataFrame({
    "region":   ["North","North","North","South","South","South","West","West","West"],
    "product":  ["Widget","Gadget","Tool","Widget","Gadget","Tool","Widget","Gadget","Tool"],
    "revenue":  [15000, 8000, 5000, 10000, 6000, 4000, 12000, 7000, 3500],
})

# GroupBy region and product
multi = sales.groupby(["region", "product"])["revenue"].sum()

# Unstack product to columns
wide = multi.unstack("product")

# Compute each product's % of regional total
region_totals = wide.sum(axis=1)
pct_share = wide.div(region_totals, axis=0) * 100

print("Revenue by Region × Product:")
print(wide)
print("\n% Share per Region:")
print(pct_share.round(1))
```

---

## Key Takeaways

- **Wide format**: one row per entity, many value columns — good for display
- **Long format**: one row per entity+metric — good for groupby, plotting, tidy data
- `pd.melt(df, id_vars, value_vars, var_name, value_name)` — wide → long
- `stack()` — moves column level into row index (MultiIndex)
- `unstack(level)` — moves row index level into columns (inverse of stack)
- Long format preferred for groupby analysis; wide format preferred for display/pivots

---

## Common Mistakes to Avoid

- **Not specifying value_vars**: if omitted, ALL non-id columns are melted — usually correct but confirm
- **Losing track of index after unstack**: always check `.columns` — it becomes a MultiIndex
- **Stacking/unstacking the wrong level**: name the level explicitly: `unstack("quarter")` not `unstack(0)`

---

[← Previous](./lesson-03-pivot-tables.md) | [Back to Course](./README.md) | [Next →](./lesson-05-merge-join-basics.md)
