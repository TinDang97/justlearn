# Lesson 4: Tuples

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Create and access tuples
- Understand immutability and when it's valuable
- Use tuple unpacking effectively
- Apply named tuples for readable data records
- Know when to use tuples vs lists

---

## Prerequisites

- Lessons 1-3: Lists

---

## Lesson Outline

### Part 1: Tuple Basics (30 minutes)

#### Explanation

A **tuple** is an ordered, **immutable** sequence. Like a list but frozen - you can't change it after creation.

```python
# Creating tuples
empty = ()
single = (42,)           # Note the trailing comma! (42) is just an int
point = (3, 4)
person = ("Alice", 28, "Engineer")
mixed = (1, "hello", 3.14, True)

# Can omit parentheses (but be explicit for clarity):
coords = 10, 20         # Same as (10, 20)
```

**Why immutable?**
- Tuples represent "records" that shouldn't change (a coordinate, a date, a color)
- Can be used as dictionary keys (lists cannot!)
- Slightly faster and more memory-efficient than lists
- Signals to reader: "these values go together and shouldn't change"

```python
# Tuples are hashable (can be dict keys and set elements)
locations = {}
locations[(40.7128, -74.0060)] = "New York"
locations[(51.5074, -0.1278)] = "London"

# Lists are NOT hashable:
# {[1, 2]: "something"}  → TypeError: unhashable type: 'list'
```

#### Examples

```python
# Common tuple uses:
rgb_red = (255, 0, 0)
rgb_green = (0, 255, 0)

latitude = 40.7128
longitude = -74.0060
nyc_coords = (latitude, longitude)

# Function returning multiple values is really a tuple:
def divmod_example(a, b):
    return a // b, a % b   # Returns a tuple!

quotient, remainder = divmod_example(17, 5)
```

#### Practice

Create tuples for: a date (year, month, day), RGB color, 2D point. Practice accessing individual elements.

---

### Part 2: Tuple Unpacking (30 minutes)

#### Explanation

**Tuple unpacking** (also called destructuring) assigns tuple elements to variables:

```python
# Basic unpacking:
point = (3, 4)
x, y = point
print(x)  # 3
print(y)  # 4

# In function returns:
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, avg = get_stats([85, 90, 78, 95])

# Swap variables (remember this from Course 2?):
a, b = b, a   # Python uses tuple packing/unpacking

# Extended unpacking with *:
first, *middle, last = [1, 2, 3, 4, 5]
print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5

# In for loops:
students = [("Alice", 92), ("Bob", 85), ("Carol", 95)]
for name, grade in students:
    print(f"{name}: {grade}")

# Ignore values with _:
_, month, _ = (2024, 3, 15)  # Only care about month
```

#### Examples

```python
# CSV-like processing with tuple unpacking:
records = [
    ("Alice", "alice@email.com", 28, "Engineering"),
    ("Bob", "bob@email.com", 32, "Marketing"),
]

for name, email, age, department in records:
    print(f"  {name:<12} {email:<25} {age:>3}  {department}")

# Coordinate transformations:
points = [(1, 2), (3, 4), (5, 6)]
translated = [(x + 10, y + 10) for x, y in points]
distances = [((x**2 + y**2)**0.5) for x, y in points]
```

#### Practice

Process a list of date strings "YYYY-MM-DD", unpack to year/month/day, filter only 2024 dates.

---

### Part 3: Named Tuples (30 minutes)

#### Explanation

**Named tuples** let you access tuple fields by name, not just index:

```python
from collections import namedtuple

# Define a named tuple type:
Point = namedtuple("Point", ["x", "y"])
Student = namedtuple("Student", ["name", "age", "gpa"])

# Create instances:
p = Point(3, 4)
s = Student("Alice", 20, 3.9)

# Access by name (more readable) or index:
print(p.x)      # 3 (by name)
print(p[0])     # 3 (by index)
print(s.name)   # Alice
print(s.gpa)    # 3.9

# Named tuples are immutable:
# s.name = "Bob"  → AttributeError

# But you can create a new one with _replace:
updated = s._replace(gpa=4.0)

# Convert to dict:
print(s._asdict())   # {'name': 'Alice', 'age': 20, 'gpa': 3.9}
```

> **Teacher's Note:** Named tuples are a bridge between tuples and classes. They're great when you have a fixed record structure but don't need methods. Python 3.7+ dataclasses are even better for this (preview in Course 6).

#### Practice

Create a `Product` named tuple with fields: name, price, category, in_stock. Create 5 products, filter by category, sort by price.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Coordinate System

Build a 2D geometry library using tuples:
- Distance between two points
- Midpoint of two points
- Triangle area from 3 points
- Is point inside rectangle? (rect = (top_left, bottom_right))

#### Exercise 2: Data Records

Use named tuples to build a "song library":
- `Song(title, artist, year, duration_seconds, genre)`
- Create 10 songs
- Filter by genre
- Sort by year
- Calculate total playlist duration
- Format duration as MM:SS

#### Bonus Challenge

**Tuple vs list performance benchmark:** Time how long it takes to create 1,000,000 tuples vs 1,000,000 lists of the same data. Time iteration over both. Document your findings.

---

## Key Takeaways

- Tuples are **immutable lists** - created once, cannot change
- Use tuples for: function return values, coordinate pairs, records, dict keys
- `a, b = tuple` - **unpacking** assigns to variables
- `first, *rest = [1, 2, 3, 4]` - extended unpacking with *
- Named tuples: `namedtuple("Name", ["field1", "field2"])` - fields accessible by name
- Tuples are **hashable** (usable as dict keys); lists are not

---

## Homework

1. Build a student record system using named tuples with 10+ operations
2. Research: Python 3.7+ `dataclasses` - how are they better than named tuples?

---

[← Previous](./lesson-03-list-comprehensions.md) | [Back to Course](./README.md) | [Next →](./lesson-05-dictionaries-introduction.md)
