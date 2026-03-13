# Lesson 10: Iterators & Generators Introduction

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Understand the iterator protocol (iter/next)
- Write generator functions using `yield`
- Use generator expressions for memory-efficient processing
- Recognize when generators are preferable to lists

---

## Prerequisites

- Lessons 1-9: All data structures

---

## Lesson Outline

### Part 1: The Iterator Protocol (30 minutes)

#### Explanation

An **iterator** is any object that can be iterated (looped over). Python's `for` loop uses the iterator protocol behind the scenes.

```python
# When you write:
for item in [1, 2, 3]:
    print(item)

# Python actually does:
iterator = iter([1, 2, 3])   # Get iterator
while True:
    try:
        item = next(iterator)   # Get next item
        print(item)
    except StopIteration:
        break   # Loop ends when iterator is exhausted
```

**Making your own iterator (class-based):**
```python
class CountUp:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current > self.end:
            raise StopIteration
        value = self.current
        self.current += 1
        return value

for num in CountUp(1, 5):
    print(num)  # 1, 2, 3, 4, 5
```

#### Examples

```python
# Iterating manually:
my_list = [10, 20, 30]
it = iter(my_list)

print(next(it))  # 10
print(next(it))  # 20
print(next(it))  # 30
# next(it)       # StopIteration!

# Iterables vs iterators:
my_list = [1, 2, 3]   # Iterable (can create iterator from it)
my_iter = iter(my_list)  # Iterator (tracks position)

# A list can create many iterators:
iter1 = iter(my_list)
iter2 = iter(my_list)   # Independent iterator
```

#### Practice

Use `iter()` and `next()` manually to process a list, handling StopIteration.

---

### Part 2: Generator Functions (30 minutes)

#### Explanation

A **generator** is a function that uses `yield` instead of `return`. It produces values one at a time, lazily - not all at once. This is memory-efficient for large datasets.

```python
# Regular function - creates entire list in memory:
def get_squares(n):
    squares = []
    for i in range(1, n + 1):
        squares.append(i ** 2)
    return squares   # Returns all at once

# Generator function - produces one at a time:
def generate_squares(n):
    for i in range(1, n + 1):
        yield i ** 2   # Produces one value and PAUSES

# Using the generator:
for square in generate_squares(5):
    print(square)   # 1, 4, 9, 16, 25

# Memory difference:
squares_list = get_squares(10000000)  # ~80MB of memory!
squares_gen = generate_squares(10000000)  # ~200 bytes!
```

**How yield works:**
- When Python reaches `yield`, it pauses the function
- The value is returned to the caller
- Next call to `next()` resumes where it paused
- When function ends (or `return`), StopIteration is raised

#### Examples

```python
# Infinite generator (no list could be infinite!):
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")  # 0 1 1 2 3 5 8 13 21 34

# File reader generator (memory-efficient):
def read_in_chunks(filepath, chunk_size=1024):
    with open(filepath, 'r') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk
```

#### Practice

Write a generator `prime_gen(limit)` that yields prime numbers up to limit.

---

### Part 3: Generator Expressions (30 minutes)

#### Explanation

Like list comprehensions but lazy - compute values on demand:

```python
# List comprehension: creates entire list in memory
squares_list = [x**2 for x in range(10)]  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Generator expression: lazy, one value at a time
squares_gen = (x**2 for x in range(10))   # Generator object

# Same syntax but () instead of []
total = sum(x**2 for x in range(10))       # No extra parens needed in function call

# Memory comparison:
import sys
big_list = [x for x in range(1000000)]        # ~8MB
big_gen = (x for x in range(1000000))         # ~200 bytes

print(sys.getsizeof(big_list))  # ~8M
print(sys.getsizeof(big_gen))   # ~120
```

**When to use generators:**
- Large or infinite sequences
- Processing data you only need once
- Pipeline transformations
- Reading large files

**When to use lists:**
- Need to access data multiple times
- Need len(), indexing, slicing
- Need to sort, reverse, or modify

#### Practice

Write a data pipeline using generator expressions: read numbers, filter positive, square them, calculate sum - all in one expression.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Lazy File Processor

Build a generator-based file processor:
- `lines_from_file(filepath)` - yield lines from a file
- `filter_comments(lines)` - skip lines starting with #
- `parse_records(lines)` - yield parsed dicts from CSV lines
- Chain them: `records = parse_records(filter_comments(lines_from_file("data.csv")))`

#### Exercise 2: Infinite Sequences

Write generators for:
- Natural numbers (1, 2, 3, ...)
- Powers of 2 (1, 2, 4, 8, 16, ...)
- Random temperature readings (simulate sensor)
- Countdown with time delays

Take first N values from each using `itertools.islice`.

#### Bonus Challenge

**Pipeline builder:** Create a `pipeline(*generators)` function that chains generators. Each generator takes the previous one as input.

---

## Key Takeaways

- **Iterator**: object with `__iter__` and `__next__` methods; `for` uses these
- **Generator function**: uses `yield` to produce values lazily
- `yield` pauses the function and returns a value; resumes on next `next()`
- **Generator expression**: `(expr for x in iterable)` - like list comp but lazy
- Generators use **constant memory** regardless of sequence size
- Use generators for: large datasets, infinite sequences, data pipelines

---

## Homework

1. Rewrite 3 list-building functions as generators
2. Research: `itertools` module - what is `chain`, `islice`, `cycle`, `count`?

---

[← Previous](./lesson-09-choosing-right-structure.md) | [Back to Course](./README.md) | [Next →](./lesson-11-collections-module.md)
