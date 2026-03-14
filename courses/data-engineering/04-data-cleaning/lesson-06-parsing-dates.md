# Lesson 6: Parsing and Working with Dates

**Course:** Data Engineering — Section 4: Data Cleaning | **Duration:** 50 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain why date parsing is error-prone and what causes mixed-format problems
- Use `pd.to_datetime()` with `errors='coerce'` to safely convert date strings
- Specify an explicit `format` parameter to parse a specific date format
- Use the `.dt` accessor to extract year, month, day, dayofweek, and hour
- Compute time deltas by subtracting two datetime columns

---

## Prerequisites

- Lesson 5: Type Conversion Basics — `.astype()`, `pd.to_numeric(errors='coerce')`
- Basic pandas: `isnull().sum()`

---

## Lesson Outline

### Part 1: Why Date Parsing is a Pain

Dates are stored in many formats in the wild:

| Format | Example |
|--------|---------|
| ISO 8601 (standard) | `2024-01-15` |
| US format | `01/15/2024` |
| European format | `15-01-2024` |
| Long-form | `15-Jan-2024` |
| No separator | `20240115` |
| With time | `2024-01-15 14:30:00` |

A single data source can mix formats if records come from different systems, user inputs, or spreadsheet regions. `sales_dirty.csv` has this exact problem: most rows use `YYYY-MM-DD` but row S008 uses `MM/DD/YYYY`.

When you load a CSV, the `date` column is stored as `object` (string) by default unless you specify `parse_dates=['date']`. Even then, mixed formats may cause silent failures or wrong interpretations.

---

### Part 2: `pd.to_datetime()` — Convert Strings to Datetime

```python
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')

print(f"date dtype before: {df['date'].dtype}")  # object

# Convert with errors='coerce' — bad formats become NaT
df['date'] = pd.to_datetime(df['date'], errors='coerce')

print(f"date dtype after:  {df['date'].dtype}")  # datetime64[ns]
print(df[['sale_id', 'date']].head())
```

<Warning>

Mixed date formats in one column cause `pd.to_datetime()` to produce `NaT` (Not a Time) for rows it cannot parse — unless you set `errors='coerce'`. Always inspect the result for `NaT` values after conversion.

</Warning>

With `errors='coerce'`, unparseable rows silently become `NaT`. You then detect them with `isnull()`:

```python
nat_rows = df[df['date'].isnull()]
print(f"Rows with NaT after conversion: {len(nat_rows)}")
print(nat_rows[['sale_id', 'date']])
```

---

### Part 3: The `format` Parameter

If you know the expected format, specify it explicitly. This is faster and prevents ambiguous interpretation (e.g., is `01/02/2024` January 2nd or February 1st?):

```python
# Parse only YYYY-MM-DD formatted dates
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d', errors='coerce')
```

Common format codes:

| Code | Meaning | Example |
|------|---------|---------|
| `%Y` | 4-digit year | `2024` |
| `%m` | Month as zero-padded number | `01` |
| `%d` | Day as zero-padded number | `15` |
| `%H` | Hour (24-hour) | `14` |
| `%M` | Minute | `30` |

For a column with **mixed formats**, you cannot specify a single `format`. Use `pd.to_datetime(errors='coerce')` without a format parameter and then handle the NaT rows (fix the bad format or drop the row).

---

### Part 4: The `.dt` Accessor — Extracting Date Components

Once a column is `datetime64`, the `.dt` accessor unlocks a full set of datetime operations:

```python
df['date'] = pd.to_datetime(df['date'], errors='coerce')

df['sale_year']    = df['date'].dt.year
df['sale_month']   = df['date'].dt.month
df['sale_day']     = df['date'].dt.day
df['day_of_week']  = df['date'].dt.dayofweek  # 0 = Monday, 6 = Sunday
df['day_name']     = df['date'].dt.day_name()  # 'Monday', 'Tuesday', etc.

# Format as a string
df['date_str'] = df['date'].dt.strftime('%B %d, %Y')  # 'January 15, 2024'
```

`.dt.dayofweek` is especially useful in business analysis: finding that 40% of sales happen on Fridays is a valuable insight you can only extract once dates are proper datetimes.

---

### Part 5: Time Deltas — Arithmetic on Dates

You can subtract two datetime objects to get a `Timedelta`:

```python
# Compute days since each sale occurred
import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Compute days ago
df['days_ago'] = (pd.Timestamp.now() - df['date']).dt.days
print(df[['sale_id', 'date', 'days_ago']].head())
```

`pd.Timestamp.now()` returns the current datetime. Subtracting a datetime column from it yields a Series of `Timedelta` objects. `.dt.days` extracts the integer day component.

---

<PracticeBlock
  prompt="The 'date' column in sales_dirty.csv has mixed formats (most rows use YYYY-MM-DD but row S008 uses MM/DD/YYYY). Use pd.to_datetime(errors='coerce') to convert. Show which rows got NaT."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before conversion:")
print(df[['sale_id', 'date']].tail(6))
# Convert date column and show rows that became NaT
`}
  hint="Use pd.to_datetime(df['date'], errors='coerce') and then filter with df[df['date'].isnull()]."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
print("Before (last 6 rows to see the mixed format):")
print(df[['sale_id', 'date']].tail(6))

df['date'] = pd.to_datetime(df['date'], errors='coerce')

print(f"\nRows with NaT after conversion: {df['date'].isnull().sum()}")
print(df[df['date'].isnull()][['sale_id', 'date']])
# Row S008 used MM/DD/YYYY format — pd.to_datetime couldn't parse it → NaT
`}
/>

<PracticeBlock
  prompt="After converting dates, extract the month as a new column 'sale_month'. Find the total revenue per month (hint: use boolean filters or value_counts — no groupby needed)."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
df['date'] = pd.to_datetime(df['date'], errors='coerce')
# Extract sale_month and calculate revenue per month
`}
  hint="Use df['date'].dt.month to extract the month number, then filter by month and sum revenue."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Extract month
df['sale_month'] = df['date'].dt.month
print("Date month distribution:")
print(df['sale_month'].value_counts().sort_index())

# Revenue per month using boolean filter
print("\nRevenue per month:")
for month in sorted(df['sale_month'].dropna().unique()):
    monthly_rev = df[df['sale_month'] == month]['revenue'].sum()
    print(f"  Month {int(month)}: ${monthly_rev:.2f}")
`}
/>

<PracticeBlock
  prompt="Compute how many days ago each sale occurred (today minus sale date). Add as 'days_ago' column. Handle NaT rows gracefully."
  initialCode={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
df['date'] = pd.to_datetime(df['date'], errors='coerce')
# Compute days_ago for each row
`}
  hint="Use (pd.Timestamp.now() - df['date']).dt.days to compute elapsed days."
  solution={`import pandas as pd

df = pd.read_csv('data/sales_dirty.csv')
df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Compute days since each sale
df['days_ago'] = (pd.Timestamp.now() - df['date']).dt.days

print(df[['sale_id', 'date', 'days_ago']].to_string())
# Rows with NaT date will have NaN for days_ago — handled gracefully
print(f"\nRows with NaT date: {df['days_ago'].isnull().sum()}")
`}
/>

---

## Key Takeaways

- Date columns loaded from CSV have `object` dtype — convert with `pd.to_datetime()` before any date math
- `errors='coerce'` converts unparseable dates to `NaT` instead of raising; always check for NaT after conversion
- Use `format=` when the format is known and consistent — it's faster and avoids ambiguity
- The `.dt` accessor unlocks `.year`, `.month`, `.day`, `.dayofweek`, `.strftime()`, and more
- Subtracting two datetime columns gives a `Timedelta` Series; use `.dt.days` to extract integer days

---

## Common Mistakes to Avoid

- **Assuming `parse_dates=['date']` in `read_csv()` handles mixed formats.** It tries but may silently produce wrong results. Always verify with `isnull().sum()` after conversion.
- **Not checking for NaT after conversion.** Every NaT was a row that failed to parse. These rows will be excluded from any datetime-based analysis.
- **Using Python `datetime.now()` instead of `pd.Timestamp.now()`.** `pd.Timestamp.now()` returns a pandas-compatible timestamp. Mixing Python `datetime` with pandas `Timestamp` can cause type errors.

---

## Next Lesson Preview

In **Lesson 7: String Cleaning Fundamentals** we tackle the most visually obvious data quality issues: inconsistent whitespace, mixed case, and pattern replacement in text columns.

---

[Back to Section Overview](./README.md) | [Next Lesson: String Cleaning Fundamentals →](./lesson-07-string-cleaning.md)
