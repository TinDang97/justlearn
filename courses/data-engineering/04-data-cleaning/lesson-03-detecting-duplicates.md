# Lesson 3: Detecting Duplicate Rows

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 30 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Distinguish between exact row duplicates and logical duplicates keyed on a business identifier
- Use `duplicated()` to generate a boolean mask identifying duplicate rows
- Control duplicate detection behavior with the `keep` parameter
- Use the `subset` parameter to check duplicates on specific columns
- Use `value_counts()` to find non-unique values in an ID column

---

## Prerequisites

- Lesson 1: Detecting Missing Values — boolean Series operations
- Basic pandas: `df[boolean_mask]`

---

## Lesson Outline

### Part 1: What is a Duplicate?

Two categories of duplicates appear in real datasets:

**Exact row duplicate:** Every column value is identical across two or more rows. This is almost always a data quality bug — the same event or record was ingested twice.

**Logical duplicate:** Two rows share the same business key (e.g., `sale_id`) but may differ in other columns (e.g., a timestamp, a status update). Whether these are duplicates depends on your domain.

In `sales_dirty.csv`, row `S002` appears twice with identical values in every column — an exact duplicate introduced by a double-ingestion event.

<Info>

In sales data, duplicate `sale_id` values are almost always a data quality bug. In web event logs, duplicate event IDs can be expected (at-least-once delivery) and you intentionally keep them. Know your domain before removing anything.

</Info>

---

### Part 2: `duplicated()` — Returns a Boolean Mask

`duplicated()` returns a boolean Series with `True` for rows that are duplicates of an earlier row:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Boolean Series: True = this row is a duplicate
dup_mask = df.duplicated()
print(dup_mask.sum())  # How many duplicates?

# Show the duplicate rows
print(df[df.duplicated()])
```

By default, the **first occurrence** is marked `False` (kept) and subsequent occurrences are marked `True` (duplicates).

**The `keep` parameter:**

| Value | Behavior |
|-------|----------|
| `'first'` (default) | Mark all duplicates except the first occurrence as `True` |
| `'last'` | Mark all duplicates except the last occurrence as `True` |
| `False` | Mark **all** occurrences of a duplicated row as `True` (including the first) |

```python
# Mark all occurrences of duplicates (useful for inspection)
all_dups = df[df.duplicated(keep=False)]
print(all_dups)
```

---

### Part 3: `subset` Parameter — Check Specific Columns

Sometimes you want to check for duplicates on a specific business key, not on all columns:

```python
# Check if 'sale_id' alone has duplicates
sale_id_dups = df[df.duplicated(subset=['sale_id'])]
print("Duplicate sale_ids:")
print(sale_id_dups[['sale_id', 'customer', 'product']])
```

This detects rows where the sale_id repeats, even if other columns differ. This is the right check for a primary key constraint.

You can also check compound keys:

```python
# Check if (customer, product, date) combination repeats
compound_dups = df[df.duplicated(subset=['customer', 'product', 'date'])]
```

---

### Part 4: `value_counts()` for Non-Unique IDs

For a quick audit of whether an ID column is unique, `value_counts()` makes it easy to see which IDs appear more than once:

```python
id_counts = df['sale_id'].value_counts()

# IDs that appear more than once
non_unique = id_counts[id_counts > 1]
print(non_unique)
```

This approach is more readable than `duplicated(subset=['sale_id'])` when you want to see exactly which IDs are repeated and how many times.

---

<PracticeBlock
  prompt="Detect duplicate rows in sales_dirty.csv. How many duplicates are there? Show the duplicate rows."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Count duplicates and show them
`}
  hint="Use df.duplicated().sum() to count and df[df.duplicated()] to show them."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

dup_count = df.duplicated().sum()
print(f"Number of duplicate rows: {dup_count}")

print("\nDuplicate rows:")
print(df[df.duplicated()])
`}
/>

<PracticeBlock
  prompt="Check if 'sale_id' alone has duplicates using subset=['sale_id']. Print the duplicated sale_ids and their row data."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Check for duplicate sale_ids
`}
  hint="Use df.duplicated(subset=['sale_id']) to check only the sale_id column for duplicates."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Check for duplicate sale_ids
id_dup_mask = df.duplicated(subset=['sale_id'])
print(f"Rows with duplicate sale_id: {id_dup_mask.sum()}")

print("\nRows with duplicate sale_ids:")
print(df[id_dup_mask][['sale_id', 'customer', 'product', 'date']])

# Also show via value_counts for comparison
print("\nSale ID frequency (values appearing > 1 time):")
id_counts = df['sale_id'].value_counts()
print(id_counts[id_counts > 1])
`}
/>

---

## Key Takeaways

- `duplicated()` returns a boolean Series — `True` for rows that are copies of an earlier row
- The `keep` parameter controls which occurrence gets `True`: `'first'` (default), `'last'`, or `False` (all)
- `subset` restricts duplicate detection to specific columns — essential for business-key checks
- `value_counts()` on an ID column is a fast way to audit uniqueness
- Always distinguish between exact duplicates (data quality bug) and logical duplicates (domain-specific behavior)

---

## Common Mistakes to Avoid

- **Forgetting `keep=False` when you want to see ALL copies.** `duplicated()` with the default `keep='first'` shows only the duplicate copies, not the original. To see both, use `keep=False`.
- **Assuming duplicated() catches logical duplicates automatically.** If two rows share a sale_id but differ in timestamp, only `subset=['sale_id']` will find them — the full-row check will not.
- **Removing duplicates before investigating their cause.** Find out why duplicates exist (double ingestion? join explosion?) before deleting them. The fix may be upstream.

---

## Next Lesson Preview

In **Lesson 4: Removing Duplicate Rows** we will act on the duplicates we found — using `drop_duplicates()` with the right `keep` and `subset` settings, and verifying the result.

---

[Back to Section Overview](./README.md) | [Next Lesson: Removing Duplicate Rows →](./lesson-04-removing-duplicates.md)
