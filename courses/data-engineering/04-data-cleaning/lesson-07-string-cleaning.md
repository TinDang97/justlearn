# Lesson 7: String Cleaning Fundamentals

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Identify the most common string quality issues: whitespace, inconsistent case, and special characters
- Use `.str.strip()`, `.str.lstrip()`, and `.str.rstrip()` to remove leading and trailing whitespace
- Normalize text case with `.str.lower()`, `.str.upper()`, and `.str.title()`
- Replace substrings and patterns using `.str.replace()` with regex support
- Use `.str.contains()` to create boolean filters, handling NaN safely with `na=False`

---

## Prerequisites

- Lesson 5: Type Conversion Basics — understanding object dtype columns
- Basic pandas: boolean indexing, column assignment

---

## Lesson Outline

### Part 1: Why Strings are Messy

String columns are the most common source of data quality issues in real datasets. The four categories:

| Problem | Example | Effect |
|---------|---------|--------|
| Leading/trailing whitespace | `'  Bob Wilson  '` | Lookup failures, duplicate rows not detected |
| Inconsistent case | `'North'`, `'NORTH'`, `'north'` | GroupBy counts split across categories |
| Extra internal whitespace | `'Alice  Johnson'` (double space) | String comparison failures |
| Encoding artifacts | `'Café'` stored as `'CafÃ©'` | Data loss, garbled display |

In `sales_dirty.csv`, the `customer` and `region` columns have the first two issues — exactly what we'll fix in this lesson.

<Tip>

Always chain string cleaning operations: `df['col'].str.strip().str.lower()`. Order matters — strip whitespace **before** normalizing case, otherwise a case transformation applied to `'  Bob  '` still leaves the spaces.

</Tip>

---

### Part 2: `.str.strip()` — Remove Whitespace

The `.str` accessor makes string methods available on a pandas Series. `.str.strip()` removes leading and trailing whitespace:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Before: '  Bob Wilson  '
print(repr(df.loc[1, 'customer']))

df['customer'] = df['customer'].str.strip()

# After: 'Bob Wilson'
print(repr(df.loc[1, 'customer']))
```

Variants:
- `.str.strip()` — removes whitespace from both ends
- `.str.lstrip()` — removes only from the left (leading)
- `.str.rstrip()` — removes only from the right (trailing)

---

### Part 3: Case Normalization

```python
# All lowercase (good for comparisons, joins, deduplication)
df['region_lower'] = df['region'].str.lower()

# All uppercase
df['region_upper'] = df['region'].str.upper()

# Title case (first letter of each word capitalized)
df['region_title'] = df['region'].str.title()
# 'north' → 'North', 'NORTH' → 'North', 'north' → 'North'
```

For the `region` column in `sales_dirty.csv`, `.str.title()` normalizes `'North'`, `'NORTH'`, and `'north'` to the same `'North'`.

For `customer`, both `'Alice Johnson'` and `'alice johnson'` become `'Alice Johnson'` after `.str.strip().str.title()`.

---

### Part 4: `.str.replace()` — Replace Substrings and Patterns

`.str.replace()` supports both literal and regex replacement:

```python
# Literal replacement: remove a specific substring
df['product'] = df['product'].str.replace('USB Hub', 'USB-Hub')

# Regex replacement: remove special characters
df['customer'] = df['customer'].str.replace(r'[^\w\s]', '', regex=True)

# Replace multiple spaces with a single space
df['customer'] = df['customer'].str.replace(r'\s+', ' ', regex=True)
```

When `regex=True`, the first argument is treated as a regular expression pattern. Always test regex patterns on a small sample before applying to the full column.

---

### Part 5: `.str.contains()` — Boolean Filter with Pattern Matching

`.str.contains()` returns a boolean Series — `True` where the pattern matches:

```python
# Find all rows where sales_rep is at the company domain
mask = df['sales_rep'].str.contains('@company.com', na=False)
company_reps = df[mask]
print(f"Company reps: {mask.sum()} rows")

# na=False ensures NaN values return False instead of NaN
# (which would cause issues in boolean indexing)
```

The `na=False` parameter is important: without it, NaN values in the column produce NaN in the result, which causes `TypeError` when used as a boolean index.

You can use regex in `.str.contains()` too:

```python
# Find rows where sales_rep ends with '.com'
mask = df['sales_rep'].str.contains(r'\.com$', regex=True, na=False)
```

---

<PracticeBlock
  prompt="Fix the 'customer' column: strip whitespace and normalize to title case. The 'Alice Johnson' / 'alice johnson' inconsistency should become uniform."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(df['customer'].unique())
# Strip whitespace and title-case the customer column
`}
  hint="Chain .str.strip().str.title() on the customer column."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(df['customer'].unique())

df['customer'] = df['customer'].str.strip().str.title()

print("\nAfter:")
print(df['customer'].unique())
# 'alice johnson' → 'Alice Johnson', '  Bob Wilson  ' → 'Bob Wilson'
print(f"\nUnique customer count: {df['customer'].nunique()}")
`}
/>

<PracticeBlock
  prompt="Fix the 'region' column: normalize to title case so 'North', 'NORTH', 'north' all become 'North'."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before:")
print(df['region'].value_counts())
# Normalize region to title case
`}
  hint="Use df['region'].str.strip().str.title() to normalize all region variations."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before (8 variations):")
print(df['region'].value_counts())

df['region'] = df['region'].str.strip().str.title()

print("\nAfter (4 clean regions):")
print(df['region'].value_counts())
`}
/>

<PracticeBlock
  prompt="Use str.contains() to find all rows where sales_rep is from '@company.com'. Count them."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Count rows where sales_rep contains '@company.com'
`}
  hint="Use df['sales_rep'].str.contains('@company.com', na=False) to create a boolean mask."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

mask = df['sales_rep'].str.contains('@company.com', na=False)
print(f"Company reps: {mask.sum()} out of {len(df)} rows")

# Show unique company reps
print("\nUnique company reps:")
print(df[mask]['sales_rep'].unique())
`}
/>

---

## Key Takeaways

- `.str.strip()` removes leading/trailing whitespace — run this first before any case normalization
- `.str.lower()`, `.str.upper()`, `.str.title()` normalize case — essential before grouping or joining on string columns
- Always chain: `.str.strip().str.title()` — strip then normalize
- `.str.replace(pattern, replacement, regex=True)` enables powerful pattern-based substitution
- `.str.contains(pattern, na=False)` creates boolean masks; `na=False` prevents `NaN` propagation in filters

---

## Common Mistakes to Avoid

- **Normalizing case before stripping whitespace.** `'  alice johnson  '.title()` gives `'  Alice Johnson  '` — the spaces are still there.
- **Forgetting `na=False` in `.str.contains()`.** NaN values in the column become NaN in the result, causing `TypeError` when used in boolean indexing.
- **Using `regex=False` (default) when passing a regex pattern.** `df['col'].str.replace('*', '')` will raise an error because `*` is a special regex character. Set `regex=False` for literal strings or `regex=True` for patterns.

---

## Next Lesson Preview

In **Lesson 8: String Methods — Extract, Split, Pad** we go deeper into structured extraction from strings: splitting compound columns, using regex capture groups to extract subfields, and padding strings to fixed widths.

---

[Back to Section Overview](./README.md) | [Next Lesson: String Methods — Extract, Split, Pad →](./lesson-08-string-methods-in-depth.md)
