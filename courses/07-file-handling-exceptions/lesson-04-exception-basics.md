# Lesson 4: Exception Basics

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand Python's exception hierarchy
- Use try/except to handle errors
- Catch specific exception types
- Understand when exceptions occur vs when to prevent them

---

## Lesson Outline

### Part 1: Try/Except (30 minutes)

#### Explanation

```python
# Without exception handling:
number = int(input("Enter a number: "))   # Crashes if user types "abc"

# With exception handling:
try:
    number = int(input("Enter a number: "))
    result = 10 / number
    print(f"Result: {result}")
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("Can't divide by zero!")

# Catching multiple exceptions:
try:
    value = int(input("Enter: "))
except (ValueError, TypeError) as e:
    print(f"Input error: {e}")

# Catching all exceptions (use sparingly!):
try:
    risky_operation()
except Exception as e:
    print(f"Something went wrong: {type(e).__name__}: {e}")
```

**Python exception hierarchy (key ones):**
```
BaseException
├── SystemExit
├── KeyboardInterrupt
└── Exception
    ├── ValueError       - wrong value type (int("abc"))
    ├── TypeError        - wrong type (1 + "a")
    ├── KeyError         - dict key missing (d["x"] when "x" not in d)
    ├── IndexError       - list index out of range
    ├── AttributeError   - attribute doesn't exist
    ├── FileNotFoundError - file doesn't exist
    ├── PermissionError  - can't access file
    ├── ZeroDivisionError - divided by zero
    ├── ImportError      - can't import module
    └── RuntimeError     - general runtime error
```

#### Practice

Write a function `safe_divide(a, b)` that returns the result or an appropriate error message.

---

### Part 2: else and finally (30 minutes)

#### Explanation

```python
try:
    result = 10 / int(input("Divisor: "))
except ValueError:
    print("Not a number")
except ZeroDivisionError:
    print("Cannot divide by zero")
else:
    # Runs ONLY if no exception occurred:
    print(f"Result: {result}")
finally:
    # Runs ALWAYS - exception or not:
    print("Calculation attempt complete")

# Practical example - file operations:
def read_config(filepath: str) -> dict | None:
    try:
        with open(filepath, encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Config file not found: {filepath}")
        return None
    except PermissionError:
        print(f"No permission to read: {filepath}")
        return None
    else:
        # Only parse if file was successfully read:
        return parse_config(content)
    finally:
        print(f"Config load attempt for {filepath}")
```

#### Practice

Write a function that opens a file, reads it, and uses all four clauses: `try`, `except`, `else`, `finally`.

---

### Part 3: Exception Information (30 minutes)

#### Explanation

```python
import traceback

try:
    result = 1 / 0
except ZeroDivisionError as e:
    print(type(e).__name__)   # ZeroDivisionError
    print(str(e))             # division by zero
    print(repr(e))            # ZeroDivisionError('division by zero')
    print(e.args)             # ('division by zero',)

# Get full traceback as string:
try:
    int("bad")
except ValueError:
    error_text = traceback.format_exc()
    print(error_text)   # Full traceback


# Checking exception type:
def handle_file_error(e: Exception, filepath: str):
    if isinstance(e, FileNotFoundError):
        return f"File not found: {filepath}"
    elif isinstance(e, PermissionError):
        return f"Permission denied: {filepath}"
    else:
        return f"Unexpected error: {e}"
```

#### Practice

Write a `safe_json_load(filepath)` function that catches `FileNotFoundError`, `json.JSONDecodeError`, and returns appropriate error messages for each.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Robust Number Input

Write a function `get_integer(prompt, min_val=None, max_val=None)` that:
- Keeps asking until valid input is given
- Handles ValueError for non-numeric input
- Validates range if min/max provided
- Handles KeyboardInterrupt gracefully

#### Exercise 2: File Reading with Fallback

Write `read_with_fallback(primary_path, backup_path, default)`:
- Try to read primary file
- If FileNotFoundError, try backup file
- If both fail, return default value
- Log which source was used

---

## Key Takeaways

- `except ExceptionType as e` catches specific exceptions
- `else` runs only if no exception occurred
- `finally` always runs (cleanup code goes here)
- Catch specific exceptions, not bare `except:` or `except Exception:` in general
- `e.args`, `str(e)`, `type(e).__name__` give you exception details

---

[← Previous](./lesson-03-context-managers.md) | [Back to Course](./README.md) | [Next →](./lesson-05-exception-handling-patterns.md)
