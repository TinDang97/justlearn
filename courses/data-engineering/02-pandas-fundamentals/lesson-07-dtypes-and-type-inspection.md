# Lesson 7: Data Types and Type Inspection

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Name the main pandas dtypes: int64, float64, object, bool, datetime64, category
- Inspect column types using `.dtypes`, `.info()`, and `series.dtype`
- Convert column types using `.astype()`
- Explain why strings are stored as `object` dtype and when to use `StringDtype`

---

## Prerequisites

- Lesson 6: Column Operations

---

## Lesson Outline

### Part 1: pandas dtypes — The Type System

Every column in a pandas DataFrame has a **dtype** (data type). Knowing dtypes matters because:
- The wrong dtype causes incorrect computations (e.g., '100' + '200' = '100200', not 300)
- Memory usage depends on dtype (category vs object can be 10x smaller)
- Many pandas operations only work on specific dtypes (e.g., `.mean()` requires numeric)

The main pandas dtypes:

| dtype | Python/NumPy equivalent | When you see it |
|-------|------------------------|----------------|
| `int64` | `int` | Integer columns (count, id, year) |
| `float64` | `float` | Decimal numbers; also integers with NaN |
| `object` | `str` (usually) | Text/string columns; also mixed types |
| `bool` | `bool` | True/False columns |
| `datetime64[ns]` | `datetime` | Date and time values |
| `category` | Enum-like | Columns with few repeated values (department, status) |

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol'],
    'salary':     [95000, 72000, 88000],
    'rate':       [47.5, 36.0, 44.0],
    'active':     [True, False, True],
    'department': ['Engineering', 'Marketing', 'Engineering']
})

print(df.dtypes)
# name          object
# salary         int64
# rate         float64
# active          bool
# department    object
# dtype: object
```

---

### Part 2: Inspecting Types

Three tools for type inspection — each gives different levels of detail:

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol'],
    'salary':     [95000, 72000, 88000],
    'rate':       [47.5, 36.0, 44.0],
    'active':     [True, False, True],
    'department': ['Engineering', 'Marketing', 'Engineering']
})

# 1. .dtypes — Series of column dtype values
print(df.dtypes)
# name          object
# salary         int64
# rate         float64
# active          bool
# department    object

# 2. .info() — full summary: column names, non-null counts, dtypes, memory
df.info()
# <class 'pandas.core.frame.DataFrame'>
# RangeIndex: 3 entries, 0 to 2
# Data columns (total 5 columns):
#  #   Column      Non-Null Count  Dtype
# ---  ------      --------------  -----
#  0   name        3 non-null      object
#  1   salary      3 non-null      int64
#  2   rate        3 non-null      float64
#  3   active      3 non-null      bool
#  4   department  3 non-null      object
# dtypes: bool(1), float64(1), int64(1), object(2)
# memory usage: 248.0+ bytes

# 3. Single column dtype
print(df['salary'].dtype)  # int64
```

<Info>
The `object` dtype is pandas' catch-all for non-numeric data. It usually means strings, but can hide mixed types (e.g., a column with both strings and integers). Always inspect dtypes when loading new data — unexpected `object` columns often signal a data quality issue.
</Info>

---

### Part 3: Type Conversion with `.astype()`

`.astype()` converts a Series to a different dtype. Like most pandas operations, it returns a new Series — you must assign the result back.

```python
import pandas as pd

df = pd.DataFrame({
    'emp_id':     ['001', '002', '003'],    # should be int
    'salary':     ['95000', '72000', '88000'],  # strings from CSV
    'active':     [1, 0, 1],               # int, but should be bool
    'department': ['Engineering', 'Marketing', 'Engineering']
})

print("Before conversion:")
print(df.dtypes)

# Convert string salary to float
df['salary'] = df['salary'].astype(float)

# Convert integer active to bool
df['active'] = df['active'].astype(bool)

# Convert department to category (saves memory when values repeat often)
df['department'] = df['department'].astype('category')

print("\nAfter conversion:")
print(df.dtypes)
# emp_id         object
# salary        float64
# active           bool
# department   category
```

Common conversion targets:

```python
import pandas as pd
s = pd.Series(['1', '2', '3'])

s.astype(int)        # string '1' → integer 1
s.astype(float)      # string '1' → float 1.0
s.astype('category') # repeated strings → memory-efficient category
```

<Warning>
`.astype()` will raise a `ValueError` if the conversion is impossible (e.g., `'hello'.astype(int)`). Always check for unexpected values before converting. Use `pd.to_numeric(s, errors='coerce')` to convert and turn invalid values into `NaN` instead of crashing.
</Warning>

---

### Part 4: Object dtype for Strings — When to Use StringDtype

The `object` dtype stores strings as Python objects (pointers to Python string objects). This works but is memory-inefficient. pandas 2.x introduced `StringDtype` for explicit string storage:

```python
import pandas as pd

# Default: strings stored as object
s_obj = pd.Series(['alice', 'bob', 'carol'])
print(s_obj.dtype)  # object

# Explicit StringDtype
s_str = pd.Series(['alice', 'bob', 'carol'], dtype='string')
print(s_str.dtype)  # string

# Convert existing object column to string
s_str2 = s_obj.astype('string')
print(s_str2.dtype)  # string
```

In practice, `object` works for most operations. Use `StringDtype` when:
- You want explicit type safety (prevent mixed-type column bugs)
- You are building production pipelines where dtype consistency matters

---

## Practice

<PracticeBlock
  prompt="Create a DataFrame with columns of different types: an integer column (age), a float column (score), a string column (name), and a boolean column (passed). Print the dtypes."
  initialCode={`import pandas as pd\n\n# Create a DataFrame with mixed types\ndf = pd.DataFrame({\n    'name':   # list of 3 strings\n    'age':    # list of 3 integers\n    'score':  # list of 3 floats\n    'passed': # list of 3 booleans\n})\n\nprint(df)\nprint()\nprint(df.dtypes)\n`}
  hint="Use: 'name': ['Alice', 'Bob', 'Carol'], 'age': [25, 30, 22], 'score': [88.5, 92.0, 75.3], 'passed': [True, True, False]"
  solution={`import pandas as pd\n\n# Create a DataFrame with mixed types\ndf = pd.DataFrame({\n    'name':   ['Alice', 'Bob', 'Carol'],\n    'age':    [25, 30, 22],\n    'score':  [88.5, 92.0, 75.3],\n    'passed': [True, True, False]\n})\n\nprint(df)\nprint()\nprint(df.dtypes)`}
/>

<PracticeBlock
  prompt="Convert the boolean 'passed' column to int (True→1, False→0) and convert the string 'name' column to 'category' dtype. Print dtypes before and after to verify the changes."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':   ['Alice', 'Bob', 'Carol'],\n    'age':    [25, 30, 22],\n    'score':  [88.5, 92.0, 75.3],\n    'passed': [True, True, False]\n})\n\nprint("Before:")\nprint(df.dtypes)\n\n# Convert 'passed' to int\n\n# Convert 'name' to 'category'\n\nprint("\nAfter:")\nprint(df.dtypes)\n`}
  hint="Use df['passed'] = df['passed'].astype(int) and df['name'] = df['name'].astype('category'). Assign back to the column."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':   ['Alice', 'Bob', 'Carol'],\n    'age':    [25, 30, 22],\n    'score':  [88.5, 92.0, 75.3],\n    'passed': [True, True, False]\n})\n\nprint("Before:")\nprint(df.dtypes)\n\n# Convert 'passed' to int\ndf['passed'] = df['passed'].astype(int)\n\n# Convert 'name' to 'category'\ndf['name'] = df['name'].astype('category')\n\nprint("\nAfter:")\nprint(df.dtypes)`}
/>

---

## Key Takeaways

- The 6 main pandas dtypes: `int64`, `float64`, `object` (strings), `bool`, `datetime64[ns]`, `category`
- Inspect dtypes with: `.dtypes` (all columns), `.info()` (full summary + null counts), `series.dtype` (one column)
- Convert types with `.astype(target_dtype)` — always assign the result back
- `object` is pandas' catch-all for non-numeric data — usually strings, but can hide mixed types
- Use `category` for string columns with few repeated values (department, status) — major memory savings
- Use `pd.to_numeric(s, errors='coerce')` to safely convert strings to numbers, turning bad values into NaN

---

## Common Mistakes to Avoid

- **Forgetting to assign**: `df['col'].astype(float)` computes but discards — must write `df['col'] = df['col'].astype(float)`
- **Assuming object = string**: an `object` column can contain mixed types; verify with `df['col'].apply(type).value_counts()`
- **Converting strings with non-numeric characters**: `'$95,000'.astype(float)` raises `ValueError` — strip formatting first

---

[← Previous Lesson](./lesson-06-column-operations.md) | [Back to Course Overview](./README.md) | [Next Lesson: Sorting and Ranking →](./lesson-08-sorting-and-ranking.md)
