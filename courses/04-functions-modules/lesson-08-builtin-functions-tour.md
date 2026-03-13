# Lesson 8: Built-in Functions Tour

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use Python's most important built-in functions fluently
- Apply `enumerate()`, `zip()`, `sorted()`, `reversed()`
- Use `any()`, `all()`, `sum()`, `min()`, `max()`
- Apply `isinstance()`, `type()`, `id()`

---

## Prerequisites

- Lessons 1-7 of this course

---

## Lesson Outline

### Part 1: Iteration Helpers (30 minutes)

#### Explanation

**`enumerate()`** - add index to iteration:
```python
fruits = ["apple", "banana", "cherry"]

# Without enumerate (clunky):
for i in range(len(fruits)):
    print(f"{i+1}. {fruits[i]}")

# With enumerate (clean):
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")
```

**`zip()`** - iterate multiple sequences together:
```python
names = ["Alice", "Bob", "Carol"]
scores = [92, 85, 78]
grades = ["A", "B", "C"]

# Zip combines them:
for name, score, grade in zip(names, scores, grades):
    print(f"{name}: {score} ({grade})")

# zip stops at shortest sequence
# zip_longest (from itertools) pads shorter ones

# Creating dicts from two lists:
student_dict = dict(zip(names, scores))
print(student_dict)  # {"Alice": 92, "Bob": 85, "Carol": 78}
```

**`reversed()`** and **`sorted()`**:
```python
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

print(sorted(numbers))              # [1, 1, 2, 3, 4, 5, 6, 9] - new list
print(sorted(numbers, reverse=True)) # [9, 6, 5, 4, 3, 2, 1, 1]
print(list(reversed(numbers)))      # [6, 2, 9, 5, 1, 4, 1, 3] - reversed order

words = ["banana", "apple", "cherry", "date"]
print(sorted(words))               # alphabetical
print(sorted(words, key=len))      # by length
print(sorted(words, key=lambda w: w[-1]))  # by last character
```

#### Examples

```python
# enumerate + zip in practice
headers = ["Name", "Score", "Grade"]
data = [("Alice", 92, "A"), ("Bob", 85, "B"), ("Carol", 78, "C")]

# Print table with row numbers:
print(f"\n{'#':<4} {headers[0]:<15} {headers[1]:>6} {headers[2]:>6}")
print("-" * 35)
for i, (name, score, grade) in enumerate(data, start=1):
    print(f"{i:<4} {name:<15} {score:>6} {grade:>6}")
```

#### Practice

Use enumerate and zip together to process two parallel lists (names and ages) and display them numbered.

---

### Part 2: Aggregation Functions (30 minutes)

#### Explanation

```python
numbers = [4, 8, 15, 16, 23, 42]

print(sum(numbers))          # 108
print(min(numbers))          # 4
print(max(numbers))          # 42
print(len(numbers))          # 6
print(sum(numbers) / len(numbers))  # 18.0 (average)

# with key functions:
students = [{"name": "Alice", "gpa": 3.9}, {"name": "Bob", "gpa": 3.5}]
top_student = max(students, key=lambda s: s["gpa"])
print(top_student["name"])   # Alice

# any() - True if ANY element is truthy
# all() - True if ALL elements are truthy
scores = [85, 92, 78, 95, 88]
print(any(s >= 90 for s in scores))   # True (at least one >= 90)
print(all(s >= 60 for s in scores))   # True (all passing)
print(all(s >= 90 for s in scores))   # False (not all A's)

# Practical any/all:
has_admin = any(user["role"] == "admin" for user in users)
all_active = all(user["active"] for user in users)
```

#### Examples

```python
# Financial analysis with aggregation functions
transactions = [100, -50, 200, -30, 150, -80, 300, -25]

income = [t for t in transactions if t > 0]
expenses = [t for t in transactions if t < 0]

print(f"Total income:  ${sum(income):,.2f}")
print(f"Total expenses: ${sum(expenses):,.2f}")
print(f"Net balance:   ${sum(transactions):,.2f}")
print(f"Largest income:  ${max(income):,.2f}")
print(f"Largest expense: ${min(expenses):,.2f}")
print(f"Has any refunds: {any(t > 0 for t in expenses)}")
```

#### Practice

Analyze a dataset of temperatures: find mean, min, max, days above 30°C, days below 0°C.

---

### Part 3: Type and Identity Functions (30 minutes)

#### Explanation

```python
# type() - get exact type
x = 42
print(type(x))          # <class 'int'>
print(type(x) == int)   # True

# isinstance() - check type (including inheritance)
print(isinstance(x, int))          # True
print(isinstance(x, (int, float))) # True - checks tuple of types
print(isinstance(True, int))       # True! (bool subtype of int)

# id() - memory address (mainly for debugging)
a = "hello"
b = "hello"
c = a
print(id(a))    # Some number, e.g., 140234567
print(id(b))    # Might be same (string interning)
print(id(c))    # Same as a (same object)

# Other useful builtins:
print(abs(-5))           # 5
print(round(3.7))        # 4
print(round(3.745, 2))   # 3.74 (banker's rounding)
print(pow(2, 10))        # 1024
print(divmod(17, 5))     # (3, 2) - quotient and remainder
```

**`vars()`, `dir()`, `help()`:**
```python
x = "hello"
print(dir(x))      # List all methods and attributes
help(str.upper)    # Documentation for upper() method
print(vars())      # All variables in current scope
```

#### Practice

Write a type checker that takes any value and returns a formatted string describing its type, value, and relevant properties.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Complete Data Analysis

Given a list of student records (dict with name, grades list, attendance), use built-in functions to generate:
- Sorted by GPA descending
- Top and bottom 3 students
- Any student with perfect attendance?
- All students passing (avg >= 60)?
- Summary stats using sum, min, max, len

#### Exercise 2: Text Analysis

Using built-in functions on a paragraph:
- Word frequency (using sorted + zip)
- Any words > 10 characters?
- All sentences end with punctuation?
- Enumerate sentences and words

#### Bonus Challenge

**Implementing builtins:** Write your own versions of `enumerate()`, `zip()`, and `all()` as regular Python functions. This deepens understanding of how they work.

---

## Key Takeaways

- `enumerate(items, start=0)` → (index, item) pairs
- `zip(a, b, c)` → iterate multiple sequences together
- `sorted(items, key=func, reverse=False)` → new sorted list
- `sum`, `min`, `max` work with `key` parameter
- `any(iterable)` → True if any element is truthy
- `all(iterable)` → True if all elements are truthy
- `isinstance(x, type_or_tuple)` → type checking (better than `type(x) ==`)

---

## Homework

1. Build a "data summary" function that uses 10+ built-in functions on any list
2. Research: What's the difference between `sorted()` and `.sort()`? When would you use each?

---

[← Previous](./lesson-07-lambda-functions.md) | [Back to Course](./README.md) | [Next →](./lesson-09-creating-importing-modules.md)
