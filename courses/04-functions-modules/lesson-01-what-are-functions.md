# Lesson 1: What Are Functions?

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Explain what functions are and why they exist
- Understand the DRY principle
- Identify the anatomy of a function (name, parameters, body, return)
- Trace function calls in code

---

## Prerequisites

- Courses 1-3: all Python basics

---

## Lesson Outline

### Part 1: The DRY Principle (30 minutes)

#### Explanation

**DRY = Don't Repeat Yourself**

Before functions, you might write the same code multiple times:

```python
# WITHOUT functions - repetitive:
# Calculate tip for table 1
bill1 = 45.50
tip1 = bill1 * 0.20
total1 = bill1 + tip1
print(f"Table 1: Bill=${bill1:.2f}, Tip=${tip1:.2f}, Total=${total1:.2f}")

# Calculate tip for table 2
bill2 = 82.30
tip2 = bill2 * 0.20
total2 = bill2 + tip2
print(f"Table 2: Bill=${bill2:.2f}, Tip=${tip2:.2f}, Total=${total2:.2f}")

# What if tip rate changes? Change it in EVERY place!
```

With a function, write the logic once, use it everywhere:

```python
# WITH functions - clean and reusable:
def calculate_tip(bill_amount, tip_rate=0.20):
    tip = bill_amount * tip_rate
    total = bill_amount + tip
    return tip, total

# Use for any table:
tip1, total1 = calculate_tip(45.50)
tip2, total2 = calculate_tip(82.30)
tip3, total3 = calculate_tip(123.75, 0.18)   # Different tip rate
```

**Why functions?**
1. **DRY**: Write once, use anywhere
2. **Readability**: `calculate_bmi(weight, height)` is clearer than 5 lines of formula
3. **Testing**: Test the function once, trust it everywhere
4. **Collaboration**: Multiple programmers can work on different functions

#### Examples

```python
# Functions you've already been using:
print("Hello")         # print is a function
len("Python")          # len is a function
int("42")              # int is a function
input("Name: ")        # input is a function
range(1, 11)           # range is a function

# Custom functions work exactly the same way:
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")   # Call our custom function
greet("Bob")
```

#### Practice

Identify 5 places in your previous programs where the same code (or very similar code) was repeated. Describe how a function could eliminate the repetition.

---

### Part 2: Function Anatomy (30 minutes)

#### Explanation

Every function has these components:

```python
def function_name(parameter1, parameter2):
    """Docstring: describes what this function does."""
    # Function body: code that runs when function is called
    result = parameter1 + parameter2
    return result    # Send value back to caller
```

- `def` keyword: tells Python you're defining a function
- `function_name`: snake_case, should be a verb or verb phrase
- `parameters`: input values (in parentheses)
- `docstring`: description string (optional but professional)
- `body`: indented code block
- `return`: send a value back (optional)

**Calling a function:**
```python
# Definition (the recipe)
def add(a, b):
    return a + b

# Call (making the dish)
result = add(3, 5)   # result = 8
print(result)

# Arguments: the actual values you pass when calling
add(10, 20)   # 10 and 20 are arguments
add(3.14, 2.71)   # works with floats too
```

> **Teacher's Note:** The terminology: **parameters** are the variables in the definition; **arguments** are the actual values passed when calling. Students mix these up constantly - that's fine, most professionals do too.

#### Examples

```python
# Function that calculates area
def rectangle_area(length, width):
    """Calculate the area of a rectangle."""
    area = length * width
    return area

# Multiple calls with different inputs
print(rectangle_area(5, 3))    # 15
print(rectangle_area(10, 7))   # 70
print(rectangle_area(2.5, 4))  # 10.0

# Function that displays a formatted separator
def print_separator(character="-", width=40):
    """Print a separator line."""
    print(character * width)

print_separator()           # ----------------------------------------
print_separator("=", 50)   # ==================================================
print_separator("*", 20)   # ********************
```

#### Practice

Write 3 simple functions:
1. `square(n)` - returns n squared
2. `celsius_to_fahrenheit(c)` - converts temperature
3. `is_even(n)` - returns True if n is even

---

### Part 3: Functions as Abstraction (30 minutes)

#### Explanation

Functions let you work at a higher level of abstraction - you use the function without worrying about its implementation.

```python
# Using a function is like using an appliance:
# You press "start" on a microwave without knowing how microwaves work
calculate_mortgage(principal, rate, years)
# You call this without knowing the complex formula inside

# The caller doesn't need to know HOW, only WHAT:
formatted = format_phone_number("5551234567")
# Returns: (555) 123-4567
```

**Function composition - functions calling functions:**
```python
def validate_email(email):
    """Check if email has basic valid format."""
    return "@" in email and "." in email.split("@")[-1]

def create_user(username, email):
    """Create a user account."""
    if not validate_email(email):
        return None
    return {"username": username, "email": email, "active": True}

def display_user(user):
    """Display user information."""
    if user is None:
        print("Invalid user data")
        return
    print(f"User: {user['username']} ({user['email']})")

# Using the composed functions:
user = create_user("alice", "alice@example.com")
display_user(user)
```

#### Practice

Build a simple "user validation pipeline" with 3 functions that each handle one step.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Refactoring

Take this repetitive code and refactor it using functions:

```python
# BEFORE: repetitive
r1 = float(input("Rectangle 1 - length: "))
w1 = float(input("Rectangle 1 - width: "))
print(f"Rect 1: Area={r1*w1:.2f}, Perimeter={2*(r1+w1):.2f}")

r2 = float(input("Rectangle 2 - length: "))
w2 = float(input("Rectangle 2 - width: "))
print(f"Rect 2: Area={r2*w2:.2f}, Perimeter={2*(r2+w2):.2f}")
```

#### Exercise 2: Function Library

Write a "math helper" module with 5 functions:
- `circle_area(radius)`
- `circle_circumference(radius)`
- `triangle_area(base, height)`
- `compound_interest(principal, rate, time, n=12)`
- `bmi(weight_kg, height_cm)`

Each function must have a docstring.

#### Bonus Challenge

**Recursive counting (preview):** Write a function `count_down(n)` that calls itself to count down from n to 0. (This is a preview of recursion - a function calling itself!)

---

## Key Takeaways

- Functions are reusable, named blocks of code
- **DRY principle**: Don't Repeat Yourself - write once, use everywhere
- `def name(params):` defines a function
- `name(args)` calls a function
- **Parameters** are variables in definition; **arguments** are values passed in call
- Functions enable abstraction - use without knowing implementation

---

## Common Mistakes to Avoid

- **Defining but never calling**: `def greet():` does nothing until you call `greet()`
- **Not returning values**: forgetting `return` means the function returns `None`
- **Calling before defining**: function definition must appear before the call in file

---

## Homework

1. Write 5 functions that each solve one part of a real problem (e.g., pizza order calculator)
2. Research: What is "first-class functions" in Python? (Functions can be stored in variables and passed to other functions)

---

[Back to Course](./README.md) | [Next →](./lesson-02-defining-calling-functions.md)
