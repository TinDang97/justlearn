# Lesson 7: Concatenation Patterns and Deduplication

**Course:** Data Transformation | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Combine DataFrames from multiple sources using production concat patterns
- Handle schema mismatches between DataFrames before concat
- Deduplicate after concatenation with `drop_duplicates()`
- Use `update()` and `combine_first()` for merging with priority

---

## Prerequisites

- Lesson 6: Merge/Join Advanced (pd.concat fundamentals)
- pandas DataFrames, indexing, NaN handling

---

## Lesson Outline

### Part 1: Production Concat Patterns (30 minutes)

#### Explanation

In real pipelines, you rarely hardcode a fixed list of DataFrames — you build them dynamically, often from files or API responses. The standard pattern is a list comprehension feeding `pd.concat()`.

```python
import pandas as pd

# Simulate 3 monthly files loaded into DataFrames (hardcoded for browser)
jan_data = pd.DataFrame({
    "transaction_id": [1001, 1002, 1003],
    "date": ["2024-01-05", "2024-01-12", "2024-01-18"],
    "product": ["Widget", "Gadget", "Widget"],
    "revenue": [299.70, 499.90, 149.85],
})

feb_data = pd.DataFrame({
    "transaction_id": [1004, 1005, 1006],
    "date": ["2024-02-03", "2024-02-14", "2024-02-28"],
    "product": ["Tool", "Widget", "Gadget"],
    "revenue": [199.90, 359.88, 249.95],
})

mar_data = pd.DataFrame({
    "transaction_id": [1007, 1008, 1009],
    "date": ["2024-03-07", "2024-03-15", "2024-03-22"],
    "product": ["Gadget", "Tool", "Widget"],
    "revenue": [399.92, 159.92, 419.86],
})

# In production: monthly_dfs = [pd.read_csv(f) for f in glob.glob("sales_*.csv")]
monthly_dfs = [jan_data, feb_data, mar_data]

# Audit schema consistency before concat
print("Column sets:")
for i, df in enumerate(monthly_dfs):
    print(f"  month {i+1}: {list(df.columns)}")

# Concat
annual = pd.concat(monthly_dfs, ignore_index=True)
print("\nAnnual DataFrame shape:", annual.shape)
print(annual)
```

**Handling schema mismatches** — align columns before concat:

```python
import pandas as pd

# df_a has an extra column "discount" that df_b doesn't have
df_a = pd.DataFrame({
    "transaction_id": [1, 2],
    "revenue":  [100, 200],
    "discount": [0.10, 0.05],  # extra column
})

df_b = pd.DataFrame({
    "transaction_id": [3, 4],
    "revenue":  [150, 180],
    # no discount column
})

# Option 1: concat as-is → NaN for missing columns
combined_raw = pd.concat([df_a, df_b], ignore_index=True)
print("Raw concat (NaN for missing):")
print(combined_raw)

# Option 2: align to a common schema before concat
common_cols = ["transaction_id", "revenue"]
combined_clean = pd.concat(
    [df_a[common_cols], df_b[common_cols]],
    ignore_index=True,
)
print("\nAligned concat:")
print(combined_clean)
```

<PracticeBlock
  prompt="Concat the three monthly DataFrames into one annual DataFrame using ignore_index=True. Verify the shape is (9, 4). Then compute total revenue across all 9 transactions."
  initialCode={`import pandas as pd

jan_data = pd.DataFrame({
    "transaction_id": [1001, 1002, 1003],
    "date": ["2024-01-05", "2024-01-12", "2024-01-18"],
    "product": ["Widget", "Gadget", "Widget"],
    "revenue": [299.70, 499.90, 149.85],
})

feb_data = pd.DataFrame({
    "transaction_id": [1004, 1005, 1006],
    "date": ["2024-02-03", "2024-02-14", "2024-02-28"],
    "product": ["Tool", "Widget", "Gadget"],
    "revenue": [199.90, 359.88, 249.95],
})

mar_data = pd.DataFrame({
    "transaction_id": [1007, 1008, 1009],
    "date": ["2024-03-07", "2024-03-15", "2024-03-22"],
    "product": ["Gadget", "Tool", "Widget"],
    "revenue": [399.92, 159.92, 419.86],
})

# Concat all three months
annual =

print("Shape:", annual.shape)
print("Total revenue:", annual["revenue"].sum().round(2))
`}
  hint="pd.concat([jan_data, feb_data, mar_data], ignore_index=True)"
  solution={`import pandas as pd

jan_data = pd.DataFrame({
    "transaction_id": [1001, 1002, 1003],
    "date": ["2024-01-05", "2024-01-12", "2024-01-18"],
    "product": ["Widget", "Gadget", "Widget"],
    "revenue": [299.70, 499.90, 149.85],
})

feb_data = pd.DataFrame({
    "transaction_id": [1004, 1005, 1006],
    "date": ["2024-02-03", "2024-02-14", "2024-02-28"],
    "product": ["Tool", "Widget", "Gadget"],
    "revenue": [199.90, 359.88, 249.95],
})

mar_data = pd.DataFrame({
    "transaction_id": [1007, 1008, 1009],
    "date": ["2024-03-07", "2024-03-15", "2024-03-22"],
    "product": ["Gadget", "Tool", "Widget"],
    "revenue": [399.92, 159.92, 419.86],
})

annual = pd.concat([jan_data, feb_data, mar_data], ignore_index=True)
print("Shape:", annual.shape)
print("Total revenue:", annual["revenue"].sum().round(2))
`}
/>

---

### Part 2: Deduplication After Concat (30 minutes)

#### Explanation

When concatenating data from multiple sources, duplicate records are common — the same transaction may appear in both a daily extract and a historical backfill. `drop_duplicates()` removes them.

```python
import pandas as pd

# Primary dataset
primary = pd.DataFrame({
    "record_id": [1, 2, 3, 4, 5],
    "date":      ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"],
    "value":     [100, 200, 300, 400, 500],
})

# Secondary dataset — overlaps with records 3-5 from primary
secondary = pd.DataFrame({
    "record_id": [3, 4, 5, 6, 7],
    "date":      ["2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"],
    "value":     [300, 400, 500, 600, 700],
})

# Before dedup: 10 rows (5 + 5), with 3 duplicates
combined = pd.concat([primary, secondary], ignore_index=True)
print("Before dedup:", len(combined), "rows")
print("Duplicate record_ids:", combined.duplicated(subset=["record_id"]).sum())

# After dedup on record_id: keep first occurrence
deduped = combined.drop_duplicates(subset=["record_id"], keep="first")
print("After dedup:", len(deduped), "rows")  # 7 unique records
print(deduped)
```

**keep parameter options:**

```python
import pandas as pd

data = pd.DataFrame({
    "record_id": [1, 2, 2, 3, 3, 3],
    "value":     [100, 200, 201, 300, 301, 302],
    "date":      ["2024-01-01","2024-01-01","2024-01-02","2024-01-01","2024-01-02","2024-01-03"],
})

# keep="first": keeps first occurrence of each duplicate group
print("keep='first':")
print(data.drop_duplicates(subset=["record_id"], keep="first"))

# keep="last": keeps last occurrence
print("\nkeep='last':")
print(data.drop_duplicates(subset=["record_id"], keep="last"))

# keep=False: drops ALL rows that have any duplicate — keeps only truly unique
print("\nkeep=False (drop all dupes):")
print(data.drop_duplicates(subset=["record_id"], keep=False))
```

**Identify before dropping:**

```python
import pandas as pd

data = pd.DataFrame({
    "record_id": [1, 2, 2, 3, 3],
    "value":     [100, 200, 200, 300, 305],
})

# Check how many duplicates exist before dropping
dup_count = data.duplicated(subset=["record_id"]).sum()
print(f"Found {dup_count} duplicate records out of {len(data)} total")

# Inspect the duplicates before deciding what to do
dups = data[data.duplicated(subset=["record_id"], keep=False)]
print("All duplicate rows:")
print(dups)
```

---

### Part 3: Update and combine_first() (30 minutes)

#### Explanation

Sometimes you have two DataFrames representing the same entities, and one is a "corrections" patch that should override certain values in the base DataFrame.

**`DataFrame.update(other)`** — overwrites values in-place. Non-NaN values in `other` overwrite corresponding values in `self`. NaN in `other` leaves `self` unchanged.

**`DataFrame.combine_first(other)`** — returns a new DataFrame. Fills NaN values in `self` with values from `other`. Non-NaN values in `self` are kept.

```python
import pandas as pd

# Base product catalog
base = pd.DataFrame({
    "product_id": [101, 102, 103, 104],
    "name":       ["Widget", "Gadget", "Tool", "Doohickey"],
    "price":      [29.99, 49.99, 19.99, None],     # 104 has no price yet
    "stock":      [100, 50, 200, None],
})
base = base.set_index("product_id")

# Corrections patch — new prices and stock for some products
patch = pd.DataFrame({
    "product_id": [102, 104],
    "name":       [None, "Doohickey Pro"],   # 102 name unchanged (NaN), 104 renamed
    "price":      [44.99, 39.99],            # 102 price corrected, 104 price added
    "stock":      [None, 75],                # 102 stock unchanged, 104 stock added
})
patch = patch.set_index("product_id")

# combine_first: fill NaN in base with values from patch
# base values win where they are non-NaN
combined = base.combine_first(patch)
print("combine_first result:")
print(combined)
```

```python
import pandas as pd

# update() — mutates base in-place
base = pd.DataFrame({
    "product_id": [101, 102, 103],
    "price":      [29.99, 49.99, 19.99],
    "stock":      [100, 50, 200],
})
base = base.set_index("product_id")

corrections = pd.DataFrame({
    "product_id": [102, 103],
    "price":      [44.99, None],   # correct 102 price; leave 103 price alone (NaN)
    "stock":      [None, 180],     # leave 102 stock alone; correct 103 stock
})
corrections = corrections.set_index("product_id")

# update() overwrites non-NaN values in corrections into base
base.update(corrections)
print("After update():")
print(base)
# product 102 price = 44.99 (corrected), stock = 50 (unchanged)
# product 103 price = 19.99 (unchanged), stock = 180 (corrected)
```

<PracticeBlock
  prompt="Use combine_first() to merge a base catalog with a patch DataFrame. The patch has new prices and stock for some products. The base has NaN for a new product's price and stock. combine_first should fill those NaN values with the patch values."
  initialCode={`import pandas as pd

base = pd.DataFrame({
    "product_id": [101, 102, 103, 104],
    "name":       ["Widget", "Gadget", "Tool", "New Item"],
    "price":      [29.99, 49.99, 19.99, None],
    "stock":      [100, 50, 200, None],
}).set_index("product_id")

patch = pd.DataFrame({
    "product_id": [104],
    "name":       [None],
    "price":      [59.99],
    "stock":      [25],
}).set_index("product_id")

# Use combine_first to fill NaN values in base with values from patch
result =

print(result)
# Product 104 should now have price=59.99 and stock=25
`}
  hint="base.combine_first(patch) — fills NaN in base with values from patch. The product_id index must match for the fill to work."
  solution={`import pandas as pd

base = pd.DataFrame({
    "product_id": [101, 102, 103, 104],
    "name":       ["Widget", "Gadget", "Tool", "New Item"],
    "price":      [29.99, 49.99, 19.99, None],
    "stock":      [100, 50, 200, None],
}).set_index("product_id")

patch = pd.DataFrame({
    "product_id": [104],
    "name":       [None],
    "price":      [59.99],
    "stock":      [25],
}).set_index("product_id")

result = base.combine_first(patch)
print(result)
`}
/>

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Load and Deduplicate Transaction Files

```python
import pandas as pd

# Simulate two overlapping data pulls (same-schema, some shared records)
pull_1 = pd.DataFrame({
    "transaction_id": [1001, 1002, 1003, 1004, 1005],
    "date":    ["2024-01-01","2024-01-02","2024-01-03","2024-01-04","2024-01-05"],
    "product": ["Widget","Gadget","Tool","Widget","Gadget"],
    "revenue": [299.70, 499.90, 199.90, 149.85, 399.92],
})

pull_2 = pd.DataFrame({
    "transaction_id": [1004, 1005, 1006, 1007, 1008],
    "date":    ["2024-01-04","2024-01-05","2024-01-06","2024-01-07","2024-01-08"],
    "product": ["Widget","Gadget","Tool","Widget","Tool"],
    "revenue": [149.85, 399.92, 249.95, 319.89, 159.92],
})

# Step 1: Concat
combined = pd.concat([pull_1, pull_2], ignore_index=True)
print("Before dedup:", len(combined))

# Step 2: Find duplicates
dup_count = combined.duplicated(subset=["transaction_id"]).sum()
print(f"Duplicates found: {dup_count}")

# Step 3: Deduplicate (keep first)
deduped = combined.drop_duplicates(subset=["transaction_id"], keep="first")
print("After dedup:", len(deduped))
print("\nFinal dataset:")
print(deduped)
```

#### Exercise 2: Customer Master Record Merge

```python
import pandas as pd

# Two systems with partial customer data
system_a = pd.DataFrame({
    "customer_id": [1, 2, 3, 4],
    "name":        ["Alice", "Bob", None, "Dave"],
    "email":       ["alice@a.com", None, "carol@a.com", "dave@a.com"],
    "phone":       [None, "555-0102", "555-0103", None],
}).set_index("customer_id")

system_b = pd.DataFrame({
    "customer_id": [2, 3, 4, 5],
    "name":        ["Bob Smith", "Carol", "David", "Eve"],
    "email":       ["bob@b.com", None, None, "eve@b.com"],
    "phone":       ["555-0202", "555-0303", "555-0404", "555-0505"],
}).set_index("customer_id")

# combine_first: system_a values win where non-NaN, gaps filled from system_b
master = system_a.combine_first(system_b)

print("Master customer records:")
print(master)
# Customer 2: name=Bob (from a, wins), email=bob@b.com (filled from b), phone=555-0102 (from a)
# Customer 5: fully from system_b (not in system_a)
```

---

## Key Takeaways

- `pd.concat([list_of_dfs], ignore_index=True)` — standard pattern for stacking same-schema DataFrames
- Audit column sets before concat to catch schema mismatches early
- `drop_duplicates(subset=["id"], keep="first")` — deduplicate on a key column after concat
- `duplicated(subset=["id"]).sum()` — count duplicates before dropping
- `combine_first(other)` — fills NaN in self with values from other; returns new DataFrame
- `update(other)` — overwrites non-NaN values from other into self in-place

---

## Common Mistakes to Avoid

- **Ignoring schema mismatches before concat**: unexpected NaN columns silently corrupt downstream calculations
- **Not checking duplicates after concat**: always call `duplicated().sum()` before proceeding with analysis
- **Confusing update and combine_first**: update mutates in-place; combine_first returns a new object

---

[← Previous](./lesson-06-merge-join-advanced.md) | [Back to Course](./README.md) | [Next →](./lesson-08-window-functions.md)
