# Lesson 5: Class vs Instance Attributes

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Distinguish clearly between class and instance attributes
- Use class methods and static methods appropriately
- Apply class attributes for shared state and constants
- Avoid common class-vs-instance attribute bugs

---

## Prerequisites

- Lessons 1-4 of this course

---

## Lesson Outline

### Part 1: Class vs Instance Attributes Deep Dive (30 minutes)

#### Explanation

```python
class BankAccount:
    # Class attributes - shared by ALL instances
    bank_name = "Python National Bank"
    interest_rate = 0.045
    total_accounts = 0     # Track all created accounts

    def __init__(self, owner, balance):
        # Instance attributes - unique to THIS instance
        self.owner = owner
        self.balance = balance
        self.account_number = BankAccount.total_accounts + 1
        BankAccount.total_accounts += 1   # Update class attribute

# Testing:
acc1 = BankAccount("Alice", 1000)
acc2 = BankAccount("Bob", 2000)

print(BankAccount.bank_name)    # Python National Bank (class access)
print(acc1.bank_name)           # Python National Bank (instance access - inherited)
print(BankAccount.total_accounts)  # 2

# Danger: don't modify mutable class attributes via instance!
class Bad:
    shared_list = []   # This list is shared by ALL instances!

b1 = Bad()
b2 = Bad()
b1.shared_list.append(1)   # Modifies the CLASS attribute!
print(b2.shared_list)       # [1] - surprise!

# Better: create instance attribute in __init__:
class Good:
    def __init__(self):
        self.my_list = []  # Each instance gets its own list
```

#### Practice

Design a `Student` class where: `school_name` is a class attribute, and `name, id, grades` are instance attributes.

---

### Part 2: Class Methods and Static Methods (30 minutes)

#### Explanation

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    # Instance method - operates on specific instance
    def is_leap_year(self):
        return self.year % 4 == 0 and (self.year % 100 != 0 or self.year % 400 == 0)

    # Class method - operates on the class itself
    @classmethod
    def today(cls):
        """Create a Date from today's date."""
        from datetime import date
        d = date.today()
        return cls(d.year, d.month, d.day)   # Creates new instance!

    @classmethod
    def from_string(cls, date_string):
        """Create Date from 'YYYY-MM-DD' string."""
        year, month, day = map(int, date_string.split("-"))
        return cls(year, month, day)

    # Static method - no access to instance OR class
    @staticmethod
    def is_valid_date(year, month, day):
        """Check if date values are valid."""
        return 1 <= month <= 12 and 1 <= day <= 31

# Usage:
d1 = Date(2024, 1, 15)
d2 = Date.today()                 # Class method - factory
d3 = Date.from_string("2024-06-15")
valid = Date.is_valid_date(2024, 13, 1)   # Static - no instance needed
```

**When to use each:**
- **Instance method**: needs `self.attribute` access
- **Class method**: needs `cls` to create instances, or modifies class state
- **Static method**: logically belongs to class but doesn't need class or instance data

#### Practice

Add classmethod constructors and static validators to your `BankAccount` class.

---

### Part 3: Common Patterns (30 minutes)

#### Explanation

**Singleton pattern (using class attribute):**
```python
class AppSettings:
    _instance = None  # Class attribute - holds single instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.theme = "light"
        self.language = "en"

# Always returns same instance:
s1 = AppSettings()
s2 = AppSettings()
print(s1 is s2)   # True - same object!
```

**Registry pattern:**
```python
class Plugin:
    _registry = {}   # Class attribute - stores all registered plugins

    @classmethod
    def register(cls, name):
        def decorator(plugin_class):
            cls._registry[name] = plugin_class
            return plugin_class
        return decorator

    @classmethod
    def get(cls, name):
        return cls._registry.get(name)
```

#### Practice

Build a `Currency` class with class-level exchange rates and factory methods to create currencies from different formats.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Library Catalog

```python
class Book:
    total_books = 0    # Class attribute
    # genres: class attribute dict with genre counts

    def __init__(self, title, author, genre, year):
        ...

    @classmethod
    def from_isbn_data(cls, isbn_string):
        """Parse 'ISBN|title|author|genre|year' format."""
        ...

    @staticmethod
    def is_valid_year(year):
        ...
```

#### Exercise 2: School System

Create `School` class with:
- Class attribute tracking all students
- Class method to get students by grade
- Static method to validate student ID format
- Instance method to enroll/unenroll students

#### Bonus Challenge

**`__init_subclass__`**: Look up this hook that gets called when a class is subclassed. Use it to auto-register all subclasses of a base `Animal` class.

---

## Key Takeaways

- **Class attributes**: shared by all instances; defined at class level
- **Instance attributes**: unique per instance; defined in `__init__` with `self.`
- `@classmethod`: receives `cls`, can create instances (factory pattern)
- `@staticmethod`: no access to instance or class; pure utility function
- NEVER use mutable class attributes (lists, dicts) unless you want sharing!

---

## Homework

1. Build a `ProductInventory` class with class-level catalog and instance-level cart
2. Research: What is `__slots__`? How does it prevent accidental attribute creation?

---

[← Previous](./lesson-04-instance-methods.md) | [Back to Course](./README.md) | [Next →](./lesson-06-encapsulation-properties.md)
