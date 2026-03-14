# Lesson 2: Creating and Inspecting Series

**Course:** Data Engineering | **Duration:** 40 minutes | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Create a pandas Series from a list, dict, scalar, and NumPy array
- Set a custom index on a Series
- Access Series attributes: `.values`, `.index`, `.dtype`, `.name`, `.size`, `.shape`
- Perform vectorized arithmetic on a Series

---

## Prerequisites

- Lesson 1: Introduction to Series and DataFrame

---

## Lesson Outline

### Part 1: Creating a Series — Four Methods

#### From a list (most common)

```python
import pandas as pd

# Default integer index: 0, 1, 2, ...
scores = pd.Series([88, 92, 75, 95, 83])
print(scores)
# 0    88
# 1    92
# 2    75
# 3    95
# 4    83
# dtype: int64
```

#### From a dict (keys become the index)

```python
# Dict keys become the index automatically
prices = pd.Series({'apple': 1.20, 'banana': 2.50, 'carrot': 0.89})
print(prices)
# apple     1.20
# banana    2.50
# carrot    0.89
# dtype: float64
```

#### From a scalar (broadcast to all index positions)

```python
# Scalar fills all positions — must provide index explicitly
default_score = pd.Series(0, index=['Alice', 'Bob', 'Carol', 'Diana'])
print(default_score)
# Alice    0
# Bob      0
# Carol    0
# Diana    0
# dtype: int64
```

#### From a NumPy array

```python
import numpy as np

# NumPy array as input — same as list creation
arr = np.array([1.5, 2.5, 3.5])
s = pd.Series(arr, name='measurements')
print(s)
# 0    1.5
# 1    2.5
# 2    3.5
# Name: measurements, dtype: float64
```

---

### Part 2: The Index — Default vs Custom

Every Series has an index. If you don't provide one, pandas assigns a RangeIndex (0, 1, 2, ...). Custom indexes make your data self-documenting.

```python
import pandas as pd

# Default integer index
s1 = pd.Series([10, 20, 30])
print(s1.index)  # RangeIndex(start=0, stop=3, step=1)

# Custom string index
s2 = pd.Series([10, 20, 30], index=['jan', 'feb', 'mar'])
print(s2.index)  # Index(['jan', 'feb', 'mar'], dtype='object')

# Access by label with custom index
print(s2['feb'])  # 20
```

<Tip>
A custom index makes label-based access readable and prevents positional bugs. `revenue['jan']` is more maintainable than `revenue[0]` when indexes carry meaning.
</Tip>

---

### Part 3: Series Attributes

After creating a Series, these attributes answer "what do I have?":

```python
import pandas as pd

products = pd.Series(
    [1200.0, 25.0, 75.0, 350.0],
    index=['Laptop', 'Mouse', 'Keyboard', 'Monitor'],
    name='price_usd'
)

print(products.values)   # array([1200. ,   25. ,   75. ,  350. ])  — NumPy array
print(products.index)    # Index(['Laptop', 'Mouse', 'Keyboard', 'Monitor'], dtype='object')
print(products.dtype)    # float64
print(products.name)     # price_usd
print(products.size)     # 4  — total number of elements
print(products.shape)    # (4,)  — tuple, like NumPy
```

| Attribute | What it returns |
|-----------|----------------|
| `.values` | NumPy array of the raw data |
| `.index` | The Index object (labels) |
| `.dtype` | The data type of the values |
| `.name` | The name of the Series (or None) |
| `.size` | Integer count of elements |
| `.shape` | Tuple: `(n,)` for a Series |

---

### Part 4: Vectorized Operations

One of pandas' most powerful features: arithmetic on a Series applies to every element at once, with no loop required.

```python
import pandas as pd

prices = pd.Series(
    {'apple': 1.20, 'banana': 2.50, 'carrot': 0.89},
    name='price_usd'
)

# Apply 10% tax to every price — no loop needed
with_tax = prices * 1.10
print(with_tax)
# apple     1.320
# banana    2.750
# carrot    0.979
# Name: price_usd, dtype: float64

# Arithmetic between two Series aligns by index
discount = pd.Series({'apple': 0.10, 'banana': 0.20, 'carrot': 0.05})
final_prices = prices - (prices * discount)
print(final_prices)
# apple     1.080
# banana    2.000
# carrot    0.8455
# dtype: float64
```

<Info>
When you do arithmetic between two Series, pandas aligns values by their index labels — not by position. If the indexes don't match, you get NaN for the missing combinations. This alignment-by-index behavior is a fundamental pandas concept.
</Info>

---

## Practice

<PracticeBlock
  prompt="Create a Series of 5 product prices with product names as the index. Then access the price of 'keyboard' by its label name."
  initialCode={`import pandas as pd\n\n# Create a Series with product names as the index\n# Products: laptop=1200.0, mouse=25.0, keyboard=75.0, monitor=350.0, webcam=89.0\nprices = pd.Series(\n    # your values here\n    # your index here\n)\n\n# Access the price of 'keyboard' by label\n`}
  hint="Use pd.Series([1200.0, 25.0, 75.0, 350.0, 89.0], index=['laptop', 'mouse', 'keyboard', 'monitor', 'webcam']). Then access with prices['keyboard']."
  solution={`import pandas as pd\n\n# Create a Series with product names as the index\nprices = pd.Series(\n    [1200.0, 25.0, 75.0, 350.0, 89.0],\n    index=['laptop', 'mouse', 'keyboard', 'monitor', 'webcam'],\n    name='price_usd'\n)\n\nprint(prices)\nprint()\n# Access the price of 'keyboard' by label\nprint("Keyboard price:", prices['keyboard'])`}
/>

<PracticeBlock
  prompt="Add a 10% tax to every price in your product prices Series using a single arithmetic operation. Print both the original and the tax-included prices."
  initialCode={`import pandas as pd\n\nprices = pd.Series(\n    [1200.0, 25.0, 75.0, 350.0, 89.0],\n    index=['laptop', 'mouse', 'keyboard', 'monitor', 'webcam'],\n    name='price_usd'\n)\n\n# Add 10% tax to every price with a single operation\nprices_with_tax = \n\nprint("Original prices:")\nprint(prices)\nprint()\nprint("Prices with 10% tax:")\nprint(prices_with_tax)\n`}
  hint="Multiply the entire Series by 1.10 — pandas applies the multiplication to every element automatically."
  solution={`import pandas as pd\n\nprices = pd.Series(\n    [1200.0, 25.0, 75.0, 350.0, 89.0],\n    index=['laptop', 'mouse', 'keyboard', 'monitor', 'webcam'],\n    name='price_usd'\n)\n\n# Add 10% tax to every price with a single operation\nprices_with_tax = prices * 1.10\n\nprint("Original prices:")\nprint(prices)\nprint()\nprint("Prices with 10% tax:")\nprint(prices_with_tax)`}
/>

---

## Key Takeaways

- Create a Series from: a list (with optional index), a dict (keys become index), a scalar (fills all positions), or a NumPy array
- Use a custom `index=` parameter for human-readable label access
- Core attributes: `.values` (NumPy array), `.index`, `.dtype`, `.name`, `.size`, `.shape`
- Arithmetic on a Series is vectorized — no loops needed; operations apply element-wise
- When doing arithmetic between two Series, pandas aligns by index label, not position

---

## Common Mistakes to Avoid

- **Forgetting the `index=` keyword**: `pd.Series([1, 2, 3], ['a', 'b', 'c'])` raises a `TypeError` — use `pd.Series([1, 2, 3], index=['a', 'b', 'c'])`
- **Mismatched index sizes**: if you provide 5 values but 4 index labels, pandas raises a `ValueError`
- **Confusing `.size` and `.shape`**: `.size` is an integer; `.shape` is a tuple `(n,)`

---

[← Previous Lesson](./lesson-01-series-and-dataframe-intro.md) | [Back to Course Overview](./README.md) | [Next Lesson: Creating DataFrames →](./lesson-03-creating-dataframes.md)
