# Lesson 5: Default & Keyword Arguments

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Define default parameter values
- Call functions using keyword arguments
- Use `*args` to accept any number of positional arguments
- Use `**kwargs` to accept any number of keyword arguments

---

## Prerequisites

- Lessons 1-4 of this course

---

## Lesson Outline

### Part 1: Default Parameter Values (30 minutes)

#### Explanation

Default values make parameters optional - if not provided, the default is used:

```python
def greet(name, greeting="Hello", punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

print(greet("Alice"))                      # Hello, Alice!
print(greet("Bob", "Hi"))                  # Hi, Bob!
print(greet("Carol", "Good morning", ".")) # Good morning, Carol.
```

**Rules for defaults:**
- Parameters with defaults must come AFTER parameters without defaults
- `def func(a, b=5):` ✓
- `def func(a=5, b):` ✗ SyntaxError

**Mutable default argument GOTCHA:**
```python
# DANGEROUS: mutable default
def add_to_list(item, my_list=[]):  # This list is created ONCE!
    my_list.append(item)
    return my_list

print(add_to_list(1))  # [1]
print(add_to_list(2))  # [1, 2] - not [2]! Shared list!

# SAFE: use None as default
def add_to_list_safe(item, my_list=None):
    if my_list is None:
        my_list = []  # New list each call
    my_list.append(item)
    return my_list
```

> **Teacher's Note:** The mutable default trap is a famous Python gotcha. Show it live - the "a-ha!" moment when students see the shared list is valuable.

#### Examples

```python
def format_price(amount: float, currency: str = "USD",
                 decimals: int = 2, show_symbol: bool = True) -> str:
    symbols = {"USD": "$", "EUR": "€", "GBP": "£"}
    symbol = symbols.get(currency, currency + " ")
    if show_symbol:
        return f"{symbol}{amount:,.{decimals}f}"
    return f"{amount:,.{decimals}f} {currency}"

print(format_price(1234.5))                      # $1,234.50
print(format_price(1234.5, "EUR"))               # €1,234.50
print(format_price(1234.5, "GBP", 0))           # £1,235
print(format_price(1234.5, show_symbol=False))   # 1,234.50 USD
```

#### Practice

Build `create_database_connection(host, port=5432, database="mydb", timeout=30, ssl=False)` with defaults.

---

### Part 2: Keyword Arguments (30 minutes)

#### Explanation

**Keyword arguments** let you call function parameters by name, in any order:

```python
def create_user(username, email, age, role="user"):
    pass

# Positional (order matters):
create_user("alice", "alice@example.com", 28, "admin")

# Keyword (order doesn't matter):
create_user(email="alice@example.com", username="alice", role="admin", age=28)

# Mix: positional first, then keyword:
create_user("alice", "alice@example.com", role="admin", age=28)
```

**Forcing keyword-only arguments:**
```python
def connect(host, port, *, timeout=30, ssl=False):
    # * means: everything after must be keyword
    pass

connect("localhost", 5432, timeout=60)         # OK
connect("localhost", 5432, ssl=True)           # OK
# connect("localhost", 5432, 60) → TypeError  # Can't pass timeout positionally
```

#### Examples

```python
def send_notification(user_id: int, message: str, *,
                       channel: str = "email",
                       priority: str = "normal",
                       retry: bool = True) -> dict:
    """
    Send notification to user.

    All options after * must be keyword arguments.
    """
    return {
        "user_id": user_id,
        "message": message,
        "channel": channel,
        "priority": priority,
        "retry": retry,
    }

# Clear, self-documenting calls:
notify = send_notification(42, "Your order shipped!",
                           channel="sms", priority="high")
```

#### Practice

Write a function where calling with positional args for optional params would be confusing, making keyword-only args the better choice.

---

### Part 3: `*args` and `**kwargs` (30 minutes)

#### Explanation

**`*args`** accepts any number of positional arguments as a tuple:
**`**kwargs`** accepts any number of keyword arguments as a dict:

```python
def sum_all(*numbers):
    """Sum any number of arguments."""
    return sum(numbers)

print(sum_all(1, 2, 3))          # 6
print(sum_all(10, 20, 30, 40))   # 100
print(sum_all(1))                 # 1

def print_settings(**settings):
    """Display key=value pairs."""
    for key, value in settings.items():
        print(f"  {key}: {value}")

print_settings(theme="dark", font_size=14, language="en")
# theme: dark
# font_size: 14
# language: en
```

**Combining all parameter types:**
```python
def versatile_function(required, optional="default", *args, **kwargs):
    print(f"Required: {required}")
    print(f"Optional: {optional}")
    print(f"Extra positional: {args}")
    print(f"Extra keyword: {kwargs}")

versatile_function("hello", "world", 1, 2, 3, x=10, y=20)
```

**Unpacking when calling:**
```python
def add(a, b, c):
    return a + b + c

numbers = [1, 2, 3]
print(add(*numbers))   # Unpack list → add(1, 2, 3)

settings = {"a": 1, "b": 2, "c": 3}
print(add(**settings)) # Unpack dict → add(a=1, b=2, c=3)
```

#### Practice

Write `format_record(*fields, separator=" | ", width=None)` that formats variable number of fields.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Flexible Logger

```python
def log(message, *tags, level="INFO", timestamp=True, prefix="[LOG]"):
    # Format: [LOG] [INFO] [tag1] [tag2] message  (with optional timestamp)
    pass

log("Server started", "startup", "server")
log("User login failed", "auth", "error", level="ERROR")
log("Cache hit", "performance", timestamp=False)
```

#### Exercise 2: Configuration Builder

Build a configuration system:
- `default_config()` returns base configuration dict
- `create_config(**overrides)` takes any keyword args and merges with defaults
- `validate_config(config)` checks required fields

#### Bonus Challenge

**Decorator preview:** Write a function `timer(func, *args, **kwargs)` that calls `func(*args, **kwargs)`, measures elapsed time, and returns the result along with timing info.

---

## Key Takeaways

- Default parameters: `def func(x, y=10):` - y is optional
- **Mutable defaults**: NEVER use `def func(items=[]):` - use `def func(items=None):`
- Keyword arguments: call with name `func(y=20, x=5)` - order doesn't matter
- `*args`: capture extra positional args as tuple
- `**kwargs`: capture extra keyword args as dict
- `*` in signature forces keyword-only for what follows

---

## Homework

1. Build a multi-mode print function with args/kwargs that handles tables, lists, and key-value pairs
2. Research: What is `functools.partial`? How does it relate to default arguments?

---

[← Previous](./lesson-04-return-values.md) | [Back to Course](./README.md) | [Next →](./lesson-06-variable-scope-legb.md)
