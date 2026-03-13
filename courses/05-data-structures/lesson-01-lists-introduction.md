# Lesson 1: Lists Introduction

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Create lists using literals and `list()`
- Access elements by index (positive and negative)
- Slice lists to get sub-lists
- Understand list mutability
- Use `len()`, `in`, and basic iteration on lists

---

## Prerequisites

- Courses 1-4: all Python fundamentals

---

## Lesson Outline

### Part 1: Creating and Accessing Lists (30 minutes)

#### Explanation

A **list** is an ordered, mutable sequence of items. Unlike variables (which hold one value), a list holds many values.

**Analogy:** A shopping list. It has a specific order (you put milk first, eggs second), you can add and remove items, and you can look up any item by position.

```python
# Creating lists
empty_list = []
numbers = [1, 2, 3, 4, 5]
names = ["Alice", "Bob", "Carol"]
mixed = [42, "hello", 3.14, True, None]  # Can hold any types

# List from other iterables
chars = list("Python")     # ['P', 'y', 't', 'h', 'o', 'n']
zeros = [0] * 5            # [0, 0, 0, 0, 0]
seq = list(range(1, 6))    # [1, 2, 3, 4, 5]
```

**Accessing elements (same as strings):**
```python
fruits = ["apple", "banana", "cherry", "date", "elderberry"]
#          0         1          2         3         4
#         -5        -4         -3        -2        -1

print(fruits[0])    # apple (first)
print(fruits[-1])   # elderberry (last)
print(fruits[2])    # cherry

# Slicing:
print(fruits[1:3])  # ['banana', 'cherry']
print(fruits[:2])   # ['apple', 'banana']
print(fruits[2:])   # ['cherry', 'date', 'elderberry']
print(fruits[::2])  # ['apple', 'cherry', 'elderberry'] (every 2nd)
print(fruits[::-1]) # reversed list
```

#### Examples

```python
# Gradebook example
grades = [85, 92, 78, 95, 88, 73, 90]

print(f"First grade: {grades[0]}")
print(f"Last grade: {grades[-1]}")
print(f"Number of grades: {len(grades)}")
print(f"All grades: {grades}")
print(f"First 3: {grades[:3]}")
print(f"Highest (sorted): {sorted(grades)[-1]}")
```

#### Practice

Create a list of 5 cities. Access the first, last, second, and second-to-last city. Create a slice of the middle 3 cities.

---

### Part 2: List Mutability (30 minutes)

#### Explanation

Lists are **mutable** - you can change their contents after creation. This is different from strings (which are immutable).

```python
# Modifying elements:
fruits = ["apple", "banana", "cherry"]

fruits[1] = "mango"      # Replace banana with mango
print(fruits)  # ['apple', 'mango', 'cherry']

fruits[0:2] = ["kiwi", "grape"]   # Replace slice
print(fruits)  # ['kiwi', 'grape', 'cherry']

# Unlike strings:
text = "hello"
text[0] = "H"  # TypeError - strings are immutable!

# Lists create REFERENCES (not copies):
original = [1, 2, 3]
reference = original   # Both point to same list!
reference[0] = 99
print(original)  # [99, 2, 3] - CHANGED!

# To copy a list:
copy = original.copy()     # or original[:]  or list(original)
copy[0] = 0
print(original)  # [99, 2, 3] - unchanged
print(copy)      # [0, 2, 3]
```

#### Examples

```python
# Shopping cart
cart = ["milk", "eggs", "bread"]

# Add item
cart.append("butter")
print(cart)  # ['milk', 'eggs', 'bread', 'butter']

# Change item
cart[1] = "free-range eggs"
print(cart)

# Remove item
cart.remove("bread")
print(cart)

# Check if item is in cart
print("milk" in cart)    # True
print("cheese" in cart)  # False
```

#### Practice

Create a "playlist" list with 5 songs. Modify it: change the 3rd song, add a song at the end, remove the first song.

---

### Part 3: Iterating Over Lists (30 minutes)

#### Explanation

```python
numbers = [10, 20, 30, 40, 50]

# Basic for loop:
for num in numbers:
    print(num)

# With index (enumerate):
for i, num in enumerate(numbers, start=1):
    print(f"{i}. {num}")

# While loop (less common):
i = 0
while i < len(numbers):
    print(numbers[i])
    i += 1

# List comprehension (preview - full lesson coming):
doubled = [n * 2 for n in numbers]
print(doubled)  # [20, 40, 60, 80, 100]
```

**Common list operations:**
```python
numbers = [4, 2, 7, 1, 9, 3, 6, 8, 5]

print(sum(numbers))        # 45
print(min(numbers))        # 1
print(max(numbers))        # 9
print(sorted(numbers))     # [1, 2, 3, 4, 5, 6, 7, 8, 9] - new list!
print(numbers)             # [4, 2, 7, 1, 9, 3, 6, 8, 5] - unchanged!

# In-place vs new list:
numbers.sort()             # Modifies numbers in place
print(numbers)             # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

#### Practice

Process a list of temperatures: calculate average, find days above 30°C, find the hottest and coldest day using enumerate.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Grade Tracker

```python
grades = [72, 85, 91, 68, 88, 95, 74, 82, 89, 77]

# Calculate:
# 1. Average grade
# 2. Passing grades (>= 60) vs failing
# 3. Letter grade distribution
# 4. Top 3 grades
# 5. Grades in descending order
```

#### Exercise 2: Shopping Cart

Build a shopping cart system using a list:
- Display cart contents
- Add items (avoid duplicates with 'in' check)
- Remove items
- Calculate total (store as list of tuples: [(name, price), ...])
- Apply discount if total > $50

#### Bonus Challenge

**List rotation:** Write a function that "rotates" a list by n positions (elements that fall off the right appear on the left). Don't use any list methods - just slicing.

---

## Key Takeaways

- Lists are **ordered**, **mutable**, **heterogeneous** sequences
- Index from 0 (or -1 from end); slicing with `[start:end:step]`
- Lists are **mutable**: elements can be changed, unlike strings
- `a = b` makes two references to the SAME list - use `.copy()` to duplicate
- `for item in list` - direct iteration; `enumerate(list)` adds index

---

## Common Mistakes to Avoid

- **Modifying list while iterating**: causes bugs - iterate over copy or use list comprehension
- **Forgetting 0-indexing**: first element is `[0]`, not `[1]`
- **Confusing `sorted(lst)` vs `lst.sort()`**: sorted = new list, sort = in-place

---

## Homework

1. Build a "top scores" tracker that always maintains the 5 highest scores
2. Write a function that takes two lists and returns only elements in both (intersection)

---

[Back to Course](./README.md) | [Next →](./lesson-02-list-methods-operations.md)
