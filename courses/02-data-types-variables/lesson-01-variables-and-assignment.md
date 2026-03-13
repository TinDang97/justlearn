# Lesson 1: Variables & Assignment

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Explain what a variable is using a real-world analogy
- Create variables using assignment (`=`)
- Apply Python naming rules and conventions
- Use multiple assignment and augmented assignment operators
- Understand that variables are references to objects

---

## Prerequisites

- Course 1 complete: basic Python, print, input

---

## Lesson Outline

### Part 1: Variables as Labeled Boxes (30 minutes)

#### Explanation

A **variable** is a named storage location in your computer's memory. Imagine your computer's memory as a massive warehouse with millions of boxes. Each box can hold one piece of data. A variable is a label you put on a box so you can find it again.

```python
# Create a variable (label a box and put data in it)
student_name = "Maria Garcia"
#   ^label          ^data stored in the box
```

**The assignment operator `=`:**
In Python, `=` does NOT mean "equals" (like in math). It means "put the value on the right into the variable on the left". We call it **assignment**.

```python
x = 5       # Put 5 into box labeled 'x'
y = 10      # Put 10 into box labeled 'y'
x = 20      # Replace what's in box 'x' with 20 (old value is gone)
```

**Variable naming rules (MUST follow - Python enforces these):**
```python
# VALID names:
student_name = "Alice"
age = 25
_private = "hidden"
name2 = "second name"
firstName = "Alice"    # valid but not Python style

# INVALID names (Python will reject):
2fast = "too fast"       # Can't start with number
my-name = "Alice"        # Hyphens not allowed (that's subtraction!)
class = "Python"         # 'class' is a Python keyword
my name = "Alice"        # Spaces not allowed
```

#### Examples

```python
# Variables can change (that's why they're called VARIables)
score = 0
print(f"Starting score: {score}")

score = 10
print(f"After level 1: {score}")

score = 25
print(f"After level 2: {score}")
```

**Multiple assignment (assign same value to multiple variables):**
```python
x = y = z = 0   # All three variables set to 0
print(x, y, z)  # 0 0 0
```

**Tuple unpacking (assign multiple values at once):**
```python
first_name, last_name = "Alice", "Johnson"
print(first_name)   # Alice
print(last_name)    # Johnson

# Swap two variables elegantly (Python trick)
a = 10
b = 20
a, b = b, a   # Swap!
print(a, b)   # 20 10
```

#### Practice

Create variables to store: your name, age, city, and a hobby. Print them in a formatted sentence.

---

### Part 2: Augmented Assignment Operators (30 minutes)

#### Explanation

Augmented assignment operators combine an operation with assignment. They're shortcuts.

```python
# Without augmented assignment:
score = score + 10

# With augmented assignment:
score += 10    # Same thing! "Add 10 to score and save the result"
```

All augmented operators:
```python
x = 10

x += 5    # x = x + 5    → 15
x -= 3    # x = x - 3    → 12
x *= 2    # x = x * 2    → 24
x /= 4    # x = x / 4    → 6.0
x //= 2   # x = x // 2   → 3.0
x **= 3   # x = x ** 3   → 27.0
x %= 5    # x = x % 5    → 2.0
```

#### Examples

```python
# Practical use: running totals
shopping_cart_total = 0.0

item1 = 29.99
item2 = 12.50
item3 = 7.25

shopping_cart_total += item1   # 29.99
shopping_cart_total += item2   # 42.49
shopping_cart_total += item3   # 49.74

print(f"Cart total: ${shopping_cart_total:.2f}")
```

#### Practice

Write a program that simulates a student's grade tracker. Start with score = 0, then add points for 5 assignments using `+=`. Display the total.

---

### Part 3: Variables as References (30 minutes)

#### Explanation

Here's something subtle but important: in Python, variables don't contain data directly - they **reference** (point to) data in memory. This usually doesn't matter, but it explains some surprising behavior.

```python
# Two variables can reference the same data
a = [1, 2, 3]   # 'a' points to a list in memory
b = a            # 'b' points to the SAME list (not a copy!)

b.append(4)
print(a)   # [1, 2, 3, 4] - 'a' also changed!

# For basic types (int, float, str), this doesn't cause issues
x = 5
y = x
y = 10
print(x)  # 5 - x was NOT changed (basic types work differently)
```

> **Teacher's Note:** This deep concept is introduced here briefly. Students will understand it more when they learn about lists in Course 5. For now, the key message is: "copying a list variable doesn't copy the list."

**Checking what type a variable holds:**
```python
name = "Alice"
age = 25
height = 1.73
is_student = True

print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(height))     # <class 'float'>
print(type(is_student)) # <class 'bool'>
```

#### Examples

```python
# Type checking in practice
value = input("Enter something: ")
print(f"You entered: {value}")
print(f"Type: {type(value)}")   # Always 'str' from input()
print(f"Length: {len(value)}")
```

#### Practice

Create 5 variables of different types. Use `type()` to verify each type. Print a table showing variable name, value, and type.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Personal Profile Builder

Build a program that stores a person's profile in variables and displays it in two formats (short and detailed):

```python
# Store all data in variables
full_name = "Alice Johnson"
age = 28
city = "New York"
job = "Software Developer"
years_experience = 3
annual_salary = 85000.00

# Short format (one line):
# Alice Johnson | 28 | New York | Developer

# Detailed format (formatted card):
# ==============================
# Name:       Alice Johnson
# Age:        28 years old
# City:       New York
# Job:        Software Developer
# Experience: 3 years
# Salary:     $85,000.00
# ==============================
```

#### Exercise 2: Score Tracker

Write a quiz score tracker:
1. Start with `total_score = 0`
2. Use `+=` to add points for 5 questions (you decide the points: 10, 15, 20, 25, 30)
3. Calculate percentage: `percentage = (total_score / 100) * 100`
4. Display: question scores, total, percentage, pass/fail (pass = 60+)

#### Bonus Challenge

**Variable swap puzzle:**
Without using a third variable, swap two variables `a = "hello"` and `b = "world"` so that `a = "world"` and `b = "hello"`. (Python tuple unpacking makes this elegant!)

---

## Key Takeaways

- Variables are **named references** to data stored in memory
- `=` is **assignment** (not equality) - "put this value into this variable"
- Variable names must: start with letter/underscore, contain only letters/numbers/underscores, not be a Python keyword
- **Augmented assignment** (`+=`, `-=`, etc.) combines operation and assignment
- `type()` tells you what type of data a variable holds
- Python variable names use **snake_case**: `student_name`, not `studentName`

---

## Common Mistakes to Avoid

- **Using `=` to test equality:** `if x = 5` is wrong; use `==` for comparison (Course 3)
- **Starting with numbers:** `2fast = "quick"` is a syntax error
- **Reassigning and losing data:** `name = "Alice"` then `name = "Bob"` - "Alice" is gone forever
- **Meaningless names:** `x`, `y`, `temp` are fine for math exercises but bad for real programs

---

## Homework / Self-Study

1. Build a "contact card" program with 8+ variables for a person's information
2. Experiment: What happens when you `print(variable_that_doesnt_exist)`?
3. Research: What are Python's reserved keywords? (`import keyword; print(keyword.kwlist)`)

---

## Next Lesson Preview

In **Lesson 2: Numbers: int and float**, we'll dive into Python's two numeric types, explore the math module, and discover some surprising things about floating-point arithmetic.

---

[Back to Course Overview](./README.md) | [Next Lesson →](./lesson-02-numbers-int-float.md)
