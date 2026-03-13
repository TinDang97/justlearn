# Lesson 4: Instance Methods

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Define instance methods that operate on the object's data
- Call methods on instances
- Write methods that modify state, return values, and call other methods
- Apply the single responsibility principle to methods

---

## Prerequisites

- Lessons 1-3 of this course

---

## Lesson Outline

### Part 1: Defining and Calling Methods (30 minutes)

#### Explanation

An **instance method** is a function defined inside a class that operates on the instance (via `self`).

```python
class BankAccount:
    def __init__(self, owner, balance=0.0):
        self.owner = owner
        self.balance = balance
        self.transactions = []

    def deposit(self, amount):
        """Add money to the account."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.balance += amount
        self.transactions.append(("deposit", amount))
        return self.balance   # Return new balance

    def withdraw(self, amount):
        """Remove money from the account."""
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.balance:
            raise ValueError(f"Insufficient funds. Balance: ${self.balance:.2f}")
        self.balance -= amount
        self.transactions.append(("withdrawal", amount))
        return self.balance

    def get_balance(self):
        """Return current balance."""
        return self.balance

    def display_statement(self):
        """Print account statement."""
        print(f"\n=== Account Statement for {self.owner} ===")
        for tx_type, amount in self.transactions:
            print(f"  {tx_type.title():<15}: ${amount:.2f}")
        print(f"  {'Balance':<15}: ${self.balance:.2f}")

# Using the class:
account = BankAccount("Alice", 1000.00)
account.deposit(500)
account.withdraw(200)
account.display_statement()
```

#### Examples

```python
class Student:
    def __init__(self, name, student_id):
        self.name = name
        self.student_id = student_id
        self.grades = {}   # {subject: list of grades}

    def add_grade(self, subject, grade):
        """Add a grade for a subject."""
        if subject not in self.grades:
            self.grades[subject] = []
        self.grades[subject].append(grade)

    def get_subject_average(self, subject):
        """Get average grade for a specific subject."""
        if subject not in self.grades or not self.grades[subject]:
            return None
        return sum(self.grades[subject]) / len(self.grades[subject])

    def get_overall_gpa(self):
        """Calculate overall GPA."""
        all_grades = [g for grades in self.grades.values() for g in grades]
        if not all_grades:
            return 0.0
        return sum(all_grades) / len(all_grades)

    def is_honor_roll(self):
        """Check if student qualifies for honor roll."""
        return self.get_overall_gpa() >= 3.7

# Usage:
alice = Student("Alice", "STU001")
alice.add_grade("Math", 92)
alice.add_grade("Math", 88)
alice.add_grade("Python", 95)
print(f"GPA: {alice.get_overall_gpa():.2f}")
print(f"Honor roll: {alice.is_honor_roll()}")
```

#### Practice

Add 3 methods to your `Book` class: `checkout(borrower_name)`, `return_book()`, `get_status()`.

---

### Part 2: Methods Calling Other Methods (30 minutes)

#### Explanation

Methods can call other methods of the same object using `self.method()`:

```python
class ShoppingCart:
    def __init__(self, customer):
        self.customer = customer
        self.items = []   # List of (product_name, price, qty)

    def add_item(self, name, price, qty=1):
        self.items.append((name, price, qty))

    def _calculate_subtotal(self):   # Internal helper (convention: _ prefix)
        return sum(price * qty for _, price, qty in self.items)

    def _calculate_tax(self, tax_rate=0.08):
        return self._calculate_subtotal() * tax_rate   # Call another method!

    def get_total(self):
        return self._calculate_subtotal() + self._calculate_tax()

    def checkout(self):
        """Display final bill."""
        print(f"\nReceipt for {self.customer}")
        print("─" * 35)
        for name, price, qty in self.items:
            print(f"  {name:<20} {qty}x ${price:.2f}")
        print("─" * 35)
        print(f"  Subtotal: ${self._calculate_subtotal():.2f}")
        print(f"  Tax:      ${self._calculate_tax():.2f}")
        print(f"  TOTAL:    ${self.get_total():.2f}")
```

#### Practice

Build a `ToDo` list class where `complete_task()` calls `update_statistics()`.

---

### Part 3: Method Return Values and Chaining (30 minutes)

#### Explanation

Methods can return anything - or return `self` to enable method chaining:

```python
class QueryBuilder:
    """Builds database queries with method chaining."""

    def __init__(self, table):
        self.table = table
        self.conditions = []
        self.order = None
        self.limit_val = None

    def where(self, condition):
        """Add a WHERE condition. Returns self for chaining."""
        self.conditions.append(condition)
        return self   # Return self enables chaining!

    def order_by(self, field):
        self.order = field
        return self

    def limit(self, n):
        self.limit_val = n
        return self

    def build(self):
        """Build and return the final query string."""
        query = f"SELECT * FROM {self.table}"
        if self.conditions:
            query += " WHERE " + " AND ".join(self.conditions)
        if self.order:
            query += f" ORDER BY {self.order}"
        if self.limit_val:
            query += f" LIMIT {self.limit_val}"
        return query

# Method chaining:
query = (QueryBuilder("students")
         .where("gpa > 3.5")
         .where("age < 25")
         .order_by("name")
         .limit(10)
         .build())
print(query)
```

#### Practice

Add method chaining to a `TextFormatter` class: bold, italic, underline, center, wrap methods.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Complete BankAccount

Finish the `BankAccount` class with:
- `deposit(amount)`, `withdraw(amount)` with validation
- `transfer(amount, target_account)` that uses withdraw + deposit
- `get_history()` returns formatted transaction history
- `apply_interest()` applies class-level interest rate

#### Exercise 2: RPG Character

```python
class Character:
    def __init__(self, name, character_class, hp=100):
        ...

    def attack(self, target):
        """Attack another character."""
        ...

    def heal(self, amount):
        ...

    def is_alive(self):
        ...

    def display_stats(self):
        ...
```

Build a simple 2-character combat simulation.

#### Bonus Challenge

**Method chaining game config:** Build a `GameConfig` class with chaining methods for setting difficulty, player name, level, etc. End chain with `start()`.

---

## Key Takeaways

- Instance methods always take `self` as first parameter
- Call other methods: `self.other_method()`
- Methods can modify state (`self.attribute += 1`)
- Methods can return values (including `self` for chaining)
- Convention: `_method()` prefix = internal/private method

---

## Homework

1. Build a `Playlist` class with methods: add_song, remove_song, shuffle, play_next, get_duration
2. Research: What is the Single Responsibility Principle? Apply it to your Playlist class.

---

[← Previous](./lesson-03-init-method-and-self.md) | [Back to Course](./README.md) | [Next →](./lesson-05-class-vs-instance-attributes.md)
