# Lesson 4: Removing Duplicate Rows

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 30 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Use `drop_duplicates()` to remove exact duplicate rows from a DataFrame
- Deduplicate on a business key using the `subset` parameter
- Sort before deduplicating to control which occurrence is retained
- Verify deduplication by comparing shapes and re-running `duplicated().sum()`

---

## Prerequisites

- Lesson 3: Detecting Duplicate Rows — `duplicated()`, `keep`, `subset`

---

## Lesson Outline

### Part 1: `drop_duplicates()` — Remove Duplicate Rows

`drop_duplicates()` is the action counterpart to `duplicated()`. It removes rows that are duplicates, returning a new DataFrame:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

print(f"Before: {df.shape}")          # (13, 8)
df_clean = df.drop_duplicates()
print(f"After:  {df_clean.shape}")    # (12, 8)

# Verify no duplicates remain
print(df_clean.duplicated().sum())    # 0
```

Like `duplicated()`, it supports the same `keep` parameter:

| Value | Behavior |
|-------|----------|
| `'first'` (default) | Keep the first occurrence, drop subsequent ones |
| `'last'` | Keep the last occurrence, drop earlier ones |
| `False` | Drop **all** occurrences of any duplicated row |

---

### Part 2: Subset-Based Deduplication — Business Key

Deduplicating on a business key (`sale_id`) rather than all columns:

```python
# Deduplicate on sale_id — keep only the first row per unique sale_id
df_deduped = df.drop_duplicates(subset=['sale_id'])

print(f"Unique sale_ids: {df_deduped['sale_id'].nunique()}")
print(f"Shape: {df_deduped.shape}")
```

This is stricter than full-row deduplication: it removes rows that share a sale_id even if other columns differ.

---

### Part 3: Deduplication Order Matters

When you have multiple occurrences and want to keep the most recent, **sort before deduplicating**:

<Tip>

When deduplicating event logs, sort by timestamp descending first, then `drop_duplicates(subset=['event_id'], keep='first')` to keep the most recent version of each event.

</Tip>

```python
# Sort by date descending so the most recent record is first
df_sorted = df.sort_values('date', ascending=False)

# Now keep='first' retains the most recent record for each sale_id
df_latest = df_sorted.drop_duplicates(subset=['sale_id'], keep='first')

# Optionally restore original order
df_latest = df_latest.sort_values('sale_id').reset_index(drop=True)
```

Without sorting first, `keep='first'` keeps whichever row appears first in the original file — which may not be the one you want.

---

### Part 4: Verifying Deduplication

Always verify after deduplication. A two-step verification:

```python
# Step 1: shape changed as expected
print(f"Before: {df.shape}")
df_clean = df.drop_duplicates()
print(f"After:  {df_clean.shape}")

# Step 2: zero duplicates remain
remaining_dups = df_clean.duplicated().sum()
print(f"Remaining duplicates: {remaining_dups}")  # Must be 0

# Step 3: row count matches expected unique count
expected_unique = df['sale_id'].nunique()
print(f"Expected unique rows: {expected_unique}")
print(f"Actual rows: {len(df_clean)}")
```

---

<PracticeBlock
  prompt="Remove exact duplicate rows from sales_dirty.csv. Verify the shape changed from 13 to 12 rows."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}")
# Remove exact duplicates and verify
`}
  hint="Use df.drop_duplicates() to remove exact duplicates, then check shape and duplicated().sum()."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}")

df_clean = df.drop_duplicates()
print(f"After:  {df_clean.shape}")

remaining = df_clean.duplicated().sum()
print(f"Remaining duplicates: {remaining}")

# Verify exactly 1 row was removed
assert df_clean.shape[0] == 12, "Expected 12 rows after dedup"
print("Verification passed: 13 → 12 rows")
`}
/>

<PracticeBlock
  prompt="Deduplicate by 'sale_id' keeping the first occurrence. Verify no duplicate sale_ids remain."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}")
print(f"Unique sale_ids: {df['sale_id'].nunique()}")
# Deduplicate on sale_id
`}
  hint="Use df.drop_duplicates(subset=['sale_id']) to deduplicate on the business key."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print(f"Before: {df.shape}, unique sale_ids: {df['sale_id'].nunique()}")

df_deduped = df.drop_duplicates(subset=['sale_id'])
print(f"After:  {df_deduped.shape}, unique sale_ids: {df_deduped['sale_id'].nunique()}")

# Verify: all sale_ids are unique
assert df_deduped['sale_id'].duplicated().sum() == 0
print("Verification passed: no duplicate sale_ids remain")
`}
/>

---

## Key Takeaways

- `drop_duplicates()` removes duplicate rows and returns a new DataFrame (does not modify in place unless `inplace=True`)
- `subset` lets you deduplicate on a business key rather than all columns
- Sort descending on a timestamp column before deduplicating when you want to keep the most recent record
- Always verify: compare shapes and re-run `duplicated().sum()` to confirm zero remain

---

## Common Mistakes to Avoid

- **Forgetting that `drop_duplicates()` is not in-place.** You must assign the result: `df = df.drop_duplicates()` or use `inplace=True`.
- **Deduplicating without sorting first.** `keep='first'` keeps the file-order first occurrence — this is arbitrary without a prior sort. Sort by a meaningful key (recency, confidence) before deduplicating.
- **Dropping all occurrences with `keep=False`.** Using `keep=False` removes every row involved in any duplication, including the "good" copy. This is rarely what you want.

---

## Next Lesson Preview

In **Lesson 5: Type Conversion Basics** we shift from structural issues (nulls, duplicates) to type issues: columns that are the wrong dtype and how to convert them safely — including handling NaN during integer conversion.

---

[Back to Section Overview](./README.md) | [Next Lesson: Type Conversion Basics →](./lesson-05-type-conversion-basics.md)
