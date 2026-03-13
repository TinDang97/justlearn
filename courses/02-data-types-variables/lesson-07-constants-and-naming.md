# Lesson 7: Constants & Naming Conventions

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Define constants and explain why they improve code quality
- Apply Python naming conventions for all identifier types
- Use meaningful names to make code self-documenting
- Identify "magic numbers" and replace them with named constants
- Understand Python naming conventions vs. conventions of other languages

---

## Prerequisites

- Lessons 1-6 of this course

---

## Lesson Outline

### Part 1: Constants - Naming Fixed Values (30 minutes)

#### Explanation

A **constant** is a value that shouldn't change during program execution. Python doesn't enforce constants (any variable CAN be changed), but by convention, we write constant names in `ALL_CAPS_WITH_UNDERSCORES` as a signal to other programmers: "don't change this."

**Why constants matter:**

```python
# Magic numbers (BAD):
price_with_tax = price * 1.0875
retirement_age = 65
days = years * 365

# Where did 1.0875 come from? What does 65 mean? Why 365?

# Named constants (GOOD):
SALES_TAX_RATE = 1.0875      # California 8.75% tax (as of 2024)
RETIREMENT_AGE = 65           # Standard US retirement age
DAYS_PER_YEAR = 365          # Non-leap year

price_with_tax = price * SALES_TAX_RATE
years_until_retirement = RETIREMENT_AGE - current_age
days = years * DAYS_PER_YEAR
```

**Benefits of constants:**
1. **Readability:** Code explains itself
2. **Maintainability:** Change value in ONE place, affects the whole program
3. **Error prevention:** Can't accidentally misspell the value each time
4. **Documentation:** The name explains what the value means

#### Examples

```python
"""
Example: E-commerce pricing calculator
Shows proper use of constants
"""

# ========================
# CONSTANTS
# ========================
SALES_TAX_RATE = 0.0875          # 8.75% sales tax
SHIPPING_RATE_PER_KG = 2.50      # $2.50 per kilogram
FREE_SHIPPING_THRESHOLD = 50.00  # Free shipping on orders over $50
DISCOUNT_RATE_MEMBER = 0.10      # 10% member discount
MIN_ORDER_AMOUNT = 1.00          # Minimum order value

# ========================
# CALCULATIONS
# ========================
item_price = 35.00
weight_kg = 2.5
is_member = True

# Apply member discount if applicable
discount = item_price * DISCOUNT_RATE_MEMBER if is_member else 0
subtotal = item_price - discount

# Calculate shipping
if subtotal >= FREE_SHIPPING_THRESHOLD:
    shipping = 0
    shipping_note = "FREE"
else:
    shipping = weight_kg * SHIPPING_RATE_PER_KG
    shipping_note = f"${shipping:.2f}"

tax = subtotal * SALES_TAX_RATE
total = subtotal + shipping + tax

print(f"Item:     ${item_price:.2f}")
print(f"Discount: -${discount:.2f}")
print(f"Subtotal: ${subtotal:.2f}")
print(f"Shipping: {shipping_note}")
print(f"Tax:      ${tax:.2f}")
print(f"TOTAL:    ${total:.2f}")
```

#### Practice

Take a previous program that uses "magic numbers" (hardcoded values) and replace every numeric literal (except 0 and 1) with a descriptive constant.

---

### Part 2: Naming Conventions (30 minutes)

#### Explanation

Python has clear conventions from PEP 8 and the broader Python community:

```python
# VARIABLES: snake_case (lowercase with underscores)
student_name = "Alice"
total_score = 0
is_active = True

# CONSTANTS: SCREAMING_SNAKE_CASE (all caps with underscores)
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30
PI = 3.14159

# FUNCTIONS: snake_case (lowercase with underscores) - preview of Course 4
def calculate_average():
    pass

def get_user_name():
    pass

# CLASSES: PascalCase (capitalize each word) - preview of Course 6
class StudentProfile:
    pass

class DatabaseConnection:
    pass

# MODULES/FILES: snake_case (like variables)
# data_processor.py
# user_manager.py
```

**Naming guidelines:**
```python
# BAD names (too short, no context)
x = "Alice"
n = 42
temp = 98.6
d = 7
val = True

# GOOD names (descriptive, self-documenting)
student_name = "Alice"
max_students_per_class = 42
body_temperature_fahrenheit = 98.6
days_until_deadline = 7
is_email_verified = True

# BAD names (misleading or vague)
data = "Alice Johnson"          # What kind of data?
info = {"name": "Alice"}        # What info?
process = calculate_total()     # Should be a verb phrase

# GOOD names (precise)
student_full_name = "Alice Johnson"
student_profile = {"name": "Alice"}
total_bill_amount = calculate_total()
```

> **Teacher's Note:** Naming is one of the hardest problems in programming. There's a famous quote: "There are only two hard things in Computer Science: cache invalidation and naming things." Discuss why good naming matters for teams.

#### Examples

```python
# Naming that tells a story
# BAD version:
a = float(input("?: "))
b = float(input("?: "))
c = a * b * 0.0875
d = a * b + c
print(d)

# GOOD version:
unit_price = float(input("Unit price ($): "))
quantity = float(input("Quantity: "))
subtotal = unit_price * quantity
tax_amount = subtotal * SALES_TAX_RATE
total_with_tax = subtotal + tax_amount
print(f"Total: ${total_with_tax:.2f}")
```

#### Practice

Review 3 programs from previous lessons. Audit every variable name:
- Is it descriptive?
- Does it tell you what it stores?
- Would another programmer understand it without context?

Rename any poor names.

---

### Part 3: Python-Specific Naming (30 minutes)

#### Explanation

Python has some special naming conventions beyond PEP 8:

```python
# Single underscore: "private by convention" or throw-away variable
_private_helper = 42  # Not truly private, just a signal
for _ in range(5):    # When you don't care about the loop variable
    print("Hello")

# Double underscore (dunder): Python special methods - preview
# __init__, __str__, __len__ etc. - Course 6 will cover these
class MyClass:
    def __init__(self):    # Constructor - called when creating an object
        pass

# Trailing underscore: avoid conflict with Python keyword
class_ = "Python 101"  # 'class' is a keyword, 'class_' is not
type_ = "beginner"     # 'type' is a built-in function

# Double leading underscores: name mangling in classes (advanced)
# __very_private (Course 6)

# Built-in names (don't use as variable names!)
# NEVER name your variables: list, dict, str, int, float, input, print, type
# These shadow the built-in functions!

# BAD:
list = [1, 2, 3]    # Now you can't use list() function!
input = "Alice"     # Now you can't use input() function!

# GOOD:
my_list = [1, 2, 3]
user_input = "Alice"
```

#### Examples

```python
# Professional naming example: configuration constants
"""
Application Configuration
"""

# Application settings
APP_NAME = "Python Learning Platform"
APP_VERSION = "2.0.1"
MAX_CONCURRENT_USERS = 1000
SESSION_TIMEOUT_MINUTES = 30

# Database settings
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "learning_platform"
MAX_DB_CONNECTIONS = 10

# Feature flags
ENABLE_EMAIL_NOTIFICATIONS = True
ENABLE_DARK_MODE = False
DEBUG_MODE = False

# Calculated from constants
SESSION_TIMEOUT_SECONDS = SESSION_TIMEOUT_MINUTES * 60
```

#### Practice

Write a "configuration file" for a fictional app using appropriate constants. Include at least 10 constants of different types.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Refactoring Challenge

The following code works but has terrible naming. Refactor it completely:

```python
a = 2024
b = int(input("x: "))
c = a - b
d = c * 365
e = d * 24
f = e * 60
g = f * 60
print(a, b, c, d, e, f, g)
```

Make it clear, well-named, with constants where appropriate.

#### Exercise 2: Restaurant Configuration

Build a restaurant ordering system constants file:

```python
# Define constants for a restaurant menu:
# - Restaurant name and info
# - Menu item prices (at least 8 items)
# - Tax rate and service charge
# - Opening hours
# - Table capacity
# Then use those constants to build an order summary display
```

#### Bonus Challenge

**Naming game:** Write the SAME calculation three ways:
1. With terrible names (a, b, c, x, y)
2. With mediocre names (temp, val, result)
3. With excellent names (descriptive, precise)

Then show both to a partner who hasn't seen your code - which one can they understand fastest?

---

## Key Takeaways

- **Constants** use `ALL_CAPS`: `TAX_RATE = 0.20`
- **Variables** use `snake_case`: `total_price = 0`
- **Functions** use `snake_case verbs`: `calculate_total()`
- **Classes** use `PascalCase`: `CustomerProfile`
- Replace "magic numbers" with named constants
- Never shadow built-in names: `list`, `dict`, `str`, `input`, `print`, `type`
- Single `_` = don't care / private convention; `__name__` = Python special

---

## Common Mistakes to Avoid

- **Shadowing built-ins:** `list = [1,2,3]` - now `list()` function is broken
- **Abbreviating too much:** `usr_nm_strs` is not readable - write `user_name_string`
- **Not using constants for magic numbers:** makes code brittle and confusing
- **camelCase in Python:** `myVariable` is Java/JavaScript style, not Python

---

## Homework

1. Read PEP 8 section on naming: peps.python.org/pep-0008/#naming-conventions
2. Take the largest program you've written and audit all names - rename any that are unclear
3. Write a "style guide" for an imaginary project with examples of good naming

---

[← Previous](./lesson-06-type-conversion.md) | [Back to Course](./README.md) | [Next →](./lesson-08-working-with-none.md)
