# Lesson 2: Reading Documentation

**Course:** Working with Libraries | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Navigate PyPI and official library documentation
- Read function signatures and docstrings
- Use `help()`, `dir()`, and `?` in interactive Python
- Find usage examples in source code and GitHub

---

## Lesson Outline

### Part 1: Python's Built-in Documentation (30 minutes)

#### Explanation

```python
# help() - full documentation in terminal:
help(str)
help(str.split)
help(list.sort)

# Specific function:
help(print)
# Output:
# print(value, ..., sep=' ', end='\n', file=sys.stdout, flush=False)

# dir() - list all attributes and methods:
dir(str)           # ['__add__', '__class__', ..., 'upper', 'zfill']
dir([])            # List methods

# __doc__ attribute - docstring:
print(str.split.__doc__)

# Type inspection:
import inspect
print(inspect.signature(sorted))    # (iterable, /, *, key=None, reverse=False)
print(inspect.getsource(sorted))    # Source code (if available)

# In Jupyter or IPython:
# str.split?   → shows docstring
# str.split??  → shows source code
```

#### Practice

Using only `help()` and `dir()`, discover 5 string methods you haven't used before. Test each one.

---

### Part 2: Reading Official Documentation (30 minutes)

#### Explanation

**Key documentation resources:**
- `docs.python.org` — Official Python docs
- `pypi.org/project/X` — Package info, links to docs
- `readthedocs.io` — Hosted documentation for many packages

**Reading a function signature:**
```python
# From requests docs:
requests.get(url, **kwargs)
requests.get(url, params=None, **kwargs)

# params keyword argument:
# GET https://api.example.com/search?q=python&limit=10
response = requests.get(
    "https://api.example.com/search",
    params={"q": "python", "limit": 10}
)

# Reading type annotations:
# str | None means the parameter can be str or None
# list[str] means a list of strings
# Optional[str] = None means optional, defaults to None
```

**How to find examples:**
1. Library docs → "Quick Start" or "Getting Started"
2. PyPI page → README
3. GitHub → `examples/` directory or test files
4. Stack Overflow (but verify the answer date)

#### Practice

Read the `requests` library documentation and implement 3 different types of API calls (GET with params, POST with JSON body, custom headers).

---

### Part 3: Source Code Reading (30 minutes)

#### Explanation

```python
# Find where a package is installed:
import requests
print(requests.__file__)    # /path/to/venv/lib/.../requests/__init__.py

# Open source location in VS Code:
# Right-click on import → "Go to Definition"

# Read source to understand behavior:
import inspect

class MyClass:
    def my_method(self):
        """This is the docstring."""
        return 42

print(inspect.getsource(MyClass.my_method))

# Module info:
import os
print(os.__version__ if hasattr(os, '__version__') else "built-in")
print(os.__file__)     # Location on disk

# Find what was changed in a version:
# PyPI page → "Release history" → click version → "Changelog"
```

#### Practice

Find the source code of `pathlib.Path.read_text()`. What does it do internally? What parameter does it rely on?

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Library Exploration

For the `collections` module (standard library):
1. Use `help(collections)` to see what's available
2. Pick `defaultdict`, `Counter`, and `deque`
3. Read their documentation
4. Write a practical example for each

#### Exercise 2: Unknown Library Challenge

Given only: `pip install tabulate` — with NO prior knowledge:
1. Read the PyPI page
2. Read the documentation
3. Write a script that prints a table of student data in 3 different formats

---

## Key Takeaways

- `help(obj)` shows full documentation in the terminal
- `dir(obj)` lists all attributes and methods
- Always start with official docs → Quick Start section
- Type annotations in signatures tell you expected types
- Reading library source code is a valid (and educational) practice

---

[← Previous](./lesson-01-pip-virtual-environments.md) | [Back to Course](./README.md) | [Next →](./lesson-03-requests-http.md)
