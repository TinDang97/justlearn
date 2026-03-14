# Lesson 6: Column Operations

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Add new columns by assigning expressions to `df['new_col']`
- Modify existing columns in place
- Drop columns with `.drop(columns=[...])`
- Apply a custom function to a column using `.apply()`

---

## Prerequisites

- Lesson 5: Boolean Filtering

---

## Lesson Outline

### Part 1: Adding New Columns

The simplest way to add a column is assignment. The right-hand side can be a scalar, a list, or — most commonly — a vectorized expression derived from existing columns.

```python
import pandas as pd

df = pd.DataFrame({
    'name':             ['Alice', 'Bob', 'Carol', 'David'],
    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],
    'salary':           [95000, 72000, 88000, 68000],
    'years_experience': [5, 3, 7, 2]
})

# Add a 'salary_with_bonus' column: salary * 1.15
df['salary_with_bonus'] = df['salary'] * 1.15
print(df[['name', 'salary', 'salary_with_bonus']])
#     name  salary  salary_with_bonus
# 0  Alice   95000           109250.0
# 1    Bob   72000            82800.0
# 2  Carol   88000           101200.0
# 3  David   68000            78200.0

# Add a 'full_label' column combining name + department
df['full_label'] = df['name'] + ' (' + df['department'] + ')'
print(df['full_label'])
# 0       Alice (Engineering)
# 1         Bob (Marketing)
# 2       Carol (Engineering)
# 3         David (Marketing)
```

---

### Part 2: Modifying Existing Columns

Overwrite a column by assigning a new expression to its name. The column is replaced in place.

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['Alice', 'Bob', 'Carol'],
    'salary': [95000, 72000, 88000]
})

# Apply a 5% raise to all salaries
df['salary'] = df['salary'] * 1.05
print(df['salary'])
# 0     99750.0
# 1     75600.0
# 2     92400.0
# Name: salary, dtype: float64

# Normalize a string column to lowercase
df['name'] = df['name'].str.lower()
print(df['name'])
# 0    alice
# 1      bob
# 2    carol
```

---

### Part 3: Dropping Columns

`.drop(columns=[...])` returns a **new** DataFrame without the specified columns. The original is unchanged unless you use `inplace=True` or reassign.

```python
import pandas as pd

df = pd.DataFrame({
    'name':             ['Alice', 'Bob', 'Carol'],
    'department':       ['Engineering', 'Marketing', 'Engineering'],
    'salary':           [95000, 72000, 88000],
    'years_experience': [5, 3, 7],
    'temp_col':         [1, 2, 3]  # column to drop
})

# Drop returns a new DataFrame — original df is unchanged
df_clean = df.drop(columns=['temp_col'])
print(df_clean.columns.tolist())
# ['name', 'department', 'salary', 'years_experience']

# Drop multiple columns at once
df_minimal = df.drop(columns=['department', 'years_experience', 'temp_col'])
print(df_minimal)
#     name  salary
# 0  Alice   95000
# 1    Bob   72000
# 2  Carol   88000
```

<Tip>
Prefer `df_clean = df.drop(columns=['col'])` over `df.drop(columns=['col'], inplace=True)`. The non-inplace approach is safer — you can inspect `df_clean` while `df` remains unchanged. `inplace=True` modifies the DataFrame in place and returns `None`, which is a common source of bugs.
</Tip>

---

### Part 4: `.apply()` — Custom Functions on Columns

`.apply()` passes each element of a Series (or each row/column of a DataFrame) through a function. Use it when no built-in vectorized operation fits.

```python
import pandas as pd

df = pd.DataFrame({
    'name':             ['Alice', 'Bob', 'Carol', 'David'],
    'years_experience': [5, 3, 7, 2]
})

# Classify seniority — no built-in for this, so use apply
def classify_seniority(years):
    if years >= 5:
        return 'Senior'
    else:
        return 'Junior'

df['seniority'] = df['years_experience'].apply(classify_seniority)
print(df[['name', 'years_experience', 'seniority']])
#     name  years_experience seniority
# 0  Alice                 5    Senior
# 1    Bob                 3    Junior
# 2  Carol                 7    Senior
# 3  David                 2    Junior

# Lambda shorthand for simple cases
df['level'] = df['years_experience'].apply(lambda x: 'Senior' if x >= 5 else 'Junior')
```

<Tip>
Prefer vectorized operations (`df['col'] * 2`) over `.apply()`. Vectorized ops run on compiled NumPy code — 10-100x faster than `.apply()` on large datasets. Reserve `.apply()` for logic that cannot be expressed as a vectorized operation (e.g., multi-branch if/else on string values).
</Tip>

---

## Practice

<PracticeBlock
  prompt="Add a 'salary_with_bonus' column to the employee DataFrame where bonus = salary * 0.15. Then add a 'seniority' column: 'Senior' if years_experience >= 5, else 'Junior'. Use .apply() for the seniority classification."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Add salary_with_bonus column (salary * 1.15)\n\n# Add seniority column using .apply()\n\nprint(df[['name', 'salary', 'salary_with_bonus', 'seniority']])\n`}
  hint="df['salary_with_bonus'] = df['salary'] * 1.15. For seniority: df['seniority'] = df['years_experience'].apply(lambda x: 'Senior' if x >= 5 else 'Junior')"
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\n\n# Add salary_with_bonus column (salary * 1.15)\ndf['salary_with_bonus'] = df['salary'] * 1.15\n\n# Add seniority column using .apply()\ndf['seniority'] = df['years_experience'].apply(lambda x: 'Senior' if x >= 5 else 'Junior')\n\nprint(df[['name', 'salary', 'salary_with_bonus', 'seniority']])`}
/>

<PracticeBlock
  prompt="Drop the original 'salary' column from the DataFrame (keep 'salary_with_bonus'). Then rename 'salary_with_bonus' to 'salary' using .rename(). Print the final DataFrame."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\ndf['salary_with_bonus'] = df['salary'] * 1.15\ndf['seniority'] = df['years_experience'].apply(lambda x: 'Senior' if x >= 5 else 'Junior')\n\n# Drop the original 'salary' column\n\n# Rename 'salary_with_bonus' to 'salary'\n\nprint(df)\n`}
  hint="Use df = df.drop(columns=['salary']) to drop. Then df = df.rename(columns={'salary_with_bonus': 'salary'}) to rename."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':             ['Alice', 'Bob', 'Carol', 'David'],\n    'department':       ['Engineering', 'Marketing', 'Engineering', 'Marketing'],\n    'salary':           [95000, 72000, 88000, 68000],\n    'years_experience': [5, 3, 7, 2]\n})\ndf['salary_with_bonus'] = df['salary'] * 1.15\ndf['seniority'] = df['years_experience'].apply(lambda x: 'Senior' if x >= 5 else 'Junior')\n\n# Drop the original 'salary' column\ndf = df.drop(columns=['salary'])\n\n# Rename 'salary_with_bonus' to 'salary'\ndf = df.rename(columns={'salary_with_bonus': 'salary'})\n\nprint(df)`}
/>

---

## Key Takeaways

- **Add a column**: `df['new_col'] = expression` — the expression is typically a vectorized operation on existing columns
- **Modify a column**: assign a new value to the same column name — overwrites in place
- **Drop columns**: `df.drop(columns=['col'])` returns a new DataFrame; reassign or use `inplace=True`
- **`.apply()`**: applies a Python function element-wise to a Series — use only when vectorized ops cannot express the logic
- Vectorized ops (`df['col'] * 2`) are 10-100x faster than `.apply()` on large datasets

---

## Common Mistakes to Avoid

- **Forgetting to reassign after `.drop()`**: `df.drop(columns=['col'])` returns a new DF — the original is unchanged unless you write `df = df.drop(...)`
- **Overusing `.apply()`**: adding a constant, multiplying, or string ops all have vectorized equivalents — don't reach for `.apply()` first
- **`inplace=True` trap**: `df.drop(columns=['col'], inplace=True)` returns `None` — writing `result = df.drop(..., inplace=True)` silently sets `result` to `None`

---

[← Previous Lesson](./lesson-05-boolean-filtering.md) | [Back to Course Overview](./README.md) | [Next Lesson: Data Types and Type Inspection →](./lesson-07-dtypes-and-type-inspection.md)
