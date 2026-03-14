# Lesson 3: Creating DataFrames

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Create a DataFrame from a dict of lists (the most common pattern)
- Create a DataFrame from a list of dicts (JSON-like records)
- Identify and use key DataFrame attributes: `.shape`, `.columns`, `.index`, `.dtypes`, `.size`

---

## Prerequisites

- Lesson 2: Creating and Inspecting Series

---

## Lesson Outline

### Part 1: From a Dict of Lists (Most Common)

The most common way to create a DataFrame in practice is to pass a dictionary where each key is a column name and each value is a list of column values.

```python
import pandas as pd

# Dict of lists — each key becomes a column
employees = pd.DataFrame({
    'name':             ['Alice', 'Bob', 'Carol', 'David'],
    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],
    'salary':           [95000, 72000, 88000, 68000],
    'years_experience': [5, 3, 7, 2]
})

print(employees)
#     name   department  salary  years_experience
# 0  Alice  Engineering   95000                 5
# 1    Bob    Marketing   72000                 3
# 2  Carol  Engineering   88000                 7
# 3  David    Marketing   68000                 2
```

Rules:
- All lists must have the same length — pandas raises a `ValueError` if they differ
- Column order matches the dict key order (Python 3.7+ guarantees dict insertion order)
- pandas infers the dtype for each column automatically

---

### Part 2: From a List of Dicts (JSON-Like Records)

When data comes from a JSON API or database query, it typically arrives as a list of records — each record is a dict. pandas handles this pattern directly.

```python
import pandas as pd

# List of dicts — each dict is one row
records = [
    {'name': 'Alice', 'department': 'Engineering', 'salary': 95000},
    {'name': 'Bob',   'department': 'Marketing',   'salary': 72000},
    {'name': 'Carol', 'department': 'Engineering', 'salary': 88000},
]

df = pd.DataFrame(records)
print(df)
#     name   department  salary
# 0  Alice  Engineering   95000
# 1    Bob    Marketing   72000
# 2  Carol  Engineering   88000
```

<Tip>
If some records are missing a key (e.g., one dict has no `salary`), pandas fills that position with `NaN` automatically. This is useful for real-world data from APIs where fields are optional.
</Tip>

---

### Part 3: From CSV/File (Preview)

In practice, most DataFrames come from files, not hardcoded dicts. Here is a quick preview — Section 3 covers this in full detail:

```python
import pandas as pd

# Reading from a CSV file (Section 3 covers all options)
# df = pd.read_csv('data/employees.csv')

# Reading from JSON
# df = pd.read_json('data/employees.json')

# Reading from Parquet
# df = pd.read_parquet('data/employees.parquet')
```

The same DataFrame attributes you learn now apply equally to DataFrames loaded from files.

---

### Part 4: DataFrame Attributes

Once you have a DataFrame, these attributes tell you what you have:

```python
import pandas as pd

df = pd.DataFrame({
    'name':             ['Alice', 'Bob', 'Carol', 'David'],
    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],
    'salary':           [95000, 72000, 88000, 68000],
    'years_experience': [5, 3, 7, 2]
})

print(df.shape)    # (4, 4) — (rows, columns)
print(df.columns)  # Index(['name', 'department', 'salary', 'years_experience'], dtype='object')
print(df.index)    # RangeIndex(start=0, stop=4, step=1)
print(df.size)     # 16 — total number of cells (4 rows × 4 columns)
print()
print(df.dtypes)
# name                object
# department          object
# salary               int64
# years_experience     int64
# dtype: object
```

| Attribute | What it returns |
|-----------|----------------|
| `.shape` | `(rows, cols)` tuple |
| `.columns` | Index of column names |
| `.index` | Row index (default: RangeIndex) |
| `.dtypes` | Series of column name → dtype |
| `.size` | Total number of elements (rows × cols) |

<Warning>
`.size` returns the total number of cells, not the number of rows. Use `.shape[0]` for the row count and `.shape[1]` for the column count.
</Warning>

---

## Practice

<PracticeBlock
  prompt="Create a DataFrame with 4 employees: name, department, salary, and years_experience. Use a dict of lists. Include at least one Engineering and one Marketing employee."
  initialCode={`import pandas as pd\n\n# Create an employee DataFrame using a dict of lists\nemployees = pd.DataFrame({\n    'name':             # list of 4 names\n    'department':       # list of 4 departments\n    'salary':           # list of 4 salaries\n    'years_experience': # list of 4 experience values\n})\n\nprint(employees)\n`}
  hint="Each value in the dict should be a list of 4 items. Example: 'name': ['Alice', 'Bob', 'Carol', 'David']"
  solution={`import pandas as pd\n\n# Create an employee DataFrame using a dict of lists\nemployees = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\nprint(employees)`}
/>

<PracticeBlock
  prompt="Using the employee DataFrame you created, print its shape, column names, and data types. Explain what each tells you."
  initialCode={`import pandas as pd\n\nemployees = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Print the shape (rows, columns)\n\n# Print column names\n\n# Print data types for each column\n`}
  hint="Use employees.shape, employees.columns, and employees.dtypes. You can print each with a label like print('Shape:', employees.shape)"
  solution={`import pandas as pd\n\nemployees = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\nprint("Shape:", employees.shape)          # (4, 4) — 4 rows, 4 columns\nprint("Columns:", employees.columns.tolist())  # list of column names\nprint()\nprint("Data types:")\nprint(employees.dtypes)                   # name=object, salary=int64, etc.`}
/>

---

## Key Takeaways

- **Dict of lists**: most common pattern — `pd.DataFrame({'col': [val, ...]})` — all lists must be the same length
- **List of dicts**: JSON/API pattern — `pd.DataFrame([{'col': val}, ...])` — missing keys become NaN
- Core DataFrame attributes: `.shape` (rows, cols), `.columns` (column names), `.index` (row labels), `.dtypes` (column types), `.size` (total cells)
- Use `.shape[0]` for row count and `.shape[1]` for column count — `.size` is total cells (rows × cols)

---

## Common Mistakes to Avoid

- **Unequal list lengths**: all value lists in a dict-of-lists must have the same length
- **Using `.size` for rows**: `.size` is rows × columns; use `.shape[0]` for rows
- **Modifying a dict after creating a DataFrame**: changes to the original dict do not affect the DataFrame — it copies the data at creation time

---

[← Previous Lesson](./lesson-02-creating-series.md) | [Back to Course Overview](./README.md) | [Next Lesson: Indexing and Selection →](./lesson-04-indexing-and-selection.md)
