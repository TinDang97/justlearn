# Lesson 3: List Comprehensions

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Write basic list comprehensions as alternatives to for loops
- Add conditions to filter elements in comprehensions
- Write nested comprehensions for 2D data
- Know when to use comprehensions vs explicit loops

---

## Prerequisites

- Lessons 1-2: Lists

---

## Lesson Outline

### Part 1: Basic List Comprehensions (30 minutes)

#### Explanation

A list comprehension is a concise, one-line way to create a list. The syntax:

```python
[expression for item in iterable]
```

is equivalent to:
```python
result = []
for item in iterable:
    result.append(expression)
```

```python
# Create list of squares 1-10:

# For loop way:
squares = []
for n in range(1, 11):
    squares.append(n ** 2)

# Comprehension way:
squares = [n ** 2 for n in range(1, 11)]

# Both produce: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

**Read it naturally:** "Give me `n squared` for each `n` in `range(1, 11)`"

#### Examples

```python
# Practical comprehensions:
names = ["alice", "BOB", "Carol", "  dave  "]

# Normalize: strip and title case
clean_names = [name.strip().title() for name in names]
print(clean_names)  # ['Alice', 'Bob', 'Carol', 'Dave']

# Extract first letters
initials = [name[0].upper() for name in names]

# Convert temperatures
celsius = [0, 10, 20, 30, 40, 100]
fahrenheit = [(c * 9/5) + 32 for c in celsius]

# Double all numbers in a list
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]

# Get lengths of strings
words = ["python", "is", "amazing", "and", "powerful"]
lengths = [len(word) for word in words]
```

#### Practice

Write comprehensions to:
1. Square numbers 1-20
2. Convert a list of strings to uppercase
3. Get the first character of each word in a sentence

---

### Part 2: Conditional Comprehensions (30 minutes)

#### Explanation

Add a filter condition to include only certain elements:

```python
# Syntax: [expression for item in iterable if condition]

# Only even numbers:
evens = [n for n in range(20) if n % 2 == 0]

# Only passing grades:
grades = [85, 52, 92, 43, 78, 95, 61]
passing = [g for g in grades if g >= 60]

# Filtering and transforming:
words = ["python", "java", "go", "rust", "javascript", "c"]
long_words = [w.upper() for w in words if len(w) > 4]
# ['PYTHON', 'JAVASCRIPT']
```

**Conditional expression (ternary) in comprehension:**
```python
# [value_if_true if condition else value_if_false for item in iterable]

grades = [85, 55, 92, 43, 78]
results = ["pass" if g >= 60 else "fail" for g in grades]
# ['pass', 'fail', 'pass', 'fail', 'pass']

# Clamp values to range 0-100:
scores = [-5, 85, 110, 42, 97]
clamped = [max(0, min(100, s)) for s in scores]
# [0, 85, 100, 42, 97]
```

#### Examples

```python
# Data cleaning pipeline
raw_data = ["  Alice", "BOB ", None, "  ", "carol", "", "DAVID"]

cleaned = [
    name.strip().title()
    for name in raw_data
    if name is not None and name.strip()  # Filter None and empty
]
print(cleaned)  # ['Alice', 'Bob', 'Carol', 'David']

# Fizzbuzz as comprehension:
fizzbuzz = [
    "FizzBuzz" if n % 15 == 0
    else "Fizz" if n % 3 == 0
    else "Buzz" if n % 5 == 0
    else str(n)
    for n in range(1, 21)
]
```

#### Practice

Build a "data filter" function that takes a list of records (dicts) and a filter criteria dict, returns matching records using comprehension.

---

### Part 3: Nested Comprehensions (30 minutes)

#### Explanation

```python
# Flattening a nested list:
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Creating a matrix:
matrix = [[row * col for col in range(1, 4)] for row in range(1, 4)]
# [[1, 2, 3], [2, 4, 6], [3, 6, 9]]

# Cartesian product:
colors = ["red", "green", "blue"]
sizes = ["S", "M", "L"]
products = [(color, size) for color in colors for size in sizes]
# [('red','S'), ('red','M'), ('red','L'), ('green','S'), ...]
```

**When NOT to use comprehensions:**
```python
# TOO COMPLEX - use regular loops:
result = [
    transform(x)
    for x in [preprocess(item) for item in data if filter(item)]
    if validate(x) and x not in seen
]

# Better as:
result = []
for item in data:
    if filter(item):
        processed = preprocess(item)
        transformed = transform(processed)
        if validate(transformed) and transformed not in seen:
            result.append(transformed)
```

Rule: if comprehension is longer than 2 logical conditions or requires explanation, use a loop.

#### Practice

Use nested comprehension to generate a multiplication table as a list of lists.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Analysis with Comprehensions

Process a list of student records:
```python
students = [
    {"name": "Alice", "grades": [85, 90, 78, 92]},
    {"name": "Bob", "grades": [72, 68, 75, 80]},
    # ...
]

# Using comprehensions:
# 1. All names
# 2. All average grades
# 3. Students with avg >= 80
# 4. All grades (flat list)
# 5. Student + avg pairs, sorted by avg
```

#### Exercise 2: Text Processing Pipeline

Process a text file content using comprehensions:
- Split into words, filter out punctuation
- Keep words longer than 4 characters
- Convert to lowercase and deduplicate
- Sort alphabetically

#### Bonus Challenge

**Spiral matrix:** Generate coordinates for traversing an n×n matrix in spiral order using comprehensions (or loops if needed).

---

## Key Takeaways

- `[expr for x in iterable]` - transform all items
- `[expr for x in iterable if condition]` - filter and transform
- `[a if cond else b for x in iterable]` - ternary in comprehension
- `[expr for x in outer for y in inner]` - nested (read left to right)
- Use for **simplicity** - if it's hard to read, use a regular loop
- Comprehensions create a new list; they don't modify the original

---

## Homework

1. Rewrite 5 for-loop data transformations from previous courses as comprehensions
2. Research: dict comprehensions `{k: v for k, v in pairs}` and set comprehensions `{x for x in data}`

---

[← Previous](./lesson-02-list-methods-operations.md) | [Back to Course](./README.md) | [Next →](./lesson-04-tuples.md)
