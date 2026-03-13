# Lesson 3: The __init__ Method & self

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Define `__init__` to initialize object state
- Understand `self` - what it is and why it's needed
- Set instance attributes in `__init__`
- Use default parameter values in `__init__`

---

## Prerequisites

- Lessons 1-2 of this course

---

## Lesson Outline

### Part 1: The __init__ Method (30 minutes)

#### Explanation

`__init__` is called automatically when you create a new instance. It's the **constructor** - it sets up the object's initial state.

```python
class Student:
    def __init__(self, name, age, gpa):
        # self refers to the new object being created
        self.name = name      # Create instance attribute 'name'
        self.age = age        # Create instance attribute 'age'
        self.gpa = gpa        # Create instance attribute 'gpa'
        self.courses = []     # Default empty list for all students

# Creating instances - arguments go to __init__:
alice = Student("Alice", 20, 3.9)
bob = Student("Bob", 22, 3.5)

# Access the initialized attributes:
print(alice.name)    # Alice
print(bob.age)       # 22
print(alice.gpa)     # 3.9
print(alice.courses) # [] (empty list)
```

**What `__init__` is NOT:**
- It's NOT the place where memory is allocated (`__new__` does that)
- It's NOT called "constructor" in Python (but functions like one)
- It does NOT create the object - the object already exists when `__init__` is called

#### Examples

```python
class BankAccount:
    interest_rate = 0.05  # Class attribute

    def __init__(self, owner, initial_balance=0.0):
        """Initialize a bank account."""
        self.owner = owner
        self.balance = initial_balance
        self.transaction_count = 0
        self.is_frozen = False

# Creating accounts:
alice_account = BankAccount("Alice", 1000.00)
bob_account = BankAccount("Bob")  # 0 initial balance (default)

print(alice_account.owner)           # Alice
print(alice_account.balance)         # 1000.0
print(bob_account.balance)           # 0.0
print(alice_account.transaction_count)  # 0
```

#### Practice

Create a `Book` class with `__init__` that takes: title, author, year, and sets pages to 0 and is_available to True by default.

---

### Part 2: Understanding self (30 minutes)

#### Explanation

`self` is the first parameter of every instance method. It's a reference to the instance (object) that the method is called on.

```python
class Dog:
    def __init__(self, name, breed):
        self.name = name    # self.name = THIS dog's name
        self.breed = breed

    def bark(self):
        print(f"{self.name} says: Woof!")   # self.name = THIS dog's name

fido = Dog("Fido", "Labrador")
rex = Dog("Rex", "German Shepherd")

fido.bark()   # Python calls Dog.bark(fido)  → "Fido says: Woof!"
rex.bark()    # Python calls Dog.bark(rex)   → "Rex says: Woof!"
```

**`self` is just a convention - it could be any name:**
```python
class Dog:
    def __init__(this_dog, name):   # 'this_dog' works but DON'T DO THIS
        this_dog.name = name
# Convention: always use 'self'
```

**How Python handles self:**
```python
# When you write:
fido.bark()

# Python translates it to:
Dog.bark(fido)   # The instance is passed as first argument!
```

#### Examples

```python
class Counter:
    def __init__(self, start=0, step=1):
        self.value = start
        self.step = step
        self.count_history = []

    def increment(self):
        self.value += self.step           # Access self's attributes
        self.count_history.append(self.value)

    def reset(self):
        self.value = 0
        self.count_history.clear()

    def get_info(self):
        return f"Counter: value={self.value}, step={self.step}"

c1 = Counter(0, 2)   # Even counter
c2 = Counter(100, -5)   # Countdown

c1.increment()  # value = 2
c1.increment()  # value = 4
c2.increment()  # value = 95
print(c1.get_info())   # Counter: value=4, step=2
```

#### Practice

Create a `Temperature` class that stores value and unit in `__init__`, with a method to display the temperature.

---

### Part 3: __init__ with Validation (30 minutes)

#### Explanation

`__init__` can validate inputs and raise errors for invalid data:

```python
class BankAccount:
    def __init__(self, owner: str, initial_balance: float = 0.0):
        if not owner or not owner.strip():
            raise ValueError("Owner name cannot be empty")
        if initial_balance < 0:
            raise ValueError("Initial balance cannot be negative")

        self.owner = owner.strip().title()
        self.balance = float(initial_balance)
        self.transactions = []

# Usage:
try:
    valid = BankAccount("Alice", 500)   # Works
    invalid = BankAccount("", -100)     # Raises ValueError
except ValueError as e:
    print(f"Error: {e}")
```

**`__init__` with computed attributes:**
```python
class Circle:
    PI = 3.14159265358979

    def __init__(self, radius: float):
        if radius <= 0:
            raise ValueError(f"Radius must be positive, got {radius}")
        self.radius = radius
        # Computed attributes:
        self.diameter = radius * 2
        self.area = Circle.PI * radius ** 2
        self.circumference = 2 * Circle.PI * radius

c = Circle(5)
print(f"Radius: {c.radius}")
print(f"Area: {c.area:.2f}")
```

#### Practice

Add validation to your `Book` class: year must be between 1450 and current year, title can't be empty.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Product Class

```python
class Product:
    """Represents a product in an inventory."""
    tax_rate = 0.08   # 8% tax (class attribute)

    def __init__(self, sku, name, price, quantity=0, category="general"):
        # Initialize with validation:
        # - sku: must be non-empty string
        # - name: must be non-empty string
        # - price: must be positive number
        # - quantity: must be non-negative integer
        ...
```

Create 5 products, display them, demonstrate validation.

#### Exercise 2: Student Roster

Build a `Student` class with `__init__`:
- Required: name, student_id, major
- Optional: email (default None), year (default 1, range 1-4)
- Computed: enrollment_date (today's date)
- Tracked: grades (empty dict initially)

Create 5 students, display their info.

#### Bonus Challenge

**`__init__` pattern - classmethod constructors:**
```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, fahrenheit):
        celsius = (fahrenheit - 32) * 5/9
        return cls(celsius)   # Create new instance!

    @classmethod
    def from_kelvin(cls, kelvin):
        return cls(kelvin - 273.15)

# Now you can create Temperature from any unit:
t1 = Temperature(100)
t2 = Temperature.from_fahrenheit(212)
t3 = Temperature.from_kelvin(373.15)
```

Implement this for a `Distance` class supporting meters, miles, and kilometers.

---

## Key Takeaways

- `__init__(self, ...)` is automatically called when creating an instance
- `self` = the instance itself; always first parameter of instance methods
- Set instance attributes with `self.attribute = value` inside `__init__`
- Use default parameters in `__init__` for optional initialization data
- Validate inputs in `__init__` and raise ValueError for invalid data
- `self.computed = formula` sets computed attributes at creation time

---

## Common Mistakes to Avoid

- **Forgetting `self`**: `def init(name):` instead of `def __init__(self, name):`
- **Not using `self` for attributes**: `name = name` (local variable) vs `self.name = name`
- **Calling `__init__` directly**: `obj.__init__(...)` - just create a new object instead

---

## Homework

1. Build a complete `Employee` class with `__init__`, validation, and computed attributes (years_of_service, annual_vs_monthly)
2. Research: What is `__new__`? What does it do vs `__init__`?

---

[← Previous](./lesson-02-classes-and-objects.md) | [Back to Course](./README.md) | [Next →](./lesson-04-instance-methods.md)
