# Lesson 6: Merging DataFrames — Multi-Step Enrichment and Concat

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Chain multiple merges to enrich a fact table with dimension tables
- Use `pd.concat()` to stack DataFrames vertically or horizontally
- Use `.join()` for index-based merging
- Understand `pd.merge_asof()` for time-series alignment

---

## Prerequisites

- Lesson 5: Merge/Join Basics (join types, indicator, key handling)

---

## Lesson Outline

### Part 1: Chained Merges (30 minutes)

#### Explanation

In data engineering, the most common merge pattern is **fact table enrichment**: start with a central fact table (orders, transactions, events) and chain `.merge()` calls to attach dimension tables (products, customers, regions, time).

```python
import pandas as pd

# Fact table
sales = pd.DataFrame({
    "sale_id":     [1, 2, 3, 4, 5, 6],
    "product_id":  [101, 102, 101, 103, 102, 103],
    "customer_id": [201, 202, 203, 201, 202, 203],
    "store_id":    [301, 301, 302, 302, 303, 303],
    "quantity":    [3, 1, 5, 2, 4, 1],
})

# Dimension tables
products = pd.DataFrame({
    "product_id":   [101, 102, 103],
    "product_name": ["Widget", "Gadget", "Tool"],
    "category":     ["Hardware", "Electronics", "Hardware"],
    "unit_price":   [29.99, 49.99, 19.99],
})

customers = pd.DataFrame({
    "customer_id":   [201, 202, 203],
    "customer_name": ["Alice", "Bob", "Carol"],
    "segment":       ["Premium", "Standard", "Premium"],
})

stores = pd.DataFrame({
    "store_id":   [301, 302, 303],
    "store_name": ["Downtown", "Uptown", "Mall"],
    "region":     ["North", "North", "South"],
})

# Chain merges: sales → products → customers → stores
enriched = (
    sales
    .merge(products,  on="product_id",  how="left")
    .merge(customers, on="customer_id", how="left")
    .merge(stores,    on="store_id",    how="left")
)

# Compute revenue
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]

print("Shape after enrichment:", enriched.shape)
print(enriched[["sale_id", "product_name", "customer_name", "region", "revenue"]])
```

Always audit shape at each step to catch unexpected row counts:

```python
import pandas as pd

sales = pd.DataFrame({
    "sale_id":     [1, 2, 3, 4, 5, 6],
    "product_id":  [101, 102, 101, 103, 102, 103],
    "customer_id": [201, 202, 203, 201, 202, 203],
    "store_id":    [301, 301, 302, 302, 303, 303],
    "quantity":    [3, 1, 5, 2, 4, 1],
})

products = pd.DataFrame({
    "product_id":   [101, 102, 103],
    "product_name": ["Widget", "Gadget", "Tool"],
    "unit_price":   [29.99, 49.99, 19.99],
})

customers = pd.DataFrame({
    "customer_id":   [201, 202, 203],
    "customer_name": ["Alice", "Bob", "Carol"],
})

step1 = sales.merge(products, on="product_id", how="left")
print("After merge products:", step1.shape)  # should be same row count as sales

step2 = step1.merge(customers, on="customer_id", how="left")
print("After merge customers:", step2.shape)  # still same row count
```

<PracticeBlock
  prompt="Chain two merges: start with sales, merge products (on product_id), then merge customers (on customer_id). Use how='left' for both. After merging, compute revenue = quantity * unit_price. Print the result with columns: sale_id, product_name, customer_name, revenue."
  initialCode={`import pandas as pd

sales = pd.DataFrame({
    "sale_id":     [1, 2, 3, 4, 5, 6],
    "product_id":  [101, 102, 101, 103, 102, 103],
    "customer_id": [201, 202, 203, 201, 202, 203],
    "quantity":    [3, 1, 5, 2, 4, 1],
})

products = pd.DataFrame({
    "product_id":   [101, 102, 103],
    "product_name": ["Widget", "Gadget", "Tool"],
    "unit_price":   [29.99, 49.99, 19.99],
})

customers = pd.DataFrame({
    "customer_id":   [201, 202, 203],
    "customer_name": ["Alice", "Bob", "Carol"],
})

# Chain merges
enriched = (
    sales
    # merge products
    # merge customers
)

enriched["revenue"] =
print(enriched[["sale_id", "product_name", "customer_name", "revenue"]])
`}
  hint="Use .merge(products, on='product_id', how='left').merge(customers, on='customer_id', how='left') chained on sales. Then revenue = enriched['quantity'] * enriched['unit_price']."
  solution={`import pandas as pd

sales = pd.DataFrame({
    "sale_id":     [1, 2, 3, 4, 5, 6],
    "product_id":  [101, 102, 101, 103, 102, 103],
    "customer_id": [201, 202, 203, 201, 202, 203],
    "quantity":    [3, 1, 5, 2, 4, 1],
})

products = pd.DataFrame({
    "product_id":   [101, 102, 103],
    "product_name": ["Widget", "Gadget", "Tool"],
    "unit_price":   [29.99, 49.99, 19.99],
})

customers = pd.DataFrame({
    "customer_id":   [201, 202, 203],
    "customer_name": ["Alice", "Bob", "Carol"],
})

enriched = (
    sales
    .merge(products, on="product_id", how="left")
    .merge(customers, on="customer_id", how="left")
)

enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]
print(enriched[["sale_id", "product_name", "customer_name", "revenue"]])
`}
/>

---

### Part 2: pd.concat() (30 minutes)

#### Explanation

`pd.concat()` stacks DataFrames together — either vertically (more rows) or horizontally (more columns).

**Vertical concat** — combining datasets with the same schema:

```python
import pandas as pd

# Monthly sales data — same columns, different time periods
jan = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=5, freq="D"),
    "product": ["Widget","Gadget","Widget","Tool","Gadget"],
    "revenue": [300, 500, 280, 200, 450],
})

feb = pd.DataFrame({
    "date": pd.date_range("2024-02-01", periods=5, freq="D"),
    "product": ["Widget","Tool","Gadget","Widget","Tool"],
    "revenue": [320, 190, 480, 310, 210],
})

mar = pd.DataFrame({
    "date": pd.date_range("2024-03-01", periods=5, freq="D"),
    "product": ["Gadget","Widget","Tool","Gadget","Widget"],
    "revenue": [510, 290, 195, 490, 330],
})

# Stack all three months into one annual DataFrame
annual = pd.concat([jan, feb, mar], ignore_index=True)
print("Shape:", annual.shape)   # (15, 3)
print(annual)
```

**keys parameter** — add a MultiIndex label to track source:

```python
import pandas as pd

jan = pd.DataFrame({"product": ["Widget","Gadget"], "revenue": [300, 500]})
feb = pd.DataFrame({"product": ["Widget","Tool"],   "revenue": [320, 190]})

# keys label each source chunk
combined = pd.concat([jan, feb], keys=["January", "February"])
print(combined)
# Outer index = month, inner index = original row index

# Access January slice
print(combined.loc["January"])
```

**Horizontal concat** (axis=1) — adding more columns:

```python
import pandas as pd

features = pd.DataFrame({
    "customer_id": [1, 2, 3],
    "age": [25, 32, 45],
    "income": [50000, 72000, 95000],
})

scores = pd.DataFrame({
    "customer_id": [1, 2, 3],
    "credit_score": [720, 680, 750],
    "risk_tier":    ["Low", "Medium", "Low"],
})

# Horizontal concat — assumes same row order and index alignment
combined = pd.concat([features, scores.drop(columns=["customer_id"])], axis=1)
print(combined)
```

**Schema mismatch** — missing columns become NaN:

```python
import pandas as pd

df1 = pd.DataFrame({"a": [1,2], "b": [3,4]})
df2 = pd.DataFrame({"b": [5,6], "c": [7,8]})

# Column 'a' not in df2 → NaN; column 'c' not in df1 → NaN
combined = pd.concat([df1, df2], ignore_index=True)
print(combined)
#      a  b    c
# 0  1.0  3  NaN
# 1  2.0  4  NaN
# 2  NaN  5  7.0
# 3  NaN  6  8.0
```

---

### Part 3: .join() and merge_asof() (30 minutes)

#### Explanation

**`.join()`** is shorthand for index-based merging. It merges `self` (left) with `other` (right) on their indexes:

```python
import pandas as pd

# DataFrames with customer_id as the index
customers = pd.DataFrame(
    {"name": ["Alice", "Bob", "Carol"], "city": ["NYC", "LA", "Chicago"]},
    index=[101, 102, 103],
)

orders_summary = pd.DataFrame(
    {"total_orders": [5, 3, 8], "total_spend": [750, 320, 1200]},
    index=[101, 102, 103],
)

# Join on index — no 'on' parameter needed
result = customers.join(orders_summary, how="left")
print(result)
```

**`pd.merge_asof()`** — time-based nearest-match merge. Each row in the left table is matched to the **most recent** row in the right table whose key is <= the left row's key. Critical for financial data and sensor data.

```python
import pandas as pd

# Transactions with timestamps
transactions = pd.DataFrame({
    "timestamp": pd.to_datetime(["2024-01-05 09:15", "2024-01-05 10:30",
                                  "2024-01-05 14:00", "2024-01-06 09:00"]),
    "product_id": [101, 102, 101, 103],
    "quantity":   [5, 3, 8, 2],
})

# FX rates published at specific times (not every minute)
fx_rates = pd.DataFrame({
    "timestamp": pd.to_datetime(["2024-01-05 09:00", "2024-01-05 12:00",
                                  "2024-01-06 09:00"]),
    "eur_usd":   [1.0921, 1.0915, 1.0930],
})

# merge_asof: attach the most recent FX rate to each transaction
# Both DataFrames must be sorted by the timestamp column
transactions = transactions.sort_values("timestamp")
fx_rates = fx_rates.sort_values("timestamp")

enriched = pd.merge_asof(
    transactions,
    fx_rates,
    on="timestamp",
    direction="backward",  # use the most recent rate that is <= transaction time
)
print(enriched)
```

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Combining Regional DataFrames

```python
import pandas as pd

# Four regional DataFrames — same schema
north = pd.DataFrame({"product":["Widget","Gadget"], "qty":[100,80],  "revenue":[2990,3992]})
south = pd.DataFrame({"product":["Widget","Tool"],   "qty":[90, 50],  "revenue":[2691,999]})
east  = pd.DataFrame({"product":["Gadget","Tool"],   "qty":[70, 60],  "revenue":[3499,1199]})
west  = pd.DataFrame({"product":["Widget","Gadget"], "qty":[110,85],  "revenue":[3298,4249]})

# Step 1: Add region column before concat so we preserve source
north["region"] = "North"
south["region"] = "South"
east["region"]  = "East"
west["region"]  = "West"

# Step 2: Concat all regions
combined = pd.concat([north, south, east, west], ignore_index=True)
print("Total rows:", len(combined))  # should be 8

# Step 3: Verify total revenue is sum of all parts
print("Total revenue:", combined["revenue"].sum())
print(combined)
```

#### Exercise 2: Full Enrichment Pipeline with Discount

```python
import pandas as pd

transactions = pd.DataFrame({
    "txn_id":       [1, 2, 3, 4, 5, 6],
    "product_id":   [101, 102, 101, 103, 102, 103],
    "store_id":     [10, 11, 10, 12, 11, 12],
    "promo_id":     ["P1", None, "P2", "P1", None, "P2"],
    "quantity":     [3, 1, 5, 2, 4, 1],
})

products = pd.DataFrame({
    "product_id": [101, 102, 103],
    "name":       ["Widget", "Gadget", "Tool"],
    "unit_price": [29.99, 49.99, 19.99],
})

stores = pd.DataFrame({
    "store_id":   [10, 11, 12],
    "store_name": ["Downtown", "Uptown", "Mall"],
})

promotions = pd.DataFrame({
    "promo_id":    ["P1", "P2"],
    "discount_pct": [0.10, 0.15],  # 10% and 15% off
})

# Enrich pipeline
enriched = (
    transactions
    .merge(products,   on="product_id", how="left")
    .merge(stores,     on="store_id",   how="left")
    .merge(promotions, on="promo_id",   how="left")
)

# Fill no-promo with 0% discount
enriched["discount_pct"] = enriched["discount_pct"].fillna(0)

# Final price after discount
enriched["final_price"] = (
    enriched["quantity"] * enriched["unit_price"] * (1 - enriched["discount_pct"])
)

print(enriched[["txn_id", "name", "store_name", "discount_pct", "final_price"]])
print("\nTotal final revenue:", enriched["final_price"].sum().round(2))
```

---

## Key Takeaways

- Chain `.merge()` calls to progressively enrich a fact table with dimension data
- Check shape after each merge step — row count should not increase unless expected
- `pd.concat([list_of_dfs], ignore_index=True)` — stack DataFrames vertically
- `pd.concat([...], axis=1)` — add columns horizontally
- `keys=["a","b"]` adds a MultiIndex level to track which concat source each row came from
- `.join()` is index-based merge — useful when DataFrames share an index
- `pd.merge_asof()` — nearest-match time merge for aligning time series at different granularities

---

## Common Mistakes to Avoid

- **Not auditing shape after chained merges**: a duplicated key in a dimension table causes row explosion — always verify `len(enriched) == len(fact_table)`
- **concat with mismatched columns**: unexpected NaN columns appear — align schemas before concat or fill after
- **merge_asof on unsorted data**: will produce wrong matches — always sort both DataFrames by the merge key first

---

[← Previous](./lesson-05-merge-join-basics.md) | [Back to Course](./README.md) | [Next →](./lesson-07-concat-append.md)
