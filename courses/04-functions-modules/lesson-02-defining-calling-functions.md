# Lesson 2: Defining & Calling Functions

**Course:** Functions & Modules | **Duration:** 2 hours | **Level:** Beginner

---

## Learning Objectives

- Write complete function definitions with docstrings
- Understand void functions (those that don't return values)
- Trace function call stacks
- Build helper functions for code organization

---

## Prerequisites

- Lesson 1 of this course

---

## Lesson Outline

### Part 1: Complete Function Structure (30 minutes)

#### Explanation

A well-written function has: name, docstring, body, and (usually) a return value.

```python
def function_name(parameter1, parameter2):
    """
    One-line summary of what the function does.

    More details if needed (Args, Returns sections for complex functions).

    Args:
        parameter1: description and expected type
        parameter2: description and expected type

    Returns:
        description of return value
    """
    # Implementation
    result = parameter1 + parameter2
    return result
```

**Accessing docstrings:**
```python
def add(a, b):
    """Add two numbers and return their sum."""
    return a + b

print(add.__doc__)   # "Add two numbers and return their sum."
help(add)            # Nicely formatted help output
```

#### Examples

```python
def greet_user(first_name, last_name, formal=False):
    """
    Generate a greeting for a user.

    Args:
        first_name (str): User's first name
        last_name (str): User's last name
        formal (bool): Use formal greeting if True. Defaults to False.

    Returns:
        str: Formatted greeting message
    """
    full_name = f"{first_name} {last_name}"
    if formal:
        return f"Good day, {full_name}. How may I assist you?"
    else:
        return f"Hey {first_name}! What's up?"

# Various calls:
print(greet_user("Alice", "Johnson"))           # Informal
print(greet_user("Bob", "Smith", formal=True))  # Formal
```

#### Practice

Write a `validate_password(password)` function with a complete docstring that checks 4 criteria and returns a tuple of (bool, list_of_issues).

---

### Part 2: Void Functions (30 minutes)

#### Explanation

**Void functions** don't return a value - they perform an action (like printing) as a side effect.

```python
def print_header(title):
    """Display a formatted section header."""
    width = max(40, len(title) + 4)
    print("=" * width)
    print(f"  {title.upper()}")
    print("=" * width)

# Calling void function:
print_header("Student Results")
print_header("Monthly Report")

# Trying to use its "return value" gives None:
result = print_header("Test")
print(result)   # None
```

**When to use void vs returning functions:**
- Void: display output, write to file, modify global state
- Return: calculate a value, transform data, check a condition

#### Examples

```python
def display_receipt(items, tax_rate=0.08):
    """Print a formatted receipt to the console."""
    subtotal = sum(price for _, price in items)
    tax = subtotal * tax_rate
    total = subtotal + tax

    print("\n" + "=" * 35)
    print("          RECEIPT")
    print("=" * 35)
    for name, price in items:
        print(f"  {name:<25} ${price:.2f}")
    print("-" * 35)
    print(f"  {'Subtotal':<25} ${subtotal:.2f}")
    print(f"  {'Tax ({:.0%})':<25} ${tax:.2f}".format(tax_rate))
    print(f"  {'TOTAL':<25} ${total:.2f}")
    print("=" * 35)

# Usage:
cart = [("Coffee", 3.50), ("Sandwich", 8.99), ("Cookie", 2.25)]
display_receipt(cart)
display_receipt(cart, tax_rate=0.10)
```

#### Practice

Write 3 void functions for a school report system: `print_header()`, `print_student_row(name, grades)`, `print_footer(class_average)`.

---

### Part 3: Function Call Stack (30 minutes)

#### Explanation

When functions call other functions, Python maintains a "call stack" - a record of which functions are active:

```python
def main():
    result = calculate_total()
    display_result(result)

def calculate_total():
    items = get_items()
    return sum(items)

def get_items():
    return [10, 20, 30]

def display_result(total):
    print(f"Total: {total}")

main()

# Call stack at deepest point:
# main() → calculate_total() → get_items()
```

**Practical function decomposition:**
```python
# Top-down design: start with main function, decompose into helpers

def run_grade_report():
    """Main orchestrator function."""
    students = collect_grades()
    statistics = calculate_statistics(students)
    display_report(students, statistics)

def collect_grades():
    """Collect grades for all students."""
    students = []
    n = int(input("Number of students: "))
    for i in range(n):
        name = input(f"Student {i+1} name: ")
        grade = float(input(f"{name}'s grade: "))
        students.append((name, grade))
    return students

def calculate_statistics(students):
    """Calculate class statistics."""
    grades = [g for _, g in students]
    return {
        "average": sum(grades) / len(grades),
        "highest": max(grades),
        "lowest": min(grades),
    }

def display_report(students, stats):
    """Display formatted report."""
    print("\n=== GRADE REPORT ===")
    for name, grade in students:
        print(f"  {name:<20} {grade:.1f}")
    print(f"\nAverage: {stats['average']:.1f}")
    print(f"Highest: {stats['highest']:.1f}")
    print(f"Lowest:  {stats['lowest']:.1f}")

run_grade_report()
```

#### Practice

Design (don't implement fully) a program using at least 4 functions with a clear hierarchy. Draw the function call diagram first.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Text Formatter

Build a set of formatting functions:
- `center_text(text, width=50, fill='─')`
- `format_table_row(items, widths, align='left')`
- `print_box(title, content_lines)`

#### Exercise 2: Financial Utility Library

Write a file with 6 financial helper functions with docstrings:
- `calculate_simple_interest(principal, rate, time)`
- `calculate_compound_interest(principal, rate, time, n=12)`
- `monthly_payment(principal, annual_rate, years)`
- `future_value(present_value, rate, periods)`
- `present_value(future_value, rate, periods)`
- `break_even_units(fixed_costs, selling_price, variable_cost)`

#### Bonus Challenge

**Recursive function:** Write `factorial(n)` that calls itself. Then write `fibonacci(n)`. Understand the call stack for small values.

---

## Key Takeaways

- Always include docstrings for non-trivial functions
- **Void functions** return None - don't try to capture their return value
- Break complex programs into small, focused functions (single responsibility)
- The call stack tracks active function calls

---

## Homework

1. Write a "text formatting library" with 8 functions all with docstrings
2. Access the docstrings using `help()` to verify they're useful

---

[← Previous](./lesson-01-what-are-functions.md) | [Back to Course](./README.md) | [Next →](./lesson-03-parameters-and-arguments.md)
