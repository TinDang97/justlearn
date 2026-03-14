# Lesson 8: String Methods: Extract, Split, Pad

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Split a string column into multiple columns using `.str.split(expand=True)`
- Extract structured subfields using `.str.extract()` with regex capture groups
- Use `.str.startswith()` and `.str.endswith()` for fast prefix/suffix checks
- Measure string lengths with `.str.len()` to validate fixed-width fields
- Left-pad strings to a fixed width with `.str.pad()` and `.str.zfill()`

---

## Prerequisites

- Lesson 7: String Cleaning Fundamentals — `.str.strip()`, `.str.lower()`, `.str.replace()`
- Basic regex: literal characters, `\w`, `.`, `+`, `$`, capture groups `()`

---

## Lesson Outline

### Part 1: `.str.split()` — Split Strings into Multiple Columns

`.str.split()` splits each string on a delimiter and returns a Series of lists. Adding `expand=True` converts the lists directly into a multi-column DataFrame:

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Split 'customer' into first name and last name
name_parts = df['customer'].str.strip().str.split(' ', expand=True)
print(name_parts.head())
#            0        1
# 0      Alice  Johnson
# 1        Bob   Wilson
# ...
```

Assign the result to new columns:

```python
df[['first_name', 'last_name']] = (
    df['customer'].str.strip().str.split(' ', n=1, expand=True)
)
```

The `n=1` parameter limits to a maximum of one split — this prevents issues when names contain more than two parts (e.g., `'Mary Jane Watson'` would split into three without `n=1`).

---

### Part 2: `.str.extract()` — Regex Capture Groups into New Columns

`.str.extract()` applies a regex pattern and returns the captured groups as new columns. This is the right tool when the data has a structured pattern you want to pull apart:

```python
# Extract the domain part from email addresses
# Regex: '@' followed by one or more non-whitespace chars until end of string
df['rep_domain'] = df['sales_rep'].str.extract(r'@(.+)$')
print(df[['sales_rep', 'rep_domain']].head())
#                        sales_rep      rep_domain
# 0    john.smith@company.com  company.com
# 1  sarah.jones@company.com  company.com
```

For multiple capture groups, each group becomes its own column:

```python
# Extract username and domain separately
extracted = df['sales_rep'].str.extract(r'^(.+)@(.+)$')
extracted.columns = ['rep_username', 'rep_domain']
df = pd.concat([df, extracted], axis=1)
```

---

### Part 3: `.str.startswith()` and `.str.endswith()`

These are faster than `.str.contains()` for simple prefix/suffix checks because they don't use regex:

```python
# Find all sales from the North region (starts with 'N' after normalization)
north_mask = df['region'].str.strip().str.title().str.startswith('N')
print(df[north_mask][['sale_id', 'region', 'revenue']])

# Find all email addresses ending in '.com'
com_emails = df['sales_rep'].str.endswith('.com', na=False)
print(f"'.com' emails: {com_emails.sum()}")
```

Use `.startswith()` and `.endswith()` for literal string checks. Reserve `.str.contains()` for middle-of-string or pattern-based matching.

---

### Part 4: `.str.len()` — Validate Field Lengths

`.str.len()` returns the length of each string — useful for validating that ID fields, ZIP codes, or phone numbers meet expected lengths:

```python
# Validate that all sale_ids have exactly 4 characters (S + 3 digits)
df['id_length'] = df['sale_id'].str.len()
invalid_ids = df[df['id_length'] != 4]
print(f"Invalid sale_ids: {len(invalid_ids)}")

# Quick length distribution
print(df['sale_id'].str.len().value_counts())
```

---

### Part 5: `.str.pad()` and `.str.zfill()` — Fixed-Width Padding

For systems that require fixed-width IDs (e.g., a 10-character padded customer ID):

```python
# Left-pad sale_id to 6 characters with '0'
df['sale_id_padded'] = df['sale_id'].str.pad(width=6, side='left', fillchar='0')
# 'S001' → '00S001'

# zfill is a shortcut for left-padding with '0'
df['sale_num'] = df['sale_id'].str.replace('S', '').str.zfill(4)
# '1' → '0001', '12' → '0012'
```

Padded IDs are essential when downstream systems sort or compare IDs lexicographically — without padding, `'S10'` sorts before `'S9'`.

---

<PracticeBlock
  prompt="Extract the email domain from 'sales_rep' into a new 'rep_domain' column using str.extract() with a regex pattern."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("sales_rep column:")
print(df['sales_rep'].unique())
# Extract domain part after '@' into 'rep_domain'
`}
  hint="Use df['sales_rep'].str.extract(r'@(.+)$') to capture everything after the '@' symbol."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Extract domain: capture group captures everything after '@' to end of string
df['rep_domain'] = df['sales_rep'].str.extract(r'@(.+)$')

print(df[['sales_rep', 'rep_domain']])
print(f"\nUnique domains: {df['rep_domain'].unique()}")
`}
/>

<PracticeBlock
  prompt="Split 'customer' into 'first_name' and 'last_name' columns using str.split(expand=True). Handle the whitespace issue first."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
# Strip whitespace first, then split into first_name and last_name
`}
  hint="Use df['customer'].str.strip().str.split(' ', n=1, expand=True) and assign to two new columns."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

# Strip whitespace first, then split on first space (n=1 for compound names)
df[['first_name', 'last_name']] = (
    df['customer'].str.strip().str.split(' ', n=1, expand=True)
)

print(df[['customer', 'first_name', 'last_name']].head(8))
print(f"\nUnique first names: {df['first_name'].unique()}")
`}
/>

---

## Key Takeaways

- `.str.split(expand=True)` splits a string column directly into a multi-column DataFrame; use `n=1` to limit splits for compound values
- `.str.extract(r'(pattern)')` extracts regex capture groups into new columns — the right tool for structured subfields
- `.str.startswith()` and `.str.endswith()` are faster than `.str.contains()` for simple prefix/suffix checks
- `.str.len()` validates string field lengths — essential for IDs, ZIP codes, and phone numbers
- `.str.zfill(N)` and `.str.pad(width=N, fillchar='0')` ensure consistent fixed-width formatting

---

## Common Mistakes to Avoid

- **Not stripping whitespace before splitting.** `'  Bob Wilson  '.split(' ')` produces leading/trailing empty string elements.
- **Using `.str.split()` without `expand=True` and expecting new columns.** Without `expand=True`, you get a Series of lists, not new columns.
- **Forgetting that `.str.extract()` uses capture groups.** `r'@.+$'` extracts nothing — you need parentheses: `r'@(.+)$'`. If there are no groups, the result is all NaN.

---

## Next Lesson Preview

In **Lesson 9: Detecting Outliers** we shift from structural and string issues to statistical anomalies — using the IQR method, Z-scores, and domain assertions to identify values that are statistically unusual or logically impossible.

---

[Back to Section Overview](./README.md) | [Next Lesson: Detecting Outliers →](./lesson-09-outlier-detection.md)
