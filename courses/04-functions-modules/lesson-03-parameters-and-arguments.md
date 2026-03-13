# Lesson 3: Parameters & Arguments

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use positional arguments correctly
- Use multiple parameters
- Add type hints to function signatures
- Understand that arguments are passed by assignment

---

## Prerequisites

- Lessons 1-2 of this course

---

## Lesson Outline

### Part 1: Positional Parameters (30 minutes)

#### Explanation

**Positional arguments** must be passed in the exact order the parameters are defined:

```python
def introduce(first_name, last_name, age):
    print(f"I'm {first_name} {last_name}, {age} years old.")

introduce("Alice", "Johnson", 28)  # Correct
introduce("Johnson", "Alice", 28)  # Works but wrong meaning!
introduce(28, "Alice", "Johnson")  # Works but completely wrong!

# Position matters - Python doesn't know what "first_name" means
```

**Multiple parameters:**
```python
def create_product(name, price, category, in_stock=True, quantity=0):
    return {
        "name": name,
        "price": price,
        "category": category,
        "in_stock": in_stock,
        "quantity": quantity,
    }

product = create_product("Python Book", 29.99, "Education")
```

#### Examples

```python
# Function with many parameters - consider using keyword args
def send_email(from_addr, to_addr, subject, body, cc=None, bcc=None, html=False):
    """Simulate sending an email."""
    print(f"From: {from_addr}")
    print(f"To: {to_addr}")
    if cc: print(f"CC: {cc}")
    print(f"Subject: {subject}")
    print(f"--- Body ---")
    print(body)

send_email("alice@example.com", "bob@example.com",
           "Meeting tomorrow", "Don't forget our 2pm meeting!")
```

#### Practice

Write a `draw_shape(shape, size, character='*', filled=True)` function with examples.

---

### Part 2: Type Hints (30 minutes)

#### Explanation

**Type hints** (Python 3.5+) document expected types. Python doesn't enforce them at runtime, but they're great for documentation and IDE support:

```python
# Without type hints:
def calculate_bmi(weight, height):
    return weight / (height ** 2)

# With type hints:
def calculate_bmi(weight: float, height: float) -> float:
    """
    Calculate Body Mass Index.

    Args:
        weight: Weight in kilograms
        height: Height in meters

    Returns:
        BMI value
    """
    return weight / (height ** 2)
```

**Common type hints:**
```python
from typing import Optional, List, Dict, Tuple, Union

def process_name(name: str) -> str: ...
def add_numbers(a: int, b: int) -> int: ...
def get_user(user_id: int) -> Optional[dict]: ...  # might return None
def get_scores(names: List[str]) -> Dict[str, int]: ...
def get_range(data: List[float]) -> Tuple[float, float]: ...
def flexible(x: Union[int, float]) -> float: ...  # accepts int or float
```

> **Teacher's Note:** Type hints don't change how code runs. They're documentation. Tools like mypy can check them statically. IDEs use them for autocomplete. Start using them now - it's a professional habit.

#### Examples

```python
from typing import Optional, List

def find_student(students: List[dict], name: str) -> Optional[dict]:
    """
    Find a student by name.

    Args:
        students: List of student dictionaries
        name: Name to search for (case-insensitive)

    Returns:
        Student dict if found, None otherwise
    """
    for student in students:
        if student["name"].lower() == name.lower():
            return student
    return None

def calculate_grade_stats(grades: List[float]) -> Dict[str, float]:
    """Calculate statistics for a list of grades."""
    if not grades:
        return {"average": 0.0, "highest": 0.0, "lowest": 0.0}

    return {
        "average": sum(grades) / len(grades),
        "highest": max(grades),
        "lowest": min(grades),
    }
```

#### Practice

Add type hints to 5 functions from previous lessons.

---

### Part 3: Pass by Assignment (30 minutes)

#### Explanation

Python passes arguments "by assignment" - the function parameter is a new reference to the same object:

```python
# Immutable types (int, float, str, bool): safe to modify locally
def increment(n: int) -> int:
    n += 1      # Creates new local variable, doesn't affect caller
    return n

x = 5
result = increment(x)
print(x)       # 5 - unchanged!
print(result)  # 6

# Mutable types (list, dict): modifications affect the original!
def append_zero(lst: list) -> None:
    lst.append(0)   # Modifies the SAME list object!

numbers = [1, 2, 3]
append_zero(numbers)
print(numbers)  # [1, 2, 3, 0] - CHANGED!

# Safe pattern: work on a copy
def append_zero_safe(lst: list) -> list:
    new_lst = lst.copy()  # Create a copy
    new_lst.append(0)
    return new_lst

numbers = [1, 2, 3]
result = append_zero_safe(numbers)
print(numbers)  # [1, 2, 3] - unchanged
print(result)   # [1, 2, 3, 0]
```

#### Examples

```python
# Demonstrating mutation of passed objects
def normalize_names(names: list) -> None:
    """Normalize names in place (modifies original!)."""
    for i in range(len(names)):
        names[i] = names[i].strip().title()

student_names = ["  alice  ", "BOB", "carol jones"]
normalize_names(student_names)
print(student_names)  # ["Alice", "Bob", "Carol Jones"] - original modified!
```

#### Practice

Write two versions of a "sort and dedup" function: one that modifies in place, one that returns a new list.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Full-Featured Calculator Function

Build a `calculate(a, b, operation)` function that:
- Accepts proper type hints
- Handles division by zero gracefully
- Returns a tuple `(result, formatted_string)`
- Has a complete docstring

#### Exercise 2: User Profile Manager

Build 4 functions with type hints for a user profile system:
- `create_profile(name, email, age, bio=None)` → dict
- `update_profile(profile, **changes)` → dict (new dict, not modified)
- `validate_profile(profile)` → tuple[bool, list[str]]
- `format_profile(profile)` → str

#### Bonus Challenge

**Recursive functions with type hints:**
Write type-hinted recursive functions for: `sum_list(items)`, `flatten_list(nested)`, `max_depth(nested_list)`.

---

## Key Takeaways

- Positional arguments must match parameter order exactly
- **Type hints** (`def func(x: int, y: str) -> bool`) document types (not enforced)
- Immutable arguments (int, str) are safe - function can't change the caller's variable
- Mutable arguments (list, dict) - function CAN modify the original - be careful or copy
- Use `from typing import Optional, List, Dict, Tuple` for complex type hints

---

## Homework

1. Add type hints to all functions in your function library
2. Research: What is `mypy`? How does it use type hints for static analysis?

---

[← Previous](./lesson-02-defining-calling-functions.md) | [Back to Course](./README.md) | [Next →](./lesson-04-return-values.md)
