# Lesson 5: Exception Handling Patterns

**Course:** File Handling & Exceptions | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Raise exceptions with descriptive messages
- Create custom exception classes
- Chain exceptions with `raise from`
- Apply best practices for exception handling

---

## Lesson Outline

### Part 1: Raising Exceptions (30 minutes)

#### Explanation

```python
# raise an exception:
def set_age(age: int):
    if not isinstance(age, int):
        raise TypeError(f"Age must be int, got {type(age).__name__}")
    if age < 0 or age > 150:
        raise ValueError(f"Age must be 0-150, got {age}")
    return age

# Re-raise current exception:
try:
    result = risky_operation()
except ValueError as e:
    log_error(e)
    raise   # Re-raises the same exception unchanged

# Raise different exception:
try:
    data = json.loads(raw_input)
except json.JSONDecodeError as e:
    raise ValueError(f"Invalid JSON input: {e}") from e  # Chain exceptions
```

#### Practice

Write `validate_email(email)` that raises `ValueError` with descriptive messages for invalid emails.

---

### Part 2: Custom Exceptions (30 minutes)

#### Explanation

```python
# Base custom exception:
class AppError(Exception):
    """Base class for all application errors."""
    pass

class ValidationError(AppError):
    """Raised when input validation fails."""
    def __init__(self, field: str, value, message: str):
        self.field = field
        self.value = value
        self.message = message
        super().__init__(f"Validation failed for '{field}': {message} (got {value!r})")

class DatabaseError(AppError):
    """Raised for database operation failures."""
    def __init__(self, operation: str, detail: str):
        self.operation = operation
        super().__init__(f"Database {operation} failed: {detail}")

class NotFoundError(AppError):
    """Raised when a resource is not found."""
    def __init__(self, resource: str, identifier):
        self.resource = resource
        self.identifier = identifier
        super().__init__(f"{resource} not found: {identifier!r}")


# Usage:
try:
    raise ValidationError("email", "not-an-email", "must contain @")
except ValidationError as e:
    print(e.field)    # email
    print(str(e))     # Validation failed for 'email': must contain @ (got 'not-an-email')
```

#### Practice

Create a custom exception hierarchy for a banking application: `BankError`, `InsufficientFundsError`, `AccountFrozenError`, `InvalidAmountError`.

---

### Part 3: Exception Chaining and Patterns (30 minutes)

#### Explanation

```python
# Exception chaining - preserve original cause:
def load_user(user_id: int):
    try:
        with open(f"users/{user_id}.json") as f:
            import json
            return json.load(f)
    except FileNotFoundError as e:
        raise NotFoundError("User", user_id) from e   # Chain!
    except json.JSONDecodeError as e:
        raise DatabaseError("load", f"corrupted user {user_id}") from e


# LBYL (Look Before You Leap) vs EAFP (Easier to Ask Forgiveness):
import os

# LBYL style (check first):
if os.path.exists("file.txt"):
    with open("file.txt") as f:
        data = f.read()
else:
    data = None

# EAFP style (Python-preferred):
try:
    with open("file.txt") as f:
        data = f.read()
except FileNotFoundError:
    data = None


# Global error handler pattern:
def run_safely(func, *args, default=None, **kwargs):
    """Run function, return default on any error."""
    try:
        return func(*args, **kwargs)
    except Exception as e:
        print(f"Error in {func.__name__}: {e}")
        return default

result = run_safely(int, "abc", default=0)  # Returns 0
```

#### Practice

Refactor a function that reads, parses, and validates a config file to use proper exception chaining throughout.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Data Validator

Create a `DataValidator` class with methods that raise custom exceptions:
- `validate_age(value)` → `ValidationError` if not 0-150
- `validate_email(value)` → `ValidationError` if no @ or domain
- `validate_username(value)` → `ValidationError` if not 3-20 alphanumeric chars
- `validate_all(data: dict)` → validates multiple fields, collects all errors

#### Exercise 2: Retry Decorator

```python
import time
import functools

def retry(max_attempts=3, exceptions=(Exception,), delay=1.0):
    """Retry a function on failure."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

@retry(max_attempts=3, exceptions=(ConnectionError,), delay=0.5)
def fetch_data(url: str):
    ...  # Implement
```

---

## Key Takeaways

- `raise ExceptionType("message")` for intentional errors
- Custom exceptions inherit from `Exception` (or your base class)
- `raise NewError(...) from original_error` preserves the original cause
- EAFP (try/except) is the Python-preferred style
- Custom exceptions should have meaningful attributes, not just messages

---

[← Previous](./lesson-04-exception-basics.md) | [Back to Course](./README.md) | [Next →](./lesson-06-working-with-csv.md)
