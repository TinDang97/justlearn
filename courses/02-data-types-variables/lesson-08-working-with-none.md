# Lesson 8: Working with None

**Course:** Data Types & Variables | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Explain what None represents and when to use it
- Distinguish between None, 0, False, and ""
- Use `is` and `is not` for None comparisons correctly
- Recognize when functions return None implicitly
- Apply None in practical scenarios

---

## Prerequisites

- Lessons 1-7 of this course

---

## Lesson Outline

### Part 1: What is None? (30 minutes)

#### Explanation

`None` is Python's way of representing "nothing", "no value", "empty", or "not set". It's a special singleton object - there is only ONE None in Python.

Think of it like a box with a label but nothing inside. It's different from:
- `0` - the number zero (something)
- `""` - an empty string (something, just empty text)
- `False` - a boolean value (something, a lie)
- `None` - the complete absence of a value

```python
# None is its own type
print(type(None))    # <class 'NoneType'>
print(None)          # None

# Assigning None
result = None    # "I haven't calculated this yet"
username = None  # "No user is logged in"
error = None     # "No error has occurred"
```

**When None appears:**
1. When you explicitly assign it
2. When a function returns nothing (implicitly returns None)
3. As a default "not set yet" sentinel value
4. In data from APIs/databases that have missing fields

#### Examples

```python
# Functions that don't return anything return None implicitly
def say_hello():
    print("Hello!")
    # No return statement

result = say_hello()
print(result)     # None
print(type(result))  # NoneType

# Practical: tracking optional information
middle_name = None   # Many people don't have one

if middle_name is not None:
    display_name = f"{first_name} {middle_name} {last_name}"
else:
    display_name = f"{first_name} {last_name}"
```

#### Practice

Create 5 variables set to None representing "not yet collected" data. Then "collect" each one by assigning a real value. Show the before/after.

---

### Part 2: Checking for None (30 minutes)

#### Explanation

**Always use `is` and `is not` to compare with None (not `==`):**

```python
value = None

# CORRECT way:
if value is None:
    print("No value set")

if value is not None:
    print(f"Value is: {value}")

# WORKS but not idiomatic Python:
if value == None:      # Technically works, but not recommended
    print("No value")

# WHY is vs ==?
# 'is' checks identity (same object in memory)
# '==' checks equality (same value)
# Since None is a singleton, 'is None' is always correct and slightly faster
```

**None vs Falsy:**
```python
# None is falsy, but they're NOT the same thing
none_val = None
zero = 0
empty = ""
false_val = False

# All are falsy:
print(bool(none_val))    # False
print(bool(zero))         # False
print(bool(empty))        # False
print(bool(false_val))    # False

# But they're NOT equal to each other:
print(none_val == zero)   # False
print(none_val == empty)  # False
print(none_val == False)  # False

# Use specific checks when you need to distinguish:
if value is None:
    print("No data at all")
elif value == 0:
    print("Data exists and it's zero")
elif value == "":
    print("Data exists but it's empty text")
```

#### Examples

```python
# Pattern: function returns None to signal "not found"
def find_student(students_list, target_name):
    for student in students_list:   # Loops in Course 3
        if student["name"] == target_name:
            return student
    return None   # Not found

result = find_student(students, "Alice")
if result is None:
    print("Student not found")
else:
    print(f"Found: {result['name']}, Age: {result['age']}")
```

#### Practice

Write a "user profile" program where some fields are None (optional). Display the profile, showing "Not provided" for None fields.

---

### Part 3: None in Data Handling (30 minutes)

#### Explanation

None is essential when handling real-world data that may be missing:

```python
# Database record with missing fields
user_record = {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": None,            # Phone not provided
    "age": 28,
    "linkedin": None,          # Not provided
    "github": "alice-codes",
}

# Safe access pattern:
phone = user_record["phone"]
if phone is not None:
    print(f"Phone: {phone}")
else:
    print("Phone: Not provided")

# Shorter version using 'or':
phone_display = user_record["phone"] or "Not provided"
print(f"Phone: {phone_display}")
```

**Optional values with defaults:**
```python
# Pattern: use None as "not yet set", replace with default if needed
def format_greeting(name, title=None, company=None):
    # title and company default to None if not provided
    parts = []
    if title is not None:
        parts.append(title)
    parts.append(name)
    if company is not None:
        parts.append(f"({company})")
    return " ".join(parts)

print(format_greeting("Alice"))
print(format_greeting("Bob", title="Dr."))
print(format_greeting("Carol", company="Google"))
print(format_greeting("David", title="Prof.", company="MIT"))
```

#### Practice

Build a contact record processor: given a contact dict with some None fields, generate different display formats depending on which fields are available.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Survey Data Processor

Process survey results where some respondents skipped questions (their answers are None):

```python
responses = [
    {"name": "Alice", "age": 28, "income": 75000, "comment": "Great!"},
    {"name": "Bob", "age": None, "income": 52000, "comment": None},
    {"name": "Carol", "age": 35, "income": None, "comment": "Helpful"},
    {"name": "David", "age": 42, "income": 88000, "comment": None},
]
# Count: how many provided age? income? comment?
# Calculate average of non-None values
# Display results showing "N/A" for None fields
```

#### Exercise 2: Product Inventory

Manage a product inventory where some optional fields may be None:
- `sku` (required)
- `name` (required)
- `price` (required)
- `discount` (optional, None = no discount)
- `supplier` (optional)
- `weight_kg` (optional, None = digital product)

Build a display function that handles all None cases gracefully.

#### Bonus Challenge

Implement a "null-safe chain" function that safely accesses nested None values:
```python
# Safe access to potentially missing nested data
user = {"address": {"city": "New York", "zip": None}}
# Without crashes, get: city, zip, country (doesn't exist)
```

---

## Key Takeaways

- `None` represents "no value" - distinct from `0`, `""`, and `False`
- `type(None)` is `NoneType`; there is only ONE None object
- Always check: `value is None` or `value is not None` (not `==`)
- Functions without `return` implicitly return None
- Use None for optional values, "not yet set", or "not found"
- `None` is falsy: `bool(None)` is `False`

---

## Common Mistakes to Avoid

- **Using `== None`**: use `is None` instead
- **Confusing None with empty string**: `""` means empty text; `None` means no value at all
- **Not checking for None before using a value**: `len(None)` crashes!

---

## Homework

1. Build a "contact book" where middle name, second email, and notes are optional (None)
2. Research: What is the "billion-dollar mistake" that Tony Hoare refers to? (Hint: it involves null values)

---

[← Previous](./lesson-07-constants-and-naming.md) | [Back to Course](./README.md) | [Next →](./lesson-09-variable-scope-introduction.md)
