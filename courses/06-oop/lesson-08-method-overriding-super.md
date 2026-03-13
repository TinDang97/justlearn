# Lesson 8: Method Overriding & super()

**Course:** Object-Oriented Programming | **Duration:** 2 hours | **Level:** Intermediate

---

## Learning Objectives

- Override methods to customize subclass behavior
- Use `super()` effectively in various scenarios
- Understand Python's Method Resolution Order (MRO)
- Apply the Template Method pattern

---

## Prerequisites

- Lessons 1-7 of this course

---

## Lesson Outline

### Part 1: Method Overriding (30 minutes)

#### Explanation

**Overriding** means redefining a parent's method in the subclass with new behavior:

```python
class Animal:
    def speak(self):
        return "..."

    def describe(self):
        return f"I am a {self.__class__.__name__}"


class Dog(Animal):
    def speak(self):              # Overrides Animal.speak
        return "Woof!"


class Cat(Animal):
    def speak(self):              # Overrides Animal.speak
        return "Meow!"


class Duck(Animal):
    def speak(self):
        return "Quack!"


# Each class responds differently to the SAME method name:
animals = [Dog(), Cat(), Duck(), Animal()]
for animal in animals:
    print(f"{animal.__class__.__name__}: {animal.speak()}")
# Dog: Woof!
# Cat: Meow!
# Duck: Quack!
# Animal: ...
```

**Checking which method will be called:**
```python
# You can always check:
print(Dog.speak)           # <function Dog.speak ...>
print(Dog.__mro__)         # (<class 'Dog'>, <class 'Animal'>, <class 'object'>)

# MRO is checked left to right when calling a method
fido = Dog()
fido.speak()   # Python checks: Dog.speak? YES → call it
fido.describe() # Python checks: Dog.describe? NO → Animal.describe? YES → call it
```

#### Practice

Create a `Notification` base class with `send(message)` method. Override it in `EmailNotification`, `SMSNotification`, and `PushNotification`.

---

### Part 2: Using super() (30 minutes)

#### Explanation

`super()` gives you the next class in the MRO chain. Use it to extend (not replace) parent behavior:

```python
class Vehicle:
    def __init__(self, make: str, model: str, year: int):
        self.make = make
        self.model = model
        self.year = year
        self.speed = 0

    def start(self):
        print(f"{self.make} {self.model} engine starting...")

    def accelerate(self, amount: int):
        self.speed += amount
        print(f"Speed: {self.speed} km/h")

    def describe(self) -> str:
        return f"{self.year} {self.make} {self.model}"


class ElectricVehicle(Vehicle):
    def __init__(self, make: str, model: str, year: int, battery_kwh: float):
        super().__init__(make, model, year)   # Call Vehicle.__init__
        self.battery_kwh = battery_kwh
        self.charge_level = 100.0   # Percentage

    def start(self):
        super().start()   # Print parent message
        print(f"Battery at {self.charge_level:.0f}%")   # Add EV info

    def accelerate(self, amount: int):
        super().accelerate(amount)   # Do the speed increase
        self.charge_level -= amount * 0.1   # EV uses battery
        print(f"Battery now at {self.charge_level:.1f}%")

    def describe(self) -> str:
        base = super().describe()   # Get parent description
        return f"{base} (Electric, {self.battery_kwh}kWh)"


class LuxuryElectric(ElectricVehicle):
    def __init__(self, make, model, year, battery_kwh, autopilot=False):
        super().__init__(make, model, year, battery_kwh)
        self.autopilot = autopilot

    def describe(self) -> str:
        base = super().describe()   # Gets ElectricVehicle's description
        return f"{base} {'[Autopilot]' if self.autopilot else ''}"


# Usage:
tesla = LuxuryElectric("Tesla", "Model S", 2024, 100, autopilot=True)
tesla.start()
# Tesla Model S engine starting...
# Battery at 100%

tesla.accelerate(30)
# Speed: 30 km/h
# Battery now at 97.0%

print(tesla.describe())
# 2024 Tesla Model S (Electric, 100kWh) [Autopilot]
```

#### Practice

Build a `Logger` base class with `log(message)`. Create `FileLogger` (adds file writing), `TimestampLogger` (adds timestamp), and `TimestampFileLogger(TimestampLogger, FileLogger)`.

---

### Part 3: MRO and Diamond Problem (30 minutes)

#### Explanation

Python uses **C3 Linearization** (MRO) to resolve multiple inheritance conflicts:

```python
class A:
    def hello(self):
        return "A"

class B(A):
    def hello(self):
        return "B → " + super().hello()

class C(A):
    def hello(self):
        return "C → " + super().hello()

class D(B, C):   # Multiple inheritance
    def hello(self):
        return "D → " + super().hello()

d = D()
print(d.hello())        # D → B → C → A
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
```

**The diamond problem solved by MRO:**
```
    A
   / \
  B   C
   \ /
    D
```
Python ensures A's methods are called only once, and in a predictable order.

**Template Method pattern** (excellent use of overriding):
```python
class DataProcessor:
    """Template method pattern - defines algorithm skeleton."""

    def process(self, data):
        """Template method - defines the steps."""
        validated = self.validate(data)
        transformed = self.transform(validated)
        result = self.save(transformed)
        self.notify(result)
        return result

    def validate(self, data):
        """Step 1: Override to add validation."""
        return data

    def transform(self, data):
        """Step 2: Override to transform data."""
        return data

    def save(self, data):
        """Step 3: Override to save data."""
        return data

    def notify(self, result):
        """Step 4: Override for notification."""
        print(f"Processing complete: {result}")


class CSVProcessor(DataProcessor):
    def validate(self, data):
        if not isinstance(data, str):
            raise TypeError("CSV must be a string")
        return data.strip()

    def transform(self, data):
        rows = [line.split(",") for line in data.split("\n")]
        return rows

    def save(self, data):
        print(f"Saved {len(data)} rows to CSV")
        return {"rows": len(data), "data": data}


# CSVProcessor defines only the DIFFERENT parts:
processor = CSVProcessor()
processor.process("a,b,c\n1,2,3\n4,5,6")
```

#### Practice

Implement the Template Method pattern for a `ReportGenerator`: HTML report and PDF report both extend the same base, overriding only `format_header()`, `format_body()`, and `format_footer()`.

---

### Part 4: Hands-on Practice (30 minutes)

#### Exercise 1: Payment System

```python
class PaymentMethod:
    def __init__(self, amount: float):
        self.amount = amount

    def validate(self) -> bool:
        """Override to add payment-specific validation."""
        return self.amount > 0

    def process(self) -> dict:
        """Process the payment."""
        if not self.validate():
            raise ValueError("Invalid payment")
        return self._execute_payment()

    def _execute_payment(self) -> dict:
        """Override to implement payment logic."""
        raise NotImplementedError


class CreditCard(PaymentMethod):
    def __init__(self, amount, card_number: str, cvv: str):
        super().__init__(amount)
        self.card_number = card_number[-4:]  # Store only last 4
        self.cvv = cvv

    def validate(self) -> bool:
        base_valid = super().validate()
        return base_valid and len(self.cvv) == 3

    def _execute_payment(self) -> dict:
        return {"method": "credit_card", "last4": self.card_number, "amount": self.amount}


class PayPal(PaymentMethod):
    def __init__(self, amount, email: str):
        super().__init__(amount)
        self.email = email

    def validate(self) -> bool:
        base_valid = super().validate()
        return base_valid and "@" in self.email

    def _execute_payment(self) -> dict:
        return {"method": "paypal", "email": self.email, "amount": self.amount}
```

Complete `Crypto` and `BankTransfer` payment methods.

#### Exercise 2: Game Characters

Override `attack()` and `defend()` in:
- `Warrior(Character)`: high attack, high defense
- `Mage(Character)`: spell attack, low defense
- `Rogue(Character)`: backstab (critical chance), dodge

Each should call `super()` for base calculations and add class-specific bonuses.

#### Bonus Challenge

Research `functools.singledispatch`. How does it enable method-like dispatch without inheritance? When would you prefer it over overriding?

---

## Key Takeaways

- **Override** a method by redefining it in the subclass
- `super().method()` calls the **next method in MRO** (usually parent)
- Always use `super().__init__(...)` when overriding `__init__`
- MRO (`__mro__`) shows the exact resolution order
- **Template Method pattern**: parent defines steps, children implement details

---

## Common Questions

**Q: Should I always call `super()` when overriding?**
A: It depends. For `__init__`, almost always yes. For other methods, call `super()` if you want to extend behavior, skip it if you're completely replacing it.

**Q: What does `super()` return exactly?**
A: It returns a proxy object that delegates method calls to the next class in the MRO. It's not the parent class itself.

---

## Homework

1. Implement a `Logging` mixin that can be added to any class to log all method calls
2. Research: `__init_subclass__` — how can it be used to auto-register subclasses?

---

[← Previous](./lesson-07-inheritance.md) | [Back to Course](./README.md) | [Next →](./lesson-09-polymorphism-magic-methods.md)
