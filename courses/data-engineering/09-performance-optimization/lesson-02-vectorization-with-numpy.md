# Lesson 2: Vectorization with NumPy

**Course:** Data Engineering | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

By the end of this lesson, you will be able to:
- Create NumPy arrays and measure their creation time versus Python lists
- Perform element-wise arithmetic on arrays without writing loops
- Use broadcasting to operate on arrays of different shapes
- Apply universal functions (ufuncs) for mathematical operations
- Explain why NumPy is faster than Python loops (contiguous memory, SIMD, no GIL per element)

---

## Prerequisites

- Lesson 1: Why Performance Matters
- Section 2: Pandas Fundamentals
- Basic NumPy familiarity (arrays, shapes, dtypes)

---

## Lesson Outline

### Part 1: Before / After — Loop vs. NumPy Array (30 minutes)

#### Explanation

The speed difference between a Python loop and a NumPy operation is not a small improvement — it is a fundamental change in what the CPU is doing.

**Python loop:** for each element, Python must look up the object in memory, unbox it to get the numeric value, perform the operation, create a new Python object for the result, and store a pointer. Each of these steps costs time and cannot be parallelized easily.

**NumPy array:** all elements are stored as raw C-typed numbers in a single contiguous block of memory. NumPy passes a pointer to the start of that block and an operation type to a compiled C function. The CPU executes SIMD (Single Instruction Multiple Data) instructions that process 4-8 elements simultaneously.

```python
import numpy as np
import time

# Create 1 million numbers
n = 1_000_000
python_list = list(range(n))
numpy_array = np.arange(n, dtype=np.float64)

# BEFORE (slow) — Python loop sum
start = time.perf_counter()
total = 0
for x in python_list:
    total += x
loop_time = time.perf_counter() - start
print(f"Python loop sum: {loop_time:.4f}s   result={total}")
# Python loop sum: 0.0721s   result=499999500000

# AFTER (fast) — NumPy vectorized sum
start = time.perf_counter()
total = np.sum(numpy_array)
numpy_time = time.perf_counter() - start
print(f"NumPy sum:       {numpy_time:.4f}s   result={total:.0f}")
# NumPy sum:       0.0008s   result=499999500000

speedup = loop_time / numpy_time
print(f"Speedup: {speedup:.0f}x faster")
# Speedup: ~90x faster
```

**Why contiguous memory matters:**

```python
import numpy as np

# Python list: each element is a pointer to a heap-allocated object
# Memory layout: [ptr0, ptr1, ptr2, ...] → each ptr points somewhere in heap
py_list = [1, 2, 3, 4, 5]

# NumPy array: raw numbers packed together
# Memory layout: [1.0, 2.0, 3.0, 4.0, 5.0] — sequential floats in RAM
np_array = np.array([1.0, 2.0, 3.0, 4.0, 5.0])

# The CPU cache can pre-fetch the entire array in one cache line (64 bytes = 8 float64)
# Python list elements are scattered → cache misses on every access

print(np_array.itemsize)  # 8 bytes per float64
print(np_array.nbytes)    # 40 bytes total, contiguous
```

---

#### Practice

Time the creation of a 500,000-element list using `list(range(500_000))` versus a NumPy array using `np.arange(500_000)`. Print both times and the speedup ratio. Which is faster and by how much?

---

### Part 2: Vectorized Arithmetic and Ufuncs (30 minutes)

#### Explanation

Once data is in a NumPy array, arithmetic operations work element-wise across the entire array with a single function call. These operations use **universal functions (ufuncs)** — compiled C routines that operate on entire arrays.

```python
import numpy as np
import time

n = 1_000_000
a = np.random.uniform(1, 100, size=n)
b = np.random.uniform(1, 100, size=n)

# Element-wise arithmetic — no loops, no apply
start = time.perf_counter()
result_add = a + b          # addition
result_mul = a * b          # multiplication
result_pow = a ** 2         # power
elapsed = time.perf_counter() - start
print(f"Three vectorized ops on {n:,} elements: {elapsed:.4f}s")
# Three vectorized ops on 1,000,000 elements: 0.0041s

# Math ufuncs — one call, whole array
result_sqrt = np.sqrt(a)    # square root
result_log  = np.log(a)     # natural log (a > 0)
result_exp  = np.exp(a)     # e^x (careful: overflow for large a)
result_abs  = np.abs(a - b) # absolute difference

print(f"sqrt sample: {result_sqrt[:3]}")
# sqrt sample: [7.21 9.43 3.14]

print(f"log sample:  {result_log[:3]}")
# log sample: [1.98 2.24 1.14]
```

**Ufunc reference — the ones you will use most:**

```python
import numpy as np

a = np.array([4.0, 9.0, 16.0, 25.0])
b = np.array([2.0, 3.0,  4.0,  5.0])

# Mathematical
print(np.sqrt(a))          # [2. 3. 4. 5.]
print(np.log(a))           # [1.386 2.197 2.773 3.219]
print(np.log2(a))          # [2. 3.216 4. 4.644]
print(np.exp(b))           # [7.389 20.086 54.598 148.413]
print(np.abs(a - b * 3))   # [2. 0. 4. 10.]

# Aggregate ufuncs
print(np.sum(a))           # 54.0
print(np.prod(b))          # 120.0
print(np.cumsum(a))        # [4. 13. 29. 54.]
print(np.maximum(a, b))    # element-wise max: [4. 9. 16. 25.]
print(np.minimum(a, b))    # element-wise min: [2. 3.  4.  5.]

# Comparison
print(a > b)               # [True True True True]
print(np.where(a > 10, a, 0))  # [0. 0. 16. 25.] — covered in Lesson 7
```

---

#### Practice

Create two NumPy arrays of 100,000 random values between 0 and 10. Without using any loop, compute:
1. The sum of each pair of elements (`a + b`)
2. The square root of each element in `a`
3. The element-wise maximum of `a` and `b`

Print the shape and first 5 elements of each result.

---

### Part 3: Broadcasting (30 minutes)

#### Explanation

Broadcasting allows NumPy operations to work on arrays of different shapes by automatically "stretching" the smaller array to match the larger one — without copying any data.

**Broadcasting rule:** two dimensions are compatible if they are equal, or one of them is 1. NumPy aligns shapes from the right.

```python
import numpy as np

# 2D array: shape (2, 3)
a = np.array([[1, 2, 3],
              [4, 5, 6]])
print(a.shape)  # (2, 3)

# 1D array: shape (3,)
b = np.array([10, 20, 30])
print(b.shape)  # (3,)

# Broadcasting: b is treated as [[10, 20, 30], [10, 20, 30]]
result = a + b
print(result)
# [[11 22 33]
#  [14 25 36]]

# Example 2: column vector (shape (2, 1)) broadcasts across columns
col_vec = np.array([[100],
                    [200]])  # shape (2, 1)
result2 = a + col_vec
print(result2)
# [[101 102 103]
#  [204 205 206]]
```

**Broadcasting with scalars (the most common case):**

```python
import numpy as np

prices = np.array([9.99, 24.99, 4.99, 14.99])

# Scalar broadcasts to every element — no loop needed
discounted = prices * 0.9  # 10% discount
print(discounted)
# [ 8.991 22.491  4.491 13.491]

tax_rate = 0.08
with_tax = prices * (1 + tax_rate)
print(with_tax)
# [10.7892 26.9892  5.3892 16.1892]
```

**When broadcasting fails:**

```python
import numpy as np

a = np.array([[1, 2, 3],   # shape (2, 3)
              [4, 5, 6]])

b = np.array([10, 20])     # shape (2,) — aligned from right: 3 vs 2 → MISMATCH

try:
    result = a + b
except ValueError as e:
    print(f"Error: {e}")
# Error: operands could not be broadcast together with shapes (2,3) (2,)

# Fix: reshape b to (2, 1) so it broadcasts along columns
b_col = b.reshape(2, 1)    # shape (2, 1)
result = a + b_col
print(result)
# [[11 12 13]
#  [24 25 26]]
```

---

#### Practice

Create a matrix of shape (3, 4) containing values 1 through 12. Create a row vector `[1, 2, 3, 4]`. Subtract the row vector from every row of the matrix using broadcasting. Verify the result shape is still (3, 4).

---

### Part 4: Timing Practice (30 minutes)

#### Explanation

Now that you understand NumPy's speed advantage, the next step is measuring it on your own problems. This practice locks in the before/after pattern used throughout this section.

```python
import numpy as np
import time

# Utility: run timing comparison
def compare_speed(slow_fn, fast_fn, label_slow, label_fast, *args):
    start = time.perf_counter()
    slow_result = slow_fn(*args)
    slow_time = time.perf_counter() - start

    start = time.perf_counter()
    fast_result = fast_fn(*args)
    fast_time = time.perf_counter() - start

    speedup = slow_time / fast_time if fast_time > 0 else float('inf')
    print(f"{label_slow:30s}: {slow_time:.4f}s")
    print(f"{label_fast:30s}: {fast_time:.4f}s")
    print(f"Speedup: {speedup:.0f}x")
    return slow_result, fast_result

# Example: Celsius to Fahrenheit conversion
celsius_list  = list(range(100_000))
celsius_array = np.array(celsius_list, dtype=np.float64)

def loop_convert(data):
    return [c * 9/5 + 32 for c in data]

def numpy_convert(data):
    return data * 9/5 + 32

slow_r, fast_r = compare_speed(
    loop_convert, numpy_convert,
    "Python list comprehension", "NumPy vectorized",
    celsius_list, # passed to slow_fn
)
# Note: fast_fn needs numpy array, so we pass the right data per use case
```

---

<PracticeBlock
  title="Temperature Conversion — Vectorized"
  starter={`import numpy as np
import time

# Given: 10,000 temperatures in Celsius
np.random.seed(42)
celsius = np.random.uniform(-40, 60, size=10_000)

# Task 1: Using a Python list comprehension (slow path)
start = time.perf_counter()
fahrenheit_loop = [c * 9/5 + 32 for c in celsius]
loop_time = time.perf_counter() - start
print(f"List comprehension: {loop_time:.4f}s")

# Task 2: Using NumPy vectorized operation (fast path)
# TODO: compute fahrenheit_numpy using a single NumPy expression
# fahrenheit_numpy = ...

# Task 3: Print min, max, and mean of the NumPy result
# TODO: print stats

# Task 4: Verify results match (within floating point tolerance)
# np.testing.assert_allclose(fahrenheit_numpy, fahrenheit_loop, rtol=1e-5)
`}
  solution={`import numpy as np
import time

np.random.seed(42)
celsius = np.random.uniform(-40, 60, size=10_000)

# BEFORE (slow) — list comprehension
start = time.perf_counter()
fahrenheit_loop = [c * 9/5 + 32 for c in celsius]
loop_time = time.perf_counter() - start
print(f"List comprehension: {loop_time:.4f}s")

# AFTER (fast) — NumPy vectorized
start = time.perf_counter()
fahrenheit_numpy = celsius * 9/5 + 32
numpy_time = time.perf_counter() - start
print(f"NumPy vectorized:   {numpy_time:.4f}s")
print(f"Speedup: {loop_time / numpy_time:.0f}x")

# Stats
print(f"Min:  {fahrenheit_numpy.min():.2f}°F")
print(f"Max:  {fahrenheit_numpy.max():.2f}°F")
print(f"Mean: {fahrenheit_numpy.mean():.2f}°F")

# Verify
np.testing.assert_allclose(fahrenheit_numpy, fahrenheit_loop, rtol=1e-5)
print("Results match: PASS")`}
/>

---

## Key Takeaways

- NumPy stores data as typed C arrays — not Python objects. This eliminates per-element Python overhead
- Ufuncs call optimized BLAS/LAPACK routines; the CPU executes SIMD instructions processing 4-8 elements at once
- Broadcasting eliminates explicit loops over dimensions by aligning array shapes from the right
- Shape checking prevents silent bugs — always print `.shape` when debugging broadcasting errors
- The typical Python loop vs. NumPy speedup is 50-200x for simple arithmetic operations on 100K+ elements
- NumPy arrays are homogeneous (all elements must be the same type) — this is what enables contiguous memory storage

---

## Common Mistakes to Avoid

- **Silent integer overflow**: `np.array([200], dtype=np.int8)` overflows to -56. NumPy does not raise an error. Always check value ranges before choosing dtypes
- **"Helping" NumPy with Python loops**: writing `for i in range(len(arr)): result[i] = np.sqrt(arr[i])` defeats the entire point — pass the full array
- **Not checking shapes before broadcasting**: `(4, 3) + (4,)` raises ValueError (3 vs 4 mismatch). Reshape to `(4, 1)` first
- **Using `np.vectorize` expecting speed**: `np.vectorize` is still a Python loop internally. It provides a cleaner API, not faster execution (covered in detail in Lesson 7)

---

## Next Lesson Preview

- Applying vectorization directly inside pandas DataFrames
- The `.str` accessor for vectorized string operations without `apply()`
- The `.dt` accessor for datetime operations
- `np.where` as a vectorized conditional — replacing `apply(lambda row: ...)`

---

[← Previous: Why Performance Matters](./lesson-01-why-performance-matters.md) | [Next: Pandas Vectorization Patterns →](./lesson-03-pandas-vectorization-patterns.md)
