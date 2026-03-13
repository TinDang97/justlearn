# Lesson 6: Variable Scope & LEGB

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Apply the full LEGB rule correctly
- Use `global` and `nonlocal` keywords appropriately
- Understand closures conceptually
- Write functions without unintended side effects

---

## Prerequisites

- Course 2, Lesson 9: Scope introduction; Lessons 1-5 of this course

---

## Lesson Outline

### Part 1: LEGB in Depth (30 minutes)

#### Explanation

**LEGB**: Local → Enclosing → Global → Built-in

```python
# Built-in: print, len, range, etc.
x = "Global"  # Global scope

def outer():
    x = "Enclosing"  # Enclosing scope
    def inner():
        x = "Local"   # Local scope
        print(x)      # Finds Local first → "Local"
    inner()
    print(x)         # Finds Enclosing → "Enclosing"

outer()
print(x)             # Finds Global → "Global"
```

**Only assignment creates local scope:**
```python
x = 10

def func():
    print(x)  # Python looks up: Local? No. Enclosing? No. Global? YES → 10

func()  # 10

def func2():
    x = 20    # This assignment makes x LOCAL
    print(x)  # Local x → 20

func2()  # 20
print(x) # Still 10 - global unchanged

def func3():
    print(x)  # UnboundLocalError!
    x = 20    # Seeing this assignment, Python considers x local throughout func3
              # But it's read before being assigned → error!
```

#### Examples

```python
# The global keyword
call_count = 0

def track_call():
    global call_count
    call_count += 1

track_call()
track_call()
track_call()
print(f"Called {call_count} times")  # 3

# Better: avoid globals with return
def increment_count(current_count: int) -> int:
    return current_count + 1

count = 0
count = increment_count(count)
count = increment_count(count)
```

#### Practice

Write a program with: 1 global, 3 functions each with locals, and demonstrate LEGB by predicting output.

---

### Part 2: Closures (30 minutes)

#### Explanation

A **closure** is a function that remembers variables from its enclosing scope, even after the enclosing function has finished:

```python
def make_counter(start=0):
    """Creates a counter function."""
    count = start

    def counter():
        nonlocal count  # Access and modify enclosing scope
        count += 1
        return count

    return counter  # Return the inner function!

counter_a = make_counter()
counter_b = make_counter(100)

print(counter_a())  # 1
print(counter_a())  # 2
print(counter_b())  # 101
print(counter_a())  # 3 - independent from counter_b!
```

**`nonlocal` keyword**: Like `global` but for enclosing function scope.

**Practical closures:**
```python
def make_multiplier(factor: float):
    """Create a function that multiplies by factor."""
    def multiplier(x):
        return x * factor
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)
percent = make_multiplier(0.01)

print(double(5))    # 10
print(triple(5))    # 15
print(percent(85))  # 0.85
```

#### Examples

```python
# Real-world: function factory for validation
def make_validator(min_val, max_val, field_name="value"):
    def validate(value):
        if not isinstance(value, (int, float)):
            return False, f"{field_name} must be a number"
        if not (min_val <= value <= max_val):
            return False, f"{field_name} must be between {min_val} and {max_val}"
        return True, "OK"
    return validate

validate_age = make_validator(0, 150, "Age")
validate_score = make_validator(0, 100, "Score")

is_valid, msg = validate_age(25)    # True, "OK"
is_valid, msg = validate_age(200)   # False, "Age must be between 0 and 150"
is_valid, msg = validate_score(105) # False, "Score must be between 0 and 100"
```

#### Practice

Create a `make_adder(n)` closure and a `make_greeting(greeting_word)` closure.

---

### Part 3: Avoiding Scope Issues (30 minutes)

#### Explanation

Best practices for clean scope management:

```python
# 1. Prefer pure functions (no global state)
# IMPURE (depends on external state):
total = 0
def add_to_total(n):
    global total
    total += n

# PURE (self-contained):
def add(current_total, n):
    return current_total + n

# 2. Pass data explicitly
# 3. Return values rather than modifying globals
# 4. Use constants (not variables) at module level
MAX_SIZE = 100  # Constant = fine at module level

# 5. Use classes for stateful operations (Course 6)
```

#### Practice

Identify scope issues in a provided code snippet and refactor.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Counter Factory

Build `make_counter(start=0, step=1, max_value=None)` that returns a closure. The counter increments by step, and if max_value is set, wraps back to start.

#### Exercise 2: Memoization

Build a `make_memoized(func)` that wraps any function and caches results:
```python
memoized_fib = make_memoized(fibonacci)
memoized_fib(40)  # Fast - cached!
```

#### Bonus Challenge

**Pipeline builder:** Write `make_pipeline(*functions)` that chains functions: output of each becomes input of next.

---

## Key Takeaways

- LEGB: Local → Enclosing → Global → Built-in search order
- `global var`: allows modification of global from inside function
- `nonlocal var`: allows modification of enclosing function's variable
- **Closures**: inner functions that remember enclosing scope variables
- Pure functions (no global side effects) are easier to test and debug

---

## Homework

1. Implement a "function factory" that creates different tax calculators for different regions
2. Research: What is a decorator in Python? (It's a closure pattern!)

---

[← Previous](./lesson-05-default-keyword-arguments.md) | [Back to Course](./README.md) | [Next →](./lesson-07-lambda-functions.md)
