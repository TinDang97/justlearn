# Lesson 4: Return Values

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Use `return` to send values back to the caller
- Return multiple values using tuples
- Understand early returns and guard clauses
- Distinguish between side effects and return values

---

## Prerequisites

- Lessons 1-3 of this course

---

## Lesson Outline

### Part 1: The return Statement (30 minutes)

#### Explanation

`return` does two things: sends a value back to the caller AND immediately exits the function.

```python
def double(n):
    return n * 2   # Send result back and exit

result = double(5)
print(result)   # 10

# Without return, function returns None:
def greet(name):
    print(f"Hello, {name}!")
    # No return statement → implicitly returns None

x = greet("Alice")
print(x)   # None

# return can appear anywhere in the function (early return):
def absolute_value(n):
    if n < 0:
        return -n   # Exit early for negative
    return n        # Exit for positive
```

#### Examples

```python
def calculate_grade(score: float) -> tuple[str, str]:
    """Convert numeric score to letter grade and remarks."""
    if score >= 90:
        return "A", "Excellent!"
    elif score >= 80:
        return "B", "Good work!"
    elif score >= 70:
        return "C", "Satisfactory"
    elif score >= 60:
        return "D", "Needs improvement"
    else:
        return "F", "Please see instructor"

grade, remarks = calculate_grade(85)
print(f"Grade: {grade} - {remarks}")
```

#### Practice

Write `classify_bmi(weight_kg, height_m)` that returns a tuple of (bmi_value, category_string, advice_string).

---

### Part 2: Multiple Return Values (30 minutes)

#### Explanation

Python functions can return multiple values as a tuple:

```python
def divmod_custom(a, b):
    """Return both quotient and remainder."""
    quotient = a // b
    remainder = a % b
    return quotient, remainder   # Returns a tuple (quotient, remainder)

q, r = divmod_custom(17, 5)   # Tuple unpacking
print(f"17 ÷ 5 = {q} remainder {r}")   # 17 ÷ 5 = 3 remainder 2

# Can also use built-in divmod:
q, r = divmod(17, 5)
```

**Returning a dict for named values:**
```python
def analyze_text(text: str) -> dict:
    """Analyze text and return statistics."""
    words = text.split()
    return {
        "char_count": len(text),
        "word_count": len(words),
        "sentence_count": text.count(".") + text.count("!") + text.count("?"),
        "avg_word_length": sum(len(w) for w in words) / len(words) if words else 0,
        "unique_words": len(set(word.lower() for word in words)),
    }

stats = analyze_text("Python is great. I love Python!")
print(f"Words: {stats['word_count']}")
print(f"Unique: {stats['unique_words']}")
```

#### Examples

```python
# Practical: coordinate transformation
def polar_to_cartesian(r: float, theta: float) -> tuple[float, float]:
    """Convert polar coordinates to Cartesian."""
    import math
    x = r * math.cos(theta)
    y = r * math.sin(theta)
    return x, y

def min_max_avg(numbers: list) -> tuple[float, float, float]:
    """Return minimum, maximum, and average of a list."""
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

scores = [85, 92, 78, 95, 88]
low, high, avg = min_max_avg(scores)
print(f"Range: {low}-{high}, Average: {avg:.1f}")
```

#### Practice

Write `parse_full_name(full_name)` that returns (first, middle_or_None, last) as a tuple.

---

### Part 3: Guard Clauses and Early Returns (30 minutes)

#### Explanation

**Guard clauses** validate input at the start of a function, returning early if invalid:

```python
# PYRAMID (bad):
def process_order(order_id, quantity, customer):
    if order_id is not None:
        if quantity > 0:
            if customer is not None:
                # Actual logic buried here
                process_it()

# GUARD CLAUSES (good - flat structure):
def process_order(order_id, quantity, customer):
    if order_id is None:
        return None, "Order ID required"
    if quantity <= 0:
        return None, "Quantity must be positive"
    if customer is None:
        return None, "Customer required"

    # Actual logic - clean and unindented
    return process_it(), "Success"
```

**None safety with early return:**
```python
def get_user_email(users: list, user_id: int) -> str | None:
    """Get email for user, or None if not found."""
    for user in users:
        if user["id"] == user_id:
            return user["email"]
    return None  # Not found

email = get_user_email(users, 42)
if email is None:
    print("User not found")
else:
    send_email(email)
```

#### Practice

Refactor a previous "deeply nested" function using guard clauses.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Statistical Calculator

Write a `statistics(numbers)` function that returns a dict with:
mean, median, mode, variance, std_deviation, range, count

#### Exercise 2: Input Parser

Write `parse_date(date_string)` that:
- Accepts formats: "2024-01-15", "01/15/2024", "January 15, 2024"
- Returns (year, month, day) tuple
- Returns (None, None, None) with error message for invalid input

#### Bonus Challenge

**Multiple return with context:** Write a `safe_divide(a, b)` function that returns (result, None) on success and (None, error_message) on failure. Use this pattern throughout a mini calculator.

---

## Key Takeaways

- `return value` sends a value and exits the function
- `return a, b` returns a tuple - unpack with `a, b = func()`
- Functions without return give `None`
- **Guard clauses**: validate inputs at top, return early if invalid
- Return dicts for many named values, tuples for 2-3 positional values

---

## Homework

1. Build a `password_analyzer(password)` returning a dict with 8 security metrics
2. Research: What does `@functools.lru_cache` do and how does it relate to functions?

---

[← Previous](./lesson-03-parameters-and-arguments.md) | [Back to Course](./README.md) | [Next →](./lesson-05-default-keyword-arguments.md)
