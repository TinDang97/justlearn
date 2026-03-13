# Lesson 1: NumPy Fundamentals

**Course:** Data Analysis & Visualization | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Create and manipulate NumPy arrays
- Perform vectorized operations
- Understand array shapes and broadcasting
- Use NumPy for statistical calculations

---

## Lesson Outline

### Part 1: NumPy Arrays (30 minutes)

#### Explanation

```python
import numpy as np

# Create arrays:
a = np.array([1, 2, 3, 4, 5])               # 1D array
b = np.array([[1, 2, 3], [4, 5, 6]])         # 2D array (matrix)

# Properties:
print(a.shape)    # (5,) - one dimension with 5 elements
print(b.shape)    # (2, 3) - 2 rows, 3 columns
print(a.dtype)    # int64
print(b.ndim)     # 2 dimensions

# Creation functions:
np.zeros((3, 4))          # 3×4 array of zeros
np.ones((2, 5))           # 2×5 array of ones
np.eye(3)                 # 3×3 identity matrix
np.arange(0, 10, 2)       # [0, 2, 4, 6, 8]
np.linspace(0, 1, 5)      # [0., 0.25, 0.5, 0.75, 1.]
np.random.rand(3, 3)      # 3×3 random floats [0, 1)
np.random.randint(1, 10, (4, 4))  # 4×4 random integers 1-9

# Indexing and slicing (like lists but multi-dimensional):
a[0]         # 1 (first element)
a[-1]        # 5 (last element)
a[1:4]       # [2, 3, 4]
b[0, :]      # [1, 2, 3] (first row)
b[:, 1]      # [2, 5] (second column)
b[0:2, 1:3]  # [[2, 3], [5, 6]] (submatrix)
```

#### Practice

Create a 5×5 checkerboard pattern (0s and 1s) using NumPy. Hint: use slicing with step.

---

### Part 2: Vectorized Operations (30 minutes)

#### Explanation

```python
import numpy as np

# Vectorized math (no loops needed!):
a = np.array([1, 2, 3, 4, 5])

a + 10        # [11, 12, 13, 14, 15] - broadcast scalar
a * 2         # [2, 4, 6, 8, 10]
a ** 2        # [1, 4, 9, 16, 25]
np.sqrt(a)    # [1., 1.41, 1.73, 2., 2.24]

# Array arithmetic (element-wise):
b = np.array([10, 20, 30, 40, 50])
a + b         # [11, 22, 33, 44, 55]
a * b         # [10, 40, 90, 160, 250]

# MUCH faster than loops:
# Python loop: 1000 iterations
python_time = sum(x**2 for x in range(1000000))

# NumPy: same operation, ~100x faster
numpy_time = np.arange(1000000) ** 2

# Statistical operations:
data = np.random.normal(50, 10, 1000)  # 1000 values, mean=50, std=10
print(np.mean(data))    # ~50
print(np.std(data))     # ~10
print(np.median(data))  # ~50
print(np.min(data), np.max(data))
print(np.percentile(data, [25, 50, 75]))  # Quartiles
```

#### Practice

Given an array of 1000 random test scores (0-100), calculate: mean, median, standard deviation, percentage above 70.

---

### Part 3: Broadcasting and Boolean Indexing (30 minutes)

#### Explanation

```python
import numpy as np

# Boolean indexing (filter arrays):
scores = np.array([72, 85, 91, 63, 78, 95, 55, 88])
passing = scores[scores >= 70]    # [72, 85, 91, 78, 95, 88]
honors = scores[scores >= 90]     # [91, 95]

# Conditions:
np.where(scores >= 70, "Pass", "Fail")
# ['Pass', 'Pass', 'Pass', 'Fail', 'Pass', 'Pass', 'Fail', 'Pass']

# Broadcasting (different-shaped arrays):
a = np.array([[1], [2], [3]])    # Shape: (3, 1)
b = np.array([10, 20, 30])      # Shape: (3,)
a + b   # Broadcasting: (3,1) + (3,) → (3,3)
# [[11, 21, 31],
#  [12, 22, 32],
#  [13, 23, 33]]

# Practical: normalize data to 0-1 range:
data = np.array([10, 20, 30, 40, 50])
normalized = (data - data.min()) / (data.max() - data.min())
# [0.  0.25  0.5  0.75  1.]

# Reshape:
a = np.arange(12)      # [0, 1, 2, ..., 11]
matrix = a.reshape(3, 4)   # 3 rows, 4 columns
flat = matrix.flatten()    # Back to 1D
```

#### Practice

Given a 2D array of student grades (students × subjects), find: students with all grades >= 60, subject with highest average.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Statistics Calculator

```python
def analyze_dataset(data: np.ndarray) -> dict:
    """Compute comprehensive statistics for a dataset."""
    return {
        "count": len(data),
        "mean": np.mean(data),
        "median": np.median(data),
        "std": np.std(data),
        "min": np.min(data),
        "max": np.max(data),
        "q1": np.percentile(data, 25),
        "q3": np.percentile(data, 75),
        "iqr": np.percentile(data, 75) - np.percentile(data, 25),
        "skewness": ...,  # Calculate: mean > median → right-skewed
    }
```

#### Exercise 2: Grade Matrix

Given a 30×5 matrix (30 students, 5 subjects):
1. Add a column for each student's average
2. Find the top 5 students by average
3. Find the hardest subject (lowest average)
4. Count how many students would pass (average >= 60)

---

## Key Takeaways

- NumPy arrays are faster than Python lists for numerical computation
- Vectorized operations (no explicit loops) are the NumPy way
- `array[condition]` filters elements where condition is True
- Broadcasting allows operations on arrays with compatible shapes
- `np.where(condition, a, b)` is the vectorized if-else

---

[Back to Course](./README.md) | [Next →](./lesson-02-pandas-introduction.md)
