# Lesson 9: Polymorphism & Magic Methods

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Understand and apply polymorphism
- Use duck typing effectively
- Implement magic methods (`__str__`, `__repr__`, `__eq__`, `__len__`, etc.)
- Make custom objects work naturally with Python's built-ins

---

## Prerequisites

- Lessons 1-8 of this course

---

## Lesson Outline

### Part 1: Polymorphism (30 minutes)

#### Explanation

**Polymorphism** means "many forms" — the same operation works on different types. Python does this through:

1. **Inheritance-based polymorphism**: subclasses override parent methods
2. **Duck typing**: "If it walks like a duck and quacks like a duck, it's a duck"

```python
class Shape:
    def area(self) -> float:
        raise NotImplementedError

    def describe(self) -> str:
        return f"{self.__class__.__name__} with area {self.area():.2f}"


class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        import math
        return math.pi * self.radius ** 2


class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height


class Triangle(Shape):
    def __init__(self, base: float, height: float):
        self.base = base
        self.height = height

    def area(self) -> float:
        return 0.5 * self.base * self.height


# Polymorphism in action:
shapes = [Circle(5), Rectangle(4, 6), Triangle(3, 8)]

for shape in shapes:
    print(shape.describe())   # Same method, different results
# Circle with area 78.54
# Rectangle with area 24.00
# Triangle with area 12.00

total = sum(shape.area() for shape in shapes)
print(f"Total area: {total:.2f}")   # Works on all shapes!
```

**Duck typing — no inheritance required:**
```python
def make_sound(animal):
    """Works with ANY object that has a .speak() method."""
    return animal.speak()

class Dog:
    def speak(self): return "Woof!"

class Robot:
    def speak(self): return "BEEP BOOP"

class Baby:
    def speak(self): return "Waaaa!"

# All work! No inheritance, no shared base class needed:
for thing in [Dog(), Robot(), Baby()]:
    print(make_sound(thing))
```

> **Teacher's Note:** Python's polymorphism via duck typing is more flexible than Java's strict type-based approach. This is why Python functions often work with any "compatible" object. The `len()` function works on any object with `__len__`, regardless of its type.

#### Practice

Write a `total_cost(items)` function that works with any object having a `.price` attribute and `.quantity` attribute.

---

### Part 2: Magic Methods (30 minutes)

#### Explanation

**Magic methods** (dunder methods) let your objects work with Python's syntax:

```python
class Money:
    def __init__(self, amount: float, currency: str = "USD"):
        self.amount = round(amount, 2)
        self.currency = currency

    # String representations:
    def __str__(self) -> str:
        """Human-readable: for print() and str()."""
        return f"{self.currency} {self.amount:.2f}"

    def __repr__(self) -> str:
        """Developer-readable: for repr() and debugging."""
        return f"Money(amount={self.amount}, currency={self.currency!r})"

    # Comparison operators:
    def __eq__(self, other) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        return self.amount == other.amount and self.currency == other.currency

    def __lt__(self, other) -> bool:
        if not isinstance(other, Money):
            return NotImplemented
        if self.currency != other.currency:
            raise ValueError("Cannot compare different currencies")
        return self.amount < other.amount

    def __le__(self, other) -> bool:
        return self == other or self < other

    # Arithmetic operators:
    def __add__(self, other) -> "Money":
        if isinstance(other, Money):
            if self.currency != other.currency:
                raise ValueError("Cannot add different currencies")
            return Money(self.amount + other.amount, self.currency)
        return Money(self.amount + other, self.currency)

    def __mul__(self, factor) -> "Money":
        return Money(self.amount * factor, self.currency)

    def __rmul__(self, factor) -> "Money":
        return self.__mul__(factor)   # Support: 3 * money


# Usage - works naturally with Python:
price = Money(10.00)
tax = Money(0.80)
total = price + tax
print(total)           # USD 10.80
print(repr(total))     # Money(amount=10.8, currency='USD')

doubled = price * 2
tripled = 3 * price    # Uses __rmul__

prices = [Money(5), Money(2), Money(8)]
print(min(prices))     # USD 2.00 - works because __lt__ defined
print(sorted(prices))  # sorted works too!
```

#### Practice

Add magic methods to a `Vector2D` class: `__add__`, `__sub__`, `__mul__` (scalar), `__eq__`, `__abs__` (magnitude), `__str__`.

---

### Part 3: Container Magic Methods (30 minutes)

#### Explanation

Make your objects behave like containers (lists, dicts):

```python
class Playlist:
    def __init__(self, name: str):
        self.name = name
        self._songs = []

    # Container protocol:
    def __len__(self) -> int:
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]

    def __setitem__(self, index, value):
        self._songs[index] = value

    def __delitem__(self, index):
        del self._songs[index]

    def __contains__(self, song: str) -> bool:
        return song in self._songs

    def __iter__(self):
        return iter(self._songs)

    def __repr__(self) -> str:
        return f"Playlist({self.name!r}, {len(self)} songs)"

    def add(self, song: str):
        self._songs.append(song)


p = Playlist("My Mix")
p.add("Song A")
p.add("Song B")
p.add("Song C")

print(len(p))          # 3
print(p[0])            # Song A
print("Song B" in p)   # True

for song in p:         # __iter__ enables for loops
    print(f"  Playing: {song}")

p[1] = "Song B (Remix)"  # __setitem__
del p[2]                  # __delitem__
print(p)                  # Playlist('My Mix', 2 songs)
```

**Context manager protocol:**
```python
class DatabaseConnection:
    def __init__(self, host: str):
        self.host = host
        self.connection = None

    def __enter__(self):
        """Called at 'with' statement start."""
        print(f"Connecting to {self.host}...")
        self.connection = {"host": self.host, "status": "open"}
        return self   # Returned to 'as' clause

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Called when 'with' block exits (even on error)."""
        print(f"Closing connection to {self.host}")
        self.connection = None
        return False   # Don't suppress exceptions

    def execute(self, query: str):
        if not self.connection:
            raise RuntimeError("Not connected")
        return f"Result of: {query}"


# Usage:
with DatabaseConnection("localhost") as db:
    result = db.execute("SELECT * FROM users")
    print(result)
# Connecting to localhost...
# Result of: SELECT * FROM users
# Closing connection to localhost
# (connection automatically closed)
```

#### Practice

Implement `__enter__` and `__exit__` on a `Timer` class that measures how long a `with` block takes.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Fraction Class

```python
class Fraction:
    def __init__(self, numerator: int, denominator: int):
        if denominator == 0:
            raise ValueError("Denominator cannot be zero")
        # Simplify using GCD:
        from math import gcd
        common = gcd(abs(numerator), abs(denominator))
        self.numerator = numerator // common
        self.denominator = denominator // common

    def __str__(self) -> str: ...
    def __repr__(self) -> str: ...
    def __add__(self, other: "Fraction") -> "Fraction": ...
    def __sub__(self, other): ...
    def __mul__(self, other): ...
    def __truediv__(self, other): ...
    def __eq__(self, other) -> bool: ...
    def __lt__(self, other) -> bool: ...
    def __float__(self) -> float:
        return self.numerator / self.denominator
```

Test: `Fraction(1, 2) + Fraction(1, 3) == Fraction(5, 6)` should be `True`.

#### Exercise 2: Shopping Cart with Full Protocol

Implement `ShoppingCart` with:
- `__len__` (number of items)
- `__contains__` (check if product name in cart)
- `__iter__` (iterate over items)
- `__str__` (formatted receipt)
- `__add__` (merge two carts)
- `total` property

#### Bonus Challenge

Research `__slots__` + magic methods interaction. Implement a memory-efficient `Point` class using `__slots__` with full arithmetic and comparison support. Use `sys.getsizeof()` to compare memory usage with and without `__slots__`.

---

## Key Takeaways

- **Polymorphism**: same interface, different implementations; enables generic code
- **Duck typing**: Python checks capabilities, not types
- `__str__`: human-readable; `__repr__`: developer-readable (eval-safe ideally)
- `__eq__`, `__lt__`, etc.: enable comparisons and sorting
- `__len__`, `__getitem__`, `__iter__`: make objects behave like containers
- `__enter__`/`__exit__`: enable `with` statement (context managers)

---

## Common Questions

**Q: What's the difference between `__str__` and `__repr__`?**
A: `__str__` is for end users (pretty output). `__repr__` is for developers (should ideally be valid Python to recreate the object). When in doubt: `repr()` is what the REPL shows.

**Q: Do I need to implement all comparison methods?**
A: No. You can use `@functools.total_ordering` — implement `__eq__` and one of `__lt__`, `__le__`, `__gt__`, `__ge__`, and the decorator fills in the rest.

---

## Homework

1. Add `__hash__` to your `Money` class (required when implementing `__eq__`)
2. Research: Why does implementing `__eq__` automatically make objects unhashable in Python?

---

[← Previous](./lesson-08-method-overriding-super.md) | [Back to Course](./README.md) | [Next →](./lesson-10-course-review-mini-project.md)
