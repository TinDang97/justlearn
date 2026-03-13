# Lesson 7: Lambda Functions

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Write lambda functions for simple single-expression operations
- Use lambdas with `sorted()`, `map()`, `filter()`
- Understand when to use lambda vs regular function
- Apply lambdas as key functions for sorting

---

## Prerequisites

- Lessons 1-6 of this course

---

## Lesson Outline

### Part 1: Lambda Syntax (30 minutes)

#### Explanation

A **lambda** is a small, anonymous function defined in a single expression:

```python
# Regular function:
def add(x, y):
    return x + y

# Equivalent lambda:
add = lambda x, y: x + y

# Syntax: lambda parameters: expression
# The expression IS the return value (no 'return' keyword)
```

**When to use lambda:**
- As a one-time argument to another function
- When the function is trivially simple (one expression)
- As a key function for sorting

**When NOT to use lambda:**
- When the function is complex (use `def` instead)
- When you need multiple statements
- When you need a docstring

> **Teacher's Note:** Lambdas are often overused by beginners trying to be clever. Emphasize: if it needs explanation, use a regular function. PEP 8 actually recommends against assigning lambdas to names (use def instead).

#### Examples

```python
# Lambda with sorted():
students = [
    {"name": "Alice", "grade": 92, "age": 20},
    {"name": "Bob", "grade": 88, "age": 22},
    {"name": "Carol", "grade": 95, "age": 19},
    {"name": "David", "grade": 88, "age": 21},
]

# Sort by grade (descending):
by_grade = sorted(students, key=lambda s: s["grade"], reverse=True)

# Sort by grade (descending), then name (ascending):
by_grade_name = sorted(students, key=lambda s: (-s["grade"], s["name"]))

for s in by_grade:
    print(f"{s['name']}: {s['grade']}")
```

#### Practice

Sort a list of strings by: length, last character, number of vowels (using lambda each time).

---

### Part 2: Lambda with map() and filter() (30 minutes)

#### Explanation

```python
# map(function, iterable): apply function to each element
numbers = [1, 2, 3, 4, 5]

squares = list(map(lambda x: x**2, numbers))
print(squares)   # [1, 4, 9, 16, 25]

# Equivalent with list comprehension (often preferred):
squares = [x**2 for x in numbers]

# filter(function, iterable): keep elements where function returns True
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)   # [2, 4]

# Equivalent with list comprehension:
evens = [x for x in numbers if x % 2 == 0]
```

**When map/filter vs list comprehension?**
- List comprehensions are usually more Pythonic and readable
- `map`/`filter` with lambdas is useful when passing to other functions

```python
# Pipeline with map and filter:
data = [" Alice ", "  ", "Bob", "", "  Carol  ", "dave"]

# Process: strip → filter empty → title case
cleaned = list(map(
    lambda s: s.title(),
    filter(
        lambda s: s.strip(),  # Only non-empty after strip
        map(lambda s: s.strip(), data)  # Strip all
    )
))
```

#### Examples

```python
# Practical: price list transformations
prices = [10.99, 25.00, 8.50, 45.99, 3.25]

# Apply discount to each:
discounted = list(map(lambda p: round(p * 0.9, 2), prices))

# Filter expensive items:
expensive = list(filter(lambda p: p > 20, prices))

# Sort by price:
sorted_prices = sorted(prices, key=lambda p: p)

# Using key functions in min/max:
products = [("Apple", 1.50), ("Banana", 0.75), ("Cherry", 3.00)]
cheapest = min(products, key=lambda p: p[1])
most_expensive = max(products, key=lambda p: p[1])
```

#### Practice

Process a student list using map/filter/sorted with lambdas: filter passing students, sort by grade descending, format names to uppercase.

---

### Part 3: Practical Lambda Patterns (30 minutes)

#### Explanation

```python
# Sorting by multiple criteria
employees = [
    {"name": "Alice", "dept": "Engineering", "salary": 95000},
    {"name": "Bob", "dept": "Marketing", "salary": 72000},
    {"name": "Carol", "dept": "Engineering", "salary": 88000},
]

# Sort by department, then salary descending:
sorted_employees = sorted(employees,
                          key=lambda e: (e["dept"], -e["salary"]))

# Using lambdas in data structures:
OPERATIONS = {
    "+": lambda a, b: a + b,
    "-": lambda a, b: a - b,
    "*": lambda a, b: a * b,
    "/": lambda a, b: a / b if b != 0 else None,
}

def calculate(a, op, b):
    operation = OPERATIONS.get(op)
    if operation is None:
        return None, f"Unknown operator: {op}"
    result = operation(a, b)
    return result, "OK"

print(calculate(10, "+", 5))   # (15, "OK")
print(calculate(10, "/", 0))   # (None, "OK") - hmm, still need to check
```

#### Practice

Build a "sort factory" that returns different sort functions for different fields using closures + lambdas.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Pipeline

Transform a list of raw product data:
```python
raw = ["  laptop  :999.99:electronics", "PHONE:599.99:electronics",
       "book:29.99:education", "  headphones  :149.99:electronics"]
# Parse, clean, filter, sort into structured dicts
```

Use map, filter, sorted with lambdas.

#### Exercise 2: Calculator with Lambda Dict

Build a calculator where operations are stored as lambdas in a dict. Support: basic ops, power, log, sqrt, percent, and a "chain" operation.

#### Bonus Challenge

**Lambda composition:** Write `compose(*functions)` that creates a new function that applies functions right-to-left: `compose(f, g, h)(x)` = `f(g(h(x)))`.

---

## Key Takeaways

- `lambda params: expression` - anonymous function, expression is the return value
- No multi-line statements, no docstrings in lambda
- Best use: `sorted(items, key=lambda x: x.attr)` and `map`/`filter`
- List comprehensions often more readable than `map`/`filter` with lambda
- Store lambdas in dicts for dispatch tables (operation lookup)

---

## Homework

1. Rewrite all your map/filter calls using list comprehensions - which is clearer?
2. Research: What is `functools.reduce()`? How does it work with lambda?

---

[← Previous](./lesson-06-variable-scope-legb.md) | [Back to Course](./README.md) | [Next →](./lesson-08-builtin-functions-tour.md)
