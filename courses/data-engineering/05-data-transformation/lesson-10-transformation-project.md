# Lesson 10: Mini-Project — Sales Transformation Pipeline

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Apply GroupBy, pivot, melt, merge, window functions, and apply in a single pipeline
- Structure transformation code into clear, reusable functions
- Validate each transformation step with shape/dtype checks
- Produce a final summary DataFrame ready for reporting

---

## Prerequisites

- All prior Section 5 lessons (Lessons 1-9)
- This is the capstone project — you will use all covered concepts

---

## Project Statement

You have three raw data tables from a fictional sales system. Your goal is to build a **regional performance dashboard** that answers:
1. What is the monthly revenue by region?
2. How does each region's revenue trend month-over-month?
3. Which product generates the most revenue per region?

The output is two clean DataFrames: a regional monthly pivot table and a top-product-per-region summary.

---

## Lesson Outline

### Part 1: Project Setup and Data (30 minutes)

#### The Raw Data

Three related tables represent a typical data warehouse star schema: one fact table and two dimension tables.

```python
import pandas as pd
import numpy as np

# ── Fact Table ─────────────────────────────────────────────────────────────
# Transactions: transaction_id, date, product_id, region_id, quantity, unit_price
transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

# ── Dimension Tables ────────────────────────────────────────────────────────
# Products: product_id, name, category
products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

# Regions: region_id, region_name, country
regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

# Validate the raw data
print("Transactions shape:", transactions.shape)
print("Date range:", transactions["date"].min(), "to", transactions["date"].max())
print("\nProduct IDs:", sorted(transactions["product_id"].unique()))
print("Region IDs:", sorted(transactions["region_id"].unique()))
print("\nTransactions sample:")
print(transactions.head(5))
```

#### Target Output

Before writing any transformation code, understand what you are building toward:

- **Output 1**: A pivot table — rows = regions (North/South/West), columns = months (Jan/Feb/...), values = total revenue
- **Output 2**: A summary table — for each region, which product had the highest total revenue

---

### Part 2: Enrichment and Aggregation (30 minutes)

#### Step 1: Enrich with Dimension Data

```python
import pandas as pd
import numpy as np

transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

def enrich(transactions, products, regions):
    """Merge dimension tables onto the fact table."""
    enriched = (
        transactions
        .merge(products, on="product_id", how="left")
        .merge(regions,  on="region_id",  how="left")
    )
    # Validate: row count must be unchanged
    assert len(enriched) == len(transactions), "Row count changed after merge!"
    return enriched

enriched = enrich(transactions, products, regions)

# Step 2: Compute revenue
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]

# Step 3: Extract year_month
enriched["year_month"] = enriched["date"].dt.to_period("M")

print("Enriched shape:", enriched.shape)
print(enriched[["transaction_id","region_name","name","revenue","year_month"]].head(8))
```

#### Step 2: Monthly Aggregation

```python
import pandas as pd
import numpy as np

transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

enriched = transactions.merge(products, on="product_id", how="left").merge(regions, on="region_id", how="left")
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]
enriched["year_month"] = enriched["date"].dt.to_period("M")

def aggregate(enriched):
    """Aggregate to monthly revenue and order count per region."""
    monthly = (
        enriched
        .groupby(["region_name", "year_month"])
        .agg(
            monthly_revenue=("revenue",        "sum"),
            order_count=    ("transaction_id", "count"),
        )
        .reset_index()
    )
    return monthly

monthly = aggregate(enriched)
print("Monthly aggregation:")
print(monthly)
```

---

### Part 3: Reshaping and Window Functions (30 minutes)

#### Step 3: Pivot to Wide Format

```python
import pandas as pd
import numpy as np

transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

enriched = transactions.merge(products, on="product_id", how="left").merge(regions, on="region_id", how="left")
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]
enriched["year_month"] = enriched["date"].dt.to_period("M")

monthly = enriched.groupby(["region_name","year_month"]).agg(
    monthly_revenue=("revenue","sum"),
    order_count=("transaction_id","count"),
).reset_index()

def reshape(monthly):
    """Pivot monthly data to wide format (regions × months)."""
    # Convert Period to string for pivot compatibility
    monthly["month_str"] = monthly["year_month"].astype(str)

    pivot = pd.pivot_table(
        monthly,
        values="monthly_revenue",
        index="region_name",
        columns="month_str",
        aggfunc="sum",
        fill_value=0,
    )
    pivot.columns.name = None  # remove the "month_str" label from columns header
    return pivot

revenue_pivot = reshape(monthly)
print("Revenue Pivot Table (regions × months):")
print(revenue_pivot.round(2))
```

#### Step 4: MoM Growth and Ranking

```python
import pandas as pd
import numpy as np

transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

enriched = transactions.merge(products, on="product_id", how="left").merge(regions, on="region_id", how="left")
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]
enriched["year_month"] = enriched["date"].dt.to_period("M")

monthly = enriched.groupby(["region_name","year_month"]).agg(
    monthly_revenue=("revenue","sum"),
    order_count=("transaction_id","count"),
).reset_index()

# Sort by region and month, then compute MoM growth per region
monthly = monthly.sort_values(["region_name", "year_month"])
monthly["mom_growth"] = (
    monthly
    .groupby("region_name")["monthly_revenue"]
    .pct_change()
    .mul(100)
    .round(1)
)

# Rank regions by revenue within each month
monthly["revenue_rank"] = (
    monthly
    .groupby("year_month")["monthly_revenue"]
    .rank(ascending=False, method="dense")
    .astype(int)
)

print("Monthly table with MoM growth and rank:")
print(monthly[["region_name","year_month","monthly_revenue","mom_growth","revenue_rank"]])
```

---

### Part 4: Final Output and Reflection (30 minutes)

#### Final Output 1: Regional Revenue Pivot

```python
import pandas as pd
import numpy as np

# ── Complete pipeline ────────────────────────────────────────────────────────
transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

# Structured as reusable functions
def enrich(txn, prod, reg):
    df = txn.merge(prod, on="product_id", how="left").merge(reg, on="region_id", how="left")
    df["revenue"] = df["quantity"] * df["unit_price"]
    df["year_month"] = df["date"].dt.to_period("M")
    return df

def aggregate(df):
    return df.groupby(["region_name","year_month","name"]).agg(
        revenue=("revenue","sum"),
        orders=("transaction_id","count"),
    ).reset_index()

def build_pivot(agg_df):
    monthly_regional = agg_df.groupby(["region_name","year_month"])["revenue"].sum().reset_index()
    monthly_regional["month_str"] = monthly_regional["year_month"].astype(str)
    pivot = monthly_regional.pivot(index="region_name", columns="month_str", values="revenue").fillna(0)
    pivot.columns.name = None
    return pivot.round(2)

def top_product_per_region(agg_df):
    return (
        agg_df.groupby(["region_name","name"])["revenue"].sum()
        .reset_index()
        .sort_values("revenue", ascending=False)
        .groupby("region_name")
        .first()
        .reset_index()
        .rename(columns={"name":"top_product","revenue":"top_product_revenue"})
    )

# Run the pipeline
enriched = enrich(transactions, products, regions)
agg      = aggregate(enriched)
pivot    = build_pivot(agg)
top_prod = top_product_per_region(agg)

print("=== OUTPUT 1: Regional Revenue by Month ===")
print(pivot)

print("\n=== OUTPUT 2: Top Product per Region ===")
print(top_prod)
```

#### Reflection: What Would Break With Real Data?

The pipeline above works because the data is clean and controlled. With real data, you would encounter:

| Step | Real-world risk | Defense |
|------|----------------|---------|
| Merge products | product_id in transactions but not in products dim | Use `indicator=True` and assert 0 left_only rows |
| Merge regions | region_id typos or null | Check `enriched['region_name'].isna().sum() == 0` |
| Revenue calc | Null quantity or price | Validate `transactions[['quantity','unit_price']].isna().sum()` |
| Pivot | Duplicate (region, month) combos | Use `pivot_table` not `pivot` for safety |
| MoM growth | Missing months for some regions | Sort by date before pct_change |

---

#### Exercise: Category Mix Extension

Extend the pipeline to add a `category_mix` column showing the percentage of each region's revenue that comes from "Hardware" vs "Electronics".

```python
import pandas as pd
import numpy as np

transactions = pd.DataFrame({
    "transaction_id": range(1, 21),
    "date": pd.date_range("2024-01-05", periods=20, freq="10D"),
    "product_id": [101,102,103,101,102,103,101,102,103,101,
                   102,103,101,102,103,101,102,103,101,102],
    "region_id":  ["R1","R2","R1","R3","R2","R1","R2","R3","R1","R2",
                   "R1","R3","R1","R2","R3","R1","R2","R1","R3","R2"],
    "quantity":   [5, 3, 8, 2, 6, 4, 7, 1, 9, 3,
                   5, 2, 6, 4, 8, 3, 7, 2, 5, 4],
    "unit_price": [29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,
                   49.99,19.99,29.99,49.99,19.99,29.99,49.99,19.99,29.99,49.99],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget A", "Gadget B", "Tool C"],
    "category":   ["Hardware", "Electronics", "Hardware"],
})

regions = pd.DataFrame({
    "region_id":   ["R1", "R2", "R3"],
    "region_name": ["North", "South", "West"],
    "country":     ["US", "US", "US"],
})

enriched = (
    transactions
    .merge(products, on="product_id", how="left")
    .merge(regions, on="region_id", how="left")
)
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]

# Revenue by region and category
category_rev = enriched.groupby(["region_name", "category"])["revenue"].sum().reset_index()

# Pivot: region × category
cat_pivot = category_rev.pivot(index="region_name", columns="category", values="revenue").fillna(0)
cat_pivot.columns.name = None

# Compute % share
cat_pivot["total"] = cat_pivot.sum(axis=1)
for cat in ["Electronics", "Hardware"]:
    cat_pivot[f"{cat}_pct"] = (cat_pivot[cat] / cat_pivot["total"] * 100).round(1)

print("Category Mix by Region:")
print(cat_pivot[["Electronics", "Hardware", "Electronics_pct", "Hardware_pct"]])
```

---

## Key Takeaways

- Transformation pipelines chain: `merge` (enrich) → `groupby` (aggregate) → `pivot_table` (reshape) → `pct_change`/`rank` (window)
- Structure code as named functions (`enrich()`, `aggregate()`, `reshape()`) for readability and reuse
- Validate shape after each merge step — row count increase signals duplicate dimension keys
- Real pipelines need defensive checks at every step: assert for null joins, validate dtypes, check for unexpected duplicates
- The same result can often be expressed as `pivot_table` or `groupby + unstack` — choose the one that is most readable

---

## Section 5 Review: Concepts Covered in This Project

| Concept | Where Used |
|---------|-----------|
| `pd.merge()` with chained merges | `enrich()` function |
| Named aggregations with `.agg()` | `aggregate()` function |
| `dt.to_period()` for time groupby | Month extraction step |
| `pd.pivot_table()` | `build_pivot()` function |
| `groupby + pct_change()` for MoM growth | Part 3 |
| `groupby + rank()` | Part 3 |
| `groupby + first()` for top-N per group | `top_product_per_region()` |

---

[← Previous](./lesson-09-apply-map-transform.md) | [Back to Course](./README.md) | [Next: Section 6 →](../06-etl-pipelines/lesson-01-etl-overview.md)
