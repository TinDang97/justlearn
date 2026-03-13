# Lesson 10: Course 6 Review & Mini Project

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Consolidate all OOP concepts from this course
- Apply encapsulation, inheritance, polymorphism together
- Build a complete OOP system from scratch
- Practice design before coding

---

## Prerequisites

- Lessons 1-9 of this course

---

## Lesson Outline

### Part 1: Course Review (30 minutes)

#### Key Concepts Recap

**OOP Fundamentals:**
```python
# Lesson 1-2: Classes, objects, attributes
class Animal:
    kingdom = "Animalia"           # Class attribute (shared)

    def __init__(self, name, age): # Instance initialization
        self.name = name           # Instance attribute (unique)
        self.age = age

# Lesson 3: __init__ with validation
class BankAccount:
    def __init__(self, owner, balance=0.0):
        if not owner.strip():
            raise ValueError("Owner cannot be empty")
        self.owner = owner.strip().title()
        self._balance = float(balance)   # Protected

# Lesson 4: Instance methods
    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self._balance += amount
        return self._balance

# Lesson 5: Class methods, static methods
    @classmethod
    def from_string(cls, data: str):  # "Alice:1000"
        owner, balance = data.split(":")
        return cls(owner, float(balance))

    @staticmethod
    def validate_amount(amount) -> bool:
        return isinstance(amount, (int, float)) and amount > 0

# Lesson 6: Encapsulation, properties
    @property
    def balance(self):
        return self._balance       # Read-only via property

# Lessons 7-8: Inheritance, super(), MRO
class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0.0, interest_rate=0.05):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate

    def apply_interest(self):
        interest = self._balance * self.interest_rate
        self._balance += interest
        return interest

# Lesson 9: Polymorphism, magic methods
    def __str__(self):
        return f"SavingsAccount({self.owner}: ${self._balance:.2f})"

    def __repr__(self):
        return f"SavingsAccount(owner={self.owner!r}, balance={self._balance})"
```

#### Design Principles Recap

1. **Single Responsibility**: Each class does one thing well
2. **Encapsulation**: Hide internal details, expose stable interface
3. **Inheritance**: IS-A relationships only
4. **Polymorphism**: Same interface, different behavior
5. **Composition over Inheritance**: HAS-A often better than IS-A

---

### Part 2: Mini Project Design (30 minutes)

#### Project: Library Management System

Design phase — before writing any code:

**Classes needed:**
1. `Book`: title, author, isbn, year, genre, available
2. `Member`: member_id, name, email, borrowed_books
3. `Library`: catalog, members, lending_records
4. `LendingRecord`: book, member, borrowed_date, due_date, returned_date

**Relationships:**
- `Library` HAS-A collection of `Book` objects (composition)
- `Library` HAS-A collection of `Member` objects (composition)
- `Member` HAS-A list of borrowed `Book` objects
- `LendingRecord` connects `Book` and `Member`

**Methods to implement:**
```
Library:
  + add_book(book)
  + register_member(member)
  + checkout(member_id, isbn) → LendingRecord
  + return_book(member_id, isbn)
  + search_by_title(query) → list[Book]
  + search_by_author(author) → list[Book]
  + get_overdue_books() → list[LendingRecord]
  + generate_report() → str

Member:
  + borrow(book) / return_book(book)
  + get_borrowing_history() → list
  + has_overdue_books() → bool

Book:
  + checkout() / return()
  + is_overdue() → bool
```

---

### Part 3: Mini Project Implementation (30 minutes)

#### Starter Code

```python
from datetime import date, timedelta
from typing import Optional


class Book:
    def __init__(self, title: str, author: str, isbn: str,
                 year: int, genre: str = "General"):
        self.title = title
        self.author = author
        self.isbn = isbn
        self.year = year
        self.genre = genre
        self._available = True

    @property
    def available(self) -> bool:
        return self._available

    def checkout(self):
        if not self._available:
            raise ValueError(f"'{self.title}' is already checked out")
        self._available = False

    def return_book(self):
        self._available = True

    def __str__(self) -> str:
        status = "Available" if self._available else "Checked out"
        return f"'{self.title}' by {self.author} [{status}]"

    def __repr__(self) -> str:
        return f"Book(title={self.title!r}, author={self.author!r}, isbn={self.isbn!r})"

    def __eq__(self, other) -> bool:
        if isinstance(other, Book):
            return self.isbn == other.isbn
        return NotImplemented

    def __hash__(self):
        return hash(self.isbn)


class Member:
    _member_counter = 0

    def __init__(self, name: str, email: str):
        Member._member_counter += 1
        self.member_id = f"MEM{Member._member_counter:04d}"
        self.name = name
        self.email = email
        self._borrowed: list[Book] = []

    @property
    def borrowed_count(self) -> int:
        return len(self._borrowed)

    def borrow(self, book: Book):
        self._borrowed.append(book)

    def return_book(self, book: Book):
        self._borrowed.remove(book)

    def __str__(self) -> str:
        return f"Member({self.member_id}: {self.name}, {self.borrowed_count} books)"


class LendingRecord:
    LOAN_DAYS = 14

    def __init__(self, book: Book, member: Member):
        self.book = book
        self.member = member
        self.borrowed_date = date.today()
        self.due_date = self.borrowed_date + timedelta(days=self.LOAN_DAYS)
        self.returned_date: Optional[date] = None

    @property
    def is_returned(self) -> bool:
        return self.returned_date is not None

    @property
    def is_overdue(self) -> bool:
        if self.is_returned:
            return False
        return date.today() > self.due_date

    def complete_return(self):
        self.returned_date = date.today()

    def __str__(self) -> str:
        status = "Returned" if self.is_returned else ("OVERDUE" if self.is_overdue else "Active")
        return f"{self.member.name} → '{self.book.title}' [{status}]"


class Library:
    def __init__(self, name: str):
        self.name = name
        self._books: dict[str, Book] = {}      # isbn → Book
        self._members: dict[str, Member] = {}  # member_id → Member
        self._records: list[LendingRecord] = []

    def add_book(self, book: Book):
        self._books[book.isbn] = book

    def register_member(self, member: Member):
        self._members[member.member_id] = member

    def checkout(self, member_id: str, isbn: str) -> LendingRecord:
        if member_id not in self._members:
            raise ValueError(f"Member {member_id} not found")
        if isbn not in self._books:
            raise ValueError(f"Book {isbn} not found")

        book = self._books[isbn]
        member = self._members[member_id]

        book.checkout()   # Will raise if unavailable
        member.borrow(book)

        record = LendingRecord(book, member)
        self._records.append(record)
        return record

    def return_book(self, member_id: str, isbn: str):
        book = self._books.get(isbn)
        member = self._members.get(member_id)

        # Find active lending record:
        record = next(
            (r for r in self._records
             if r.book.isbn == isbn and r.member.member_id == member_id
             and not r.is_returned),
            None
        )
        if not record:
            raise ValueError("No active loan found")

        record.complete_return()
        book.return_book()
        member.return_book(book)

    def search_by_title(self, query: str) -> list[Book]:
        q = query.lower()
        return [b for b in self._books.values() if q in b.title.lower()]

    def get_overdue_books(self) -> list[LendingRecord]:
        return [r for r in self._records if r.is_overdue]

    def generate_report(self) -> str:
        total = len(self._books)
        available = sum(1 for b in self._books.values() if b.available)
        overdue = len(self.get_overdue_books())
        return (f"=== {self.name} Report ===\n"
                f"Books: {total} total, {available} available\n"
                f"Members: {len(self._members)}\n"
                f"Overdue: {overdue}")
```

---

### Part 4: Testing and Extension (30 minutes)

#### Test Your System

```python
# Create library
lib = Library("City Public Library")

# Add books
books = [
    Book("Clean Code", "Robert Martin", "978-0132350884", 2008, "Programming"),
    Book("Python Crash Course", "Eric Matthes", "978-1593276034", 2015, "Programming"),
    Book("The Pragmatic Programmer", "Hunt & Thomas", "978-0201616224", 1999, "Programming"),
]
for book in books:
    lib.add_book(book)

# Register members
alice = Member("Alice Smith", "alice@example.com")
bob = Member("Bob Jones", "bob@example.com")
lib.register_member(alice)
lib.register_member(bob)

# Checkout books
record1 = lib.checkout(alice.member_id, "978-0132350884")
print(f"Checked out: {record1}")

record2 = lib.checkout(bob.member_id, "978-1593276034")

# Search
results = lib.search_by_title("python")
print(f"Search 'python': {results}")

# Generate report
print(lib.generate_report())

# Return
lib.return_book(alice.member_id, "978-0132350884")
print(lib.generate_report())
```

#### Extension Challenges

1. Add `Librarian` class that extends `Member` with admin capabilities
2. Implement `__iter__` on `Library` to iterate all books
3. Add `ReservationQueue` for books that are checked out
4. Implement `__len__` on Library to return book count
5. Add `fine_amount` property on `LendingRecord` (e.g., $0.25/day overdue)

---

## Course Summary

You've completed Course 6: Object-Oriented Programming! Here's what you learned:

| Lesson | Topic | Key Skill |
|--------|-------|-----------|
| 1 | OOP Concepts | Why OOP, 4 pillars |
| 2 | Classes & Objects | Define classes, create instances |
| 3 | `__init__` & `self` | Initialize object state |
| 4 | Instance Methods | Methods that operate on `self` |
| 5 | Class vs Instance Attrs | Class-level vs instance-level data |
| 6 | Encapsulation | Properties, validation, `_`/`__` attrs |
| 7 | Inheritance | IS-A relationships, `super()` |
| 8 | Method Overriding | Override + extend parent methods |
| 9 | Polymorphism & Magic | Duck typing, dunder methods |
| 10 | Mini Project | Complete system design + build |

---

## Next Course

**Course 7: File Handling & Exceptions** — reading/writing files, exception handling, context managers, working with CSV, JSON, and other formats.

---

[← Previous](./lesson-09-polymorphism-magic-methods.md) | [Back to Course](./README.md)
