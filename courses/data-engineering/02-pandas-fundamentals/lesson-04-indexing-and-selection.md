# Lesson 4: Indexing and Selection

**Course:** Data Engineering | **Duration:** 50 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Select single and multiple columns from a DataFrame
- Use `.loc` for label-based row and column selection
- Use `.iloc` for position-based row and column selection
- Explain when to use `loc` vs `iloc`

---

## Prerequisites

- Lesson 3: Creating DataFrames

---

## Lesson Outline

### Part 1: Column Selection

Column selection is the most common operation in pandas. There are two syntaxes:

```python
import pandas as pd

df = pd.DataFrame({
    'name':             ['Alice', 'Bob', 'Carol', 'David'],
    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],
    'salary':           [95000, 72000, 88000, 68000],
    'years_experience': [5, 3, 7, 2]
})

# Single column — returns a Series
names = df['name']
print(type(names))   # <class 'pandas.core.series.Series'>
print(names)
# 0    Alice
# 1      Bob
# 2    Carol
# 3    David
# Name: name, dtype: object

# Multiple columns — returns a DataFrame (double brackets)
subset = df[['name', 'salary']]
print(type(subset))  # <class 'pandas.core.frame.DataFrame'>
print(subset)
#     name  salary
# 0  Alice   95000
# 1    Bob   72000
# 2  Carol   88000
# 3  David   68000
```

**The double-bracket rule:**
- `df['col']` → Series (single column)
- `df[['col1', 'col2']]` → DataFrame (list of columns inside the outer brackets)

---

### Part 2: `loc` — Label-Based Selection

`.loc` uses **labels** — the actual values in the index and column names. Use it when you know the label you want.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing'],
    'salary':     [95000, 72000, 88000, 68000],
    'years_experience': [5, 3, 7, 2]
})

# Select a single row by integer index label
print(df.loc[1])
# name                  Bob
# department      Marketing
# salary              72000
# years_experience        3
# Name: 1, dtype: object

# Select rows 0 to 2 AND columns 'name' to 'salary' (INCLUSIVE on both ends)
print(df.loc[0:2, 'name':'salary'])
#     name   department  salary
# 0  Alice  Engineering   95000
# 1    Bob    Marketing   72000
# 2  Carol  Engineering   88000

# Select specific rows and columns with lists
print(df.loc[[0, 2], ['name', 'salary']])
#     name  salary
# 0  Alice   95000
# 2  Carol   88000
```

<Warning>
`.loc` slices are **inclusive on both ends**. `df.loc[0:2]` returns rows 0, 1, AND 2 — unlike Python list slicing which excludes the end.
</Warning>

---

### Part 3: `iloc` — Position-Based Selection

`.iloc` uses **integer positions** — think of it like Python list indexing: 0 is first, -1 is last, and slices exclude the right end.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing'],
    'salary':     [95000, 72000, 88000, 68000],
    'years_experience': [5, 3, 7, 2]
})

# First row by position
print(df.iloc[0])
# name              Alice
# department  Engineering
# salary            95000
# years_experience      5

# Rows 0 to 1 (exclusive end), columns 0 to 2 (exclusive end)
print(df.iloc[0:2, 0:2])
#     name   department
# 0  Alice  Engineering
# 1    Bob    Marketing

# Last row
print(df.iloc[-1])
# name              David
# department    Marketing
# ...

# Specific rows and columns by position
print(df.iloc[[0, 2], [0, 2]])
#     name  salary
# 0  Alice   95000
# 2  Carol   88000
```

<Warning>
`.iloc` slices are **exclusive on the right end** — same as Python list slicing. `df.iloc[0:2]` returns rows 0 and 1 only, NOT row 2.
</Warning>

---

### Part 4: When to Use `loc` vs `iloc`

| Situation | Use |
|-----------|-----|
| You know the column name | `loc` or column selection `df['col']` |
| You have a custom string index (e.g., `emp_id`) | `loc` |
| You want to slice by position regardless of labels | `iloc` |
| You want the first N rows for inspection | `iloc[0:N]` |
| You want rows matching a condition | Boolean filtering (Lesson 5) |

**Rule of thumb:** use `iloc` when you think in terms of "the 3rd row" or "the last 5 rows". Use `loc` when you think in terms of "the row where emp_id is E003" or "the salary column".

```python
import pandas as pd

# Setting a meaningful index makes loc more useful
df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol'],
    'department': ['Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000]
}, index=['E001', 'E002', 'E003'])

# Now loc uses the string labels
print(df.loc['E002', 'salary'])  # 72000
print(df.loc['E001':'E002'])     # rows E001 and E002 (inclusive)
```

---

## Practice

<PracticeBlock
  prompt="From the employee DataFrame, select only the 'name' and 'department' columns using the double-bracket syntax. Print the result."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Select only 'name' and 'department' columns\nsubset = \nprint(subset)\n`}
  hint="Use df[['name', 'department']] with double brackets — a list of column names inside the indexer."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Select only 'name' and 'department' columns\nsubset = df[['name', 'department']]\nprint(subset)`}
/>

<PracticeBlock
  prompt="Use .loc to select rows 1 and 2, showing only the 'name' and 'salary' columns. Remember: loc is label-based and inclusive on both ends."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Use loc to select rows 1-2, columns 'name' and 'salary'\nresult = \nprint(result)\n`}
  hint="Use df.loc[1:2, ['name', 'salary']] — note that loc includes both end labels, so loc[1:2] returns rows 1 AND 2."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Use loc to select rows 1-2, columns 'name' and 'salary'\nresult = df.loc[1:2, ['name', 'salary']]\nprint(result)`}
/>

<PracticeBlock
  prompt="Use .iloc to select the first 2 rows and the last 2 columns of the DataFrame. Print the result."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Use iloc: first 2 rows, last 2 columns\nresult = \nprint(result)\n`}
  hint="Use df.iloc[0:2, -2:] — iloc[0:2] gives rows 0 and 1 (exclusive end), and iloc[:, -2:] gives the last 2 columns."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Use iloc: first 2 rows, last 2 columns\nresult = df.iloc[0:2, -2:]\nprint(result)\n# Shows salary and years_experience for Alice and Bob`}
/>

---

## Key Takeaways

- **Column selection**: `df['col']` → Series; `df[['col1', 'col2']]` → DataFrame
- **`loc`** uses labels (index values and column names); **inclusive on both ends** when slicing
- **`iloc`** uses integer positions (0-based); **exclusive on the right end** — same as Python slicing
- Use `loc` when you know the label; use `iloc` when you know the position
- Setting a meaningful custom index (e.g., employee ID) makes `loc` more powerful

---

## Common Mistakes to Avoid

- **`df[0]`** — does NOT return the first row; use `df.iloc[0]` or `df.loc[0]`
- **Forgetting inclusive vs exclusive**: `loc[0:2]` = rows 0, 1, 2; `iloc[0:2]` = rows 0, 1
- **Chained indexing** `df['col'][0]` — avoid this pattern; it can cause a `SettingWithCopyWarning`; use `df.loc[0, 'col']` instead

---

[← Previous Lesson](./lesson-03-creating-dataframes.md) | [Back to Course Overview](./README.md) | [Next Lesson: Boolean Filtering →](./lesson-05-boolean-filtering.md)
