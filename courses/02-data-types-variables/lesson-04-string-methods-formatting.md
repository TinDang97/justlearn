# Lesson 4: String Methods & Formatting

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use 20+ string methods for text processing
- Apply f-string advanced features (formatting, alignment, precision)
- Use `.format()` and `%` formatting (legacy code awareness)
- Process user input professionally (clean, validate, transform)
- Build text manipulation utilities

---

## Prerequisites

- Lessons 1-3 of this course

---

## Lesson Outline

### Part 1: Essential String Methods (30 minutes)

#### Explanation

Python strings have dozens of built-in methods. These are functions that belong to the string type and are called with dot notation: `string.method()`.

**Key insight:** All string methods return NEW strings. They never modify the original.

```python
text = "  Hello, Python World!  "

# Case methods
print(text.upper())       # "  HELLO, PYTHON WORLD!  "
print(text.lower())       # "  hello, python world!  "
print(text.title())       # "  Hello, Python World!  "
print(text.capitalize())  # "  hello, python world!  " (only first char)
print(text.swapcase())    # "  hELLO, pYTHON wORLD!  "

# Whitespace methods
print(text.strip())       # "Hello, Python World!"
print(text.lstrip())      # "Hello, Python World!  "
print(text.rstrip())      # "  Hello, Python World!"

# Search methods
print(text.find("Python"))      # 9  (index of first match, -1 if not found)
print(text.index("Python"))     # 9  (like find but raises ValueError if not found)
print(text.count("l"))          # 3  (how many times "l" appears)
print(text.startswith("  H"))   # True
print(text.endswith("!  "))     # True
print("Python" in text)         # True (check if substring exists)

# Modify methods
print(text.replace("Python", "Programming"))  # replace all occurrences
print(text.replace("l", "L", 1))             # replace only first occurrence

# Split and join
sentence = "one two three four five"
words = sentence.split()          # ["one", "two", "three", "four", "five"]
words_by_comma = "a,b,c,d".split(",")  # ["a", "b", "c", "d"]
joined = " | ".join(words)        # "one | two | three | four | five"

# Check methods (return True/False)
print("hello".isalpha())      # True  (only letters)
print("hello123".isalpha())   # False
print("123".isdigit())        # True  (only digits)
print("hello".isalower())     # True  (all lowercase)
print("   ".isspace())        # True  (only whitespace)
```

#### Examples

```python
# Real-world: clean and validate username input
raw_input = "  Alice_Johnson_2024  "
username = raw_input.strip().lower()
print(username)  # "alice_johnson_2024"

# Check username is valid (letters, numbers, underscores only)
# (We'll do the if/else check in Course 3)
is_valid = username.replace("_", "").isalnum()
print(f"Username '{username}' is valid: {is_valid}")
```

#### Practice

Write a text normalizer: take any string input, apply strip, title case, and replace multiple spaces with single space. Display the "cleaned" result.

---

### Part 2: String Formatting - F-strings Advanced (30 minutes)

#### Explanation

F-strings (formatted string literals) are Python's modern string formatting system. They're fast, readable, and powerful.

```python
name = "Alice"
age = 28
salary = 85432.50
pi = 3.14159265

# Basic substitution
print(f"Hello, {name}!")                     # Hello, Alice!

# Expressions inside f-strings
print(f"In 10 years: {age + 10}")            # In 10 years: 38
print(f"Name length: {len(name)}")            # Name length: 5
print(f"Upper: {name.upper()}")              # Upper: ALICE

# Number formatting
print(f"Salary: ${salary:,.2f}")             # Salary: $85,432.50
print(f"Pi: {pi:.4f}")                       # Pi: 3.1416
print(f"Scientific: {salary:.2e}")           # Scientific: 8.54e+04
print(f"Percent: {0.756:.1%}")               # Percent: 75.6%

# Width and alignment
print(f"{'Name':<15}{'Age':>5}")             # Name              Age
print(f"{'Alice':<15}{28:>5}")               # Alice              28
print(f"{'Bob':<15}{32:>5}")                 # Bob                32

# Padding with specific character
print(f"{'Hello':*^30}")                     # ********Hello*********
print(f"{'Hello':->30}")                     # -------------------------Hello
print(f"{'Hello':-<30}")                     # Hello-------------------------

# Debug mode (Python 3.8+)
x = 42
print(f"{x=}")   # x=42  (shows variable name and value)
```

#### Examples

```python
# Building a formatted table
students = [
    ("Alice Johnson", 22, 3.9),
    ("Bob Smith", 20, 3.5),
    ("Carol Williams", 25, 3.8),
    ("David Brown", 21, 3.2),
]

print(f"\n{'Name':<20} {'Age':>5} {'GPA':>6}")
print("-" * 33)
for name, age, gpa in students:   # We'll learn loops properly in Course 3
    print(f"{name:<20} {age:>5} {gpa:>6.1f}")
```

#### Practice

Format a personal statistics display showing: name (left-aligned, 20 chars), city (20 chars), age (right-aligned 3 digits), salary (right-aligned with comma and 2 decimals), one number as percentage.

---

### Part 3: Legacy Formatting (30 minutes)

#### Explanation

You'll encounter older Python code that uses `.format()` or `%` formatting. Recognize these:

```python
name = "Alice"
age = 28

# .format() method (Python 2.6+)
print("Hello, {}!".format(name))          # Hello, Alice!
print("Name: {0}, Age: {1}".format(name, age))  # Name: Alice, Age: 28
print("Name: {n}, Age: {a}".format(n=name, a=age))  # Named args

# % formatting (old style, from C)
print("Hello, %s!" % name)           # Hello, Alice!
print("Age: %d" % age)               # Age: 28
print("Pi: %.2f" % 3.14159)          # Pi: 3.14
print("Name: %s, Age: %d" % (name, age))

# Format specifiers comparison:
# f-string: f"{value:.2f}"
# .format(): "{:.2f}".format(value)
# % style:  "%.2f" % value
```

> **Teacher's Note:** Students should know these exist (for reading old code) but use f-strings for all new code. Don't teach them deeply.

#### Examples

```python
# You might see this in documentation or old tutorials:
template = "Dear {name},\n\nYour order #{order_id} for ${amount:.2f} has shipped.\n"
message = template.format(name="Alice", order_id=12345, amount=89.99)
print(message)
```

#### Practice

Take a program from a previous lesson that uses string concatenation (`+`). Rewrite it using:
1. f-strings (modern)
2. `.format()` (intermediate)

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Text Statistics Tool

Build a comprehensive text analyzer:
```
Input: Any text paragraph
Output:
  Characters (with spaces): 287
  Characters (no spaces):   243
  Words:                     52
  Sentences:                  4  (count periods)
  Average word length:      4.7
  Most common letter:         e
  Uppercase percentage:     12%
```

#### Exercise 2: Invoice Generator

Build a formatted invoice:
```
╔══════════════════════════════════════════╗
║              PYTHON STORE                ║
║         Invoice #INV-2024-001            ║
╠══════════════════════════════════════════╣
║  Item              Qty    Price    Total ║
╠══════════════════════════════════════════╣
║  Python Book         1   $29.99   $29.99 ║
║  USB Keyboard        2   $49.99   $99.98 ║
║  Mouse Pad           3    $8.99   $26.97 ║
╠══════════════════════════════════════════╣
║  Subtotal:                       $156.94 ║
║  Tax (8.5%):                     $13.34  ║
║  TOTAL:                          $170.28 ║
╚══════════════════════════════════════════╝
```

Use f-string formatting for alignment and decimal precision.

#### Bonus Challenge

**Word wrap:** Write a program that takes a long string and "word wraps" it at a specified column width - no word should be cut in the middle, each line should be as close to the width limit as possible without exceeding it.

---

## Key Takeaways

- String methods: `.upper()`, `.lower()`, `.strip()`, `.split()`, `.join()`, `.replace()`, `.find()`, `.count()`, `.startswith()`, `.endswith()`, `isalpha()`, `isdigit()`
- **F-strings** are the modern standard: `f"Hello, {name}!"`
- F-string format spec: `{value:width.precision type}` where type is `f` (float), `d` (int), `s` (string), `%` (percent), `e` (scientific), `,` (thousands separator)
- Alignment: `<` (left), `>` (right), `^` (center) with optional fill character
- `.format()` and `%` formatting exist in legacy code

---

## Common Mistakes to Avoid

- **Forgetting `f` prefix:** `"Hello, {name}!"` prints literally, `f"Hello, {name}!"` substitutes
- **Chaining methods on None:** If `find()` returns -1, using the result as an index crashes
- **Case-sensitive methods:** `.find()` is case-sensitive: `"Hello".find("hello")` returns -1

---

## Homework

1. Build a "name formatter" that standardizes names: trim spaces, title case, handle hyphenated names
2. Build a CSV row formatter using f-strings
3. Research: What are "template strings" in Python? (hint: `from string import Template`)

---

[← Previous](./lesson-03-strings-deep-dive.md) | [Back to Course](./README.md) | [Next →](./lesson-05-booleans-and-comparisons.md)
