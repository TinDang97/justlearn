# Lesson 9: Variable Scope Introduction

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Explain what variable scope means
- Distinguish between local and global scope
- Understand the LEGB rule (Local, Enclosing, Global, Built-in)
- Avoid scope-related bugs
- Use global variables responsibly

---

## Prerequisites

- Lessons 1-8 of this course

---

## Lesson Outline

### Part 1: What is Scope? (30 minutes)

#### Explanation

**Scope** determines where a variable is accessible in your program. Think of it like rooms in a house: a lamp in the bedroom is only accessible from the bedroom, but lights in the hallway are accessible from everywhere.

In Python, variables exist in a **namespace** - a region of code. Variables created at the top level of your program are **global**. Variables created inside a function are **local** to that function (we'll cover functions in Course 4).

For now, all your variables are global (since you're writing at the module level).

```python
# Global scope - accessible everywhere in this file
global_greeting = "Hello"
student_count = 300

print(global_greeting)   # Works - we're at global scope
print(student_count)     # Works

# When we use functions (preview):
def greet():
    # Inside function - this is local scope
    local_message = "Hi from inside!"  # LOCAL - only exists here
    print(global_greeting)   # Can READ global
    print(local_message)     # Can access local

# print(local_message)   # Would cause NameError! Doesn't exist here
```

**Why does scope exist?**
Imagine 10 programmers all writing functions for the same program. Without scope, if all 10 use a variable named `total`, they'd overwrite each other's data! Scope provides isolation.

#### Examples

```python
# Simple scope demonstration
name = "Alice"   # Global variable

def show_name():
    print(name)   # Reading global is fine

show_name()  # Alice

# But modifying global inside function requires declaration:
def change_name():
    global name   # Declare we want to modify the global
    name = "Bob"  # Now modifies the global

change_name()
print(name)   # Bob - the global was changed
```

#### Practice

Write a program with 3 global variables and 2 functions (preview). Show which variables are accessible from each function. (Even before learning functions formally, experiment with this structure.)

---

### Part 2: The LEGB Rule (30 minutes)

#### Explanation

Python looks up variables in a specific order: **LEGB**

1. **L**ocal - Inside the current function
2. **E**nclosing - Inside any enclosing functions (nested functions)
3. **G**lobal - At the module level
4. **B**uilt-in - Python's built-ins (print, len, int, etc.)

```python
# Built-in scope - print, len, int exist here automatically
x = "Global x"    # Global scope

def outer():
    x = "Enclosing x"    # Enclosing scope (for any function inside outer)

    def inner():
        x = "Local x"   # Local scope
        print(x)        # Finds Local first → "Local x"

    inner()
    print(x)   # Finds Enclosing → "Enclosing x"

outer()
print(x)   # Finds Global → "Global x"
```

**What happens when Python can't find a name:**
```python
def my_function():
    print(undefined_variable)  # Python searches L → E → G → B
                                # Not found anywhere → NameError!
```

> **Teacher's Note:** LEGB might seem overwhelming. Focus on Local vs Global for now. Enclosing (closures) is advanced. The key message: Python searches from inside out.

#### Examples

```python
# Common scope trap:
count = 0   # Global

def increment():
    count += 1   # UnboundLocalError! Python sees 'count' on left of +=
                  # and assumes it's local, but it's not defined locally

# Fix 1: Use global keyword
def increment_v2():
    global count
    count += 1

# Fix 2: Return new value instead (better practice)
def increment_v3(current_count):
    return current_count + 1

count = increment_v3(count)
```

#### Practice

Trace through this code and predict output:
```python
x = 10

def first():
    x = 20
    print(x)

def second():
    print(x)

first()
second()
print(x)
```

---

### Part 3: Good Scope Practices (30 minutes)

#### Explanation

**Global variables: use sparingly**

While globals work, overusing them creates problems in larger programs:
- Any part of code can change them → hard to track bugs
- Functions with side effects are harder to test
- Coupling: functions depend on global state

```python
# FRAGILE: relying on global state
total_price = 0
discount = 0

def add_item(price):
    global total_price
    total_price += price

def apply_discount(percent):
    global total_price, discount
    discount = total_price * (percent / 100)
    total_price -= discount

# BETTER: pass values explicitly, return results
def add_item_to_cart(cart_total, item_price):
    return cart_total + item_price

def apply_discount_to_cart(cart_total, percent):
    discount = cart_total * (percent / 100)
    return cart_total - discount, discount

total = 0
total = add_item_to_cart(total, 29.99)
total, savings = apply_discount_to_cart(total, 10)
```

**When globals ARE appropriate:**
- Configuration constants (read-only)
- Application-wide settings
- Module-level data structures

#### Examples

```python
# Good use of globals: read-only constants
MAX_SCORE = 100
GRADE_BOUNDARIES = {
    'A': 90, 'B': 80, 'C': 70, 'D': 60
}

def calculate_grade(score):
    # Reading globals is fine
    percentage = (score / MAX_SCORE) * 100
    for grade, boundary in GRADE_BOUNDARIES.items():
        if percentage >= boundary:
            return grade
    return 'F'

print(calculate_grade(85))  # B
```

#### Practice

Refactor a program that uses global variables to modify state, into one that passes values as parameters and returns results.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Scope Detective

For each code snippet, predict what prints, then verify:

```python
# Snippet 1:
msg = "global"
def test():
    msg = "local"
    print(msg)
test()
print(msg)

# Snippet 2:
value = 100
def double():
    return value * 2
print(double())
print(value)

# Snippet 3:
count = 0
def add():
    global count
    count += 5
add()
add()
add()
print(count)
```

#### Exercise 2: Shopping Cart

Build a shopping cart using proper scope:
- Use a global list (acceptable for state in small programs)
- Functions: add_item, remove_item, calculate_total, display_cart
- Each function should be pure when possible (no unnecessary global modifications)

#### Bonus Challenge

**Scope experiment:**
Write 3 functions that all use a variable named `result`. Show that each function's `result` is completely independent of the others.

---

## Key Takeaways

- **Scope** determines where variables are accessible
- **Global scope**: module level, accessible everywhere
- **Local scope**: inside a function, not accessible outside
- **LEGB**: Python looks up names: Local → Enclosing → Global → Built-in
- To **modify** a global from inside a function: use `global variable_name`
- Minimize global mutable state - prefer passing values and returning results
- Reading globals is fine; modifying them should be done carefully

---

## Common Mistakes to Avoid

- **`UnboundLocalError`**: assigning to a variable that Python thinks is local (but you thought was global) - use `global` keyword
- **Modifying globals too freely**: hard to debug, leads to unexpected behavior
- **Shadowing built-ins**: `len = 5` means you can't use `len()` function anymore!

---

## Homework

1. Write a program with 3 functions that each have a local variable `score`. Show they don't interfere with each other.
2. Research: What is "name mangling" in Python classes? (Preview of Course 6)

---

[← Previous](./lesson-08-working-with-none.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)
