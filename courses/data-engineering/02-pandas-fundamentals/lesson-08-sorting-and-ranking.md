# Lesson 8: Sorting and Ranking

**Course:** Data Engineering | **Duration:** 35 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Sort a DataFrame by one or multiple columns using `.sort_values()`
- Sort a DataFrame by its row index using `.sort_index()`
- Assign ranks to rows using `.rank()`
- Retrieve the top or bottom N rows with `.nlargest()` and `.nsmallest()`

---

## Prerequisites

- Lesson 7: Data Types and Type Inspection

---

## Lesson Outline

### Part 1: `.sort_values()` — Sort by Column Values

`.sort_values()` returns a new DataFrame sorted by the specified column(s).

```python
import pandas as pd

df = pd.DataFrame({
    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],
    'salary':     [95000, 72000, 88000, 68000, 105000]
})

# Sort by salary ascending (default)
print(df.sort_values('salary'))
#     name   department  salary
# 3  David    Marketing   68000
# 1    Bob    Marketing   72000
# 2  Carol  Engineering   88000
# 0  Alice  Engineering   95000
# 4    Eve  Engineering  105000

# Sort by salary descending
print(df.sort_values('salary', ascending=False))
#     name   department  salary
# 4    Eve  Engineering  105000
# 0  Alice  Engineering   95000
# 2  Carol  Engineering   88000
# 1    Bob    Marketing   72000
# 3  David    Marketing   68000
```

**Multi-column sort:** pass a list of column names. The second column is used as a tiebreaker.

```python
# Sort by department ascending, then by salary descending within each department
print(df.sort_values(['department', 'salary'], ascending=[True, False]))
#     name   department  salary
# 4    Eve  Engineering  105000
# 0  Alice  Engineering   95000
# 2  Carol  Engineering   88000
# 1    Bob    Marketing   72000
# 3  David    Marketing   68000
```

<Tip>
`.sort_values()` returns a new DataFrame — the original is unchanged. Reassign if you need the sorted version: `df = df.sort_values('salary')`. Or pass `inplace=True`, but prefer reassignment for clarity.
</Tip>

---

### Part 2: `.sort_index()` — Sort by Row Index

`.sort_index()` sorts rows by their index labels. Useful after filtering (which preserves original row numbers) or after setting a custom index.

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['Alice', 'Bob', 'Carol'],
    'salary': [95000, 72000, 88000]
}, index=['E003', 'E001', 'E002'])

# Sort by index (alphabetically for string index)
print(df.sort_index())
#       name  salary
# E001   Bob   72000
# E002  Carol   88000
# E003  Alice   95000

# Sort descending
print(df.sort_index(ascending=False))
```

---

### Part 3: `.rank()` — Assign Ranks

`.rank()` returns a Series of float ranks. The `method` parameter controls how ties are handled.

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'salary': [95000, 72000, 88000, 88000, 105000]  # Carol and David tie
})

# Default: 'average' — tied values get the average of the ranks they would have
df['rank_avg'] = df['salary'].rank(ascending=False)
print(df[['name', 'salary', 'rank_avg']])
#     name  salary  rank_avg
# 0  Alice   95000       2.0
# 1    Bob   72000       5.0
# 2  Carol   88000       3.5   # tie: (3+4)/2
# 3  David   88000       3.5   # tie: (3+4)/2
# 4    Eve  105000       1.0

# 'dense' — no gaps in ranking even after ties
df['rank_dense'] = df['salary'].rank(method='dense', ascending=False)
print(df[['name', 'salary', 'rank_dense']])
# 1.0, 4.0, 2.0, 2.0, 1.0  (no 3.0 gap — 1, 2, 4 not 1, 2, 3, 4, 5 with skip)
```

| method | Behavior |
|--------|---------|
| `average` | Tied values get the average of their rank positions (default) |
| `min` | Tied values all get the minimum rank |
| `max` | Tied values all get the maximum rank |
| `dense` | Like `min`, but no gaps after ties |
| `first` | Ranks in order of first appearance |

---

### Part 4: `.nlargest()` and `.nsmallest()` — Top/Bottom N

These are efficient shortcuts for "sort descending, take first N rows" — faster than sorting the entire DataFrame when you only need the extremes.

```python
import pandas as pd

df = pd.DataFrame({
    'name':   ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
    'salary': [95000, 72000, 88000, 68000, 105000]
})

# Top 3 salaries
print(df.nlargest(3, 'salary'))
#     name  salary
# 4    Eve  105000
# 0  Alice   95000
# 2  Carol   88000

# Bottom 2 salaries
print(df.nsmallest(2, 'salary'))
#     name  salary
# 3  David   68000
# 1    Bob   72000
```

Use `.nlargest()`/`.nsmallest()` instead of `sort_values(...).head(N)` — they skip the full sort, making them faster on large DataFrames.

---

## Practice

<PracticeBlock
  prompt="Sort the employee DataFrame first by department ascending, then by salary descending within each department. Print the sorted result."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000]\n})\n\n# Sort by department ascending, then salary descending\nsorted_df = \nprint(sorted_df)\n`}
  hint="Use df.sort_values(['department', 'salary'], ascending=[True, False]) — pass a list for both column names and ascending flags."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000]\n})\n\n# Sort by department ascending, then salary descending\nsorted_df = df.sort_values(['department', 'salary'], ascending=[True, False])\nprint(sorted_df)`}
/>

<PracticeBlock
  prompt="Use .nlargest(3) to find the 3 highest-paid employees. Then use .nsmallest(2) to find the 2 lowest-paid employees."
  initialCode={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000]\n})\n\n# Top 3 highest-paid\nprint("Top 3 earners:")\n\n\n# Bottom 2 lowest-paid\nprint("Bottom 2 earners:")\n\n`}
  hint="Use df.nlargest(3, 'salary') and df.nsmallest(2, 'salary'). Pass the column name as the second argument."
  solution={`import pandas as pd\n\ndf = pd.DataFrame({\n    'name':       ['Alice', 'Bob', 'Carol', 'David', 'Eve'],\n    'department': ['Engineering', 'Marketing', 'Engineering', 'Marketing', 'Engineering'],\n    'salary':     [95000, 72000, 88000, 68000, 105000]\n})\n\n# Top 3 highest-paid\nprint("Top 3 earners:")\nprint(df.nlargest(3, 'salary'))\n\n# Bottom 2 lowest-paid\nprint("\nBottom 2 earners:")\nprint(df.nsmallest(2, 'salary'))`}
/>

---

## Key Takeaways

- `.sort_values('col')` — sort ascending by default; `ascending=False` for descending
- **Multi-column sort**: pass lists for both column names and ascending flags
- `.sort_index()` — sort rows by their index labels; useful after filtering or reindexing
- `.rank(method='dense')` — assign numeric ranks; control tie handling with `method=`
- `.nlargest(n, 'col')` / `.nsmallest(n, 'col')` — efficient top/bottom N; faster than sort + head

---

## Common Mistakes to Avoid

- **Forgetting to assign**: `df.sort_values('salary')` returns a new DF — original unchanged unless you reassign
- **`ascending` with multi-sort**: for multi-column sort, `ascending` must be a list matching the columns list: `ascending=[True, False]`
- **Using `sort_values` for index**: use `.sort_index()` for sorting by the row index, not `.sort_values(df.index)`

---

[← Previous Lesson](./lesson-07-dtypes-and-type-inspection.md) | [Back to Course Overview](./README.md) | [Next Lesson: Basic Statistics →](./lesson-09-basic-statistics.md)
