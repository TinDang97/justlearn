# Lesson 7: Sets

**Course:** Data Structures | **Duration:** 2 hours | **Level:** Beginner-Intermediate

---

## Learning Objectives

- Create and modify sets
- Use set operations: union, intersection, difference, symmetric difference
- Apply sets for deduplication and membership testing
- Understand frozensets

---

## Prerequisites

- Lessons 1-6: Lists and Dicts

---

## Lesson Outline

### Part 1: Set Basics (30 minutes)

#### Explanation

A **set** is an unordered collection of **unique** elements. No duplicates allowed. Not indexed.

**Analogy:** A bag of marbles where every marble is a different color. Order doesn't matter - you can't say "give me the 3rd marble" - but you can quickly check "do you have a blue marble?"

```python
# Creating sets
empty = set()           # Note: {} creates empty dict, not set!
numbers = {1, 2, 3, 4, 5}
fruits = {"apple", "banana", "cherry"}
mixed = {1, "hello", 3.14, (1, 2)}  # Must be hashable

# Duplicates are automatically removed:
no_dups = {1, 2, 2, 3, 3, 3, 4}
print(no_dups)  # {1, 2, 3, 4}

# From other iterables:
from_list = set([1, 2, 2, 3, 3, 4])
from_string = set("hello")   # {'h', 'e', 'l', 'o'} - unique chars

# Modifying:
fruits.add("date")          # Add single element
fruits.update(["elderberry", "fig"])  # Add multiple
fruits.remove("banana")     # Remove (KeyError if not found)
fruits.discard("mango")     # Remove (no error if not found)
popped = fruits.pop()       # Remove and return arbitrary element
```

#### Examples

```python
# Deduplication (most common use case):
names_with_dups = ["Alice", "Bob", "Alice", "Carol", "Bob", "David"]
unique_names = list(set(names_with_dups))
print(unique_names)   # ['Alice', 'Bob', 'Carol', 'David'] (order may vary)

# Fast membership testing - O(1)!
valid_users = {"alice", "bob", "carol", "david"}   # Set
user = "alice"
if user in valid_users:   # Instant check regardless of set size!
    print("Access granted")
```

#### Practice

Remove duplicates from a list of email addresses. Preserve order (hint: use dict.fromkeys or sorted set conversion).

---

### Part 2: Set Operations (30 minutes)

#### Explanation

Sets support mathematical set operations:

```python
a = {1, 2, 3, 4, 5}
b = {3, 4, 5, 6, 7}

# Union - all elements from both:
print(a | b)              # {1, 2, 3, 4, 5, 6, 7}
print(a.union(b))         # same

# Intersection - only elements in both:
print(a & b)              # {3, 4, 5}
print(a.intersection(b))  # same

# Difference - elements in a but not b:
print(a - b)              # {1, 2}
print(a.difference(b))    # same

# Symmetric difference - elements in either but not both:
print(a ^ b)                       # {1, 2, 6, 7}
print(a.symmetric_difference(b))   # same

# Subset and superset:
print({3, 4} <= a)          # True - is subset
print(a >= {3, 4})          # True - is superset
print({3, 4}.issubset(a))   # True
print(a.issuperset({3, 4})) # True
print(a.isdisjoint({8, 9})) # True - no common elements
```

#### Examples

```python
# Finding common and unique students between two classes:
class_a = {"Alice", "Bob", "Carol", "David", "Eve"}
class_b = {"Carol", "David", "Frank", "Grace", "Henry"}

both_classes = class_a & class_b    # Taking both courses
only_a = class_a - class_b          # Only in class A
only_b = class_b - class_a          # Only in class B
all_students = class_a | class_b    # In any class

print(f"Total unique students: {len(all_students)}")
print(f"Taking both courses: {both_classes}")
```

#### Practice

Analyze permission sets: given admin, editor, viewer permissions, find who can do everything, who has unique permissions.

---

### Part 3: Set Comprehensions and Frozensets (30 minutes)

#### Explanation

```python
# Set comprehension:
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique_squares = {n**2 for n in numbers}  # {1, 4, 9, 16}

# Find unique first letters:
names = ["Alice", "Bob", "Carol", "Alan", "Betty"]
first_letters = {name[0] for name in names}  # {'A', 'B', 'C'}

# Frozenset - immutable set (can be used as dict key):
frozen = frozenset([1, 2, 3])
# frozen.add(4)  → AttributeError - immutable!

# Use frozenset as dict key:
permissions = {
    frozenset(["read"]): "Viewer",
    frozenset(["read", "write"]): "Editor",
    frozenset(["read", "write", "admin"]): "Admin",
}
user_perms = frozenset(["read", "write"])
role = permissions.get(user_perms, "Unknown")
print(role)  # Editor
```

#### Practice

Find all unique words in a paragraph (case-insensitive, no punctuation) using a set comprehension.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Tag System

Build a blog tag system:
- Posts have tags (each as a set)
- Find posts with a specific tag
- Find posts matching ALL given tags
- Find posts matching ANY given tags
- Find the most common tags (combine all tag sets)

#### Exercise 2: Duplicate Detector

Build a system to find duplicates in data:
- Find duplicate emails in a user list
- Find common elements between multiple lists
- Find elements that appear in exactly 2 out of 3 lists

#### Bonus Challenge

**Graph connectivity:** Model a simple friendship network using sets (each person's set of friends). Find: mutual friends between two people, friends-of-friends, chain of connection between two people.

---

## Key Takeaways

- Sets: unordered, no duplicates, **O(1) membership testing**
- Create: `{1, 2, 3}` or `set(iterable)` (not `{}` - that's empty dict!)
- Set operations: `|` union, `&` intersection, `-` difference, `^` symmetric difference
- `add(x)`, `remove(x)` (raises error), `discard(x)` (no error)
- **Frozenset**: immutable set, usable as dict key
- Great for: deduplication, fast lookups, set math

---

## Common Mistakes to Avoid

- **`{}` is an empty dict, not set**: use `set()` for empty set
- **Sets are unordered**: can't index or slice them
- **Only hashable values**: can't put lists in sets (use tuples instead)

---

## Homework

1. Build a "spell checker" using a set of valid words
2. Research: What is the time complexity of `x in list` vs `x in set`? Why?

---

[← Previous](./lesson-06-dictionary-methods-iteration.md) | [Back to Course](./README.md) | [Next →](./lesson-08-nested-data-structures.md)
