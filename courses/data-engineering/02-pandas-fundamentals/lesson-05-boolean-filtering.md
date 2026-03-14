# Lesson 5: Boolean Filtering

**Course:** Data Engineering | **Duration:** 45 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Create a boolean mask from a comparison condition
- Apply a mask to filter DataFrame rows
- Combine conditions with `&` (AND), `|` (OR), and `~` (NOT)
- Filter rows using the `.query()` string method

---

## Prerequisites

- Lesson 4: Indexing and Selection

---

## Lesson Outline

### Part 1: Boolean Masks

A **boolean mask** is a Series of `True`/`False` values, one per row, that indicates which rows meet a condition.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000, 68000, 105000],
    'years_experience': [5, 3, 7, 2, 9]
})

# Create a mask: which rows have salary > 80000?
mask = df['salary'] > 80000
print(mask)
# 0     True
# 1    False
# 2     True
# 3    False
# 4     True
# Name: salary, dtype: bool
```

The mask has the same index as the DataFrame. `True` means "keep this row", `False` means "exclude this row".

---

### Part 2: Applying a Mask to Filter Rows

Pass the boolean mask inside `df[...]` to return only the rows where the mask is `True`.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000, 68000, 105000],
    'years_experience': [5, 3, 7, 2, 9]
})

# Filter: only rows where salary > 80000
high_earners = df[df['salary'] > 80000]
print(high_earners)
#     name   department  salary  years_experience
# 0  Alice  Engineering   95000                 5
# 2  Carol  Engineering   88000                 7
# 4    Eve  Engineering  105000                 9
```

You can also filter for string equality:

```python
engineers = df[df['department'] == 'Engineering']
```

---

### Part 3: Compound Conditions

Combine multiple conditions using bitwise operators (not Python's `and`/`or`):

| Operator | Meaning |
|----------|---------|
| `&` | AND — both conditions must be True |
| `\|` | OR — at least one condition must be True |
| `~` | NOT — inverts the condition |

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000, 68000, 105000],
    'years_experience': [5, 3, 7, 2, 9]
})

# AND: Engineering AND salary > 85000
senior_engineers = df[(df['department'] == 'Engineering') & (df['salary'] > 85000)]
print(senior_engineers)
#     name   department  salary  years_experience
# 0  Alice  Engineering   95000                 5
# 2  Carol  Engineering   88000                 7
# 4    Eve  Engineering  105000                 9

# OR: Marketing OR salary < 70000
print(df[(df['department'] == 'Marketing') | (df['salary'] < 70000)])

# NOT: everyone who is NOT in Marketing
not_marketing = df[~(df['department'] == 'Marketing')]
print(not_marketing)
```

<Warning>
Use `&` and `|` for pandas conditions, NOT Python's `and`/`or`. Python's `and`/`or` do not work element-wise on arrays and will raise a `ValueError`. Also, **parentheses are required** around each condition when combining: `(df['a'] > 1) & (df['b'] < 5)`.
</Warning>

---

### Part 4: The `.query()` Method

`.query()` accepts a string expression for filtering — useful for readable, concise conditions.

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000, 68000, 105000],
    'years_experience': [5, 3, 7, 2, 9]
})

# Equivalent to df[(df['department'] == 'Engineering') & (df['salary'] > 85000)]
result = df.query("department == 'Engineering' and salary > 85000")
print(result)
#     name   department  salary  years_experience
# 0  Alice  Engineering   95000                 5
# 2  Carol  Engineering   88000                 7
# 4    Eve  Engineering  105000                 9

# Reference a Python variable in the query string with @
threshold = 80000
print(df.query("salary > @threshold"))
```

<Tip>
Use `.query()` for multi-condition filters where the boolean mask syntax gets long. Both approaches produce identical results — choose whichever is more readable in context.
</Tip>

---

## Practice

<PracticeBlock
  prompt="Filter the employee DataFrame to return only Engineering employees with a salary greater than 85,000. Use the boolean mask approach with &."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000],\n    'years_experience': [5, 3, 7, 2, 9]\n})\n\n# Filter: Engineering AND salary > 85000\nresult = \nprint(result)\n`}
  hint="Combine two conditions with &: (df['department'] == 'Engineering') & (df['salary'] > 85000). Don't forget the parentheses around each condition."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000],\n    'years_experience': [5, 3, 7, 2, 9]\n})\n\n# Filter: Engineering AND salary > 85000\nresult = df[(df['department'] == 'Engineering') & (df['salary'] > 85000)]\nprint(result)`}
/>

<PracticeBlock
  prompt="Rewrite the same filter (Engineering AND salary > 85,000) using the .query() method. The result should be identical."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000],\n    'years_experience': [5, 3, 7, 2, 9]\n})\n\n# Use .query() instead of boolean mask\nresult = df.query(\n\nprint(result)\n`}
  hint="Pass a string to .query(): \"department == 'Engineering' and salary > 85000\". Use Python's 'and' inside the query string (not &)."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000],\n    'years_experience': [5, 3, 7, 2, 9]\n})\n\n# Use .query() instead of boolean mask\nresult = df.query("department == 'Engineering' and salary > 85000")\nprint(result)`}
/>

---

## Key Takeaways

- A **boolean mask** is a Series of True/False values from a comparison — pass it to `df[mask]` to filter rows
- **Compound conditions** require `&` (AND), `|` (OR), `~` (NOT) — never `and`/`or`
- **Parentheses are required** around each condition: `(df['a'] > 1) & (df['b'] < 5)`
- `.query()` accepts string expressions — cleaner syntax for multi-condition filters
- Reference Python variables in `.query()` with the `@` prefix: `df.query("salary > @threshold")`

---

## Common Mistakes to Avoid

- **Using `and`/`or` instead of `&`/`|`**: raises `ValueError: The truth value of a Series is ambiguous`
- **Missing parentheses**: `df[df['a'] > 1 & df['b'] < 5]` — operator precedence bites you; always use `(...)  & (...)`
- **Filtering by index instead of column**: `df[0]` is column `0`, not row 0 — use `df.iloc[0]` for rows

---

[← Previous Lesson](./lesson-04-indexing-and-selection.md) | [Back to Course Overview](./README.md) | [Next Lesson: Column Operations →](./lesson-06-column-operations.md)
