# Lesson 9: Creating & Importing Modules

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Create custom Python modules (`.py` files)
- Import modules using various `import` styles
- Understand the `__name__ == "__main__"` pattern
- Use pip to install third-party packages
- Organize code across multiple files

---

## Prerequisites

- Lessons 1-8 of this course

---

## Lesson Outline

### Part 1: Creating and Using Modules (30 minutes)

#### Explanation

A **module** is simply a Python file (`.py`) that contains functions, variables, and classes. Any `.py` file is a module.

**Creating a module:**
```python
# File: math_utils.py
"""Math utility functions for common calculations."""

PI = 3.14159265358979

def circle_area(radius: float) -> float:
    """Calculate area of a circle."""
    return PI * radius ** 2

def factorial(n: int) -> int:
    """Calculate factorial of n."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def is_prime(n: int) -> bool:
    """Check if n is a prime number."""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
```

**Importing the module:**
```python
# Option 1: import the whole module
import math_utils

area = math_utils.circle_area(5)
print(area)

# Option 2: import specific items
from math_utils import circle_area, PI

area = circle_area(5)  # No prefix needed
print(PI)

# Option 3: import with alias
import math_utils as mu

area = mu.circle_area(5)

# Option 4: import everything (generally avoid this)
from math_utils import *  # Can cause name conflicts!
```

#### Examples

```python
# file: string_tools.py
"""String utility functions."""

def count_vowels(text: str) -> int:
    return sum(1 for c in text.lower() if c in "aeiou")

def word_frequency(text: str) -> dict:
    words = text.lower().split()
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return freq

def reverse_words(text: str) -> str:
    return " ".join(reversed(text.split()))

def is_palindrome(text: str) -> bool:
    clean = "".join(c.lower() for c in text if c.isalnum())
    return clean == clean[::-1]
```

```python
# file: main.py
from string_tools import count_vowels, is_palindrome, word_frequency

text = "Python is amazing and Python is fun"
print(f"Vowels: {count_vowels(text)}")
print(f"'racecar' palindrome: {is_palindrome('racecar')}")
print(f"Word frequency: {word_frequency(text)}")
```

#### Practice

Create a `geometry.py` module with 6 geometry functions. Import and use them in a separate `main.py`.

---

### Part 2: The `__name__` Pattern (30 minutes)

#### Explanation

When Python runs a file, it sets `__name__`:
- If file is run directly: `__name__ == "__main__"`
- If file is imported: `__name__ == "the_module_name"`

This lets you write code that runs when executed directly but NOT when imported:

```python
# file: math_utils.py

def circle_area(radius):
    return 3.14159 * radius ** 2

def factorial(n):
    if n <= 1: return 1
    return n * factorial(n - 1)

# This only runs when math_utils.py is executed directly
# NOT when it's imported from another file
if __name__ == "__main__":
    print("Testing math_utils module:")
    print(f"circle_area(5) = {circle_area(5):.2f}")
    print(f"factorial(10) = {factorial(10)}")
    print("All tests passed!")
```

This is the standard pattern for making modules testable while also importable.

#### Examples

```python
# A module with self-tests:
# file: validators.py

def is_valid_email(email: str) -> bool:
    return "@" in email and "." in email.split("@")[-1]

def is_valid_phone(phone: str) -> bool:
    digits = "".join(c for c in phone if c.isdigit())
    return 10 <= len(digits) <= 15

def is_valid_age(age) -> bool:
    try:
        return 0 < int(age) < 150
    except (ValueError, TypeError):
        return False

if __name__ == "__main__":
    # Test cases run only when file is executed directly
    assert is_valid_email("alice@example.com") == True
    assert is_valid_email("not-an-email") == False
    assert is_valid_phone("(555) 123-4567") == True
    assert is_valid_age("25") == True
    assert is_valid_age("abc") == False
    print("All validator tests passed!")
```

#### Practice

Add `if __name__ == "__main__"` test blocks to all modules you've created.

---

### Part 3: Packages and pip (30 minutes)

#### Explanation

**Packages** are directories of modules. A package directory must contain `__init__.py`.

```
my_project/
├── main.py
├── utils/               ← This is a package
│   ├── __init__.py      ← Makes it a package
│   ├── math_tools.py
│   └── string_tools.py
└── tests/
    └── test_utils.py
```

**Importing from packages:**
```python
import utils.math_tools
from utils.string_tools import count_vowels
from utils import math_tools
```

**Installing third-party packages with pip:**
```bash
# Install a package
pip install requests

# Install specific version
pip install requests==2.28.0

# List installed packages
pip list

# Save requirements
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt
```

**Popular packages to know:**
```python
import requests       # HTTP requests (pip install requests)
import numpy          # Numerical computing (pip install numpy)
import pandas         # Data analysis (pip install pandas)
import flask          # Web framework (pip install flask)
import pillow         # Image processing (pip install pillow)
import rich           # Beautiful terminal output (pip install rich)
```

#### Examples

```python
# Using requests (after pip install requests):
import requests

response = requests.get("https://api.github.com/users/python")
if response.status_code == 200:
    data = response.json()
    print(f"Python org has {data.get('public_repos')} repos")
```

#### Practice

Create a virtual environment, install `requests`, and fetch data from a public API.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Personal Module Library

Create a package `my_toolkit/` with three modules:
- `string_tools.py` (5+ functions)
- `math_tools.py` (5+ functions)
- `format_tools.py` (5+ functions)
- `__init__.py` that imports the most useful functions

#### Exercise 2: Module with Self-Tests

Create a `unit_converter.py` module:
- 12+ conversion functions (temperature, length, weight, volume, speed)
- A `if __name__ == "__main__":` block that tests every function

#### Bonus Challenge

**Build a CLI tool:** Create a command-line calculator that imports your math_tools module and accepts arguments:
```bash
python calculator.py 5 + 3
python calculator.py 10 * 4 - 2
```

---

## Key Takeaways

- Any `.py` file is a module; any directory with `__init__.py` is a package
- Import styles: `import module`, `from module import func`, `import module as alias`
- `if __name__ == "__main__":` - code that only runs when directly executed
- `pip install package_name` - install third-party packages
- Use virtual environments (`python -m venv env`) to isolate project dependencies

---

## Common Mistakes to Avoid

- **Circular imports**: A imports B imports A → error. Restructure to avoid cycles
- **`from module import *`**: can shadow existing names without warning
- **Installing globally**: always use virtual environments for projects

---

## Homework

1. Create a complete `student_tools.py` module and a `main.py` that imports and uses it
2. Install 3 third-party packages and explore their basic usage

---

[← Previous](./lesson-08-builtin-functions-tour.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)
