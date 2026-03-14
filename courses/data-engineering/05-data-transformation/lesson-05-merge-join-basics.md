# Lesson 5: Merging DataFrames — SQL-Style Joins

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand inner, left, right, and outer joins conceptually and practically
- Use `pd.merge()` to combine DataFrames on a common key
- Handle different key column names with `left_on` / `right_on`
- Detect and handle merge mismatches with `indicator=True`

---

## Prerequisites

- pandas DataFrame selection and filtering
- Basic understanding of relational data (primary keys, foreign keys)

---

## Lesson Outline

### Part 1: Join Types Explained (30 minutes)

#### Explanation

A merge (join) combines two DataFrames by matching rows based on a shared key column. There are four join types, each controlling which rows survive:

```
INNER JOIN:  only rows where key exists in BOTH tables
LEFT JOIN:   all rows from left table; NaN for unmatched right columns
RIGHT JOIN:  all rows from right table; NaN for unmatched left columns
OUTER JOIN:  all rows from both tables; NaN where no match on either side
```

```python
import pandas as pd

# Orders table (fact table)
orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

# Customers table (dimension table — missing customer 104)
customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
    "city":        ["NYC", "LA", "Chicago", "Boston"],
})

# INNER: only orders with matching customer record (drops order 5: customer 104)
inner = pd.merge(orders, customers, on="customer_id", how="inner")
print("INNER JOIN:", inner.shape, "rows")
print(inner)

# LEFT: all orders, NaN for customer 104 details
left = pd.merge(orders, customers, on="customer_id", how="left")
print("\nLEFT JOIN:", left.shape, "rows")
print(left)
```

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
    "city":        ["NYC", "LA", "Chicago", "Boston"],
})

# RIGHT: all customers, including Dave (105) who has no orders
right = pd.merge(orders, customers, on="customer_id", how="right")
print("RIGHT JOIN:", right.shape, "rows")
print(right)

# OUTER: all rows from both — unmatched get NaN
outer = pd.merge(orders, customers, on="customer_id", how="outer")
print("\nOUTER JOIN:", outer.shape, "rows")
print(outer)
```

<PracticeBlock
  prompt="Perform an inner join and a left join between orders and customers on customer_id. Print the row count for each and observe the difference — the left join should have more rows than the inner join."
  initialCode={`import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
    "city":        ["NYC", "LA", "Chicago", "Boston"],
})

# Inner join
inner =
print("Inner join rows:", len(inner))
print(inner)

# Left join
left =
print("\nLeft join rows:", len(left))
print(left)
`}
  hint="pd.merge(orders, customers, on='customer_id', how='inner') and pd.merge(orders, customers, on='customer_id', how='left')"
  solution={`import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
    "city":        ["NYC", "LA", "Chicago", "Boston"],
})

inner = pd.merge(orders, customers, on="customer_id", how="inner")
print("Inner join rows:", len(inner))
print(inner)

left = pd.merge(orders, customers, on="customer_id", how="left")
print("\nLeft join rows:", len(left))
print(left)
`}
/>

---

### Part 2: Key Handling (30 minutes)

#### Explanation

Real-world tables rarely have identically named key columns. pandas provides parameters to handle this.

**Different key names** — use `left_on` and `right_on`:

```python
import pandas as pd

sales = pd.DataFrame({
    "sale_id":   [1, 2, 3, 4, 5],
    "prod_id":   [201, 202, 201, 203, 202],
    "quantity":  [5, 3, 8, 2, 6],
})

products = pd.DataFrame({
    "product_id": [201, 202, 203],
    "name":       ["Widget", "Gadget", "Tool"],
    "unit_price": [29.99, 49.99, 19.99],
})

# Key names differ: "prod_id" vs "product_id"
enriched = pd.merge(
    sales,
    products,
    left_on="prod_id",
    right_on="product_id",
    how="left",
)
print(enriched)
# Both key columns appear — drop the duplicate if needed
enriched = enriched.drop(columns=["product_id"])
enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]
print(enriched)
```

**Multiple key columns** — match on a combination of columns:

```python
import pandas as pd

actuals = pd.DataFrame({
    "year":    [2023, 2023, 2024, 2024],
    "month":   [1, 2, 1, 2],
    "revenue": [15000, 18000, 16500, 19200],
})

budget = pd.DataFrame({
    "year":   [2023, 2023, 2024, 2024],
    "month":  [1, 2, 1, 2],
    "target": [14000, 17000, 17000, 20000],
})

# Merge on both year AND month
combined = pd.merge(actuals, budget, on=["year", "month"], how="left")
combined["vs_target"] = combined["revenue"] - combined["target"]
print(combined)
```

**Validate parameter** — catch data quality issues early:

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5],
    "customer_id": [101, 102, 103, 101, 104],
    "amount":      [150, 230, 95, 310, 180],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103],
    "name":        ["Alice", "Bob", "Carol"],
})

# validate="m:1" asserts each order maps to at most one customer
try:
    merged = pd.merge(orders, customers, on="customer_id", how="left", validate="m:1")
    print("Merge validated OK, shape:", merged.shape)
except Exception as e:
    print("Validation error:", e)
```

---

### Part 3: Diagnosing Merge Issues (30 minutes)

#### Explanation

**indicator=True** adds a `_merge` column that tells you the source of each row:
- `"both"` — row matched in both DataFrames
- `"left_only"` — row came from left only (no match in right)
- `"right_only"` — row came from right only (no match in left)

```python
import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
})

# Outer join with indicator to see all match statuses
merged = pd.merge(orders, customers, on="customer_id", how="outer", indicator=True)
print(merged)
print("\nMatch summary:")
print(merged["_merge"].value_counts())

# Find orders with no matching customer (unmatched orders)
unmatched_orders = merged[merged["_merge"] == "left_only"]
print("\nOrders with no customer match:")
print(unmatched_orders[["order_id", "customer_id", "amount"]])
```

**Suffixes** — rename overlapping columns:

```python
import pandas as pd

# Two DataFrames with a "status" column
orders = pd.DataFrame({
    "order_id":  [1, 2, 3],
    "customer_id": [101, 102, 103],
    "status":    ["shipped", "pending", "delivered"],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103],
    "name":        ["Alice", "Bob", "Carol"],
    "status":      ["active", "inactive", "active"],
})

# Both have a "status" column — use suffixes to disambiguate
merged = pd.merge(
    orders, customers,
    on="customer_id",
    how="left",
    suffixes=("_order", "_customer"),
)
print(merged[["order_id", "status_order", "status_customer"]])
```

**Many-to-many pitfall** — duplicate keys cause row explosion:

```python
import pandas as pd

# Orders: customer 101 appears twice
orders = pd.DataFrame({
    "order_id":    [1, 2],
    "customer_id": [101, 101],
    "amount":      [150, 200],
})

# Customers: customer 101 also appears twice (data quality issue)
customers = pd.DataFrame({
    "customer_id": [101, 101],
    "name":        ["Alice", "Alice Backup"],
})

# m:m merge explodes: 2 orders × 2 customer rows = 4 rows
merged = pd.merge(orders, customers, on="customer_id", how="inner")
print("Rows after m:m merge:", len(merged))  # 4 rows!
print(merged)
```

<PracticeBlock
  prompt="Merge orders and customers with how='outer' and indicator=True. Then find all orders that have no matching customer (left_only) and all customers that have no orders (right_only)."
  initialCode={`import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
})

# Outer join with indicator
merged =

# Orders with no customer
unmatched_orders =
print("Unmatched orders:")
print(unmatched_orders)

# Customers with no orders
customers_no_orders =
print("\nCustomers with no orders:")
print(customers_no_orders)
`}
  hint="Use how='outer', indicator=True. Then filter: merged[merged['_merge'] == 'left_only'] and merged[merged['_merge'] == 'right_only']"
  solution={`import pandas as pd

orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 4, 5, 6],
    "customer_id": [101, 102, 103, 101, 104, 102],
    "amount":      [150, 230, 95, 310, 180, 75],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103, 105],
    "name":        ["Alice", "Bob", "Carol", "Dave"],
})

merged = pd.merge(orders, customers, on="customer_id", how="outer", indicator=True)

unmatched_orders = merged[merged["_merge"] == "left_only"]
print("Unmatched orders:")
print(unmatched_orders[["order_id", "customer_id", "amount"]])

customers_no_orders = merged[merged["_merge"] == "right_only"]
print("\nCustomers with no orders:")
print(customers_no_orders[["customer_id", "name"]])
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Enrichment Pipeline

```python
import pandas as pd

transactions = pd.DataFrame({
    "txn_id":     [1, 2, 3, 4, 5, 6],
    "product_id": [201, 202, 201, 203, 202, 203],
    "store_id":   [10, 11, 10, 12, 11, 12],
    "quantity":   [3, 2, 5, 1, 4, 2],
})

products = pd.DataFrame({
    "product_id": [201, 202, 203],
    "product_name": ["Widget", "Gadget", "Tool"],
    "unit_price":   [29.99, 49.99, 19.99],
})

stores = pd.DataFrame({
    "store_id":   [10, 11, 12],
    "store_name": ["Downtown", "Uptown", "Suburb"],
    "region":     ["North", "North", "South"],
})

# Two sequential merges: enrich transactions with product and store data
enriched = (
    transactions
    .merge(products, on="product_id", how="left")
    .merge(stores, on="store_id", how="left")
)

enriched["revenue"] = enriched["quantity"] * enriched["unit_price"]
print(enriched)
print("\nTotal revenue:", enriched["revenue"].sum())
```

#### Exercise 2: Anti-Join (Products Never Ordered)

```python
import pandas as pd

products = pd.DataFrame({
    "product_id":   [201, 202, 203, 204, 205],
    "product_name": ["Widget", "Gadget", "Tool", "Doohickey", "Thingamajig"],
    "category":     ["Hardware", "Electronics", "Hardware", "Electronics", "Hardware"],
})

orders = pd.DataFrame({
    "order_id":   [1, 2, 3, 4, 5],
    "product_id": [201, 202, 201, 203, 202],
    "quantity":   [3, 2, 5, 1, 4],
})

# Anti-join pattern: left join + filter for left_only
merged = pd.merge(products, orders, on="product_id", how="left", indicator=True)
never_ordered = merged[merged["_merge"] == "left_only"][["product_id", "product_name", "category"]]

print("Products never ordered:")
print(never_ordered)
```

---

## Key Takeaways

- `pd.merge(df1, df2, on="key", how="inner/left/right/outer")` — core merge API
- **inner** keeps only matched rows; **left** keeps all left rows; **outer** keeps all rows from both
- `left_on="a", right_on="b"` — when key columns have different names
- `on=["col1","col2"]` — merge on multiple columns simultaneously
- `indicator=True` adds `_merge` column showing match status per row
- `suffixes=("_x","_y")` — rename clashing column names after merge
- Many-to-many merges cause row explosion — always validate key uniqueness

---

## Common Mistakes to Avoid

- **Row explosion from duplicate keys**: if either table has duplicate key values, merged rows multiply — use `validate` to catch this
- **Left join and assuming no NaN**: left joins CAN produce NaN in right-side columns for unmatched rows — always check
- **Forgetting to drop the duplicate key column**: after `left_on/right_on`, both key columns appear — drop one

---

[← Previous](./lesson-04-melt-reshape.md) | [Back to Course](./README.md) | [Next →](./lesson-06-merge-join-advanced.md)
