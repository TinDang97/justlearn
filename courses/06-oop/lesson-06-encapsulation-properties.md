# Lesson 6: Encapsulation & Properties

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand encapsulation and why it matters
- Use name mangling (`__attr`) for private attributes
- Create properties with `@property`, `@setter`, `@deleter`
- Validate data through property setters

---

## Prerequisites

- Lessons 1-5 of this course

---

## Lesson Outline

### Part 1: Encapsulation Concept (30 minutes)

#### Explanation

**Encapsulation** means bundling data and methods together AND controlling access to that data. The goal: internal implementation can change without breaking external code.

```python
# WITHOUT encapsulation - anyone can set invalid state:
class BankAccount:
    def __init__(self, balance):
        self.balance = balance

account = BankAccount(1000)
account.balance = -500   # Invalid! No protection!
print(account.balance)   # -500 - corrupt state

# WITH encapsulation - controlled access:
class BankAccount:
    def __init__(self, balance):
        self._balance = balance   # Convention: _ means "internal"

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Must be positive")
        self._balance += amount

    def get_balance(self):
        return self._balance

account = BankAccount(1000)
account.deposit(500)           # Use the method
print(account.get_balance())   # 1500
# account._balance = -500      # Still possible but signals "don't do this"
```

**Python's convention for access levels:**
```python
class Example:
    def __init__(self):
        self.public = "Anyone can access"
        self._protected = "Convention: don't access from outside"
        self.__private = "Name-mangled: harder to access"

obj = Example()
print(obj.public)        # Works fine
print(obj._protected)    # Works, but signals "be careful"
# print(obj.__private)   # AttributeError!
print(obj._Example__private)  # Works - name mangling is just renaming
```

> **Teacher's Note:** Python doesn't enforce truly private attributes like Java/C++ do. It relies on convention. The single underscore `_attr` means "please don't access this directly." The double underscore `__attr` creates name mangling to prevent accidental subclass collisions.

#### Practice

Create a `Person` class with `_name` and `_age` as protected attributes, and getter methods.

---

### Part 2: Properties (30 minutes)

#### Explanation

Properties let you use attribute-style access while running method logic behind the scenes:

```python
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius

    @property
    def celsius(self):
        """Get temperature in Celsius."""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """Set temperature with validation."""
        if value < -273.15:
            raise ValueError(f"Temperature below absolute zero: {value}")
        self._celsius = value

    @property
    def fahrenheit(self):
        """Computed property - no setter needed."""
        return self._celsius * 9/5 + 32

    @property
    def kelvin(self):
        return self._celsius + 273.15

# Using properties - looks like attribute access!
t = Temperature(25)
print(t.celsius)      # 25 (calls getter)
print(t.fahrenheit)   # 77.0 (computed)
print(t.kelvin)       # 298.15 (computed)

t.celsius = 100       # Calls setter with validation!
print(t.fahrenheit)   # 212.0

try:
    t.celsius = -300  # Raises ValueError
except ValueError as e:
    print(e)
```

**Property with deleter:**
```python
class CachedData:
    def __init__(self):
        self._cache = None

    @property
    def data(self):
        if self._cache is None:
            print("Computing data...")
            self._cache = [1, 2, 3]  # Simulate expensive computation
        return self._cache

    @data.deleter
    def data(self):
        """Clear the cache."""
        print("Clearing cache")
        self._cache = None

c = CachedData()
print(c.data)   # Computing data... [1, 2, 3]
print(c.data)   # [1, 2, 3] (cached, no recompute)
del c.data      # Clearing cache
print(c.data)   # Computing data... [1, 2, 3] (recomputed)
```

#### Practice

Add a `@property` for `age` to your `Person` class that validates age is between 0 and 150.

---

### Part 3: Practical Encapsulation (30 minutes)

#### Explanation

Real-world example: a complete `BankAccount` with proper encapsulation:

```python
class BankAccount:
    _interest_rate = 0.045  # Protected class attribute

    def __init__(self, owner: str, initial_balance: float = 0.0):
        if not owner.strip():
            raise ValueError("Owner cannot be empty")
        self._owner = owner.strip().title()
        self._balance = 0.0
        self._transactions = []
        if initial_balance > 0:
            self.deposit(initial_balance)

    @property
    def owner(self):
        return self._owner

    @property
    def balance(self):
        return self._balance

    @property
    def transaction_count(self):
        return len(self._transactions)

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError(f"Deposit must be positive, got {amount}")
        self._balance += amount
        self._transactions.append(("deposit", amount))
        return self._balance

    def withdraw(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError(f"Withdrawal must be positive, got {amount}")
        if amount > self._balance:
            raise ValueError(f"Insufficient funds: ${self._balance:.2f} available")
        self._balance -= amount
        self._transactions.append(("withdrawal", amount))
        return self._balance

    def __repr__(self):
        return f"BankAccount(owner={self._owner!r}, balance=${self._balance:.2f})"

# Using the encapsulated class:
acc = BankAccount("Alice", 1000)
acc.deposit(500)
print(acc.balance)    # 1500.0 (read via property - no setter!)
print(acc.owner)      # Alice

# acc.balance = 99999  # AttributeError - no setter defined!
# acc._balance = 99999 # Works but signals "don't do this"
```

**Read-only properties (no setter) prevent accidental mutation.**

#### Practice

Create a `Circle` class where `radius` has a setter with validation, and `area` and `circumference` are computed read-only properties.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Student Gradebook

```python
class Student:
    def __init__(self, name: str, student_id: str):
        ...

    @property
    def name(self): ...

    @property
    def gpa(self):
        """Computed from grades - read only."""
        ...

    def add_grade(self, subject: str, score: float):
        """Validate: 0-100, add to grades."""
        ...

    def get_transcript(self) -> str:
        """Formatted grade report."""
        ...
```

Requirements:
- `name` setter validates non-empty
- `gpa` is computed (read-only property)
- `add_grade` validates score 0-100
- Grades stored in `_grades` dict

#### Exercise 2: Product with Price

Create a `Product` class:
- `_price` attribute with property that validates > 0
- `_discount` attribute (0.0 to 0.5) with property validation
- `final_price` read-only computed property: `price * (1 - discount)`
- `apply_sale(percent)` method that sets discount

#### Bonus Challenge

**`__slots__`**: Add `__slots__ = ('_name', '_age')` to a class. What happens when you try to add a new attribute? Research why `__slots__` improves memory efficiency.

---

## Key Takeaways

- **Encapsulation**: bundle data + methods, control access through methods
- `_attr`: convention for "protected" - works but signals "don't touch"
- `__attr`: name-mangled to `_ClassName__attr` - harder to access
- `@property`: getter that looks like attribute access
- `@attr.setter`: setter with validation logic
- Read-only properties: define only `@property`, no setter

---

## Common Questions

**Q: Why not just use getter/setter methods like Java?**
A: Python properties give you the best of both worlds - clean attribute syntax externally, with method logic internally. You can start with `self.x = value` and later add a property without changing calling code.

**Q: Should I use `_` or `__` for private attributes?**
A: Use `_` for most cases. Use `__` only to prevent name collisions in subclasses (it's a specific tool for inheritance, not general privacy).

---

## Homework

1. Convert your `BankAccount` from Lesson 4 to use properties with validation
2. Research: What is the `@property` alternative using `property()` built-in function?

---

[← Previous](./lesson-05-class-vs-instance-attributes.md) | [Back to Course](./README.md) | [Next →](./lesson-07-inheritance.md)
