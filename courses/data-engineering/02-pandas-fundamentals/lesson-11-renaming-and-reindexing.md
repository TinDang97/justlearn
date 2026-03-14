# Lesson 11: Renaming Columns and Reindexing

**Course:** Data Engineering | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Rename specific columns with `.rename(columns={})`
- Replace all column names using `.columns` assignment
- Set a column as the row index with `.set_index()`
- Move the index back into a column with `.reset_index()`
- Reorder or align a DataFrame to a new index with `.reindex()`

---

## Prerequisites

- Lesson 10: Inspecting DataFrames: Shape and Info

---

## Lesson Outline

### Part 1: `.rename(columns={})` — Rename Specific Columns

`.rename()` lets you rename specific columns without touching the others. Pass a dict mapping `{'old_name': 'new_name'}`.

```python
import pandas as pd

df = pd.DataFrame({
    'emp_id':   ['E001', 'E002', 'E003'],
    'dept':     ['Engineering', 'Marketing', 'Engineering'],
    'sal':      [95000, 72000, 88000],
    'yrs_exp':  [5, 3, 7]
})

# Rename specific columns
df = df.rename(columns={
    'emp_id':  'employee_id',
    'dept':    'department',
    'sal':     'salary',
    'yrs_exp': 'years_experience'
})

print(df.columns.tolist())
# ['employee_id', 'department', 'salary', 'years_experience']
```

You only need to include columns you want to rename — unlisted columns are unchanged.

```python
# Rename just one column
df = df.rename(columns={'salary': 'annual_salary'})
```

---

### Part 2: `.columns` Assignment — Replace All Column Names

If you need to rename all columns at once (e.g., after importing a CSV with unnamed columns), assign a new list directly to `.columns`.

```python
import pandas as pd

df = pd.DataFrame({
    'col_0': ['Alice', 'Bob', 'Carol'],
    'col_1': ['Engineering', 'Marketing', 'Engineering'],
    'col_2': [95000, 72000, 88000]
})

# Replace all column names in order
df.columns = ['name', 'department', 'salary']
print(df.columns.tolist())
# ['name', 'department', 'salary']
```

<Warning>
The new list must have exactly the same number of elements as the DataFrame has columns. If lengths differ, pandas raises a `ValueError`.
</Warning>

---

### Part 3: `.set_index()` — Make a Column the Row Index

`.set_index()` promotes a column to the row index, enabling label-based access via `.loc`.

```python
import pandas as pd

df = pd.DataFrame({
    'employee_id': ['E001', 'E002', 'E003'],
    'name':        ['Alice', 'Bob', 'Carol'],
    'department':  ['Engineering', 'Marketing', 'Engineering'],
    'salary':      [95000, 72000, 88000]
})

# Set employee_id as the index
df = df.set_index('employee_id')
print(df)
#              name   department  salary
# employee_id
# E001        Alice  Engineering   95000
# E002          Bob    Marketing   72000
# E003        Carol  Engineering   88000

# Now .loc uses employee IDs
print(df.loc['E002'])
# name          Bob
# department    Marketing
# salary        72000
# Name: E002, dtype: object

print(df.loc['E002', 'salary'])  # 72000
```

---

### Part 4: `.reset_index()` — Move Index Back to a Column

After operations like groupby (Section 5) or filtering, you often want to restore the integer index. `.reset_index()` moves the current index back into a regular column.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol'],
    'department': ['Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000]
}, index=['E001', 'E002', 'E003'])

# Reset: employee_id moves back to a column, integer index is restored
df_reset = df.reset_index()
print(df_reset)
#   index   name   department  salary
# 0  E001  Alice  Engineering   95000
# 1  E002    Bob    Marketing   72000
# 2  E003  Carol  Engineering   88000

# The index column is named 'index' by default — rename if needed
df_reset = df_reset.rename(columns={'index': 'employee_id'})
```

<Tip>
`.reset_index()` is especially important after `.groupby()` operations (Section 5). GroupBy results use group keys as the index — resetting makes the result a clean DataFrame with an integer index and all group keys as regular columns.
</Tip>

---

### Part 5: `.reindex()` — Align to a New Index

`.reindex()` reorders the DataFrame to match a new index and fills any missing positions with `NaN`. Useful for aligning two DataFrames to the same index before doing arithmetic.

```python
import pandas as pd

df = pd.DataFrame({
    'revenue': [10000, 25000, 18000]
}, index=['jan', 'feb', 'mar'])

# Reindex to include more months — missing months get NaN
df_reindexed = df.reindex(['jan', 'feb', 'mar', 'apr', 'may'])
print(df_reindexed)
#      revenue
# jan  10000.0
# feb  25000.0
# mar  18000.0
# apr      NaN
# may      NaN

# Reindex in a different order
df_reordered = df.reindex(['mar', 'jan', 'feb'])
print(df_reordered)
#      revenue
# mar  18000.0
# jan  10000.0
# feb  25000.0
```

---

## Practice

<PracticeBlock
  prompt="Rename the columns 'emp_id' to 'employee_id' and 'dept' to 'department' in the employee DataFrame using .rename(). Print the column names before and after."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'emp_id':  ['E001', 'E002', 'E003', 'E004'],\n    'name':    ['Alice', 'Bob', 'Carol', 'David'],\n    'dept':    ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':  [95000, 72000, 88000, 68000]\n})\n\nprint("Before:", df.columns.tolist())\n\n# Rename emp_id -> employee_id and dept -> department\n\nprint("After:", df.columns.tolist())\n`}
  hint="Use df = df.rename(columns={'emp_id': 'employee_id', 'dept': 'department'}). Assign back to df."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'emp_id':  ['E001', 'E002', 'E003', 'E004'],\n    'name':    ['Alice', 'Bob', 'Carol', 'David'],\n    'dept':    ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':  [95000, 72000, 88000, 68000]\n})\n\nprint("Before:", df.columns.tolist())\n\n# Rename emp_id -> employee_id and dept -> department\ndf = df.rename(columns={'emp_id': 'employee_id', 'dept': 'department'})\n\nprint("After:", df.columns.tolist())\nprint(df)`}
/>

<PracticeBlock
  prompt="Set 'employee_id' as the row index of the DataFrame. Then use .loc['E003'] to access Carol's row by her employee ID."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'employee_id': ['E001', 'E002', 'E003', 'E004'],\n    'name':        ['Alice', 'Bob', 'Carol', 'David'],\n    'department':  ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':      [95000, 72000, 88000, 68000]\n})\n\n# Set 'employee_id' as the index\n\n# Access Carol's row using .loc with her employee ID\n\n`}
  hint="Use df = df.set_index('employee_id'). Then df.loc['E003'] accesses the row with index label 'E003'."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'employee_id': ['E001', 'E002', 'E003', 'E004'],\n    'name':        ['Alice', 'Bob', 'Carol', 'David'],\n    'department':  ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':      [95000, 72000, 88000, 68000]\n})\n\n# Set 'employee_id' as the index\ndf = df.set_index('employee_id')\nprint("DataFrame with employee_id as index:")\nprint(df)\nprint()\n\n# Access Carol's row using .loc with her employee ID\nprint("Carol's record (E003):")\nprint(df.loc['E003'])`}
/>

---

## Key Takeaways

- `.rename(columns={'old': 'new'})` — rename specific columns; unmentioned columns unchanged
- `.columns = [...]` — replace all column names at once; list length must match column count
- `.set_index('col')` — promotes a column to the row index; enables `.loc[label]` access
- `.reset_index()` — moves the current index back to a column; restores integer index
- `.reindex(new_index)` — reorder or extend the index; missing positions filled with NaN

---

## Common Mistakes to Avoid

- **Forgetting to reassign**: `df.rename(...)` returns a new DF — original unchanged unless you reassign or use `inplace=True`
- **Wrong list length in `.columns` assignment**: must match the exact number of columns
- **Losing the index after `.reset_index()`**: the old index column is named `index` by default — rename it if you need the original column name preserved

---

[← Previous Lesson](./lesson-10-dataframe-shape-and-info.md) | [Back to Course Overview](./README.md) | [Next Lesson: Section Review →](./lesson-12-section-review-pandas-basics.md)
