# Lesson 10: Inspecting DataFrames: Shape and Info

**Course:** Data Engineering | **Duration:** 30 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Retrieve the dimensions of a DataFrame with `.shape`
- Interpret the full output of `.info()` including null counts and memory usage
- Preview rows with `.head()` and `.tail()`
- Sample random rows with `.sample()` for exploratory analysis
- Identify columns with missing values using `.isnull().sum()`

---

## Prerequisites

- Lesson 9: Basic Statistics with pandas

---

## Lesson Outline

### Part 1: `.shape` — Dimensions

`.shape` returns a tuple `(rows, columns)`. It is the first attribute to check after loading data.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000, 68000, 105000],
    'years_experience': [5, 3, 7, 2, 9]
})

print(df.shape)          # (5, 4)
print("Rows:", df.shape[0])    # 5
print("Columns:", df.shape[1]) # 4
```

Why both dimensions matter:
- **Rows** tells you the data volume (5 rows vs 5 million rows changes your strategy)
- **Columns** tells you the feature count (2 columns vs 200 columns signals different complexity)

---

### Part 2: `.info()` — The Full Picture

`.info()` prints a concise summary that tells you everything about the DataFrame's structure in one call. Run it immediately after loading any new dataset.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, None, 68000, 105000],  # None creates NaN
    'years_experience': [5, 3, 7, 2, 9]
})

df.info()
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 5 entries, 0 to 4
# Data columns (total 4 columns):
#  #   Column            Non-Null Count  Dtype
# ---  ------            --------------  -----
#  0   name              5 non-null      object
#  1   department        5 non-null      object
#  2   salary            4 non-null      float64
#  3   years_experience  5 non-null      int64
# dtypes: float64(1), int64(1), object(2)
# memory usage: 288.0+ bytes
```

Read `.info()` output line by line:
- **RangeIndex: 5 entries** — 5 rows total
- **Non-Null Count** — 4 non-null in salary means 1 missing value
- **Dtype** — `object` for text, `int64`/`float64` for numbers
- **dtypes summary** — column type distribution at a glance
- **memory usage** — useful for large DataFrames to detect memory pressure

<Info>
The moment `salary` shows `4 non-null` instead of `5 non-null`, you have a missing value to investigate. `.info()` surfaces this immediately — before any analysis can be corrupted by silently dropped values.
</Info>

---

### Part 3: `.head()` and `.tail()` — Preview Rows

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace'],
    'salary': [95000, 72000, 88000, 68000, 105000, 82000, 91000]
})

# First 5 rows (default)
print(df.head())

# First 3 rows
print(df.head(3))
#     name  salary
# 0  Alice   95000
# 1    Bob   72000
# 2  Carol   88000

# Last 3 rows
print(df.tail(3))
#     name  salary
# 4    Eve  105000
# 5  Frank   82000
# 6  Grace   91000
```

Use `.head()` and `.tail()` together: `.head()` confirms the schema looks correct; `.tail()` checks that the last rows aren't garbage (truncated imports, header duplication, etc.).

---

### Part 4: `.sample()` — Random Rows

For large DataFrames, sampling gives a random cross-section without bias toward the first or last rows.

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace'],
    'salary': [95000, 72000, 88000, 68000, 105000, 82000, 91000]
})

# 3 random rows — different every run
print(df.sample(3))

# Set random_state for reproducible sampling (same rows every run)
print(df.sample(3, random_state=42))

# Sample a fraction instead of a count
print(df.sample(frac=0.5, random_state=42))  # 50% of rows
```

<Tip>
Always pass `random_state=42` (or any fixed integer) when sampling in notebooks or scripts you share. Without it, you and your team will see different rows each run, making debugging harder.
</Tip>

---

### Part 5: `.isnull().sum()` — Quick Null Count

`.isnull()` returns a DataFrame of True/False (True = missing). `.sum()` counts the True values per column.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'salary':     [95000, None, 88000, None, 105000],
    'department': ['Engineering', None, 'Engineering', 'Marketing', None],
    'score':      [88.0, 92.0, 75.0, 85.0, 91.0]
})

print(df.isnull().sum())
# name          0
# salary        2
# department    2
# score         0
# dtype: int64

# As a proportion
print(df.isnull().sum() / len(df))
# name          0.0
# salary        0.4
# department    0.4
# score         0.0
# dtype: float64
```

This is a preview of Section 4 (Data Cleaning). The full treatment of missing values — filling, dropping, imputing — comes there. For now, `.isnull().sum()` tells you which columns have problems and how many.

---

## Practice

<PracticeBlock
  prompt="Create a DataFrame with 6 rows (name, department, salary, score) where some salary and score values are None. Run .info() and interpret the non-null count line for each column."
  initialCode={`import pandas as pd\n\n# Create a DataFrame with some missing values (None becomes NaN)\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':     [95000, None, 88000, 68000, None, 82000],\n    'score':      [88.0, 92.0, None, 85.0, 91.0, None]\n})\n\n# Run .info() and read the non-null counts\n\n`}
  hint="Just call df.info(). Look at the Non-Null Count column — salary and score should show 4 non-null instead of 6, indicating 2 missing values each."
  solution={`import pandas as pd\n\n# Create a DataFrame with some missing values (None becomes NaN)\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':     [95000, None, 88000, 68000, None, 82000],\n    'score':      [88.0, 92.0, None, 85.0, 91.0, None]\n})\n\n# Run .info() and read the non-null counts\ndf.info()\n# salary: 4 non-null (2 missing)\n# score:  4 non-null (2 missing)\nprint()\nprint("Shape:", df.shape)  # (6, 4)`}
/>

<PracticeBlock
  prompt="Use .isnull().sum() to find which columns have missing values in the DataFrame above. Then compute the missing value percentage for each column."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':     [95000, None, 88000, 68000, None, 82000],\n    'score':      [88.0, 92.0, None, 85.0, 91.0, None]\n})\n\n# Count missing values per column\n\n# Compute missing value percentage per column\n\n`}
  hint="df.isnull().sum() counts NaN per column. Divide by len(df) and multiply by 100 for percentage: df.isnull().sum() / len(df) * 100"
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':     [95000, None, 88000, 68000, None, 82000],\n    'score':      [88.0, 92.0, None, 85.0, 91.0, None]\n})\n\n# Count missing values per column\nprint("Missing value counts:")\nprint(df.isnull().sum())\nprint()\n\n# Compute missing value percentage per column\nprint("Missing value percentage:")\nprint(df.isnull().sum() / len(df) * 100)`}
/>

---

## Key Takeaways

- `.shape` — `(rows, cols)` tuple; use `.shape[0]` for row count, `.shape[1]` for column count
- `.info()` — the first command to run on any new DataFrame; shows column names, non-null counts, dtypes, memory
- `.head(n)` — first N rows (default 5); `.tail(n)` — last N rows
- `.sample(n, random_state=42)` — random rows; set `random_state` for reproducibility
- `.isnull().sum()` — count NaN per column; divide by `len(df)` for missing value proportion

---

## Common Mistakes to Avoid

- **Confusing `.shape[0]` and `.shape[1]`**: shape[0] = rows (first dimension), shape[1] = columns (second dimension)
- **Only checking `.head()`**: tail checks are equally important — truncated CSV imports often show in the last rows
- **Forgetting `random_state` in `.sample()`**: random sampling without a seed produces irreproducible results

---

[← Previous Lesson](./lesson-09-basic-statistics.md) | [Back to Course Overview](./README.md) | [Next Lesson: Renaming Columns and Reindexing →](./lesson-11-renaming-and-reindexing.md)
